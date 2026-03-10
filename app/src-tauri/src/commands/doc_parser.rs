use crate::state::DocumentPage;
use std::io::Read;

/// Parse a PDF file into pages of text.
///
/// Pipeline:
/// 1. pdf-extract for font-decoded text (handles ToUnicode CMaps correctly).
/// 2. If the PDF has Form XObjects (filled forms), use lopdf to get XObject
///    coordinates and re-interleave filled values next to their template labels.
/// 3. Fall back to plain lopdf extract_text as a last resort.
pub fn parse_pdf(path: &str) -> Result<Vec<DocumentPage>, String> {
    // --- Attempt 1: pdf-extract (with optional coordinate re-interleave) ---
    if let Ok(raw) = pdf_extract::extract_text(path) {
        let mut pages = pdf_extract_pages(&raw);
        if !pages.is_empty() {
            // If pdf-extract collapsed multiple pages into one (no form-feeds),
            // try lopdf per-page extraction to get proper page boundaries.
            if let Ok(doc) = lopdf::Document::load(path) {
                let lopdf_page_count = doc.get_pages().len();
                if pages.len() == 1 && lopdf_page_count > 1 {
                    let lopdf_pages = extract_lopdf_pages(&doc);
                    // Only use lopdf pages if they actually have text content
                    let has_content = lopdf_pages.iter().any(|p| !p.text.trim().is_empty());
                    if lopdf_pages.len() > 1 && has_content {
                        pages = lopdf_pages;
                    }
                }

                // Try to improve form-field extraction by re-interleaving with coordinates
                let improved = reinterleave_form_fields(&doc, &pages);
                if !improved.is_empty() {
                    return Ok(improved);
                }
            }
            return Ok(pages);
        }
    }

    // --- Attempt 2: plain lopdf ---
    let doc = lopdf::Document::load(path).map_err(|e| format!("PDF load error: {e}"))?;
    Ok(extract_lopdf_pages(&doc))
}

/// Extract text per-page using lopdf.
fn extract_lopdf_pages(doc: &lopdf::Document) -> Vec<DocumentPage> {
    let page_map = doc.get_pages();
    let mut page_nums: Vec<u32> = page_map.keys().cloned().collect();
    page_nums.sort();

    let mut pages = Vec::new();
    for page_num in page_nums {
        let raw = doc.extract_text(&[page_num]).unwrap_or_default();
        let cleaned = clean_pdf_text(&raw);
        pages.push(DocumentPage {
            page_number: page_num,
            text: cleaned,
        });
    }
    pages
}

/// Re-interleave filled form values next to their template labels.
///
/// PDFs with filled forms have two layers: template labels and filled values,
/// rendered as separate XObjects. pdf-extract outputs them in stream order
/// (all labels first, then all values). This function:
///
/// 1. Uses lopdf to read XObject coordinates from the content stream
/// 2. Identifies which XObjects are "small" (filled field values) vs "large" (template)
/// 3. Extracts text from small XObjects (simple encoding, works with lopdf)
/// 4. Matches each filled value to the nearest template label by y-coordinate
/// 5. Inserts filled values next to their labels in the template text
fn reinterleave_form_fields(
    doc: &lopdf::Document,
    original_pages: &[DocumentPage],
) -> Vec<DocumentPage> {
    let page_map = doc.get_pages();
    let mut page_nums: Vec<u32> = page_map.keys().cloned().collect();
    page_nums.sort();

    let mut result_pages = Vec::new();

    for (page_idx, &page_num) in page_nums.iter().enumerate() {
        // Default: keep the original page text if reinterleaving fails or is unnecessary
        let fallback = page_idx < original_pages.len();

        let page_id = match page_map.get(&page_num) {
            Some(id) => *id,
            None => {
                if fallback { result_pages.push(original_pages[page_idx].clone()); }
                continue;
            }
        };

        let content_bytes = match doc.get_page_content(page_id) {
            Ok(b) => b,
            Err(_) => {
                if fallback { result_pages.push(original_pages[page_idx].clone()); }
                continue;
            }
        };

        let xobjects = collect_xobjects(doc, page_id);
        if xobjects.is_empty() {
            if fallback { result_pages.push(original_pages[page_idx].clone()); }
            continue;
        }

        // Get all XObject invocations with their CTM positions
        let ops = scan_content_ops(&content_bytes);
        let mut xobj_entries: Vec<(String, [f32; 6])> = Vec::new(); // (name, ctm)
        let mut ctm_stack: Vec<[f32; 6]> = Vec::new();
        let mut ctm: [f32; 6] = [1.0, 0.0, 0.0, 1.0, 0.0, 0.0];

        for op in &ops {
            match op {
                ScannedOp::SaveState => ctm_stack.push(ctm),
                ScannedOp::RestoreState => {
                    if let Some(saved) = ctm_stack.pop() { ctm = saved; }
                }
                ScannedOp::ConcatMatrix(m) => { ctm = multiply_matrices(ctm, *m); }
                ScannedOp::DoXObject(name) => {
                    xobj_entries.push((name.clone(), ctm));
                }
            }
        }

        if xobj_entries.len() < 2 {
            if fallback { result_pages.push(original_pages[page_idx].clone()); }
            continue;
        }

        // Classify XObjects by content stream size: the template is large, fields are small
        let mut sized_entries: Vec<(String, [f32; 6], usize, lopdf::ObjectId)> = Vec::new();
        for (name, entry_ctm) in &xobj_entries {
            if let Some(&obj_id) = xobjects.get(name.as_str()) {
                let size = xobject_content_size(doc, obj_id);
                sized_entries.push((name.clone(), *entry_ctm, size, obj_id));
            }
        }

        if sized_entries.is_empty() {
            if fallback { result_pages.push(original_pages[page_idx].clone()); }
            continue;
        }

        // Template = largest XObject; filled fields = the rest
        let max_size = sized_entries.iter().map(|e| e.2).max().unwrap_or(0);
        if max_size < 100 {
            if fallback { result_pages.push(original_pages[page_idx].clone()); }
            continue;
        }

        let filled_fields: Vec<_> = sized_entries.iter()
            .filter(|e| e.2 < max_size)
            .collect();

        if filled_fields.is_empty() {
            if fallback { result_pages.push(original_pages[page_idx].clone()); }
            continue;
        }

        // Extract text (via lopdf) and position for each filled field.
        // We use lopdf text primarily for matching — the actual text for replacement
        // comes from pdf-extract (which handles font encoding + spacing correctly).
        let mut field_entries: Vec<(String, f32, f32)> = Vec::new(); // (lopdf_text, x, y)
        for (_name, entry_ctm, _size, obj_id) in &filled_fields {
            let text = extract_xobject_text(doc, *obj_id);
            let trimmed = text.trim().to_string();
            if !trimmed.is_empty() {
                field_entries.push((trimmed, entry_ctm[4], entry_ctm[5]));
            }
        }

        if field_entries.is_empty() {
            if fallback { result_pages.push(original_pages[page_idx].clone()); }
            continue;
        }

        // Sort by visual position (-y, x) = top-to-bottom, left-to-right.
        // Use a wide y-band (30 PDF points) because filled-value XObjects may be placed
        // at slightly different y than their template labels on the same visual row.
        field_entries.sort_by(|a, b| {
            let ya = (-a.2 / 30.0).round() as i32;
            let yb = (-b.2 / 30.0).round() as i32;
            ya.cmp(&yb).then(a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal))
        });

        // Get the original page text from pdf-extract
        let original_text = if page_idx < original_pages.len() {
            &original_pages[page_idx].text
        } else {
            // More lopdf pages than pdf-extract pages — can't interleave
            continue;
        };

        // The filled values appear at the END of the pdf-extract output.
        // Find where the values block starts using the first coordinate-sorted
        // entry's lopdf text as an anchor. Then split the original text into
        // template + values, and replace blanks in the template.
        let first_lopdf = &field_entries[0].0;
        let insert_point = original_text.find(first_lopdf.as_str());
        let template_text = match insert_point {
            Some(pos) => &original_text[..pos],
            None => {
                if fallback { result_pages.push(original_pages[page_idx].clone()); }
                continue;
            }
        };

        // Use lopdf-extracted text for each value, with space recovery.
        // Most form field values are short (names, dates, amounts) and decode
        // correctly. For longer values where lopdf strips spaces, we insert
        // spaces before capital letters that follow lowercase letters.
        let field_values: Vec<String> = field_entries.iter()
            .map(|(t, _, _)| recover_spaces(t))
            .collect();

        // Replace each blank field (run of 4+ underscores) with the next value
        let mut interleaved = String::new();
        let mut value_idx = 0;
        let mut i = 0;
        let template_bytes = template_text.as_bytes();
        while i < template_bytes.len() {
            if template_bytes[i] == b'_' {
                let start = i;
                while i < template_bytes.len() && template_bytes[i] == b'_' { i += 1; }
                let run_len = i - start;
                if run_len >= 4 && value_idx < field_values.len() {
                    interleaved.push_str(&field_values[value_idx]);
                    value_idx += 1;
                } else {
                    for _ in 0..run_len { interleaved.push('_'); }
                }
            } else {
                interleaved.push(template_bytes[i] as char);
                i += 1;
            }
        }

        for val in &field_values[value_idx..] {
            interleaved.push('\n');
            interleaved.push_str(val);
        }

        let cleaned = clean_pdf_text(&interleaved);
        if !cleaned.trim().is_empty() {
            result_pages.push(DocumentPage {
                page_number: page_num,
                text: cleaned,
            });
        }
    }

    result_pages
}

/// Get the decompressed content size of an XObject stream.
fn xobject_content_size(doc: &lopdf::Document, obj_id: lopdf::ObjectId) -> usize {
    match doc.get_object(obj_id) {
        Ok(lopdf::Object::Stream(ref s)) => {
            s.decompressed_content().map(|b| b.len()).unwrap_or(s.content.len())
        }
        _ => 0,
    }
}

// ── Coordinate-aware PDF extraction ──────────────────────────────────────────

// ── Minimal content stream scanner ───────────────────────────────────────────
// We only need to recognize: q, Q, cm (6 numbers), Do (/Name).
// This avoids depending on lopdf's private parser module.

#[derive(Debug)]
enum ScannedOp {
    SaveState,                   // q
    RestoreState,                // Q
    ConcatMatrix([f32; 6]),      // a b c d e f cm
    DoXObject(String),           // /Name Do
}

/// Scan raw content stream bytes for q/Q/cm/Do operators.
/// Tracks a small operand stack of recent numbers and names to pair with operators.
fn scan_content_ops(bytes: &[u8]) -> Vec<ScannedOp> {
    let mut ops = Vec::new();
    let mut number_stack: Vec<f32> = Vec::new();
    let mut last_name: Option<String> = None;

    let text = String::from_utf8_lossy(bytes);
    let mut chars = text.char_indices().peekable();

    while let Some(&(i, ch)) = chars.peek() {
        // Skip whitespace
        if ch.is_ascii_whitespace() {
            chars.next();
            continue;
        }

        // PDF comment: skip to end of line
        if ch == '%' {
            while let Some(&(_, c)) = chars.peek() {
                chars.next();
                if c == '\n' || c == '\r' { break; }
            }
            continue;
        }

        // PDF name: /SomeName
        if ch == '/' {
            chars.next(); // consume '/'
            let start = i + 1;
            let mut end = start;
            while let Some(&(j, c)) = chars.peek() {
                if c.is_ascii_whitespace() || c == '/' || c == '[' || c == ']'
                    || c == '(' || c == ')' || c == '<' || c == '>' || c == '{' || c == '}'
                {
                    break;
                }
                end = j + c.len_utf8();
                chars.next();
            }
            last_name = Some(text[start..end].to_string());
            number_stack.clear(); // name resets number context
            continue;
        }

        // Number (integer or real)
        if ch == '-' || ch == '+' || ch == '.' || ch.is_ascii_digit() {
            let start = i;
            chars.next();
            let mut end = start + ch.len_utf8();
            while let Some(&(j, c)) = chars.peek() {
                if c.is_ascii_digit() || c == '.' {
                    end = j + c.len_utf8();
                    chars.next();
                } else {
                    break;
                }
            }
            if let Ok(n) = text[start..end].parse::<f32>() {
                number_stack.push(n);
            }
            continue;
        }

        // String literal (...) — skip (we don't need text from page-level stream)
        if ch == '(' {
            chars.next();
            let mut depth = 1;
            let mut prev_backslash = false;
            while let Some(&(_, c)) = chars.peek() {
                chars.next();
                if prev_backslash {
                    prev_backslash = false;
                    continue;
                }
                if c == '\\' { prev_backslash = true; continue; }
                if c == '(' { depth += 1; }
                if c == ')' { depth -= 1; if depth == 0 { break; } }
            }
            continue;
        }

        // Hex string <...> or dict <<...>> — skip
        if ch == '<' {
            chars.next();
            if let Some(&(_, '<')) = chars.peek() {
                // dict — skip until >>
                chars.next();
                let mut depth = 1;
                while let Some(&(_, c)) = chars.peek() {
                    chars.next();
                    if c == '<' {
                        if let Some(&(_, '<')) = chars.peek() { chars.next(); depth += 1; }
                    } else if c == '>' {
                        if let Some(&(_, '>')) = chars.peek() { chars.next(); depth -= 1; if depth == 0 { break; } }
                    }
                }
            } else {
                // hex string — skip until >
                while let Some(&(_, c)) = chars.peek() {
                    chars.next();
                    if c == '>' { break; }
                }
            }
            continue;
        }

        // Array [...] — skip
        if ch == '[' {
            chars.next();
            let mut depth = 1;
            while let Some(&(_, c)) = chars.peek() {
                chars.next();
                if c == '[' { depth += 1; }
                if c == ']' { depth -= 1; if depth == 0 { break; } }
            }
            continue;
        }

        // Alphabetic — this is an operator
        if ch.is_ascii_alphabetic() || ch == '\'' || ch == '"' {
            let start = i;
            chars.next();
            let mut end = start + ch.len_utf8();
            while let Some(&(j, c)) = chars.peek() {
                if c.is_ascii_alphabetic() || c == '*' {
                    end = j + c.len_utf8();
                    chars.next();
                } else {
                    break;
                }
            }
            let operator = &text[start..end];
            match operator {
                "q" => {
                    ops.push(ScannedOp::SaveState);
                    number_stack.clear();
                }
                "Q" => {
                    ops.push(ScannedOp::RestoreState);
                    number_stack.clear();
                }
                "cm" => {
                    if number_stack.len() >= 6 {
                        let start_idx = number_stack.len() - 6;
                        let m = [
                            number_stack[start_idx],
                            number_stack[start_idx + 1],
                            number_stack[start_idx + 2],
                            number_stack[start_idx + 3],
                            number_stack[start_idx + 4],
                            number_stack[start_idx + 5],
                        ];
                        ops.push(ScannedOp::ConcatMatrix(m));
                    }
                    number_stack.clear();
                }
                "Do" => {
                    if let Some(name) = last_name.take() {
                        ops.push(ScannedOp::DoXObject(name));
                    }
                    number_stack.clear();
                }
                _ => {
                    // Any other operator resets the stacks
                    number_stack.clear();
                    last_name = None;
                }
            }
            continue;
        }

        // Anything else — skip
        chars.next();
    }

    ops
}

/// Collect XObject name→ObjectId mapping from a page's Resources dictionary.
fn collect_xobjects(
    doc: &lopdf::Document,
    page_id: lopdf::ObjectId,
) -> std::collections::HashMap<String, lopdf::ObjectId> {
    let mut map = std::collections::HashMap::new();

    let (res_dict, res_ids) = doc.get_page_resources(page_id);

    fn extract_from_dict(
        doc: &lopdf::Document,
        dict: &lopdf::Dictionary,
        map: &mut std::collections::HashMap<String, lopdf::ObjectId>,
    ) {
        let xobj = match dict.get(b"XObject") {
            Ok(obj) => obj,
            Err(_) => return,
        };
        let xobj_dict = match xobj {
            lopdf::Object::Dictionary(ref d) => d,
            lopdf::Object::Reference(id) => match doc.get_dictionary(*id) {
                Ok(d) => d,
                Err(_) => return,
            },
            _ => return,
        };
        for (name, val) in xobj_dict.iter() {
            if let Ok(id) = val.as_reference() {
                let name_str = String::from_utf8_lossy(name).to_string();
                map.insert(name_str, id);
            }
        }
    }

    if let Some(dict) = res_dict {
        extract_from_dict(doc, dict, &mut map);
    }
    for res_id in res_ids {
        if let Ok(dict) = doc.get_dictionary(res_id) {
            extract_from_dict(doc, dict, &mut map);
        }
    }
    map
}

/// Extract plain text from a Form XObject stream using lopdf's text extraction.
/// Uses `Document::decode_text` for font encoding, scanning the XObject's own
/// content stream for text-showing operators (Tj, TJ, ', ").
fn extract_xobject_text(doc: &lopdf::Document, obj_id: lopdf::ObjectId) -> String {
    let stream = match doc.get_object(obj_id) {
        Ok(lopdf::Object::Stream(ref s)) => s,
        _ => return String::new(),
    };

    // Verify it's a Form XObject
    let is_form = stream
        .dict
        .get(b"Subtype")
        .ok()
        .and_then(|o| o.as_name().ok())
        .map(|n| n == b"Form")
        .unwrap_or(false);
    if !is_form {
        return String::new();
    }

    let content_bytes = match stream.decompressed_content() {
        Ok(b) => b,
        Err(_) => stream.content.clone(),
    };

    // Collect font encodings from this XObject's own Resources
    let xobj_fonts = collect_xobject_fonts(doc, &stream.dict);

    // Scan the XObject content stream for text operators
    extract_text_from_content_bytes(&content_bytes, &xobj_fonts)
}

/// Scan raw content stream bytes for text-showing operators and extract text.
fn extract_text_from_content_bytes(
    bytes: &[u8],
    fonts: &std::collections::HashMap<String, String>,
) -> String {
    let mut text = String::new();
    let mut current_font_encoding: Option<&str> = None;
    let mut number_stack: Vec<f32> = Vec::new();

    let raw = String::from_utf8_lossy(bytes);
    let mut chars = raw.char_indices().peekable();
    let mut last_name: Option<String> = None;
    let mut pending_strings: Vec<(Vec<u8>, bool)> = Vec::new(); // (bytes, is_hex)

    while let Some(&(cur_i, ch)) = chars.peek() {
        if ch.is_ascii_whitespace() { chars.next(); continue; }

        // Comment
        if ch == '%' {
            while let Some(&(_, c)) = chars.peek() { chars.next(); if c == '\n' || c == '\r' { break; } }
            continue;
        }

        // Name
        if ch == '/' {
            chars.next();
            let mut name = String::new();
            while let Some(&(_, c)) = chars.peek() {
                if c.is_ascii_whitespace() || b"/[]()<>{}".contains(&(c as u8)) { break; }
                name.push(c);
                chars.next();
            }
            last_name = Some(name);
            continue;
        }

        // Number — track for Td displacement
        if ch == '-' || ch == '+' || ch == '.' || ch.is_ascii_digit() {
            let start_i = cur_i;
            chars.next();
            let mut end_i = start_i + ch.len_utf8();
            while let Some(&(j, c)) = chars.peek() {
                if c.is_ascii_digit() || c == '.' { end_i = j + c.len_utf8(); chars.next(); } else { break; }
            }
            if let Ok(n) = raw[start_i..end_i].parse::<f32>() {
                number_stack.push(n);
            }
            continue;
        }

        // String literal (...)
        if ch == '(' {
            chars.next();
            let mut depth = 1;
            let mut string_bytes = Vec::new();
            let mut prev_backslash = false;
            while let Some(&(_, c)) = chars.peek() {
                chars.next();
                if prev_backslash {
                    prev_backslash = false;
                    match c {
                        'n' => string_bytes.push(b'\n'),
                        'r' => string_bytes.push(b'\r'),
                        't' => string_bytes.push(b'\t'),
                        '\\' => string_bytes.push(b'\\'),
                        '(' => string_bytes.push(b'('),
                        ')' => string_bytes.push(b')'),
                        _ => string_bytes.push(c as u8),
                    }
                    continue;
                }
                if c == '\\' { prev_backslash = true; continue; }
                if c == '(' { depth += 1; string_bytes.push(b'('); continue; }
                if c == ')' { depth -= 1; if depth == 0 { break; } string_bytes.push(b')'); continue; }
                string_bytes.push(c as u8);
            }
            pending_strings.push((string_bytes, false));
            continue;
        }

        // Hex string <...>
        if ch == '<' {
            chars.next();
            if let Some(&(_, '<')) = chars.peek() {
                // Dict — skip
                chars.next();
                let mut depth = 1;
                while let Some(&(_, c)) = chars.peek() {
                    chars.next();
                    if c == '<' { if let Some(&(_, '<')) = chars.peek() { chars.next(); depth += 1; } }
                    else if c == '>' { if let Some(&(_, '>')) = chars.peek() { chars.next(); depth -= 1; if depth == 0 { break; } } }
                }
            } else {
                let mut hex = String::new();
                while let Some(&(_, c)) = chars.peek() {
                    chars.next();
                    if c == '>' { break; }
                    if c.is_ascii_hexdigit() { hex.push(c); }
                }
                let hex_bytes: Vec<u8> = (0..hex.len())
                    .step_by(2)
                    .filter_map(|i| u8::from_str_radix(&hex[i..(i + 2).min(hex.len())], 16).ok())
                    .collect();
                pending_strings.push((hex_bytes, true));
            }
            continue;
        }

        // Array [...]
        if ch == '[' {
            chars.next();
            // For TJ arrays, we need to collect string items
            // Simple approach: collect all strings inside the array
            let mut depth = 1;
            let mut arr_strings: Vec<(Vec<u8>, bool)> = Vec::new();
            while let Some(&(_, c)) = chars.peek() {
                if c == ']' { chars.next(); depth -= 1; if depth == 0 { break; } continue; }
                if c == '[' { chars.next(); depth += 1; continue; }
                if c == '(' {
                    chars.next();
                    let mut sdepth = 1;
                    let mut sbytes = Vec::new();
                    let mut esc = false;
                    while let Some(&(_, sc)) = chars.peek() {
                        chars.next();
                        if esc { esc = false; match sc { 'n' => sbytes.push(b'\n'), 'r' => sbytes.push(b'\r'), 't' => sbytes.push(b'\t'), _ => sbytes.push(sc as u8) }; continue; }
                        if sc == '\\' { esc = true; continue; }
                        if sc == '(' { sdepth += 1; sbytes.push(b'('); continue; }
                        if sc == ')' { sdepth -= 1; if sdepth == 0 { break; } sbytes.push(b')'); continue; }
                        sbytes.push(sc as u8);
                    }
                    arr_strings.push((sbytes, false));
                    continue;
                }
                if c == '<' {
                    chars.next();
                    if let Some(&(_, '<')) = chars.peek() {
                        // Skip dict inside array (rare)
                        chars.next();
                        let mut ddepth = 1;
                        while let Some(&(_, dc)) = chars.peek() {
                            chars.next();
                            if dc == '<' { if let Some(&(_, '<')) = chars.peek() { chars.next(); ddepth += 1; } }
                            else if dc == '>' { if let Some(&(_, '>')) = chars.peek() { chars.next(); ddepth -= 1; if ddepth == 0 { break; } } }
                        }
                    } else {
                        let mut hex = String::new();
                        while let Some(&(_, hc)) = chars.peek() {
                            chars.next();
                            if hc == '>' { break; }
                            if hc.is_ascii_hexdigit() { hex.push(hc); }
                        }
                        let hbytes: Vec<u8> = (0..hex.len()).step_by(2)
                            .filter_map(|i| u8::from_str_radix(&hex[i..(i+2).min(hex.len())], 16).ok())
                            .collect();
                        arr_strings.push((hbytes, true));
                    }
                    continue;
                }
                chars.next();
            }
            if !arr_strings.is_empty() {
                pending_strings = arr_strings;
            }
            continue;
        }

        // Operator (alphabetic)
        if ch.is_ascii_alphabetic() || ch == '\'' || ch == '"' {
            let mut operator = String::new();
            while let Some(&(_, c)) = chars.peek() {
                if c.is_ascii_alphabetic() || c == '*' || c == '\'' || c == '"' {
                    operator.push(c);
                    chars.next();
                } else {
                    break;
                }
            }
            match operator.as_str() {
                "Tf" => {
                    if let Some(ref name) = last_name {
                        current_font_encoding = fonts.get(name).map(|s| s.as_str());
                    }
                    last_name = None;
                    pending_strings.clear();
                    number_stack.clear();
                }
                "Tj" | "'" => {
                    if let Some((ref bytes, _)) = pending_strings.last() {
                        text.push_str(&lopdf::Document::decode_text(current_font_encoding, bytes));
                    }
                    pending_strings.clear();
                    last_name = None;
                    number_stack.clear();
                }
                "TJ" => {
                    for (ref bytes, _) in &pending_strings {
                        text.push_str(&lopdf::Document::decode_text(current_font_encoding, bytes));
                    }
                    pending_strings.clear();
                    last_name = None;
                    number_stack.clear();
                }
                "Td" | "TD" => {
                    // Td tx ty: move text position by (tx, ty).
                    // If ty is near zero, it's a horizontal move (space between words).
                    // If ty is significantly nonzero, it's a new line.
                    let ty = if number_stack.len() >= 2 {
                        number_stack[number_stack.len() - 1]
                    } else {
                        -1.0 // assume newline if we can't parse
                    };
                    if !text.is_empty() {
                        if ty.abs() < 2.0 {
                            // Small y-displacement: horizontal move = word space
                            if !text.ends_with(' ') && !text.ends_with('\n') {
                                text.push(' ');
                            }
                        } else if !text.ends_with('\n') {
                            text.push('\n');
                        }
                    }
                    number_stack.clear();
                    pending_strings.clear();
                    last_name = None;
                }
                _ => {
                    pending_strings.clear();
                    last_name = None;
                    number_stack.clear();
                }
            }
            continue;
        }

        chars.next();
    }

    text
}

/// Collect font encoding info from an XObject's own Resources dictionary.
fn collect_xobject_fonts(
    doc: &lopdf::Document,
    stream_dict: &lopdf::Dictionary,
) -> std::collections::HashMap<String, String> {
    let mut fonts = std::collections::HashMap::new();

    let resources = match stream_dict.get(b"Resources") {
        Ok(obj) => match obj {
            lopdf::Object::Dictionary(ref d) => d,
            lopdf::Object::Reference(id) => match doc.get_dictionary(*id) {
                Ok(d) => d,
                Err(_) => return fonts,
            },
            _ => return fonts,
        },
        Err(_) => return fonts,
    };

    let font_dict = match resources.get(b"Font") {
        Ok(obj) => match obj {
            lopdf::Object::Dictionary(ref d) => d,
            lopdf::Object::Reference(id) => match doc.get_dictionary(*id) {
                Ok(d) => d,
                Err(_) => return fonts,
            },
            _ => return fonts,
        },
        Err(_) => return fonts,
    };

    for (name, val) in font_dict.iter() {
        let name_str = String::from_utf8_lossy(name).to_string();
        let font = match val {
            lopdf::Object::Reference(id) => doc.get_dictionary(*id).ok(),
            lopdf::Object::Dictionary(ref d) => Some(d),
            _ => None,
        };
        if let Some(font) = font {
            if let Ok(encoding) = font.get(b"Encoding") {
                if let Ok(enc_name) = encoding.as_name() {
                    let enc_str = String::from_utf8_lossy(enc_name).to_string();
                    fonts.insert(name_str, enc_str);
                }
            }
        }
    }
    fonts
}

/// Recover missing word spaces in lopdf-extracted text.
///
/// When lopdf extracts text from Form XObjects, it often strips inter-word
/// spaces because the PDF uses text positioning operators (Td) rather than
/// literal space characters. This heuristic inserts spaces:
/// - Before an uppercase letter preceded by a lowercase letter (`EagleRow` → `Eagle Row`)
/// - Before a digit preceded by a letter or vice versa (`time2pm` → `time 2pm`)
/// - Before `$` preceded by a non-space
/// - After `,` when not followed by a space or digit
fn recover_spaces(text: &str) -> String {
    let chars: Vec<char> = text.chars().collect();
    if chars.len() <= 1 { return text.to_string(); }
    let mut result = String::with_capacity(text.len() + text.len() / 4);
    result.push(chars[0]);
    for i in 1..chars.len() {
        let prev = chars[i - 1];
        let cur = chars[i];
        let need_space =
            // camelCase: lowercase followed by uppercase
            (prev.is_lowercase() && cur.is_uppercase())
            // digit-to-letter boundary: `18Eagle` → `18 Eagle`
            || (prev.is_ascii_digit() && cur.is_alphabetic())
            // Before $ when preceded by non-whitespace non-$
            || (cur == '$' && !prev.is_whitespace() && prev != '$')
            // After comma when followed by a letter (not digit for decimals)
            || (prev == ',' && cur.is_alphabetic());

        if need_space && !prev.is_whitespace() {
            result.push(' ');
        }
        result.push(cur);
    }
    result
}

/// Multiply two 2D affine transformation matrices (each stored as [a,b,c,d,e,f]).
/// Result = current * new (post-multiplication, as PDF spec requires).
fn multiply_matrices(cur: [f32; 6], new: [f32; 6]) -> [f32; 6] {
    [
        new[0] * cur[0] + new[1] * cur[2],
        new[0] * cur[1] + new[1] * cur[3],
        new[2] * cur[0] + new[3] * cur[2],
        new[2] * cur[1] + new[3] * cur[3],
        new[4] * cur[0] + new[5] * cur[2] + cur[4],
        new[4] * cur[1] + new[5] * cur[3] + cur[5],
    ]
}

/// Split a pdf-extract full-document string (pages separated by \x0c) into
/// DocumentPage entries. Returns an empty Vec if the text looks garbled (too
/// few printable characters — typically means pdf-extract also failed to decode
/// the font encoding and returned garbage).
fn pdf_extract_pages(raw: &str) -> Vec<DocumentPage> {
    let total_chars = raw.chars().count();
    if total_chars == 0 {
        return Vec::new();
    }

    // Quality gate: at least 60 % of characters must be printable
    // (printable = not a control char and not in Unicode Private Use Area).
    let printable = raw.chars().filter(|&c| {
        let code = c as u32;
        c == '\n' || c == '\t' || c == '\x0c'
            || (!c.is_control()
                && !(0xE000..=0xF8FF).contains(&code)
                && code < 0xFFF0)
    }).count();
    let ratio = printable as f32 / total_chars as f32;
    if ratio < 0.60 {
        return Vec::new();
    }

    // Split on form-feed to get per-page text.
    let mut pages = Vec::new();
    for (i, page_text) in raw.split('\x0c').enumerate() {
        let cleaned = clean_pdf_text(page_text);
        if !cleaned.trim().is_empty() {
            pages.push(DocumentPage {
                page_number: (i + 1) as u32,
                text: cleaned,
            });
        }
    }
    pages
}

/// Returns true if a character is safe to keep in extracted PDF text.
///
/// lopdf commonly returns Unicode Private Use Area codepoints (U+E000–U+F8FF)
/// and raw control bytes for PDFs whose fonts lack a ToUnicode map. To users
/// and the LLM these look like "encrypted" garbage. Strip them here at the
/// source so they never reach the vector store or the model prompt.
fn is_printable_pdf_char(ch: char) -> bool {
    // Structural whitespace we explicitly preserve
    if ch == '\n' || ch == '\t' {
        return true;
    }
    // All other control characters (including \r, \x00 – \x1F, \x7F – \x9F)
    if ch.is_control() {
        return false;
    }
    let code = ch as u32;
    // Unicode Private Use Area — the primary source of PDF font-encoding garbage
    if (0xE000..=0xF8FF).contains(&code) {
        return false;
    }
    // Specials block, surrogates, noncharacters
    if code >= 0xFFF0 {
        return false;
    }
    true
}

fn clean_pdf_text(text: &str) -> String {
    // ── Pass 1: string-level substitutions ───────────────────────────────────
    // These run before the character loop so every subsequent step sees clean
    // Unicode and plain ASCII where possible.

    // Lopdf identity-H placeholder
    let text = text.replace("?Identity-H Unimplemented?", " ");

    // OpenType / PDF ligatures — very common in professionally typeset legal
    // documents. Without this, "first" may arrive as "ﬁrst" (U+FB01), which
    // looks correct visually but doesn't match the plain-ASCII "fi" that the
    // embedding model was trained on.
    let text = text
        .replace('\u{FB00}', "ff")   // ﬀ
        .replace('\u{FB01}', "fi")   // ﬁ
        .replace('\u{FB02}', "fl")   // ﬂ
        .replace('\u{FB03}', "ffi")  // ﬃ
        .replace('\u{FB04}', "ffl")  // ﬄ
        .replace('\u{FB05}', "st")   // ﬅ
        .replace('\u{FB06}', "st");  // ﬆ

    // Typographic quotes → straight ASCII (keeps tokenisation consistent)
    let text = text
        .replace('\u{2018}', "'")    // ' left single
        .replace('\u{2019}', "'")    // ' right single / apostrophe
        .replace('\u{201C}', "\"")   // " left double
        .replace('\u{201D}', "\"")   // " right double
        .replace('\u{201A}', ",")    // ‚ single low-9 (misused as comma in some fonts)
        .replace('\u{201E}', "\"");  // „ double low-9

    // Dashes and special spaces
    let text = text
        .replace('\u{2013}', "-")    // – en dash → hyphen
        .replace('\u{00A0}', " ")    // non-breaking space → regular space
        .replace('\u{00AD}', "");    // soft hyphen (invisible) → remove

    // ── Pass 2: character-level whitespace normalization + PUA stripping ─────
    // Preserve newlines, collapse runs of other whitespace to a single space,
    // and silently drop non-printable / Private-Use-Area characters.
    let mut result = String::with_capacity(text.len());
    let mut prev_was_space = false;
    let mut prev_was_newline = false;
    for ch in text.chars() {
        if ch == '\n' || ch == '\r' {
            if !prev_was_newline {
                result.push('\n');
                prev_was_newline = true;
                prev_was_space = true;
            }
        } else if ch.is_whitespace() {
            if !prev_was_space {
                result.push(' ');
                prev_was_space = true;
            }
            prev_was_newline = false;
        } else if is_printable_pdf_char(ch) {
            result.push(ch);
            prev_was_space = false;
            prev_was_newline = false;
        }
        // Non-printable / private-use-area chars are silently dropped.
    }

    // ── Pass 3: post-normalization fixups ────────────────────────────────────

    // Remove hyphenated line breaks: "agree-\nment" → "agreement".
    // Legal PDFs routinely hyphenate long words at the right margin. Keeping
    // the hyphen+newline would split the word across two chunks, poisoning
    // embeddings for both.  We join only when the character immediately after
    // the newline is a letter (avoids touching list items like "- \nItem").
    let result = remove_hyphen_breaks(&result);

    // Collapse runs of 3+ consecutive newlines down to 2.  Some PDFs emit a
    // newline for every line of whitespace between sections; more than two
    // consecutive newlines adds no structural information for the chunker and
    // just inflates token counts.
    let result = collapse_blank_lines(&result);

    result.trim().to_string()
}

/// Join hyphenated line breaks: `word-\nword` → `wordword` (the hyphen was
/// a typographic line-break marker, not a real hyphen).
fn remove_hyphen_breaks(text: &str) -> String {
    let chars: Vec<char> = text.chars().collect();
    let len = chars.len();
    let mut result = String::with_capacity(text.len());
    let mut i = 0;
    while i < len {
        // Pattern: '-' followed by '\n' followed by a letter → join without hyphen.
        if i + 2 < len
            && chars[i] == '-'
            && chars[i + 1] == '\n'
            && chars[i + 2].is_alphabetic()
        {
            // Drop the hyphen and newline; the next character follows normally.
            i += 2;
            continue;
        }
        result.push(chars[i]);
        i += 1;
    }
    result
}

/// Collapse 3 or more consecutive newlines to exactly 2.
fn collapse_blank_lines(text: &str) -> String {
    let mut result = String::with_capacity(text.len());
    let mut newline_run = 0usize;
    for ch in text.chars() {
        if ch == '\n' {
            newline_run += 1;
            if newline_run <= 2 {
                result.push('\n');
            }
            // 3rd+ newline in a run: silently drop
        } else {
            newline_run = 0;
            result.push(ch);
        }
    }
    result
}

/// Parse a DOCX file into pages of text
/// Splits on explicit page breaks <w:br w:type="page"/>
pub fn parse_docx(path: &str) -> Result<Vec<DocumentPage>, String> {
    let file = std::fs::File::open(path).map_err(|e| format!("DOCX open error: {e}"))?;
    let mut archive = zip::ZipArchive::new(file).map_err(|e| format!("ZIP error: {e}"))?;

    let mut xml_content = String::new();
    {
        let mut doc_xml = archive
            .by_name("word/document.xml")
            .map_err(|e| format!("document.xml not found: {e}"))?;
        doc_xml
            .read_to_string(&mut xml_content)
            .map_err(|e| format!("Read error: {e}"))?;
    }

    let doc = roxmltree::Document::parse(&xml_content)
        .map_err(|e| format!("XML parse error: {e}"))?;

    let ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
    let mut pages: Vec<String> = vec![String::new()];
    let mut in_paragraph = false;

    for node in doc.descendants() {
        if !node.is_element() {
            continue;
        }
        if node.tag_name().namespace() != Some(ns) {
            continue;
        }
        match node.tag_name().name() {
            "p" => {
                // Paragraph start — we handle text at the run level
                // Add newline at paragraph end if current page has content
                if !in_paragraph {
                    in_paragraph = true;
                }
                // Add newline after each paragraph when traversal ends
                // We detect paragraph end by checking if parent's next sibling is a new p
                // Simpler: just add newline when we see a new p element at body level
                if let Some(last) = pages.last_mut() {
                    if !last.is_empty() && !last.ends_with('\n') {
                        last.push('\n');
                    }
                }
            }
            "t" => {
                // Text run
                if let Some(text) = node.text() {
                    if let Some(last) = pages.last_mut() {
                        last.push_str(text);
                    }
                }
            }
            "br" => {
                // Check for page break
                let is_page_break = node
                    .attributes()
                    .any(|a| a.name() == "type" && a.value() == "page");
                if is_page_break {
                    pages.push(String::new());
                } else {
                    // Line break
                    if let Some(last) = pages.last_mut() {
                        last.push('\n');
                    }
                }
            }
            _ => {}
        }
    }

    let result: Vec<DocumentPage> = pages
        .into_iter()
        .enumerate()
        .filter(|(_, text)| !text.trim().is_empty())
        .map(|(i, text)| DocumentPage {
            page_number: i as u32 + 1,
            text: text.trim().to_string(),
        })
        .collect();

    if result.is_empty() {
        return Err("No text content found in DOCX".to_string());
    }

    Ok(result)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_real_pdf() {
        // Uses BIWS-Restructuring-1.pdf from the Desktop — a real financial/legal PDF.
        let path = "/Users/liamneild/Desktop/BIWS-Restructuring-1.pdf";
        if !std::path::Path::new(path).exists() {
            eprintln!("Test PDF not found at {path}, skipping.");
            return;
        }
        let pages = parse_pdf(path).expect("parse_pdf should not error");
        assert!(!pages.is_empty(), "should produce at least one page");

        let total_chars: usize = pages.iter().map(|p| p.text.len()).sum();
        eprintln!("Pages: {}, total chars: {}", pages.len(), total_chars);

        for page in pages.iter().take(3) {
            eprintln!("\n--- PAGE {} ({} chars) ---", page.page_number, page.text.len());
            eprintln!("{}", &page.text[..page.text.len().min(500)]);

            // No private-use-area characters should survive
            for ch in page.text.chars() {
                let code = ch as u32;
                assert!(
                    !(0xE000..=0xF8FF).contains(&code),
                    "PUA character U+{:04X} found on page {} — sanitization failed",
                    code,
                    page.page_number
                );
            }
            // No control characters except newline/tab
            for ch in page.text.chars() {
                if ch == '\n' || ch == '\t' { continue; }
                assert!(
                    !ch.is_control(),
                    "Control char U+{:04X} found on page {} — sanitization failed",
                    ch as u32,
                    page.page_number
                );
            }
            // "?Identity-H Unimplemented?" must be gone
            assert!(
                !page.text.contains("?Identity-H Unimplemented?"),
                "lopdf Identity-H placeholder found on page {} — not stripped",
                page.page_number
            );
        }
        eprintln!("\nAll assertions passed.");
    }

    #[test]
    fn test_clean_pdf_text_strips_pua() {
        let raw = "Salary: \u{E001}\u{E002}\u{E003} $85,000 ?Identity-H Unimplemented? per year";
        let cleaned = clean_pdf_text(raw);
        assert!(!cleaned.contains("?Identity-H Unimplemented?"));
        assert!(cleaned.contains("$85,000"));
        for ch in cleaned.chars() {
            let code = ch as u32;
            assert!(!(0xE000..=0xF8FF).contains(&code), "PUA char U+{:04X} not stripped", code);
        }
    }

    #[test]
    fn test_ligature_normalization() {
        let raw = "The \u{FB01}rst party shall \u{FB02}y to the meeting. \u{FB03}nal settlement.";
        let cleaned = clean_pdf_text(raw);
        assert!(cleaned.contains("first"), "ﬁ ligature not expanded");
        assert!(cleaned.contains("fly"), "ﬂ ligature not expanded");
        assert!(cleaned.contains("ffinal"), "ﬃ ligature not expanded");
        assert!(!cleaned.contains('\u{FB01}'));
        assert!(!cleaned.contains('\u{FB02}'));
        assert!(!cleaned.contains('\u{FB03}'));
    }

    #[test]
    fn test_smart_quote_normalization() {
        let raw = "\u{201C}Party A\u{201D} agrees and \u{2018}Party B\u{2019} consents.";
        let cleaned = clean_pdf_text(raw);
        assert!(cleaned.contains("\"Party A\""));
        assert!(cleaned.contains("'Party B'"));
    }

    #[test]
    fn test_hyphen_line_break_removal() {
        let raw = "The agree-\nment shall terminate upon written notice.";
        let cleaned = clean_pdf_text(raw);
        assert!(cleaned.contains("agreement"), "hyphen line break not joined: got {cleaned:?}");
        assert!(!cleaned.contains("-\n"));
    }

    #[test]
    fn test_hyphen_break_not_removed_for_list_items() {
        // A real hyphen at end of line NOT followed by a letter should stay
        let raw = "Items:\n- First item\n- Second item";
        let cleaned = clean_pdf_text(raw);
        assert!(cleaned.contains("- First"), "list hyphen incorrectly removed");
    }

    #[test]
    fn test_collapse_blank_lines() {
        let raw = "Section 1\n\n\n\n\nSection 2";
        let cleaned = clean_pdf_text(raw);
        // Should have at most 2 consecutive newlines
        assert!(!cleaned.contains("\n\n\n"), "3+ consecutive newlines not collapsed: got {cleaned:?}");
        assert!(cleaned.contains("Section 1"));
        assert!(cleaned.contains("Section 2"));
    }

    #[test]
    fn test_nonbreaking_space_normalized() {
        let raw = "Party\u{00A0}A agrees.";
        let cleaned = clean_pdf_text(raw);
        assert!(cleaned.contains("Party A"), "non-breaking space not normalized");
    }

    #[test]
    fn test_soft_hyphen_removed() {
        let raw = "agree\u{00AD}ment";
        let cleaned = clean_pdf_text(raw);
        assert_eq!(cleaned, "agreement", "soft hyphen not removed: got {cleaned:?}");
    }

    #[test]
    fn test_en_dash_normalized() {
        let raw = "pages 1\u{2013}5 of the agreement";
        let cleaned = clean_pdf_text(raw);
        assert!(cleaned.contains("pages 1-5"), "en dash not normalized: got {cleaned:?}");
    }
}
