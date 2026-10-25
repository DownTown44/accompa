import { nameChord, type ChordReading } from './chords'
import type { ReadingChoice } from './model'
import { positionsForPitch, STANDARD_GUITAR_TUNING, type FretPosition } from './instruments'
import { pitchClass, type Pitch } from './pitch'
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

// The identity of a reading: root pitch class and quality name.
export const readingChoice = (reading: ChordReading): ReadingChoice => ({ root: reading.root, quality: reading.quality.name })

// Two choices are the same when root and quality are equal.
export const sameChoice = (a: ReadingChoice, b: ReadingChoice): boolean => a.root === b.root && a.quality === b.quality

export const isReading = (reading: ChordReading, choice: ReadingChoice): boolean => sameChoice(readingChoice(reading), choice)

// The namer reading whose root is the pitch's class, if any.
export const readingRootedOn = (lit: readonly Pitch[], p: Pitch): ChordReading | undefined =>
  nameChord(lit).find((r) => r.root === pitchClass(p))

// The readings of the lit notes with the chosen one first, the others in namer order;
// the first reading leads when nothing is chosen or the chosen one is no longer named.
export function orderedReadings(lit: readonly Pitch[], chosen?: ReadingChoice): ChordReading[] {
  const readings = nameChord(lit)
  const at = chosen ? readings.findIndex((r) => isReading(r, chosen)) : -1
  return at <= 0 ? readings : [readings[at]!, ...readings.filter((_, i) => i !== at)]
}

// The chosen root counts only while that pitch is lit.
const litRoot = (lit: readonly Pitch[], root?: Pitch): Pitch | undefined => (root !== undefined && lit.includes(root) ? root : undefined)

// With a root, the one reading rooted on its pitch class leads; none means the set reads as unknown.
function rootedReadings(lit: readonly Pitch[], root: Pitch): ChordReading[] {
  const found = readingRootedOn(lit, root)
  return found ? orderedReadings(lit, readingChoice(found)) : []
}

export interface ReadingOption {
  readonly choice: ReadingChoice
  readonly symbol: string
  readonly spoken: string
}

const toOption = (reading: ChordReading): ReadingOption => ({
  choice: readingChoice(reading),
  symbol: chordSymbol(reading),
  spoken: chordSpoken(reading),
})

export interface ExploreReadout {
  readonly label: string
  readonly name?: string
}

// The note's name for one lit note, the interval for two, the chord symbol for three or more
// that form a chord, else their note names; null when nothing is lit.
export function exploreReadout(lit: readonly Pitch[], chosen?: ReadingChoice, root?: Pitch): ExploreReadout | null {
  if (lit.length === 0) return null
  if (lit.length === 1) return { label: noteName(lit[0]!) }
  if (lit.length === 2) {
    const found = pairInterval(lit[0]!, lit[1]!)
    return found ? { label: found.abbreviation, name: found.name } : null
  }
  const rooted = litRoot(lit, root)
  const reading = (rooted === undefined ? orderedReadings(lit, chosen) : rootedReadings(lit, rooted))[0]
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
  // Every reading, the one shown large first; empty under three pitch classes or when nothing is named.
  readonly readings: readonly ReadingOption[]
  // The readings other than the large one, in namer order.
  readonly alternatives: readonly ReadingOption[]
}

const STEP_ROLES = ['root', 'third', 'fifth', 'seventh'] as const
const STEP_LABELS = ['root', '3rd', '5th', '7th']

// The one reading of the lit notes: readout, root, each note's role and the legend entries.
// A chosen root wins over the reading choice; a root that roots no reading makes the set unknown.
export function exploreReading(lit: readonly Pitch[], chosen?: ReadingChoice, root?: Pitch): ExploreReading {
  const readout = exploreReadout(lit, chosen, root)
  if (lit.length === 0) return { readout, roles: [], legend: [], readings: [], alternatives: [] }
  const lowest = Math.min(...lit) as Pitch
  const rooted = litRoot(lit, root)
  const ordered = lit.length < 3 ? [] : rooted === undefined ? orderedReadings(lit, chosen) : rootedReadings(lit, rooted)
  const reading = ordered[0]
  if (!reading) {
    const marked = rooted ?? lowest
    const all = rooted !== undefined && lit.length >= 3 ? nameChord(lit).map(toOption) : []
    return {
      readout,
      root: marked,
      roles: lit.map((p) => (p === marked ? 'root' : 'none')),
      legend: [{ role: 'root', label: 'root', note: noteName(marked) }],
      readings: all,
      alternatives: all,
    }
  }
  const markedRoot = rooted ?? (Math.min(...lit.filter((p) => pitchClass(p) === reading.root)) as Pitch)
  const stepOf = (p: Pitch) => reading.quality.intervals.findIndex((i) => i === (pitchClass(p) - reading.root + 12) % 12)
  const roles = lit.map((p) => STEP_ROLES[stepOf(p)] ?? 'none')
  const spelled = spellChord(reading)
  const legend: LegendEntry[] = []
  reading.quality.intervals.forEach((_, step) => {
    const role = STEP_ROLES[step]!
    if (!roles.includes(role)) return
    legend.push(step === 0 ? { role, label: 'root', note: spelled[0]! } : { role, label: STEP_LABELS[step]!, note: spelled[step]!, degree: reading.quality.degrees[step - 1] })
  })
  const readings = ordered.map(toOption)
  return { readout, root: markedRoot, roles, legend, readings, alternatives: readings.slice(1) }
}

// Remembered fret positions by pitch; plain data.
export type RememberedPositions = Readonly<Record<number, FretPosition>>

export interface LitPlacement {
  // Aligned with the lit pitches; null for a note beyond the fretboard or one left out.
  readonly positions: (FretPosition | null)[]
  // Lit pitches that found no free string, in lit order; with more notes than strings, the newest go first.
  readonly leftOut: Pitch[]
}

const STRING_COUNT = STANDARD_GUITAR_TUNING.length

// Places the lit pitches one per string. A note keeps its remembered position when that string is
// free; the rest go lower pitch first, each to a free string at its lowest fret. A note with no
// free string is left out, and when more are lit than strings the newest go first.
export function placeLit(lit: readonly Pitch[], remembered: RememberedPositions): LitPlacement {
  const playable = lit.filter((p) => positionsForPitch(p).length > 0)
  const kept = new Set(playable.slice(0, STRING_COUNT))
  const positions = new Map<Pitch, FretPosition>()
  const taken = new Set<number>()
  for (const p of kept) {
    const known = remembered[p]
    if (known === undefined || taken.has(known.string)) continue
    positions.set(p, known)
    taken.add(known.string)
  }
  const fixed = new Set(positions.keys())
  const rest = [...kept].filter((p) => !positions.has(p)).sort((a, b) => a - b)
  const owner = new Map<number, Pitch>()
  for (const [p, pos] of positions) owner.set(pos.string, p)
  const byFret = (p: Pitch) => [...positionsForPitch(p)].sort((a, b) => a.fret - b.fret)
  // Invariant: a failed branch never mutates `positions` or `owner`; `seen` is a visited set that is
  // never backtracked; remembered (fixed) notes are never moved.
  // A note takes its lowest free fret; when every string is taken, a placed note that is not
  // remembered moves to another string to make room.
  const place = (p: Pitch, seen: Set<number>): boolean => {
    const options = byFret(p)
    const free = options.find((pos) => !owner.has(pos.string))
    const target =
      free ??
      options.find((pos) => {
        const other = owner.get(pos.string)!
        if (seen.has(pos.string) || fixed.has(other)) return false
        seen.add(pos.string)
        return place(other, seen)
      })
    if (!target) return false
    positions.set(p, target)
    owner.set(target.string, p)
    return true
  }
  for (const p of rest) place(p, new Set())
  return {
    positions: lit.map((p) => positions.get(p) ?? null),
    leftOut: playable.filter((p) => !positions.has(p)),
  }
}

// Where each lit pitch sits on the guitar, aligned with the pitches; null when beyond or left out.
export const litPositions = (lit: readonly Pitch[], remembered: RememberedPositions): (FretPosition | null)[] =>
  placeLit(lit, remembered).positions

// The lit pitches whose shown position is on the string; notes beyond the fretboard have none.
export function pitchesOnString(lit: readonly Pitch[], remembered: RememberedPositions, string: number): Pitch[] {
  const shown = litPositions(lit, remembered)
  return lit.filter((_, i) => shown[i]?.string === string)
}

// How many lit pitches are beyond the guitar's lowest and highest note.
export const beyondFretboard = (lit: readonly Pitch[]): number => lit.filter((p) => positionsForPitch(p).length === 0).length

// How many lit pitches found no free string.
export const leftOutCount = (lit: readonly Pitch[], remembered: RememberedPositions): number => placeLit(lit, remembered).leftOut.length

const plural = (count: number) => (count === 1 ? 'note' : 'notes')

// The Status note for lit notes beyond the guitar or left out for want of a string; undefined when none.
export function beyondFretboardNote(beyond: number, leftOut = 0): string | undefined {
  if (beyond <= 0 && leftOut <= 0) return undefined
  if (beyond <= 0) return `${leftOut} ${plural(leftOut)} left out: one note per string`
  const lit = `${beyond} ${plural(beyond)} lit beyond the fretboard`
  return leftOut > 0 ? `${lit}, ${leftOut} left out` : lit
}
