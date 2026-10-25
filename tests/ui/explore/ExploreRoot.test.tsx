import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine } from '../support/fakeEngine'
import { click, key, lit, rooted } from '../support/dom'
import { press } from '../support/keys'
import { alts, bigLabel, cell, roleOf, legend } from '../support/explore'

describe('Explore chosen root', () => {
  const ARMED = 'Click a lit note to set the root.'
  const armed = () => document.body.textContent!.includes(ARMED)
  const setup = (notes: number[]) => {
    const engine = createFakeEngine()
    render(<App engine={engine} />)
    notes.forEach((n) => click(key(n)))
    return engine
  }

  it('roots a set on a note that roots no reading and reads as unknown', () => {
    setup([60, 64, 67, 72])
    press('r')
    expect(armed()).toBe(true)
    click(key(64))
    expect(armed()).toBe(false)
    expect(bigLabel()).toBe('C E G')
    expect(rooted()).toEqual(['64'])
    expect(roleOf(60)).toBe('none')
    expect(legend()).toEqual(['root E'])
    expect(lit()).toEqual(['60', '64', '67', '72'])
  })

  it('moves the root to the reading of the clicked note, still sounding it', () => {
    const engine = setup([60, 63, 66, 69])
    const sounded = engine.plays.length
    press('r')
    click(key(66))
    expect(engine.plays.length).toBe(sounded + 1)
    expect(bigLabel()).toBe('F♯dim7/C')
    expect(rooted()).toEqual(['66'])
    expect(lit()).toEqual(['60', '63', '66', '69'])
  })

  it('lists the namer readings for an unknown set and clears the root on a click', () => {
    setup([60, 64, 67, 71])
    press('r')
    click(key(67))
    expect(bigLabel()).toBe('C E G B')
    expect(alts().map((b) => b.querySelector('span')!.textContent)).toEqual(['Cmaj7'])
    fireEvent.click(alts()[0]!)
    expect(bigLabel()).toBe('Cmaj7')
    expect(rooted()).toEqual(['60'])
  })

  it('lights an unlit note while armed and stays armed; R again, Esc and a mode switch disarm', () => {
    setup([60, 64, 67])
    press('r')
    click(key(72))
    expect(lit()).toContain('72')
    expect(armed()).toBe(true)
    press('r')
    expect(armed()).toBe(false)
    press('r')
    press('Escape')
    expect(armed()).toBe(false)
    expect(lit()).toHaveLength(4)
    press('r')
    press('m')
    press('m')
    expect(armed()).toBe(false)
  })

  it('keeps the root through added notes and clears it when unlit', () => {
    setup([60, 64, 67, 71])
    press('r')
    click(key(64))
    click(key(74))
    expect(rooted()).toEqual(['64'])
    click(key(64))
    expect(rooted()).toEqual(['60'])
  })

  it('arms nothing with no notes, and ignores R on a focused button, with Ctrl and in Listen', () => {
    setup([])
    press('r')
    expect(armed()).toBe(false)
    click(key(60))
    press('r', screen.getByRole('button', { name: 'Block' }))
    press({ key: 'r', ctrlKey: true })
    expect(armed()).toBe(false)
    press('m')
    press('r')
    expect(armed()).toBe(false)
  })

  it('on the guitar a root click keeps the shown position', () => {
    setup([])
    press('i')
    ;[cell(0, 0), cell(1, 2), cell(2, 5)].forEach((c) => click(c))
    press('r')
    click(cell(3, 0))
    expect(lit()).toEqual(['0:0', '1:2', '2:5'])
    expect(rooted()).toEqual(['2:5'])
    expect(armed()).toBe(false)
  })
})
