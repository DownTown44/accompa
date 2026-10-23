import { describe, expect, it } from 'vitest'
import { initialSession, sessionReducer } from '../../src/ui/session'

describe('sessionReducer', () => {
  it('starts in Listen on the piano', () => {
    expect(initialSession).toEqual({ mode: 'listen', instrument: 'piano' })
  })

  it('sets the mode', () => {
    expect(sessionReducer(initialSession, { type: 'setMode', mode: 'explore' }).mode).toBe('explore')
  })

  it('sets the instrument', () => {
    expect(sessionReducer(initialSession, { type: 'setInstrument', instrument: 'guitar' }).instrument).toBe('guitar')
  })

  it('toggles between the two modes and the two instruments', () => {
    const explore = sessionReducer(initialSession, { type: 'toggleMode' })
    expect(explore.mode).toBe('explore')
    expect(sessionReducer(explore, { type: 'toggleMode' }).mode).toBe('listen')
    const guitar = sessionReducer(initialSession, { type: 'toggleInstrument' })
    expect(guitar.instrument).toBe('guitar')
    expect(sessionReducer(guitar, { type: 'toggleInstrument' }).instrument).toBe('piano')
  })

  it('keeps the instrument when the mode changes and the mode when the instrument changes', () => {
    const guitarExplore = sessionReducer(sessionReducer(initialSession, { type: 'setInstrument', instrument: 'guitar' }), { type: 'setMode', mode: 'explore' })
    expect(guitarExplore).toEqual({ mode: 'explore', instrument: 'guitar' })
  })

  it('does not mutate the previous state', () => {
    sessionReducer(initialSession, { type: 'toggleMode' })
    expect(initialSession.mode).toBe('listen')
  })
})
