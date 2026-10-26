import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine } from '../support/fakeEngine'
import { click, key } from '../support/dom'
import { press } from '../support/keys'
import { pitch, pitchClass } from '../../../src/core/pitch'
import { CHORD_QUALITIES } from '../../../src/core/theory'
import { generateVoicings, mean, rankVoicings, VOICING_RULES } from '../../../src/core/voicings'
import { initialSession, sessionReducer } from '../../../src/ui/session/session'
import { STANDARD_GUITAR_TUNING } from '../../../src/core/instruments'
import { alts, mutedStrings, status } from '../support/explore'

const stepper = () => document.querySelector('.voicing-stepper')
const count = () => document.querySelector('.voicing-count')?.textContent
const next = () => screen.queryByRole('button', { name: 'Next voicing' }) as HTMLButtonElement | null
const previous = () => screen.queryByRole('button', { name: 'Previous voicing' }) as HTMLButtonElement | null
const fretboard = () => document.querySelector<HTMLElement>('.fretboard')!
const live = () => document.querySelector('[data-testid="voicing-announce"]')!.textContent
const shownFrets = () =>
  [...document.querySelectorAll('.fretboard [data-lit]')].map((n) => n.getAttribute('data-lit')).sort().join()

function open(pitches = [60, 64, 67]) {
  render(<App engine={createFakeEngine()} />)
  pitches.forEach((p) => click(key(p)))
  press('i')
}
const ranked = () => {
  const quality = CHORD_QUALITIES.find((q) => q.name === 'major')!
  const list = generateVoicings({ root: pitchClass(pitch(60)), quality, bass: pitchClass(pitch(60)) } as never, STANDARD_GUITAR_TUNING, VOICING_RULES)
  return rankVoicings(list, mean([pitch(60), pitch(64), pitch(67)]), VOICING_RULES.bucketWidth)
}
const expectedLit = (i: number) =>
  ranked()[i]!.frets.flatMap((fret, string) => (fret === null ? [] : [`${string}:${fret}`])).sort().join()
const total = () => Number(count()!.match(/of (\d+)/)![1])

describe('Voicing stepper', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('opens on voicing 1 with an inert start arrow', () => {
    open()
    expect(count()).toMatch(/^Voicing 1 of \d+$/)
    expect(total()).toBeGreaterThanOrEqual(2)
    expect(previous()).toBeNull()
    expect(next()).not.toBeNull()
    const inert = document.querySelector('.voicing-end')!
    expect(inert.getAttribute('aria-disabled')).toBe('true')
    expect(inert.textContent).toBe('·')
  })

  it('steps with Right and Left from the instrument, announces after 400 ms, and does not wrap', () => {
    open()
    fretboard().focus()
    press('ArrowLeft', fretboard())
    expect(count()).toMatch(/^Voicing 1 of/)
    press('ArrowRight', fretboard())
    expect(count()).toMatch(/^Voicing 2 of/)
    expect(shownFrets()).toBe(expectedLit(1))
    expect(live()).toBe('')
    act(() => void vi.advanceTimersByTime(400))
    expect(live()).toBe(`Voicing 2 of ${total()}`)
    press('ArrowLeft', fretboard())
    expect(count()).toMatch(/^Voicing 1 of/)
    expect(shownFrets()).toBe(expectedLit(0))
  })

  it('steps with the arrow buttons and moves focus when the end arrow goes inert', () => {
    open()
    const n = total()
    for (let i = 1; i < n; i++) {
      next()!.focus()
      fireEvent.click(next()!)
    }
    expect(count()).toBe(`Voicing ${n} of ${n}`)
    expect(next()).toBeNull()
    expect(document.activeElement).toBe(previous())
  })

  it('moves focus to Next when Previous goes inert, and to the instrument when the stepper hides', () => {
    open()
    fireEvent.click(next()!)
    previous()!.focus()
    fireEvent.click(previous()!)
    expect(count()).toMatch(/^Voicing 1 of/)
    expect(document.activeElement).toBe(next())
    next()!.focus()
    press('i', next()!)
    expect(stepper()).toBeNull()
    expect(document.activeElement).toBe(document.querySelector('.piano'))
  })

  it('goes quiet on Left/Right when another control has focus, on the piano, and in Listen', () => {
    open()
    const playButton = screen.getAllByRole('button').find((b) => b.textContent?.includes('Play'))!
    playButton.focus()
    press('ArrowRight', playButton)
    expect(count()).toMatch(/^Voicing 1 of/)
    press({ key: 'ArrowRight', ctrlKey: true })
    expect(count()).toMatch(/^Voicing 1 of/)
    press('ArrowRight')
    expect(count()).toMatch(/^Voicing 2 of/)
    press('i')
    expect(stepper()).toBeNull()
    press('ArrowRight', document.querySelector('.piano')!)
    press('ArrowRight')
    press('m')
    press('ArrowRight')
    press('m')
    press('i')
    expect(count()).toMatch(/^Voicing 2 of/)
  })

  it('keeps the selection across a swap and reopens on 1 when a note changes, announcing nothing for either', () => {
    open()
    press('ArrowRight')
    press('ArrowRight')
    act(() => void vi.advanceTimersByTime(400))
    expect(live()).toMatch(/^Voicing 3 of/)
    press('i')
    press('i')
    expect(count()).toMatch(/^Voicing 3 of/)
    act(() => void vi.advanceTimersByTime(400))
    expect(live()).toBe('')
    press('i')
    click(key(71))
    press('i')
    expect(count()).toMatch(/^Voicing 1 of/)
    act(() => void vi.advanceTimersByTime(400))
    expect(live()).toBe('')
  })

  it('clears the announcement on a new chord, so the same text is announced again, and not after Undo', () => {
    open()
    press('ArrowRight')
    act(() => void vi.advanceTimersByTime(400))
    const text = live()
    expect(text).toMatch(/^Voicing 2 of/)
    press('i')
    click(key(71))
    click(key(71))
    press('i')
    expect(live()).toBe('')
    press('ArrowRight')
    act(() => void vi.advanceTimersByTime(400))
    expect(live()).toBe(text)
    press('Escape')
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    act(() => void vi.advanceTimersByTime(400))
    expect(live()).toBe('')
  })

  it('shows the best voicing for a stale stored selection and does not throw', () => {
    let session = [60, 64, 67].reduce((st, p) => sessionReducer(st, { type: 'toggleNote', pitch: pitch(p) }), initialSession)
    session = sessionReducer({ ...session, instrument: 'guitar' }, { type: 'selectVoicing', frets: [9, 9, 9, 9, 9, 9] })
    render(<App engine={createFakeEngine()} session={session} />)
    expect(count()).toMatch(/^Voicing 1 of/)
    expect(shownFrets()).toBe(expectedLit(0))
    press('ArrowRight')
    expect(count()).toMatch(/^Voicing 2 of/)
  })

  it('restores the step after Esc and Undo', () => {
    open()
    press('ArrowRight')
    press('ArrowRight')
    press('Escape')
    expect(stepper()).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(count()).toMatch(/^Voicing 3 of/)
  })

  it('shows no stepper for one note or two notes', () => {
    open([60, 64])
    expect(stepper()).toBeNull()
    expect(mutedStrings()).toEqual([])
    expect(status()).not.toContain('Voicing')
  })
})
