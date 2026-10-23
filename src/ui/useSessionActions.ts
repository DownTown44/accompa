import { COMMON_RANGE } from '../core/instruments'
import { generateQuestion } from '../core/practice'
import { useEngine } from './EngineContext'
import { useSession } from './SessionContext'
import type { Instrument, Mode } from './session'

// Every action that can make sound runs here, synchronously inside the user's gesture.
export function useSessionActions() {
  const { session, dispatch } = useSession()
  const engine = useEngine()

  function startQuestion() {
    const question = generateQuestion({ pool: session.practice.pool, range: COMMON_RANGE, random: Math.random })
    dispatch({ type: 'setQuestion', question })
    return question
  }

  function play() {
    if (session.mode !== 'listen') return
    const question = session.practice.question ?? startQuestion()
    engine.play(question.pitches, 'arpeggio')
  }

  function reveal() {
    if (session.mode === 'listen' && session.practice.question && !session.practice.revealed) dispatch({ type: 'reveal' })
  }

  function next() {
    if (session.mode === 'listen') engine.play(startQuestion().pitches, 'arpeggio')
  }

  // One button: Reveal while a question waits, Next once it is revealed.
  function revealOrNext() {
    if (session.practice.revealed) next()
    else reveal()
  }

  function selectMode(mode: Mode) {
    if (mode === session.mode) return
    dispatch({ type: 'setMode', mode })
    if (mode === 'explore') engine.stop()
    if (mode === 'listen' && !session.practice.question) engine.play(startQuestion().pitches, 'arpeggio')
  }

  return {
    play,
    revealOrNext,
    selectMode,
    toggleMode: () => selectMode(session.mode === 'listen' ? 'explore' : 'listen'),
    selectInstrument: (instrument: Instrument) => dispatch({ type: 'setInstrument', instrument }),
    toggleInstrument: () => dispatch({ type: 'toggleInstrument' }),
    shiftPiano: (direction: 1 | -1) => dispatch({ type: 'shiftPiano', direction }),
  }
}
