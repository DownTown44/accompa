import { describe, expect, it } from 'vitest'
import { GUITAR_FRETS, INSTRUMENT_RANGES, STANDARD_GUITAR_TUNING, pitchAt, positionsForPitch, closestPair } from '../../src/core/instruments'
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

describe('closestPair', () => {
  it('puts A2 to E3 on the open A string and D string fret 2', () => {
    expect(closestPair(pitch(45), pitch(52))).toEqual({ root: { string: 1, fret: 0 }, upper: { string: 2, fret: 2 } })
  })

  it('gives one position per note that sounds the right pitch', () => {
    for (let root = 40; root <= 70; root++) {
      const pair = closestPair(pitch(root), pitch(root + 7))!
      expect(pitchAt(STANDARD_GUITAR_TUNING, pair.root.string, pair.root.fret)).toBe(root)
      expect(pitchAt(STANDARD_GUITAR_TUNING, pair.upper.string, pair.upper.fret)).toBe(root + 7)
    }
  })

  it('prefers the nearer strings over lower frets', () => {
    // E3 to B3: the open-B pair is two frets apart but two strings apart; the D-string fret 2 to G-string fret 4 pair is nearer.
    expect(closestPair(pitch(52), pitch(59))).toEqual({ root: { string: 2, fret: 2 }, upper: { string: 3, fret: 4 } })
  })

  it('breaks a distance tie with the lowest frets', () => {
    // D3 to G3: three pairs sit one string apart on the same fret; the open strings win.
    expect(closestPair(pitch(50), pitch(55))).toEqual({ root: { string: 2, fret: 0 }, upper: { string: 3, fret: 0 } })
  })

  it('is null when a note is off the fretboard', () => {
    expect(closestPair(pitch(30), pitch(37))).toBeNull()
  })
})
