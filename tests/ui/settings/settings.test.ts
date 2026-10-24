import { describe, expect, it } from 'vitest'
import { initialSettings } from '../../../src/core/model'
import { interval } from '../../../src/core/pitch'
import { INTERVALS } from '../../../src/core/theory'
import { settingsReducer } from '../../../src/ui/settings/settings'

describe('settings reducer', () => {
  it('starts with every interval, Ascending, Synthesized and System', () => {
    expect(initialSettings.pool).toEqual(INTERVALS.map((i) => i.semitones))
    expect(initialSettings.direction).toBe('ascending')
    expect(initialSettings.rootMode).toBe('random')
    expect(initialSettings.sound).toBe('synthesized')
    expect(initialSettings.theme).toBe('system')
  })

  it('removes and restores an interval in table order', () => {
    const without = settingsReducer(initialSettings, { type: 'togglePool', interval: interval(2) })
    expect(without.pool).not.toContain(2)
    expect(settingsReducer(without, { type: 'togglePool', interval: interval(2) }).pool).toEqual(initialSettings.pool)
  })

  it('refuses to empty the pool and ignores a foreign interval', () => {
    let state = initialSettings
    for (const { semitones } of INTERVALS.slice(1)) state = settingsReducer(state, { type: 'togglePool', interval: semitones })
    expect(state.pool).toEqual([1])
    expect(settingsReducer(state, { type: 'togglePool', interval: interval(1) })).toBe(state)
    expect(settingsReducer(state, { type: 'togglePool', interval: 99 as never })).toBe(state)
  })

  it('sets direction and theme, and returns the same state when nothing changes', () => {
    const down = settingsReducer(initialSettings, { type: 'setDirection', direction: 'descending' })
    expect(down.direction).toBe('descending')
    expect(settingsReducer(down, { type: 'setDirection', direction: 'descending' })).toBe(down)
    const dark = settingsReducer(initialSettings, { type: 'setTheme', theme: 'dark' })
    expect(dark.theme).toBe('dark')
    expect(settingsReducer(dark, { type: 'setTheme', theme: 'dark' })).toBe(dark)
    expect(settingsReducer(initialSettings, { type: 'setSound', sound: 'synthesized' })).toBe(initialSettings)
  })

  it('does not mutate and stays serializable', () => {
    const next = settingsReducer(initialSettings, { type: 'setTheme', theme: 'light' })
    expect(initialSettings.theme).toBe('system')
    expect(JSON.parse(JSON.stringify(next))).toEqual(next)
  })

  it('sets the root mode and returns the same state when nothing changes', () => {
    const fixed = settingsReducer(initialSettings, { type: 'setRootMode', rootMode: 'fixed' })
    expect(fixed.rootMode).toBe('fixed')
    expect(settingsReducer(fixed, { type: 'setRootMode', rootMode: 'fixed' })).toBe(fixed)
  })
})
