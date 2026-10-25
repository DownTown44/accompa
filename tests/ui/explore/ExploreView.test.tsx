import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine } from '../support/fakeEngine'
import { listenSession } from '../support/sessions'
import { click, key, lit, radio, rooted } from '../support/dom'
import { press } from '../support/keys'
import { pitch } from '../../../src/core/pitch'
import { initialSession } from '../../../src/ui/session/session'

const cell = (string: number, fret: number) => document.querySelector(`.fb-cell[data-string="${string}"][data-fret="${fret}"]`)!
const roleOf = (n: number) => document.querySelector(`[data-lit="${n}"]`)?.getAttribute('data-role')
const legend = () => [...document.querySelectorAll('.role-legend li')].map((n) => n.textContent)
const readout = () => document.querySelector('.readout-interval')?.textContent

describe('Explore', () => {
  it('opens in Explore on the piano with the prompt and nothing lit', () => {
    render(<App engine={createFakeEngine()} />)
    expect(radio('Explore').checked).toBe(true)
    expect(radio('Piano').checked).toBe(true)
    expect(screen.getByText('Select notes to build a chord')).toBeTruthy()
    expect(lit()).toEqual([])
    expect(document.querySelector('.listen')).toBeNull()
  })

  it('sounds on pointer-down and lights on release, naming the note', () => {
    const engine = createFakeEngine()
    render(<App engine={engine} />)
    fireEvent.pointerDown(key(63))
    expect(engine.plays).toEqual([{ pitches: [63], mode: 'block' }])
    expect(lit()).toEqual([])
    fireEvent.pointerUp(key(63))
    expect(lit()).toEqual(['63'])
    expect(rooted()).toEqual(['63'])
    expect(readout()).toContain('E♭')
  })

  it('names two notes, lower first, with the root marker on the lower', () => {
    render(<App engine={createFakeEngine()} />)
    click(key(67))
    click(key(60))
    expect(readout()).toContain('P5')
    expect(readout()).toContain('perfect fifth')
    expect(rooted()).toEqual(['60'])
    expect(lit()).toEqual(['60', '67'])
  })

  it('names the tritone and the octave', () => {
    render(<App engine={createFakeEngine()} />)
    click(key(60))
    click(key(66))
    expect(readout()).toContain('A4')
    click(key(66))
    click(key(72))
    expect(readout()).toContain('P8')
  })

  it('names a triad in any click order with the marker on the lowest', () => {
    render(<App engine={createFakeEngine()} />)
    click(key(64))
    click(key(60))
    click(key(67))
    expect(lit()).toEqual(['60', '64', '67'])
    expect(readout()).toContain('C major')
    expect(rooted()).toEqual(['60'])
  })

  it('grows and shrinks the name', () => {
    render(<App engine={createFakeEngine()} />)
    click(key(60))
    click(key(67))
    expect(readout()).toContain('P5')
    click(key(64))
    expect(readout()).toContain('C major')
    click(key(64))
    expect(readout()).toContain('P5')
    click(key(64))
    click(key(64))
    click(key(67))
    click(key(60))
    expect(document.querySelector('.explore-prompt')).not.toBeNull()
  })

  it('reads an inversion with the marker on its root', () => {
    render(<App engine={createFakeEngine()} />)
    click(key(64))
    click(key(67))
    click(key(72))
    expect(document.querySelector('.readout-interval span')!.textContent).toBe('C/E')
    expect(readout()).toContain('C major over E')
    expect(rooted()).toEqual(['72'])
    expect(roleOf(64)).toBe('third')
    expect(roleOf(67)).toBe('fifth')
    expect(legend()).toEqual(['root C', '3rd E (M3)', '5th G (P5)'])
  })

  it('lists notes for an unknown set and for two classes', () => {
    render(<App engine={createFakeEngine()} />)
    click(key(60))
    click(key(62))
    click(key(66))
    expect(document.querySelector('.readout-interval span')!.textContent).toBe('C D F♯')
    expect(rooted()).toEqual(['60'])
    click(key(62))
    click(key(66))
    click(key(64))
    click(key(72))
    expect(document.querySelector('.readout-interval span')!.textContent).toBe('C E')
  })

  it('steps the font by label length', () => {
    render(<App engine={createFakeEngine()} />)
    const size = () => document.querySelector('.readout-interval')!.getAttribute('data-size')
    click(key(60))
    expect(size()).toBe('large')
    click(key(60))
    ;[63, 66, 70, 72].forEach((n) => click(key(n)))
    expect(size()).toBe('medium')
    ;[61, 62, 64, 65].forEach((n) => click(key(n)))
    expect(size()).toBe('small')
  })

  it('caps at eight lit notes and unlights a clicked lit note, sounding both', () => {
    const engine = createFakeEngine()
    render(<App engine={engine} />)
    for (let n = 60; n < 69; n++) click(key(n))
    expect(lit()).toHaveLength(8)
    expect(lit()).not.toContain('60')
    click(key(61))
    expect(lit()).toHaveLength(7)
    expect(engine.plays).toHaveLength(10)
  })

  it('plays and blocks three notes, sorted', () => {
    const engine = createFakeEngine()
    render(<App engine={engine} />)
    click(key(67))
    click(key(60))
    click(key(64))
    engine.plays.length = 0
    press(' ')
    press('Enter')
    expect(engine.plays).toEqual([
      { pitches: [60, 64, 67], mode: 'arpeggio' },
      { pitches: [60, 64, 67], mode: 'block' },
    ])
  })

  it('returns to the chord after clear and Undo, silently', () => {
    const engine = createFakeEngine()
    render(<App engine={engine} />)
    click(key(60))
    click(key(64))
    click(key(67))
    const sounded = engine.plays.length
    press('Escape')
    expect(document.querySelector('.explore-prompt')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(readout()).toContain('C major')
    expect(engine.plays).toHaveLength(sounded)
  })

  it('sounds only the pressed key after hovering', () => {
    const engine = createFakeEngine()
    render(<App engine={engine} />)
    fireEvent.pointerOver(key(62))
    fireEvent.pointerMove(key(64))
    click(key(65))
    expect(engine.plays).toEqual([{ pitches: [65], mode: 'block' }])
    expect(lit()).toEqual(['65'])
  })

  it('lights the exact guitar position and moves a lit pitch', () => {
    const engine = createFakeEngine()
    render(<App engine={engine} />)
    press('i')
    click(cell(2, 5))
    expect(lit()).toEqual(['2:5'])
    click(cell(5, 0))
    click(cell(4, 5))
    expect(lit()).toEqual(['2:5', '4:5'])
    expect(engine.plays.at(-1)).toEqual({ pitches: [64], mode: 'block' })
  })

  it('puts the guitar root marker on the lower of two lit positions', () => {
    render(<App engine={createFakeEngine()} />)
    press('i')
    click(cell(1, 5))
    expect(rooted()).toEqual(['1:5'])
    click(cell(3, 0))
    expect(lit()).toEqual(['1:5', '3:0'])
    expect(rooted()).toEqual(['1:5'])
    click(cell(4, 5))
    expect(lit()).toHaveLength(3)
    expect(rooted()).toEqual(['1:5'])
  })

  it('allows two lit positions on one string', () => {
    render(<App engine={createFakeEngine()} />)
    press('i')
    click(cell(1, 0))
    click(cell(1, 5))
    expect(lit()).toEqual(['1:0', '1:5'])
  })

  it('keeps the same pitches lit across an instrument swap', () => {
    render(<App engine={createFakeEngine()} />)
    click(key(60))
    click(key(67))
    press('i')
    expect(lit()).toHaveLength(2)
    expect(readout()).toContain('P5')
    press('i')
    expect(lit()).toEqual(['60', '67'])
  })

  it('keeps a chord name across a swap', () => {
    render(<App engine={createFakeEngine()} />)
    click(key(60))
    click(key(64))
    click(key(67))
    press('i')
    expect(lit()).toHaveLength(3)
    expect(readout()).toContain('C major')
  })

  it('remembers a clicked guitar position through a swap', () => {
    render(<App engine={createFakeEngine()} />)
    press('i')
    click(cell(4, 5))
    press('i')
    expect(lit()).toEqual(['64'])
    press('i')
    expect(lit()).toEqual(['4:5'])
  })

  it('keeps the notes through Listen', () => {
    render(<App engine={createFakeEngine()} />)
    click(key(60))
    press('m')
    expect(document.querySelector('.listen')).not.toBeNull()
    expect(document.querySelector('.readout-interval')).toBeNull()
    press('m')
    expect(lit()).toEqual(['60'])
  })

  it('does not toggle notes in Listen', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    click(key(60))
    expect(lit()).toEqual([])
  })
})

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
    expect([...document.querySelectorAll('.fretboard [data-lit]')]).toHaveLength(3)
    const at = (string: number, fret: number) => document.querySelector(`[data-lit="${string}:${fret}"]`)?.getAttribute('data-role')
    // E4, G4 and C5 at their lowest frets on the high e string.
    expect(at(5, 0)).toBe('third')
    expect(at(5, 3)).toBe('fifth')
    expect(at(5, 8)).toBe('root')
  })

  it('draws the same roles on the guitar', () => {
    render(<App engine={createFakeEngine()} />)
    ;[60, 64, 67].forEach((n) => click(key(n)))
    click(radio('Guitar'))
    expect([...document.querySelectorAll('[data-lit]')].map((n) => n.getAttribute('data-role')).sort()).toEqual(['fifth', 'root', 'third'])
    expect(document.querySelector('.fretboard [data-tint]')).toBeNull()
  })
})
