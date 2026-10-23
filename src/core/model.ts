import type { Interval, Pitch } from './pitch'
import { INTERVALS } from './theory'

export type Instrument = 'piano' | 'guitar'

export type Direction = 'ascending' | 'descending' | 'harmonic'

export interface Question {
  readonly direction: Direction
  readonly root: Pitch
  readonly interval: Interval
  readonly pitches: readonly Pitch[]
}

// Written only by Explore actions (builder, free play, voicing editing).
export interface Workspace {
  readonly pitches: readonly Pitch[]
}

// Written only by practice rounds; never touches the workspace.
export interface Practice {
  readonly question: Question | null
  readonly revealed: boolean
  readonly wrongMarks: readonly Interval[]
}

export const initialWorkspace: Workspace = { pitches: [] }

export const initialPractice: Practice = {
  question: null,
  revealed: false,
  wrongMarks: [],
}

export type Sound = 'synthesized'

export type Theme = 'system' | 'light' | 'dark'

// What the user chooses before practising; the pool of intervals, how they sound and how the app looks.
export interface Settings {
  readonly pool: readonly Interval[]
  readonly direction: Direction
  readonly sound: Sound
  readonly theme: Theme
}

export const initialSettings: Settings = {
  pool: INTERVALS.map((i) => i.semitones),
  direction: 'ascending',
  sound: 'synthesized',
  theme: 'system',
}
