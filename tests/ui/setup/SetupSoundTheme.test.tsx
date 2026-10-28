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

  it('shows Synthesized as the only sound with none selected, and the three themes', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    fireEvent.click(opener())
    const sound = screen.getByRole('radiogroup', { name: 'Sound' })
    expect(sound.querySelectorAll('input')).toHaveLength(1)
    expect(radio('Synthesized').checked).toBe(false)
    expect(sound.querySelector('input:checked')).toBeNull()
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
