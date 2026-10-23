import type { Instrument } from './model'
import type { Pitch } from './pitch'
import { pitch } from './pitch'

export interface PitchRange {
  readonly low: number
  readonly high: number
}

// Open strings, low to high: E2 A2 D3 G3 B3 E4.
export const STANDARD_GUITAR_TUNING: readonly Pitch[] = [40, 45, 50, 55, 59, 64].map(pitch)
export const GUITAR_FRETS = 22

export const INSTRUMENT_RANGES: Readonly<Record<Instrument, PitchRange>> = {
  piano: { low: 36, high: 96 },
  guitar: {
    low: Math.min(...STANDARD_GUITAR_TUNING),
    high: Math.max(...STANDARD_GUITAR_TUNING) + GUITAR_FRETS,
  },
}

// A practice question is kept when the instrument swaps, so it must fit both instruments.
export const COMMON_RANGE: PitchRange = {
  low: Math.max(...Object.values(INSTRUMENT_RANGES).map((range) => range.low)),
  high: Math.min(...Object.values(INSTRUMENT_RANGES).map((range) => range.high)),
}

export interface FretPosition {
  readonly string: number
  readonly fret: number
}

// String 0 is the lowest-sounding string.
export const pitchAt = (tuning: readonly Pitch[], string: number, fret: number): Pitch => pitch(tuning[string]! + fret)

// Every string and fret that sounds the pitch, low string first.
export function positionsForPitch(
  p: Pitch,
  tuning: readonly Pitch[] = STANDARD_GUITAR_TUNING,
  frets: number = GUITAR_FRETS,
): FretPosition[] {
  const found: FretPosition[] = []
  tuning.forEach((open, string) => {
    const fret = p - open
    if (fret >= 0 && fret <= frets) found.push({ string, fret })
  })
  return found
}

export interface PositionPair {
  readonly root: FretPosition
  readonly upper: FretPosition
}

// The closest position for each note, by fret plus string distance, then the lowest frets.
export function closestPair(
  root: Pitch,
  upper: Pitch,
  tuning: readonly Pitch[] = STANDARD_GUITAR_TUNING,
  frets: number = GUITAR_FRETS,
): PositionPair | null {
  let best: PositionPair | null = null
  let bestScore: [number, number] = [Infinity, Infinity]
  for (const a of positionsForPitch(root, tuning, frets)) {
    for (const b of positionsForPitch(upper, tuning, frets)) {
      const score: [number, number] = [Math.abs(a.fret - b.fret) + Math.abs(a.string - b.string), a.fret + b.fret]
      if (score[0] < bestScore[0] || (score[0] === bestScore[0] && score[1] < bestScore[1])) {
        best = { root: a, upper: b }
        bestScore = score
      }
    }
  }
  return best
}
