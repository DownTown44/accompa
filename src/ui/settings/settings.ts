import type { Direction, PracticeKind, RootMode, Settings, Sound, Theme } from '../../core/model'
import type { Interval } from '../../core/pitch'
import { CHORD_QUALITIES, INTERVALS } from '../../core/theory'

export type SettingsAction =
  | { type: 'setPractice'; practice: PracticeKind }
  | { type: 'toggleChordPool'; quality: string }
  | { type: 'togglePool'; interval: Interval }
  | { type: 'setDirection'; direction: Direction }
  | { type: 'setRootMode'; rootMode: RootMode }
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
    // Applies from the next question; never saved.
    case 'setPractice':
      return state.practice === action.practice ? state : { ...state, practice: action.practice }
    // Same rule as the interval pool: the last chip stays, the pool stays in quality order, never saved.
    case 'toggleChordPool': {
      const { chordPool } = state
      const { quality } = action
      if (!CHORD_QUALITIES.some((q) => q.name === quality)) return state
      const next = chordPool.includes(quality)
        ? chordPool.filter((name) => name !== quality)
        : CHORD_QUALITIES.map((q) => q.name).filter((name) => name === quality || chordPool.includes(name))
      if (next.length === 0) return state
      return { ...state, chordPool: next }
    }
    // Applies from the next question; the one in play keeps the direction it was drawn with.
    case 'setDirection':
      return state.direction === action.direction ? state : { ...state, direction: action.direction }
    // Applies from the next question; never saved.
    case 'setRootMode':
      return state.rootMode === action.rootMode ? state : { ...state, rootMode: action.rootMode }
    case 'setSound':
      return state.sound === action.sound ? state : { ...state, sound: action.sound }
    case 'setTheme':
      return state.theme === action.theme ? state : { ...state, theme: action.theme }
  }
}
