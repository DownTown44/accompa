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
