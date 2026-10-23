import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { STANDARD_GUITAR_TUNING } from '../../../../src/core/instruments'
import { pitch } from '../../../../src/core/pitch'
import { Fretboard } from '../../../../src/ui/instruments/guitar/Fretboard'

const dropD = [38, 45, 50, 55, 59, 64].map(pitch)
const draw = (props: Partial<Parameters<typeof Fretboard>[0]> = {}) =>
  render(<Fretboard tuning={STANDARD_GUITAR_TUNING} lit={[]} {...props} />).container

describe('Fretboard', () => {
  it('draws six named strings, 22 wires, numbers and a nut', () => {
    const c = draw()
    expect([...c.querySelectorAll('.fb-name')].map((t) => t.textContent)).toEqual(['E', 'A', 'D', 'G', 'B', 'e'])
    expect(c.querySelectorAll('.fb-string')).toHaveLength(6)
    expect(c.querySelectorAll('.fb-fret')).toHaveLength(22)
    expect([...c.querySelectorAll('.fb-number')].map((t) => t.textContent)).toEqual(Array.from({ length: 22 }, (_, i) => String(i + 1)))
    expect(c.querySelectorAll('.fb-nut')).toHaveLength(1)
  })

  it('draws the low string at the bottom', () => {
    const c = draw()
    const y = (s: number) => Number(c.querySelector(`.fb-name[data-string="${s}"]`)!.getAttribute('y'))
    expect(y(0)).toBeGreaterThan(y(5))
  })

  it('centres a lit fret between its wires', () => {
    const c = draw({ lit: [{ string: 2, fret: 5 }] })
    const dot = c.querySelector('[data-lit="2:5"] .lit-dot')!
    const wires = [...c.querySelectorAll('.fb-fret')].map((l) => Number(l.getAttribute('x1')))
    expect(Number(dot.getAttribute('cx'))).toBeCloseTo((wires[3]! + wires[4]!) / 2)
    expect(c.querySelectorAll('.fb-open-ring')).toHaveLength(0)
  })

  it('rings a lit open string at the nut', () => {
    const c = draw({ lit: [{ string: 5, fret: 0 }] })
    expect(c.querySelectorAll('.fb-open-ring')).toHaveLength(1)
    expect(Number(c.querySelector('.lit-dot')!.getAttribute('cx'))).toBeLessThan(150)
  })

  it('draws nothing for out-of-range positions', () => {
    const c = draw({ lit: [{ string: 6, fret: 1 }, { string: 0, fret: 23 }, { string: 0, fret: -1 }] })
    expect(c.querySelectorAll('[data-lit]')).toHaveLength(0)
  })

  it('reports press and release once with string, fret and pitch', () => {
    const onNotePress = vi.fn()
    const onNoteRelease = vi.fn()
    const c = draw({ onNotePress, onNoteRelease })
    const cell = c.querySelector('[data-string="4"][data-fret="5"]')!
    fireEvent.pointerDown(cell)
    fireEvent.pointerUp(cell)
    fireEvent.pointerUp(cell)
    expect(onNotePress).toHaveBeenCalledOnce()
    expect(onNotePress).toHaveBeenCalledWith({ string: 4, fret: 5, pitch: pitch(64) })
    expect(onNoteRelease).toHaveBeenCalledOnce()
    expect(onNoteRelease).toHaveBeenCalledWith({ string: 4, fret: 5, pitch: pitch(64) })
  })

  it('releases on cancel and tolerates missing handlers', () => {
    const onNoteRelease = vi.fn()
    const c = draw({ onNoteRelease })
    const cell = c.querySelector('[data-string="0"][data-fret="0"]')!
    fireEvent.pointerDown(cell)
    fireEvent.pointerCancel(cell)
    expect(onNoteRelease).toHaveBeenCalledOnce()
    const d = draw()
    expect(() => fireEvent.pointerDown(d.querySelector('.fb-cell')!)).not.toThrow()
  })

  it('ignores non-primary buttons', () => {
    const onNotePress = vi.fn()
    const onNoteRelease = vi.fn()
    const c = draw({ onNotePress, onNoteRelease })
    const cell = c.querySelector('[data-string="4"][data-fret="5"]')!
    for (const button of [2, 1]) {
      fireEvent.pointerDown(cell, { button })
      fireEvent.pointerUp(cell, { button })
    }
    expect(onNotePress).not.toHaveBeenCalled()
    expect(onNoteRelease).not.toHaveBeenCalled()
  })

  it('has one focus stop', () => {
    expect(draw().querySelectorAll('[tabindex]')).toHaveLength(1)
  })

  it('follows a custom tuning and fret count', () => {
    const c = draw({ tuning: dropD, frets: 12 })
    expect([...c.querySelectorAll('.fb-name')].map((t) => t.textContent)).toEqual(['D', 'A', 'd', 'G', 'B', 'E'])
    expect(c.querySelectorAll('.fb-fret')).toHaveLength(12)
    const onNotePress = vi.fn()
    const d = draw({ tuning: dropD, onNotePress })
    fireEvent.pointerDown(d.querySelector('[data-string="0"][data-fret="2"]')!)
    expect(onNotePress.mock.calls[0]![0].pitch).toBe(40)
  })
})

describe('root marker', () => {
  it('rings only the root position', () => {
    const c = draw({ lit: [{ string: 1, fret: 0 }, { string: 2, fret: 2 }], root: { string: 1, fret: 0 } })
    expect(c.querySelectorAll('.root-ring')).toHaveLength(1)
    expect(c.querySelector('[data-root]')!.getAttribute('data-lit')).toBe('1:0')
  })
})
