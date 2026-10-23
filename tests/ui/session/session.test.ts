import { describe, expect, it } from 'vitest'
import { pitch, interval } from '../../../src/core/pitch'
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
    const question = { root: pitch(60), interval: interval(7), pitches: [pitch(60), pitch(67)] }
    const next = sessionReducer(initialSession, { type: 'setQuestion', question })
    expect(next.practice.question).toBe(question)
    expect(next.workspace).toBe(initialSession.workspace)
  })

  it('keeps the question when the mode or instrument changes', () => {
    const question = { root: pitch(60), interval: interval(7), pitches: [pitch(60), pitch(67)] }
    let state = sessionReducer(initialSession, { type: 'setQuestion', question })
    state = sessionReducer(state, { type: 'setMode', mode: 'explore' })
    state = sessionReducer(state, { type: 'toggleInstrument' })
    state = sessionReducer(state, { type: 'setMode', mode: 'listen' })
    expect(state.practice.question).toBe(question)
  })
})

describe('instrument swap', () => {
  it('changes only the instrument, there and back', () => {
    const question = { root: pitch(60), interval: interval(7), pitches: [pitch(60), pitch(67)] }
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
  const question = { root: pitch(40), interval: interval(7), pitches: [pitch(40), pitch(47)] }
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
  const question = { root: pitch(40), interval: interval(7), pitches: [pitch(40), pitch(47)] }
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
