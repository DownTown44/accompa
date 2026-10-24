import { readFileSync } from 'node:fs'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine } from '../support/fakeEngine'

const opener = () => screen.getByRole('button', { name: 'Setup' })
const panel = () => document.getElementById('setup-panel') as HTMLElement
const backdrop = () => document.querySelector('.corner-backdrop')

function press(init: KeyboardEventInit, target: EventTarget = document.body) {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
  event.getModifierState = () => false
  act(() => {
    target.dispatchEvent(event)
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('setup backdrop', () => {
  it('exists only while the panel is open', () => {
    render(<App engine={createFakeEngine()} />)
    expect(backdrop()).toBeNull()
    fireEvent.click(opener())
    expect(backdrop()).not.toBeNull()
  })

  it('closes the panel on a click, returns focus to the opener and does nothing else', () => {
    const engine = createFakeEngine()
    render(<App engine={engine} />)
    press({ key: ' ' })
    fireEvent.click(opener())
    fireEvent.click(backdrop()!)
    expect(panel().hidden).toBe(true)
    expect(document.activeElement).toBe(opener())
    expect(backdrop()).toBeNull()
    expect(engine.plays).toHaveLength(1)
    expect(document.querySelectorAll('.interval-button.wrong')).toHaveLength(0)
  })

  it('does not close on a click inside the panel or on the gear action beyond its toggle', () => {
    render(<App engine={createFakeEngine()} />)
    fireEvent.click(opener())
    fireEvent.click(panel())
    expect(panel().hidden).toBe(false)
    fireEvent.click(opener())
    expect(panel().hidden).toBe(true)
  })

  it('stacks the backdrop below the corner', () => {
    const css = readFileSync('src/ui/shell/corner.css', 'utf8')
    expect(css).toMatch(/\.corner-backdrop\s*{[^}]*position:\s*fixed[^}]*z-index:\s*10/)
    expect(css).toMatch(/\.corner\s*{[^}]*z-index:\s*11/)
  })
})

describe('help hint', () => {
  it('is upright', () => {
    const css = readFileSync('src/ui/help/help.css', 'utf8')
    const rule = css.match(/\.help-hint\s*{[^}]*}/)![0]
    expect(rule).toMatch(/font-style:\s*normal/)
    expect(rule).not.toMatch(/italic/)
  })
})

describe('instrument focus ring', () => {
  const flag = () => document.documentElement.hasAttribute('data-pointer-focus')

  it('is suppressed after a pointer click, kept through shortcut keys, and restored by Tab', async () => {
    render(<App engine={createFakeEngine()} />)
    fireEvent.click(screen.getByRole('radio', { name: 'Guitar' }), { detail: 1 })
    await waitFor(() => expect(document.activeElement).toBe(document.querySelector('.fretboard')))
    expect(flag()).toBe(true)
    press({ key: ' ' })
    press({ key: 'x' })
    expect(flag()).toBe(true)
    press({ key: 'Tab' })
    expect(flag()).toBe(false)
    fireEvent.pointerDown(document.querySelector('.fretboard')!)
    expect(flag()).toBe(true)
    press({ key: 'Tab' })
    expect(flag()).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: /Play again/ }), { detail: 0 })
    expect(flag()).toBe(false)
  })

  it('has the keyboard ring on both instruments and a pointer override', () => {
    for (const [file, selector] of [
      ['piano/piano.css', '.piano'],
      ['guitar/guitar.css', '.fretboard'],
    ]) {
      const css = readFileSync(`src/ui/instruments/${file}`, 'utf8')
      expect(css).toMatch(new RegExp(`\\${selector}:focus\\s*{\\s*outline:\\s*none`))
      expect(css).toContain(`${selector}:focus-visible {`)
      expect(css).toMatch(new RegExp(`:root\\[data-pointer-focus\\] \\${selector}:focus-visible\\s*{\\s*outline:\\s*none`))
    }
  })
})
