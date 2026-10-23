export type Mode = 'listen' | 'explore'
export type Instrument = 'piano' | 'guitar'

export interface Session {
  readonly mode: Mode
  readonly instrument: Instrument
}

export type SessionAction =
  | { type: 'setMode'; mode: Mode }
  | { type: 'setInstrument'; instrument: Instrument }
  | { type: 'toggleMode' }
  | { type: 'toggleInstrument' }

export const initialSession: Session = { mode: 'listen', instrument: 'piano' }

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
  }
}
