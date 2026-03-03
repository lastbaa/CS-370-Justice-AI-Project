from huggingface_hub import hf_hub_download

path = hf_hub_download(
    repo_id="tensorblock/Saul-7B-Base-GGUF",
    filename="Saul-7B-Base-Q3_K_M.gguf",
    local_dir="models",
)

print(path)