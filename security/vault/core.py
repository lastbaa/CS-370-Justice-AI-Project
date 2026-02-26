from __future__ import annotations

import base64
import json
import os
import secrets
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.scrypt import Scrypt


VAULT_VERSION = 1
VAULT_META_FILENAME = "vault.json"

NONCE_LEN = 12  # AESGCM standard nonce size
KEY_LEN = 32    # AES-256 key length


class VaultError(Exception):
    pass


def _b64e(b: bytes) -> str:
    return base64.b64encode(b).decode("utf-8")


def _b64d(s: str) -> bytes:
    return base64.b64decode(s.encode("utf-8"))


def _atomic_write_bytes(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.with_suffix(path.suffix + ".tmp")
    with open(tmp_path, "wb") as f:
        f.write(data)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp_path, path)


def _atomic_write_json(path: Path, obj: dict[str, Any]) -> None:
    data = json.dumps(obj, indent=2, sort_keys=True).encode("utf-8")
    _atomic_write_bytes(path, data)


def _read_json(path: Path) -> dict[str, Any]:
    with open(path, "rb") as f:
        return json.loads(f.read().decode("utf-8"))


def _derive_master_key(passphrase: str, salt: bytes, n: int, r: int, p: int) -> bytes:
    if not passphrase:
        raise VaultError("Empty passphrase is not allowed.")

    kdf = Scrypt(
        salt=salt,
        length=KEY_LEN,
        n=n,
        r=r,
        p=p,
    )
    return kdf.derive(passphrase.encode("utf-8"))


def init_vault(vault_dir: str, passphrase: str) -> None:
    """
    Initializes a new vault directory. Stores only non-secret KDF params + salt.
    Refuses to overwrite an existing vault.
    """
    root = Path(vault_dir).expanduser().resolve()
    meta_path = root / VAULT_META_FILENAME

    if meta_path.exists():
        raise VaultError(f"Vault already exists at {root}")

    root.mkdir(parents=True, exist_ok=True)
    (root / "chats").mkdir(parents=True, exist_ok=True)
    (root / "docs").mkdir(parents=True, exist_ok=True)

    salt = secrets.token_bytes(16)

    # Scrypt parameters:
    # n must be a power of 2. These are moderate defaults suitable for a demo.
    # You can increase n for stronger resistance if performance allows.
    kdf_params = {
        "name": "scrypt",
        "n": 2**15,
        "r": 8,
        "p": 1,
        "salt_b64": _b64e(salt),
        "key_len": KEY_LEN,
    }

    meta = {
        "vault_version": VAULT_VERSION,
        "kdf": kdf_params,
    }

    # Quick sanity check: ensure passphrase can derive a key (without storing it)
    _ = _derive_master_key(
        passphrase=passphrase,
        salt=salt,
        n=kdf_params["n"],
        r=kdf_params["r"],
        p=kdf_params["p"],
    )

    _atomic_write_json(meta_path, meta)


@dataclass
class Vault:
    root: Path
    master_key: bytes

    def _encrypt(self, plaintext: bytes, aad: bytes) -> bytes:
        nonce = secrets.token_bytes(NONCE_LEN)
        aesgcm = AESGCM(self.master_key)
        ciphertext = aesgcm.encrypt(nonce, plaintext, aad)

        # Record format:
        # b"VLT1" (4 bytes) + version (1 byte) + nonce (12 bytes) + ciphertext+tag (variable)
        header = b"VLT1" + bytes([VAULT_VERSION]) + nonce
        return header + ciphertext

    def _decrypt(self, blob: bytes, aad: bytes) -> bytes:
        if len(blob) < 4 + 1 + NONCE_LEN + 16:
            raise VaultError("Ciphertext blob is too short or malformed.")

        magic = blob[:4]
        if magic != b"VLT1":
            raise VaultError("Bad magic header. Not a vault ciphertext.")

        version = blob[4]
        if version != VAULT_VERSION:
            raise VaultError(f"Unsupported vault version: {version}")

        nonce_start = 5
        nonce_end = 5 + NONCE_LEN
        nonce = blob[nonce_start:nonce_end]
        ciphertext = blob[nonce_end:]

        aesgcm = AESGCM(self.master_key)
        try:
            return aesgcm.decrypt(nonce, ciphertext, aad)
        except InvalidTag as e:
            raise VaultError("Decryption failed. Wrong passphrase or tampered data.") from e

    def _chat_path(self, conversation_id: str) -> Path:
        safe_id = conversation_id.strip()
        if not safe_id:
            raise VaultError("conversation_id is empty.")
        return self.root / "chats" / f"{safe_id}.bin"

    def _doc_path(self, doc_id: str) -> Path:
        safe_id = doc_id.strip()
        if not safe_id:
            raise VaultError("doc_id is empty.")
        return self.root / "docs" / f"{safe_id}.bin"

    def put_chat(self, conversation_id: str, messages: list[dict[str, Any]]) -> None:
        plaintext = json.dumps(messages, ensure_ascii=False, indent=2).encode("utf-8")
        aad = f"type=chat|conv={conversation_id}".encode("utf-8")
        blob = self._encrypt(plaintext, aad)
        _atomic_write_bytes(self._chat_path(conversation_id), blob)

    def get_chat(self, conversation_id: str) -> list[dict[str, Any]]:
        path = self._chat_path(conversation_id)
        with open(path, "rb") as f:
            blob = f.read()
        aad = f"type=chat|conv={conversation_id}".encode("utf-8")
        plaintext = self._decrypt(blob, aad)
        obj = json.loads(plaintext.decode("utf-8"))
        if not isinstance(obj, list):
            raise VaultError("Chat payload is not a list. Data may be corrupted.")
        return obj

    def put_doc(self, doc_id: str, data: bytes, metadata: dict[str, Any] | None = None) -> None:
        payload: dict[str, Any] = {
            "metadata": metadata or {},
            "data_b64": _b64e(data),
        }
        plaintext = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        aad = f"type=doc|doc={doc_id}".encode("utf-8")
        blob = self._encrypt(plaintext, aad)
        _atomic_write_bytes(self._doc_path(doc_id), blob)

    def get_doc(self, doc_id: str) -> bytes:
        path = self._doc_path(doc_id)
        with open(path, "rb") as f:
            blob = f.read()
        aad = f"type=doc|doc={doc_id}".encode("utf-8")
        plaintext = self._decrypt(blob, aad)
        payload = json.loads(plaintext.decode("utf-8"))
        if not isinstance(payload, dict) or "data_b64" not in payload:
            raise VaultError("Doc payload malformed. Data may be corrupted.")
        return _b64d(payload["data_b64"])


def open_vault(vault_dir: str, passphrase: str) -> Vault:
    root = Path(vault_dir).expanduser().resolve()
    meta_path = root / VAULT_META_FILENAME
    if not meta_path.exists():
        raise VaultError(f"No vault.json found at {root}. Run init first.")

    meta = _read_json(meta_path)
    if meta.get("vault_version") != VAULT_VERSION:
        raise VaultError(f"Unsupported vault version: {meta.get('vault_version')}")

    kdf = meta.get("kdf") or {}
    if kdf.get("name") != "scrypt":
        raise VaultError("Unsupported KDF in vault.json")

    salt = _b64d(kdf["salt_b64"])
    n = int(kdf["n"])
    r = int(kdf["r"])
    p = int(kdf["p"])

    master_key = _derive_master_key(passphrase, salt, n, r, p)
    return Vault(root=root, master_key=master_key)
