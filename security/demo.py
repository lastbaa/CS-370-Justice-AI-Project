from __future__ import annotations

import argparse
import json
import os
import shutil
import uuid
from getpass import getpass
from pathlib import Path

from vault import init_vault, open_vault, VaultError


DEMO_STATE_FILE = "demo_state.json"


def _state_path(vault_dir: Path) -> Path:
    return vault_dir / DEMO_STATE_FILE


def _load_state(vault_dir: Path) -> dict:
    p = _state_path(vault_dir)
    if not p.exists():
        return {}
    return json.loads(p.read_text(encoding="utf-8"))


def _save_state(vault_dir: Path, state: dict) -> None:
    p = _state_path(vault_dir)
    p.write_text(json.dumps(state, indent=2, sort_keys=True), encoding="utf-8")


def cmd_init(args: argparse.Namespace) -> None:
    vault_dir = Path(args.vault_dir).expanduser().resolve()
    passphrase = getpass("Set vault passphrase: ")
    init_vault(str(vault_dir), passphrase)
    print(f"Initialized vault at: {vault_dir}")
    print("Vault metadata file:", vault_dir / "vault.json")


def cmd_store_chat(args: argparse.Namespace) -> None:
    vault_dir = Path(args.vault_dir).expanduser().resolve()
    passphrase = getpass("Vault passphrase: ")
    v = open_vault(str(vault_dir), passphrase)

    state = _load_state(vault_dir)
    conv_id = state.get("conversation_id") or str(uuid.uuid4())

    messages = [
        {"role": "system", "content": "You are a local-first legal assistant. Do not leak data."},
        {"role": "user", "content": "Summarize the key obligations in this contract."},
        {"role": "assistant", "content": "I can help. Please provide the contract text."},
    ]

    v.put_chat(conv_id, messages)
    state["conversation_id"] = conv_id
    _save_state(vault_dir, state)

    chat_path = vault_dir / "chats" / f"{conv_id}.bin"
    print("Stored encrypted chat.")
    print("conversation_id:", conv_id)
    print("ciphertext path:", chat_path)


def cmd_store_doc(args: argparse.Namespace) -> None:
    vault_dir = Path(args.vault_dir).expanduser().resolve()
    passphrase = getpass("Vault passphrase: ")
    v = open_vault(str(vault_dir), passphrase)

    file_path = Path(args.file_path).expanduser().resolve()
    data = file_path.read_bytes()

    state = _load_state(vault_dir)
    doc_id = state.get("doc_id") or str(uuid.uuid4())

    metadata = {
        "filename": file_path.name,
        "size_bytes": len(data),
    }

    v.put_doc(doc_id, data, metadata=metadata)
    state["doc_id"] = doc_id
    _save_state(vault_dir, state)

    doc_path = vault_dir / "docs" / f"{doc_id}.bin"
    print("Stored encrypted document.")
    print("doc_id:", doc_id)
    print("ciphertext path:", doc_path)


def cmd_verify(args: argparse.Namespace) -> None:
    vault_dir = Path(args.vault_dir).expanduser().resolve()
    state = _load_state(vault_dir)

    conv_id = state.get("conversation_id")
    doc_id = state.get("doc_id")

    if not conv_id or not doc_id:
        print("Missing demo_state.json entries. Run store_chat and store_doc first.")
        return

    print("Using conversation_id:", conv_id)
    print("Using doc_id:", doc_id)

    correct = getpass("Vault passphrase (correct): ")
    v = open_vault(str(vault_dir), correct)

    # 1) Correct passphrase decrypts
    try:
        chat = v.get_chat(conv_id)
        doc_bytes = v.get_doc(doc_id)

        chat_snippet = (chat[-1].get("content", "") if chat else "")[:80]
        doc_snippet = doc_bytes[:80].decode("utf-8", errors="replace")

        print("PASS: correct passphrase decrypts")
        print("Chat snippet:", chat_snippet)
        print("Doc snippet:", doc_snippet)
    except VaultError as e:
        print("FAIL: correct passphrase should decrypt but did not")
        print("Error:", str(e))
        return

    # 2) Wrong passphrase fails
    wrong = getpass("Vault passphrase (wrong, for test): ")
    try:
        v_wrong = open_vault(str(vault_dir), wrong)
        _ = v_wrong.get_chat(conv_id)
        print("FAIL: wrong passphrase should not decrypt")
        return
    except VaultError:
        print("PASS: wrong passphrase rejected")

    # 3) Tamper detection: flip a byte in a copy and verify decrypt fails
    orig_path = vault_dir / "chats" / f"{conv_id}.bin"
    tampered_path = vault_dir / "chats" / f"{conv_id}.tampered.bin"
    shutil.copyfile(orig_path, tampered_path)

    blob = tampered_path.read_bytes()
    if len(blob) < 40:
        print("FAIL: ciphertext unexpectedly short")
        return

    blob_mut = bytearray(blob)
    blob_mut[-10] = (blob_mut[-10] + 1) % 256
    tampered_path.write_bytes(bytes(blob_mut))

    try:
        # Temporarily swap file name by reading the tampered bytes directly through the same decrypt logic.
        # We do this by opening the file and invoking Vault internals via the normal API path.
        # Easiest: replace the original file, attempt decrypt, then restore.
        backup_path = vault_dir / "chats" / f"{conv_id}.backup.bin"
        shutil.copyfile(orig_path, backup_path)
        shutil.copyfile(tampered_path, orig_path)

        try:
            _ = v.get_chat(conv_id)
            print("FAIL: tampered ciphertext should not decrypt")
            return
        except VaultError:
            print("PASS: tamper detected (integrity check failed)")
        finally:
            shutil.copyfile(backup_path, orig_path)
            os.remove(backup_path)
    finally:
        # Keep tampered file for inspection
        print("Tampered file kept at:", tampered_path)


def main() -> None:
    parser = argparse.ArgumentParser(description="Encrypted Vault v0 demo (chats + docs).")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_init = sub.add_parser("init", help="Initialize a new vault directory.")
    p_init.add_argument("vault_dir")
    p_init.set_defaults(func=cmd_init)

    p_chat = sub.add_parser("store_chat", help="Store an encrypted sample chat.")
    p_chat.add_argument("vault_dir")
    p_chat.set_defaults(func=cmd_store_chat)

    p_doc = sub.add_parser("store_doc", help="Store an encrypted document file.")
    p_doc.add_argument("vault_dir")
    p_doc.add_argument("file_path")
    p_doc.set_defaults(func=cmd_store_doc)

    p_verify = sub.add_parser("verify", help="Verify decrypt, wrong passphrase, and tamper detection.")
    p_verify.add_argument("vault_dir")
    p_verify.set_defaults(func=cmd_verify)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
