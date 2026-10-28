import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine } from '../support/fakeEngine'
import { listenSession } from '../support/sessions'
import { click, key, lit, radio, rooted } from '../support/dom'
import { press } from '../support/keys'
import { roleOf, legend, readout } from '../support/explore'

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
    expect(engine.plays).toEqual([{ pitches: [63], instrument: 'piano', mode: 'block' }])
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
      { pitches: [60, 64, 67], instrument: 'piano', mode: 'arpeggio' },
      { pitches: [60, 64, 67], instrument: 'piano', mode: 'block' },
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
    expect(engine.plays).toEqual([{ pitches: [65], instrument: 'piano', mode: 'block' }])
    expect(lit()).toEqual(['65'])
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
