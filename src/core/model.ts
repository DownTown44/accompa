import type { FretPosition } from './instruments'
import type { Interval, Pitch } from './pitch'
import { INTERVALS } from './theory'

export type Instrument = 'piano' | 'guitar'

export type Direction = 'ascending' | 'descending' | 'harmonic'

export type RootMode = 'random' | 'fixed'

export interface Question {
  readonly direction: Direction
  readonly root: Pitch
  readonly interval: Interval
  readonly pitches: readonly Pitch[]
}

// Written only by Explore actions (builder, free play, voicing editing).
export interface Workspace {
  // Lit notes, oldest first.
  readonly pitches: readonly Pitch[]
  // The guitar position each pitch was lit at, where it was lit on the guitar.
  readonly positions: Readonly<Record<number, FretPosition>>
}

// Written only by practice rounds; never touches the workspace.
export interface Practice {
  readonly question: Question | null
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

export type Sound = 'synthesized'

export type Theme = 'system' | 'light' | 'dark'

// What the user chooses before practising; the pool of intervals, how they sound and how the app looks.
export interface Settings {
  readonly pool: readonly Interval[]
  readonly direction: Direction
  readonly rootMode: RootMode
  readonly sound: Sound
  readonly theme: Theme
}

export const initialSettings: Settings = {
  pool: INTERVALS.map((i) => i.semitones),
  direction: 'ascending',
  rootMode: 'random',
  sound: 'synthesized',
  theme: 'system',
}
