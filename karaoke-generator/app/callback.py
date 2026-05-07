from __future__ import annotations

import asyncio
import hmac
import hashlib
import json
import time

import httpx

from .config import get_settings
from .models import CallbackPayload


def _parse_extra_header(line: str) -> tuple[str, str] | None:
    line = (line or "").strip()
    if not line:
        return None
    if ":" not in line:
        return None
    k, v = line.split(":", 1)
    k = k.strip()
    v = v.strip()
    if not k:
        return None
    return k, v


async def post_callback(url: str, payload: CallbackPayload) -> None:
    headers: dict[str, str] = {"content-type": "application/json"}
    s = get_settings()
    extra = _parse_extra_header(s.callback_auth_header)
    if extra:
        headers[extra[0]] = extra[1]

    body_obj = payload.model_dump(mode="json")
    # Always use a deterministic JSON encoding so signing/verifying is stable.
    body_json = json.dumps(body_obj, separators=(",", ":"), ensure_ascii=False)

    # Optional signing: receiver can verify HMAC-SHA256 over: "<ts>.<json>"
    if s.callback_hmac_secret:
        ts = str(int(time.time()))
        msg = f"{ts}.{body_json}".encode("utf-8")
        sig = hmac.new(s.callback_hmac_secret.encode("utf-8"), msg, hashlib.sha256).hexdigest()
        headers["X-Karaoke-Timestamp"] = ts
        headers["X-Karaoke-Signature"] = sig

    # Retry with exponential backoff for transient failures.
    # Attempts: 1 + retries (total 5). Backoff: 1s, 2s, 4s, 8s.
    retries = 4
    backoff_s = 1.0
    last_exc: Exception | None = None
    async with httpx.AsyncClient(timeout=60.0) as client:
        for attempt in range(retries + 1):
            try:
                resp = await client.post(url, content=body_json.encode("utf-8"), headers=headers)
                resp.raise_for_status()
                return
            except (httpx.TimeoutException, httpx.NetworkError, httpx.HTTPStatusError) as e:
                last_exc = e
                if attempt >= retries:
                    break
                await asyncio.sleep(backoff_s)
                backoff_s *= 2.0

    assert last_exc is not None
    raise last_exc

