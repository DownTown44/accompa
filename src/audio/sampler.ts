import type { Pitch } from '../core/pitch'
import { createContextGate } from './contextGate'
import type { AudioEngine, AudioStatus, LoadMemory, PlayMode } from './engine'
import { nearestSample, sampleUrl, type SampleSet } from './sampleSets'
import { LEAD_IN, stepFor } from './timing'

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
  memory: LoadMemory = new Set(),
): AudioEngine {
  const gate = createContextGate(createContext)
  const buffers = new Map<string, AudioBuffer>()
  let sounding: AudioBufferSourceNode[] = []

  // A set remembered as failed never fetches again this session.
  let loadState: 'idle' | 'loading' | 'ready' | 'failed' = memory.has(set.directory) ? 'failed' : 'idle'
  const loadListeners = new Set<() => void>()
  const notifyLoad = () => loadListeners.forEach((listener) => listener())

  function fail() {
    if (loadState === 'failed') return
    loadState = 'failed'
    memory.add(set.directory)
    buffers.clear()
    notifyLoad()
  }

  // Loads and decodes the set once; the set is all-or-nothing, so any file failing marks it failed.
  function prepare() {
    if (loadState !== 'idle') return
    loadState = 'loading'
    notifyLoad()
    let pending = set.notes.length
    for (const note of set.notes) {
      try {
        load(sampleUrl(set, note.name))
          .then(decode)
          .then((buffer) => {
            if (loadState !== 'loading') return
            buffers.set(note.name, buffer)
            if (--pending === 0) {
              loadState = 'ready'
              notifyLoad()
            }
          })
          .catch(fail)
      } catch {
        // a loader that throws synchronously is the same as a failed fetch
        fail()
      }
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
    const level = set.gain / Math.sqrt(pitches.length)
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
    prepare() {
      prepare()
    },
    play(pitches, _instrument, mode) {
      prepare()
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
    ready: () => loadState !== 'loading' && loadState !== 'failed',
    status(): AudioStatus {
      const gated = gate.status()
      if (gated === 'blocked') return 'blocked'
      if (loadState === 'loading') return 'loading'
      if (loadState === 'failed') return 'failed'
      return gated
    },
    subscribe(listener) {
      loadListeners.add(listener)
      const unsubscribeGate = gate.subscribe(listener)
      return () => {
        loadListeners.delete(listener)
        unsubscribeGate()
      }
    },
  }
}
