import type { FretPosition } from './instruments'
import type { Interval, Pitch, PitchClass } from './pitch'
import { CHORD_QUALITIES, INTERVALS } from './theory'

export type Instrument = 'piano' | 'guitar'

export type Direction = 'ascending' | 'descending' | 'harmonic'

export type RootMode = 'random' | 'fixed'

export interface Question {
  readonly direction: Direction
  readonly root: Pitch
  readonly interval: Interval
  readonly pitches: readonly Pitch[]
}

// A chord question: a root-position chord, close, low to high.
export interface ChordQuestion {
  readonly root: Pitch
  readonly quality: string
  readonly pitches: readonly Pitch[]
}

export type PracticeKind = 'intervals' | 'chords'

// A chord reading picked by the user: its root pitch class and quality name. The bass follows from the notes.
export interface ReadingChoice {
  readonly root: PitchClass
  readonly quality: string
}

// Written only by Explore actions (builder, free play, voicing editing).
export interface Workspace {
  // Lit notes, oldest first.
  readonly pitches: readonly Pitch[]
  // The guitar position each pitch was lit at, where it was lit on the guitar.
  readonly positions: Readonly<Record<number, FretPosition>>
  // The chord reading chosen among the namer's readings; absent means the first. Not persisted.
  readonly reading?: ReadingChoice
  // The lit pitch the user made the root; wins over the reading's root. Not persisted.
  readonly root?: Pitch
  // The guitar voicing the user stepped to, as its frets; absent means the best-ranked. Not persisted.
  // With `edited`, these are the hand-edited frets and `pitches` are the sounding pitches.
  readonly voicing?: readonly (number | null)[]
  readonly edited?: true
}

// Written only by practice rounds; never touches the workspace.
export interface Practice {
  readonly question: Question | null
  // The chord practice question; the interval question is never read or cleared by chord practice.
  // Absent until the first chord is drawn.
  readonly chordQuestion?: ChordQuestion
  // Qualities guessed wrongly for the current chord; cleared when a new chord is drawn.
  // Absent until the first wrong guess, so interval-only practice state is unchanged.
  readonly chordWrongMarks?: readonly string[]
  // The chord question has been revealed; separate from `revealed`, which belongs to the interval question.
  // Absent until the first chord reveal, so interval-only practice state is unchanged.
  readonly chordRevealed?: boolean
  readonly revealed: boolean
  readonly wrongMarks: readonly Interval[]
  // The pitch chosen as the root in Fixed mode; its pitch class roots every later question.
  readonly fixedRoot: Pitch | null
}

export const initialWorkspace: Workspace = { pitches: [], positions: {} }

export const initialPractice: Practice = {
  question: null,
  revealed: false,
  wrongMarks: [],
  fixedRoot: null,
}

export type Sound = 'samples' | 'synthesized'

export type Theme = 'system' | 'light' | 'dark'

// What the user chooses before practising; practice kind, interval and chord pools, direction, root mode, how they sound and how the app looks.
export interface Settings {
  // Intervals or chords; never saved.
  readonly practice: PracticeKind
  readonly pool: readonly Interval[]
  // Names of the chord qualities in play, in quality order; never saved.
  readonly chordPool: readonly string[]
  readonly direction: Direction
  readonly rootMode: RootMode
  readonly sound: Sound
  readonly theme: Theme
}

export const initialSettings: Settings = {
  practice: 'intervals',
  pool: INTERVALS.map((i) => i.semitones),
  chordPool: CHORD_QUALITIES.map((q) => q.name),
  direction: 'ascending',
  rootMode: 'random',
  sound: 'samples',
  theme: 'system',
}
