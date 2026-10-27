import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine } from '../support/fakeEngine'
import { click, key, lit, rooted } from '../support/dom'
import { press } from '../support/keys'
import { pitch } from '../../../src/core/pitch'
import { orderedReadings } from '../../../src/core/explore'
import { STANDARD_GUITAR_TUNING } from '../../../src/core/instruments'
import { shapeFrets } from '../../../src/core/shapes'
import { generateVoicings, mean, rankVoicings, VOICING_RULES } from '../../../src/core/voicings'
import { initialSession, sessionReducer } from '../../../src/ui/session/session'
import { cell, legend, mutedStrings, openRings, readout, status } from '../support/explore'

const count = () => document.querySelector('.voicing-count')?.textContent
const next = () => screen.queryByRole('button', { name: 'Next voicing' }) as HTMLButtonElement | null
const previous = () => screen.queryByRole('button', { name: 'Previous voicing' }) as HTMLButtonElement | null
const live = () => document.querySelector('[data-testid="voicing-announce"]')!.textContent
const OPEN_C = [null, 3, 2, 0, 1, 0]

function editedSession() {
  const session = [60, 64, 67].reduce((st, p) => sessionReducer(st, { type: 'toggleNote', pitch: pitch(p) }), initialSession)
  return sessionReducer({ ...session, instrument: 'guitar' }, { type: 'selectVoicing', frets: OPEN_C })
}

function open(frets: (number | null)[] = OPEN_C) {
  let session = [60, 64, 67].reduce((st, p) => sessionReducer(st, { type: 'toggleNote', pitch: pitch(p) }), initialSession)
  session = sessionReducer({ ...session, instrument: 'guitar' }, { type: 'selectVoicing', frets })
  const engine = createFakeEngine()
  render(<App engine={engine} session={session} />)
  return engine
}

describe('Hand-edit a voicing', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('moves a string note, sounds it on press, and names the result', () => {
    const engine = open()
    expect(lit()).toEqual(['1:3', '2:2', '3:0', '4:1', '5:0'])
    click(cell(4, 3))
    expect(lit()).toEqual(['1:3', '2:2', '3:0', '4:3', '5:0'])
    expect(engine.plays.at(-1)).toEqual({ pitches: [62], mode: 'block' })
    expect(count()).toBe('Voicing edited')
    expect(readout()).toContain('C E G D')
    expect(status()).not.toContain('5th')
  })

  it('mutes the current note and sets a muted string or an open string', () => {
    open()
    click(cell(4, 1))
    expect(mutedStrings()).toEqual([0, 4])
    expect(readout()).toContain('C')
    click(cell(0, 3))
    expect(lit()).toEqual(['0:3', '1:3', '2:2', '3:0', '5:0'])
    click(cell(4, 0))
    expect(openRings()).toBe(3)
    click(cell(4, 0))
    expect(mutedStrings()).toContain(4)
    expect(count()).toBe('Voicing edited')
  })

  it('allows a span and an open string beyond the rules', () => {
    open()
    click(cell(1, 12))
    click(cell(5, 12))
    click(cell(4, 0))
    expect(lit()).toEqual(['1:12', '2:2', '3:0', '4:0', '5:12'])
    expect(count()).toBe('Voicing edited')
  })

  it('names a non-chord edit by note names', () => {
    open()
    click(cell(4, 3))
    expect(count()).toBe('Voicing edited')
    expect(readout()).toContain('C E G D')
    expect(rooted()).toEqual(['1:3'])
  })

  it('returns to the generated list on either arrow, first entry first', () => {
    open()
    click(cell(5, 5))
    expect(previous()).not.toBeNull()
    expect(next()).not.toBeNull()
    fireEvent.click(previous()!)
    expect(count()).toMatch(/^Voicing 1 of \d+$/)
    const edited = [48, 52, 55, 60, 69].map(pitch)
    const lead = orderedReadings(edited)[0]!
    const generated = generateVoicings({ root: lead.root, quality: lead.quality, bass: lead.bass }, STANDARD_GUITAR_TUNING, VOICING_RULES)
    const first = rankVoicings(generated, mean(edited), VOICING_RULES.bucketWidth, shapeFrets({ root: lead.root, quality: lead.quality }))[0]!
    expect(lit()).toEqual(first.frets.flatMap((f, s) => (f === null ? [] : [`${s}:${f}`])).sort())
    click(cell(5, 5))
    press('ArrowRight')
    expect(count()).toMatch(/^Voicing 1 of \d+$/)
  })

  it('edits again with a fret click after leaving an edit', () => {
    open()
    click(cell(5, 5))
    press('ArrowRight')
    expect(count()).toMatch(/^Voicing 1 of \d+$/)
    const [first] = lit() as string[]
    const [string, fret] = first!.split(':').map(Number) as [number, number]
    click(cell(string, fret === 0 ? 1 : fret - 1))
    expect(count()).toBe('Voicing edited')
  })

  it('announces the edit like a step', () => {
    open()
    click(cell(4, 3))
    expect(live()).toBe('')
    act(() => void vi.advanceTimersByTime(400))
    expect(live()).toBe('Voicing edited')
  })

  it('keeps the edit across a swap and drops it on a piano click, restoring with Undo after Esc', () => {
    open()
    click(cell(4, 3))
    press('i')
    press('i')
    expect(count()).toBe('Voicing edited')
    expect(lit()).toEqual(['1:3', '2:2', '3:0', '4:3', '5:0'])
    press('Escape')
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(count()).toBe('Voicing edited')
    press('i')
    click(key(72))
    press('i')
    expect(count()).not.toBe('Voicing edited')
  })

  it('shows no stepper arrows live when the edit has no generated voicing', () => {
    open()
    click(cell(4, 3))
    expect(previous()).toBeNull()
    expect(next()).toBeNull()
    expect(document.querySelectorAll('.voicing-end')).toHaveLength(2)
  })

  it('reads an interval for two notes, then a single note, then the empty state without an Undo entry', () => {
    open()
    click(cell(5, 0))
    click(cell(4, 1))
    click(cell(3, 0))
    expect(lit()).toEqual(['1:3', '2:2'])
    expect(count()).toBe('Voicing edited')
    expect(readout()).toContain('M3')
    click(cell(2, 2))
    expect(lit()).toEqual(['1:3'])
    expect(document.querySelector('.voicing-stepper')).toBeNull()
    click(cell(1, 3))
    expect(lit()).toEqual([])
    expect(document.querySelector('.explore-prompt')).not.toBeNull()
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull()
  })

  it('leaves the instrument and the Status note in place', () => {
    open()
    const before = document.querySelector('.fretboard')!.getBoundingClientRect().top
    click(cell(4, 3))
    expect(document.querySelector('.fretboard')!.getBoundingClientRect().top).toBe(before)
  })

  it('renders roles and the legend for an edit that is still the chord', () => {
    open()
    click(cell(5, 12))
    expect(lit()).toEqual(['1:3', '2:2', '3:0', '4:1', '5:12'])
    const role = (at: string) => document.querySelector(`[data-lit="${at}"]`)?.getAttribute('data-role')
    expect(['1:3', '2:2', '3:0', '4:1', '5:12'].map(role)).toEqual(['root', 'third', 'fifth', 'root', 'third'])
    expect(legend()).toEqual(['root C', '3rd E (M3)', '5th G (P5)'])
    expect(readout()).toContain('C major')
  })

  it('announces each of two consecutive edits', () => {
    open()
    click(cell(4, 3))
    act(() => void vi.advanceTimersByTime(400))
    expect(live()).toBe('Voicing edited')
    click(cell(4, 2))
    expect(live()).toBe('')
    act(() => void vi.advanceTimersByTime(400))
    expect(live()).toBe('Voicing edited')
  })

  it('leaves the edit on Left and on Right', () => {
    for (const arrow of ['ArrowLeft', 'ArrowRight']) {
      const { unmount } = render(<App engine={createFakeEngine()} session={editedSession()} />)
      click(cell(5, 5))
      expect(count()).toBe('Voicing edited')
      press(arrow)
      expect(count()).toMatch(/^Voicing 1 of \d+$/)
      unmount()
    }
  })

  it('sets a muted string and mutes it again on a second click of the same fret', () => {
    open()
    click(cell(4, 1))
    expect(mutedStrings()).toEqual([0, 4])
    click(cell(4, 1))
    expect(lit()).toContain('4:1')
    click(cell(4, 1))
    expect(mutedStrings()).toEqual([0, 4])
  })
})

describe('Hear the voicing', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('strums the shown voicing on Enter and plays it one at a time on Space', () => {
    const engine = open()
    engine.plays.length = 0
    press('Enter')
    press(' ')
    expect(engine.plays).toEqual([
      { pitches: [48, 52, 55, 60, 64], mode: 'strum' },
      { pitches: [48, 52, 55, 60, 64], mode: 'arpeggio' },
    ])
  })

  it('plays the voicing, not the lit pitches, and keeps a doubled pitch class', () => {
    const engine = open()
    click(cell(0, 0))
    engine.plays.length = 0
    press('Enter')
    expect(engine.plays).toEqual([{ pitches: [40, 48, 52, 55, 60, 64], mode: 'strum' }])
  })

  it('plays the edited pitches once edited', () => {
    const engine = open()
    click(cell(4, 3))
    engine.plays.length = 0
    press('Enter')
    expect(engine.plays).toEqual([{ pitches: [48, 52, 55, 62, 64], mode: 'strum' }])
  })

  it('leaves muted strings silent', () => {
    const engine = open()
    click(cell(1, 3))
    engine.plays.length = 0
    press('Enter')
    expect(engine.plays[0]!.pitches).toEqual([52, 55, 60, 64])
  })
})
