import type { Interval } from '../../core/pitch'
import { INTERVALS } from '../../core/theory'

const KEY = 'accompa.pool'

export function allIntervals(): Interval[] {
  return INTERVALS.map((definition) => definition.semitones)
}

// A missing, unparsable, empty or foreign value falls back to every interval.
export function loadPool(): Interval[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (!Array.isArray(parsed) || parsed.length === 0) return allIntervals()
    const all = allIntervals()
    if (!parsed.every((value) => all.includes(value as Interval))) return all
    return all.filter((semitones) => parsed.includes(semitones))
  } catch {
    return allIntervals()
  }
}

export function savePool(pool: readonly Interval[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(pool))
  } catch {
    // Storage may be unavailable; the pool then lasts for this visit only.
  }
}
