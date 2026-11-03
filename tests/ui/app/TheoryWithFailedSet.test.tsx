import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { asContext, FakeContext } from '../../audio/support/fakeContext'
import { click, key } from '../support/dom'
import { cell } from '../support/explore'
import { press } from '../support/keys'
import { listenSession } from '../support/sessions'

// The real router with tests/setup.ts rejecting every fetch: each set fails, so the synth must sound.
let ctx: FakeContext
const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })

beforeEach(() => {
  ctx = new FakeContext('running')
  vi.stubGlobal('AudioContext', function () {
    return asContext(ctx)()
  })
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('theory features when a set fails to load', () => {
  it('plays a Listen question through the synth', async () => {
    render(<App session={listenSession} />)
    await settle()
    expect(() => press({ key: ' ' })).not.toThrow()
    expect(ctx.oscillators.length).toBeGreaterThan(0)
    expect(ctx.sources).toHaveLength(0)
  })

  it('plays an Explore chord on the piano through the synth, readout unchanged', async () => {
    render(<App />)
    await settle()
    click(key(60))
    click(key(64))
    click(key(67))
    expect(ctx.oscillators.length).toBeGreaterThanOrEqual(3)
    expect(ctx.sources).toHaveLength(0)
    expect(document.querySelectorAll('[data-lit]')).toHaveLength(3)
  })

  it('plays a guitar note through the synth', async () => {
    render(<App />)
    await settle()
    press('i')
    await settle()
    expect(() => click(cell(2, 5))).not.toThrow()
    expect(ctx.oscillators.length).toBeGreaterThan(0)
    expect(ctx.sources).toHaveLength(0)
    expect(document.querySelector('.status-note')!.textContent).toBe(
      'The guitar sound did not load. The synthesized sound is playing.',
    )
  })
})
