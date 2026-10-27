import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { initialSettings } from '../../src/core/model'
import { App } from '../../src/ui/app/App'
import { initialSession, sessionReducer } from '../../src/ui/session/session'
import { settingsReducer } from '../../src/ui/settings/settings'
import { createFakeEngine, type FakeEngine } from './support/fakeEngine'
import { click, lit, opener, radio } from './support/dom'
import { press } from './support/keys'
import { listenSession } from './support/sessions'
import { chip, chips } from './support/setupPanel'

let engine: FakeEngine

beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(0)
  engine = createFakeEngine()
  render(<App session={listenSession} engine={engine} />)
})

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

const openChords = () => {
  fireEvent.click(opener())
  fireEvent.click(radio('Chords'))
}

describe('settings', () => {
  it('starts as Intervals with all nine qualities, keeps the last, and stays in order', () => {
    expect(initialSettings.practice).toBe('intervals')
    expect(initialSettings.chordPool).toHaveLength(9)
    let state = settingsReducer(initialSettings, { type: 'setPractice', practice: 'chords' })
    for (const name of initialSettings.chordPool.slice(1)) state = settingsReducer(state, { type: 'toggleChordPool', quality: name })
    expect(state.chordPool).toEqual(['major'])
    expect(settingsReducer(state, { type: 'toggleChordPool', quality: 'major' })).toBe(state)
    expect(settingsReducer(state, { type: 'toggleChordPool', quality: 'minor' }).chordPool).toEqual(['major', 'minor'])
  })
})

describe('session reducer', () => {
  it('sets the chord question touching nothing else', () => {
    const question = { root: 40 as never, quality: 'major', pitches: [40, 44, 47] as never }
    const next = sessionReducer(initialSession, { type: 'setChordQuestion', question })
    expect(next.practice.chordQuestion).toBe(question)
    expect(next.workspace).toBe(initialSession.workspace)
    expect(next.practice.question).toBe(initialSession.practice.question)
  })
})

describe('chord Listen', () => {
  it('shows Which chord?, plays a block, replays identically, and ignores digits', () => {
    openChords()
    expect(screen.getByText('Which chord?')).toBeTruthy()
    expect(engine.plays).toHaveLength(1)
    expect(engine.plays[0]).toEqual({ pitches: [40, 44, 47], mode: 'block' })
    press(' ')
    press(' ')
    expect(engine.plays).toHaveLength(3)
    expect(engine.plays[2]).toEqual(engine.plays[0])
    press('3')
    expect(engine.plays).toHaveLength(3)
  })

  it('reveals silently on Reveal and plays a new chord on Next', () => {
    openChords()
    const reveal = screen.getByRole('button', { name: /Reveal/ })
    expect(reveal.getAttribute('aria-disabled')).toBeNull()
    fireEvent.click(reveal)
    expect(screen.queryByText('Which chord?')).toBeNull()
    expect(engine.plays).toHaveLength(1)
    expect(screen.getByRole('button', { name: /Next/ })).toBeTruthy()
    press('Enter')
    expect(screen.getByText('Which chord?')).toBeTruthy()
    expect(engine.plays).toHaveLength(2)
  })

  it('keeps the current chord when the pool changes and refuses the last chip', () => {
    openChords()
    expect(chips()).toHaveLength(9)
    fireEvent.click(chip('Maj'))
    press(' ')
    expect(engine.plays[1]!.pitches).toEqual([40, 44, 47])
    for (const c of chips().slice(2)) fireEvent.click(c)
    fireEvent.click(chip('Min'))
    expect(document.querySelector('.setup-note')?.textContent).toBe('Keep at least one chord quality.')
    expect(chip('Min').getAttribute('aria-pressed')).toBe('true')
  })

  it('disables Direction and Root in Chords and restores the interval question', () => {
    openChords()
    expect(radio('Ascending').disabled).toBe(true)
    expect(radio('Fixed').disabled).toBe(true)
    fireEvent.click(radio('Intervals'))
    expect(radio('Ascending').disabled).toBe(false)
    expect(screen.getByText('Which interval?')).toBeTruthy()
  })
})

describe('matrix rows', () => {
  it('keeps the chord and the workspace by reference through Explore and back', () => {
    const question = { root: 40 as never, quality: 'major', pitches: [40, 44, 47] as never }
    const asked = sessionReducer(listenSession, { type: 'setChordQuestion', question })
    const there = sessionReducer(asked, { type: 'setMode', mode: 'explore' })
    const back = sessionReducer(there, { type: 'setMode', mode: 'listen' })
    expect(back.practice.chordQuestion).toBe(question)
    expect(back.workspace).toBe(asked.workspace)
  })

  it('replays the same chord after Explore and back in the app', () => {
    openChords()
    fireEvent.click(chip('Min'))
    expect(document.querySelector('.listen')).not.toBeNull()
    press('m')
    expect(document.querySelector('.listen')).toBeNull()
    expect(screen.queryByText('Which chord?')).toBeNull()
    press('m')
    expect(document.querySelector('.listen')).not.toBeNull()
    expect(engine.plays).toHaveLength(2)
    expect(engine.plays[1]).toEqual({ pitches: [40, 44, 47], mode: 'block' })
    expect(screen.getByText('Which chord?')).toBeTruthy()
  })

  it('does not persist the chord pool or practice, while interval pool and theme restore', () => {
    fireEvent.click(opener())
    fireEvent.click(chip('M2'))
    fireEvent.click(radio('Dark'))
    fireEvent.click(radio('Chords'))
    fireEvent.click(chip('Maj'))
    fireEvent.click(chip('Dim7'))
    expect(chips()).toHaveLength(9)
    expect(chips().filter((c) => c.getAttribute('aria-pressed') === 'true')).toHaveLength(7)
    cleanup()
    const reloaded = createFakeEngine()
    render(<App session={listenSession} engine={reloaded} />)
    fireEvent.click(opener())
    expect(radio('Intervals').checked).toBe(true)
    expect(radio('Chords').checked).toBe(false)
    expect(radio('Dark').checked).toBe(true)
    expect(chips()).toHaveLength(12)
    expect(chip('M2').getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(radio('Chords'))
    expect(chips().map((c) => c.getAttribute('aria-pressed'))).toEqual(Array(9).fill('true'))
  })

  it('shows the nine chord chips for Chords and none of the interval chips', () => {
    fireEvent.click(opener())
    expect(chips().map((c) => c.textContent)).not.toContain('Maj')
    fireEvent.click(radio('Chords'))
    expect(chips().map((c) => c.textContent)).toEqual(['Maj', 'Min', 'Dim', 'Aug', 'Maj7', 'Dom7', 'Min7', 'm7♭5', 'Dim7'])
  })

  it('turns Reveal into Next on Enter and back on the next Enter', () => {
    openChords()
    press('Enter')
    expect(screen.getByRole('button', { name: /Next/ })).toBeTruthy()
    press('Enter')
    expect(screen.getByRole('button', { name: /Reveal/ })).toBeTruthy()
  })
})

describe('chord guards leave interval practice alone', () => {
  const pitchOf = (el: Element) => Number(el.getAttribute('data-pitch'))
  const keys = () => [...document.querySelectorAll('[data-pitch]')]

  it('does not carry a revealed interval into Chords; Enter reveals the chord, not the interval', () => {
    press(' ')
    press('Enter')
    expect(lit()).toEqual(['40', '41'])
    expect(document.querySelector('.readout-question')?.textContent).toBe('m2')
    fireEvent.click(opener())
    fireEvent.click(radio('Chords'))
    const plays = engine.plays.length
    press('3')
    expect(engine.plays).toHaveLength(plays)
    expect(lit()).toEqual([])
    press('Enter')
    expect(lit()).not.toEqual(['40', '41'])
    expect(lit().length).toBeGreaterThanOrEqual(3)
    fireEvent.click(radio('Intervals'))
    expect(engine.plays).toHaveLength(plays)
    expect(lit()).toEqual(['40', '41'])
    expect(document.querySelector('.readout-question')?.textContent).toBe('m2')
  })

  it('draws no guess marks and no reveal from digits in Chords', () => {
    press(' ')
    fireEvent.click(opener())
    fireEvent.click(radio('Chords'))
    press('2')
    press('1')
    press('Enter')
    fireEvent.click(radio('Intervals'))
    expect(screen.getByText('Which interval?')).toBeTruthy()
    expect(document.querySelector('.interval-button.wrong')).toBeNull()
    expect(lit()).toEqual([])
  })

  it('does not set a fixed root from a key click in Chords, and lights nothing for the old one', () => {
    fireEvent.click(opener())
    fireEvent.click(radio('Fixed'))
    const [first, second] = keys()
    click(first!)
    expect(engine.plays).toHaveLength(1)
    expect(lit()).toEqual([String(pitchOf(first!))])
    fireEvent.click(radio('Chords'))
    expect(engine.plays).toHaveLength(2)
    expect(lit()).toEqual([])
    click(second!)
    expect(engine.plays).toHaveLength(2)
    expect(lit()).toEqual([])
    fireEvent.click(radio('Intervals'))
    expect(engine.plays).toHaveLength(2)
    expect(lit()).toEqual([String(pitchOf(first!))])
  })
})

describe('setPractice draws and plays', () => {
  it('draws and plays an interval when none exists, and plays nothing when one does', () => {
    openChords()
    expect(engine.plays).toHaveLength(1)
    fireEvent.click(radio('Intervals'))
    expect(engine.plays).toHaveLength(2)
    expect(engine.plays[1]).toEqual({ pitches: [40, 41], mode: 'arpeggio' })
    expect(screen.getByText('Which interval?')).toBeTruthy()
    fireEvent.click(radio('Chords'))
    expect(engine.plays).toHaveLength(3)
    expect(engine.plays[2]).toEqual({ pitches: [40, 44, 47], mode: 'block' })
    fireEvent.click(radio('Intervals'))
    expect(engine.plays).toHaveLength(3)
  })

  it('draws and plays nothing in Explore, then a chord on the first Listen visit', () => {
    cleanup()
    const explore = createFakeEngine()
    render(<App session={initialSession} engine={explore} />)
    expect(document.querySelector('.listen')).toBeNull()
    fireEvent.click(opener())
    fireEvent.click(radio('Chords'))
    expect(explore.plays).toHaveLength(0)
    press('m')
    expect(screen.getByText('Which chord?')).toBeTruthy()
    expect(explore.plays).toHaveLength(1)
    expect(explore.plays[0]).toEqual({ pitches: [40, 44, 47], mode: 'block' })
  })
})
