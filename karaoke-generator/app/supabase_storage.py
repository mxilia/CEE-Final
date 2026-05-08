from __future__ import annotations

from pathlib import Path

from supabase import Client, create_client

from .config import get_settings


def get_supabase_client() -> Client:
    s = get_settings()
    return create_client(s.supabase_url, s.supabase_service_role_key)


def upload_file_to_supabase(
    local_path: Path,
    *,
    bucket: str,
    object_path: str,
    content_type: str,
) -> str:
    """
    Uploads a local file to Supabase Storage.
    Returns best-effort public URL (may be empty for private buckets).
    """
    sb = get_supabase_client()
    data = local_path.read_bytes()

    # supabase-py storage API expects raw bytes and file options.
    sb.storage.from_(bucket).upload(
        path=object_path,
        file=data,
        file_options={"content-type": content_type, "upsert": "true"},
    )

    return build_public_url(bucket=bucket, object_path=object_path)


def build_public_url(*, bucket: str, object_path: str) -> str:
    s = get_settings()
    if s.supabase_public_url_prefix:
        prefix = s.supabase_public_url_prefix.rstrip("/")
        return f"{prefix}/{bucket}/{object_path.lstrip('/')}"
    base = s.supabase_url.rstrip("/")
    return f"{base}/storage/v1/object/public/{bucket}/{object_path.lstrip('/')}"

