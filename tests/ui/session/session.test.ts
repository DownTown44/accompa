import { describe, expect, it } from 'vitest'
import { pitch, interval } from '../../../src/core/pitch'
import { INTERVALS } from '../../../src/core/theory'
import { initialSession, sessionReducer } from '../../../src/ui/session/session'

describe('sessionReducer', () => {
  it('starts in Listen on the piano', () => {
    expect(initialSession.mode).toBe('listen')
    expect(initialSession.instrument).toBe('piano')
    expect(initialSession.practice.question).toBeNull()
  })

  it('sets the mode', () => {
    expect(sessionReducer(initialSession, { type: 'setMode', mode: 'explore' }).mode).toBe('explore')
  })

  it('sets the instrument', () => {
    expect(sessionReducer(initialSession, { type: 'setInstrument', instrument: 'guitar' }).instrument).toBe('guitar')
  })

  it('toggles between the two instruments', () => {
    const guitar = sessionReducer(initialSession, { type: 'toggleInstrument' })
    expect(guitar.instrument).toBe('guitar')
    expect(sessionReducer(guitar, { type: 'toggleInstrument' }).instrument).toBe('piano')
  })

  it('keeps the instrument when the mode changes and the mode when the instrument changes', () => {
    const guitarExplore = sessionReducer(sessionReducer(initialSession, { type: 'setInstrument', instrument: 'guitar' }), { type: 'setMode', mode: 'explore' })
    expect(guitarExplore.mode).toBe('explore')
    expect(guitarExplore.instrument).toBe('guitar')
  })

  it('does not mutate the previous state', () => {
    sessionReducer(initialSession, { type: 'setMode', mode: 'explore' })
    expect(initialSession.mode).toBe('listen')
  })

  it('stores a question in the practice part and leaves the workspace untouched', () => {
    const question = { direction: 'ascending' as const, root: pitch(60), interval: interval(7), pitches: [pitch(60), pitch(67)] }
    const next = sessionReducer(initialSession, { type: 'setQuestion', question })
    expect(next.practice.question).toBe(question)
    expect(next.workspace).toBe(initialSession.workspace)
  })

  it('keeps the question when the mode or instrument changes', () => {
    const question = { direction: 'ascending' as const, root: pitch(60), interval: interval(7), pitches: [pitch(60), pitch(67)] }
    let state = sessionReducer(initialSession, { type: 'setQuestion', question })
    state = sessionReducer(state, { type: 'setMode', mode: 'explore' })
    state = sessionReducer(state, { type: 'toggleInstrument' })
    state = sessionReducer(state, { type: 'setMode', mode: 'listen' })
    expect(state.practice.question).toBe(question)
  })
})

describe('instrument swap', () => {
  it('changes only the instrument, there and back', () => {
    const question = { direction: 'ascending' as const, root: pitch(60), interval: interval(7), pitches: [pitch(60), pitch(67)] }
    let state = sessionReducer(initialSession, { type: 'setQuestion', question })
    state = sessionReducer(state, { type: 'shiftPiano', direction: 1 })
    const guitar = sessionReducer(state, { type: 'toggleInstrument' })
    expect({ ...guitar, instrument: state.instrument }).toEqual(state)
    const back = sessionReducer(guitar, { type: 'toggleInstrument' })
    expect(back).toEqual(state)
    expect(back.pianoStart).toBe(60)
  })
})

describe('piano window in the session', () => {
  it('starts at C3', () => expect(initialSession.pianoStart).toBe(48))

  it('shifts by an octave and clamps at both ends', () => {
    const up = sessionReducer(initialSession, { type: 'shiftPiano', direction: 1 })
    expect(up.pianoStart).toBe(60)
    expect(sessionReducer(up, { type: 'shiftPiano', direction: 1 })).toBe(up)
    const down = sessionReducer(initialSession, { type: 'shiftPiano', direction: -1 })
    expect(down.pianoStart).toBe(36)
    expect(sessionReducer(down, { type: 'shiftPiano', direction: -1 })).toBe(down)
  })

  it('does not move the hidden window while Guitar is active', () => {
    const guitar = sessionReducer(initialSession, { type: 'setInstrument', instrument: 'guitar' })
    expect(sessionReducer(guitar, { type: 'shiftPiano', direction: 1 })).toBe(guitar)
  })

  it('leaves the rest of the session untouched', () => {
    const next = sessionReducer(initialSession, { type: 'shiftPiano', direction: 1 })
    expect({ ...next, pianoStart: 48 }).toEqual(initialSession)
  })
})

describe('window refit on mode and instrument change', () => {
  const question = { direction: 'ascending' as const, root: pitch(40), interval: interval(7), pitches: [pitch(40), pitch(47)] }
  const revealed = () => {
    let state = sessionReducer(initialSession, { type: 'setQuestion', question })
    state = sessionReducer(state, { type: 'reveal' })
    state = sessionReducer(state, { type: 'shiftPiano', direction: 1 })
    state = sessionReducer(state, { type: 'shiftPiano', direction: 1 })
    expect(state.pianoStart).toBe(60)
    return state
  }

  it('refits when returning to Listen', () => {
    const explore = sessionReducer(revealed(), { type: 'setMode', mode: 'explore' })
    expect(explore.pianoStart).toBe(60)
    expect(sessionReducer(explore, { type: 'setMode', mode: 'listen' }).pianoStart).toBe(36)
  })

  it('refits when choosing the piano again', () => {
    const guitar = sessionReducer(revealed(), { type: 'setInstrument', instrument: 'guitar' })
    expect(guitar.pianoStart).toBe(60)
    expect(sessionReducer(guitar, { type: 'setInstrument', instrument: 'piano' }).pianoStart).toBe(36)
  })
})

describe('reveal', () => {
  const question = { direction: 'ascending' as const, root: pitch(40), interval: interval(7), pitches: [pitch(40), pitch(47)] }
  const asked = sessionReducer(initialSession, { type: 'setQuestion', question })

  it('does nothing without a question', () => {
    expect(sessionReducer(initialSession, { type: 'reveal' })).toBe(initialSession)
  })

  it('reveals and shifts the piano window to include both notes', () => {
    const next = sessionReducer(asked, { type: 'reveal' })
    expect(next.practice.revealed).toBe(true)
    expect(next.pianoStart).toBe(36)
    expect(next.workspace).toBe(initialSession.workspace)
  })

  it('a new question clears it', () => {
    const next = sessionReducer(sessionReducer(asked, { type: 'reveal' }), { type: 'setQuestion', question })
    expect(next.practice.revealed).toBe(false)
  })

  it('fits the window when swapping back to the piano', () => {
    let state = sessionReducer(asked, { type: 'toggleInstrument' })
    state = sessionReducer(state, { type: 'reveal' })
    expect(state.pianoStart).toBe(48)
    expect(sessionReducer(state, { type: 'toggleInstrument' }).pianoStart).toBe(36)
  })
})

describe('guess', () => {
  const question = { direction: 'ascending' as const, root: pitch(60), interval: interval(7), pitches: [pitch(60), pitch(67)] }
  const asked = sessionReducer(initialSession, { type: 'setQuestion', question })

  it('appends wrong marks and records the feedback', () => {
    const one = sessionReducer(asked, { type: 'guess', interval: interval(3) })
    const two = sessionReducer(one, { type: 'guess', interval: interval(9) })
    expect(two.practice.wrongMarks).toEqual([3, 9])
    expect(two.feedback).toEqual({ kind: 'wrong', interval: 9 })
    expect(two.practice.question).toBe(question)
  })

  it('ignores repeats, the right answer, no question and revealed', () => {
    const one = sessionReducer(asked, { type: 'guess', interval: interval(3) })
    expect(sessionReducer(one, { type: 'guess', interval: interval(3) })).toBe(one)
    expect(sessionReducer(asked, { type: 'guess', interval: interval(7) })).toBe(asked)
    expect(sessionReducer(initialSession, { type: 'guess', interval: interval(3) })).toBe(initialSession)
    const revealed = sessionReducer(asked, { type: 'reveal' })
    expect(sessionReducer(revealed, { type: 'guess', interval: interval(3) })).toBe(revealed)
  })

  it('reveal and a new question clear the feedback, and marks reset on a new question', () => {
    const wrong = sessionReducer(asked, { type: 'guess', interval: interval(3) })
    expect(sessionReducer(wrong, { type: 'reveal' }).feedback).toBeNull()
    const next = sessionReducer(wrong, { type: 'setQuestion', question })
    expect(next.feedback).toBeNull()
    expect(next.practice.wrongMarks).toEqual([])
    expect(sessionReducer(next, { type: 'rightGuess', interval: interval(7) }).feedback).toEqual({ kind: 'right', interval: 7 })
  })

  it('keeps the feedback and marks across mode and instrument changes', () => {
    const wrong = sessionReducer(asked, { type: 'guess', interval: interval(3) })
    const back = sessionReducer(sessionReducer(wrong, { type: 'setMode', mode: 'explore' }), { type: 'setMode', mode: 'listen' })
    expect(back.feedback).toEqual(wrong.feedback)
    expect(back.practice.wrongMarks).toEqual([3])
  })
})

describe('setup panel', () => {
  const question = { direction: 'ascending' as const, root: pitch(60), interval: interval(7), pitches: [pitch(60), pitch(67)] }

  it('opens and closes the panel', () => {
    expect(initialSession.setupOpen).toBe(false)
    const open = sessionReducer(initialSession, { type: 'toggleSetup' })
    expect(open.setupOpen).toBe(true)
    expect(sessionReducer(open, { type: 'closeSetup' }).setupOpen).toBe(false)
    expect(sessionReducer(open, { type: 'toggleSetup' }).setupOpen).toBe(false)
  })

  it('holds no setting', () => {
    expect(Object.keys(initialSession)).not.toContain('direction')
    expect(Object.keys(initialSession.practice)).not.toContain('pool')
  })

  it('keeps the question, reveal state and wrong marks', () => {
    let state = sessionReducer(initialSession, { type: 'setQuestion', question })
    state = sessionReducer(state, { type: 'guess', interval: interval(2) })
    const next = sessionReducer(state, { type: 'toggleSetup' })
    expect(next.practice.question).toBe(question)
    expect(next.practice.revealed).toBe(false)
    expect(next.practice.wrongMarks).toEqual([2])
  })
})
