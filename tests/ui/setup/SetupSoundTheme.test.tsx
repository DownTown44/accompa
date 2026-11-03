import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine } from '../support/fakeEngine'
import { listenSession } from '../support/sessions'
import { opener, radio } from '../support/dom'
import { press } from '../support/keys'
import { answer, chip, registerSetupHooks } from '../support/setupPanel'

registerSetupHooks()

describe('sound and theme', () => {
  const theme = () => document.documentElement.getAttribute('data-theme')

  it('shows Samples then Synthesized with Samples selected, the hint and the credit, and the three themes', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    fireEvent.click(opener())
    const sound = screen.getByRole('radiogroup', { name: 'Sound' })
    expect([...sound.querySelectorAll('input')].map((i) => i.closest('label')?.textContent)).toEqual(['Samples', 'Synthesized'])
    expect(radio('Samples').checked).toBe(true)
    expect(radio('Synthesized').checked).toBe(false)
    expect(screen.getByText('Samples follow the instrument: piano sound on the piano, guitar sound on the guitar.').className).toBe('setup-hint')
    expect(screen.getByText('Piano sound: Salamander Grand Piano V3 by Alexander Holm, CC BY 3.0.').className).toBe('setup-hint')
    expect(screen.getByText('Guitar sound: FreePats Nylon-String Acoustic Guitar, CC0.').className).toBe('setup-hint')
    expect(screen.getByRole('radiogroup', { name: 'Theme' })).toBeTruthy()
    expect(radio('System').checked).toBe(true)
    expect(radio('Light').checked).toBe(false)
    expect(radio('Dark').checked).toBe(false)
  })

  it('selects Synthesized when clicked, saves it under the v2 key and starts on it after a reload', () => {
    const first = render(<App session={listenSession} engine={createFakeEngine()} />)
    fireEvent.click(opener())
    fireEvent.click(radio('Synthesized'), { detail: 1 })
    expect(radio('Synthesized').checked).toBe(true)
    expect(localStorage.getItem('accompa.sound.v2')).toBe('"synthesized"')
    first.unmount()
    render(<App session={listenSession} engine={createFakeEngine()} />)
    fireEvent.click(opener())
    expect(radio('Synthesized').checked).toBe(true)
  })

  it('prepares the new engine when the Sound changes back to Samples, before any note is played', () => {
    const fetchSpy = vi.fn(() => Promise.reject(new Error('no network in tests')))
    vi.stubGlobal('fetch', fetchSpy)
    try {
      render(<App session={listenSession} />)
      expect(fetchSpy).toHaveBeenCalledTimes(21)
      fireEvent.click(opener())
      fireEvent.click(radio('Synthesized'), { detail: 1 })
      expect(fetchSpy).toHaveBeenCalledTimes(21)
      fireEvent.click(radio('Samples'), { detail: 1 })
      expect(fetchSpy).toHaveBeenCalledTimes(42)
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('applies a theme at once and saves it, and System removes the attribute', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    fireEvent.click(opener())
    fireEvent.click(radio('Dark'), { detail: 1 })
    expect(theme()).toBe('dark')
    expect(localStorage.getItem('accompa.theme')).toBe('"dark"')
    fireEvent.click(radio('Light'), { detail: 1 })
    expect(theme()).toBe('light')
    fireEvent.click(radio('System'), { detail: 1 })
    expect(theme()).toBeNull()
    expect(localStorage.getItem('accompa.theme')).toBe('"system"')
  })

  it('restores theme and pool on reload but not direction', () => {
    localStorage.setItem('accompa.theme', '"dark"')
    localStorage.setItem('accompa.pool', '[7, 12]')
    const first = render(<App session={listenSession} engine={createFakeEngine()} />)
    expect(theme()).toBe('dark')
    fireEvent.click(opener())
    fireEvent.click(radio('Descending'), { detail: 1 })
    first.unmount()
    render(<App session={listenSession} engine={createFakeEngine()} />)
    expect(theme()).toBe('dark')
    expect(answer('m2').hasAttribute('data-out-of-pool')).toBe(true)
    expect(answer('P5').hasAttribute('data-out-of-pool')).toBe(false)
    fireEvent.click(opener())
    expect(radio('Dark').checked).toBe(true)
    expect(radio('Ascending').checked).toBe(true)
    expect(localStorage.getItem('accompa.direction')).toBeNull()
  })

  it.each(['"purple"', '[]', '"x"'])('falls back to defaults for a bad saved theme %s', (raw) => {
    localStorage.setItem('accompa.theme', raw)
    render(<App session={listenSession} engine={createFakeEngine()} />)
    expect(theme()).toBeNull()
    fireEvent.click(opener())
    expect(radio('System').checked).toBe(true)
  })

  it('works when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    const engine = createFakeEngine()
    render(<App session={listenSession} engine={engine} />)
    fireEvent.click(opener())
    fireEvent.click(radio('Dark'), { detail: 1 })
    expect(theme()).toBe('dark')
    press({ key: 'Escape' })
    press({ key: ' ' })
    expect(engine.plays).toHaveLength(1)
  })

  it('leaves the question, marks and replay alone when settings change', () => {
    const engine = createFakeEngine()
    render(<App session={listenSession} engine={engine} />)
    press({ key: ' ' })
    const first = engine.plays[0]
    fireEvent.click(opener())
    fireEvent.click(radio('Dark'), { detail: 1 })
    fireEvent.click(chip('m2'))
    press({ key: 'Escape' })
    ;(document.activeElement as HTMLElement).blur()
    press({ key: ' ' })
    expect(engine.plays[1]).toEqual(first)
    expect(document.querySelectorAll('.interval-button.wrong')).toHaveLength(0)
  })

  it('stops the engine when it is replaced or the app leaves', () => {
    const engine = createFakeEngine()
    const view = render(<App session={listenSession} engine={engine} />)
    view.unmount()
    expect(engine.stops).toBeGreaterThan(0)
  })

  it('yields digit keys while a Sound or Theme radio has focus', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    press({ key: ' ' })
    fireEvent.click(opener())
    for (const name of ['Synthesized', 'Light']) {
      radio(name).focus()
      press({ key: '1' }, radio(name))
    }
    expect(document.querySelectorAll('.interval-button.wrong')).toHaveLength(0)
  })
})
