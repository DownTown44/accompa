import { fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../src/ui/app/App'
import { createEngine } from '../../src/audio/engines'
import { createFakeEngine } from './support/fakeEngine'
import { listenSession } from './support/sessions'
import { key, opener, radio } from './support/dom'
import { press } from './support/keys'

vi.mock('../../src/audio/engines', async () => {
  const { createFakeEngine } = await import('./support/fakeEngine')
  return { createEngine: vi.fn(() => createFakeEngine()) }
})

afterEach(() => {
  localStorage.clear()
  vi.mocked(createEngine).mockClear()
})

describe('the engine knows the instrument', () => {
  it('records the piano, then the guitar after a swap, on the same engine without stopping it', () => {
    const engine = createFakeEngine()
    render(<App engine={engine} />)
    fireEvent.pointerDown(key(60))
    fireEvent.click(radio('Guitar'), { detail: 1 })
    expect(engine.stops).toBe(0)
    fireEvent.pointerDown(document.querySelector('[data-string="4"][data-fret="5"]')!)
    expect(engine.plays[0]).toEqual({ pitches: [60], instrument: 'piano', mode: 'block' })
    expect(engine.plays.at(-1)?.instrument).toBe('guitar')
  })

  it('passes the active instrument to a Listen question', () => {
    const engine = createFakeEngine()
    render(<App engine={engine} session={{ ...listenSession, instrument: 'guitar' }} />)
    press({ key: ' ' })
    expect(engine.plays.map((p) => p.instrument)).toEqual(['guitar'])
  })

  it('starts on samples whatever the Phase 1 key says, and leaves that key alone', () => {
    localStorage.setItem('accompa.sound', '"synthesized"')
    render(<App engine={createFakeEngine()} />)
    expect(localStorage.getItem('accompa.sound')).toBe('"synthesized"')
    expect(localStorage.getItem('accompa.sound.v2')).toBe('"samples"')
  })

  it('keeps the engine and does not stop it when the instrument is swapped', () => {
    render(<App />)
    fireEvent.click(radio('Guitar'), { detail: 1 })
    fireEvent.click(radio('Piano'), { detail: 1 })
    expect(createEngine).toHaveBeenCalledTimes(1)
    const [first] = vi.mocked(createEngine).mock.results
    expect((first!.value as ReturnType<typeof createFakeEngine>).stops).toBe(0)
  })

  it('replaces the engine and stops the old one when the Sound changes', () => {
    render(<App />)
    expect(createEngine).toHaveBeenLastCalledWith('samples')
    fireEvent.click(opener())
    fireEvent.click(radio('Synthesized'), { detail: 1 })
    expect(createEngine).toHaveBeenCalledTimes(2)
    expect(createEngine).toHaveBeenLastCalledWith('synthesized')
    const [first] = vi.mocked(createEngine).mock.results
    expect((first!.value as ReturnType<typeof createFakeEngine>).stops).toBeGreaterThan(0)
  })
})
