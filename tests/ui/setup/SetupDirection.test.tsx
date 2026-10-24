import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { STANDARD_GUITAR_TUNING } from '../../../src/core/instruments'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine } from '../support/fakeEngine'
import { listenSession } from '../support/sessions'
import { opener, radio } from '../support/dom'
import { press } from '../support/keys'
import { registerSetupHooks } from '../support/setupPanel'

registerSetupHooks()

describe('direction', () => {

  it('shows a labelled Direction group with Ascending selected', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    fireEvent.click(opener())
    expect(screen.getByRole('radiogroup', { name: 'Direction' })).toBeTruthy()
    expect(radio('Ascending').checked).toBe(true)
    expect(radio('Descending').checked).toBe(false)
    expect(radio('Harmonic').checked).toBe(false)
  })

  it('plays the question with the matrix list and mode, and replays it identically', () => {
    const engine = createFakeEngine()
    render(<App session={listenSession} engine={engine} />)
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
    const harmonic = engine.plays[2]
    expect(harmonic.mode).toBe('block')
    expect(harmonic.pitches[0]).toBeLessThan(harmonic.pitches[1])
  })

  it('replaces the question in play at once and silently when direction changes', () => {
    const engine = createFakeEngine()
    render(<App session={listenSession} engine={engine} />)
    press({ key: ' ' })
    press({ key: '3' })
    expect(document.querySelectorAll('.interval-button.wrong')).toHaveLength(1)
    fireEvent.click(opener())
    fireEvent.click(radio('Descending'), { detail: 1 })
    expect(engine.plays).toHaveLength(1)
    expect(document.querySelectorAll('.interval-button.wrong')).toHaveLength(0)
    expect(document.querySelector('.guess-hint')!.textContent).toBe('')
    press({ key: 'Escape' })
    ;(document.activeElement as HTMLElement).blur()
    press({ key: ' ' })
    const next = engine.plays[1]
    expect(next.pitches[0]).toBeGreaterThan(next.pitches[1])
  })

  it('replaces a revealed question too', () => {
    const engine = createFakeEngine()
    render(<App session={listenSession} engine={engine} />)
    press({ key: ' ' })
    press({ key: 'Enter' })
    expect(document.querySelectorAll('[data-lit]')).toHaveLength(2)
    fireEvent.click(opener())
    fireEvent.click(radio('Harmonic'), { detail: 1 })
    expect(document.querySelectorAll('[data-lit]')).toHaveLength(0)
    expect(screen.getByText('Which interval?')).toBeTruthy()
  })

  it('only changes the setting when there is no question yet', () => {
    const engine = createFakeEngine()
    render(<App session={listenSession} engine={engine} />)
    fireEvent.click(opener())
    fireEvent.click(radio('Harmonic'), { detail: 1 })
    expect(engine.plays).toHaveLength(0)
    press({ key: 'Escape' })
    press({ key: ' ' })
    expect(engine.plays[0].mode).toBe('block')
  })

  it('does nothing when the same direction is picked again', () => {
    const engine = createFakeEngine()
    render(<App session={listenSession} engine={engine} />)
    press({ key: ' ' })
    press({ key: '3' })
    fireEvent.click(opener())
    fireEvent.click(radio('Ascending'), { detail: 1 })
    expect(document.querySelectorAll('.interval-button.wrong')).toHaveLength(1)
    press({ key: 'Escape' })
    ;(document.activeElement as HTMLElement).blur()
    press({ key: ' ' })
    expect(engine.plays[1]).toEqual(engine.plays[0])
  })

  it.each(['piano', 'guitar'] as const)('marks the higher note as the root of a descending question on the %s', (instrument) => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
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
    render(<App session={listenSession} engine={engine} />)
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
