use crate::state::DocumentPage;
use std::io::Read;

/// Parse a PDF file into pages of text.
///
/// Tries pdf-extract first (handles ToUnicode CMaps and font encoding dictionaries
/// correctly). Falls back to lopdf if pdf-extract fails or returns garbled output.
pub fn parse_pdf(path: &str) -> Result<Vec<DocumentPage>, String> {
    // --- Attempt 1: pdf-extract ---
    // pdf-extract uses pdf-rs which resolves font encoding tables properly.
    // Pages are separated by form-feed characters (\x0c) in the output.
    if let Ok(raw) = pdf_extract::extract_text(path) {
        let pages = pdf_extract_pages(&raw);
        if !pages.is_empty() {
            return Ok(pages);
        }
    }

    // --- Fallback: lopdf ---
    // lopdf cannot decode Identity-H fonts without an embedded ToUnicode CMap,
    // and may also mis-apply StandardEncoding for custom font tables.
    // We still clean up its output and filter obvious garbage.
    let doc = lopdf::Document::load(path).map_err(|e| format!("PDF load error: {e}"))?;
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
    Ok(pages)
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
    // Strip lopdf's literal placeholder for Identity-H fonts before anything else.
    let text = text.replace("?Identity-H Unimplemented?", " ");

    // Preserve newlines (important for structured docs like job offers where
    // "Salary: $85,000\nStart Date: ..." must stay on separate lines).
    // Collapse runs of non-newline whitespace to a single space.
    // Strip non-printable / private-use-area characters (PDF font encoding garbage).
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
        // Non-printable / private-use-area chars are silently dropped here.
    }
    result.trim().to_string()
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
        // Simulate what lopdf returns for Identity-H fonts
        let raw = "Salary: \u{E001}\u{E002}\u{E003} $85,000 ?Identity-H Unimplemented? per year";
        let cleaned = clean_pdf_text(raw);
        assert!(!cleaned.contains("?Identity-H Unimplemented?"), "Identity-H placeholder not stripped");
        assert!(cleaned.contains("$85,000"), "real text should be preserved");
        for ch in cleaned.chars() {
            let code = ch as u32;
            assert!(!(0xE000..=0xF8FF).contains(&code), "PUA char U+{:04X} not stripped", code);
        }
        eprintln!("Cleaned: {cleaned}");
    }
}
