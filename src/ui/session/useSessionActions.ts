import type { Question } from '../../core/model'
import type { Interval } from '../../core/pitch'
import { COMMON_RANGE } from '../../core/instruments'
import { generateQuestion } from '../../core/practice'
import { useEngine } from '../engine/EngineContext'
import { useSettings } from '../settings/SettingsContext'
import { useSession } from './SessionContext'
import type { Instrument, Mode } from './session'

// Every action that can make sound runs here, synchronously inside the user's gesture.
export function useSessionActions() {
  const { session, dispatch } = useSession()
  const { settings } = useSettings()
  const engine = useEngine()

  function startQuestion() {
    const question = generateQuestion({ pool: settings.pool, range: COMMON_RANGE, random: Math.random, direction: settings.direction })
    dispatch({ type: 'setQuestion', question })
    return question
  }

  function playQuestion(question: Question) {
    engine.play(question.pitches, question.direction === 'harmonic' ? 'block' : 'arpeggio')
  }

  function play() {
    if (session.mode !== 'listen') return
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
    if (session.practice.revealed) next()
    else reveal()
  }

  function guess(interval: Interval) {
    const { question, revealed, wrongMarks } = session.practice
    const { pool } = settings
    if (session.mode !== 'listen' || !question || revealed) return
    if (!(pool.includes(interval) || interval === question.interval) || wrongMarks.includes(interval)) return
    if (interval === question.interval) {
      playQuestion(startQuestion())
      dispatch({ type: 'rightGuess', interval })
    } else {
      dispatch({ type: 'guess', interval })
    }
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
    shiftPiano: (direction: 1 | -1) => dispatch({ type: 'shiftPiano', direction }),
  }
}
