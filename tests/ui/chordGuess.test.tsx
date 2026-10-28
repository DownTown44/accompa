import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CHORD_QUALITIES } from '../../src/core/theory'
import { qualityLabel } from '../../src/ui/shared/chordLabels'
import { App } from '../../src/ui/app/App'
import { initialSession, sessionReducer } from '../../src/ui/session/session'
import { createFakeEngine, type FakeEngine } from './support/fakeEngine'
import { opener, radio } from './support/dom'
import { press } from './support/keys'
import { listenSession } from './support/sessions'
import { chip } from './support/setupPanel'

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

const row = () => document.querySelector('.interval-row')!
const buttons = () => [...row().querySelectorAll<HTMLButtonElement>('button')]
const hint = () => document.querySelector('.guess-hint')!.textContent
const marked = () => [...row().querySelectorAll('.wrong .interval-label')].map((b) => b.textContent)
const named = (label: string) => buttons().find((b) => b.querySelector('.interval-label')!.textContent === label)!

// The chord is major [40,44,47]; with Maj unticked, Next draws minor [40,43,47].
function askMinor() {
  fireEvent.click(opener())
  fireEvent.click(radio('Chords'))
  fireEvent.click(chip('Maj'))
  fireEvent.click(named('Maj'))
  press('Enter')
  engine.plays.length = 0
  fireEvent.click(opener())
}

describe('chord guess', () => {
  it('shows nine labelled buttons keyed 1 to 9', () => {
    fireEvent.click(opener())
    fireEvent.click(radio('Chords'))
    expect(buttons().map((b) => b.querySelector('.interval-label')!.textContent)).toEqual([
      'Maj',
      'Min',
      'Dim',
      'Aug',
      'Maj7',
      'Dom7',
      'Min7',
      'm7♭5',
      'Dim7',
    ])
    expect(buttons().map((b) => b.querySelector('.key-hint')!.textContent)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9'])
  })

  it('reveals the chord on a correct guess, names the quality and plays nothing', () => {
    fireEvent.click(opener())
    fireEvent.click(radio('Chords'))
    fireEvent.click(chip('Maj'))
    engine.plays.length = 0
    fireEvent.click(named('Maj'))
    expect(hint()).toBe('Maj.')
    expect(document.querySelector('.readout-question')!.textContent).not.toBe('Which chord?')
    expect([...document.querySelectorAll('[data-lit]')].map((n) => n.getAttribute('data-role'))).toEqual(['root', 'third', 'fifth'])
    expect(document.querySelectorAll('.role-legend li')).toHaveLength(3)
    expect(buttons()).toHaveLength(9)
    for (const b of buttons()) expect(b.getAttribute('aria-disabled')).toBe('true')
    expect(screen.getByRole('button', { name: /Next/ })).toBeTruthy()
    expect(engine.plays).toHaveLength(0)
  })

  it('plays one new block on Next after a correct guess, with marks and hint cleared', () => {
    fireEvent.click(opener())
    fireEvent.click(radio('Chords'))
    fireEvent.click(chip('Maj'))
    fireEvent.click(opener())
    fireEvent.click(named('Dim7'))
    fireEvent.click(named('Maj'))
    engine.plays.length = 0
    press('Enter')
    expect(engine.plays).toEqual([{ pitches: [40, 43, 47], instrument: 'piano', mode: 'block' }])
    expect(hint()).toBe('')
    expect(marked()).toEqual([])
    expect(document.querySelectorAll('[data-lit]')).toHaveLength(0)
    expect(document.querySelector('.readout-question')!.textContent).toBe('Which chord?')
  })

  it('keeps the wrong marks shown after a correct reveal', () => {
    askMinor()
    fireEvent.click(named('Dim7'))
    fireEvent.click(named('Min'))
    expect(marked()).toEqual(['Dim7'])
    expect(hint()).toBe('Min.')
  })

  it('reveals as today after a wrong guess then Reveal, clearing the hint', () => {
    askMinor()
    fireEvent.click(named('Dim7'))
    press('Enter')
    expect(hint()).toBe('')
    expect(document.querySelectorAll('[data-lit]').length).toBeGreaterThan(0)
    expect(engine.plays).toHaveLength(0)
  })

  it('marks a wrong guess once, keeps the chord and still replays it', () => {
    askMinor()
    fireEvent.click(named('Dim7'))
    expect(hint()).toBe('Dim7 is not it — try another.')
    expect(engine.plays).toHaveLength(0)
    expect(marked()).toEqual(['Dim7'])
    expect(named('Dim7').getAttribute('aria-label')).toBe('Dim7, tried')
    expect(named('Dim7').getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(named('Dim7'))
    expect(marked()).toEqual(['Dim7'])
    press(' ')
    expect(engine.plays).toEqual([{ pitches: [40, 43, 47], instrument: 'piano', mode: 'block' }])
  })

  it('dims out-of-pool buttons, ignores them, and keeps the answer in play', () => {
    askMinor()
    const major = named('Maj')
    expect(major.hasAttribute('data-out-of-pool')).toBe(true)
    expect(major.getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(major)
    expect(marked()).toEqual([])
    expect(named('Min').hasAttribute('data-out-of-pool')).toBe(false)
    fireEvent.click(opener())
    fireEvent.click(chip('Min'))
    fireEvent.click(opener())
    expect(named('Min').hasAttribute('data-out-of-pool')).toBe(false)
    fireEvent.click(named('Min'))
    expect(hint()).toBe('Min.')
  })

  it('guesses with keys 1 to 9 and ignores 0, - and =', () => {
    askMinor()
    press('0')
    press('-')
    press('=')
    press('1')
    expect(marked()).toEqual([])
    expect(engine.plays).toHaveLength(0)
    press('9')
    expect(hint()).toBe('Dim7 is not it — try another.')
    press('2')
    expect(hint()).toBe('Min.')
    expect(marked()).toEqual(['Dim7'])
    expect(engine.plays).toHaveLength(0)
  })

  it('keeps interval keys working in Intervals', () => {
    press(' ')
    press('2')
    expect(hint()).toBe('M2 is not it — try another.')
  })
})

describe('chord guess, revealed and restricted pool', () => {
  it('disables all nine buttons and guesses nothing when revealed', () => {
    cleanup()
    const question = { root: 40 as never, quality: 'minor', pitches: [40, 43, 47] as never }
    const seeded = { ...listenSession, practice: { ...listenSession.practice, chordQuestion: question, chordRevealed: true } }
    const revealedEngine = createFakeEngine()
    render(<App session={seeded} engine={revealedEngine} />)
    fireEvent.click(opener())
    fireEvent.click(radio('Chords'))
    fireEvent.click(opener())
    revealedEngine.plays.length = 0
    expect(buttons()).toHaveLength(9)
    for (const b of buttons()) {
      expect(b.getAttribute('aria-disabled')).toBe('true')
      fireEvent.click(b)
    }
    for (const key of '123456789') press(key)
    expect(marked()).toEqual([])
    expect(hint()).toBe('')
    expect(revealedEngine.plays).toHaveLength(0)
  })

  it('shows seven buttons out of the pool, disabled and inert, with a pool of major and minor', () => {
    fireEvent.click(opener())
    fireEvent.click(radio('Chords'))
    for (const name of ['Aug', 'Dim', 'Maj7', 'Dom7', 'Min7', 'm7♭5', 'Dim7']) fireEvent.click(chip(name))
    fireEvent.click(opener())
    engine.plays.length = 0
    const out = buttons().filter((b) => b.hasAttribute('data-out-of-pool'))
    expect(buttons()).toHaveLength(9)
    expect(out).toHaveLength(7)
    for (const b of out) {
      expect(b.getAttribute('aria-disabled')).toBe('true')
      fireEvent.click(b)
    }
    for (const key of '3456789') press(key)
    expect(marked()).toEqual([])
    expect(engine.plays).toHaveLength(0)
  })
})

describe('chord guess outside Listen', () => {
  it('ignores keys 1 to 9 in Explore and leaves the chord and marks alone', () => {
    fireEvent.click(opener())
    fireEvent.click(radio('Chords'))
    fireEvent.click(opener())
    press('m')
    const plays = engine.plays.length
    for (const key of '123456789') press(key)
    expect(engine.plays).toHaveLength(plays)
    press('m')
    expect(marked()).toEqual([])
    expect(hint()).toBe('')
    expect(engine.plays.at(-1)).toEqual({ pitches: [40, 44, 47], instrument: 'piano', mode: 'block' })
  })

  it('has one short label per quality, the same on chips and buttons', () => {
    expect(CHORD_QUALITIES.map((q) => qualityLabel(q.name))).toEqual(['Maj', 'Min', 'Dim', 'Aug', 'Maj7', 'Dom7', 'Min7', 'm7♭5', 'Dim7'])
    fireEvent.click(opener())
    fireEvent.click(radio('Chords'))
    const chipLabels = [...document.querySelectorAll('.setup-chip')].map((c) => c.textContent)
    expect(chipLabels).toEqual(buttons().map((b) => b.querySelector('.interval-label')!.textContent))
  })
})

describe('chord guess reducer', () => {
  const question = { root: 40 as never, quality: 'minor', pitches: [40, 43, 47] as never }
  const asked = sessionReducer(listenSession, { type: 'setChordQuestion', question })

  it('marks a wrong guess touching only the chord marks and feedback', () => {
    const state = sessionReducer(asked, { type: 'guessChord', quality: 'major', pool: ['major', 'minor'] })
    expect(state.practice.chordWrongMarks).toEqual(['major'])
    expect(state.feedback).toEqual({ kind: 'chordWrong', quality: 'major' })
    expect(state.practice.chordQuestion).toBe(question)
    expect(state.workspace).toBe(asked.workspace)
    expect(state.practice.question).toBe(asked.practice.question)
    expect(state.practice.wrongMarks).toBe(asked.practice.wrongMarks)
  })

  it('ignores repeats, the answer, out-of-pool and revealed', () => {
    const once = sessionReducer(asked, { type: 'guessChord', quality: 'major', pool: ['major'] })
    expect(sessionReducer(once, { type: 'guessChord', quality: 'major', pool: ['major'] })).toBe(once)
    expect(sessionReducer(asked, { type: 'guessChord', quality: 'minor', pool: ['minor'] })).toBe(asked)
    expect(sessionReducer(asked, { type: 'guessChord', quality: 'dim7', pool: ['major'] })).toBe(asked)
    const revealed = { ...asked, practice: { ...asked.practice, chordRevealed: true } }
    expect(sessionReducer(revealed, { type: 'guessChord', quality: 'major', pool: ['major'] })).toBe(revealed)
  })

  it('reveals the chord, keeps the question and marks and names the quality', () => {
    const wrong = sessionReducer(asked, { type: 'guessChord', quality: 'major', pool: ['major'] })
    const state = sessionReducer(wrong, { type: 'chordRight' })
    expect(state.practice.chordQuestion).toBe(question)
    expect(state.practice.chordRevealed).toBe(true)
    expect(state.practice.chordWrongMarks).toBe(wrong.practice.chordWrongMarks)
    expect(state.feedback).toEqual({ kind: 'chordRight', quality: 'minor' })
    expect(sessionReducer(state, { type: 'chordRight' })).toBe(state)
    expect(state.workspace).toBe(asked.workspace)
    expect(state.practice.question).toBe(asked.practice.question)
    expect(initialSession.practice.chordWrongMarks).toBeUndefined()
  })

  it('keeps the marks and the chord through Explore and back', () => {
    const wrong = sessionReducer(asked, { type: 'guessChord', quality: 'major', pool: ['major'] })
    const back = sessionReducer(sessionReducer(wrong, { type: 'setMode', mode: 'explore' }), { type: 'setMode', mode: 'listen' })
    expect(back.practice.chordQuestion).toBe(question)
    expect(back.practice.chordWrongMarks).toBe(wrong.practice.chordWrongMarks)
    expect(back.workspace).toBe(asked.workspace)
  })
})
