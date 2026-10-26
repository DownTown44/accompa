import { GUITAR_FRETS, STANDARD_GUITAR_TUNING } from './instruments'
import { pitchClass, type PitchClass } from './pitch'
import type { ChordQuality } from './theory'

// A common guitar shape as data. `frets` has one entry per string, lowest first: a fret or null (muted).
// A movable shape holds frets relative to its anchor, the lowest sounding string, whose note is the root.
// An open shape holds absolute frets and applies only to its `root`.
export type ShapeTemplate =
  | { readonly quality: string; readonly kind: 'movable'; readonly frets: readonly (number | null)[] }
  | { readonly quality: string; readonly kind: 'open'; readonly root: PitchClass; readonly frets: readonly (number | null)[] }

const parse = (shape: string): (number | null)[] => shape.split(' ').map((f) => (f === 'x' ? null : Number(f)))
const movable = (quality: string, shape: string): ShapeTemplate => ({ quality, kind: 'movable', frets: parse(shape) })
const open = (quality: string, root: number, shape: string): ShapeTemplate => ({ quality, kind: 'open', root: root as PitchClass, frets: parse(shape) })

export const SHAPE_TEMPLATES: readonly ShapeTemplate[] = [
  // E-shape (anchor on the low E string), A-shape (anchor on the A string) and the top triad on G, B and high E.
  movable('major', '0 2 2 1 0 0'),
  movable('major', 'x 0 2 2 2 0'),
  movable('major', 'x x x 0 0 -2'),
  movable('minor', '0 2 2 0 0 0'),
  movable('minor', 'x 0 2 2 1 0'),
  movable('minor', 'x x x 0 -1 -2'),
  movable('dom7', '0 2 0 1 0 0'),
  movable('dom7', 'x 0 2 0 2 0'),
  movable('min7', '0 2 0 0 0 0'),
  movable('min7', 'x 0 2 0 1 0'),
  movable('maj7', '0 2 1 1 0 0'),
  movable('maj7', 'x 0 2 1 2 0'),
  // Open shapes; roots are pitch classes (C 0, D 2, E 4, F 5, G 7, A 9).
  open('major', 0, 'x 3 2 0 1 0'),
  open('major', 9, 'x 0 2 2 2 0'),
  open('major', 7, '3 2 0 0 0 3'),
  open('major', 4, '0 2 2 1 0 0'),
  open('major', 2, 'x x 0 2 3 2'),
  open('minor', 9, 'x 0 2 2 1 0'),
  open('minor', 4, '0 2 2 0 0 0'),
  open('minor', 2, 'x x 0 2 3 1'),
  open('dom7', 0, 'x 3 2 3 1 0'),
  open('dom7', 7, '3 2 0 0 0 1'),
  open('dom7', 2, 'x x 0 2 1 2'),
  open('dom7', 4, '0 2 0 1 0 0'),
  open('dom7', 9, 'x 0 2 0 2 0'),
  open('min7', 9, 'x 0 2 0 1 0'),
  open('min7', 4, '0 2 0 0 0 0'),
  open('min7', 2, 'x x 0 2 1 1'),
  open('maj7', 0, 'x 3 2 0 0 0'),
  open('maj7', 9, 'x 0 2 1 2 0'),
  open('maj7', 5, 'x x 3 2 1 0'),
  open('maj7', 2, 'x x 0 2 2 2'),
]

// The fret arrays of every template instance for the chord's root and quality; empty when the quality has none.
// The templates are for standard tuning.
export function shapeFrets(chord: { readonly root: PitchClass; readonly quality: ChordQuality }): (number | null)[][] {
  const found: (number | null)[][] = []
  for (const template of SHAPE_TEMPLATES) {
    if (template.quality !== chord.quality.name) continue
    if (template.kind === 'open') {
      if (template.root === chord.root) found.push([...template.frets])
      continue
    }
    const anchor = template.frets.findIndex((f) => f !== null)
    const first = (chord.root - pitchClass(STANDARD_GUITAR_TUNING[anchor]!) + 12) % 12 || 12
    // The anchor fret is 1 to 12, and its octave copy 12 frets up while it fits the neck.
    for (const base of [first, first + 12]) {
      const frets = template.frets.map((f) => (f === null ? null : base + f))
      if (frets.every((f) => f === null || (f >= 1 && f <= GUITAR_FRETS))) found.push(frets)
    }
  }
  return found
}
