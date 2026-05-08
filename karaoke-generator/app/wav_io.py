from __future__ import annotations

import wave
from pathlib import Path

import numpy as np


def read_wav_mono_pcm16(path: Path) -> tuple[np.ndarray, int]:
    """
    Reads a mono 16-bit PCM WAV into float32 [-1, 1] and returns (audio, sample_rate).
    """
    with wave.open(str(path), "rb") as wf:
        nch = wf.getnchannels()
        sampwidth = wf.getsampwidth()
        sr = wf.getframerate()
        nframes = wf.getnframes()
        if nch != 1:
            raise ValueError(f"Expected mono WAV, got channels={nch}")
        if sampwidth != 2:
            raise ValueError(f"Expected 16-bit PCM WAV, got sample width={sampwidth}")
        raw = wf.readframes(nframes)

    audio_i16 = np.frombuffer(raw, dtype=np.int16)
    audio = (audio_i16.astype(np.float32) / 32768.0).copy()
    return audio, sr

