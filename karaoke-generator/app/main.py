from __future__ import annotations

import asyncio
import uuid
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI, HTTPException

from .jobs import create_job, get_job, job_to_dict, set_status
from .models import AudioRef, CallbackPayload, GenerateRequest, GenerateResponse
from .supabase_storage import upload_file_to_supabase
from .wav_io import read_wav_mono_pcm16
from .yin import yin_frequencies
from .youtube_audio import DependencyError, create_job_workdir, download_youtube_audio_to_wav, safe_cleanup
from .callback import post_callback
from .config import get_settings


app = FastAPI(title="karaoke-generator", version="0.1.0")


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}


def _supabase_object_path(prefix: str, job_id: str, filename: str) -> str:
    p = (prefix or "").strip()
    if p and not p.endswith("/"):
        p += "/"
    return f"{p}{job_id}/{filename}"


async def _process_job(job_id: str, req: GenerateRequest) -> None:
    workdir = create_job_workdir(job_id)
    wav_path: Path | None = None
    try:
        set_status(job_id, "running")
        s = get_settings()
        wav_path = download_youtube_audio_to_wav(
            str(req.youtube_url), sample_rate=req.yin.sample_rate, work_dir=workdir
        )

        object_path = _supabase_object_path(req.supabase_path_prefix, job_id, "audio.wav")
        public_url = upload_file_to_supabase(
            wav_path,
            bucket=s.supabase_bucket,
            object_path=object_path,
            content_type="audio/wav",
        )

        audio, sr = read_wav_mono_pcm16(wav_path)
        if sr != req.yin.sample_rate:
            raise RuntimeError(f"Unexpected sample rate after conversion: got {sr}, expected {req.yin.sample_rate}")

        frame_size = int(sr * (req.yin.frame_ms / 1000.0))
        hop_size = int(sr * (req.yin.hop_ms / 1000.0))

        freqs = yin_frequencies(
            audio,
            sample_rate=sr,
            frame_size=frame_size,
            hop_size=hop_size,
            fmin=req.yin.fmin,
            fmax=req.yin.fmax,
            threshold=req.yin.threshold,
        )

        payload = CallbackPayload(
            job_id=job_id,
            youtube_url=str(req.youtube_url),
            audio=AudioRef(
                bucket=s.supabase_bucket,
                path=object_path,
                public_url=public_url,
            ),
            yin=req.yin,
            frequencies_hz=[float(x) for x in freqs.tolist()],
        )
        await post_callback(str(req.callback_url), payload)
        set_status(job_id, "succeeded")
    except Exception as e:
        set_status(job_id, "failed", error=str(e))
        raise
    finally:
        if wav_path is not None:
            safe_cleanup(workdir)


def _run_async(coro) -> None:
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        asyncio.run(coro)
        return
    loop.create_task(coro)


@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest, background: BackgroundTasks) -> GenerateResponse:
    job_id = (req.job_id or "").strip() or uuid.uuid4().hex
    try:
        # Force settings load early to fail fast on missing env.
        _ = get_settings().supabase_url
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Config error: {e}") from e

    try:
        # Validate that external binaries exist now (before returning job id).
        # The actual work is still backgrounded.
        from .youtube_audio import _require_exe

        _require_exe("yt-dlp")
        _require_exe("ffmpeg")
    except DependencyError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

    create_job(job_id)
    background.add_task(_run_async, _process_job(job_id, req))
    return GenerateResponse(job_id=job_id)


@app.get("/jobs/{job_id}")
def get_job_status(job_id: str) -> dict:
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="job not found")
    return job_to_dict(job)

