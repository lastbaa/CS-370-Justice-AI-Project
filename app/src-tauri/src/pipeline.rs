//! Core RAG pipeline logic — no Tauri dependencies.
//!
//! This module contains all pure pipeline functions extracted from `commands/rag.rs`:
//! embedding, chunking, LLM inference, and retrieval helpers. Tauri command handlers
//! remain in `commands/rag.rs` and call into this module.

use crate::state::{AppSettings, ChunkMetadata, DocumentPage, RagState};
use llama_cpp_2::llama_backend::LlamaBackend;
use std::path::Path;
use std::sync::{Arc, Mutex, OnceLock};
use uuid::Uuid;

// ── Constants ─────────────────────────────────────────────────────────────────

pub const SCORE_THRESHOLD: f32 = 0.20;
pub const GGUF_MIN_SIZE: u64 = 4_000_000_000;

pub const SAUL_GGUF_URL: &str = "https://huggingface.co/MaziyarPanahi/Saul-Instruct-v1-GGUF/resolve/main/Saul-Instruct-v1.Q4_K_M.gguf";

/// Rules-only system prompt — document context goes in the user turn so Llama 2
/// pays full attention to it (system-prompt content is under-weighted by the model).
pub const RULES_PROMPT: &str = "\
You are Justice AI, a legal research assistant specializing in US federal and state law.\n\n\
Rules (follow exactly):\n\
- Cite every factual claim inline as [filename, p. N] immediately after the claim — never group citations at the end.\n\
- State all numbers, dates, dollar amounts, and figures EXACTLY as written in the source — never round or paraphrase.\n\
- Form fields: PDFs may store template labels (e.g. \"Event Date: ______\") and filled values in separate SOURCE chunks. \
Match each value to its nearest field label across all SOURCE chunks before answering. \
Never report a bare value without identifying which label it belongs to.\n\
- Multiple dates: when several dates appear, use the field label (e.g. \"Event Date\", \"Signature Date\", \"Date of Birth\") \
to determine which date answers the question. Prefer the labeled match over proximity in the text.\n\
- State each fact once only. Do not restart or repeat a list you have already written.\n\
- If the answer is not present in the excerpts, say exactly: \"I could not find information about this in your loaded documents.\"\n\
- When no excerpts are provided, answer from your knowledge of US law; note when answers may vary by state or when a licensed attorney should be consulted.\n\
- Never fabricate case citations, statutes, or facts. Do not give specific legal advice.";

// ── Singletons ─────────────────────────────────────────────────────────────────

// fastembed TextEmbedding: ~22 MB ONNX, downloaded to model_dir/fastembed/ on first use.
static EMBED_MODEL: OnceLock<Arc<Mutex<Option<fastembed::TextEmbedding>>>> = OnceLock::new();

// llama.cpp backend stored as Option so init failures don't poison the OnceLock.
static LLAMA_BACKEND: OnceLock<Option<LlamaBackend>> = OnceLock::new();

pub fn get_llama_backend() -> Result<&'static LlamaBackend, String> {
    let slot = LLAMA_BACKEND.get_or_init(|| {
        match std::panic::catch_unwind(std::panic::AssertUnwindSafe(LlamaBackend::init)) {
            Ok(Ok(b)) => Some(b),
            Ok(Err(e)) => {
                log::error!("LlamaBackend::init failed: {e}");
                None
            }
            Err(_) => {
                log::error!("LlamaBackend::init panicked");
                None
            }
        }
    });
    slot.as_ref()
        .ok_or_else(|| "llama.cpp backend failed to initialize. The app may need to be restarted.".to_string())
}

/// Validate GGUF magic bytes before loading — prevents llama.cpp from calling
/// abort() on a corrupted or incomplete file, which would kill the process.
pub fn validate_gguf(path: &std::path::Path) -> Result<(), String> {
    use std::io::Read;
    let mut f = std::fs::File::open(path)
        .map_err(|e| format!("Cannot open model file: {e}"))?;
    let mut magic = [0u8; 4];
    f.read_exact(&mut magic)
        .map_err(|_| "Model file is too small — it may be incomplete. Try re-downloading.".to_string())?;
    if &magic != b"GGUF" {
        return Err("Model file appears corrupted (missing GGUF header). Please delete it and restart to re-download.".to_string());
    }
    Ok(())
}

// ── Embedding ─────────────────────────────────────────────────────────────────

pub async fn embed_text(text: &str, is_query: bool, model_dir: &Path) -> Result<Vec<f32>, String> {
    use fastembed::{EmbeddingModel, InitOptions, TextEmbedding};

    let cache_dir = model_dir.join("fastembed-bge");
    // BGE uses asymmetric retrieval: queries get a prefix that shifts the embedding into the
    // retrieval space. Document chunks are embedded without the prefix.
    let text_owned = if is_query {
        format!("Represent this sentence for searching relevant passages: {}", text)
    } else {
        text.to_string()
    };

    tokio::task::spawn_blocking(move || {
        // Get or create the Arc<Mutex<Option<Model>>> wrapper (infallible).
        let model_arc = EMBED_MODEL.get_or_init(|| Arc::new(Mutex::new(None)));

        let mut guard = model_arc
            .lock()
            .map_err(|e| format!("Embed model mutex poisoned: {e}"))?;

        // Initialize the model exactly once; errors here are propagated, not silently dropped.
        if guard.is_none() {
            std::fs::create_dir_all(&cache_dir)
                .map_err(|e| format!("Cannot create fastembed cache dir: {e}"))?;
            let model = TextEmbedding::try_new(
                InitOptions::new(EmbeddingModel::BGESmallENV15)
                    .with_cache_dir(cache_dir)
                    .with_show_download_progress(false),
            )
            .map_err(|e| format!("Failed to initialize embedding model: {e}"))?;
            *guard = Some(model);
        }

        let model = guard.as_ref()
            .ok_or_else(|| "Embedding model unavailable after initialization".to_string())?;
        let embeddings = model
            .embed(vec![text_owned], None)
            .map_err(|e| e.to_string())?;

        embeddings
            .into_iter()
            .next()
            .ok_or_else(|| "No embedding returned".to_string())
    })
    .await
    .map_err(|e| e.to_string())?
}

// ── LLM via llama-cpp-2 ───────────────────────────────────────────────────────

/// Format prior conversation turns as labeled text for the model.
pub fn format_history(history: &[(String, String)]) -> String {
    let mut s = String::from("[Prior conversation — for follow-up context only:]\n");
    // Cap to the last 4 turns so long conversations don't exhaust the context window.
    let recent = if history.len() > 4 { &history[history.len() - 4..] } else { history };
    for (user, assistant) in recent {
        // Trim each side to avoid bloating the prompt with long prior answers
        let u = if user.len() > 400 { &user[..400] } else { user };
        let a = if assistant.len() > 600 { &assistant[..600] } else { assistant };
        s.push_str(&format!("User: {u}\nAssistant: {a}\n\n"));
    }
    s
}

pub async fn ask_saul(
    user_question: &str,
    context: &str,
    history: &[(String, String)],
    model_dir: &Path,
    model_cache: Arc<Mutex<Option<llama_cpp_2::model::LlamaModel>>>,
    on_token: impl Fn(String) + Send + 'static,
) -> Result<String, String> {
    use llama_cpp_2::{
        context::params::LlamaContextParams,
        llama_batch::LlamaBatch,
        model::{params::LlamaModelParams, AddBos, LlamaModel},
        sampling::LlamaSampler,
    };
    use std::num::NonZeroU32;

    let gguf_path = model_dir.join("saul.gguf");

    // Build history prefix (empty string when there are no prior turns).
    let history_prefix = if history.is_empty() {
        String::new()
    } else {
        format_history(history)
    };

    // Put context in the user turn — Llama 2 models pay far more attention to
    // user-turn content than to the system prompt, so this is the reliable way
    // to ground answers in the retrieved document chunks.
    let user_content = if context.trim().is_empty() {
        if history_prefix.is_empty() {
            format!("Question: {user_question}")
        } else {
            format!("{history_prefix}Current question: {user_question}")
        }
    } else if history_prefix.is_empty() {
        format!(
            "Below are excerpts from the user's loaded legal documents. \
Answer the question using ONLY these excerpts.\n\n\
{context}\n\n---\n\nQuestion: {user_question}"
        )
    } else {
        format!(
            "{history_prefix}\
Below are excerpts from the user's loaded legal documents. \
Answer the current question using ONLY these excerpts.\n\n\
{context}\n\n---\n\nCurrent question: {user_question}"
        )
    };

    // "Answer:" is placed AFTER [/INST] (in the assistant turn), not before it.
    let prompt = format!("[INST] <<SYS>>\n{RULES_PROMPT}\n<</SYS>>\n\n{user_content} [/INST] Answer:");

    tokio::task::spawn_blocking(move || {
        // Get (or lazily initialize) the global llama.cpp backend.
        let backend = get_llama_backend()?;

        // Validate GGUF magic bytes before loading.
        validate_gguf(&gguf_path)?;

        // Lock model cache; load from disk on first call only
        let mut model_guard = model_cache
            .lock()
            .map_err(|e| format!("Model mutex poisoned: {e}"))?;

        if model_guard.is_none() {
            log::info!("Loading Saul model from disk (first query)…");
            // Offload all layers to Metal GPU on Apple Silicon
            let model_params = LlamaModelParams::default().with_n_gpu_layers(100);
            let model = LlamaModel::load_from_file(backend, &gguf_path, &model_params)
                .map_err(|e| format!("Failed to load Saul model: {e}"))?;
            *model_guard = Some(model);
            log::info!("Saul model loaded and cached.");
        }

        let model = model_guard.as_ref()
            .ok_or_else(|| "Saul model unavailable after initialization".to_string())?;

        let n_ctx_size: u32 = 4096;
        let ctx_params = LlamaContextParams::default()
            .with_n_ctx(NonZeroU32::new(n_ctx_size));
        let mut ctx = model
            .new_context(backend, ctx_params)
            .map_err(|e| format!("Failed to create context: {e}"))?;

        // Tokenize prompt
        let mut tokens = model
            .str_to_token(&prompt, AddBos::Always)
            .map_err(|e| format!("Tokenize error: {e}"))?;

        let n_tokens = tokens.len();
        if n_tokens == 0 {
            return Err("Empty token sequence".to_string());
        }

        let max_prompt_tokens = n_ctx_size as usize - 512;
        if n_tokens > max_prompt_tokens {
            log::warn!(
                "Prompt ({} tokens) exceeds safe limit ({}). Preserving head+tail.",
                n_tokens,
                max_prompt_tokens
            );
            let head = 180usize.min(max_prompt_tokens / 2);
            let tail = max_prompt_tokens - head;
            let tail_start = n_tokens - tail;
            let mut kept: Vec<_> = tokens[..head].to_vec();
            kept.extend_from_slice(&tokens[tail_start..]);
            tokens = kept;
        }
        let n_tokens = tokens.len();

        const DECODE_BATCH_SIZE: usize = 512;
        let mut batch = LlamaBatch::new(DECODE_BATCH_SIZE, 1);
        let mut chunk_start = 0;
        while chunk_start < n_tokens {
            let chunk_end = (chunk_start + DECODE_BATCH_SIZE).min(n_tokens);
            batch.clear();
            for pos in chunk_start..chunk_end {
                let is_last = pos == n_tokens - 1;
                batch
                    .add(tokens[pos], pos as i32, &[0], is_last)
                    .map_err(|e| format!("Batch add error: {e}"))?;
            }
            ctx.decode(&mut batch)
                .map_err(|e| format!("Prompt decode error: {e}"))?;
            chunk_start = chunk_end;
        }

        let mut sampler = LlamaSampler::chain_simple([
            LlamaSampler::penalties(64, 1.1, 0.0, 0.0),
            LlamaSampler::top_k(40),
            LlamaSampler::top_p(0.9, 1),
            LlamaSampler::temp(0.3),
            LlamaSampler::dist(42),
        ]);
        let mut response = String::new();
        let mut pos = n_tokens;
        let max_new_tokens = 1024usize;

        for _ in 0..max_new_tokens {
            if pos >= n_ctx_size as usize {
                log::warn!("Generation stopped: reached context window limit ({n_ctx_size} tokens).");
                break;
            }

            let token = sampler.sample(&ctx, -1);
            sampler.accept(token);

            if model.is_eog_token(token) {
                break;
            }

            let output_bytes = model
                .token_to_piece_bytes(token, 128, false, None)
                .map_err(|e| format!("Token decode error: {e}"))?;
            let token_piece = String::from_utf8_lossy(&output_bytes).into_owned();
            on_token(token_piece.clone());
            response.push_str(&token_piece);

            batch.clear();
            batch
                .add(token, pos as i32, &[0], true)
                .map_err(|e| format!("Gen batch add error: {e}"))?;
            ctx.decode(&mut batch)
                .map_err(|e| format!("Gen decode error: {e}"))?;
            pos += 1;
        }

        // Strip common generation artifacts before returning to the UI.
        let answer = response
            .trim()
            .trim_start_matches("<s>")
            .trim()
            .trim_end_matches("</s>")
            .trim_end_matches("[INST]")
            .trim_end_matches("[/INST]")
            .trim()
            .to_string();

        let answer: String = answer
            .chars()
            .filter(|&c| {
                let code = c as u32;
                c == '\n'
                    || c == '\t'
                    || (!c.is_control()
                        && !(0xE000..=0xF8FF).contains(&code)
                        && code < 0xFFF0)
            })
            .collect();

        let answer = answer
            .strip_prefix("Answer:")
            .or_else(|| answer.strip_prefix("Answer: "))
            .unwrap_or(&answer)
            .trim()
            .to_string();

        Ok(answer)
    })
    .await
    .map_err(|e| e.to_string())?
}

// ── Chunking ──────────────────────────────────────────────────────────────────

pub struct TempChunk {
    pub id: String,
    pub page_number: u32,
    pub chunk_index: usize,
    pub text: String,
    pub token_count: usize,
}

#[derive(PartialEq)]
pub enum FragKind { Normal, ParagraphBreak }

pub struct SentenceFrag<'a> { pub text: &'a str, pub kind: FragKind }

/// Split `text` into sub-slices each at most `max_bytes` bytes long,
/// always cutting at a valid UTF-8 char boundary so no character is mangled.
pub fn split_at_char_boundaries(text: &str, max_bytes: usize) -> Vec<&str> {
    let mut parts = Vec::new();
    let mut start = 0;
    while start < text.len() {
        let raw_end = (start + max_bytes).min(text.len());
        let end = text.floor_char_boundary(raw_end);
        let end = if end <= start {
            let mut e = start + 1;
            while e < text.len() && !text.is_char_boundary(e) { e += 1; }
            e
        } else {
            end
        };
        let s = text[start..end].trim();
        if !s.is_empty() { parts.push(s); }
        start = end;
    }
    parts
}

pub fn chunk_document(pages: &[DocumentPage], settings: &AppSettings) -> Vec<TempChunk> {
    let mut chunks = Vec::new();
    let mut global_idx = 0usize;

    for page in pages {
        let text = &page.text;
        if text.trim().is_empty() {
            continue;
        }

        let frags = split_sentences(text);
        let mut current = String::new();
        let mut sentence_buf: Vec<&str> = Vec::new();
        let mut pending_header: Option<String> = None;

        let flush = |current: &str,
                     global_idx: &mut usize,
                     chunks: &mut Vec<TempChunk>,
                     page_num: u32| {
            let trimmed = current.trim();
            if !trimmed.is_empty() {
                chunks.push(TempChunk {
                    id: Uuid::new_v4().to_string(),
                    page_number: page_num,
                    chunk_index: *global_idx,
                    text: trimmed.to_string(),
                    token_count: (trimmed.len() / 3).max(1),
                });
                *global_idx += 1;
            }
        };

        for frag in &frags {
            if frag.kind == FragKind::ParagraphBreak {
                let is_orphan = is_section_header(frag.text);

                if is_orphan {
                    if !current.is_empty() {
                        flush(&current, &mut global_idx, &mut chunks, page.page_number);
                        current.clear();
                        sentence_buf.clear();
                    }
                    pending_header = Some(match pending_header.take() {
                        Some(existing) => format!("{existing}\n{}", frag.text),
                        None => frag.text.to_string(),
                    });
                    continue;
                }

                if !current.is_empty() {
                    flush(&current, &mut global_idx, &mut chunks, page.page_number);
                    current.clear();
                    sentence_buf.clear();
                }
                if let Some(h) = pending_header.take() {
                    current.push_str(&h);
                    current.push('\n');
                }
                let pb_subs = if frag.text.len() > settings.chunk_size {
                    split_at_char_boundaries(frag.text, settings.chunk_size)
                } else {
                    vec![frag.text]
                };
                for sub in pb_subs {
                    if !current.is_empty() && current.len() + sub.len() + 1 > settings.chunk_size {
                        flush(&current, &mut global_idx, &mut chunks, page.page_number);
                        current.clear();
                        sentence_buf.clear();
                    }
                    if !current.is_empty() { current.push(' '); }
                    current.push_str(sub);
                    sentence_buf.push(sub);
                }
                continue;
            }

            // Normal fragment: apply any parked header first
            if let Some(h) = pending_header.take() {
                if !current.is_empty() {
                    flush(&current, &mut global_idx, &mut chunks, page.page_number);
                    current.clear();
                    sentence_buf.clear();
                }
                current.push_str(&h);
                current.push('\n');
            }

            let sub_sentences: Vec<&str> = if frag.text.len() > settings.chunk_size {
                split_at_char_boundaries(frag.text, settings.chunk_size)
            } else {
                vec![frag.text]
            };

            for sub in sub_sentences {
                if !current.is_empty() && current.len() + sub.len() + 1 > settings.chunk_size {
                    flush(&current, &mut global_idx, &mut chunks, page.page_number);

                    let mut overlap_parts: Vec<&str> = Vec::new();
                    let mut overlap_len = 0usize;
                    for s in sentence_buf.iter().rev() {
                        if overlap_len + s.len() + 1 > settings.chunk_overlap {
                            break;
                        }
                        overlap_parts.push(s);
                        overlap_len += s.len() + 1;
                    }
                    overlap_parts.reverse();
                    current = overlap_parts.join(" ");
                    sentence_buf.clear();
                }

                if !current.is_empty() {
                    current.push(' ');
                }
                current.push_str(sub);
                sentence_buf.push(sub);
            }
        }

        // Flush remainder; if a lone header is pending, emit it as its own chunk
        if let Some(h) = pending_header {
            if !current.is_empty() {
                flush(&current, &mut global_idx, &mut chunks, page.page_number);
                current.clear();
            }
            current.push_str(&h);
        }
        flush(&current, &mut global_idx, &mut chunks, page.page_number);

        if !chunks.is_empty() {
            let avg_tokens = chunks.iter().map(|c| c.token_count).sum::<usize>()
                / chunks.len();
            let file_name_hint = "document";
            log::debug!(
                "pipeline: chunked '{}' into {} chunks (avg {} tokens)",
                file_name_hint, chunks.len(), avg_tokens
            );
        }
    }

    chunks
}

pub fn is_section_header(line: &str) -> bool {
    let t = line.trim();
    if t.is_empty() || t.len() >= 80 { return false; }
    if t.chars().next().map_or(false, |c| c.is_ascii_digit()) {
        if let Some(dot_pos) = t.find('.') {
            if t[..dot_pos].chars().all(|c| c.is_ascii_digit()) {
                let after = t[dot_pos + 1..].trim();
                if after.len() <= 40
                    && !after.ends_with('.')
                    && !after.ends_with('!')
                    && !after.ends_with('?') {
                    return true;
                }
            }
        }
    }
    if t.ends_with('.') || t.ends_with('!') || t.ends_with('?') { return false; }
    let u = t.to_uppercase();
    if u.starts_with("SECTION") || u.starts_with("ARTICLE") || u.starts_with("WHEREAS")
        || u.starts_with("NOW THEREFORE") || u.starts_with("SCHEDULE")
        || u.starts_with("EXHIBIT") || u.starts_with("ANNEX") {
        return true;
    }
    if t.len() >= 6
        && t.chars().any(|c| c.is_alphabetic())
        && t.chars().all(|c| !c.is_alphabetic() || c.is_uppercase())
        && t.split_whitespace().count() <= 8 {
        return true;
    }
    if t.starts_with('(') {
        if let Some(close) = t.find(')') {
            let inner = &t[1..close];
            if !inner.is_empty() && inner.chars().all(|c| c.is_ascii_alphabetic()) {
                let after = t[close + 1..].trim();
                if after.len() <= 40 { return true; }
            }
        }
    }
    false
}

pub fn split_sentences(text: &str) -> Vec<SentenceFrag<'_>> {
    let mut frags = Vec::new();
    let mut start = 0;
    let bytes = text.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    let mut next_para_break = false;

    while i < len {
        let b = bytes[i];
        if (b == b'.' || b == b'!' || b == b'?')
            && i + 1 < len
            && bytes[i + 1].is_ascii_whitespace()
        {
            let is_boundary = if b == b'.' {
                let mut word_start = i;
                while word_start > start && !bytes[word_start - 1].is_ascii_whitespace() {
                    word_start -= 1;
                }
                let word = &bytes[word_start..i];
                if word.is_empty() || (word.len() == 1 && word[0].is_ascii_alphabetic()) {
                    false
                } else {
                    const ABBREVS: &[&[u8]] = &[
                        b"mr", b"mrs", b"ms", b"dr", b"prof", b"sr", b"jr",
                        b"vs", b"etc", b"inc", b"corp", b"ltd", b"co",
                        b"no", b"sec", b"art", b"fig", b"est", b"approx",
                        b"jan", b"feb", b"mar", b"apr", b"jun", b"jul",
                        b"aug", b"sep", b"oct", b"nov", b"dec",
                    ];
                    let word_lower: Vec<u8> =
                        word.iter().map(|c| c.to_ascii_lowercase()).collect();
                    !ABBREVS.iter().any(|abbr| *abbr == word_lower.as_slice())
                }
            } else {
                true
            };

            if is_boundary {
                let s = text[start..=i].trim();
                if !s.is_empty() {
                    let kind = if next_para_break || is_section_header(s) {
                        next_para_break = false;
                        FragKind::ParagraphBreak
                    } else {
                        FragKind::Normal
                    };
                    frags.push(SentenceFrag { text: s, kind });
                }
                let mut j = i + 1;
                let mut newline_count = 0usize;
                while j < len && bytes[j].is_ascii_whitespace() {
                    if bytes[j] == b'\n' { newline_count += 1; }
                    j += 1;
                }
                if newline_count >= 2 { next_para_break = true; }
                start = j;
                i = j;
            } else {
                i += 1;
            }
        } else if b == b'\n' {
            let s = text[start..i].trim();
            let mut j = i + 1;
            while j < len && bytes[j] == b'\n' { j += 1; }
            let blank = (j - i) >= 2;

            if !s.is_empty() {
                let kind = if next_para_break || is_section_header(s) {
                    FragKind::ParagraphBreak
                } else {
                    FragKind::Normal
                };
                next_para_break = false;
                frags.push(SentenceFrag { text: s, kind });
            }
            if blank { next_para_break = true; }
            start = j;
            i = j;
        } else {
            i += 1;
        }
    }

    let remainder = text[start..].trim();
    if !remainder.is_empty() {
        let kind = if next_para_break || is_section_header(remainder) {
            FragKind::ParagraphBreak
        } else {
            FragKind::Normal
        };
        frags.push(SentenceFrag { text: remainder, kind });
    }

    frags
}

// ── Retrieval helpers ─────────────────────────────────────────────────────────

/// Expand query keywords with common legal/employment synonyms.
pub fn expand_keywords(keywords: &std::collections::HashSet<String>) -> std::collections::HashSet<String> {
    const SYNONYMS: &[(&str, &[&str])] = &[
        ("salary",          &["compensation", "remuneration", "pay", "wage", "wages", "earnings", "income"]),
        ("compensation",    &["salary", "pay", "remuneration", "wage", "wages", "earnings"]),
        ("wage",            &["salary", "pay", "compensation", "earnings", "income"]),
        ("pay",             &["salary", "compensation", "wage", "payment", "remuneration"]),
        ("offer",           &["proposal", "agreement", "letter", "terms", "offeror"]),
        ("job",             &["position", "role", "employment", "work", "post"]),
        ("hire",            &["employ", "employment", "onboard", "recruit", "position"]),
        ("employee",        &["candidate", "staff", "worker", "personnel", "applicant"]),
        ("employer",        &["company", "organization", "firm", "corporation", "employer"]),
        ("contract",        &["agreement", "terms", "letter", "document"]),
        ("benefit",         &["benefits", "perk", "perks", "bonus", "allowance", "bonuses"]),
        ("start",           &["commence", "begin", "effective", "commencement", "joining"]),
        ("date",            &["effective", "commencement", "period", "term"]),
        ("annual",          &["yearly", "per year", "per annum"]),
        ("breach",          &["violation", "default", "failure", "infringement", "non-performance"]),
        ("damages",         &["liability", "remedy", "award", "loss", "penalty", "compensation"]),
        ("covenant",        &["agreement", "clause", "promise", "obligation", "undertaking"]),
        ("warranty",        &["representation", "guarantee", "assurance", "certification"]),
        ("jurisdiction",    &["venue", "court", "forum", "governing law", "choice of law"]),
        ("indemnify",       &["indemnification", "hold harmless", "defend", "reimburse"]),
        ("confidential",    &["confidentiality", "proprietary", "trade secret", "nda", "privileged"]),
        ("terminate",       &["termination", "cancel", "rescind", "dissolve", "expire", "end"]),
        ("consideration",   &["payment", "fee", "exchange", "value", "price"]),
        ("liability",       &["obligation", "responsibility", "exposure", "risk"]),
        ("amendment",       &["modification", "addendum", "revision", "supplement"]),
        ("party",           &["parties", "signatory", "counterpart", "entity"]),
        ("arbitration",     &["dispute resolution", "mediation", "adr", "tribunal", "hearing"]),
        ("force majeure",   &["act of god", "unforeseeable", "impossibility", "beyond control"]),
        ("assignment",      &["transfer", "delegate", "convey", "assign", "succession"]),
    ];

    let mut expanded = keywords.clone();
    for kw in keywords.iter() {
        for (key, syns) in SYNONYMS {
            if kw == key {
                for &syn in *syns {
                    expanded.insert(syn.to_string());
                }
            }
        }
    }
    expanded
}

/// Maximal Marginal Relevance — select `top_k` diverse, relevant chunks.
pub fn mmr_select(
    mut candidates: Vec<(f32, ChunkMetadata, Vec<f32>)>,
    top_k: usize,
    lambda: f32,
) -> Vec<(f32, ChunkMetadata)> {
    let mut selected: Vec<(f32, ChunkMetadata, Vec<f32>)> = Vec::with_capacity(top_k);

    for _ in 0..top_k {
        if candidates.is_empty() {
            break;
        }
        let best_idx = candidates
            .iter()
            .enumerate()
            .max_by(|(_, a), (_, b)| {
                let mmr_a = if selected.is_empty() {
                    a.0
                } else {
                    let max_sim = selected
                        .iter()
                        .map(|(_, _, v)| RagState::cosine_similarity(&a.2, v))
                        .fold(0.0f32, f32::max);
                    lambda * a.0 - (1.0 - lambda) * max_sim
                };
                let mmr_b = if selected.is_empty() {
                    b.0
                } else {
                    let max_sim = selected
                        .iter()
                        .map(|(_, _, v)| RagState::cosine_similarity(&b.2, v))
                        .fold(0.0f32, f32::max);
                    lambda * b.0 - (1.0 - lambda) * max_sim
                };
                mmr_a
                    .partial_cmp(&mmr_b)
                    .unwrap_or(std::cmp::Ordering::Equal)
            })
            .map(|(i, _)| i);

        if let Some(idx) = best_idx {
            selected.push(candidates.remove(idx));
        }
    }

    selected
        .into_iter()
        .map(|(score, meta, _)| (score, meta))
        .collect()
}

// ── Unit tests ─────────────────────────────────────────────────────────────────
#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::AppSettings;

    fn default_settings() -> AppSettings {
        AppSettings {
            chunk_size: 500,
            chunk_overlap: 50,
            top_k: 6,
        }
    }

    fn make_page(text: &str) -> DocumentPage {
        DocumentPage { page_number: 1, text: text.to_string() }
    }

    // ── is_section_header ──────────────────────────────────────────────────

    #[test]
    fn header_all_caps_bartending() {
        assert!(is_section_header("BARTENDING SERVICES"));
    }

    #[test]
    fn header_all_caps_governing_law() {
        assert!(is_section_header("GOVERNING LAW"));
    }

    #[test]
    fn header_rejects_content_sentence() {
        assert!(!is_section_header("The party agrees to pay $275."));
    }

    #[test]
    fn header_rejects_event_date_line() {
        // "Event Date: Sat 2.28.26" — contains a colon, mixed case, should not be a header
        assert!(!is_section_header("Event Date: Sat 2.28.26"));
    }

    // ── chunk_document — filled form data ──────────────────────────────────

    #[test]
    fn chunk_short_doc_preserves_filled_data() {
        let text = "Client: Liam Neild. Event Date: Sat 2.28.26. Amount: $275 as signing bonus.";
        let pages = vec![make_page(text)];
        let chunks = chunk_document(&pages, &default_settings());
        let all_text: String = chunks.iter().map(|c| c.text.as_str()).collect::<Vec<_>>().join(" ");
        assert!(all_text.contains("2.28.26") || all_text.contains("Sat"), "Date missing: {all_text}");
        assert!(all_text.contains("$275"), "Amount missing: {all_text}");
    }

    #[test]
    fn chunk_bartending_contract_pattern() {
        // Simulates the actual extracted text pattern from the bartending contract
        let text = "Client Name: _______ Event: _______\nEvent Date: ________ Event Time: 3-7pm\n\nLiam Neild Party williamaneild@gmail.com Sat 2.28.26 3-7pm 101-125 $275 as signing\n2/28/2026 2/25/2026";
        let pages = vec![make_page(text)];
        let chunks = chunk_document(&pages, &default_settings());
        let all_text: String = chunks.iter().map(|c| c.text.as_str()).collect::<Vec<_>>().join(" ");
        assert!(all_text.contains("Sat 2.28.26") || all_text.contains("2.28.26"),
            "Date 'Sat 2.28.26' missing from chunks: {all_text}");
        assert!(all_text.contains("$275"), "Amount '$275' missing from chunks: {all_text}");
    }

    // ── mmr_select ─────────────────────────────────────────────────────────

    fn make_chunk_meta(id: &str) -> ChunkMetadata {
        ChunkMetadata {
            id: id.to_string(),
            document_id: "doc1".to_string(),
            file_name: "test.pdf".to_string(),
            file_path: "/tmp/test.pdf".to_string(),
            page_number: 1,
            chunk_index: 0,
            text: id.to_string(),
            token_count: 10,
        }
    }

    #[test]
    fn mmr_returns_top_k() {
        let candidates: Vec<(f32, ChunkMetadata, Vec<f32>)> = (0..10)
            .map(|i| {
                let score = 1.0 - i as f32 * 0.05;
                let vec = vec![score, 0.0, 0.0];
                (score, make_chunk_meta(&format!("chunk{i}")), vec)
            })
            .collect();
        let result = mmr_select(candidates, 4, 0.7);
        assert_eq!(result.len(), 4, "Expected exactly 4 results");
    }

    #[test]
    fn mmr_diversifies_near_duplicate_chunks() {
        // chunk_a and chunk_b are nearly identical (cosine ~1.0)
        // chunk_c is diverse
        let chunk_a = (0.9f32, make_chunk_meta("a"), vec![1.0f32, 0.0, 0.0]);
        let chunk_b = (0.85f32, make_chunk_meta("b"), vec![0.99f32, 0.01, 0.0]);
        let chunk_c = (0.7f32, make_chunk_meta("c"), vec![0.0f32, 1.0, 0.0]);

        let result = mmr_select(vec![chunk_a, chunk_b, chunk_c], 2, 0.7);
        assert_eq!(result.len(), 2);
        let ids: Vec<&str> = result.iter().map(|(_, m)| m.id.as_str()).collect();
        // chunk_a should be selected first (highest score), then chunk_c (diverse)
        // chunk_b should lose to chunk_c because chunk_b is near-duplicate of chunk_a
        assert!(ids.contains(&"a"), "chunk_a should be selected (highest score)");
        assert!(ids.contains(&"c"), "chunk_c should be selected over near-duplicate chunk_b");
        assert!(!ids.contains(&"b"), "chunk_b (near-duplicate) should be penalised by MMR");
    }

    // ── split_sentences ────────────────────────────────────────────────────

    #[test]
    fn split_basic_sentences() {
        let text = "First sentence. Second sentence. Third sentence.";
        let frags = split_sentences(text);
        assert!(frags.len() >= 2, "Expected multiple sentence fragments");
        let texts: Vec<&str> = frags.iter().map(|f| f.text).collect();
        assert!(texts.iter().any(|t| t.contains("First")));
        assert!(texts.iter().any(|t| t.contains("Second")));
    }

    #[test]
    fn split_does_not_split_on_mr_abbreviation() {
        let text = "Mr. Smith signed the contract. The terms are clear.";
        let frags = split_sentences(text);
        // Should not split at "Mr." — so "Mr. Smith signed the contract." is one fragment
        let has_full_sentence = frags.iter().any(|f| f.text.contains("Mr.") && f.text.contains("Smith"));
        assert!(has_full_sentence, "Split on 'Mr.' abbreviation — should not split here. Frags: {:?}",
            frags.iter().map(|f| f.text).collect::<Vec<_>>());
    }

    // ── format_history ─────────────────────────────────────────────────────

    #[test]
    fn format_history_capped_at_4_turns() {
        let history: Vec<(String, String)> = (0..8)
            .map(|i| (format!("user{i}"), format!("assistant{i}")))
            .collect();
        let result = format_history(&history);
        assert!(!result.contains("user0"), "Turn 0 should be excluded");
        assert!(!result.contains("user3"), "Turn 3 should be excluded");
        assert!(result.contains("user4"), "Turn 4 should be included");
        assert!(result.contains("user7"), "Turn 7 should be included");
    }
}
