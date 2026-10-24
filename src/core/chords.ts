import { pitchClass, type Pitch, type PitchClass } from './pitch'
import { CHORD_QUALITIES, type ChordQuality } from './theory'

export interface ChordReading {
  readonly root: PitchClass
  readonly quality: ChordQuality
  readonly bass?: PitchClass
}

// Every chord reading of the pitches: lowest note as root first, then the other roots low to high.
export function nameChord(pitches: readonly Pitch[]): ChordReading[] {
  const sorted = [...pitches].sort((a, b) => a - b)
  const classes: PitchClass[] = []
  for (const p of sorted) {
    const c = pitchClass(p)
    if (!classes.includes(c)) classes.push(c)
  }
  if (classes.length < 3) return []
  const bass = classes[0]!
  const readings: ChordReading[] = []
  for (const root of classes) {
    const offsets = new Set(classes.map((c) => (c - root + 12) % 12))
    for (const quality of CHORD_QUALITIES) {
      if (quality.intervals.length !== offsets.size || !quality.intervals.every((i) => offsets.has(i))) continue
      readings.push(root === bass ? { root, quality } : { root, quality, bass })
    }
  }
  return readings
}
