import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { INSTRUMENT_RANGES } from '../../src/core/instruments'
import { initialPractice, initialWorkspace } from '../../src/core/model'
import { generateQuestion, type Random } from '../../src/core/practice'
import { INTERVALS } from '../../src/core/theory'

function seeded(seed: number): Random {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const allIntervals = INTERVALS.map((i) => i.semitones)

describe('generateQuestion', () => {
  it('yields the same interval and root for the same seed', () => {
    const a = generateQuestion({ pool: allIntervals, range: INSTRUMENT_RANGES.piano, random: seeded(42) })
    const b = generateQuestion({ pool: allIntervals, range: INSTRUMENT_RANGES.piano, random: seeded(42) })
    expect(a).toEqual(b)
  })

  it('varies with the seed', () => {
    const questions = new Set(
      Array.from({ length: 20 }, (_, seed) =>
        JSON.stringify(generateQuestion({ pool: allIntervals, range: INSTRUMENT_RANGES.piano, random: seeded(seed) })),
      ),
    )
    expect(questions.size).toBeGreaterThan(1)
  })

  it('lists the root first and the upper note second, ascending', () => {
    const q = generateQuestion({ pool: allIntervals, range: INSTRUMENT_RANGES.piano, random: seeded(7) })
    expect(q.pitches).toEqual([q.root, q.root + q.interval])
  })

  it.each(['piano', 'guitar'] as const)('keeps every note inside the %s range for every interval', (name) => {
    const range = INSTRUMENT_RANGES[name]
    for (const semitones of allIntervals) {
      for (let seed = 0; seed < 200; seed++) {
        const q = generateQuestion({ pool: [semitones], range, random: seeded(seed) })
        expect(q.interval).toBe(semitones)
        for (const p of q.pitches) {
          expect(p).toBeGreaterThanOrEqual(range.low)
          expect(p).toBeLessThanOrEqual(range.high)
        }
      }
    }
  })

  it('reaches both ends of the range when the random function does', () => {
    const range = INSTRUMENT_RANGES.piano
    const [m2] = allIntervals
    const low = generateQuestion({ pool: [m2], range, random: () => 0 })
    const high = generateQuestion({ pool: [m2], range, random: () => 0.999999 })
    expect(low.root).toBe(range.low)
    expect(high.pitches[1]).toBe(range.high)
  })
})

describe('core determinism', () => {
  it('never calls Math.random', () => {
    const dir = join(process.cwd(), 'src', 'core')
    for (const name of readdirSync(dir)) {
      expect(readFileSync(join(dir, name), 'utf8'), name).not.toMatch(/Math\.random/)
    }
  })
})

describe('session model parts', () => {
  it('starts with no question, nothing revealed, no wrong marks and the full pool', () => {
    expect(initialPractice.question).toBeNull()
    expect(initialPractice.revealed).toBe(false)
    expect(initialPractice.wrongMarks).toEqual([])
    expect(initialPractice.pool).toEqual(allIntervals)
  })

  it('starts with an empty workspace', () => {
    expect(initialWorkspace.pitches).toEqual([])
  })

  it('is plain serializable data', () => {
    const data = { workspace: initialWorkspace, practice: initialPractice }
    expect(JSON.parse(JSON.stringify(data))).toEqual(data)
  })
})
