import json
import numpy as np

VOICE_THRESHOLD = 80  # Hz


# ----------------------------
# LOAD INPUTS
# ----------------------------
def load_whisper(path):
    with open(path, "r") as f:
        return json.load(f)["segments"]


def load_pitch(path):
    with open(path, "r") as f:
        return json.load(f)


# ----------------------------
# BUILD VOICE REGIONS FROM PITCH
# ----------------------------
def build_regions(pitch):
    regions = []
    start = None

    for p in pitch:
        freq = p["f"]
        t = p["t"]

        is_voice = freq is not None and freq > VOICE_THRESHOLD

        if is_voice and start is None:
            start = t

        if not is_voice and start is not None:
            regions.append({"start": start, "end": t})
            start = None

    if start is not None:
        regions.append({"start": start, "end": pitch[-1]["t"]})

    return regions


# ----------------------------
# FIND OVERLAP
# ----------------------------
def find_overlap(seg, regions):
    for r in regions:
        if r["end"] >= seg["start"] and r["start"] <= seg["end"]:
            return r
    return None


# ----------------------------
# REFINE SEGMENT
# ----------------------------
def refine_segment(seg, regions, fallback="♪ instrumental ♪"):
    overlap = find_overlap(seg, regions)

    if not overlap:
        return {
            "start": seg["start"],
            "end": seg["end"],
            "text": fallback,
            "confidence": 0.1,
        }

    start = max(seg["start"], overlap["start"])
    end = min(seg["end"], overlap["end"])

    text = seg.get("text", "").strip()

    if len(text) == 0:
        text = fallback

    return {
        "start": start,
        "end": end,
        "text": text,
        "confidence": 0.85,
    }


# ----------------------------
# MAIN PIPELINE
# ----------------------------
def build_karaoke(whisper_segments, pitch_frames):
    regions = build_regions(pitch_frames)

    output = []

    for seg in whisper_segments:
        refined = refine_segment(seg, regions)
        output.append(refined)

    return output


# ----------------------------
# RUN
# ----------------------------
if __name__ == "__main__":
    whisper_path = "Dhruv - double take (Vocals model_bs_roformer_ep_317_sdr_12.9755.ckpt).json"
    pitch_path = "pitch.json"

    whisper = load_whisper(whisper_path)
    pitch = load_pitch(pitch_path)

    result = build_karaoke(whisper, pitch)

    with open("lyrics.json", "w") as f:
        json.dump(result, f, indent=2)

    print("✅ lyrics.json generated")