import { describe, expect, it } from 'vitest'
import { ENGINES } from '../../src/audio/engines'

describe('engines', () => {
  it('makes a fresh, idle engine for the synthesized sound', () => {
    const first = ENGINES.synthesized()
    const second = ENGINES.synthesized()
    expect(first).not.toBe(second)
    expect(first.status()).toBe('idle')
    expect(typeof first.play).toBe('function')
    expect(() => first.stop()).not.toThrow()
  })
})
