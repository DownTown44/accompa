import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine } from '../support/fakeEngine'
import { click, key, lit, rooted } from '../support/dom'
import { press } from '../support/keys'
import { cell, legend, readout } from '../support/explore'

const roleAt = (at: string) => document.querySelector(`[data-lit="${at}"]`)?.getAttribute('data-role')

describe('Explore guitar', () => {
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

  it('replaces the lit note when another fret on its string is clicked', () => {
    render(<App engine={createFakeEngine()} />)
    press('i')
    click(cell(3, 5))
    click(cell(3, 7))
    expect(lit()).toEqual(['3:7'])
    expect(readout()).toContain('D')
    press('i')
    expect(lit()).toEqual(['62'])
  })

  it('replaces one note of a chord and names the new set', () => {
    render(<App engine={createFakeEngine()} />)
    press('i')
    click(cell(5, 0))
    click(cell(4, 1))
    click(cell(3, 0))
    expect(lit()).toHaveLength(3)
    click(cell(5, 3))
    expect(lit()).toHaveLength(3)
    expect(lit()).not.toContain('5:0')
    expect(lit()).toContain('5:3')
  })

  it('follows the notes that remain when one note of a pictured chord is replaced', () => {
    render(<App engine={createFakeEngine()} />)
    press('i')
    click(cell(2, 10))
    click(cell(3, 9))
    click(cell(4, 8))
    click(cell(5, 7))
    expect(readout()).toContain('Cmaj7')
    expect(legend()).toEqual(['root C', '3rd E (M3)', '5th G (P5)', '7th B (M7)'])
    click(cell(3, 11))
    expect(lit()).toEqual(['2:10', '3:11', '4:8', '5:7'])
    expect(lit()).not.toContain('3:9')
    expect(readout()).not.toContain('Cmaj7')
    expect(roleAt('2:10')).toBe('root')
    expect(roleAt('3:11')).toBe('none')
    expect(roleAt('4:8')).toBe('none')
    expect(roleAt('5:7')).toBe('none')
    expect(legend()).toEqual(['root C'])
  })

  it('brings the replaced note back with Esc and Undo', () => {
    render(<App engine={createFakeEngine()} />)
    press('i')
    click(cell(3, 5))
    click(cell(3, 7))
    press('Escape')
    expect(lit()).toEqual([])
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(lit()).toEqual(['3:7'])
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
})
