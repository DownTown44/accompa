import { describe, expect, it } from 'vitest'
import { pitch, pitchClass } from '../../src/core/pitch'

describe('pitchClass', () => {
  it('reduces a MIDI pitch to 0..11', () => {
    expect(pitchClass(pitch(60))).toBe(0)
    expect(pitchClass(pitch(61))).toBe(1)
    expect(pitchClass(pitch(71))).toBe(11)
  })

  it('stays in range below pitch 0', () => {
    expect(pitchClass(pitch(-1))).toBe(11)
  })
})
