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
