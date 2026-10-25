import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { pitch } from '../../../src/core/pitch'
import { App } from '../../../src/ui/app/App'
import { initialSession, type Session } from '../../../src/ui/session/session'
import { createFakeEngine } from '../support/fakeEngine'
import { click, lit, radio } from '../support/dom'
import { cell, legend } from '../support/explore'
import { press } from '../support/keys'

const note = () => document.querySelector('.status-note')!.textContent
const readout = () => document.querySelector('.readout-interval')?.textContent ?? ''
const litCount = () => document.querySelectorAll('.fretboard [data-lit]').length

const withNotes = (...pitches: number[]): Session => ({
  ...initialSession,
  workspace: { pitches: pitches.map(pitch), positions: {} },
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('notes lit beyond the fretboard', () => {
  it('names one note after a swap, and leaves the readout and the fretboard alone', () => {
    render(<App engine={createFakeEngine()} session={withNotes(90)} />)
    expect(note()).not.toContain('beyond')
    press('i')
    expect(note()).toBe('1 note lit beyond the fretboard')
    expect(readout()).toContain('F♯')
    expect(litCount()).toBe(0)
  })

  it('counts two notes and still names the interval', () => {
    render(<App engine={createFakeEngine()} session={withNotes(90, 97)} />)
    press('i')
    expect(note()).toBe('2 notes lit beyond the fretboard')
    expect(readout()).toContain('P5')
  })

  it('counts a chord note beyond the fretboard and keeps the name', () => {
    render(<App engine={createFakeEngine()} session={withNotes(45, 49, 52, 88)} />)
    press('i')
    expect(note()).toBe('1 note lit beyond the fretboard')
    expect(document.querySelector('.readout-interval span')!.textContent).toBe('A')
    expect(readout()).toContain('A major')
  })

  it('says how many were left out beside the notes beyond', () => {
    render(<App engine={createFakeEngine()} session={withNotes(40, 44, 47, 88)} />)
    press('i')
    expect(note()).toBe('1 note lit beyond the fretboard, 1 left out')
    expect(readout()).toContain('E major')
  })

  it('says a note was left out, and shows every note again on the piano', () => {
    render(<App engine={createFakeEngine()} session={withNotes(40, 41)} />)
    press('i')
    expect(note()).toBe('1 note left out: one note per string')
    expect(litCount()).toBe(1)
    press('i')
    expect(note()).not.toContain('left out')
    expect(document.querySelectorAll('[data-lit]')).toHaveLength(2)
  })

  it('shows six of seven notes on the guitar, leaves out the newest, and keeps all seven on the piano', () => {
    render(<App engine={createFakeEngine()} session={withNotes(60, 62, 64, 65, 67, 69, 71)} />)
    press('i')
    expect(litCount()).toBe(6)
    expect(note()).toBe('1 note left out: one note per string')
    press('i')
    expect(document.querySelectorAll('[data-lit]')).toHaveLength(7)
  })

  it('counts one note when the other is in range, and lights that one', () => {
    render(<App engine={createFakeEngine()} session={withNotes(60, 90)} />)
    press('i')
    expect(note()).toBe('1 note lit beyond the fretboard')
    expect(litCount()).toBe(1)
  })

  it('goes away when swapping back to the piano', () => {
    render(<App engine={createFakeEngine()} session={withNotes(90)} />)
    press('i')
    press('i')
    expect(note()).not.toContain('beyond the fretboard')
  })

  it('gives way to Notes cleared with Undo, and returns after Undo', () => {
    render(<App engine={createFakeEngine()} session={{ ...withNotes(90), instrument: 'guitar' }} />)
    expect(note()).toBe('1 note lit beyond the fretboard')
    press('Escape')
    expect(note()).toBe('Notes cleared. Undo')
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(note()).toBe('1 note lit beyond the fretboard')
  })

  it('lets the wake message win when audio is blocked', () => {
    const engine = createFakeEngine()
    render(<App engine={engine} session={{ ...withNotes(90), instrument: 'guitar' }} />)
    act(() => engine.setStatus('blocked'))
    expect(note()).toBe('Press any key to wake the sound.')
  })

  it('is not shown in Listen', () => {
    render(<App engine={createFakeEngine()} session={{ ...withNotes(90), instrument: 'guitar', mode: 'listen' }} />)
    expect(note()).not.toContain('beyond the fretboard')
  })
})

describe('notes left out for want of a string', () => {
  const rooted = () => [...document.querySelectorAll('.fretboard [data-root]')].map((n) => n.getAttribute('data-lit'))
  const guitarMarkers = () => [...document.querySelectorAll('.fretboard [data-lit]')].map((n) => n.getAttribute('data-lit'))

  it('restores remembered positions after a round trip through the piano', () => {
    render(<App engine={createFakeEngine()} />)
    press('i')
    click(cell(3, 5))
    click(cell(5, 0))
    expect(lit()).toEqual(['3:5', '5:0'])
    press('i')
    press('i')
    expect(lit()).toEqual(['3:5', '5:0'])
  })

  it('brings back the notes, positions and the left-out note with Esc then Undo', () => {
    render(<App engine={createFakeEngine()} session={withNotes(40, 41)} />)
    press('i')
    expect(guitarMarkers()).toEqual(['0:0'])
    press('Escape')
    expect(lit()).toEqual([])
    expect(note()).toContain('Notes cleared')
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(guitarMarkers()).toEqual(['0:0'])
    expect(note()).toBe('1 note left out: one note per string')
    press('i')
    expect(document.querySelectorAll('[data-lit]')).toHaveLength(2)
  })

  it('leaves readout, legend and a chosen root alone when the left-out note is the root', () => {
    const session: Session = { ...initialSession, workspace: { pitches: [40, 47, 44].map(pitch), positions: {}, root: pitch(44) } }
    render(<App engine={createFakeEngine()} session={session} />)
    const onPiano = { readout: readout(), legend: legend() }
    press('i')
    expect(note()).toBe('1 note left out: one note per string')
    expect(readout()).toBe(onPiano.readout)
    expect(legend()).toEqual(onPiano.legend)
    expect(rooted()).toEqual([])
    expect(guitarMarkers()).toHaveLength(2)
    press('i')
    expect(document.querySelectorAll('.piano [data-root]')).toHaveLength(1)
  })

  it('leaves readout and legend alone when the left-out note is a third, and draws no marker for it', () => {
    render(<App engine={createFakeEngine()} session={withNotes(40, 47, 44)} />)
    const onPiano = { readout: readout(), legend: legend() }
    expect(onPiano.readout).toContain('E major')
    press('i')
    expect(note()).toBe('1 note left out: one note per string')
    expect(readout()).toBe(onPiano.readout)
    expect(legend()).toEqual(onPiano.legend)
    expect(legend().some((l) => l.startsWith('3rd'))).toBe(true)
    expect(guitarMarkers()).toHaveLength(2)
    expect([...document.querySelectorAll('.fretboard [data-role="third"]')]).toHaveLength(0)
  })

  it('shows no left-out text and no notes in Listen', () => {
    render(<App engine={createFakeEngine()} session={withNotes(40, 41)} />)
    press('i')
    expect(note()).toContain('left out')
    fireEvent.click(radio('Listen'))
    expect(note()).not.toContain('left out')
    expect(lit()).toEqual([])
  })
})
