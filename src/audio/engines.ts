import type { Instrument, Sound } from '../core/model'
import type { AudioEngine } from './engine'
import { PIANO_SET } from './sampleSets'
import { createSamplerEngine } from './sampler'
import { createSynthEngine } from './synth'

// Each sound and instrument the app offers, and how to make the engine that plays it.
export const ENGINES: Readonly<Record<Sound, Readonly<Record<Instrument, () => AudioEngine>>>> = {
  samples: { piano: () => createSamplerEngine(PIANO_SET), guitar: createSynthEngine },
  synthesized: { piano: createSynthEngine, guitar: createSynthEngine },
}

// One engine per Sound: it picks the instrument's engine inside play, building each on first use.
// Instruments whose factory is the same function share one instance, so the synth never gets two AudioContexts.
// Status, subscribe and unlock follow the piano's engine until Story 6.4 decides how status follows the instrument.
export function createEngine(sound: Sound): AudioEngine {
  const byFactory = new Map<() => AudioEngine, AudioEngine>()
  const forInstrument = (instrument: Instrument): AudioEngine => {
    const factory = ENGINES[sound][instrument]
    let engine = byFactory.get(factory)
    if (!engine) {
      engine = factory()
      byFactory.set(factory, engine)
    }
    return engine
  }
  // The piano engine is built now, so its sample set starts loading at startup.
  forInstrument('piano')
  return {
    play: (pitches, instrument, mode) => forInstrument(instrument).play(pitches, instrument, mode),
    stop: () => byFactory.forEach((engine) => engine.stop()),
    unlock: () => forInstrument('piano').unlock(),
    status: () => forInstrument('piano').status(),
    subscribe: (listener) => forInstrument('piano').subscribe(listener),
  }
}
