import { describe, expect, it } from 'vitest'
import { INSTRUMENT_RANGES } from '../../src/core/instruments'
import { interval, pitch, pitchClass } from '../../src/core/pitch'
import { INTERVALS } from '../../src/core/theory'

describe('INTERVALS', () => {
  it('holds m2 to P8 in semitone order', () => {
    expect(INTERVALS.map((i) => i.abbreviation)).toEqual(['m2', 'M2', 'm3', 'M3', 'P4', 'A4', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'])
    expect(INTERVALS.map((i) => i.semitones)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  })

  it('names six semitones A4', () => {
    const six = INTERVALS.find((i) => i.semitones === 6)
    expect(six?.abbreviation).toBe('A4')
    expect(six?.name).toBe('augmented fourth')
  })

  it('gives every interval a name', () => {
    for (const i of INTERVALS) expect(i.name.length).toBeGreaterThan(0)
  })
})

describe('branded types', () => {
  it('builds an interval from a semitone count', () => {
    expect(interval(7)).toBe(7)
  })

  it('keeps pitch, pitch class and interval distinct at compile time', () => {
    // @ts-expect-error a pitch class is not a pitch
    const notAPitch: ReturnType<typeof pitch> = pitchClass(pitch(60))
    // @ts-expect-error an interval is not a pitch
    const alsoNot: ReturnType<typeof pitch> = interval(7)
    expect([notAPitch, alsoNot]).toHaveLength(2)
  })
})

describe('INSTRUMENT_RANGES', () => {
  it('gives the piano MIDI 36 to 96', () => {
    expect(INSTRUMENT_RANGES.piano).toEqual({ low: 36, high: 96 })
  })

  it('derives the guitar range from standard tuning and 22 frets', () => {
    expect(INSTRUMENT_RANGES.guitar).toEqual({ low: 40, high: 86 })
  })
})
