import { GUITAR_FRETS, pitchAt, STANDARD_GUITAR_TUNING } from './instruments'
import { pitchClass, type Pitch, type PitchClass } from './pitch'
import type { ChordQuality } from './theory'

// The tunable rules of a playable voicing, kept in one place.
export interface VoicingRules {
  // The widest spread of fretted notes, in frets; open strings are not counted.
  readonly maxSpan: number
  // An open string is allowed only when every fretted note is at or below this fret.
  readonly openPositionMaxFret: number
  // The most fingers a shape may need; see `fingersNeeded`.
  readonly maxFingers: number
  // Chord steps (0 root, 1 3rd, 2 5th, 3 7th) a voicing may leave out, and only on a chord with a 7th; every other step is required.
  readonly droppableSteps: readonly number[]
  // Register distance, in semitones, that one ranking bucket covers.
  readonly bucketWidth: number
}

export const VOICING_RULES: VoicingRules = {
  maxSpan: 4,
  openPositionMaxFret: 5,
  maxFingers: 4,
  droppableSteps: [2],
  bucketWidth: 6,
}

// The frets a voicing may use; an open string is in range only when `low` is 0.
export interface FretRange {
  readonly low: number
  readonly high: number
}

export interface VoicingChord {
  readonly root: PitchClass
  readonly quality: ChordQuality
  // The slash-chord bass; absent when the root is the bass.
  readonly bass?: PitchClass
}

export interface GuitarVoicing {
  // The sounding pitches, bass to treble.
  readonly pitches: readonly Pitch[]
  // One entry per string, lowest string first: a fret (0 is open) or null when muted.
  readonly frets: readonly (number | null)[]
}

// The fingers a shape needs: one per fretted note (fret above 0), except that the notes on the lowest
// fretted fret, when two or more, are one finger (a barre) unless an open string lies between the barre's outer strings.
export function fingersNeeded(frets: readonly (number | null)[]): number {
  const fretted = frets.filter((f): f is number => f !== null && f > 0)
  if (fretted.length === 0) return 0
  const lowest = Math.min(...fretted)
  const on = frets.flatMap((f, s) => (f === lowest ? [s] : []))
  if (on.length < 2) return fretted.length
  const open = frets.some((f, s) => f === 0 && s > on[0]! && s < on[on.length - 1]!)
  return open ? fretted.length : fretted.length - on.length + 1
}

// Every playable voicing of the chord, unranked, in a fixed order (frets ascending, muted last); muted strings only outside the sounding ones; the lowest note is the bass or root when possible; empty when none fits.
export function generateVoicings(
  chord: VoicingChord,
  tuning: readonly Pitch[] = STANDARD_GUITAR_TUNING,
  rules: VoicingRules = VOICING_RULES,
  range: FretRange = { low: 0, high: GUITAR_FRETS },
): GuitarVoicing[] {
  const steps = chord.quality.intervals
  const stepOf = (p: Pitch): number => steps.findIndex((i) => i === (pitchClass(p) - chord.root + 12) % 12)
  const required = steps.reduce((mask, _, step) => (steps.length > 3 && rules.droppableSteps.includes(step) ? mask : mask | (1 << step)), 0)
  const high = Math.min(range.high, GUITAR_FRETS)
  const options = tuning.map((_, string) => {
    const found: { fret: number; step: number }[] = []
    for (let fret = fret0(range); fret <= high; fret++) {
      const step = stepOf(pitchAt(tuning, string, fret))
      if (step >= 0) found.push({ fret, step })
    }
    return found
  })
  const found: GuitarVoicing[] = []
  const frets: (number | null)[] = []
  // `phase`: 0 before the first sounding string, 1 while sounding, 2 after a mute that follows sounding strings.
  const walk = (string: number, min: number, max: number, mask: number, phase: number) => {
    if (string === tuning.length) {
      const open = frets.includes(0)
      if ((mask & required) === required && !(open && max > rules.openPositionMaxFret) && fingersNeeded(frets) <= rules.maxFingers) {
        const pitches = frets.flatMap((fret, s) => (fret === null ? [] : [pitchAt(tuning, s, fret)]))
        found.push({ pitches: pitches.sort((a, b) => a - b), frets: [...frets] })
      }
      return
    }
    frets.push(null)
    for (const { fret, step } of phase === 2 ? [] : options[string]!) {
      const lo = fret > 0 ? Math.min(min, fret) : min
      const hi = fret > 0 ? Math.max(max, fret) : max
      if (fret > 0 && hi - lo > rules.maxSpan) continue
      frets[string] = fret
      walk(string + 1, lo, hi, mask | (1 << step), 1)
    }
    frets[string] = null
    walk(string + 1, min, max, mask, phase === 0 ? 0 : 2)
    frets.pop()
  }
  walk(0, Infinity, -Infinity, 0, 0)
  // The lowest sounding note is the bass (else the root) whenever any voicing allows it.
  const lowest = chord.bass ?? chord.root
  const grounded = found.filter((v) => pitchClass(v.pitches[0]!) === lowest)
  return grounded.length > 0 ? grounded : found
}

// The frets with one string moved to `fret`; null mutes it. Pure; the other strings are kept.
export function moveFret(frets: readonly (number | null)[], string: number, fret: number | null): (number | null)[] {
  return frets.map((f, s) => (s === string ? fret : f))
}

// The sounding pitches of the frets, bass to treble; muted strings are silent, doubled pitches kept.
export function voicingPitches(frets: readonly (number | null)[], tuning: readonly Pitch[] = STANDARD_GUITAR_TUNING): Pitch[] {
  return frets.flatMap((fret, string) => (fret === null ? [] : [pitchAt(tuning, string, fret)])).sort((a, b) => a - b)
}

const fret0 = (range: FretRange) => Math.max(range.low, 0)

// The fretted notes (open strings excluded) as a span and a count of distinct frets.
function shapeOf(v: GuitarVoicing): { span: number; distinct: number } {
  const frets = v.frets.filter((f): f is number => f !== null && f > 0)
  return { span: frets.length === 0 ? 0 : Math.max(...frets) - Math.min(...frets), distinct: new Set(frets).size }
}

// The voicings ordered by register distance bucket, then a common-shape match first, then more sounding strings, then smaller fret span, then fewer distinct
// fretted frets (a barre beats a spread-out shape), then exact distance, then generator order.
// `shapes` are the chord's instantiated common shapes; an open shape (one with an open string) counts only in bucket 0.
export function rankVoicings(
  voicings: readonly GuitarVoicing[],
  sourceMean: number,
  bucketWidth: number = VOICING_RULES.bucketWidth,
  shapes: readonly (readonly (number | null)[])[] = [],
): GuitarVoicing[] {
  return voicings
    .map((v, i) => {
      const distance = Math.abs(mean(v.pitches) - sourceMean)
      const bucket = Math.floor(distance / bucketWidth)
      const match = shapes.some((s) => s.length === v.frets.length && s.every((f, k) => f === v.frets[k]) && (bucket === 0 || !s.includes(0)))
      return { v, i, distance, bucket, match: match ? 0 : 1, ...shapeOf(v) }
    })
    .sort((a, b) => a.bucket - b.bucket || a.match - b.match || b.v.pitches.length - a.v.pitches.length || a.span - b.span || a.distinct - b.distinct || a.distance - b.distance || a.i - b.i)
    .map(({ v }) => v)
}

export const mean = (pitches: readonly number[]): number => pitches.reduce((sum, p) => sum + p, 0) / pitches.length
