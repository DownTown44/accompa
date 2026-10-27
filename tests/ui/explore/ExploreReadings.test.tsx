import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine } from '../support/fakeEngine'
import { click, key, lit, rooted } from '../support/dom'
import { press } from '../support/keys'
import { alts, bigLabel, legend, readout } from '../support/explore'

describe('Explore alternative readings', () => {
  const altText = () => alts().map((b) => b.querySelector('span')!.textContent)
  const dim7 = () => [60, 63, 66, 69].forEach((n) => click(key(n)))

  it('shows no buttons for one reading', () => {
    render(<App engine={createFakeEngine()} />)
    ;[60, 64, 67].forEach((n) => click(key(n)))
    expect(alts()).toEqual([])
  })

  it('shows the other readings for a dim7', () => {
    render(<App engine={createFakeEngine()} />)
    dim7()
    expect(bigLabel()).toBe('Cdim7')
    expect(altText()).toEqual(['D♯dim7/C', 'F♯dim7/C', 'Adim7/C'])
    expect(alts().every((b) => b.type === 'button')).toBe(true)
  })

  it('moves name, marker, legend and spelling to the chosen reading without playing', () => {
    const engine = createFakeEngine()
    render(<App engine={engine} />)
    dim7()
    const sounded = engine.plays.length
    fireEvent.click(alts()[2]!)
    expect(bigLabel()).toBe('Adim7/C')
    expect(altText()).toEqual(['Cdim7', 'D♯dim7/C', 'F♯dim7/C'])
    expect(rooted()).toEqual(['69'])
    expect(legend()).toEqual(['root A', '3rd C (m3)', '5th E♭ (d5)', '7th G♭ (d7)'])
    expect(lit()).toEqual(['60', '63', '66', '69'])
    expect(engine.plays).toHaveLength(sounded)
    fireEvent.click(alts()[0]!)
    expect(bigLabel()).toBe('Cdim7')
    expect(rooted()).toEqual(['60'])
  })

  it('keeps the choice while it exists and drops it when it is gone, across instruments', () => {
    render(<App engine={createFakeEngine()} />)
    dim7()
    fireEvent.click(alts()[2]!)
    press('i')
    expect(bigLabel()).toBe('Adim7/C')
    expect([...document.querySelectorAll('[data-root]')]).toHaveLength(1)
    press('i')
    click(key(72))
    expect(bigLabel()).toBe('Adim7/C')
    click(key(63))
    expect(readout()).toContain('F♯ diminished over C')
    expect(altText()).toEqual([])
  })

  it('clears on Esc and returns with Undo', () => {
    render(<App engine={createFakeEngine()} />)
    dim7()
    fireEvent.click(alts()[1]!)
    press('Escape')
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(bigLabel()).toBe('F♯dim7/C')
  })

  it('keeps focus on the same list position and does not let Enter play', () => {
    const engine = createFakeEngine()
    render(<App engine={engine} />)
    dim7()
    engine.plays.length = 0
    alts()[1]!.focus()
    fireEvent.click(alts()[1]!)
    expect(document.activeElement).toBe(alts()[1])
    press('Enter', alts()[1]!)
    press(' ', alts()[1]!)
    expect(engine.plays).toEqual([])
  })

  it('leaves Listen without alternatives', () => {
    render(<App engine={createFakeEngine()} />)
    dim7()
    press('m')
    expect(alts()).toEqual([])
  })
})

describe('Explore alternative announce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('announces the chosen spoken name', () => {
    render(<App engine={createFakeEngine()} />)
    ;[60, 63, 66, 69].forEach((n) => click(key(n)))
    fireEvent.click(document.querySelectorAll('.reading-alt')[2]!)
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(screen.getByTestId('explore-announce').textContent).toBe('A dim7 over C')
  })
})
