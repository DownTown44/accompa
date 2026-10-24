import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine } from '../support/fakeEngine'
import { listenSession } from '../support/sessions'
import { opener, radio } from '../support/dom'
import { press } from '../support/keys'
import { registerSetupHooks } from '../support/setupPanel'

registerSetupHooks()

describe('root control', () => {
  const note = () => document.querySelector('.status-note')!.textContent
  const lit = () => [...document.querySelectorAll('[data-lit]')].map((n) => n.getAttribute('data-lit'))
  const rooted = () => [...document.querySelectorAll('[data-root]')].map((n) => n.getAttribute('data-lit'))
  const key = (pitch: number) => document.querySelector(`[data-pitch="${pitch}"]`)!
  const cell = (string: number, fret: number) => document.querySelector(`.fb-cell[data-string="${string}"][data-fret="${fret}"]`)!
  const fixed = () => {
    fireEvent.click(opener())
    fireEvent.click(radio('Fixed'))
  }

  it('is a labelled radiogroup under Direction, Random by default', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    const group = screen.getByRole('radiogroup', { name: 'Root', hidden: true })
    expect(group).toBeTruthy()
    expect(radio('Random').checked).toBe(true)
    expect(radio('Fixed').checked).toBe(false)
    const headings = [...document.querySelectorAll('.setup-sublabel')].map((h) => h.textContent)
    expect(headings.indexOf('Root')).toBe(headings.indexOf('Direction') + 1)
    expect(note()).toBe('')
    expect(lit()).toEqual([])
  })

  it('shows the status note until a root is chosen by a press, which sounds once on the piano', () => {
    const engine = createFakeEngine()
    render(<App session={listenSession} engine={engine} />)
    fixed()
    expect(note()).toBe('Click a note to set the root.')
    fireEvent.pointerDown(key(57))
    expect(engine.plays).toEqual([{ pitches: [57], mode: 'block' }])
    expect(note()).toBe('')
    expect(lit()).toEqual(['57'])
    expect(rooted()).toEqual(['57'])
    fireEvent.keyDown(document.body, { key: 'i' })
    expect(lit().sort()).toEqual(['0:17', '1:12', '2:7', '3:2'].sort())
    expect(rooted()).toEqual(['3:2'])
  })

  it('keeps the question, its marks and the stored root when Random is chosen again', () => {
    const engine = createFakeEngine()
    render(<App session={listenSession} engine={engine} />)
    fixed()
    fireEvent.pointerDown(key(57))
    press({ key: '1' })
    expect(document.querySelectorAll('.interval-button.wrong')).toHaveLength(1)
    fireEvent.click(radio('Random'))
    expect(document.querySelectorAll('.interval-button.wrong')).toHaveLength(1)
    expect(engine.plays).toHaveLength(1)
    expect(lit()).toEqual([])
    fireEvent.click(radio('Fixed'))
    expect(document.querySelectorAll('.interval-button.wrong')).toHaveLength(0)
    expect(rooted()).toEqual(['57'])
  })

  it('sets the root from the guitar and rings the lowest fret', () => {
    const engine = createFakeEngine()
    render(<App session={listenSession} engine={engine} />)
    fixed()
    fireEvent.keyDown(document.body, { key: 'i' })
    fireEvent.pointerDown(cell(2, 7))
    expect(engine.plays).toEqual([{ pitches: [57], mode: 'block' }])
    expect(rooted()).toEqual(['3:2'])
    fireEvent.keyDown(document.body, { key: 'i' })
    expect(rooted()).toEqual(['57'])
  })

  it('roots every later question on the chosen pitch class and leaves the question in play alone', () => {
    const engine = createFakeEngine()
    render(<App session={listenSession} engine={engine} />)
    fixed()
    fireEvent.pointerDown(key(57))
    engine.plays.length = 0
    fireEvent.keyDown(document.body, { key: ' ' })
    const first = engine.plays[0]!.pitches
    expect(first[0]! % 12).toBe(9)
    expect(first[0]).toBe(57)
    fireEvent.pointerDown(key(50))
    expect(engine.plays).toHaveLength(2)
    fireEvent.keyDown(document.body, { key: ' ' })
    expect(engine.plays[2]!.pitches[0]).toBe(50)
    fireEvent.keyDown(document.body, { key: 'Enter' })
    fireEvent.keyDown(document.body, { key: 'Enter' })
    expect(engine.plays[3]!.pitches[0]).toBe(50)
  })

  it('replaces the question silently when Fixed is chosen with a root, or a note is pressed', () => {
    const engine = createFakeEngine()
    render(<App session={listenSession} engine={engine} />)
    fixed()
    fireEvent.pointerDown(key(57))
    fireEvent.click(radio('Random'))
    fireEvent.keyDown(document.body, { key: ' ' })
    fireEvent.keyDown(document.body, { key: '3' })
    engine.plays.length = 0
    vi.spyOn(Math, 'random').mockReturnValue(0.9)
    fireEvent.click(radio('Fixed'))
    expect(engine.plays).toEqual([])
    expect(document.querySelectorAll('.interval-button.wrong')).toHaveLength(0)
    fireEvent.keyDown(document.body, { key: 'Escape' })
    fireEvent.keyDown(document.body, { key: ' ' })
    expect(engine.plays[0]!.pitches[0]! % 12).toBe(9)
    fireEvent.pointerDown(key(60))
    expect(engine.plays).toHaveLength(2)
    fireEvent.keyDown(document.body, { key: ' ' })
    expect(engine.plays[2]!.pitches[0]).toBe(60)
  })

  it('drops the question when Fixed is chosen with no root, then roots a new one on the next press', () => {
    const engine = createFakeEngine()
    render(<App session={listenSession} engine={engine} />)
    fireEvent.keyDown(document.body, { key: ' ' })
    engine.plays.length = 0
    fixed()
    expect(screen.getByText('Which interval?')).toBeTruthy()
    expect(note()).toBe('Click a note to set the root.')
    fireEvent.pointerDown(key(57))
    expect(engine.plays).toEqual([{ pitches: [57], mode: 'block' }])
    expect(note()).toBe('')
    fireEvent.keyDown(document.body, { key: ' ' })
    expect(engine.plays[1]!.pitches[0]).toBe(57)
  })

  it('changes nothing when Random is chosen again', () => {
    const engine = createFakeEngine()
    render(<App session={listenSession} engine={engine} />)
    fireEvent.keyDown(document.body, { key: ' ' })
    fireEvent.keyDown(document.body, { key: '3' })
    fireEvent.click(opener())
    fireEvent.click(radio('Random'))
    expect(document.querySelectorAll('.interval-button.wrong')).toHaveLength(1)
    expect(engine.plays).toHaveLength(1)
  })

  it('draws a random root first when none was chosen and keeps it', () => {
    const engine = createFakeEngine()
    render(<App session={listenSession} engine={engine} />)
    fixed()
    fireEvent.keyDown(document.body, { key: ' ' })
    const root = engine.plays[0]!.pitches[0]!
    expect(note()).toBe('')
    expect(rooted()).toEqual([String(root)])
    fireEvent.keyDown(document.body, { key: 'Enter' })
    fireEvent.keyDown(document.body, { key: 'Enter' })
    expect(engine.plays[1]!.pitches[0]! % 12).toBe(root % 12)
  })

  it('shows the question notes once revealed', () => {
    const engine = createFakeEngine()
    render(<App session={listenSession} engine={engine} />)
    fixed()
    fireEvent.pointerDown(key(57))
    fireEvent.keyDown(document.body, { key: ' ' })
    fireEvent.keyDown(document.body, { key: 'Enter' })
    expect(lit()).toHaveLength(2)
    expect(rooted()).toEqual(['57'])
  })

  it('does nothing on a press in Random, and keeps the root through Random and back', () => {
    const engine = createFakeEngine()
    render(<App session={listenSession} engine={engine} />)
    fireEvent.pointerDown(key(57))
    expect(engine.plays).toEqual([])
    fixed()
    fireEvent.pointerDown(key(57))
    fireEvent.click(radio('Random'))
    expect(lit()).toEqual([])
    fireEvent.pointerDown(key(60))
    expect(engine.plays).toHaveLength(1)
    fireEvent.click(radio('Fixed'))
    expect(rooted()).toEqual(['57'])
    fireEvent.keyDown(document.body, { key: 'm' })
    expect(lit()).toEqual([])
  })

  it('is not saved', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    fixed()
    expect(Object.keys(localStorage).join()).not.toMatch(/root/i)
  })

  it('yields digit keys to a focused radio', () => {
    const engine = createFakeEngine()
    render(<App session={listenSession} engine={engine} />)
    fireEvent.click(opener())
    radio('Fixed').focus()
    press({ key: '1' }, radio('Fixed'))
    expect(engine.plays).toEqual([])
  })
})
