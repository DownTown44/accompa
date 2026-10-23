import type { AudioEngine, AudioStatus, PlayMode } from '../../src/audio/engine'
import type { Pitch } from '../../src/core/pitch'

export interface FakeEngine extends AudioEngine {
  plays: { pitches: readonly Pitch[]; mode: PlayMode }[]
  unlocks: number
  setStatus(next: AudioStatus): void
}

export function createFakeEngine(initial: AudioStatus = 'idle'): FakeEngine {
  let status = initial
  const listeners = new Set<() => void>()
  const engine: FakeEngine = {
    plays: [],
    unlocks: 0,
    play(pitches, mode) {
      engine.plays.push({ pitches, mode })
    },
    stop() {},
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
