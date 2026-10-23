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
  readonly pool: readonly Interval[]
}

export const initialWorkspace: Workspace = { pitches: [] }

export const initialPractice: Practice = {
  question: null,
  revealed: false,
  wrongMarks: [],
  pool: INTERVALS.map((i) => i.semitones),
}
