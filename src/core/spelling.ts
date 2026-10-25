import { pitchClass, type Interval, type Pitch } from './pitch'
import type { ChordReading } from './chords'

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

const NATURALS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const NATURAL_CLASSES = [0, 2, 4, 5, 7, 9, 11]

// Root spellings by pitch class; the table keeps C♯ and F♯ where a flat twin exists.
const ROOT_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B']

// The note's name without an octave.
export const noteName = (p: Pitch): string => ROOT_NAMES[pitchClass(p)]!

// Letters spanned by each interval, counting both ends (a fifth spans five).
const SIZES = [1, 2, 2, 3, 3, 4, 4, 5, 6, 6, 7, 7, 8]

const ACCIDENTALS: Readonly<Record<number, string>> = { [-2]: '𝄫', [-1]: '♭', 0: '', 1: '♯', 2: '𝄪' }

export interface SpelledInterval {
  readonly root: string
  readonly upper: string
}

// The upper note's letter is the root's letter stepped by the interval size; 6 semitones is always A4.
export function spellInterval(root: Pitch, semitones: Interval): SpelledInterval {
  const rootName = ROOT_NAMES[pitchClass(root)]!
  const rootLetter = NATURALS.indexOf(rootName[0]!)
  const letter = (rootLetter + (SIZES[semitones] ?? 1) - 1) % 7
  const target = pitchClass((root + semitones) as Pitch)
  let offset = target - NATURAL_CLASSES[letter]!
  if (offset > 6) offset -= 12
  if (offset < -6) offset += 12
  return { root: rootName, upper: `${NATURALS[letter]}${ACCIDENTALS[offset] ?? ''}` }
}

const CHORD_STEPS = [0, 2, 4, 6]

// The tones of a reading, each spelled by stepping letters from the spelled root.
export function spellChord(reading: ChordReading): string[] {
  const rootLetter = NATURALS.indexOf(ROOT_NAMES[reading.root]![0]!)
  return reading.quality.intervals.map((semitones, i) => {
    const letter = (rootLetter + (CHORD_STEPS[i] ?? 0)) % 7
    let offset = ((reading.root + semitones) % 12) - NATURAL_CLASSES[letter]!
    if (offset > 6) offset -= 12
    if (offset < -6) offset += 12
    return `${NATURALS[letter]}${ACCIDENTALS[offset] ?? ''}`
  })
}

// Root, quality symbol and, for an inversion, the bass after a slash.
export function chordSymbol(reading: ChordReading): string {
  const bass = reading.bass === undefined ? '' : `/${ROOT_NAMES[reading.bass]!}`
  return `${ROOT_NAMES[reading.root]!}${reading.quality.symbol}${bass}`
}

// The reading as screen reader text: `C major`, `A min7 over C`.
export function chordSpoken(reading: ChordReading): string {
  const bass = reading.bass === undefined ? '' : ` over ${ROOT_NAMES[reading.bass]!}`
  return `${ROOT_NAMES[reading.root]!} ${reading.quality.name}${bass}`
}

// Distinct note names, low to high, for a set no chord name fits.
export function spellNotes(pitches: readonly Pitch[]): string[] {
  const names: string[] = []
  for (const p of [...pitches].sort((a, b) => a - b)) {
    const name = noteName(p)
    if (!names.includes(name)) names.push(name)
  }
  return names
}
