from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
from pathlib import Path


class DependencyError(RuntimeError):
    pass


def _require_exe(name: str) -> str:
    exe = shutil.which(name)
    if not exe:
        raise DependencyError(f"Missing dependency: `{name}` not found on PATH")
    return exe


def download_youtube_audio_to_wav(
    youtube_url: str,
    *,
    sample_rate: int,
    work_dir: Path,
) -> Path:
    """
    Downloads best-available audio via yt-dlp and converts to mono WAV using ffmpeg.
    Returns path to WAV file.
    """
    yt_dlp = _require_exe("yt-dlp")
    ffmpeg = _require_exe("ffmpeg")

    work_dir.mkdir(parents=True, exist_ok=True)

    # Download as an audio-only file (container determined by yt-dlp).
    downloaded_template = str(work_dir / "audio.%(ext)s")
    subprocess.run(
        [
            yt_dlp,
            "-f",
            "bestaudio/best",
            "--no-playlist",
            "-o",
            downloaded_template,
            youtube_url,
        ],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )

    # Find the downloaded file (audio.<ext>)
    candidates = list(work_dir.glob("audio.*"))
    if not candidates:
        raise RuntimeError("yt-dlp did not produce an output file")
    if len(candidates) > 1:
        # Prefer m4a if present; otherwise take first.
        m4a = [p for p in candidates if p.suffix.lower() == ".m4a"]
        source = m4a[0] if m4a else candidates[0]
    else:
        source = candidates[0]

    wav_path = work_dir / "audio.wav"
    subprocess.run(
        [
            ffmpeg,
            "-y",
            "-i",
            str(source),
            "-ac",
            "1",
            "-ar",
            str(sample_rate),
            "-f",
            "wav",
            str(wav_path),
        ],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )

    if not wav_path.exists():
        raise RuntimeError("ffmpeg conversion failed: audio.wav missing")
    return wav_path


def create_job_workdir(job_id: str) -> Path:
    base = Path(tempfile.gettempdir()) / "karaoke-generator"
    return base / job_id


def safe_cleanup(path: Path) -> None:
    try:
        if path.exists():
            for root, dirs, files in os.walk(path, topdown=False):
                for f in files:
                    try:
                        os.unlink(Path(root) / f)
                    except OSError:
                        pass
                for d in dirs:
                    try:
                        os.rmdir(Path(root) / d)
                    except OSError:
                        pass
            try:
                os.rmdir(path)
            except OSError:
                pass
    except Exception:
        # best-effort cleanup
        pass

