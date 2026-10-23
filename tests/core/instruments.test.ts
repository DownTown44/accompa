import { describe, expect, it } from 'vitest'
import { GUITAR_FRETS, INSTRUMENT_RANGES, STANDARD_GUITAR_TUNING, pitchAt, positionsForPitch } from '../../src/core/instruments'
import { pitch } from '../../src/core/pitch'

describe('positionsForPitch', () => {
  it('finds every position of E4 within 22 frets', () => {
    expect(positionsForPitch(pitch(64))).toEqual([
      { string: 1, fret: 19 },
      { string: 2, fret: 14 },
      { string: 3, fret: 9 },
      { string: 4, fret: 5 },
      { string: 5, fret: 0 },
    ])
  })

  it('returns a position for every pitch in range and each round-trips', () => {
    const { low, high } = INSTRUMENT_RANGES.guitar
    for (let m = low; m <= high; m++) {
      const found = positionsForPitch(pitch(m))
      expect(found.length).toBeGreaterThan(0)
      for (const { string, fret } of found) {
        expect(fret).toBeGreaterThanOrEqual(0)
        expect(fret).toBeLessThanOrEqual(GUITAR_FRETS)
        expect(pitchAt(STANDARD_GUITAR_TUNING, string, fret)).toBe(m)
      }
    }
  })

  it('returns nothing outside the range', () => {
    expect(positionsForPitch(pitch(39))).toEqual([])
    expect(positionsForPitch(pitch(87))).toEqual([])
  })

  it('follows the tuning and fret count passed in', () => {
    const dropD = [38, 45, 50, 55, 59, 64].map(pitch)
    expect(positionsForPitch(pitch(38), dropD)).toEqual([{ string: 0, fret: 0 }])
    expect(positionsForPitch(pitch(64), dropD, 5)).toEqual([
      { string: 4, fret: 5 },
      { string: 5, fret: 0 },
    ])
    expect(pitchAt(dropD, 0, 2)).toBe(40)
  })
})
