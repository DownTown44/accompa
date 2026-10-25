import { describe, expect, it } from 'vitest'
import { beyondFretboard, beyondFretboardNote, exploreReadout, litPositions, MAX_LIT, pairInterval, toggleLit } from '../../src/core/explore'
import { pitch } from '../../src/core/pitch'

const p = pitch

describe('toggleLit', () => {
  it('lights a pitch at the end and unlights a lit one', () => {
    expect(toggleLit([p(60)], p(67))).toEqual([60, 67])
    expect(toggleLit([p(60), p(67)], p(60))).toEqual([67])
  })

  it('keeps a third note and drops the oldest only past the cap', () => {
    expect(MAX_LIT).toBe(8)
    expect(toggleLit([p(60), p(67)], p(64))).toEqual([60, 67, 64])
    const full = [60, 61, 62, 63, 64, 65, 66, 67].map(p)
    expect(toggleLit(full, p(68))).toEqual([61, 62, 63, 64, 65, 66, 67, 68])
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

describe('exploreReadout for three or more', () => {
  const label = (...n: number[]) => exploreReadout(n.map(p))
  it('names a triad in any order', () => {
    expect(label(64, 60, 67)).toEqual({ label: 'C', name: 'C major' })
  })
  it('names an inversion with the bass', () => {
    expect(label(64, 67, 72)).toEqual({ label: 'C/E', name: 'C major over E' })
  })
  it('names a seventh', () => expect(label(60, 64, 67, 71)).toEqual({ label: 'Cmaj7', name: 'C maj7' }))
  it('lists notes low to high when no chord fits', () => {
    expect(label(66, 60, 62)).toEqual({ label: 'C D F♯' })
  })
  it('lists two pitch classes instead of an interval', () => {
    expect(label(60, 64, 72)).toEqual({ label: 'C E' })
  })
  it.each([
    [[60, 64, 67], 'C'],
    [[60, 63, 67], 'Cm'],
    [[60, 63, 66], 'Cdim'],
    [[60, 64, 68], 'Caug'],
    [[60, 64, 67, 71], 'Cmaj7'],
    [[60, 64, 67, 70], 'C7'],
    [[60, 63, 67, 70], 'Cm7'],
    [[60, 63, 66, 70], 'Cm7♭5'],
    [[60, 63, 66, 69], 'Cdim7'],
  ])('reads %j as %s', (notes, symbol) => {
    expect(label(...notes)?.label).toBe(symbol)
  })
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

describe('beyondFretboard', () => {
  it('counts none when every note has a place', () => {
    expect(beyondFretboard([], {})).toBe(0)
    expect(beyondFretboard([p(60), p(67)], {})).toBe(0)
  })

  it('counts one or two notes beyond the fretboard', () => {
    expect(beyondFretboard([p(90)], {})).toBe(1)
    expect(beyondFretboard([p(90), p(93)], {})).toBe(2)
  })

  it('counts only the notes beyond when the other is in range', () => {
    expect(beyondFretboard([p(60), p(90)], {})).toBe(1)
    expect(beyondFretboard([p(30), p(60)], {})).toBe(1)
  })

  it('does not count a note with a remembered position', () => {
    expect(beyondFretboard([p(60), p(90)], { 60: { string: 2, fret: 1 } })).toBe(1)
    expect(beyondFretboard([p(60)], { 60: { string: 2, fret: 1 } })).toBe(0)
  })
})

describe('beyondFretboardNote', () => {
  it('words one and two, and says nothing for none', () => {
    expect(beyondFretboardNote(0)).toBeUndefined()
    expect(beyondFretboardNote(1)).toBe('1 note lit beyond the fretboard')
    expect(beyondFretboardNote(2)).toBe('2 notes lit beyond the fretboard')
  })
})
