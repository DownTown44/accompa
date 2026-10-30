import type { Instrument, Sound } from '../core/model'
import type { AudioEngine, LoadMemory } from './engine'
import { GUITAR_SET, PIANO_SET } from './sampleSets'
import { createSamplerEngine } from './sampler'
import { createSynthEngine } from './synth'

// Each sound and instrument the app offers, and how to make the engine that plays it.
const synth = () => createSynthEngine()

export const ENGINES: Readonly<Record<Sound, Readonly<Record<Instrument, (memory?: LoadMemory) => AudioEngine>>>> = {
  samples: {
    piano: (memory) => createSamplerEngine(PIANO_SET, undefined, undefined, undefined, memory),
    guitar: (memory) => createSamplerEngine(GUITAR_SET, undefined, undefined, undefined, memory),
  },
  synthesized: { piano: synth, guitar: synth },
}

// One engine per Sound: it picks the instrument's engine inside play, building each on first use.
// Instruments whose factory is the same function share one instance, so the synth never gets two AudioContexts.
// Status and subscribe follow the active instrument's engine, which the shell names through prepare.
// A set that is loading or failed plays through a synth built on first need and shared by both instruments; the memory keeps failures across routers.
export function createEngine(sound: Sound, memory: LoadMemory = new Set()): AudioEngine {
  const byFactory = new Map<(memory?: LoadMemory) => AudioEngine, AudioEngine>()
  const build = (factory: (memory?: LoadMemory) => AudioEngine): AudioEngine => {
    let engine = byFactory.get(factory)
    if (!engine) {
      engine = factory(memory)
      byFactory.set(factory, engine)
    }
    return engine
  }
  const forInstrument = (instrument: Instrument): AudioEngine => build(ENGINES[sound][instrument])
  let active: Instrument = 'piano'
  const listeners = new Set<() => void>()
  let detach: (() => void) | null = null
  const notify = () => listeners.forEach((listener) => listener())
  const attach = () => {
    detach?.()
    detach = listeners.size > 0 ? forInstrument(active).subscribe(notify) : null
  }
  return {
    prepare(instrument) {
      const changed = instrument !== active
      active = instrument
      const engine = forInstrument(instrument)
      engine.prepare?.(instrument)
      if (changed) {
        attach()
        notify()
      }
    },
    play(pitches, instrument, mode) {
      const chosen = forInstrument(instrument)
      chosen.prepare?.(instrument)
      const engine = chosen.ready?.() === false ? build(synth) : chosen
      byFactory.forEach((other) => {
        if (other !== engine) other.stop()
      })
      engine.play(pitches, instrument, mode)
    },
    stop: () => byFactory.forEach((engine) => engine.stop()),
    unlock() {
      forInstrument(active)
      byFactory.forEach((engine) => engine.unlock())
    },
    status: () => forInstrument(active).status(),
    subscribe(listener) {
      listeners.add(listener)
      if (listeners.size === 1) attach()
      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) attach()
      }
    },
  }
}
