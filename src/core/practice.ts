import type { PitchRange } from './instruments'
import type { ChordQuestion, Direction, Question } from './model'
import { CHORD_QUALITIES } from './theory'
import { pitch, pitchClass, type Interval, type Pitch } from './pitch'

// Returns a number in [0, 1). Randomness is always injected so tests can seed it.
export type Random = () => number

// The pool must hold at least one interval.
export interface QuestionOptions {
  readonly pool: readonly Interval[]
  readonly range: PitchRange
  readonly random: Random
  readonly direction: Direction
  // When given, the root keeps this pitch class, in the octave nearest this pitch where the interval fits.
  readonly fixedRoot?: Pitch | null
}

const pick = (count: number, random: Random) => Math.min(count - 1, Math.floor(random() * count))

// The interval is drawn first, then a lower note that keeps both notes inside the range.
// Descending starts on the upper note, so the root is the note heard first.
export function generateQuestion({ pool, range, random, direction, fixedRoot }: QuestionOptions): Question {
  const semitones = pool[pick(pool.length, random)]
  if (fixedRoot !== undefined && fixedRoot !== null) return fixedRootQuestion(semitones, fixedRoot, range, direction)
  const roots = range.high - semitones - range.low + 1
  const low = pitch(range.low + pick(roots, random))
  const high = pitch(low + semitones)
  if (direction === 'descending') return { direction, root: high, interval: semitones, pitches: [high, low] }
  return { direction, root: low, interval: semitones, pitches: [low, high] }
}

export interface ChordQuestionOptions {
  // Quality names; must hold at least one of the nine.
  readonly pool: readonly string[]
  readonly range: PitchRange
  readonly random: Random
}

// The quality is drawn first (in quality order), then a root so every note fits the range.
export function generateChordQuestion({ pool, range, random }: ChordQuestionOptions): ChordQuestion {
  const qualities = CHORD_QUALITIES.filter((q) => pool.includes(q.name))
  const quality = qualities[pick(qualities.length, random)]!
  const span = quality.intervals[quality.intervals.length - 1]!
  const roots = range.high - span - range.low + 1
  const root = pitch(range.low + pick(roots, random))
  return { root, quality: quality.name, pitches: quality.intervals.map((i) => pitch(root + i)) }
}

// The root is the note heard first; of the matching pitches whose whole interval fits, the one nearest the target wins, ties to the lower.
function fixedRootQuestion(semitones: Interval, target: Pitch, range: PitchRange, direction: Direction): Question {
  const down = direction === 'descending'
  const lowest = down ? range.low + semitones : range.low
  const highest = down ? range.high : range.high - semitones
  const wanted = pitchClass(target)
  let root = -1
  for (let candidate = lowest; candidate <= highest; candidate++) {
    if (pitchClass(pitch(candidate)) !== wanted) continue
    if (root < 0 || Math.abs(candidate - target) < Math.abs(root - target)) root = candidate
  }
  const first = pitch(root)
  const second = pitch(down ? root - semitones : root + semitones)
  return { direction, root: first, interval: semitones, pitches: [first, second] }
}
