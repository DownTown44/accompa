import type { Pitch } from '../core/pitch'
import { createContextGate } from './contextGate'
import type { AudioEngine, PlayMode } from './engine'
import { LEAD_IN, stepFor } from './timing'

const NOTE_LENGTH = 1.2
const ATTACK = 0.015
const PEAK_GAIN = 0.3
const FLOOR_GAIN = 0.0001

const frequency = (p: Pitch) => 440 * 2 ** ((p - 69) / 12)

export function createSynthEngine(createContext: () => AudioContext = () => new AudioContext()): AudioEngine {
  const gate = createContextGate(createContext)
  let sounding: OscillatorNode[] = []

  function stopSounding() {
    for (const oscillator of sounding) {
      try {
        oscillator.stop()
      } catch {
        // already stopped
      }
    }
    sounding = []
  }

  function schedule(ctx: AudioContext, pitches: readonly Pitch[], mode: PlayMode) {
    stopSounding()
    const start = ctx.currentTime + LEAD_IN
    const peak = PEAK_GAIN / Math.sqrt(pitches.length)
    pitches.forEach((p, index) => {
      const step = stepFor(mode)
      const at = start + index * step
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = 'triangle'
      oscillator.frequency.value = frequency(p)
      gain.gain.setValueAtTime(0, at)
      gain.gain.linearRampToValueAtTime(peak, at + ATTACK)
      gain.gain.exponentialRampToValueAtTime(FLOOR_GAIN, at + NOTE_LENGTH)
      oscillator.connect(gain).connect(ctx.destination)
      oscillator.start(at)
      oscillator.stop(at + NOTE_LENGTH + 0.05)
      oscillator.onended = () => {
        sounding = sounding.filter((o) => o !== oscillator)
      }
      sounding.push(oscillator)
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
