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

const CHORD_STEPS = [0, 2, 4, 6]

// Letters spanned by each interval, counting both ends (a fifth spans five).
const SIZES = [1, 2, 2, 3, 3, 4, 4, 5, 6, 6, 7, 7, 8]

const ACCIDENTALS: Readonly<Record<number, string>> = { [-1]: '♭', 0: '', 1: '♯' }

// The enharmonic twin of each default sharp or flat root.
const TWIN_NAMES: Readonly<Record<number, string>> = { 1: 'D♭', 3: 'D♯', 6: 'G♭', 8: 'G♯', 10: 'A♯' }

// The letter stepped from a root letter, and its offset from the sounded class; 2 or -2 means a double accidental.
function offsetOf(letter: number, sounded: number): number {
  let offset = sounded - NATURAL_CLASSES[letter]!
  if (offset > 6) offset -= 12
  if (offset < -6) offset += 12
  return offset
}

// A note name that never carries a double accidental: the default table name takes over.
function singleName(letter: number, sounded: number): string {
  const offset = offsetOf(letter, sounded)
  return ACCIDENTALS[offset] === undefined ? ROOT_NAMES[sounded]! : `${NATURALS[letter]}${ACCIDENTALS[offset]}`
}

// A root takes its twin only when the default needs a double and the twin does not.
function needsDouble(rootName: string, reading: ChordReading): boolean {
  const rootLetter = NATURALS.indexOf(rootName[0]!)
  return reading.quality.intervals.some((semitones, i) => {
    const letter = (rootLetter + (CHORD_STEPS[i] ?? 0)) % 7
    return ACCIDENTALS[offsetOf(letter, (reading.root + semitones) % 12)] === undefined
  })
}

// The one decision of how a chord root is written: the default name, or its twin when the default needs a double.
export function spelledRoot(reading: ChordReading): string {
  const name = ROOT_NAMES[reading.root]!
  const twin = TWIN_NAMES[reading.root]
  return twin !== undefined && needsDouble(name, reading) && !needsDouble(twin, reading) ? twin : name
}

export interface SpelledInterval {
  readonly root: string
  readonly upper: string
}

// The upper note's letter is the root's letter stepped by the interval size; one that would need a double takes its table name.
export function spellInterval(root: Pitch, semitones: Interval): SpelledInterval {
  const rootName = ROOT_NAMES[pitchClass(root)]!
  const rootLetter = NATURALS.indexOf(rootName[0]!)
  const letter = (rootLetter + (SIZES[semitones] ?? 1) - 1) % 7
  const target = pitchClass((root + semitones) as Pitch)
  return { root: rootName, upper: singleName(letter, target) }
}

// The tones of a reading, each spelled by stepping letters from the spelled root, never with a double accidental.
export function spellChord(reading: ChordReading): string[] {
  const rootName = spelledRoot(reading)
  const rootLetter = NATURALS.indexOf(rootName[0]!)
  return reading.quality.intervals.map((semitones, i) => {
    if (i === 0) return rootName
    const letter = (rootLetter + (CHORD_STEPS[i] ?? 0)) % 7
    return singleName(letter, (reading.root + semitones) % 12)
  })
}

// Root, quality symbol and, for an inversion, the bass after a slash (default table).
export function chordSymbol(reading: ChordReading): string {
  const bass = reading.bass === undefined ? '' : `/${ROOT_NAMES[reading.bass]!}`
  return `${spelledRoot(reading)}${reading.quality.symbol}${bass}`
}

// The reading as screen reader text: `C major`, `A min7 over C`.
export function chordSpoken(reading: ChordReading): string {
  const bass = reading.bass === undefined ? '' : ` over ${ROOT_NAMES[reading.bass]!}`
  return `${spelledRoot(reading)} ${reading.quality.name}${bass}`
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
