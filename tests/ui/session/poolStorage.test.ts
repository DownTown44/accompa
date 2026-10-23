import { afterEach, describe, expect, it, vi } from 'vitest'
import { allIntervals, loadPool, savePool } from '../../../src/ui/session/poolStorage'
import { interval } from '../../../src/core/pitch'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('pool storage', () => {
  it('falls back to every interval when nothing is saved', () => {
    expect(loadPool()).toEqual(allIntervals())
  })

  it('round-trips a saved pool as a JSON array of semitones', () => {
    savePool([interval(7), interval(12)])
    expect(JSON.parse(localStorage.getItem('accompa.pool')!)).toEqual([7, 12])
    expect(loadPool()).toEqual([7, 12])
  })

  it.each(['"x"', '[]', '[99]', '[7, 99]', 'not json', '{"a":1}'])('falls back to every interval for %s', (raw) => {
    localStorage.setItem('accompa.pool', raw)
    expect(loadPool()).toEqual(allIntervals())
  })

  it('never throws when storage fails', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    expect(loadPool()).toEqual(allIntervals())
    expect(() => savePool([interval(7)])).not.toThrow()
  })
})
