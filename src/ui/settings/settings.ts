import type { Direction, Settings, Sound, Theme } from '../../core/model'
import type { Interval } from '../../core/pitch'
import { INTERVALS } from '../../core/theory'

export type SettingsAction =
  | { type: 'togglePool'; interval: Interval }
  | { type: 'setDirection'; direction: Direction }
  | { type: 'setSound'; sound: Sound }
  | { type: 'setTheme'; theme: Theme }

export function settingsReducer(state: Settings, action: SettingsAction): Settings {
  switch (action.type) {
    // The question in play is never touched; the next one draws from the new pool.
    case 'togglePool': {
      const { pool } = state
      const { interval } = action
      if (!INTERVALS.some((definition) => definition.semitones === interval)) return state
      const next = pool.includes(interval)
        ? pool.filter((value) => value !== interval)
        : INTERVALS.map((definition) => definition.semitones).filter((value) => value === interval || pool.includes(value))
      if (next.length === 0) return state
      return { ...state, pool: next }
    }
    // Applies from the next question; the one in play keeps the direction it was drawn with.
    case 'setDirection':
      return state.direction === action.direction ? state : { ...state, direction: action.direction }
    case 'setSound':
      return state.sound === action.sound ? state : { ...state, sound: action.sound }
    case 'setTheme':
      return state.theme === action.theme ? state : { ...state, theme: action.theme }
  }
}
