import {
  initialPractice,
  initialWorkspace,
  type Instrument,
  type Practice,
  type Question,
  type Workspace,
} from '../../core/model'
import { litPositions, toggleLit } from '../../core/explore'
import type { FretPosition } from '../../core/instruments'
import type { Interval, Pitch } from '../../core/pitch'
import { DEFAULT_WINDOW_START, fitWindow, shiftWindow } from '../../core/piano'

export type { Instrument }
export type Mode = 'listen' | 'explore'

// The last guess result; the wording is derived from the interval when shown.
export interface Feedback {
  readonly kind: 'wrong'
  readonly interval: Interval
}

export interface Session {
  readonly mode: Mode
  readonly instrument: Instrument
  readonly workspace: Workspace
  // What Esc cleared, kept for Undo until the next note change.
  readonly cleared: Workspace | null
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
  | { type: 'toggleNote'; pitch: Pitch; position?: FretPosition }
  | { type: 'setQuestion'; question: Question }
  | { type: 'clearQuestion' }
  | { type: 'setFixedRoot'; pitch: Pitch }
  | { type: 'reveal' }
  | { type: 'guess'; interval: Interval }
  | { type: 'toggleSetup' }
  | { type: 'closeSetup' }
  | { type: 'openHelp' }
  | { type: 'closeHelp' }
  | { type: 'toggleHelp' }
  | { type: 'dismiss' }
  | { type: 'undoClear' }
  | { type: 'shiftPiano'; direction: 1 | -1 }

export const initialSession: Session = {
  mode: 'explore',
  instrument: 'piano',
  workspace: initialWorkspace,
  cleared: null,
  practice: initialPractice,
  pianoStart: DEFAULT_WINDOW_START,
  feedback: null,
  setupOpen: false,
  helpOpen: false,
}

// A revealed question, or the lit Explore notes, must be visible when the piano is showing.
function fitRevealed(state: Session): Session {
  if (state.instrument !== 'piano') return state
  const { question, revealed } = state.practice
  const shown = state.mode === 'explore' ? state.workspace.pitches : revealed && question ? question.pitches : null
  if (shown === null) return state
  const pianoStart = fitWindow(state.pianoStart, shown)
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
    case 'toggleNote': {
      const { pitch, position } = action
      const { pitches, positions } = state.workspace
      const keep = (list: readonly Pitch[]) =>
        Object.fromEntries(Object.entries(positions).filter(([key]) => list.includes(Number(key) as Pitch)))
      if (pitches.includes(pitch) && position !== undefined) {
        const shown = litPositions(pitches, positions)[pitches.indexOf(pitch)]
        if (!shown || shown.string !== position.string || shown.fret !== position.fret) {
          return { ...state, cleared: null, workspace: { pitches, positions: { ...positions, [pitch]: position } } }
        }
      }
      const next = toggleLit(pitches, pitch)
      const remembered = position !== undefined && next.includes(pitch) ? { ...keep(next), [pitch]: position } : keep(next)
      return { ...state, cleared: null, workspace: { pitches: next, positions: remembered } }
    }
    case 'setQuestion':
      return {
        ...state,
        practice: { ...state.practice, question: action.question, revealed: false, wrongMarks: [] },
        feedback: null,
      }
    case 'clearQuestion':
      return {
        ...state,
        practice: { ...state.practice, question: null, revealed: false, wrongMarks: [] },
        feedback: null,
      }
    case 'setFixedRoot':
      return state.practice.fixedRoot === action.pitch ? state : { ...state, practice: { ...state.practice, fixedRoot: action.pitch } }
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
    // Esc closes the shortcuts list first, then the Setup panel, then clears the lit Explore notes.
    case 'dismiss':
      if (state.helpOpen) return { ...state, helpOpen: false }
      if (state.setupOpen) return { ...state, setupOpen: false }
      if (state.mode === 'explore' && state.workspace.pitches.length > 0) {
        return { ...state, cleared: state.workspace, workspace: initialWorkspace }
      }
      return state
    case 'undoClear':
      return state.cleared ? fitRevealed({ ...state, workspace: state.cleared, cleared: null }) : state
    case 'shiftPiano': {
      if (state.instrument !== 'piano') return state
      const pianoStart = shiftWindow(state.pianoStart, action.direction)
      return pianoStart === state.pianoStart ? state : { ...state, pianoStart }
    }
  }
}
