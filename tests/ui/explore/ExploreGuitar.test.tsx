import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { pitch } from '../../../src/core/pitch'
import { App } from '../../../src/ui/app/App'
import { initialSession } from '../../../src/ui/session/session'
import { createFakeEngine } from '../support/fakeEngine'
import { click, key, lit, rooted } from '../support/dom'
import { press } from '../support/keys'
import { cell, legend, mutedStrings, openRings, readout, status } from '../support/explore'

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

  it('replaces one note of a pair and names the new pair', () => {
    render(<App engine={createFakeEngine()} />)
    press('i')
    click(cell(5, 0))
    click(cell(4, 1))
    expect(lit()).toEqual(['4:1', '5:0'])
    expect(readout()).toContain('M3')
    click(cell(5, 3))
    expect(lit()).toEqual(['4:1', '5:3'])
    expect(readout()).toContain('P5')
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
    expect(lit().length).toBeGreaterThanOrEqual(3)
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

  describe('chord voicing', () => {
    const build = (...pitches: number[]) => {
      render(<App engine={createFakeEngine()} />)
      pitches.forEach((p) => click(key(p)))
      press('i')
    }
    const fromSession = (...pitches: number[]) => {
      render(<App engine={createFakeEngine()} session={{ ...initialSession, workspace: { pitches: pitches.map(pitch), positions: {} } }} />)
      press('i')
    }
    const frets = () => lit().map((m) => Number(m!.split(':')[1]))
    const strings = () => lit().map((m) => Number(m!.split(':')[0]))
    const TUNING = [40, 45, 50, 55, 59, 64]
    const lowestSounding = () => Math.min(...lit().map((m) => TUNING[Number(m!.split(':')[0])]! + Number(m!.split(':')[1])))

    it('shows the best voicing of a swapped C major with the root ringed', () => {
      build(60, 64, 67)
      expect(lit()).toEqual(['0:8', '1:10', '2:10', '3:9', '4:8', '5:8'])
      expect(rooted()).toEqual(['0:8', '2:10', '5:8'])
      expect([...document.querySelectorAll('[data-root]')].every((n) => n.getAttribute('data-role') === 'root')).toBe(true)
      expect(readout()).toContain('C major')
      expect(legend()).toEqual(['root C', '3rd E (M3)', '5th G (P5)'])
    })

    it('marks open strings with a ring and muted strings with an x on exactly the unused strings', () => {
      fromSession(41, 45, 48)
      expect(lit()).toEqual(['0:1', '1:0', '2:3', '3:2'])
      expect(openRings()).toBe(1)
      expect(mutedStrings()).toEqual([0, 1, 2, 3, 4, 5].filter((s) => !strings().includes(s)))
      expect(mutedStrings()).toEqual([4, 5])
    })

    it('puts a high chord high on the neck', () => {
      build(72, 76, 79)
      expect(Math.min(...frets())).toBeGreaterThan(5)
    })

    it('puts a low chord low on the neck', () => {
      build(48, 52, 55)
      expect(Math.max(...frets())).toBeLessThanOrEqual(5)
    })

    it('keeps the 3.9 placement for one note and an interval', () => {
      build(60)
      expect(lit()).toHaveLength(1)
      expect(mutedStrings()).toEqual([])
    })

    it('keeps the 3.9 placement for notes with no reading', () => {
      build(60, 61, 62)
      expect(lit()).toHaveLength(3)
      expect(mutedStrings()).toEqual([])
    })

    it('says 5th left out when the best voicing omits the 5th, and not for C major', () => {
      fromSession(41, 45, 48)
      expect(lit()).toEqual(['0:1', '1:0', '2:3', '3:2'])
      expect(status()).toBe('5th left out')
      expect(legend()).toEqual(['root F', '3rd A (M3)', '5th C (P5)'])
      cleanup()
      build(60, 64, 67)
      expect(status()).not.toContain('5th left out')
    })

    it('puts the bass note of a slash chord lowest', () => {
      build(64, 67, 72)
      expect(readout()).toContain('C major')
      expect(lit()).toEqual(['0:12', '1:10', '2:10', '3:12', '4:13', '5:12'])
      expect(lowestSounding() % 12).toBe(4)
    })

    it('follows a chosen root: the ring moves and the lowest note stays the bass', () => {
      build(60, 64, 68)
      expect(rooted()).toEqual(['0:8', '2:10', '5:8'])
      press('i')
      press('r')
      click(key(64))
      press('i')
      expect(lit()).toEqual(['0:8', '1:11', '2:10', '3:9', '4:9', '5:8'])
      expect(rooted()).toEqual(['3:9'])
      expect([...document.querySelectorAll('[data-root]')].every((n) => n.getAttribute('data-role') === 'root')).toBe(true)
      expect(lowestSounding() % 12).toBe(0)
    })

    it('shows every lit note on the piano after a swap back', () => {
      build(60, 64, 67)
      press('i')
      expect(lit()).toEqual(['60', '64', '67'])
    })

    it('brings the voicing back with Undo after Escape', () => {
      build(60, 64, 67)
      press('Escape')
      expect(lit()).toEqual([])
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      expect(lit()).toEqual(['0:8', '1:10', '2:10', '3:9', '4:8', '5:8'])
    })

    it('recomputes the voicing from the lit notes after a click', () => {
      build(60, 64, 67)
      click(cell(0, 8))
      const after = lit()
      expect(readout()).toContain('C major')
      cleanup()
      fromSession(60, 64, 67, 48)
      expect(lit()).toEqual(after)
    })
  })
})
