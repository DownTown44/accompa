import { afterEach, describe, expect, it, vi } from 'vitest'
import { initialSettings } from '../../../src/core/model'
import { interval } from '../../../src/core/pitch'
import { loadSettings, saveSetting } from '../../../src/ui/settings/settingsStorage'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('settings storage', () => {
  it('falls back to the defaults when nothing is saved', () => {
    expect(loadSettings()).toEqual(initialSettings)
  })

  it('round-trips pool, sound and theme as JSON under three keys', () => {
    saveSetting('pool', [interval(7), interval(12)])
    saveSetting('sound', 'synthesized')
    saveSetting('theme', 'dark')
    expect(JSON.parse(localStorage.getItem('accompa.pool')!)).toEqual([7, 12])
    expect(JSON.parse(localStorage.getItem('accompa.sound')!)).toBe('synthesized')
    expect(JSON.parse(localStorage.getItem('accompa.theme')!)).toBe('dark')
    expect(localStorage.length).toBe(3)
    expect(loadSettings()).toEqual({ ...initialSettings, pool: [7, 12], theme: 'dark' })
  })

  it('never restores a direction', () => {
    localStorage.setItem('accompa.direction', '"descending"')
    expect(loadSettings().direction).toBe('ascending')
  })

  it.each(['"x"', '[]', '[99]', '[7, 99]', 'not json', '{"a":1}'])('falls back to every interval for pool %s', (raw) => {
    localStorage.setItem('accompa.pool', raw)
    expect(loadSettings().pool).toEqual(initialSettings.pool)
  })

  it.each(['"x"', '[]', '"purple"', 'not json', '3'])('falls back for sound and theme %s', (raw) => {
    localStorage.setItem('accompa.sound', raw)
    localStorage.setItem('accompa.theme', raw)
    const loaded = loadSettings()
    expect(loaded.sound).toBe('synthesized')
    expect(loaded.theme).toBe('system')
  })

  it('never throws when storage fails', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    expect(loadSettings()).toEqual(initialSettings)
    expect(() => saveSetting('pool', [interval(7)])).not.toThrow()
    expect(() => saveSetting('theme', 'light')).not.toThrow()
  })
})
