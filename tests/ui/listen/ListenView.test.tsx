import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { COMMON_RANGE } from '../../../src/core/instruments'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine, type FakeEngine } from '../support/fakeEngine'
import { listenSession } from '../support/sessions'
import { radio } from '../support/dom'
import { press } from '../support/keys'

let engine: FakeEngine

beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
  engine = createFakeEngine()
  render(<App session={listenSession} engine={engine} />)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Listen on open', () => {
  it('asks which interval and waits, with no sound and no status note', () => {
    expect(screen.getByText('Which interval?')).toBeTruthy()
    expect(engine.plays).toHaveLength(0)
    expect(document.querySelector('.status-note')?.textContent).toBe('')
  })

  it('offers Play again with a Space key hint', () => {
    const button = screen.getByRole('button', { name: /Play again/ })
    expect(button.textContent).toContain('Space')
  })
})

describe('Space and Play again', () => {
  it('plays a new ascending interval as an arpeggio when no question exists', () => {
    const event = press({ key: ' ' })
    expect(engine.plays).toHaveLength(1)
    const [{ pitches, mode }] = engine.plays
    expect(mode).toBe('arpeggio')
    expect(pitches).toHaveLength(2)
    expect(pitches[1]).toBeGreaterThan(pitches[0])
    expect(event.defaultPrevented).toBe(true)
  })

  it('replays the same pitches each time', () => {
    press({ key: ' ' })
    press({ key: ' ' })
    fireEvent.click(screen.getByRole('button', { name: /Play again/ }))
    expect(engine.plays).toHaveLength(3)
    expect(engine.plays[1].pitches).toEqual(engine.plays[0].pitches)
    expect(engine.plays[2].pitches).toEqual(engine.plays[0].pitches)
  })

  it('plays when Play again is clicked first', () => {
    fireEvent.click(screen.getByRole('button', { name: /Play again/ }))
    expect(engine.plays).toHaveLength(1)
  })

  it('ignores auto-repeat', () => {
    press({ key: ' ', repeat: true })
    expect(engine.plays).toHaveLength(0)
  })

  it.each(['ctrlKey', 'altKey', 'metaKey'])('ignores Space with %s held', (modifier) => {
    press({ key: ' ', [modifier]: true })
    expect(engine.plays).toHaveLength(0)
  })

  it('yields to a focused button, radio or text field', () => {
    press({ key: ' ' }, screen.getByRole('button', { name: /Play again/ }))
    press({ key: ' ' }, radio('Piano'))
    const field = document.createElement('input')
    field.type = 'text'
    document.body.append(field)
    press({ key: ' ' }, field)
    field.remove()
    expect(engine.plays).toHaveLength(0)
  })
})

describe('question generation', () => {
  it.each([0, 0.999999])('keeps both notes inside the range both instruments share at random %s', (value) => {
    vi.spyOn(Math, 'random').mockReturnValue(value)
    press({ key: ' ' })
    for (const p of engine.plays[0].pitches) {
      expect(p).toBeGreaterThanOrEqual(COMMON_RANGE.low)
      expect(p).toBeLessThanOrEqual(COMMON_RANGE.high)
    }
  })

  it('draws a new question only when none exists, even if the random source changes', () => {
    const random = vi.spyOn(Math, 'random')
    random.mockReturnValue(0.1)
    press({ key: ' ' })
    random.mockReturnValue(0.9)
    press({ key: ' ' })
    press({ key: 'i' })
    press({ key: ' ' })
    expect(engine.plays).toHaveLength(3)
    expect(engine.plays[1].pitches).toEqual(engine.plays[0].pitches)
    expect(engine.plays[2].pitches).toEqual(engine.plays[0].pitches)
  })
})

describe('entering Listen', () => {
  it('plays at once with M when no question exists yet', () => {
    press({ key: 'm' })
    expect(radio('Explore').checked).toBe(true)
    expect(engine.plays).toHaveLength(0)
    press({ key: 'm' })
    expect(radio('Listen').checked).toBe(true)
    expect(engine.plays).toHaveLength(1)
  })

  it('plays at once when the Listen tab is clicked with no question', () => {
    fireEvent.click(radio('Explore'))
    fireEvent.click(radio('Listen'))
    expect(engine.plays).toHaveLength(1)
  })

  it('keeps the question and does not replay when returning to Listen', () => {
    press({ key: ' ' })
    press({ key: 'm' })
    press({ key: 'm' })
    expect(engine.plays).toHaveLength(1)
    press({ key: ' ' })
    expect(engine.plays[1].pitches).toEqual(engine.plays[0].pitches)
  })

  it('keeps the question when the instrument changes', () => {
    press({ key: ' ' })
    press({ key: 'i' })
    press({ key: ' ' })
    expect(radio('Guitar').checked).toBe(true)
    expect(engine.plays[1].pitches).toEqual(engine.plays[0].pitches)
  })

  it('stops the sound when leaving Listen', () => {
    press({ key: ' ' })
    press({ key: 'm' })
    expect(engine.stops).toBe(1)
  })

  it('does not play from Space in Explore, and hides the Listen view', () => {
    press({ key: 'm' })
    press({ key: ' ' })
    expect(engine.plays).toHaveLength(0)
    expect(screen.queryByText('Which interval?')).toBeNull()
  })
})

describe('focus after a pointer click on the strip', () => {
  it('moves focus to the instrument so shortcuts keep working', async () => {
    const explore = radio('Explore')
    explore.focus()
    fireEvent.click(explore, { detail: 1 })
    await waitFor(() => expect(document.activeElement).toBe(document.querySelector('.piano')))
  })

  it('lands on the fretboard after choosing Guitar', async () => {
    const guitar = radio('Guitar')
    guitar.focus()
    fireEvent.click(guitar, { detail: 1 })
    await waitFor(() => expect(document.activeElement).toBe(document.querySelector('.fretboard')))
  })

  it('keeps focus when the control is activated from the keyboard', () => {
    const explore = radio('Explore')
    explore.focus()
    fireEvent.click(explore, { detail: 0 })
    expect(document.activeElement).toBe(explore)
  })
})

describe('Reveal and Next', () => {
  const reveal = () => screen.getByRole('button', { name: /Reveal|Next/ })
  const lit = () => [...document.querySelectorAll('[data-lit]')].map((n) => n.getAttribute('data-lit'))

  it('is disabled with no question and Enter does nothing', () => {
    expect(reveal().getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(reveal())
    press({ key: 'Enter' })
    expect(screen.getByText('Which interval?')).toBeTruthy()
    expect(engine.plays).toHaveLength(0)
  })

  it('reveals with Enter: abbreviation, both notes lit, root marked, focus kept, announced', () => {
    press({ key: ' ' })
    const button = reveal()
    button.focus()
    const event = press({ key: 'Enter' })
    expect(event.defaultPrevented).toBe(true)
    expect(screen.getByText('P5', { selector: '.readout-question' })).toBeTruthy()
    expect(lit()).toEqual(['60', '67'])
    expect(document.querySelectorAll('[data-root]')).toHaveLength(1)
    expect(document.querySelector('[data-root]')!.getAttribute('data-lit')).toBe('60')
    expect(button.textContent).toContain('Next')
    expect(document.activeElement).toBe(button)
    expect(document.querySelector('[aria-live="polite"].visually-hidden')!.textContent).toBe('perfect fifth')
    expect(document.body.textContent).not.toMatch(/score|correct|great/i)
  })

  it('reveals on click, and Next draws and plays a new interval and unlights', () => {
    press({ key: ' ' })
    fireEvent.click(reveal())
    expect(lit()).toHaveLength(2)
    vi.spyOn(Math, 'random').mockReturnValue(0.1)
    fireEvent.click(reveal())
    expect(engine.plays).toHaveLength(2)
    expect(engine.plays[1].pitches).not.toEqual(engine.plays[0].pitches)
    expect(screen.getByText('Which interval?')).toBeTruthy()
    expect(lit()).toHaveLength(0)
    expect(reveal().textContent).toContain('Reveal')
  })

  it('Enter yields to other focused controls', () => {
    press({ key: ' ' })
    press({ key: 'Enter' }, radio('Piano'))
    const field = document.createElement('input')
    field.type = 'text'
    document.body.append(field)
    press({ key: 'Enter' }, field)
    field.remove()
    expect(lit()).toHaveLength(0)
  })

  it('keeps the reveal across a swap and replays the same pitches with Space', () => {
    press({ key: ' ' })
    press({ key: 'Enter' })
    press({ key: 'i' })
    expect(document.querySelector('.fretboard')).not.toBeNull()
    expect(lit()).toHaveLength(2)
    expect(document.querySelectorAll('[data-root]')).toHaveLength(1)
    press({ key: ' ' })
    expect(engine.plays[1].pitches).toEqual(engine.plays[0].pitches)
    expect(screen.getByText('P5', { selector: '.readout-question' })).toBeTruthy()
  })

  it('keeps the revealed state through Explore, which shows the workspace', () => {
    press({ key: ' ' })
    press({ key: 'Enter' })
    press({ key: 'm' })
    expect(lit()).toHaveLength(0)
    press({ key: 'm' })
    expect(lit()).toHaveLength(2)
    expect(engine.plays).toHaveLength(1)
  })
})
