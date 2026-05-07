from __future__ import annotations

import numpy as np


def _difference_function(x: np.ndarray, max_tau: int) -> np.ndarray:
    """
    Difference function d(tau) for tau in [0, max_tau].
    Naive O(N * max_tau), but stable and dependency-free.
    """
    n = x.shape[0]
    max_tau = min(max_tau, n - 1)
    d = np.zeros(max_tau + 1, dtype=np.float64)
    for tau in range(1, max_tau + 1):
        delta = x[: n - tau] - x[tau:]
        d[tau] = np.dot(delta, delta)
    return d


def _cumulative_mean_normalized_difference(d: np.ndarray) -> np.ndarray:
    cmnd = np.zeros_like(d)
    cmnd[0] = 1.0
    running_sum = 0.0
    for tau in range(1, d.shape[0]):
        running_sum += d[tau]
        cmnd[tau] = d[tau] * tau / (running_sum + 1e-12)
    return cmnd


def _parabolic_interpolation(cmnd: np.ndarray, tau: int) -> float:
    if tau <= 0 or tau >= cmnd.shape[0] - 1:
        return float(tau)
    x0, x1, x2 = cmnd[tau - 1], cmnd[tau], cmnd[tau + 1]
    denom = (x0 - 2.0 * x1 + x2)
    if abs(denom) < 1e-12:
        return float(tau)
    return float(tau) + 0.5 * (x0 - x2) / denom


def yin_frequencies(
    audio: np.ndarray,
    *,
    sample_rate: int,
    frame_size: int,
    hop_size: int,
    fmin: float,
    fmax: float,
    threshold: float,
) -> np.ndarray:
    """
    Returns per-frame fundamental frequency in Hz using the YIN algorithm.
    Unvoiced frames are returned as 0.
    """
    if audio.ndim != 1:
        raise ValueError("audio must be mono 1D array")
    if frame_size <= 0 or hop_size <= 0:
        raise ValueError("frame_size and hop_size must be > 0")

    audio = audio.astype(np.float64, copy=False)
    n = audio.shape[0]
    if n < frame_size:
        return np.zeros(0, dtype=np.float64)

    tau_min = int(sample_rate / float(fmax))
    tau_max = int(sample_rate / float(fmin))
    tau_min = max(2, tau_min)
    tau_max = max(tau_min + 1, tau_max)

    num_frames = 1 + (n - frame_size) // hop_size
    freqs = np.zeros(num_frames, dtype=np.float64)

    for i in range(num_frames):
        start = i * hop_size
        frame = audio[start : start + frame_size]
        frame = frame - np.mean(frame)

        d = _difference_function(frame, tau_max)
        cmnd = _cumulative_mean_normalized_difference(d)

        # Absolute threshold: first tau where cmnd[tau] < threshold
        tau = 0
        for t in range(tau_min, min(tau_max, cmnd.shape[0] - 1)):
            if cmnd[t] < threshold:
                tau = t
                # move to local minimum
                while t + 1 < cmnd.shape[0] and cmnd[t + 1] < cmnd[t]:
                    t += 1
                tau = t
                break

        if tau == 0:
            freqs[i] = 0.0
            continue

        tau_refined = _parabolic_interpolation(cmnd, tau)
        if tau_refined <= 0:
            freqs[i] = 0.0
            continue

        f0 = sample_rate / tau_refined
        if f0 < fmin or f0 > fmax:
            freqs[i] = 0.0
        else:
            freqs[i] = float(f0)

    return freqs

