import { interval, type Interval } from './pitch'

export interface IntervalDefinition {
  readonly semitones: Interval
  readonly name: string
  readonly abbreviation: string
}

const define = (semitones: number, name: string, abbreviation: string): IntervalDefinition => ({
  semitones: interval(semitones),
  name,
  abbreviation,
})

export const INTERVALS: readonly IntervalDefinition[] = [
  define(1, 'minor second', 'm2'),
  define(2, 'major second', 'M2'),
  define(3, 'minor third', 'm3'),
  define(4, 'major third', 'M3'),
  define(5, 'perfect fourth', 'P4'),
  define(6, 'augmented fourth', 'A4'),
  define(7, 'perfect fifth', 'P5'),
  define(8, 'minor sixth', 'm6'),
  define(9, 'major sixth', 'M6'),
  define(10, 'minor seventh', 'm7'),
  define(11, 'major seventh', 'M7'),
  define(12, 'perfect octave', 'P8'),
]

export interface ChordQuality {
  readonly name: string
  readonly symbol: string
  // Semitones above the root: the root (0), then the 3rd, 5th and 7th where the quality has them.
  readonly intervals: readonly Interval[]
  // The chord-degree label of each interval above the root (the root has none): m3, M3, d5, P5, A5, d7, m7, M7.
  readonly degrees: readonly string[]
}

// Chord-degree labels by step (3rd, 5th, 7th) and semitones above the root.
const DEGREE_LABELS: readonly Readonly<Record<number, string>>[] = [
  { 3: 'm3', 4: 'M3' },
  { 6: 'd5', 7: 'P5', 8: 'A5' },
  { 9: 'd7', 10: 'm7', 11: 'M7' },
]

const quality = (name: string, symbol: string, stack: readonly number[]): ChordQuality => ({
  name,
  symbol,
  intervals: stack.map(interval),
  degrees: stack.slice(1).map((semitones, i) => DEGREE_LABELS[i]![semitones] ?? ''),
})

export const CHORD_QUALITIES: readonly ChordQuality[] = [
  quality('major', '', [0, 4, 7]),
  quality('minor', 'm', [0, 3, 7]),
  quality('diminished', 'dim', [0, 3, 6]),
  quality('augmented', 'aug', [0, 4, 8]),
  quality('maj7', 'maj7', [0, 4, 7, 11]),
  quality('dom7', '7', [0, 4, 7, 10]),
  quality('min7', 'm7', [0, 3, 7, 10]),
  quality('m7b5', 'm7♭5', [0, 3, 6, 10]),
  quality('dim7', 'dim7', [0, 3, 6, 9]),
]
