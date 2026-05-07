# Karaoke Generator (Python REST API)

Small REST backend that:

1. Downloads a YouTube video's audio (`yt-dlp`)
2. Converts it to WAV mono (`ffmpeg`)
3. Uploads the audio to Supabase Storage
4. Extracts a per-frame frequency array using the **YIN** algorithm
5. POSTs the frequency array to another backend service (callback URL)

## Requirements

- Python 3.11+ (recommended)
- `ffmpeg` installed and available on PATH

## Setup

```bash
cd karaoke-generator
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create env vars:

```bash
export SUPABASE_URL="..."
export SUPABASE_SERVICE_ROLE_KEY="..."   # recommended for server-side uploads
export SUPABASE_BUCKET="karaoke-audio"

# optional
export SUPABASE_PUBLIC_URL_PREFIX=""     # if you need to override public URL construction
export CALLBACK_AUTH_HEADER=""           # e.g. "Authorization: Bearer <token>"
export CALLBACK_HMAC_SECRET=""           # enables HMAC signing headers to callback receiver
```

## Run

```bash
uvicorn app.main:app --reload --port 8001
```

## API

### `GET /health`

Returns `{ "ok": true }`.

### `POST /generate`

Starts processing in the background and immediately returns a `job_id`.

Request body:

```json
{
  "youtube_url": "https://www.youtube.com/watch?v=...",
  "callback_url": "https://other-backend.example.com/pitch",
  "supabase_path_prefix": "jobs/",
  "yin": {
    "sample_rate": 16000,
    "frame_ms": 40,
    "hop_ms": 10,
    "fmin": 50,
    "fmax": 800,
    "threshold": 0.1
  }
}
```

Callback payload (POSTed to `callback_url`):

```json
{
  "job_id": "...",
  "youtube_url": "...",
  "audio": {
    "bucket": "...",
    "path": "...",
    "public_url": "..."
  },
  "yin": {
    "sample_rate": 16000,
    "frame_ms": 40,
    "hop_ms": 10,
    "fmin": 50,
    "fmax": 800,
    "threshold": 0.1
  },
  "frequencies_hz": [123.4, 124.1, 0, 0, 130.2]
}
```

Notes:
- Unvoiced frames are returned as `0`.
- If your Supabase bucket is private, `public_url` may be empty unless you use a public bucket or implement signed URLs.

### `GET /jobs/{job_id}`

Returns current job status:

```json
{
  "job_id": "...",
  "status": "queued|running|succeeded|failed",
  "created_at": 1715070000.1,
  "updated_at": 1715070005.2,
  "error": "..."
}
```

## Callback reliability + signing

- **Retries**: callback POST is retried on transient failures (5 total attempts; backoff 1s, 2s, 4s, 8s).
- **HMAC signing (optional)**: if `CALLBACK_HMAC_SECRET` is set, the callback request includes:
  - `X-Karaoke-Timestamp`: unix seconds
  - `X-Karaoke-Signature`: hex HMAC-SHA256 of `"<timestamp>.<minified_json_body>"`

