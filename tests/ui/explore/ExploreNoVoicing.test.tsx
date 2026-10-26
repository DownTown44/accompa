import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine } from '../support/fakeEngine'
import { click, key, lit } from '../support/dom'
import { press } from '../support/keys'
import { mutedStrings, readout, status } from '../support/explore'

vi.mock('../../../src/core/voicings', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/core/voicings')>()),
  generateVoicings: () => [],
}))

describe('No voicing fits', () => {
  it('empties the fretboard, keeps the notes lit on the piano and says so in the Status note', () => {
    render(<App engine={createFakeEngine()} />)
    ;[60, 64, 67].forEach((p) => click(key(p)))
    press('i')
    expect(status()).toBe('No voicing fits these notes.')
    expect(lit()).toEqual([])
    expect(mutedStrings()).toEqual([])
    expect(readout()).toContain('C major')
    press('i')
    expect(lit()).toEqual(['60', '64', '67'])
    expect(status()).not.toContain('No voicing')
  })
})
