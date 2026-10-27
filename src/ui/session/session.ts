import {
  initialPractice,
  initialWorkspace,
  type Instrument,
  type Practice,
  type ChordQuestion,
  type ReadingChoice,
  type Question,
  type Workspace,
} from '../../core/model'
import { canGuess } from '../../core/guess'
import { isReading, litPositions, orderedReadings, pitchesOnString, readingChoice, readingRootedOn, sameChoice, toggleLit } from '../../core/explore'
import { pitchAt, STANDARD_GUITAR_TUNING, type FretPosition } from '../../core/instruments'
import type { Interval, Pitch } from '../../core/pitch'
import { DEFAULT_WINDOW_START, fitWindow, shiftWindow } from '../../core/piano'

export type { Instrument }
export type Mode = 'listen' | 'explore'

// The last guess result; the wording is derived from the guess when shown.
export type Feedback =
  | { readonly kind: 'wrong'; readonly interval: Interval }
  | { readonly kind: 'chordWrong'; readonly quality: string }
  | { readonly kind: 'chordRight'; readonly quality: string }

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
  // The next click on a lit note makes it the root; never undone.
  readonly rootArmed: boolean
}

export type SessionAction =
  // `chords` says Chords practice is active, so the piano window fits the revealed chord rather than the interval.
  | { type: 'setMode'; mode: Mode; chords?: boolean }
  | { type: 'setInstrument'; instrument: Instrument; chords?: boolean }
  | { type: 'toggleInstrument'; chords?: boolean }
  | { type: 'toggleNote'; pitch: Pitch; position?: FretPosition }
  | { type: 'chooseReading'; reading: ReadingChoice }
  | { type: 'chooseRoot'; pitch: Pitch }
  | { type: 'armRoot' }
  | { type: 'selectVoicing'; frets: readonly (number | null)[] }
  | { type: 'editVoicing'; frets: readonly (number | null)[] }
  | { type: 'setQuestion'; question: Question }
  | { type: 'setChordQuestion'; question: ChordQuestion }
  | { type: 'clearQuestion' }
  | { type: 'setFixedRoot'; pitch: Pitch }
  | { type: 'reveal' }
  | { type: 'revealChord' }
  | { type: 'guess'; interval: Interval; pool: readonly Interval[] }
  | { type: 'guessChord'; quality: string; pool: readonly string[] }
  | { type: 'chordRight' }
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
  rootArmed: false,
}

// A revealed question, or the lit Explore notes, must be visible when the piano is showing.
// `chords` picks which question counts, so a hidden chord (or interval) never shifts the window.
function fitRevealed(state: Session, chords = false): Session {
  if (state.instrument !== 'piano') return state
  const { question, revealed, chordQuestion, chordRevealed } = state.practice
  const revealedPitches = chords ? (chordRevealed && chordQuestion ? chordQuestion.pitches : null) : revealed && question ? question.pitches : null
  const shown = state.mode === 'explore' ? state.workspace.pitches : revealedPitches
  if (shown === null) return state
  const pianoStart = fitWindow(state.pianoStart, shown)
  return pianoStart === state.pianoStart ? state : { ...state, pianoStart }
}

// The chosen reading stays only while the namer still names it for the notes.
function pruneReading(workspace: Workspace): Workspace {
  const { reading, ...rest } = workspace
  if (!reading) return workspace
  return orderedReadings(workspace.pitches).some((r) => isReading(r, reading)) ? workspace : rest
}

export function sessionReducer(state: Session, action: SessionAction): Session {
  switch (action.type) {
    case 'setMode':
      return fitRevealed({ ...state, mode: action.mode, rootArmed: false }, action.chords)
    case 'setInstrument':
      return fitRevealed({ ...state, instrument: action.instrument }, action.chords)
    case 'toggleInstrument':
      return fitRevealed({ ...state, instrument: state.instrument === 'piano' ? 'guitar' : 'piano' }, action.chords)
    case 'toggleNote': {
      const { pitch, position } = action
      const { pitches, positions, reading, root } = state.workspace
      const keep = (list: readonly Pitch[]) =>
        Object.fromEntries(Object.entries(positions).filter(([key]) => list.includes(Number(key) as Pitch)))
      // One lit note per string: the others on the clicked string are replaced.
      const without = (list: readonly Pitch[]) => {
        if (position === undefined) return list
        const taken = pitchesOnString(list, positions, position.string)
        return list.filter((p) => p === pitch || !taken.includes(p))
      }
      if (pitches.includes(pitch) && position !== undefined) {
        const shown = litPositions(pitches, positions)[pitches.indexOf(pitch)]
        if (!shown || shown.string !== position.string || shown.fret !== position.fret) {
          const next = without(pitches)
          const workspace = pruneReading({
            pitches: next,
            positions: { ...keep(next), [pitch]: position },
            ...(reading ? { reading } : {}),
            ...(root !== undefined && next.includes(root) ? { root } : {}),
          })
          return { ...state, cleared: null, workspace }
        }
      }
      const next = toggleLit(pitches.includes(pitch) ? pitches : without(pitches), pitch)
      const remembered = position !== undefined && next.includes(pitch) ? { ...keep(next), [pitch]: position } : keep(next)
      const workspace = pruneReading({
        pitches: next,
        positions: remembered,
        ...(reading ? { reading } : {}),
        ...(root !== undefined && next.includes(root) ? { root } : {}),
      })
      return { ...state, cleared: null, rootArmed: next.length > 0 && state.rootArmed, workspace }
    }
    case 'chooseReading': {
      const { reading, root, voicing, edited, ...rest } = state.workspace
      const { reading: choice } = action
      const named = orderedReadings(state.workspace.pitches).some((r) => isReading(r, choice))
      if (!named || (root === undefined && reading && sameChoice(reading, choice))) return state
      return { ...state, workspace: { ...rest, reading: choice, ...(edited && voicing ? { voicing, edited } : {}) } }
    }
    case 'chooseRoot': {
      const { pitch } = action
      const { pitches, reading, root, voicing, edited, ...rest } = state.workspace
      if (state.mode !== 'explore' || !pitches.includes(pitch)) return state
      const found = readingRootedOn(pitches, pitch)
      const choice = found ? readingChoice(found) : undefined
      const same = root === pitch && (choice ? reading !== undefined && sameChoice(reading, choice) : reading === undefined)
      if (same) return state.rootArmed ? { ...state, rootArmed: false } : state
      return { ...state, rootArmed: false, workspace: { pitches, ...rest, root: pitch, ...(choice ? { reading: choice } : {}), ...(edited && voicing ? { voicing, edited } : {}) } }
    }
    case 'selectVoicing': {
      const { voicing, edited } = state.workspace
      if (state.mode !== 'explore' || (!edited && voicing !== undefined && voicing.length === action.frets.length && voicing.every((f, i) => f === action.frets[i]))) return state
      const { edited: _edited, ...rest } = state.workspace
      // isCarried (core/explore) reads Workspace.positions as the marker for notes clicked on the guitar, so a change to how positions are written changes which chords get a voicing.
      // Leaving a hand edit forgets the positions it wrote, so the notes are carried again and the generated list shows.
      return { ...state, workspace: { ...rest, ...(edited ? { positions: {} } : {}), voicing: action.frets } }
    }
    case 'editVoicing': {
      const { frets } = action
      if (state.mode !== 'explore' || state.instrument !== 'guitar' || frets.length !== STANDARD_GUITAR_TUNING.length) return state
      const { reading, root } = state.workspace
      const sounding = frets.flatMap((fret, string) => (fret === null ? [] : [{ string, fret, pitch: pitchAt(STANDARD_GUITAR_TUNING, string, fret) }]))
      const pitches = [...new Set(sounding.map((s) => s.pitch))].sort((a, b) => a - b)
      const positions: Record<number, FretPosition> = {}
      for (const { string, fret, pitch } of sounding) if (!(pitch in positions)) positions[pitch] = { string, fret }
      const workspace = pruneReading({
        pitches,
        positions,
        ...(reading ? { reading } : {}),
        ...(root !== undefined && pitches.includes(root) ? { root } : {}),
        ...(pitches.length >= 2 ? { voicing: frets, edited: true as const } : {}),
      })
      return { ...state, cleared: null, rootArmed: pitches.length > 0 && state.rootArmed, workspace }
    }
    case 'armRoot':
      if (state.rootArmed) return { ...state, rootArmed: false }
      return state.mode === 'explore' && state.workspace.pitches.length > 0 ? { ...state, rootArmed: true } : state
    case 'setQuestion':
      return {
        ...state,
        practice: { ...state.practice, question: action.question, revealed: false, wrongMarks: [] },
        feedback: null,
      }
    // A new chord: unrevealed, no marks, no feedback; the interval question stays.
    case 'setChordQuestion':
      return { ...state, practice: { ...state.practice, chordQuestion: action.question, chordRevealed: false, chordWrongMarks: [] }, feedback: null }
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
    case 'revealChord': {
      if (!state.practice.chordQuestion || state.practice.chordRevealed) return state
      return fitRevealed({ ...state, practice: { ...state.practice, chordRevealed: true }, feedback: null }, true)
    }
    case 'guess': {
      const { question, revealed, wrongMarks } = state.practice
      const { interval, pool } = action
      if (!question || revealed || question.interval === interval) return state
      if (!canGuess(interval, pool, question.interval, wrongMarks)) return state
      return {
        ...state,
        practice: { ...state.practice, wrongMarks: [...wrongMarks, interval] },
        feedback: { kind: 'wrong', interval },
      }
    }
    // A wrong chord guess marks the quality; the chord stays.
    case 'guessChord': {
      const { chordQuestion, chordRevealed, chordWrongMarks = [] } = state.practice
      const { quality, pool } = action
      if (!chordQuestion || chordRevealed || chordQuestion.quality === quality) return state
      if (!canGuess(quality, pool, chordQuestion.quality, chordWrongMarks)) return state
      return {
        ...state,
        practice: { ...state.practice, chordWrongMarks: [...chordWrongMarks, quality] },
        feedback: { kind: 'chordWrong', quality },
      }
    }
    // A right chord guess reveals the chord as Reveal does, keeps the marks and names the guessed quality.
    case 'chordRight': {
      const { chordQuestion, chordRevealed } = state.practice
      if (!chordQuestion || chordRevealed) return state
      return fitRevealed(
        { ...state, practice: { ...state.practice, chordRevealed: true }, feedback: { kind: 'chordRight', quality: chordQuestion.quality } },
        true,
      )
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
      if (state.rootArmed) return { ...state, rootArmed: false }
      if (state.mode === 'explore' && state.workspace.pitches.length > 0) {
        return { ...state, cleared: state.workspace, workspace: initialWorkspace, rootArmed: false }
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
