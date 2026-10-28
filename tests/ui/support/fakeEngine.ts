import type { AudioEngine, AudioStatus, PlayMode } from '../../../src/audio/engine'
import type { Pitch } from '../../../src/core/pitch'
import type { Instrument } from '../../../src/core/model'

export interface FakeEngine extends AudioEngine {
  plays: { pitches: readonly Pitch[]; instrument: Instrument; mode: PlayMode }[]
  unlocks: number
  stops: number
  prepares: Instrument[]
  setStatus(next: AudioStatus): void
}

export function createFakeEngine(initial: AudioStatus = 'idle'): FakeEngine {
  let status = initial
  const listeners = new Set<() => void>()
  const engine: FakeEngine = {
    plays: [],
    unlocks: 0,
    stops: 0,
    prepares: [],
    play(pitches, instrument, mode) {
      engine.plays.push({ pitches, instrument, mode })
    },
    stop() {
      engine.stops++
    },
    prepare(instrument) {
      engine.prepares.push(instrument)
    },
    unlock() {
      engine.unlocks++
    },
    status: () => status,
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    setStatus(next) {
      status = next
      listeners.forEach((listener) => listener())
    },
  }
  return engine
}
