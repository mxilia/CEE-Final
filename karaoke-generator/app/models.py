from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field, HttpUrl


class YinConfig(BaseModel):
    sample_rate: int = 16000
    frame_ms: int = 40
    hop_ms: int = 10
    fmin: float = 50.0
    fmax: float = 800.0
    threshold: float = 0.1


class GenerateRequest(BaseModel):
    # allow backend to supply its own job_id so frontend can poll backend
    job_id: Optional[str] = None
    youtube_url: HttpUrl
    callback_url: HttpUrl
    supabase_path_prefix: str = "jobs/"
    yin: YinConfig = Field(default_factory=YinConfig)


class GenerateResponse(BaseModel):
    job_id: str


class AudioRef(BaseModel):
    bucket: str
    path: str
    public_url: Optional[str] = None


class CallbackPayload(BaseModel):
    job_id: str
    youtube_url: str
    audio: AudioRef
    yin: YinConfig
    frequencies_hz: list[float]

