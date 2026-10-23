import { pitchClass, type Pitch } from './pitch'

// Label for a C key, with C4 = MIDI 60 and C3 = 48.
export const octaveLabel = (p: Pitch): string => `C${Math.floor(p / 12) - 1}`

const LETTERS = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']

// One name per string, low to high; a string whose class repeats a lower string is lowercased.
export function stringNames(tuning: readonly Pitch[]): string[] {
  const seen = new Set<number>()
  return tuning.map((p) => {
    const cls = pitchClass(p)
    const name = LETTERS[cls]!
    const repeat = seen.has(cls)
    seen.add(cls)
    return repeat ? name.toLowerCase() : name
  })
}
