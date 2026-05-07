from __future__ import annotations

import time
from dataclasses import dataclass, asdict
from threading import Lock
from typing import Literal, Optional


JobStatus = Literal["queued", "running", "succeeded", "failed"]


@dataclass
class JobInfo:
    job_id: str
    status: JobStatus
    created_at: float
    updated_at: float
    error: Optional[str] = None


_lock = Lock()
_jobs: dict[str, JobInfo] = {}


def create_job(job_id: str) -> JobInfo:
    now = time.time()
    ji = JobInfo(job_id=job_id, status="queued", created_at=now, updated_at=now, error=None)
    with _lock:
        _jobs[job_id] = ji
    return ji


def set_status(job_id: str, status: JobStatus, *, error: str | None = None) -> None:
    now = time.time()
    with _lock:
        ji = _jobs.get(job_id)
        if ji is None:
            ji = JobInfo(job_id=job_id, status=status, created_at=now, updated_at=now, error=error)
            _jobs[job_id] = ji
            return
        ji.status = status
        ji.updated_at = now
        ji.error = error


def get_job(job_id: str) -> JobInfo | None:
    with _lock:
        return _jobs.get(job_id)


def job_to_dict(job: JobInfo) -> dict:
    return asdict(job)

