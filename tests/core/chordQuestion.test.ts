import { describe, expect, it } from 'vitest'
import { nameChord } from '../../src/core/chords'
import { COMMON_RANGE } from '../../src/core/instruments'
import { generateChordQuestion } from '../../src/core/practice'
import { CHORD_QUALITIES } from '../../src/core/theory'

const all = CHORD_QUALITIES.map((q) => q.name)
const fixed = (...values: number[]) => {
  let i = 0
  return () => values[i++ % values.length]!
}

describe('generateChordQuestion', () => {
  it('draws major on E2 for seeds 0, 0', () => {
    const q = generateChordQuestion({ pool: all, range: COMMON_RANGE, random: fixed(0, 0) })
    expect(q.quality).toBe('major')
    expect(q.root).toBe(40)
    expect(q.pitches).toEqual([40, 44, 47])
    expect(nameChord(q.pitches)[0]).toMatchObject({ root: 4, quality: { name: 'major' } })
  })

  it('draws dim7 on 77 at the top seed, inside the range', () => {
    const q = generateChordQuestion({ pool: all, range: COMMON_RANGE, random: fixed(0.999999, 0.999999) })
    expect(q.quality).toBe('dim7')
    expect(q.pitches).toEqual([77, 80, 83, 86])
  })

  it('keeps to a pool of one', () => {
    for (const seed of [0, 0.3, 0.7, 0.999999]) {
      expect(generateChordQuestion({ pool: ['minor'], range: COMMON_RANGE, random: fixed(seed, 0.5) }).quality).toBe('minor')
    }
  })

  it('fits the range for every quality at both extremes', () => {
    for (const q of CHORD_QUALITIES) {
      for (const seed of [0, 0.999999]) {
        const { pitches } = generateChordQuestion({ pool: [q.name], range: COMMON_RANGE, random: fixed(0, seed) })
        expect(Math.min(...pitches)).toBeGreaterThanOrEqual(COMMON_RANGE.low)
        expect(Math.max(...pitches)).toBeLessThanOrEqual(COMMON_RANGE.high)
      }
    }
  })
})
