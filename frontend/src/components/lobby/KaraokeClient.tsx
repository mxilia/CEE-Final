// app/lobby/[song_id]/KaraokeClient.tsx

"use client"

import {
  useEffect,
  useRef,
  useState
} from "react"

type Props = {
  songId: string
  title: string
  artist: string
  frequencyArray: number[]
}

type PitchMessage = {
  pitch: number | null
  clarity: number
  time: number
}

const NOTES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B"
]

function freqToNote(freq: number) {
  const midi = Math.round(
    69 + 12 * Math.log2(freq / 440)
  )

  const note = NOTES[midi % 12]

  const octave =
    Math.floor(midi / 12) - 1

  return `${note}${octave}`
}

export function KaraokeClient({
  title,
  artist,
  frequencyArray
}: Props) {
  const [running, setRunning] =
    useState(false)

  const [pitch, setPitch] =
    useState<number | null>(null)

  const [note, setNote] =
    useState("--")

  const [clarity, setClarity] =
    useState(0)

  const [score, setScore] =
    useState(0)

  const pitchRef = useRef<number | null>(
    null
  )

  const clarityRef = useRef(0)

  const startTimeRef = useRef(0)

  useEffect(() => {
    let raf: number

    function loop() {
      const currentPitch =
        pitchRef.current

      const currentClarity =
        clarityRef.current

      if (
        currentPitch &&
        currentPitch > 40 &&
        currentPitch < 1500
      ) {
        setPitch(currentPitch)

        setNote(
          freqToNote(currentPitch)
        )

        setClarity(currentClarity)

        const elapsed =
          performance.now() -
          startTimeRef.current

        // 100fps array (10ms)
        const index = Math.floor(
          elapsed / 10
        )

        const expectedFreq =
          frequencyArray[index]

        if (expectedFreq) {
          const cents =
            1200 *
            Math.log2(
              currentPitch /
                expectedFreq
            )

          const accuracy =
            Math.max(
              0,
              100 - Math.abs(cents)
            )

          setScore(
            Math.round(accuracy)
          )
        }
      }

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)

    return () =>
      cancelAnimationFrame(raf)
  }, [frequencyArray])

  async function startMic() {
    if (running) return

    setRunning(true)

    startTimeRef.current =
      performance.now()

    const stream =
      await navigator.mediaDevices.getUserMedia(
        {
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            channelCount: 1,
            //latency: 0
          }
        }
      )

    const audioContext =
      new AudioContext({
        latencyHint: "interactive",
        sampleRate: 48000
      })

    await audioContext.audioWorklet.addModule(
      "/worklets/pitch-processor.js"
    )

    const source =
      audioContext.createMediaStreamSource(
        stream
      )

    const node =
      new AudioWorkletNode(
        audioContext,
        "pitch-processor"
      )

    node.port.onmessage = (
      event: MessageEvent<PitchMessage>
    ) => {
      const {
        pitch,
        clarity
      } = event.data

      if (!pitch) return

      // ignore weak detections
      if (clarity < 0.75) return

      pitchRef.current = pitch

      clarityRef.current = clarity
    }

    source.connect(node)
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold">
            {title}
          </h1>

          <p className="text-2xl opacity-70 mt-2">
            {artist}
          </p>
        </div>

        <button
          onClick={startMic}
          className="bg-white text-black px-6 py-3 rounded-xl font-bold"
        >
          {running
            ? "Mic Active"
            : "Start Singing"}
        </button>

        <div className="mt-16 grid grid-cols-2 gap-8">
          <div className="bg-zinc-900 p-6 rounded-2xl">
            <div className="text-sm opacity-60">
              NOTE
            </div>

            <div className="text-7xl font-bold mt-2">
              {note}
            </div>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <div className="text-sm opacity-60">
              SCORE
            </div>

            <div className="text-7xl font-bold mt-2">
              {score}
            </div>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <div className="text-sm opacity-60">
              PITCH
            </div>

            <div className="text-4xl mt-2">
              {pitch
                ? `${pitch.toFixed(
                    2
                  )} Hz`
                : "--"}
            </div>
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            <div className="text-sm opacity-60">
              CLARITY
            </div>

            <div className="text-4xl mt-2">
              {clarity.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}