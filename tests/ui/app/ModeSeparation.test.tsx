import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine, type FakeEngine } from '../support/fakeEngine'

const key = (n: number) => document.querySelector(`[data-pitch="${n}"]`)!
const click = (el: Element) => {
  fireEvent.pointerDown(el)
  fireEvent.pointerUp(el)
}
const lit = () => [...document.querySelectorAll('[data-lit]')].map((n) => n.getAttribute('data-lit')).sort()
const rooted = () => [...document.querySelectorAll('[data-root]')].map((n) => n.getAttribute('data-lit'))
const press = (k: string) => fireEvent.keyDown(document.body, { key: k })
const radio = (name: string) => screen.getByRole('radio', { name, hidden: true }) as HTMLInputElement
const opener = () => screen.getByRole('button', { name: 'Setup' })
const chip = (name: string) => [...document.querySelectorAll<HTMLButtonElement>('.setup-chip')].find((c) => c.textContent === name)!
const wrong = () => document.querySelectorAll('.interval-button.wrong').length
const lastPlay = (engine: FakeEngine) => engine.plays[engine.plays.length - 1]

let engine: FakeEngine

beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
  engine = createFakeEngine()
  render(<App engine={engine} />)
})

afterEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  vi.restoreAllMocks()
})

describe('Explore notes through a Listen visit', () => {
  it('keeps the same notes and root marker after answering a question', () => {
    click(key(60))
    click(key(67))
    press('m')
    press(' ')
    press('Enter')
    expect(lit()).toEqual(['60', '67'])
    press('m')
    expect(lit()).toEqual(['60', '67'])
    expect(rooted()).toEqual(['60'])
    expect(document.querySelector('.piano')).not.toBeNull()
  })

  it('lights only the question notes on reveal, none of the workspace', () => {
    click(key(62))
    click(key(65))
    press('m')
    expect(lit()).toEqual([])
    press(' ')
    expect(lit()).toEqual([])
    press('Enter')
    expect(lit()).toEqual(['60', '67'])
    expect(rooted()).toEqual(['60'])
  })

  it('keeps a cleared workspace empty, with Undo, through a visit', () => {
    click(key(60))
    click(key(67))
    press('Escape')
    expect(lit()).toEqual([])
    press('m')
    press(' ')
    press('Enter')
    press('m')
    expect(lit()).toEqual([])
    expect(document.querySelector('.status-note')!.textContent).toContain('Notes cleared.')
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(lit()).toEqual(['60', '67'])
  })

  it('keeps the same pitches lit on the other instrument after a swap in Listen', () => {
    click(key(60))
    click(key(67))
    press('m')
    press('i')
    expect(document.querySelector('.fretboard')).not.toBeNull()
    press('m')
    expect(document.querySelector('.fretboard')).not.toBeNull()
    expect(lit()).toHaveLength(2)
    press('i')
    expect(lit()).toEqual(['60', '67'])
  })

  it('plays one question on the first visit and leaves the notes alone', () => {
    click(key(60))
    engine.plays.length = 0
    press('m')
    expect(engine.plays).toHaveLength(1)
    expect(engine.plays[0].pitches).toHaveLength(2)
    press('m')
    expect(lit()).toEqual(['60'])
  })
})

describe('the Listen question through Explore', () => {
  const ask = () => {
    press('m')
    press(' ')
    press('3')
    expect(wrong()).toBe(1)
    engine.plays.length = 0
  }

  it('keeps the question, its wrong mark and the reveal state, and plays nothing', () => {
    ask()
    press('m')
    click(key(62))
    click(key(65))
    click(key(65))
    press('m')
    expect(wrong()).toBe(1)
    expect(screen.getByText('Which interval?')).toBeTruthy()
    expect(lit()).toEqual([])
    expect(engine.plays.filter((p) => p.mode === 'arpeggio')).toHaveLength(0)
    press(' ')
    expect(lastPlay(engine).pitches).toEqual([60, 67])
  })

  it('keeps a revealed question revealed', () => {
    press('m')
    press(' ')
    press('Enter')
    press('m')
    click(key(62))
    press('m')
    expect(lit()).toEqual(['60', '67'])
    expect(screen.getByText('P5', { selector: '.readout-question' })).toBeTruthy()
  })

  it('stores a Direction change made in Explore and uses it from the next question', () => {
    ask()
    press('m')
    fireEvent.click(opener())
    fireEvent.click(radio('Descending'), { detail: 1 })
    press('Escape')
    expect(engine.plays).toEqual([])
    press('m')
    expect(wrong()).toBe(1)
    expect(engine.plays).toEqual([])
    press(' ')
    expect(lastPlay(engine).pitches).toEqual([60, 67])
    press('Enter')
    press('Enter')
    const next = lastPlay(engine)
    expect(next.pitches[0]).toBeGreaterThan(next.pitches[1])
  })

  it('still replaces the question silently when Direction changes in Listen', () => {
    ask()
    fireEvent.click(opener())
    fireEvent.click(radio('Descending'), { detail: 1 })
    expect(wrong()).toBe(0)
    expect(engine.plays).toEqual([])
  })

  it('stores a Root change made in Explore and keeps the waiting question', () => {
    ask()
    press('m')
    fireEvent.click(opener())
    fireEvent.click(radio('Fixed'))
    press('Escape')
    expect(engine.plays).toEqual([])
    press('m')
    expect(wrong()).toBe(1)
    expect(engine.plays).toEqual([])
    press(' ')
    expect(lastPlay(engine).pitches).toEqual([60, 67])
    press('Enter')
    press('Enter')
    expect(lastPlay(engine).pitches).toHaveLength(2)
  })

  it('keeps the question and marks when a chip or the theme changes in Explore', () => {
    ask()
    press('m')
    fireEvent.click(opener())
    fireEvent.click(chip('m2'))
    fireEvent.click(radio('Dark'), { detail: 1 })
    press('Escape')
    press('m')
    expect(wrong()).toBe(1)
    expect(engine.plays).toEqual([])
    press(' ')
    expect(lastPlay(engine).pitches).toEqual([60, 67])
  })
})
