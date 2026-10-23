import { describe, expect, it } from 'vitest'
import { pitch } from '../../src/core/pitch'
import { DEFAULT_WINDOW_START, isBlackKey, offscreenLit, offscreenNote, shiftWindow, windowPitches } from '../../src/core/piano'

describe('piano window', () => {
  it('defaults to C3', () => expect(DEFAULT_WINDOW_START).toBe(48))

  it('spans 36 pitches with 21 white and 15 black keys', () => {
    const keys = windowPitches(48)
    expect(keys).toHaveLength(36)
    expect(keys[0]).toBe(48)
    expect(keys[35]).toBe(83)
    expect(keys.filter(isBlackKey)).toHaveLength(15)
  })

  it('knows the black keys', () => {
    expect([60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71].map((m) => isBlackKey(pitch(m)))).toEqual([
      false, true, false, true, false, false, true, false, true, false, true, false,
    ])
  })

  it('shifts by an octave and clamps at 36 and 60', () => {
    expect(shiftWindow(48, 1)).toBe(60)
    expect(shiftWindow(48, -1)).toBe(36)
    expect(shiftWindow(60, 1)).toBe(60)
    expect(shiftWindow(36, -1)).toBe(36)
  })

  it('counts lit notes outside the window', () => {
    const lit = [40, 41, 48, 83, 84, 90, 95].map(pitch)
    expect(offscreenLit(lit, 48)).toEqual({ below: 2, above: 3 })
    expect(offscreenLit([], 48)).toEqual({ below: 0, above: 0 })
  })

  it('words the offscreen note', () => {
    expect(offscreenNote({ below: 2, above: 0 })).toBe('◀ 2 notes lit')
    expect(offscreenNote({ below: 0, above: 3 })).toBe('3 notes lit ▶')
    expect(offscreenNote({ below: 2, above: 3 })).toBe('◀ 2 notes lit · 3 notes lit ▶')
    expect(offscreenNote({ below: 0, above: 1 })).toBe('1 note lit ▶')
    expect(offscreenNote({ below: 0, above: 0 })).toBeUndefined()
  })
})
