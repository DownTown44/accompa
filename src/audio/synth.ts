import type { Pitch } from '../core/pitch'
import type { AudioEngine, AudioStatus, PlayMode } from './engine'

const LEAD_IN = 0.03
const ARPEGGIO_STEP = 0.55
const NOTE_LENGTH = 1.2
const ATTACK = 0.015
const PEAK_GAIN = 0.3
const FLOOR_GAIN = 0.0001

const frequency = (p: Pitch) => 440 * 2 ** ((p - 69) / 12)

export function createSynthEngine(createContext: () => AudioContext = () => new AudioContext()): AudioEngine {
  let context: AudioContext | null = null
  let status: AudioStatus = 'idle'
  let sounding: OscillatorNode[] = []
  // Bumped by play and stop so a request still waiting on resume cannot start late.
  let generation = 0
  const listeners = new Set<() => void>()

  function setStatus(next: AudioStatus) {
    if (next === status) return
    status = next
    listeners.forEach((listener) => listener())
  }

  function refresh() {
    if (context) setStatus(context.state === 'running' ? 'running' : 'blocked')
  }

  function ensureContext(): AudioContext | null {
    if (context) return context
    try {
      context = createContext()
      context.onstatechange = refresh
      return context
    } catch {
      setStatus('blocked')
      return null
    }
  }

  // Runs the callback once the context is running; reports blocked when it cannot be.
  function whenRunning(ctx: AudioContext, callback: () => void) {
    const requested = generation
    if (ctx.state === 'running') {
      refresh()
      callback()
      return
    }
    ctx.resume().then(
      () => {
        refresh()
        if (ctx.state === 'running' && requested === generation) callback()
      },
      refresh,
    ).catch(() => setStatus('blocked'))
  }

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
      const at = start + (mode === 'arpeggio' ? index * ARPEGGIO_STEP : 0)
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
    play(pitches, mode) {
      const ctx = ensureContext()
      if (!ctx) return
      generation++
      try {
        whenRunning(ctx, () => schedule(ctx, pitches, mode))
      } catch {
        setStatus('blocked')
      }
    },
    stop() {
      generation++
      stopSounding()
    },
    unlock() {
      const ctx = ensureContext()
      if (!ctx) return
      try {
        whenRunning(ctx, () => {})
      } catch {
        setStatus('blocked')
      }
    },
    status: () => status,
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
