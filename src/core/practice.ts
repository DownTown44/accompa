import type { PitchRange } from './instruments'
import type { Direction, Question } from './model'
import { pitch, type Interval } from './pitch'

// Returns a number in [0, 1). Randomness is always injected so tests can seed it.
export type Random = () => number

// The pool must hold at least one interval.
export interface QuestionOptions {
  readonly pool: readonly Interval[]
  readonly range: PitchRange
  readonly random: Random
  readonly direction: Direction
}

const pick = (count: number, random: Random) => Math.min(count - 1, Math.floor(random() * count))

// The interval is drawn first, then a lower note that keeps both notes inside the range.
// Descending starts on the upper note, so the root is the note heard first.
export function generateQuestion({ pool, range, random, direction }: QuestionOptions): Question {
  const semitones = pool[pick(pool.length, random)]
  const roots = range.high - semitones - range.low + 1
  const low = pitch(range.low + pick(roots, random))
  const high = pitch(low + semitones)
  if (direction === 'descending') return { direction, root: high, interval: semitones, pitches: [high, low] }
  return { direction, root: low, interval: semitones, pitches: [low, high] }
}
