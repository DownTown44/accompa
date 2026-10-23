import { describe, expect, it } from 'vitest'
import { STANDARD_GUITAR_TUNING } from '../../src/core/instruments'
import { INTERVALS } from '../../src/core/theory'
import { interval, pitch, pitchClass } from '../../src/core/pitch'
import { octaveLabel, spellInterval, stringNames } from '../../src/core/spelling'

describe('octaveLabel', () => {
  it('labels C keys', () => {
    expect(octaveLabel(pitch(48))).toBe('C3')
    expect(octaveLabel(pitch(60))).toBe('C4')
    expect(octaveLabel(pitch(36))).toBe('C2')
    expect(octaveLabel(pitch(72))).toBe('C5')
  })
})

describe('stringNames', () => {
  it('names standard tuning E A D G B e', () => {
    expect(stringNames(STANDARD_GUITAR_TUNING)).toEqual(['E', 'A', 'D', 'G', 'B', 'e'])
  })

  it('follows another tuning', () => {
    expect(stringNames([38, 45, 50, 55, 59, 64].map(pitch))).toEqual(['D', 'A', 'd', 'G', 'B', 'E'])
  })
})

describe('spellInterval', () => {
  const LETTERS = 'CDEFGAB'
  const SIZE: Record<number, number> = { 1: 2, 2: 2, 3: 3, 4: 3, 5: 4, 6: 4, 7: 5, 8: 6, 9: 6, 10: 7, 11: 7, 12: 8 }
  const NATURAL: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
  const SHIFT: Record<string, number> = { '': 0, '♯': 1, '♭': -1, '𝄪': 2, '𝄫': -2 }
  const rows = INTERVALS.flatMap((i) => Array.from({ length: 12 }, (_, root) => [i.semitones, root] as const))
  const letterOf = (name: string) => LETTERS.indexOf(name[0]!)
  const classOf = (name: string) => (((NATURAL[name[0]!]! + SHIFT[name.slice(1)]!) % 12) + 12) % 12

  it.each(rows)('interval %i from pitch class %i', (semitones, root) => {
    const { root: rootName, upper } = spellInterval(pitch(60 + root), interval(semitones))
    expect(letterOf(upper)).toBe((letterOf(rootName) + SIZE[semitones]! - 1) % 7)
    expect(classOf(upper)).toBe(pitchClass(pitch(60 + root + semitones)))
    expect(classOf(rootName)).toBe(root)
  })

  it('uses the root table', () => {
    const names = Array.from({ length: 12 }, (_, i) => spellInterval(pitch(60 + i), interval(7)).root)
    expect(names).toEqual(['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'])
  })

  it('spells 6 semitones as A4 from every root', () => {
    for (let root = 0; root < 12; root++) {
      const { root: r, upper } = spellInterval(pitch(60 + root), interval(6))
      expect(letterOf(upper)).toBe((letterOf(r) + 3) % 7)
    }
    expect(spellInterval(pitch(60), interval(6)).upper).toBe('F♯')
  })

  it.each([
    [61, 4, 'C♯', 'E♯'],
    [63, 7, 'E♭', 'B♭'],
    [68, 4, 'A♭', 'C'],
    [60, 3, 'C', 'E♭'],
    [60, 6, 'C', 'F♯'],
    [66, 6, 'F♯', 'B♯'],
    [70, 11, 'B♭', 'A'],
    [62, 8, 'D', 'B♭'],
    [60, 12, 'C', 'C'],
  ])('spells %i plus %i semitones as %s to %s', (root, semitones, from, to) => {
    expect(spellInterval(pitch(root), interval(semitones))).toEqual({ root: from, upper: to })
  })

  it('allows double accidentals', () => {
    expect(spellInterval(pitch(61), interval(6)).upper).toBe('F𝄪')
  })
})
