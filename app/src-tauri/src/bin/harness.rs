//! CLI test harness for the Justice AI RAG pipeline.
//!
//! Usage: harness --pdf <path> --query <text> [--data-dir <path>] [--skip-llm]
//!
//! Defaults:
//!   --data-dir: ~/Library/Application Support/com.justiceai.app
//!   --skip-llm: false (run LLM if model exists)

// Re-export everything we need from the parent crate
use app_lib::commands::doc_parser;
use app_lib::pipeline;
use app_lib::state::{AppSettings, ChunkMetadata, DocumentPage, RagState};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

fn print_banner(title: &str) {
    println!("\n{}", "═".repeat(36));
    println!(" {title}");
    println!("{}", "═".repeat(36));
}

#[tokio::main]
async fn main() {
    // ── Parse CLI args ────────────────────────────────────────────────────────
    let args: Vec<String> = std::env::args().collect();
    let mut pdf_path: Option<String> = None;
    let mut query_text: Option<String> = None;
    let mut data_dir: Option<PathBuf> = None;
    let mut skip_llm = false;

    let mut i = 1;
    while i < args.len() {
        match args[i].as_str() {
            "--pdf" => {
                i += 1;
                pdf_path = Some(args[i].clone());
            }
            "--query" => {
                i += 1;
                query_text = Some(args[i].clone());
            }
            "--data-dir" => {
                i += 1;
                data_dir = Some(PathBuf::from(&args[i]));
            }
            "--skip-llm" => {
                skip_llm = true;
            }
            _ => {
                eprintln!("Unknown argument: {}", args[i]);
            }
        }
        i += 1;
    }

    let pdf_path = pdf_path.unwrap_or_else(|| {
        eprintln!("Usage: harness --pdf <path> --query <text> [--data-dir <path>] [--skip-llm]");
        std::process::exit(1);
    });

    let query = query_text.unwrap_or_else(|| {
        eprintln!("Usage: harness --pdf <path> --query <text> [--data-dir <path>] [--skip-llm]");
        std::process::exit(1);
    });

    let data_dir = data_dir.unwrap_or_else(|| {
        let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".to_string());
        PathBuf::from(home)
            .join("Library")
            .join("Application Support")
            .join("com.justiceai.app")
    });

    let model_dir = data_dir.join("models");
    let settings = AppSettings::default();

    // ── EXTRACTION ────────────────────────────────────────────────────────────
    print_banner("EXTRACTION");

    let lower = pdf_path.to_lowercase();
    let parse_result = if lower.ends_with(".pdf") {
        println!("Parser: pdf-extract / lopdf");
        doc_parser::parse_pdf(&pdf_path)
    } else if lower.ends_with(".docx") {
        println!("Parser: DOCX/roxmltree");
        doc_parser::parse_docx(&pdf_path)
    } else {
        eprintln!("Unsupported file type: {pdf_path}");
        std::process::exit(1);
    };

    let pages: Vec<DocumentPage> = match parse_result {
        Ok(p) => p,
        Err(e) => {
            eprintln!("Parse error: {e}");
            std::process::exit(1);
        }
    };

    println!("Pages: {}", pages.len());
    for page in pages.iter().take(3) {
        let preview_len = page.text.len().min(500);
        println!("\n--- Page {} ({} chars) ---", page.page_number, page.text.len());
        println!("{}", &page.text[..preview_len]);
        if page.text.len() > 500 { println!("..."); }
    }

    // ── CHUNKING ──────────────────────────────────────────────────────────────
    print_banner("CHUNKING");

    let chunks = pipeline::chunk_document(&pages, &settings);
    println!("Total chunks: {}", chunks.len());

    for (i, chunk) in chunks.iter().enumerate() {
        let preview_len = chunk.text.len().min(200);
        println!(
            "\n[Chunk {}] page={} tokens={} len={}",
            i, chunk.page_number, chunk.token_count, chunk.text.len()
        );
        println!("{}", &chunk.text[..preview_len]);
        if chunk.text.len() > 200 { println!("..."); }
    }

    // ── EMBEDDING ─────────────────────────────────────────────────────────────
    print_banner("EMBEDDING QUERY");

    let query_vec = match pipeline::embed_text(&query, true, &model_dir).await {
        Ok(v) => {
            println!("Query embedded ({} dims)", v.len());
            v
        }
        Err(e) => {
            eprintln!("Embedding error: {e}");
            std::process::exit(1);
        }
    };

    // ── EMBEDDING CHUNKS ─────────────────────────────────────────────────────
    print_banner("EMBEDDING CHUNKS");
    println!("Embedding {} chunks...", chunks.len());

    let mut embedded: Vec<(f32, ChunkMetadata, Vec<f32>)> = Vec::new();

    for (i, chunk) in chunks.iter().enumerate() {
        match pipeline::embed_text(&chunk.text, false, &model_dir).await {
            Ok(vec) => {
                let score = RagState::cosine_similarity(&query_vec, &vec);
                let meta = ChunkMetadata {
                    id: chunk.id.clone(),
                    document_id: "harness-doc".to_string(),
                    file_name: std::path::Path::new(&pdf_path)
                        .file_name()
                        .map(|n| n.to_string_lossy().to_string())
                        .unwrap_or_else(|| pdf_path.clone()),
                    file_path: pdf_path.clone(),
                    page_number: chunk.page_number,
                    chunk_index: chunk.chunk_index,
                    text: chunk.text.clone(),
                    token_count: chunk.token_count,
                };
                embedded.push((score, meta, vec));
            }
            Err(e) => eprintln!("  Chunk {} embed error: {e}", i),
        }
    }

    // ── RETRIEVAL ─────────────────────────────────────────────────────────────
    print_banner("RETRIEVAL (Top 10 by cosine score)");

    embedded.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));
    for (rank, (score, meta, _)) in embedded.iter().take(10).enumerate() {
        let preview_len = meta.text.len().min(150);
        println!(
            "\n[#{} score={:.4}] page={} chunk={}",
            rank + 1, score, meta.page_number, meta.chunk_index
        );
        println!("{}", &meta.text[..preview_len]);
        if meta.text.len() > 150 { println!("..."); }
    }

    // ── MMR SELECTION ─────────────────────────────────────────────────────────
    print_banner("MMR SELECTION");

    let top_k = settings.top_k;
    let mmr_results = pipeline::mmr_select(embedded, top_k, 0.7);

    let context_parts: Vec<String> = mmr_results
        .iter()
        .enumerate()
        .map(|(i, (_, meta))| {
            format!(
                "SOURCE {} — {}, Page {}:\n\"{}\"",
                i + 1,
                meta.file_name,
                meta.page_number,
                meta.text
            )
        })
        .collect();

    let context = context_parts.join("\n\n---\n\n");

    print_banner("FINAL CONTEXT (sent to LLM)");
    println!("{}", &context[..context.len().min(3000)]);
    if context.len() > 3000 { println!("\n... [truncated, {} total chars]", context.len()); }

    // ── LLM INFERENCE ─────────────────────────────────────────────────────────
    let gguf_path = model_dir.join("saul.gguf");

    if skip_llm {
        println!("\n[--skip-llm flag set, skipping LLM]");
        return;
    }

    if !gguf_path.exists() || gguf_path.metadata().map(|m| m.len()).unwrap_or(0) < pipeline::GGUF_MIN_SIZE {
        println!("\nSkipping LLM (model not found at {})", gguf_path.display());
        return;
    }

    print_banner("LLM RESPONSE");
    println!("Running ask_saul...\n");

    let model_cache: Arc<Mutex<Option<llama_cpp_2::model::LlamaModel>>> =
        Arc::new(Mutex::new(None));

    let history: Vec<(String, String)> = Vec::new();

    match pipeline::ask_saul(&query, &context, &history, &model_dir, model_cache, |tok| {
        print!("{tok}");
        use std::io::Write;
        std::io::stdout().flush().ok();
    }).await {
        Ok(answer) => {
            println!("\n\n--- Final answer ---\n{answer}");
        }
        Err(e) => {
            eprintln!("LLM error: {e}");
        }
    }
}
