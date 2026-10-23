import type { PitchRange } from './instruments'
import type { Question } from './model'
import { pitch, type Interval } from './pitch'

// Returns a number in [0, 1). Randomness is always injected so tests can seed it.
export type Random = () => number

// The pool must hold at least one interval.
export interface QuestionOptions {
  readonly pool: readonly Interval[]
  readonly range: PitchRange
  readonly random: Random
}

const pick = (count: number, random: Random) => Math.min(count - 1, Math.floor(random() * count))

// The interval is drawn first, then a root that keeps both notes inside the range.
export function generateQuestion({ pool, range, random }: QuestionOptions): Question {
  const semitones = pool[pick(pool.length, random)]
  const roots = range.high - semitones - range.low + 1
  const root = pitch(range.low + pick(roots, random))
  return { root, interval: semitones, pitches: [root, pitch(root + semitones)] }
}
