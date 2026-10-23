import { describe, expect, it } from 'vitest'
import { STANDARD_GUITAR_TUNING } from '../../src/core/instruments'
import { pitch } from '../../src/core/pitch'
import { octaveLabel, stringNames } from '../../src/core/spelling'

describe('octaveLabel', () => {
  it('labels C keys', () => {
    expect(octaveLabel(pitch(48))).toBe('C3')
    expect(octaveLabel(pitch(60))).toBe('C4')
    expect(octaveLabel(pitch(36))).toBe('C2')
    expect(octaveLabel(pitch(72))).toBe('C5')
  })
})

describe('stringNames', () => {
  it('names standard tuning E A D G B e', () => {
    expect(stringNames(STANDARD_GUITAR_TUNING)).toEqual(['E', 'A', 'D', 'G', 'B', 'e'])
  })

  it('follows another tuning', () => {
    expect(stringNames([38, 45, 50, 55, 59, 64].map(pitch))).toEqual(['D', 'A', 'd', 'G', 'B', 'E'])
  })
})
