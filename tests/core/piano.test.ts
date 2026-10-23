import { describe, expect, it } from 'vitest'
import { pitch } from '../../src/core/pitch'
import { DEFAULT_WINDOW_START, fitWindow, isBlackKey, offscreenLit, offscreenNote, shiftWindow, windowPitches } from '../../src/core/piano'

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

describe('fitWindow', () => {
  it('keeps a window that already shows the pitches', () => {
    expect(fitWindow(48, [pitch(50), pitch(57)])).toBe(48)
  })

  it('shifts by octaves to the nearest window', () => {
    expect(fitWindow(48, [pitch(40), pitch(47)])).toBe(36)
    expect(fitWindow(36, [pitch(80), pitch(83)])).toBe(48)
    expect(fitWindow(36, [pitch(86), pitch(91)])).toBe(60)
  })

  it('never leaves the piano range', () => {
    for (let low = 36; low <= 84; low++) {
      const start = fitWindow(48, [pitch(low), pitch(low + 12)])
      expect(start).toBeGreaterThanOrEqual(36)
      expect(start).toBeLessThanOrEqual(60)
    }
  })
})
