import { INSTRUMENT_RANGES } from './instruments'
import { pitch, pitchClass, type Pitch } from './pitch'

export const WINDOW_SEMITONES = 36
export const DEFAULT_WINDOW_START = 48

const MIN_START = INSTRUMENT_RANGES.piano.low
const MAX_START = INSTRUMENT_RANGES.piano.high - WINDOW_SEMITONES
const BLACK_CLASSES = new Set([1, 3, 6, 8, 10])

export const isBlackKey = (p: Pitch): boolean => BLACK_CLASSES.has(pitchClass(p))

export function windowPitches(start: number): Pitch[] {
  return Array.from({ length: WINDOW_SEMITONES }, (_, i) => pitch(start + i))
}

// Moves the window one octave and keeps it inside the piano range.
export function shiftWindow(start: number, direction: 1 | -1): number {
  return Math.min(MAX_START, Math.max(MIN_START, start + direction * 12))
}

export interface OffscreenLit {
  readonly below: number
  readonly above: number
}

export function offscreenLit(lit: readonly Pitch[], start: number): OffscreenLit {
  const distinct = new Set(lit)
  let below = 0
  let above = 0
  for (const p of distinct) {
    if (p < start) below++
    else if (p >= start + WINDOW_SEMITONES) above++
  }
  return { below, above }
}

export function offscreenNote({ below, above }: OffscreenLit): string | undefined {
  const count = (n: number) => `${n} ${n === 1 ? 'note' : 'notes'} lit`
  const parts: string[] = []
  if (below > 0) parts.push(`◀ ${count(below)}`)
  if (above > 0) parts.push(`${count(above)} ▶`)
  return parts.length > 0 ? parts.join(' · ') : undefined
}
