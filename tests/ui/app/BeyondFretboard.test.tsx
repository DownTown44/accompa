import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { pitch } from '../../../src/core/pitch'
import { App } from '../../../src/ui/app/App'
import { initialSession, type Session } from '../../../src/ui/session/session'
import { createFakeEngine } from '../support/fakeEngine'
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
    render(<App engine={createFakeEngine()} session={withNotes(40, 44, 47, 88)} />)
    press('i')
    expect(note()).toBe('1 note lit beyond the fretboard')
    expect(document.querySelector('.readout-interval span')!.textContent).toBe('E')
    expect(readout()).toContain('E major')
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
