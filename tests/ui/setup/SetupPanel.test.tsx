import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { STANDARD_GUITAR_TUNING } from '../../../src/core/instruments'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine } from '../support/fakeEngine'

function press(init: KeyboardEventInit, target: EventTarget = document.body) {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
  event.getModifierState = () => false
  act(() => {
    target.dispatchEvent(event)
  })
}

const opener = () => screen.getByRole('button', { name: 'Setup' })
const chip = (name: string) => chips().find((c) => c.textContent === name)!
const panel = () => document.getElementById('setup-panel')!
const chips = () => [...document.querySelectorAll<HTMLButtonElement>('.setup-chip')]
const answer = (name: string) =>
  [...document.querySelectorAll<HTMLElement>('.interval-button')].find((b) => b.querySelector('.interval-label')!.textContent === name)!

beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
})

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('setup panel', () => {
  it('is hidden at first and the opener describes it', () => {
    render(<App engine={createFakeEngine()} />)
    expect(panel().hidden).toBe(true)
    expect(opener().getAttribute('aria-expanded')).toBe('false')
    expect(opener().getAttribute('aria-controls')).toBe('setup-panel')
  })

  it('opens with the opener, focuses the first chip, and shows 12 pressed chips with a label', () => {
    render(<App engine={createFakeEngine()} />)
    fireEvent.click(opener())
    expect(panel().hidden).toBe(false)
    expect(opener().getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(chips()[0])
    expect(chips()).toHaveLength(12)
    expect(chips().every((c) => c.getAttribute('aria-pressed') === 'true')).toBe(true)
    expect(chips().map((c) => c.textContent)).toEqual(['m2', 'M2', 'm3', 'M3', 'P4', 'A4', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'])
    expect(screen.getByRole('group', { name: 'Setup' })).toBeTruthy()
  })

  it('toggles with P and closes with Esc and with P, returning focus to the opener', () => {
    render(<App engine={createFakeEngine()} />)
    press({ key: 'p' })
    expect(panel().hidden).toBe(false)
    expect(document.activeElement).toBe(chips()[0])
    press({ key: 'Escape' }, document.activeElement!)
    expect(panel().hidden).toBe(true)
    expect(document.activeElement).toBe(opener())
    press({ key: 'p' })
    press({ key: 'p' }, document.activeElement!)
    expect(panel().hidden).toBe(true)
    expect(document.activeElement).toBe(opener())
  })

  it('ignores P with a modifier or repeat', () => {
    render(<App engine={createFakeEngine()} />)
    press({ key: 'p', ctrlKey: true })
    press({ key: 'p', repeat: true })
    expect(panel().hidden).toBe(true)
  })

  it('unticks a chip, disables its answer button, and persists the pool', () => {
    render(<App engine={createFakeEngine()} />)
    press({ key: ' ' })
    fireEvent.click(opener())
    fireEvent.click(chip('m2'))
    expect(chip('m2').getAttribute('aria-pressed')).toBe('false')
    expect(JSON.parse(localStorage.getItem('accompa.pool')!)).not.toContain(1)
    expect(answer('m2').getAttribute('aria-disabled')).toBe('true')
    expect(answer('M2').getAttribute('aria-disabled')).toBeNull()
  })

  it('keeps the current answer guessable after it leaves the pool', () => {
    render(<App engine={createFakeEngine()} />)
    press({ key: ' ' }) // P5
    fireEvent.click(opener())
    fireEvent.click(chip('P5'))
    expect(answer('P5').getAttribute('aria-disabled')).toBeNull()
    expect(answer('P5').hasAttribute('data-out-of-pool')).toBe(false)
    expect(answer('P4').hasAttribute('data-out-of-pool')).toBe(false)
  })

  it('accepts the right answer after its chip is unticked, by click and by key', () => {
    const engine = createFakeEngine()
    render(<App engine={engine} />)
    press({ key: ' ' }) // P5
    fireEvent.click(opener())
    fireEvent.click(chip('P5'))
    fireEvent.click(answer('P5'))
    expect(document.querySelector('.guess-hint')!.textContent).toBe('P5. Next interval is playing.')
    expect(engine.plays).toHaveLength(2)
    expect(answer('P5').getAttribute('aria-disabled')).toBe('true')

    press({ key: 'Escape' })
    ;(document.activeElement as HTMLElement).blur()
    const next = engine.plays[1].pitches
    const semitones = next[1] - next[0]
    const key = String(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='][[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].indexOf(semitones)])
    fireEvent.click(opener())
    fireEvent.click(chips()[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].indexOf(semitones)])
    press({ key: 'Escape' })
    press({ key })
    expect(engine.plays).toHaveLength(3)
  })

  it('draws questions only from the saved pool', () => {
    localStorage.setItem('accompa.pool', '[12]')
    const engine = createFakeEngine()
    render(<App engine={engine} />)
    press({ key: ' ' })
    const [root, top] = engine.plays[0].pitches
    expect(top - root).toBe(12)
    press({ key: '=' })
    expect(document.querySelector('.guess-hint')!.textContent).toBe('P8. Next interval is playing.')
    const [nextRoot, nextTop] = engine.plays[1].pitches
    expect(nextTop - nextRoot).toBe(12)
  })

  it('does not untick the last chip and says why', () => {
    localStorage.setItem('accompa.pool', '[12]')
    render(<App engine={createFakeEngine()} />)
    fireEvent.click(opener())
    const last = chip('P8')
    expect(last.getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(last)
    expect(last.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('status').textContent).toBe('Keep at least one interval.')
    fireEvent.click(chip('m2'))
    expect(screen.getByRole('status').textContent).toBe('')
    fireEvent.click(chip('m2'))
    fireEvent.click(last)
    expect(screen.getByRole('status').textContent).toBe('Keep at least one interval.')
    press({ key: 'Escape' })
    expect(document.querySelector('.setup-note')!.textContent).toBe('')
  })

  it('restores a saved pool and disables the other buttons', () => {
    localStorage.setItem('accompa.pool', '[7, 12]')
    render(<App engine={createFakeEngine()} />)
    expect(answer('P5').hasAttribute('data-out-of-pool')).toBe(false)
    expect(answer('m2').hasAttribute('data-out-of-pool')).toBe(true)
  })

  it('falls back to all 12 for bad storage', () => {
    localStorage.setItem('accompa.pool', '[99]')
    render(<App engine={createFakeEngine()} />)
    expect(document.querySelectorAll('[data-out-of-pool]')).toHaveLength(0)
  })

  it('does not guess when a digit is pressed inside the panel', () => {
    render(<App engine={createFakeEngine()} />)
    press({ key: ' ' })
    fireEvent.click(opener())
    press({ key: '1' }, chips()[0])
    expect(document.querySelectorAll('.interval-button.wrong')).toHaveLength(0)
  })

  it('keeps focus on the opener after a pointer click', () => {
    render(<App engine={createFakeEngine()} />)
    opener().focus()
    fireEvent.click(opener(), { detail: 1 })
    expect(opener().getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(opener(), { detail: 1 })
    expect(opener().getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(opener())
  })
})

describe('direction', () => {
  const radio = (name: string) => screen.getByRole('radio', { name }) as HTMLInputElement

  it('shows a labelled Direction group with Ascending selected', () => {
    render(<App engine={createFakeEngine()} />)
    fireEvent.click(opener())
    expect(screen.getByRole('radiogroup', { name: 'Direction' })).toBeTruthy()
    expect(radio('Ascending').checked).toBe(true)
    expect(radio('Descending').checked).toBe(false)
    expect(radio('Harmonic').checked).toBe(false)
  })

  it('plays the question with the matrix list and mode, and replays it identically', () => {
    const engine = createFakeEngine()
    render(<App engine={engine} />)
    fireEvent.click(opener())
    fireEvent.click(radio('Descending'), { detail: 1 })
    press({ key: 'Escape' })
    press({ key: ' ' })
    press({ key: ' ' })
    const [first, second] = engine.plays
    expect(first.mode).toBe('arpeggio')
    expect(first.pitches[0]).toBeGreaterThan(first.pitches[1])
    expect(second).toEqual(first)
    fireEvent.click(opener())
    fireEvent.click(radio('Harmonic'), { detail: 1 })
    press({ key: 'Escape' })
    ;(document.activeElement as HTMLElement).blur()
    press({ key: ' ' })
    expect(engine.plays[2]).toEqual(first)
    press({ key: 'Enter' })
    press({ key: 'Enter' })
    const harmonic = engine.plays.at(-1)!
    expect(harmonic.mode).toBe('block')
    expect(harmonic.pitches[0]).toBeLessThan(harmonic.pitches[1])
  })

  it('keeps the question in play and applies a new direction from the next one', () => {
    const engine = createFakeEngine()
    render(<App engine={engine} />)
    press({ key: ' ' })
    const first = engine.plays[0]
    fireEvent.click(opener())
    fireEvent.click(radio('Descending'), { detail: 1 })
    press({ key: 'Escape' })
    ;(document.activeElement as HTMLElement).blur()
    press({ key: ' ' })
    expect(engine.plays[1]).toEqual(first)
    press({ key: 'Enter' })
    press({ key: 'Enter' })
    const next = engine.plays.at(-1)!
    expect(next.pitches[0]).toBeGreaterThan(next.pitches[1])
  })

  it.each(['piano', 'guitar'] as const)('marks the higher note as the root of a descending question on the %s', (instrument) => {
    render(<App engine={createFakeEngine()} />)
    fireEvent.click(opener())
    fireEvent.click(radio('Descending'), { detail: 1 })
    press({ key: 'Escape' })
    if (instrument === 'guitar') fireEvent.click(screen.getByRole('radio', { name: 'Guitar' }), { detail: 1 })
    press({ key: ' ' })
    press({ key: 'Enter' })
    expect(document.querySelectorAll('[data-lit]')).toHaveLength(2)
    const root = document.querySelector('[data-root]')!
    expect(root).toBeTruthy()
    const pitchOf = (node: Element) => {
      const key = node.getAttribute('data-lit')!
      if (instrument === 'piano') return Number(key)
      const [string, fret] = key.split(':').map(Number)
      return STANDARD_GUITAR_TUNING[string] + fret
    }
    const pitches = [...document.querySelectorAll('[data-lit]')].map(pitchOf)
    expect(pitchOf(root)).toBe(Math.max(...pitches))
  })

  it('yields digit keys while a radio has focus', () => {
    const engine = createFakeEngine()
    render(<App engine={engine} />)
    press({ key: ' ' })
    fireEvent.click(opener())
    const r = radio('Harmonic')
    r.focus()
    press({ key: '2' }, r)
    expect(document.querySelectorAll('.interval-button.wrong')).toHaveLength(0)
    press({ key: '3' })
    expect(document.querySelectorAll('.interval-button.wrong')).toHaveLength(1)
  })
})
