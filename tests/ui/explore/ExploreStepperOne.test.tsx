import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine } from '../support/fakeEngine'
import { click, key } from '../support/dom'
import { press } from '../support/keys'

vi.mock('../../../src/core/voicings', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../src/core/voicings')>()
  return { ...actual, generateVoicings: (...args: Parameters<typeof actual.generateVoicings>) => actual.generateVoicings(...args).slice(0, 1) }
})

describe('Voicing stepper with one voicing', () => {
  it('stays hidden, ignores Left and Right, and shows the one voicing', () => {
    render(<App engine={createFakeEngine()} />)
    ;[60, 64, 67].forEach((p) => click(key(p)))
    press('i')
    const shown = () => document.querySelectorAll('.fretboard [data-lit]').length
    expect(shown()).toBeGreaterThan(0)
    expect(document.querySelector('.voicing-row')!.children).toHaveLength(0)
    const before = shown()
    press('ArrowRight', document.querySelector('.fretboard')!)
    press('ArrowLeft', document.querySelector('.fretboard')!)
    expect(shown()).toBe(before)
    expect(document.querySelector('.voicing-row')!.children).toHaveLength(0)
  })
})
