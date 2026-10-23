import {
  initialPractice,
  initialWorkspace,
  type Instrument,
  type Practice,
  type Question,
  type Workspace,
} from '../../core/model'
import type { Interval } from '../../core/pitch'
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
  readonly helpOpen: boolean
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
  | { type: 'openHelp' }
  | { type: 'closeHelp' }
  | { type: 'toggleHelp' }
  | { type: 'dismiss' }
  | { type: 'shiftPiano'; direction: 1 | -1 }

export const initialSession: Session = {
  mode: 'listen',
  instrument: 'piano',
  workspace: initialWorkspace,
  practice: initialPractice,
  pianoStart: DEFAULT_WINDOW_START,
  feedback: null,
  setupOpen: false,
  helpOpen: false,
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
      const { question, revealed, wrongMarks } = state.practice
      const { interval } = action
      if (!question || revealed || question.interval === interval) return state
      if (wrongMarks.includes(interval)) return state
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
    case 'openHelp':
      return state.helpOpen ? state : { ...state, helpOpen: true }
    case 'closeHelp':
      return state.helpOpen ? { ...state, helpOpen: false } : state
    case 'toggleHelp':
      return { ...state, helpOpen: !state.helpOpen }
    // Esc closes the shortcuts list first, else the Setup panel.
    case 'dismiss':
      if (state.helpOpen) return { ...state, helpOpen: false }
      return state.setupOpen ? { ...state, setupOpen: false } : state
    case 'shiftPiano': {
      if (state.instrument !== 'piano') return state
      const pianoStart = shiftWindow(state.pianoStart, action.direction)
      return pianoStart === state.pianoStart ? state : { ...state, pianoStart }
    }
  }
}
