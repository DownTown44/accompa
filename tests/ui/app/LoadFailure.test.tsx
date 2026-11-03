import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { opener, radio } from '../support/dom'

const note = () => document.querySelector('.status-note')!.textContent

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.unstubAllGlobals()
})

// tests/setup.ts rejects every fetch, which is the failure case.
describe('a set that fails to load', () => {
  it('shows the failure, keeps it across a Sound toggle, and fetches nothing again', async () => {
    render(<App />)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    expect(note()).toBe('The piano sound did not load. The synthesized sound is playing.')
    const fetchSpy = vi.fn(() => Promise.reject(new Error('no')))
    vi.stubGlobal('fetch', fetchSpy)
    fireEvent.click(opener())
    fireEvent.click(radio('Synthesized'), { detail: 1 })
    expect(note()).not.toContain('did not load')
    fireEvent.click(radio('Samples'), { detail: 1 })
    expect(note()).toBe('The piano sound did not load. The synthesized sound is playing.')
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
