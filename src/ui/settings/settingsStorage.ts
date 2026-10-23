import { initialSettings, type Settings, type Sound, type Theme } from '../../core/model'
import type { Interval } from '../../core/pitch'

// index.html reads the theme key before first paint; keep the key and its values in step.
const KEYS = { pool: 'accompa.pool', sound: 'accompa.sound', theme: 'accompa.theme' } as const

export type SavedSetting = keyof typeof KEYS

const SOUNDS: readonly Sound[] = ['synthesized']
const THEMES: readonly Theme[] = ['system', 'light', 'dark']

function read(key: SavedSetting): unknown {
  try {
    return JSON.parse(localStorage.getItem(KEYS[key]) ?? 'null')
  } catch {
    return null
  }
}

// A missing, unparsable, empty or foreign value falls back to every interval.
function validPool(parsed: unknown): readonly Interval[] {
  const all = initialSettings.pool
  if (!Array.isArray(parsed) || parsed.length === 0) return all
  if (!parsed.every((value) => all.includes(value as Interval))) return all
  return all.filter((semitones) => parsed.includes(semitones))
}

// Direction is never saved, so it always starts as the default.
export function loadSettings(): Settings {
  const sound = read('sound')
  const theme = read('theme')
  return {
    ...initialSettings,
    pool: validPool(read('pool')),
    sound: SOUNDS.find((value) => value === sound) ?? initialSettings.sound,
    theme: THEMES.find((value) => value === theme) ?? initialSettings.theme,
  }
}

export function saveSetting<K extends SavedSetting>(key: K, value: Settings[K]): void {
  try {
    localStorage.setItem(KEYS[key], JSON.stringify(value))
  } catch {
    // Storage may be unavailable; the choice then lasts for this visit only.
  }
}
