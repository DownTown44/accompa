import { describe, expect, it } from 'vitest'
import { pitch, interval } from '../../src/core/pitch'
import { initialSession, sessionReducer } from '../../src/ui/session'

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
