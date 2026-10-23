import {
  initialPractice,
  initialWorkspace,
  type Instrument,
  type Practice,
  type Question,
  type Workspace,
} from '../core/model'

export type { Instrument }
export type Mode = 'listen' | 'explore'

export interface Session {
  readonly mode: Mode
  readonly instrument: Instrument
  readonly workspace: Workspace
  readonly practice: Practice
}

export type SessionAction =
  | { type: 'setMode'; mode: Mode }
  | { type: 'setInstrument'; instrument: Instrument }
  | { type: 'toggleMode' }
  | { type: 'toggleInstrument' }
  | { type: 'setQuestion'; question: Question }

export const initialSession: Session = {
  mode: 'listen',
  instrument: 'piano',
  workspace: initialWorkspace,
  practice: initialPractice,
}

export function sessionReducer(state: Session, action: SessionAction): Session {
  switch (action.type) {
    case 'setMode':
      return { ...state, mode: action.mode }
    case 'setInstrument':
      return { ...state, instrument: action.instrument }
    case 'toggleMode':
      return { ...state, mode: state.mode === 'listen' ? 'explore' : 'listen' }
    case 'toggleInstrument':
      return { ...state, instrument: state.instrument === 'piano' ? 'guitar' : 'piano' }
    case 'setQuestion':
      return {
        ...state,
        practice: { ...state.practice, question: action.question, revealed: false, wrongMarks: [] },
      }
  }
}
