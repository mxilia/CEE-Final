# Karaoke Pipeline
This is source code for generating karaoke files and metadata.

Roadmap:
1. Download a song from YouTube
2. Generate:
   - instrumental track
   - vocal track
   - synced lyrics
3. Convert lyrics into JSON
4. Extract vocal pitch using torchcrepe
5. Generate final:
   - `instrumental.flac`
   - `lyrics.json`
   - `pitch.json`

---

# Requirements

- macOS
- Homebrew installed
- Python 3.11

---

# 1. Install Python 3.11

```bash
brew install python@3.11
```

Verify:

```bash
python3.11 --version
```

Expected:

```text
Python 3.11.x
```

---

# 2. Create Project Folder

```bash
mkdir karaoke-project
cd karaoke-project
```

---

# 3. Create Virtual Environment

```bash
python3.11 -m venv venv
```

Activate:

```bash
source venv/bin/activate
```

You should now see:

```text
(venv)
```

in your terminal.

---

# 4. Upgrade pip

```bash
pip install --upgrade pip setuptools wheel
```

---

# 5. Install FFmpeg

Required for karaoke-gen.

```bash
brew install ffmpeg
```

Verify:

```bash
ffmpeg -version
```

---

# 6. Install yt-dlp

Used to download YouTube audio.

```bash
brew install yt-dlp
```

Verify:

```bash
yt-dlp --version
```

---

# 7. Install Python Packages

## Install karaoke-gen

```bash
pip install karaoke-gen
```

Verify:

```bash
karaoke-gen --help
```

---

## Install PyTorch

```bash
pip install torch torchaudio
```

---

## Install torchcrepe

```bash
pip install git+https://github.com/maxrmorrison/torchcrepe.git
```

Verify:

```bash
python -c "import torchcrepe; print('ok')"
```

Expected:

```text
ok
```

---

## Install Audio Libraries

```bash
pip install librosa soundfile numpy
```

---

# 8. Download Song from YouTube

Example:

```bash
yt-dlp -f bestaudio -x --audio-format wav -o "song.%(ext)s" "YOUTUBE_URL"
```

Example:

```bash
yt-dlp -f bestaudio -x --audio-format wav -o "song.%(ext)s" "https://youtube.com/watch?v=XXXXX"
```

This creates:

```text
song.wav
```

---

# 9. Generate Karaoke Assets

Run:

```bash
karaoke-gen song.wav "Artist" "Song"
```

Example:

```bash
karaoke-gen song.wav "Queen" "Bohemian Rhapsody"
```

Important:

- Artist and song title help karaoke-gen find lyrics and metadata.
- If you omit them, karaoke-gen may only generate stems.
- Newer karaoke-gen versions often place stems inside the `stems/` folder.

This generates something like:

```text
Artist - Song (Original).wav
Artist - Song (Instrumental...).flac
stems/
```

Inside `stems/` you may see:

```text
stems/
├── vocals.flac
├── drums.flac
├── bass.flac
├── other.flac
```

or model-specific folders/files.

Useful files:

| File | Purpose |
|---|---|
| Instrumental.flac | karaoke backing track |
| vocals.flac | isolated vocals |
| Original.wav | original mix |

Lyrics files (`.lrc`, `.ass`) are not always generated.

Modern karaoke workflows usually use Whisper for lyrics transcription instead.

---

# 10. Generate Lyrics with Whisper

Install Whisper:

```bash
pip install openai-whisper
```

Verify:

```bash
whisper --help
```

Find your vocal stem:

```bash
find stems -type f
```

Example:

```text
stems/vocals.flac
```

Run Whisper:

```bash
whisper "./stems/vocals.flac" --model medium --output_format json
```

This generates:

```text
vocals.json
```

---

# 11. Better Karaoke Lyrics with Word Timestamps

Install faster-whisper:

```bash
pip install faster-whisper
```

Create:

```text
transcribe.py
```

Paste:

```python
from faster_whisper import WhisperModel
import json

audio_path = "./stems/vocals.flac"

model = WhisperModel(
    "medium",
    device="cpu",
    compute_type="int8"
)

segments, info = model.transcribe(
    audio_path,
    word_timestamps=True
)

words = []

for segment in segments:

    for word in segment.words:

        words.append({
            "word": word.word.strip(),
            "start": round(word.start, 2),
            "end": round(word.end, 2)
        })

with open("lyrics.json", "w") as f:
    json.dump(words, f, indent=2)

print("saved lyrics.json")
```

Run:

```bash
python transcribe.py
```

Example output:

```json
[
  {
    "word": "hello",
    "start": 0.52,
    "end": 0.81
  }
]
```

This format is ideal for:

- karaoke highlighting
- lyric sync
- bouncing word effects
- singing games

---

# 12. Extract Vocal Pitch with torchcrepe

Create:

```text
lrc_to_json.py
```

Paste:

```python
import re
import json

lrc_path = "Song/Song.lrc"

lyrics = []

pattern = r"\[(\d+):(\d+\.\d+)\](.*)"

with open(lrc_path, "r", encoding="utf-8") as f:

    for line in f:

        match = re.match(pattern, line)

        if not match:
            continue

        minutes = int(match.group(1))
        seconds = float(match.group(2))
        text = match.group(3).strip()

        timestamp = minutes * 60 + seconds

        lyrics.append({
            "time": round(timestamp, 2),
            "text": text
        })

with open("lyrics.json", "w") as f:
    json.dump(lyrics, f, indent=2, ensure_ascii=False)

print("saved lyrics.json")
```

Run:

```bash
python lrc_to_json.py
```

Example output:

```json
[
  {
    "time": 12.45,
    "text": "hello from the other side"
  }
]
```

---

# 11. Extract Vocal Pitch with torchcrepe

Create:

```text
extract_pitch.py
```

Paste:

```python
import torch
import torchcrepe
import librosa
import numpy as np
import json

audio_path = "Song/Song (Vocals).flac"

# load mono 16k audio
y, sr = librosa.load(
    audio_path,
    sr=16000,
    mono=True
)

audio = torch.tensor(y).unsqueeze(0)

# predict pitch
pitch = torchcrepe.predict(
    audio,
    sr,
    hop_length=160,
    fmin=50,
    fmax=1000,
    model='full',
    batch_size=1024,
    device='cpu'
)

pitch = pitch.squeeze(0).numpy()

times = librosa.times_like(
    pitch,
    sr=sr,
    hop_length=160
)

result = []

prev = None

for t, f in zip(times, pitch):

    if np.isnan(f):
        continue

    freq = int(round(float(f)))

    if freq <= 0:
        continue

    # compression
    if freq != prev:

        result.append({
            "t": round(float(t), 2),
            "f": freq,
            "note": librosa.hz_to_note(freq)
        })

        prev = freq

with open("pitch.json", "w") as f:
    json.dump(result, f)

print("saved pitch.json")
```

Run:

```bash
python extract_pitch.py
```

Example output:

```json
[
  {
    "t": 0.12,
    "f": 220,
    "note": "A3"
  },
  {
    "t": 0.26,
    "f": 223,
    "note": "A3"
  }
]
```

---

# 13. Final Output Files

After everything runs successfully, you should have:

```text
instrumental.flac
lyrics.json
pitch.json
```

---

# 14. Typical Project Structure

```text
karaoke-project/
├── venv/
├── song.wav
├── lyrics.json
├── pitch.json
├── lrc_to_json.py
├── extract_pitch.py
├── Song/
│   ├── Song (Instrumental).flac
│   ├── Song (Vocals).flac
│   ├── Song.lrc
│   └── Song.ass
```

---

# 15. Optional: One Command Automation

Create:

```text
run.sh
```

Paste:

```bash
#!/bin/bash

URL=$1

yt-dlp -f bestaudio -x --audio-format wav -o "song.%(ext)s" "$URL"

karaoke-gen song.wav "Artist" "Song"

python lrc_to_json.py
python extract_pitch.py
```

Make executable:

```bash
chmod +x run.sh
```

Run:

```bash
./run.sh "https://youtube.com/watch?v=XXXXX"
```

---

# 16. Final Pipeline Overview

```text
YouTube URL
     ↓
yt-dlp
     ↓
song.wav
     ↓
karaoke-gen
     ↓
instrumental.flac
vocals.flac
lyrics.lrc
     ↓
lrc_to_json.py
extract_pitch.py
     ↓
lyrics.json
pitch.json
```

---

# 17. Notes

- WAV gives better pitch extraction than MP3.
- torchcrepe is more reliable than original CREPE.
- Running pitch extraction on vocals gives vocal melody.
- Running pitch extraction on instrumental gives instrument frequencies instead.
- Most karaoke scoring systems compare microphone pitch against `pitch.json`.

