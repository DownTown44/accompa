import {
  type Direction,
  initialPractice,
  initialWorkspace,
  type Instrument,
  type Practice,
  type Question,
  type Workspace,
} from '../../core/model'
import type { Interval } from '../../core/pitch'
import { INTERVALS } from '../../core/theory'
import { DEFAULT_WINDOW_START, fitWindow, shiftWindow } from '../../core/piano'

export type { Instrument }
export type Mode = 'listen' | 'explore'

// The last guess result; the wording is derived from the interval when shown.
export interface Feedback {
  readonly kind: 'right' | 'wrong'
  readonly interval: Interval
}

export interface Session {
  readonly mode: Mode
  readonly instrument: Instrument
  readonly workspace: Workspace
  readonly practice: Practice
  readonly pianoStart: number
  readonly feedback: Feedback | null
  readonly setupOpen: boolean
  readonly direction: Direction
}

export type SessionAction =
  | { type: 'setMode'; mode: Mode }
  | { type: 'setInstrument'; instrument: Instrument }
  | { type: 'toggleInstrument' }
  | { type: 'setQuestion'; question: Question }
  | { type: 'reveal' }
  | { type: 'guess'; interval: Interval }
  | { type: 'rightGuess'; interval: Interval }
  | { type: 'toggleSetup' }
  | { type: 'closeSetup' }
  | { type: 'togglePool'; interval: Interval }
  | { type: 'setDirection'; direction: Direction }
  | { type: 'shiftPiano'; direction: 1 | -1 }

export const initialSession: Session = {
  mode: 'listen',
  instrument: 'piano',
  workspace: initialWorkspace,
  practice: initialPractice,
  pianoStart: DEFAULT_WINDOW_START,
  feedback: null,
  setupOpen: false,
  direction: 'ascending',
}

// A revealed question must be visible when the piano is showing.
function fitRevealed(state: Session): Session {
  const { question, revealed } = state.practice
  if (state.mode !== 'listen' || state.instrument !== 'piano' || !revealed || !question) return state
  const pianoStart = fitWindow(state.pianoStart, question.pitches)
  return pianoStart === state.pianoStart ? state : { ...state, pianoStart }
}

export function sessionReducer(state: Session, action: SessionAction): Session {
  switch (action.type) {
    case 'setMode':
      return fitRevealed({ ...state, mode: action.mode })
    case 'setInstrument':
      return fitRevealed({ ...state, instrument: action.instrument })
    case 'toggleInstrument':
      return fitRevealed({ ...state, instrument: state.instrument === 'piano' ? 'guitar' : 'piano' })
    case 'setQuestion':
      return {
        ...state,
        practice: { ...state.practice, question: action.question, revealed: false, wrongMarks: [] },
        feedback: null,
      }
    case 'reveal': {
      if (!state.practice.question || state.practice.revealed) return state
      return fitRevealed({ ...state, practice: { ...state.practice, revealed: true }, feedback: null })
    }
    case 'guess': {
      const { question, revealed, pool, wrongMarks } = state.practice
      const { interval } = action
      if (!question || revealed || question.interval === interval) return state
      if (!pool.includes(interval) || wrongMarks.includes(interval)) return state
      return {
        ...state,
        practice: { ...state.practice, wrongMarks: [...wrongMarks, interval] },
        feedback: { kind: 'wrong', interval },
      }
    }
    // Recorded after the next question is set, which clears the feedback.
    case 'rightGuess':
      return { ...state, feedback: { kind: 'right', interval: action.interval } }
    case 'toggleSetup':
      return { ...state, setupOpen: !state.setupOpen }
    case 'closeSetup':
      return state.setupOpen ? { ...state, setupOpen: false } : state
    // The question in play is never touched; the next one draws from the new pool.
    case 'togglePool': {
      const { pool } = state.practice
      const { interval } = action
      if (!INTERVALS.some((definition) => definition.semitones === interval)) return state
      const next = pool.includes(interval)
        ? pool.filter((value) => value !== interval)
        : INTERVALS.map((definition) => definition.semitones).filter((value) => value === interval || pool.includes(value))
      if (next.length === 0) return state
      return { ...state, practice: { ...state.practice, pool: next } }
    }
    // Applies from the next question; the one in play keeps the direction it was drawn with.
    case 'setDirection':
      return state.direction === action.direction ? state : { ...state, direction: action.direction }
    case 'shiftPiano': {
      if (state.instrument !== 'piano') return state
      const pianoStart = shiftWindow(state.pianoStart, action.direction)
      return pianoStart === state.pianoStart ? state : { ...state, pianoStart }
    }
  }
}
