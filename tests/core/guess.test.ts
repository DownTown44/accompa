import { describe, expect, it } from 'vitest'
import { canGuess, inPlay } from '../../src/core/guess'
import { interval } from '../../src/core/pitch'

const i = interval
const pool = [i(3), i(4), i(7)]

describe('canGuess', () => {
  it('accepts an interval in the pool that is untried and not the answer', () => {
    expect(canGuess(i(3), pool, i(7), [])).toBe(true)
  })

  it('accepts the answer when it is not in the pool', () => {
    expect(canGuess(i(10), pool, i(10), [])).toBe(true)
  })

  it('rejects an interval outside the pool that is not the answer', () => {
    expect(canGuess(i(10), pool, i(7), [])).toBe(false)
  })

  it('rejects an interval already tried', () => {
    expect(canGuess(i(3), pool, i(7), [i(3)])).toBe(false)
  })
})

describe('inPlay', () => {
  it('is true for a pool interval or the answer, and false otherwise', () => {
    expect(inPlay(interval(3), [interval(3)], interval(7))).toBe(true)
    expect(inPlay(interval(7), [interval(3)], interval(7))).toBe(true)
    expect(inPlay(interval(5), [interval(3)], interval(7))).toBe(false)
  })
})

describe('generic guesses', () => {
  it('works on quality names', () => {
    expect(inPlay('dim7', ['major'], 'dim7')).toBe(true)
    expect(canGuess('minor', ['major', 'minor'], 'major', [])).toBe(true)
    expect(canGuess('minor', ['major', 'minor'], 'major', ['minor'])).toBe(false)
    expect(canGuess('dim7', ['major', 'minor'], 'major', [])).toBe(false)
  })
})
