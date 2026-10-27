import type { Direction, PracticeKind, Question, ReadingChoice, RootMode } from '../../core/model'
import type { Interval, Pitch } from '../../core/pitch'
import type { FretPosition } from '../../core/instruments'
import type { PlayMode } from '../../audio/engine'
import { canGuess } from '../../core/guess'
import { COMMON_RANGE } from '../../core/instruments'
import { moveFret, voicingPitches } from '../../core/voicings'
import { generateChordQuestion, generateQuestion } from '../../core/practice'
import { useLitNotes, type VoicingList } from './useLitNotes'
import { useEngine } from '../engine/EngineContext'
import { useSettings } from '../settings/SettingsContext'
import { useSession } from './SessionContext'
import type { Instrument, Mode } from './session'

// Every action that can make sound runs here, synchronously inside the user's gesture.
export function useSessionActions() {
  const { session, dispatch } = useSession()
  const { settings, dispatch: dispatchSettings } = useSettings()
  const engine = useEngine()
  const { voicingFrets } = useLitNotes()

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

  // Chord practice draws from the chord pool; the interval question is left alone.
  function startChordQuestion(override: { pool?: readonly string[] } = {}) {
    const question = generateChordQuestion({ pool: override.pool ?? settings.chordPool, range: COMMON_RANGE, random: Math.random })
    dispatch({ type: 'setChordQuestion', question })
    return question
  }

  // The current chord stays replayable; the next question follows the new practice.
  function setPractice(practice: PracticeKind) {
    if (practice === settings.practice) return
    dispatchSettings({ type: 'setPractice', practice })
    if (session.mode !== 'listen') return
    if (practice === 'chords') {
      const question = session.practice.chordQuestion ?? startChordQuestion()
      engine.play(question.pitches, 'block')
    } else if (!session.practice.question) playQuestion(startQuestion())
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

  // With a guitar voicing shown, its fretted pitches (Play one at a time, Block strummed); else the lit Explore notes, low to high.
  // Nothing lit plays nothing.
  function playLit(mode: PlayMode) {
    if (voicingFrets) {
      const pitches = voicingPitches(voicingFrets)
      if (pitches.length > 0) engine.play(pitches, mode === 'block' ? 'strum' : mode)
      return
    }
    const pitches = [...session.workspace.pitches].sort((a, b) => a - b)
    if (pitches.length > 0) engine.play(pitches, mode)
  }

  function play() {
    if (session.mode === 'explore') return playLit('arpeggio')
    if (settings.practice === 'chords') return engine.play((session.practice.chordQuestion ?? startChordQuestion()).pitches, 'block')
    const question = session.practice.question ?? startQuestion()
    playQuestion(question)
  }

  function reveal() {
    if (settings.practice === 'chords') {
      if (session.mode === 'listen' && session.practice.chordQuestion && !session.practice.chordRevealed) dispatch({ type: 'revealChord' })
      return
    }
    if (session.mode === 'listen' && session.practice.question && !session.practice.revealed) dispatch({ type: 'reveal' })
  }

  function next() {
    if (settings.practice === 'chords') {
      if (session.mode === 'listen') engine.play(startChordQuestion().pitches, 'block')
      return
    }
    if (session.mode === 'listen') playQuestion(startQuestion())
  }

  // One button: Reveal while a question waits, Next once it is revealed.
  function revealOrNext() {
    if (session.mode === 'explore') return playLit('block')
    if (settings.practice === 'chords' ? session.practice.chordRevealed : session.practice.revealed) next()
    else reveal()
  }

  function guess(interval: Interval) {
    const { question, revealed, wrongMarks } = session.practice
    const { pool } = settings
    if (session.mode !== 'listen' || settings.practice === 'chords' || !question || revealed) return
    if (!canGuess(interval, pool, question.interval, wrongMarks)) return
    if (interval === question.interval) {
      dispatch({ type: 'reveal' })
    } else {
      dispatch({ type: 'guess', interval, pool })
    }
  }

  // A right guess reveals the chord and names the quality, silently; Next plays the next one; a wrong one marks it and the chord stays.
  function guessChord(quality: string) {
    const { chordQuestion, chordRevealed, chordWrongMarks = [] } = session.practice
    const { chordPool } = settings
    if (session.mode !== 'listen' || settings.practice !== 'chords' || !chordQuestion || chordRevealed) return
    if (!canGuess(quality, chordPool, chordQuestion.quality, chordWrongMarks)) return
    if (quality === chordQuestion.quality) {
      dispatch({ type: 'chordRight' })
    } else {
      dispatch({ type: 'guessChord', quality, pool: chordPool })
    }
  }

  // Sounds the note, makes it the root and replaces the question with one on it, silently.
  function pressNote(pitch: Pitch) {
    if (session.mode === 'explore') {
      engine.play([pitch], 'block')
      return
    }
    if (settings.practice === 'chords' || settings.rootMode !== 'fixed') return
    engine.play([pitch], 'block')
    dispatch({ type: 'setFixedRoot', pitch })
    startQuestion({ fixedRoot: pitch })
  }

  // Releasing a pressed note lights it, or unlights it when it is already lit.
  // With a voicing shown (its frets passed), a fret on the guitar edits it: the string's note moves there, or is muted when it already sits there.
  function releaseNote(pitch: Pitch, position?: FretPosition, voicingFrets?: readonly (number | null)[]) {
    if (session.mode !== 'explore') return
    if (session.rootArmed && session.workspace.pitches.includes(pitch)) dispatch({ type: 'chooseRoot', pitch })
    else if (position !== undefined && voicingFrets !== undefined) {
      const fret = voicingFrets[position.string] === position.fret ? null : position.fret
      dispatch({ type: 'editVoicing', frets: moveFret(voicingFrets, position.string, fret) })
    } else dispatch({ type: 'toggleNote', pitch, position })
  }

  function selectMode(mode: Mode) {
    if (mode === session.mode) return
    dispatch({ type: 'setMode', mode, chords: settings.practice === 'chords' })
    if (mode === 'explore') engine.stop()
    if (mode !== 'listen') return
    if (settings.practice === 'chords') engine.play((session.practice.chordQuestion ?? startChordQuestion()).pitches, 'block')
    else if (!session.practice.question) playQuestion(startQuestion())
  }

  return {
    play,
    revealOrNext,
    guess,
    guessChord,
    setPractice,
    setDirection,
    setRootMode,
    pressNote,
    releaseNote,
    selectMode,
    armRoot: () => dispatch({ type: 'armRoot' }),
    // One voicing along the ranked list, never past either end; the list comes from useVoicingList.
    stepVoicing: (direction: 1 | -1, list: VoicingList) => {
      // An edited voicing has no place in the list: either arrow's first press selects the first entry.
      const frets = list.edited ? list.frets[0] : list.frets[list.index + direction]
      if (frets !== undefined) dispatch({ type: 'selectVoicing', frets })
    },
    chooseReading: (reading: ReadingChoice) => dispatch({ type: 'chooseReading', reading }),
    toggleMode: () => selectMode(session.mode === 'listen' ? 'explore' : 'listen'),
    selectInstrument: (instrument: Instrument) => dispatch({ type: 'setInstrument', instrument, chords: settings.practice === 'chords' }),
    toggleInstrument: () => dispatch({ type: 'toggleInstrument', chords: settings.practice === 'chords' }),
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
