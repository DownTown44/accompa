import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine } from '../support/fakeEngine'
import { click, key, radio, rooted } from '../support/dom'
import { press } from '../support/keys'
import { roleOf, legend } from '../support/explore'
import { pitch } from '../../../src/core/pitch'
import { initialSession } from '../../../src/ui/session/session'

describe('Explore live region', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('announces the interval after a debounce', () => {
    render(<App engine={createFakeEngine()} />)
    const region = () => screen.getByTestId('explore-announce')
    click(key(60))
    click(key(67))
    expect(region().textContent).toBe('')
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(region().textContent).toBe('')
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(region().textContent).toBe('perfect fifth')
    expect(region().getAttribute('aria-live')).toBe('polite')
  })

  it('announces the spoken chord after a debounce', () => {
    render(<App engine={createFakeEngine()} />)
    click(key(60))
    click(key(64))
    click(key(67))
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(screen.getByTestId('explore-announce').textContent).toBe('C major')
  })

  it('shows roles and the legend for a triad and a seventh', () => {
    render(<App engine={createFakeEngine()} />)
    expect(legend()).toEqual([])
    ;[60, 64, 67].forEach((n) => click(key(n)))
    expect([60, 64, 67].map(roleOf)).toEqual(['root', 'third', 'fifth'])
    expect(key(64).getAttribute('data-tint')).toBe('third')
    expect(key(61).getAttribute('data-tint')).toBeNull()
    expect(legend()).toEqual(['root C', '3rd E (M3)', '5th G (P5)'])
    click(key(71))
    expect(roleOf(71)).toBe('seventh')
    expect(legend()).toEqual(['root C', '3rd E (M3)', '5th G (P5)', '7th B (M7)'])
    click(key(64))
    expect(legend()).toEqual(['root C'])
    expect(document.querySelector('.role-legend')!.closest('[aria-live]')).toBeNull()
  })

  it('marks a doubled root twice and spells a diminished fifth', () => {
    render(<App engine={createFakeEngine()} />)
    ;[60, 64, 67, 72].forEach((n) => click(key(n)))
    expect(rooted()).toEqual(['60', '72'])
    ;[60, 64, 67, 72].forEach((n) => click(key(n)))
    ;[60, 63, 66].forEach((n) => click(key(n)))
    expect(legend()).toEqual(['root C', '3rd E♭ (m3)', '5th G♭ (d5)'])
  })

  it('gives an unknown set a root, dots and a root-only legend', () => {
    render(<App engine={createFakeEngine()} />)
    ;[60, 62, 66].forEach((n) => click(key(n)))
    expect([60, 62, 66].map(roleOf)).toEqual(['root', 'none', 'none'])
    expect(legend()).toEqual(['root C'])
    click(key(62))
    expect(roleOf(66)).toBe('none')
    expect(legend()).toEqual(['root C'])
  })

  it('keeps each guitar note on its own role when one pitch is beyond the fretboard', () => {
    const session = { ...initialSession, workspace: { pitches: [64, 88, 67, 72].map(pitch), positions: {} } }
    render(<App engine={createFakeEngine()} session={session} />)
    press('i')
    const roles = [...document.querySelectorAll('.fretboard [data-lit]')].map((n) => `${n.getAttribute('data-lit')}=${n.getAttribute('data-role')}`)
    // The voicing's pitch classes ignore the octave, but its register follows the mean of all lit
    // notes, including the one beyond the fretboard.
    expect(roles).toEqual(['3:9=third', '4:8=fifth', '5:8=root'])
  })

  it('draws the same roles on the guitar', () => {
    render(<App engine={createFakeEngine()} />)
    ;[60, 64, 67].forEach((n) => click(key(n)))
    click(radio('Guitar'))
    expect([...document.querySelectorAll('[data-lit]')].map((n) => n.getAttribute('data-role')).sort()).toEqual(['fifth', 'root', 'third'])
    expect(document.querySelector('.fretboard [data-tint]')).toBeNull()
  })
})
