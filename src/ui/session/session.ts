import {
  initialPractice,
  initialWorkspace,
  type Instrument,
  type Practice,
  type Question,
  type Workspace,
} from '../../core/model'
import { DEFAULT_WINDOW_START, fitWindow, shiftWindow } from '../../core/piano'

export type { Instrument }
export type Mode = 'listen' | 'explore'

export interface Session {
  readonly mode: Mode
  readonly instrument: Instrument
  readonly workspace: Workspace
  readonly practice: Practice
  readonly pianoStart: number
}

export type SessionAction =
  | { type: 'setMode'; mode: Mode }
  | { type: 'setInstrument'; instrument: Instrument }
  | { type: 'toggleInstrument' }
  | { type: 'setQuestion'; question: Question }
  | { type: 'reveal' }
  | { type: 'shiftPiano'; direction: 1 | -1 }

export const initialSession: Session = {
  mode: 'listen',
  instrument: 'piano',
  workspace: initialWorkspace,
  practice: initialPractice,
  pianoStart: DEFAULT_WINDOW_START,
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
      }
    case 'reveal': {
      if (!state.practice.question || state.practice.revealed) return state
      return fitRevealed({ ...state, practice: { ...state.practice, revealed: true } })
    }
    case 'shiftPiano': {
      if (state.instrument !== 'piano') return state
      const pianoStart = shiftWindow(state.pianoStart, action.direction)
      return pianoStart === state.pianoStart ? state : { ...state, pianoStart }
    }
  }
}
