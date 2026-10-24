import { describe, expect, it } from 'vitest'
import { exploreReadout, litPositions, MAX_LIT, pairInterval, toggleLit } from '../../src/core/explore'
import { pitch } from '../../src/core/pitch'

const p = pitch

describe('toggleLit', () => {
  it('lights a pitch at the end and unlights a lit one', () => {
    expect(toggleLit([p(60)], p(67))).toEqual([60, 67])
    expect(toggleLit([p(60), p(67)], p(60))).toEqual([67])
  })

  it('drops the oldest when a third is added', () => {
    expect(MAX_LIT).toBe(2)
    expect(toggleLit([p(60), p(67)], p(64))).toEqual([67, 64])
  })
})

describe('pairInterval', () => {
  it.each([
    [60, 67, 'P5'],
    [67, 60, 'P5'],
    [60, 66, 'A4'],
    [66, 60, 'A4'],
    [60, 64, 'M3'],
    [60, 76, 'M3'],
    [60, 72, 'P8'],
    [60, 84, 'P8'],
    [60, 63, 'm3'],
    [48, 83, 'M7'],
  ])('names %i and %i as %s', (a, b, name) => {
    expect(pairInterval(p(a), p(b))?.abbreviation).toBe(name)
  })

  it('has no name for a repeated pitch', () => {
    expect(pairInterval(p(60), p(60))).toBeNull()
  })
})

describe('exploreReadout', () => {
  it('is empty with nothing lit', () => expect(exploreReadout([])).toBeNull())
  it('names one note without an octave', () => expect(exploreReadout([p(63)])).toEqual({ label: 'E♭' }))
  it('names the pair', () => expect(exploreReadout([p(67), p(60)])).toEqual({ label: 'P5', name: 'perfect fifth' }))
})

describe('litPositions', () => {
  it('uses a remembered position', () => {
    expect(litPositions([p(64)], { 64: { string: 4, fret: 5 } })).toEqual([{ string: 4, fret: 5 }])
  })

  it('falls back to the lowest fret for one pitch', () => {
    expect(litPositions([p(64)], {})).toEqual([{ string: 5, fret: 0 }])
  })

  it('falls back to the closest pair for two', () => {
    const [a, b] = litPositions([p(67), p(60)], {})
    expect(Math.abs(a!.string - b!.string) + Math.abs(a!.fret - b!.fret)).toBeLessThanOrEqual(4)
  })

  it('keeps a remembered position and puts the other pitch at its lowest fret', () => {
    expect(litPositions([p(64), p(67)], { 64: { string: 4, fret: 5 } })).toEqual([
      { string: 4, fret: 5 },
      { string: 5, fret: 3 },
    ])
  })

  it('has no position for a pitch the guitar cannot play', () => {
    expect(litPositions([p(96)], {})).toEqual([null])
  })
})
