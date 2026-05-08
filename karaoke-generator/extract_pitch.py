import torch
import torchcrepe
import librosa
import numpy as np
import json
from scipy.signal import medfilt

# -----------------------------------
# CONFIG
# -----------------------------------

audio_path = "./Dhruv - double take/stems/Dhruv - double take (Vocals model_bs_roformer_ep_317_sdr_12.9755.ckpt).flac"

sample_rate = 16000
hop_length = 160

chunk_seconds = 30

# singing range filter
min_freq = 60
max_freq = 550

# confidence threshold
min_confidence = 0.35

# -----------------------------------
# DEVICE SETUP
# -----------------------------------

if torch.backends.mps.is_available():
    device = "mps"
    print("Using Apple Metal GPU")
else:
    device = "cpu"
    print("Using CPU")

# -----------------------------------
# LOAD AUDIO
# -----------------------------------

print("Loading audio...")

y, sr = librosa.load(
    audio_path,
    sr=sample_rate,
    mono=True
)

# -----------------------------------
# PROCESS SETTINGS
# -----------------------------------

chunk_size = sr * chunk_seconds

results = []

prev_freq = None

# -----------------------------------
# PROCESS AUDIO
# -----------------------------------

print("Extracting pitch...")

for start in range(0, len(y), chunk_size):

    end = start + chunk_size

    chunk = y[start:end]

    if len(chunk) == 0:
        continue

    audio = torch.tensor(
        chunk,
        dtype=torch.float32
    ).unsqueeze(0).to(device)

    with torch.no_grad():

        pitch, periodicity = torchcrepe.predict(
            audio,
            sr,
            hop_length=hop_length,
            fmin=min_freq,
            fmax=max_freq,
            model='tiny',
            batch_size=128,
            device=device,
            return_periodicity=True
        )

    pitch = pitch.squeeze(0).cpu().numpy()
    periodicity = periodicity.squeeze(0).cpu().numpy()

    # smooth pitch
    pitch = medfilt(pitch, kernel_size=5)

    times = librosa.times_like(
        pitch,
        sr=sr,
        hop_length=hop_length
    )

    offset = start / sr

    # -----------------------------------
    # FILTER + COMPRESS
    # -----------------------------------

    for t, f, p in zip(times, pitch, periodicity):

        # reject low confidence
        if p < min_confidence:
            continue

        if np.isnan(f):
            continue

        freq = int(round(float(f)))

        # reject invalid vocal range
        if freq < min_freq or freq > max_freq:
            continue

        # compress repeating notes
        if freq != prev_freq:

            results.append({
                "t": round(float(t + offset), 2),
                "f": freq,
                "note": librosa.hz_to_note(freq),
                "confidence": round(float(p), 2)
            })

            prev_freq = freq

    print(f"Processed {round(offset, 1)}s")

# -----------------------------------
# SAVE
# -----------------------------------

with open("pitch.json", "w") as f:
    json.dump(results, f, indent=2)

print("Saved pitch.json")
print(f"Total notes: {len(results)}")