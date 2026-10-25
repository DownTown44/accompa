import { nameChord } from './chords'
import { closestPair, positionsForPitch, type FretPosition } from './instruments'
import { pitch, pitchClass, type Pitch } from './pitch'
import { chordSpoken, chordSymbol, noteName, spellChord, spellNotes } from './spelling'
import { INTERVALS, type IntervalDefinition } from './theory'

// The most notes Explore keeps lit; the oldest unlights when one more is added.
export const MAX_LIT = 8

// Lights the pitch, or unlights it when it is already lit. The list is ordered oldest first.
export function toggleLit(lit: readonly Pitch[], p: Pitch): Pitch[] {
  if (lit.includes(p)) return lit.filter((q) => q !== p)
  return [...lit, p].slice(-MAX_LIT)
}

// The simple interval between two pitches, lower note first; a multiple of 12 is the octave.
export function pairInterval(a: Pitch, b: Pitch): IntervalDefinition | null {
  const span = Math.abs(a - b)
  if (span === 0) return null
  const simple = span % 12 === 0 ? 12 : span % 12
  return INTERVALS.find((i) => i.semitones === simple) ?? null
}

export interface ExploreReadout {
  readonly label: string
  readonly name?: string
}

// The note's name for one lit note, the interval for two, the chord symbol for three or more
// that form a chord, else their note names; null when nothing is lit.
export function exploreReadout(lit: readonly Pitch[]): ExploreReadout | null {
  if (lit.length === 0) return null
  if (lit.length === 1) return { label: noteName(lit[0]!) }
  if (lit.length === 2) {
    const found = pairInterval(lit[0]!, lit[1]!)
    return found ? { label: found.abbreviation, name: found.name } : null
  }
  const reading = nameChord(lit)[0]
  if (reading) return { label: chordSymbol(reading), name: chordSpoken(reading) }
  return { label: spellNotes(lit).join(' ') }
}

export type Role = 'root' | 'third' | 'fifth' | 'seventh' | 'none'

export interface LegendEntry {
  readonly role: Exclude<Role, 'none'>
  // `root`, `3rd`, `5th` or `7th`.
  readonly label: string
  readonly note: string
  // The chord-degree label from the root (`M3`); absent for the root.
  readonly degree?: string
}

export interface ExploreReading {
  readonly readout: ExploreReadout | null
  // The reading's root: the lowest lit note of its pitch class; the lowest lit note when nothing is named.
  readonly root?: Pitch
  // The role of each lit pitch, aligned with the input.
  readonly roles: readonly Role[]
  readonly legend: readonly LegendEntry[]
}

const STEP_ROLES = ['root', 'third', 'fifth', 'seventh'] as const
const STEP_LABELS = ['root', '3rd', '5th', '7th']

// The one reading of the lit notes: readout, root, each note's role and the legend entries.
export function exploreReading(lit: readonly Pitch[]): ExploreReading {
  const readout = exploreReadout(lit)
  if (lit.length === 0) return { readout, roles: [], legend: [] }
  const lowest = Math.min(...lit) as Pitch
  const reading = lit.length >= 3 ? nameChord(lit)[0] : undefined
  if (!reading) {
    return {
      readout,
      root: lowest,
      roles: lit.map((p) => (p === lowest ? 'root' : 'none')),
      legend: [{ role: 'root', label: 'root', note: noteName(lowest) }],
    }
  }
  const root = Math.min(...lit.filter((p) => pitchClass(p) === reading.root)) as Pitch
  const stepOf = (p: Pitch) => reading.quality.intervals.findIndex((i) => i === (pitchClass(p) - reading.root + 12) % 12)
  const roles = lit.map((p) => STEP_ROLES[stepOf(p)] ?? 'none')
  const spelled = spellChord(reading)
  const legend: LegendEntry[] = []
  reading.quality.intervals.forEach((_, step) => {
    const role = STEP_ROLES[step]!
    if (!roles.includes(role)) return
    legend.push(step === 0 ? { role, label: 'root', note: spelled[0]! } : { role, label: STEP_LABELS[step]!, note: spelled[step]!, degree: reading.quality.degrees[step - 1] })
  })
  return { readout, root, roles, legend }
}

// Remembered fret positions by pitch; plain data.
export type RememberedPositions = Readonly<Record<number, FretPosition>>

const lowestFret = (p: Pitch): FretPosition | null =>
  positionsForPitch(p).reduce<FretPosition | null>((best, pos) => (best === null || pos.fret < best.fret ? pos : best), null)

// Where each lit pitch sits on the guitar, aligned with the pitches: the remembered position,
// else the lowest fret, and the closest pair when two pitches have no remembered position.
export function litPositions(lit: readonly Pitch[], remembered: RememberedPositions): (FretPosition | null)[] {
  const unknown = lit.filter((p) => remembered[p] === undefined)
  const lower = Math.min(...unknown)
  const pair = unknown.length === 2 ? closestPair(pitch(lower), pitch(Math.max(...unknown))) : null
  return lit.map((p) => {
    const known = remembered[p]
    if (known !== undefined) return known
    if (pair) return p === lower ? pair.root : pair.upper
    return lowestFret(p)
  })
}

// How many lit pitches have no place on the guitar, beyond its lowest and highest note.
export function beyondFretboard(lit: readonly Pitch[], remembered: RememberedPositions): number {
  return litPositions(lit, remembered).filter((position) => position === null).length
}

// The Status note for lit notes beyond the guitar; undefined when there are none.
export function beyondFretboardNote(count: number): string | undefined {
  if (count <= 0) return undefined
  return `${count} ${count === 1 ? 'note' : 'notes'} lit beyond the fretboard`
}
