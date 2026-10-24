import type { Direction, Question, RootMode } from '../../core/model'
import type { Interval, Pitch } from '../../core/pitch'
import type { FretPosition } from '../../core/instruments'
import type { PlayMode } from '../../audio/engine'
import { COMMON_RANGE } from '../../core/instruments'
import { generateQuestion } from '../../core/practice'
import { useEngine } from '../engine/EngineContext'
import { useSettings } from '../settings/SettingsContext'
import { useSession } from './SessionContext'
import type { Instrument, Mode } from './session'

// Every action that can make sound runs here, synchronously inside the user's gesture.
export function useSessionActions() {
  const { session, dispatch } = useSession()
  const { settings, dispatch: dispatchSettings } = useSettings()
  const engine = useEngine()

  // A setting that was just changed is passed in, as the closure still holds the old value.
  function startQuestion(override: { direction?: Direction; fixedRoot?: Pitch | null } = {}) {
    const fixed = settings.rootMode === 'fixed' || override.fixedRoot !== undefined
    const fixedRoot = override.fixedRoot !== undefined ? override.fixedRoot : session.practice.fixedRoot
    const question = generateQuestion({
      pool: settings.pool,
      range: COMMON_RANGE,
      random: Math.random,
      direction: override.direction ?? settings.direction,
      fixedRoot: fixed ? fixedRoot : null,
    })
    dispatch({ type: 'setQuestion', question })
    if (fixed && fixedRoot === null) dispatch({ type: 'setFixedRoot', pitch: question.root })
    return question
  }

  function setDirection(direction: Direction) {
    if (direction === settings.direction) return
    dispatchSettings({ type: 'setDirection', direction })
    // In Explore the waiting question stays; the setting applies from the next one.
    if (session.mode === 'listen' && session.practice.question) startQuestion({ direction })
  }

  function setRootMode(rootMode: RootMode) {
    if (rootMode === settings.rootMode) return
    dispatchSettings({ type: 'setRootMode', rootMode })
    if (session.mode !== 'listen' || rootMode !== 'fixed' || !session.practice.question) return
    const { fixedRoot } = session.practice
    if (fixedRoot === null) dispatch({ type: 'clearQuestion' })
    else startQuestion({ fixedRoot })
  }

  function playQuestion(question: Question) {
    engine.play(question.pitches, question.direction === 'harmonic' ? 'block' : 'arpeggio')
  }

  // The lit Explore notes, low to high; nothing lit plays nothing.
  function playLit(mode: PlayMode) {
    const pitches = [...session.workspace.pitches].sort((a, b) => a - b)
    if (pitches.length > 0) engine.play(pitches, mode)
  }

  function play() {
    if (session.mode === 'explore') return playLit('arpeggio')
    const question = session.practice.question ?? startQuestion()
    playQuestion(question)
  }

  function reveal() {
    if (session.mode === 'listen' && session.practice.question && !session.practice.revealed) dispatch({ type: 'reveal' })
  }

  function next() {
    if (session.mode === 'listen') playQuestion(startQuestion())
  }

  // One button: Reveal while a question waits, Next once it is revealed.
  function revealOrNext() {
    if (session.mode === 'explore') return playLit('block')
    if (session.practice.revealed) next()
    else reveal()
  }

  function guess(interval: Interval) {
    const { question, revealed, wrongMarks } = session.practice
    const { pool } = settings
    if (session.mode !== 'listen' || !question || revealed) return
    if (!(pool.includes(interval) || interval === question.interval) || wrongMarks.includes(interval)) return
    if (interval === question.interval) {
      dispatch({ type: 'reveal' })
    } else {
      dispatch({ type: 'guess', interval })
    }
  }

  // Sounds the note, makes it the root and replaces the question with one on it, silently.
  function pressNote(pitch: Pitch) {
    if (session.mode === 'explore') {
      engine.play([pitch], 'block')
      return
    }
    if (settings.rootMode !== 'fixed') return
    engine.play([pitch], 'block')
    dispatch({ type: 'setFixedRoot', pitch })
    startQuestion({ fixedRoot: pitch })
  }

  // Releasing a pressed note lights it, or unlights it when it is already lit.
  function releaseNote(pitch: Pitch, position?: FretPosition) {
    if (session.mode === 'explore') dispatch({ type: 'toggleNote', pitch, position })
  }

  function selectMode(mode: Mode) {
    if (mode === session.mode) return
    dispatch({ type: 'setMode', mode })
    if (mode === 'explore') engine.stop()
    if (mode === 'listen' && !session.practice.question) playQuestion(startQuestion())
  }

  return {
    play,
    revealOrNext,
    guess,
    setDirection,
    setRootMode,
    pressNote,
    releaseNote,
    selectMode,
    toggleMode: () => selectMode(session.mode === 'listen' ? 'explore' : 'listen'),
    selectInstrument: (instrument: Instrument) => dispatch({ type: 'setInstrument', instrument }),
    toggleInstrument: () => dispatch({ type: 'toggleInstrument' }),
    toggleSetup: () => dispatch({ type: 'toggleSetup' }),
    closeSetup: () => dispatch({ type: 'closeSetup' }),
    openHelp: () => dispatch({ type: 'openHelp' }),
    closeHelp: () => dispatch({ type: 'closeHelp' }),
    toggleHelp: () => dispatch({ type: 'toggleHelp' }),
    dismiss: () => dispatch({ type: 'dismiss' }),
    undoClear: () => dispatch({ type: 'undoClear' }),
    shiftPiano: (direction: 1 | -1) => dispatch({ type: 'shiftPiano', direction }),
  }
}
