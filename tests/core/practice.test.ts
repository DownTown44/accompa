import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { COMMON_RANGE, INSTRUMENT_RANGES } from '../../src/core/instruments'
import { initialPractice, initialWorkspace } from '../../src/core/model'
import { generateQuestion, type Random } from '../../src/core/practice'
import { pitch } from '../../src/core/pitch'
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
  it('starts descending and harmonic questions as the matrix says', () => {
    const base = () => ({ pool: [7 as never], range: INSTRUMENT_RANGES.piano, random: seeded(3) })
    const up = generateQuestion({ ...base(), direction: 'ascending' })
    const down = generateQuestion({ ...base(), direction: 'descending' })
    const together = generateQuestion({ ...base(), direction: 'harmonic' })
    expect(down.root).toBe(down.pitches[0])
    expect(down.pitches).toEqual([down.root, down.root - 7])
    expect(together.pitches).toEqual([together.root, together.root + 7])
    expect(up.pitches).toEqual([up.root, up.root + 7])
    expect(down.pitches[1]).toBe(up.pitches[0])
  })

  it('yields the same interval and root for the same seed', () => {
    const a = generateQuestion({ pool: allIntervals, range: INSTRUMENT_RANGES.piano, random: seeded(42), direction: 'ascending' })
    const b = generateQuestion({ pool: allIntervals, range: INSTRUMENT_RANGES.piano, random: seeded(42), direction: 'ascending' })
    expect(a).toEqual(b)
  })

  it('varies with the seed', () => {
    const questions = new Set(
      Array.from({ length: 20 }, (_, seed) =>
        JSON.stringify(generateQuestion({ pool: allIntervals, range: INSTRUMENT_RANGES.piano, random: seeded(seed), direction: 'ascending' })),
      ),
    )
    expect(questions.size).toBeGreaterThan(1)
  })

  it('lists the root first and the upper note second, ascending', () => {
    const q = generateQuestion({ pool: allIntervals, range: INSTRUMENT_RANGES.piano, random: seeded(7), direction: 'ascending' })
    expect(q.pitches).toEqual([q.root, q.root + q.interval])
  })

  it.each(['piano', 'guitar'] as const)('keeps every note inside the %s range for every interval and direction', (name) => {
    const range = INSTRUMENT_RANGES[name]
    for (const direction of ['ascending', 'descending', 'harmonic'] as const) {
      for (const semitones of allIntervals) {
        for (let seed = 0; seed < 200; seed++) {
          const q = generateQuestion({ pool: [semitones], range, random: seeded(seed), direction })
          expect(q.direction).toBe(direction)
          expect(q.interval).toBe(semitones)
          for (const p of q.pitches) {
            expect(p).toBeGreaterThanOrEqual(range.low)
            expect(p).toBeLessThanOrEqual(range.high)
          }
        }
      }
    }
  })

  it('reaches both ends of the range when the random function does', () => {
    const range = INSTRUMENT_RANGES.piano
    const [m2] = allIntervals
    const low = generateQuestion({ pool: [m2], range, random: () => 0, direction: 'ascending' })
    const high = generateQuestion({ pool: [m2], range, random: () => 0.999999, direction: 'ascending' })
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
  it('starts with no question, nothing revealed, no wrong marks', () => {
    expect(initialPractice.question).toBeNull()
    expect(initialPractice.revealed).toBe(false)
    expect(initialPractice.wrongMarks).toEqual([])
    expect(initialPractice.fixedRoot).toBeNull()
  })

  it('starts with an empty workspace', () => {
    expect(initialWorkspace.pitches).toEqual([])
  })

  it('is plain serializable data', () => {
    const data = { workspace: initialWorkspace, practice: initialPractice }
    expect(JSON.parse(JSON.stringify(data))).toEqual(data)
  })
})

describe('generateQuestion with a fixed root', () => {
  const range = COMMON_RANGE
  const A3 = pitch(57)

  it('keeps the pitch class and fits the interval, for every interval and direction', () => {
    for (const direction of ['ascending', 'descending', 'harmonic'] as const) {
      for (const semitones of allIntervals) {
        for (let target = range.low; target <= range.high; target++) {
          const q = generateQuestion({ pool: [semitones], range, random: seeded(target), direction, fixedRoot: pitch(target) })
          expect(q.pitches[0]).toBe(q.root)
          expect(q.root % 12).toBe(target % 12)
          for (const p of q.pitches) {
            expect(p).toBeGreaterThanOrEqual(range.low)
            expect(p).toBeLessThanOrEqual(range.high)
          }
          const octaves = [q.root - 12, q.root + 12]
          const fits = (r: number) => (direction === 'descending' ? r - semitones >= range.low && r <= range.high : r >= range.low && r + semitones <= range.high)
          for (const other of octaves) {
            if (!fits(other)) continue
            expect(Math.abs(other - target)).toBeGreaterThanOrEqual(Math.abs(q.root - target))
            if (Math.abs(other - target) === Math.abs(q.root - target)) expect(other).toBeGreaterThan(q.root)
          }
        }
      }
    }
  })

  it('uses the clicked octave when it fits', () => {
    const up = generateQuestion({ pool: [7 as never], range, random: seeded(1), direction: 'ascending', fixedRoot: A3 })
    expect(up.pitches).toEqual([57, 64])
    const down = generateQuestion({ pool: [7 as never], range, random: seeded(1), direction: 'descending', fixedRoot: A3 })
    expect(down.pitches).toEqual([57, 50])
  })

  it('moves the octave down when a perfect octave would not fit', () => {
    const q = generateQuestion({ pool: [12 as never], range, random: seeded(1), direction: 'ascending', fixedRoot: pitch(range.high) })
    expect(q.root + 12).toBeLessThanOrEqual(range.high)
  })

  it('breaks a tie toward the lower octave', () => {
    const q = generateQuestion({ pool: [1 as never], range, random: seeded(1), direction: 'ascending', fixedRoot: pitch(48 + 6) })
    expect(q.root).toBe(54)
    const tie = generateQuestion({ pool: [1 as never], range: { low: 48, high: 72 }, random: seeded(1), direction: 'ascending', fixedRoot: pitch(60) })
    expect(tie.root).toBe(60)
    const half = generateQuestion({ pool: [1 as never], range: { low: 40, high: 70 }, random: seeded(1), direction: 'ascending', fixedRoot: pitch(55) })
    expect(half.root).toBe(55)
  })
})
