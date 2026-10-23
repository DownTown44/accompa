import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { COMMON_RANGE } from '../../src/core/instruments'
import { App } from '../../src/ui/App'
import { createFakeEngine, type FakeEngine } from './fakeEngine'

const radio = (name: string) => screen.getByRole('radio', { name }) as HTMLInputElement

function press(init: KeyboardEventInit, target: EventTarget = document.body) {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
  event.getModifierState = () => false
  act(() => {
    target.dispatchEvent(event)
  })
  return event
}

let engine: FakeEngine

beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
  engine = createFakeEngine()
  render(<App engine={engine} />)
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
  it('moves focus off the control so shortcuts keep working', () => {
    const explore = radio('Explore')
    explore.focus()
    fireEvent.click(explore, { detail: 1 })
    expect(document.activeElement).toBe(document.body)
  })

  it('keeps focus when the control is activated from the keyboard', () => {
    const explore = radio('Explore')
    explore.focus()
    fireEvent.click(explore, { detail: 0 })
    expect(document.activeElement).toBe(explore)
  })
})
