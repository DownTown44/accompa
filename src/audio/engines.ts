import type { Sound } from '../core/model'
import type { AudioEngine } from './engine'
import { createSynthEngine } from './synth'

// Each sound the app offers, and how to make the engine that plays it.
export const ENGINES: Readonly<Record<Sound, () => AudioEngine>> = {
  synthesized: createSynthEngine,
}
