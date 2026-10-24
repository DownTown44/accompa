import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine } from '../support/fakeEngine'
import { listenSession } from '../support/sessions'

const key = (n: number) => document.querySelector(`[data-pitch="${n}"]`)!
const cell = (string: number, fret: number) => document.querySelector(`.fb-cell[data-string="${string}"][data-fret="${fret}"]`)!
const click = (el: Element) => {
  fireEvent.pointerDown(el)
  fireEvent.pointerUp(el)
}
const lit = () => [...document.querySelectorAll('[data-lit]')].map((n) => n.getAttribute('data-lit')).sort()
const rooted = () => [...document.querySelectorAll('[data-root]')].map((n) => n.getAttribute('data-lit'))
const readout = () => document.querySelector('.readout-interval')?.textContent
const radio = (name: string) => screen.getByRole('radio', { name }) as HTMLInputElement
const press = (k: string) => fireEvent.keyDown(document.body, { key: k })

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

  it('unlights the oldest on a third note and unlights a clicked lit note, sounding both', () => {
    const engine = createFakeEngine()
    render(<App engine={engine} />)
    click(key(60))
    click(key(67))
    click(key(64))
    expect(lit()).toEqual(['64', '67'])
    expect(readout()).toContain('m3')
    click(key(64))
    expect(lit()).toEqual(['67'])
    expect(engine.plays).toHaveLength(4)
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
    expect(rooted()).toEqual(['3:0'])
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
})
