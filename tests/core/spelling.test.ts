import { describe, expect, it } from 'vitest'
import { pitch } from '../../src/core/pitch'
import { octaveLabel } from '../../src/core/spelling'

describe('octaveLabel', () => {
  it('labels C keys', () => {
    expect(octaveLabel(pitch(48))).toBe('C3')
    expect(octaveLabel(pitch(60))).toBe('C4')
    expect(octaveLabel(pitch(36))).toBe('C2')
    expect(octaveLabel(pitch(72))).toBe('C5')
  })
})
