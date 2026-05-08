// public/worklets/pitch-processor.js

function autoCorrelate(buffer, sampleRate) {
  const SIZE = buffer.length

  let rms = 0

  for (let i = 0; i < SIZE; i++) {
    const val = buffer[i]
    rms += val * val
  }

  rms = Math.sqrt(rms / SIZE)

  // silence
  if (rms < 0.01) {
    return null
  }

  let r1 = 0
  let r2 = SIZE - 1
  const threshold = 0.2

  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buffer[i]) < threshold) {
      r1 = i
      break
    }
  }

  for (let i = 1; i < SIZE / 2; i++) {
    if (
      Math.abs(buffer[SIZE - i]) < threshold
    ) {
      r2 = SIZE - i
      break
    }
  }

  buffer = buffer.slice(r1, r2)

  const newSize = buffer.length

  const c = new Array(newSize).fill(0)

  for (let i = 0; i < newSize; i++) {
    for (
      let j = 0;
      j < newSize - i;
      j++
    ) {
      c[i] += buffer[j] * buffer[j + i]
    }
  }

  let d = 0

  while (c[d] > c[d + 1]) {
    d++
  }

  let maxValue = -1
  let maxIndex = -1

  for (let i = d; i < newSize; i++) {
    if (c[i] > maxValue) {
      maxValue = c[i]
      maxIndex = i
    }
  }

  let T0 = maxIndex

  const x1 = c[T0 - 1]
  const x2 = c[T0]
  const x3 = c[T0 + 1]

  const a = (x1 + x3 - 2 * x2) / 2
  const b = (x3 - x1) / 2

  if (a) {
    T0 = T0 - b / (2 * a)
  }

  return sampleRate / T0
}

class PitchProcessor extends AudioWorkletProcessor {
  constructor() {
    super()

    this.buffer = []

    this.windowSize = 1024

    this.lastPitch = null
  }

  process(inputs) {
    const input = inputs[0][0]

    if (!input) return true

    for (let i = 0; i < input.length; i++) {
      this.buffer.push(input[i])
    }

    // 10ms @ 48khz
    const hopSize = 480

    while (
      this.buffer.length >= this.windowSize
    ) {
      const frame = this.buffer.slice(
        0,
        this.windowSize
      )

      const pitch = autoCorrelate(
        frame,
        sampleRate
      )

      let smoothedPitch = pitch

      if (
        this.lastPitch &&
        pitch &&
        Math.abs(
          pitch - this.lastPitch
        ) < 40
      ) {
        smoothedPitch =
          this.lastPitch * 0.7 +
          pitch * 0.3
      }

      if (pitch) {
        this.lastPitch = smoothedPitch
      }

      this.port.postMessage({
        pitch: smoothedPitch,
        time: currentTime
      })

      this.buffer = this.buffer.slice(
        hopSize
      )
    }

    return true
  }
}

registerProcessor(
  "pitch-processor",
  PitchProcessor
)