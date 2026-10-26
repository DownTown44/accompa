import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine, type FakeEngine } from '../support/fakeEngine'
import { listenSession } from '../support/sessions'
import { opener, panel } from '../support/dom'
import { press } from '../support/keys'

const hintButton = () => screen.getByRole('button', { name: 'Shortcuts' })
const list = () => document.getElementById('help-list') as HTMLElement
const guessHint = () => document.querySelector('.guess-hint')!.textContent
const settle = () => new Promise((resolve) => setTimeout(resolve, 20))
const stops = () => [...document.querySelectorAll<HTMLElement>('input, button, [tabindex]')].filter((el) => !el.closest('[hidden]'))

let engine: FakeEngine

beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
  engine = createFakeEngine()
  render(<App session={listenSession} engine={engine} />)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('help hint', () => {
  it('is a named button wired to the list, closed at first', () => {
    expect(hintButton().getAttribute('aria-expanded')).toBe('false')
    expect(hintButton().getAttribute('aria-controls')).toBe('help-list')
    expect(list().hidden).toBe(true)
  })

  it('opens on hover and stays while the pointer moves onto the list, then closes', () => {
    fireEvent.mouseEnter(hintButton())
    expect(list().hidden).toBe(false)
    expect(hintButton().getAttribute('aria-expanded')).toBe('true')
    fireEvent.mouseLeave(hintButton())
    fireEvent.mouseEnter(list())
    expect(list().hidden).toBe(false)
    fireEvent.mouseLeave(list())
    expect(list().hidden).toBe(true)
  })

  it('opens on focus and closes when focus leaves', () => {
    act(() => hintButton().focus())
    expect(list().hidden).toBe(false)
    act(() => hintButton().blur())
    expect(list().hidden).toBe(true)
  })

  it('stays open while focused even if the pointer leaves', () => {
    act(() => hintButton().focus())
    fireEvent.mouseEnter(hintButton())
    fireEvent.mouseLeave(hintButton())
    expect(list().hidden).toBe(false)
  })

  it('toggles with ? and closes with Esc', () => {
    press({ key: '?', shiftKey: true })
    expect(list().hidden).toBe(false)
    press({ key: '?', shiftKey: true })
    expect(list().hidden).toBe(true)
    press({ key: '?' })
    press({ key: 'Escape' })
    expect(list().hidden).toBe(true)
  })

  it('closes the list first on Esc, then the Setup panel', () => {
    press({ key: 'p' })
    press({ key: '?' })
    press({ key: 'Escape' })
    expect(list().hidden).toBe(true)
    expect(panel().hidden).toBe(false)
    press({ key: 'Escape' })
    expect(panel().hidden).toBe(true)
  })

  it('lists the working keys as caps with meanings, and the focused-button line', () => {
    const rows = [...list().querySelectorAll('.help-row')].map((row) => [
      [...row.querySelectorAll('.help-cap')].map((cap) => cap.textContent),
      row.querySelector('.help-meaning')!.textContent,
    ])
    expect(rows).toEqual([
      [['Space'], 'Play, or replay'],
      [['Enter'], 'Reveal, then next; Block in Explore'],
      [['1–9', '0', '-', '='], 'Pick m2 to P8'],
      [['M'], 'Listen or Explore'],
      [['I'], 'Piano or Guitar'],
      [['R'], 'Set root'],
      [['P'], 'Setup'],
      [['[', ']'], 'Piano octave down, up'],
      [['←', '→'], 'Previous, next voicing'],
      [['Esc'], 'Close panel or list; clear notes in Explore'],
      [['?'], 'This list'],
    ])
    expect(list().textContent).toContain('Space and Enter on a focused button activate that button.')
    expect(list().querySelector('[aria-hidden]')).toBeNull()
  })

  it('ignores ? with a modifier or repeat', () => {
    press({ key: '?', ctrlKey: true })
    press({ key: '?', repeat: true })
    expect(list().hidden).toBe(true)
  })

  it('puts the opener and the hint last in the Tab order, the panel between when open', () => {
    expect(stops().slice(-2)).toEqual([opener(), hintButton()])
    press({ key: 'p' })
    const all = stops()
    expect(all.indexOf(opener())).toBeLessThan(all.indexOf(document.querySelector<HTMLElement>('.setup-chip')!))
    expect(all.indexOf(document.querySelector<HTMLElement>('input[name="theme"]')!)).toBeLessThan(all.indexOf(hintButton()))
    expect(all[all.length - 1]).toBe(hintButton())
  })
})

describe('hint click', () => {
  it('keeps the list open when the hovered, focused hint is clicked', () => {
    fireEvent.mouseEnter(hintButton())
    act(() => hintButton().focus())
    fireEvent.click(hintButton(), { detail: 1 })
    expect(list().hidden).toBe(false)
    expect(hintButton().getAttribute('aria-expanded')).toBe('true')
  })
})

describe('focus after a pointer click', () => {
  it('lets a digit guess after clicking Play again', async () => {
    press({ key: ' ' }) // P5
    const play = screen.getByRole('button', { name: /Play again/ })
    play.focus()
    fireEvent.click(play, { detail: 1 })
    await waitFor(() => expect(document.activeElement).toBe(document.querySelector('.piano')))
    press({ key: '2' }, document.activeElement!)
    expect(guessHint()).toBe('M2 is not it — try another.')
  })

  it('keeps focus on a panel chip and on the hint after a pointer click', async () => {
    fireEvent.click(opener(), { detail: 1 })
    const chip = document.querySelector<HTMLElement>('.setup-chip')!
    chip.focus()
    fireEvent.click(chip, { detail: 1 })
    await settle()
    expect(document.activeElement).toBe(chip)
    act(() => hintButton().focus())
    fireEvent.click(hintButton(), { detail: 1 })
    await settle()
    expect(document.activeElement).toBe(hintButton())
  })

  it('keeps focus on a panel radio after a pointer click', async () => {
    press({ key: 'p' })
    const dark = screen.getByRole('radio', { name: 'Dark' })
    dark.focus()
    fireEvent.click(dark, { detail: 1 })
    await settle()
    expect(document.activeElement).toBe(dark)
  })

  it('keeps focus when an interval button is activated from the keyboard', async () => {
    press({ key: ' ' })
    const m3 = screen.getByRole('button', { name: 'm3' })
    m3.focus()
    fireEvent.click(m3, { detail: 0 })
    await settle()
    expect(document.activeElement).toBe(m3)
    expect(guessHint()).toBe('m3 is not it — try another.')
  })
})

describe('key rules', () => {
  it('plays once for a held Space', () => {
    press({ key: ' ' })
    press({ key: ' ', repeat: true })
    press({ key: ' ', repeat: true })
    expect(engine.plays).toHaveLength(1)
  })

  it('ignores Ctrl+0 and accepts AltGr with a key', () => {
    press({ key: ' ' })
    press({ key: '0', ctrlKey: true })
    expect(guessHint()).toBe('')
    press({ key: 'm', ctrlKey: true, altKey: true }, document.body, true)
    expect(screen.getByRole('radio', { name: 'Explore' })).toHaveProperty('checked', true)
  })
})
