import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine } from '../support/fakeEngine'
import { listenSession } from '../support/sessions'

const key = (n: number) => document.querySelector(`[data-pitch="${n}"]`)!
const click = (el: Element) => {
  fireEvent.pointerDown(el)
  fireEvent.pointerUp(el)
}
const lit = () => [...document.querySelectorAll('[data-lit]')].map((n) => n.getAttribute('data-lit')).sort()
const press = (k: string, target: Element = document.body) => fireEvent.keyDown(target, { key: k })
const playBtn = () => screen.getByRole('button', { name: /^Play/ })
const blockBtn = () => screen.getByRole('button', { name: /^Block/ })
const note = () => document.querySelector('.status-note')!
const undo = () => screen.queryByRole('button', { name: 'Undo' })

function setup() {
  const engine = createFakeEngine()
  render(<App engine={engine} />)
  click(key(67))
  click(key(60))
  engine.plays.length = 0
  return engine
}

describe('Explore controls', () => {
  it('plays the pair low to high on Space and together on Enter', () => {
    const engine = setup()
    press(' ')
    press('Enter')
    expect(engine.plays).toEqual([
      { pitches: [60, 67], mode: 'arpeggio' },
      { pitches: [60, 67], mode: 'block' },
    ])
  })

  it('plays one note alone and replays the current pair', () => {
    const engine = createFakeEngine()
    render(<App engine={engine} />)
    click(key(64))
    engine.plays.length = 0
    press(' ')
    expect(engine.plays).toEqual([{ pitches: [64], mode: 'arpeggio' }])
    click(key(60))
    click(key(67))
    engine.plays.length = 0
    press(' ')
    expect(engine.plays).toEqual([{ pitches: [60, 67], mode: 'arpeggio' }])
  })

  it('plays nothing with nothing lit and disables the buttons', () => {
    const engine = createFakeEngine()
    render(<App engine={engine} />)
    press(' ')
    press('Enter')
    fireEvent.click(playBtn())
    expect(engine.plays).toEqual([])
    expect(playBtn().getAttribute('aria-disabled')).toBe('true')
    expect(blockBtn().getAttribute('aria-disabled')).toBe('true')
    expect(blockBtn().className).toContain('action-primary')
    click(key(60))
    expect(playBtn().getAttribute('aria-disabled')).toBeNull()
  })

  it('activates a focused button once, without the shortcut', () => {
    const engine = setup()
    blockBtn().focus()
    press('Enter', blockBtn())
    expect(engine.plays).toEqual([])
    fireEvent.click(blockBtn(), { detail: 0 })
    expect(engine.plays).toEqual([{ pitches: [60, 67], mode: 'block' }])
  })

  it('is absent in Listen', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    expect(screen.queryByRole('button', { name: /^Block/ })).toBeNull()
  })
})

describe('Esc clear and undo', () => {
  it('clears the notes with an Undo note, and undo restores them silently', () => {
    const engine = setup()
    press('Escape')
    expect(lit()).toEqual([])
    expect(screen.getByText('Select notes to build a chord')).toBeTruthy()
    expect(note().textContent).toBe('Notes cleared. Undo')
    fireEvent.click(undo()!)
    expect(lit()).toEqual(['60', '67'])
    expect(engine.plays).toEqual([])
    expect(undo()).toBeNull()
    expect(note().textContent).toBe('')
  })

  it('drops the note on the next note change', () => {
    setup()
    press('Escape')
    click(key(62))
    expect(undo()).toBeNull()
    expect(note().textContent).toBe('')
  })

  it('closes the Setup panel first, then clears', () => {
    setup()
    press('p')
    press('Escape')
    expect(lit()).toEqual(['60', '67'])
    expect(undo()).toBeNull()
    press('Escape')
    expect(lit()).toEqual([])
    expect(undo()).not.toBeNull()
  })

  it('does nothing in Listen or with nothing lit', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    press('Escape')
    expect(undo()).toBeNull()
  })

  it('keeps the note across an instrument swap and shows the wake message first when blocked', () => {
    const engine = createFakeEngine()
    render(<App engine={engine} />)
    click(key(60))
    press('Escape')
    press('i')
    expect(undo()).not.toBeNull()
    act(() => engine.setStatus('blocked'))
    expect(note().textContent).toBe('Press any key to wake the sound.')
    act(() => engine.setStatus('running'))
    expect(note().textContent).toBe('Notes cleared. Undo')
  })

  it('puts Undo after the controls and before the Setup opener in Tab order', () => {
    setup()
    press('Escape')
    const stops = [...document.querySelectorAll<HTMLElement>('input, button, [tabindex]')]
    const order = [playBtn(), blockBtn(), undo()!, screen.getByRole('button', { name: 'Setup' })].map((el) => stops.indexOf(el))
    expect(order).toEqual([...order].sort((a, b) => a - b))
    expect(order.every((i) => i >= 0)).toBe(true)
  })
})
