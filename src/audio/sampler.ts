import type { Pitch } from '../core/pitch'
import { createContextGate } from './contextGate'
import type { AudioEngine, PlayMode } from './engine'
import { nearestSample, sampleUrl, type SampleSet } from './sampleSets'
import { LEAD_IN, stepFor } from './timing'

// Per-note gain before dividing by the square root of the note count. Tuned by ear.
export const SAMPLE_GAIN = 0.8

export type SampleLoader = (url: string) => Promise<ArrayBuffer>
export type SampleDecoder = (data: ArrayBuffer) => Promise<AudioBuffer>

const fetchBytes: SampleLoader = async (url) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url}: ${response.status}`)
  return response.arrayBuffer()
}

// A short offline context decodes without a gesture; the buffers play on the live context.
const offlineDecode: SampleDecoder = (data) => new OfflineAudioContext(2, 1, 44100).decodeAudioData(data)

export function createSamplerEngine(
  set: SampleSet,
  createContext: () => AudioContext = () => new AudioContext(),
  load: SampleLoader = fetchBytes,
  decode: SampleDecoder = offlineDecode,
): AudioEngine {
  const gate = createContextGate(createContext)
  const buffers = new Map<string, AudioBuffer>()
  let sounding: AudioBufferSourceNode[] = []

  // A failed fetch or decode leaves that note silent; showing it and falling back are Story 6.4.
  for (const note of set.notes) {
    try {
      load(sampleUrl(set, note.name))
        .then(decode)
        .then((buffer) => {
          buffers.set(note.name, buffer)
        })
        .catch(() => {})
    } catch {
      // a loader that throws synchronously is the same as a failed fetch
    }
  }

  function stopSounding() {
    for (const source of sounding) {
      try {
        source.stop()
      } catch {
        // already stopped
      }
    }
    sounding = []
  }

  function schedule(ctx: AudioContext, pitches: readonly Pitch[], mode: PlayMode) {
    stopSounding()
    const start = ctx.currentTime + LEAD_IN
    const step = stepFor(mode)
    const level = SAMPLE_GAIN / Math.sqrt(pitches.length)
    pitches.forEach((p, index) => {
      const { name, rate } = nearestSample(p, set)
      const buffer = buffers.get(name)
      if (!buffer) return
      const source = ctx.createBufferSource()
      const gain = ctx.createGain()
      source.buffer = buffer
      source.playbackRate.value = rate
      gain.gain.value = level
      source.connect(gain).connect(ctx.destination)
      source.start(start + index * step)
      source.onended = () => {
        sounding = sounding.filter((s) => s !== source)
      }
      sounding.push(source)
    })
  }

  return {
    play(pitches, _instrument, mode) {
      const ctx = gate.ensureContext()
      if (!ctx) return
      gate.invalidate()
      try {
        gate.whenRunning(ctx, () => schedule(ctx, pitches, mode))
      } catch {
        gate.setBlocked()
      }
    },
    stop() {
      gate.invalidate()
      stopSounding()
    },
    unlock() {
      const ctx = gate.ensureContext()
      if (!ctx) return
      try {
        gate.whenRunning(ctx, () => {})
      } catch {
        gate.setBlocked()
      }
    },
    status: gate.status,
    subscribe: gate.subscribe,
  }
}
