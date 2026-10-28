import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ChordQuestion } from '../../src/core/model'
import { exploreReading } from '../../src/core/explore'
import { STANDARD_GUITAR_TUNING } from '../../src/core/instruments'
import type { Pitch } from '../../src/core/pitch'
import { shapeFrets } from '../../src/core/shapes'
import { CHORD_QUALITIES } from '../../src/core/theory'
import { generateVoicings, mean, rankVoicings, VOICING_RULES } from '../../src/core/voicings'
import { App } from '../../src/ui/app/App'
import { initialSession, sessionReducer, type Session } from '../../src/ui/session/session'
import { createFakeEngine, type FakeEngine } from './support/fakeEngine'
import { lit, opener, radio, rooted } from './support/dom'
import { press } from './support/keys'
import { listenSession } from './support/sessions'

let engine: FakeEngine

const cMajor: ChordQuestion = { root: 60 as Pitch, quality: 'major', pitches: [60, 64, 67] as Pitch[] }
const asked = (question: ChordQuestion): Session => ({ ...listenSession, practice: { ...listenSession.practice, chordQuestion: question } })

function openChords(session: Session = asked(cMajor)) {
  cleanup()
  engine = createFakeEngine()
  render(<App session={session} engine={engine} />)
  fireEvent.click(opener())
  fireEvent.click(radio('Chords'))
  fireEvent.click(opener())
  engine.plays.length = 0
}

beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(0)
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.restoreAllMocks()
})

const roles = () => [...document.querySelectorAll('[data-lit]')].map((n) => n.getAttribute('data-role'))
const legend = () => [...document.querySelectorAll('.role-legend li')].map((li) => li.getAttribute('data-role'))
const readout = () => document.querySelector('.readout-question')!.textContent

function rankedFor(question: ChordQuestion) {
  const quality = CHORD_QUALITIES.find((q) => q.name === question.quality)!
  const rootPc = (question.root % 12) as never
  return rankVoicings(generateVoicings({ root: rootPc, quality, bass: rootPc }, STANDARD_GUITAR_TUNING, VOICING_RULES), mean(question.pitches), VOICING_RULES.bucketWidth, shapeFrets({ root: rootPc, quality }))
}

describe('chord reveal reducer', () => {
  const state = asked(cMajor)

  it('reveals touching practice and feedback only', () => {
    const base = { ...state, workspace: { pitches: [50] as Pitch[], positions: {} } }
    const next = sessionReducer(base, { type: 'revealChord' })
    expect(next.practice.chordRevealed).toBe(true)
    expect(next.practice.revealed).toBe(false)
    expect(next.workspace).toBe(base.workspace)
    expect(next.practice.question).toBe(base.practice.question)
    expect(sessionReducer(next, { type: 'revealChord' })).toBe(next)
    expect(sessionReducer(initialSession, { type: 'revealChord' })).toBe(initialSession)
  })

  it('a new chord resets the reveal and the marks, leaving workspace and question by reference', () => {
    const revealed = sessionReducer(state, { type: 'revealChord' })
    const next = sessionReducer(revealed, { type: 'setChordQuestion', question: cMajor })
    expect(next.practice.chordRevealed).toBe(false)
    expect(next.practice.chordWrongMarks).toEqual([])
    expect(next.workspace).toBe(state.workspace)
    expect(next.practice.question).toBe(state.practice.question)
  })

  it('a right guess reveals touching practice and feedback only', () => {
    const base = { ...state, workspace: { pitches: [50] as Pitch[], positions: {} } }
    const next = sessionReducer(base, { type: 'chordRight' })
    expect(next.practice.chordRevealed).toBe(true)
    expect(next.practice.chordQuestion).toBe(cMajor)
    expect(next.workspace).toBe(base.workspace)
    expect(next.practice.question).toBe(base.practice.question)
    expect(next.practice.revealed).toBe(false)
  })

  it('an interval reveal never reveals the chord, and the reverse', () => {
    const interval = { direction: 'harmonic' as const, root: 40 as Pitch, interval: 1 as never, pitches: [40, 41] as Pitch[] }
    const both = sessionReducer({ ...state, practice: { ...state.practice, question: interval } }, { type: 'reveal' })
    expect(both.practice.chordRevealed).toBeUndefined()
    expect(sessionReducer(state, { type: 'revealChord' }).practice.revealed).toBe(false)
  })

  it('shifts the piano window for a high revealed chord, but not for a hidden one', () => {
    const high: ChordQuestion = { root: 77 as Pitch, quality: 'dim7', pitches: [77, 80, 83, 86] as Pitch[] }
    const revealed = sessionReducer(asked(high), { type: 'revealChord' })
    expect(revealed.pianoStart).not.toBe(initialSession.pianoStart)
    const hiddenState = { ...asked(high), practice: { ...asked(high).practice, chordRevealed: true } }
    expect(sessionReducer(hiddenState, { type: 'setInstrument', instrument: 'piano' }).pianoStart).toBe(initialSession.pianoStart)
  })
})

describe('chord reveal in the app', () => {
  it('lights the exact keys with roles, names the chord and shows the legend', () => {
    openChords()
    expect(lit()).toEqual([])
    press('Enter')
    expect(lit()).toEqual(['60', '64', '67'])
    expect(rooted()).toEqual(['60'])
    expect(roles()).toEqual(['root', 'third', 'fifth'])
    expect(legend()).toEqual(['root', 'third', 'fifth'])
    expect(readout()).toContain(exploreReading(cMajor.pitches, undefined, cMajor.root).readout!.label)
    expect(screen.getByRole('button', { name: /Next/ })).toBeTruthy()
    expect(engine.plays).toHaveLength(0)
  })

  it('disables all nine answer buttons once revealed', () => {
    openChords()
    press('Enter')
    const buttons = [...document.querySelectorAll('.interval-row button')]
    expect(buttons).toHaveLength(9)
    for (const b of buttons) expect(b.getAttribute('aria-disabled')).toBe('true')
    press('2')
    expect(document.querySelector('.interval-button.wrong')).toBeNull()
  })

  it('Next draws and plays a new chord, unlit, button Reveal', () => {
    openChords()
    press('Enter')
    press('Enter')
    expect(lit()).toEqual([])
    expect(screen.getByRole('button', { name: /Reveal/ })).toBeTruthy()
    expect(engine.plays).toHaveLength(1)
    expect(engine.plays[0]!.mode).toBe('block')
    expect(legend()).toEqual([])
  })

  it('clears wrong marks on Next', () => {
    openChords()
    press('2')
    expect(document.querySelector('.interval-button.wrong')).not.toBeNull()
    press('Enter')
    press('Enter')
    expect(document.querySelector('.interval-button.wrong')).toBeNull()
  })

  it('after a right guess by key, the chord is revealed silently and Enter draws another', () => {
    openChords()
    press('1')
    expect(engine.plays).toHaveLength(0)
    expect(lit()).toEqual(['60', '64', '67'])
    expect(screen.getByRole('button', { name: /Next/ })).toBeTruthy()
    press('Enter')
    expect(engine.plays).toHaveLength(1)
    expect(lit()).toEqual([])
  })

  it('after a right guess by click, the Next button draws another chord', () => {
    openChords()
    fireEvent.click(document.querySelector('.interval-row button')!)
    expect(engine.plays).toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: /Next/ }))
    expect(engine.plays).toHaveLength(1)
    expect(engine.plays[0]!.mode).toBe('block')
  })

  it('the high dim7 on the guitar is a 3-note shape at or below fret 12 (accepted deviation)', () => {
    openChords(asked({ root: 77 as Pitch, quality: 'dim7', pitches: [77, 80, 83, 86] as Pitch[] }))
    press('i')
    press('Enter')
    expect(lit()).toEqual(['3:10', '4:9', '5:10'])
    expect(document.querySelectorAll('[data-muted]')).toHaveLength(3)
  })

  it('Space after a reveal replays the plain block of the question pitches', () => {
    openChords()
    press('Enter')
    press(' ')
    expect(engine.plays.at(-1)).toMatchObject({ pitches: cMajor.pitches, instrument: 'piano', mode: 'block' })
    press('i')
    press(' ')
    expect(engine.plays.at(-1)).toMatchObject({ pitches: cMajor.pitches, instrument: 'guitar', mode: 'block' })
  })

  it('shows the high dim7 on the piano by shifting the window', () => {
    openChords(asked({ root: 77 as Pitch, quality: 'dim7', pitches: [77, 80, 83, 86] as Pitch[] }))
    press('Enter')
    expect(lit()).toEqual(['77', '80', '83', '86'])
  })

  it('lights the first ranked voicing on the guitar with muted strings and no stepper', () => {
    openChords()
    press('i')
    press('Enter')
    const expected = rankedFor(cMajor)[0]!
    const litFrets = expected.frets.flatMap((fret, string) => (fret === null ? [] : [`${string}:${fret}`]))
    expect(lit()).toEqual([...litFrets].sort())
    expect(roles()).toContain('root')
    expect(document.querySelectorAll('[data-muted]').length).toBe(expected.frets.filter((f) => f === null).length)
    expect(legend()).toEqual(['root', 'third', 'fifth'])
  })

  it('keeps the chord revealed and named across an instrument swap and an Explore round trip', () => {
    openChords()
    press('Enter')
    const name = readout()
    press('i')
    expect(lit().length).toBeGreaterThanOrEqual(3)
    expect(readout()).toBe(name)
    press('m')
    press('m')
    expect(screen.getByRole('button', { name: /Next/ })).toBeTruthy()
    expect(readout()).toBe(name)
    press('i')
    expect(lit()).toEqual(['60', '64', '67'])
  })

  it('leaves interval Listen unchanged: a reveal there lights the interval, not a chord', () => {
    cleanup()
    engine = createFakeEngine()
    render(<App session={listenSession} engine={engine} />)
    press(' ')
    press('Enter')
    expect(lit()).toHaveLength(2)
    expect(legend()).toEqual([])
  })
})

describe('chord voicing sweep', () => {
  it('has a playable voicing for every quality on every root', () => {
    for (const quality of CHORD_QUALITIES) {
      for (let pc = 0; pc < 12; pc++) {
        const list = generateVoicings({ root: pc as never, quality, bass: pc as never }, STANDARD_GUITAR_TUNING, VOICING_RULES)
        expect(list.length, `${quality.name} ${pc}`).toBeGreaterThan(0)
      }
    }
  })
})

const high: ChordQuestion = { root: 77 as Pitch, quality: 'dim7', pitches: [77, 80, 83, 86] as Pitch[] }
const note = () => document.querySelector('.status-note')!.textContent

describe('piano window follows a revealed chord (the chords flag)', () => {
  const HIGH_LIT = ['77', '80', '83', '86']

  it('fits through the instrument key', () => {
    openChords(asked(high))
    press('i')
    press('Enter')
    press('i')
    expect(lit()).toEqual(HIGH_LIT)
  })

  it('fits through the instrument radio', () => {
    openChords(asked(high))
    press('i')
    press('Enter')
    fireEvent.click(screen.getByRole('radio', { name: 'Piano', hidden: true }))
    expect(lit()).toEqual(HIGH_LIT)
  })

  it('fits through an Explore round trip', () => {
    openChords(asked(high))
    press('i')
    press('Enter')
    press('m')
    press('i')
    press('m')
    expect(lit()).toEqual(HIGH_LIT)
  })

  it('the reducer fits with chords: true on setMode, setInstrument and toggleInstrument', () => {
    const base: Session = { ...asked(high), practice: { ...asked(high).practice, chordRevealed: true } }
    const guitar = { ...base, instrument: 'guitar' as const }
    const explore = { ...base, mode: 'explore' as const }
    expect(sessionReducer(guitar, { type: 'setInstrument', instrument: 'piano', chords: true }).pianoStart).not.toBe(base.pianoStart)
    expect(sessionReducer(guitar, { type: 'toggleInstrument', chords: true }).pianoStart).not.toBe(base.pianoStart)
    expect(sessionReducer(explore, { type: 'setMode', mode: 'listen', chords: true }).pianoStart).not.toBe(base.pianoStart)
    expect(sessionReducer(guitar, { type: 'setInstrument', instrument: 'piano' }).pianoStart).toBe(base.pianoStart)
    expect(sessionReducer(guitar, { type: 'toggleInstrument' }).pianoStart).toBe(base.pianoStart)
    expect(sessionReducer(explore, { type: 'setMode', mode: 'listen' }).pianoStart).toBe(base.pianoStart)
  })
})

describe('chord reveal status note', () => {
  it('is empty for a normal guitar voicing', () => {
    openChords()
    press('i')
    press('Enter')
    expect(note()).toBe('')
  })

  it('says no voicing fits when the guitar cannot place the chord', () => {
    openChords(asked({ root: 60 as Pitch, quality: 'major', pitches: [60, 61, 62] as Pitch[] }))
    press('i')
    press('Enter')
    expect(lit()).toEqual([])
    expect(note()).toBe('No voicing fits these notes.')
  })
})

describe('chord reveal names', () => {
  const golden = ['C', 'Cm', 'Cdim', 'Caug', 'Cmaj7', 'C7', 'Cm7', 'Cm7♭5', 'Cdim7']

  it('shows the fixed symbol for each quality rooted on C', () => {
    const symbols = CHORD_QUALITIES.map((q) => {
      openChords(asked({ root: 60 as Pitch, quality: q.name, pitches: q.intervals.map((i) => (60 + i) as Pitch) }))
      press('Enter')
      return document.querySelector('.readout-question [aria-hidden]')!.textContent
    })
    expect(symbols).toEqual(golden)
  })
})

describe('Reveal and Next draw a different chord', () => {
  it('by button click, with a random that changes the chord', () => {
    openChords()
    fireEvent.click(screen.getByRole('button', { name: /Reveal/ }))
    expect(lit()).toEqual(['60', '64', '67'])
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    fireEvent.click(screen.getByRole('button', { name: /Next/ }))
    expect(engine.plays).toHaveLength(1)
    expect(engine.plays[0]!.pitches).not.toEqual(cMajor.pitches)
    expect(lit()).toEqual([])
    fireEvent.click(screen.getByRole('button', { name: /Reveal/ }))
    expect(lit()).toEqual(engine.plays[0]!.pitches.map(String).sort())
  })

  it('by Enter, with a random that changes the chord', () => {
    openChords()
    press('Enter')
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    press('Enter')
    expect(engine.plays[0]!.pitches).not.toEqual(cMajor.pitches)
    expect(engine.plays[0]!.pitches).toHaveLength(4)
  })
})
