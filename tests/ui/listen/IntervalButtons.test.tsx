import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { interval } from '../../../src/core/pitch'
import { INTERVALS } from '../../../src/core/theory'
import { EngineProvider } from '../../../src/ui/engine/EngineContext'
import { IntervalButtons } from '../../../src/ui/listen/IntervalButtons'
import { ListenView } from '../../../src/ui/listen/ListenView'
import { SessionProvider } from '../../../src/ui/session/SessionContext'
import { initialSession } from '../../../src/ui/session/session'
import { useShortcuts } from '../../../src/ui/shortcuts/useShortcuts'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine, type FakeEngine } from '../support/fakeEngine'

function press(init: KeyboardEventInit, target: EventTarget = document.body) {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
  event.getModifierState = () => false
  act(() => {
    target.dispatchEvent(event)
  })
}

const button = (name: string | RegExp) => screen.getByRole('button', { name })
const hint = () => document.querySelector('.guess-hint')!.textContent
const marked = () => [...document.querySelectorAll('.interval-button.wrong')].map((b) => b.textContent)

let engine: FakeEngine

beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(0.5) // first question is P5 from C4
  engine = createFakeEngine()
})

afterEach(() => {
  vi.restoreAllMocks()
})

function open() {
  render(<App engine={engine} />)
}

function ask() {
  press({ key: ' ' })
}

describe('the row', () => {
  it('shows 12 buttons from the table with key hints and shortcuts', () => {
    open()
    const buttons = document.querySelectorAll('.interval-button')
    expect(buttons).toHaveLength(12)
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=']
    buttons.forEach((b, i) => {
      expect(b.querySelector('.interval-label')!.textContent).toBe(INTERVALS[i].abbreviation)
      expect(b.querySelector('.key-hint')!.textContent).toBe(keys[i])
      expect(b.querySelector('.key-hint')!.getAttribute('aria-hidden')).toBe('true')
      expect(b.getAttribute('aria-keyshortcuts')).toBe(keys[i])
    })
  })

  it('is aria-disabled before the first question and nothing happens', () => {
    open()
    expect(document.querySelectorAll('.interval-button[aria-disabled="true"]')).toHaveLength(12)
    press({ key: '7' })
    fireEvent.click(button('P5'))
    expect(engine.plays).toHaveLength(0)
    expect(hint()).toBe('')
  })

  it('is hidden in Explore', () => {
    open()
    press({ key: 'm' })
    expect(document.querySelector('.interval-row')).toBeNull()
  })
})

describe('guessing', () => {
  it('right guess with a key names the interval, plays the next question and clears marks', () => {
    open()
    ask()
    press({ key: '3' })
    expect(marked()).toEqual(['m33'])
    vi.spyOn(Math, 'random').mockReturnValue(0.1)
    press({ key: '7' })
    expect(hint()).toBe('P5. Next interval is playing.')
    expect(engine.plays).toHaveLength(2)
    expect(engine.plays[1].pitches).not.toEqual(engine.plays[0].pitches)
    expect(marked()).toEqual([])
    expect(screen.getByText('Which interval?')).toBeTruthy()
  })

  it('right guess with a click works', () => {
    open()
    ask()
    fireEvent.click(button('P5'), { detail: 1 })
    expect(hint()).toBe('P5. Next interval is playing.')
    expect(engine.plays).toHaveLength(2)
  })

  it('wrong guess marks the button, keeps the question and plays nothing', () => {
    open()
    ask()
    press({ key: '3' })
    const tried = button('m3, tried')
    expect(tried.getAttribute('aria-disabled')).toBe('true')
    expect(tried.tabIndex).toBe(0)
    expect(tried.className).toContain('wrong')
    expect(hint()).toBe('m3 is not it — try another.')
    expect(engine.plays).toHaveLength(1)
    expect(document.body.textContent).not.toMatch(/score|streak|correct|great/i)
  })

  it('ignores a marked button and keeps several marks', () => {
    open()
    ask()
    press({ key: '3' })
    fireEvent.click(button('m3, tried'))
    expect(hint()).toBe('m3 is not it — try another.')
    press({ key: '9' })
    expect(hint()).toBe('M6 is not it — try another.')
    expect(marked()).toHaveLength(2)
    press({ key: '3' })
    expect(hint()).toBe('M6 is not it — try another.')
  })

  it('reveal clears the hint and disables the buttons, marks stay', () => {
    open()
    ask()
    press({ key: '3' })
    press({ key: 'Enter' })
    expect(hint()).toBe('')
    expect(document.querySelectorAll('.interval-button[aria-disabled="true"]')).toHaveLength(12)
    press({ key: '7' })
    expect(engine.plays).toHaveLength(1)
  })

  it('Next clears hint and marks', () => {
    open()
    ask()
    press({ key: '3' })
    press({ key: 'Enter' })
    press({ key: 'Enter' })
    expect(hint()).toBe('')
    expect(marked()).toEqual([])
  })

  it('keeps marks and question through Explore without replaying', () => {
    open()
    ask()
    press({ key: '3' })
    press({ key: 'm' })
    press({ key: 'm' })
    expect(marked()).toHaveLength(1)
    expect(engine.plays).toHaveLength(1)
  })
})

describe('key rules', () => {
  it('accepts = as the last interval key', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999)
    open()
    ask()
    press({ key: '=' })
    expect(hint()).not.toBe('')
  })

  it('ignores repeat and Ctrl, Alt, Meta', () => {
    open()
    ask()
    press({ key: '3', repeat: true })
    press({ key: '0', ctrlKey: true })
    press({ key: '3', altKey: true })
    press({ key: '3', metaKey: true })
    expect(hint()).toBe('')
  })

  it('does nothing in Explore and leaves the question and marks unchanged', () => {
    open()
    ask()
    press({ key: '3' })
    press({ key: 'm' })
    press({ key: '3' })
    press({ key: '7' })
    expect(engine.plays).toHaveLength(1)
    press({ key: 'm' })
    expect(engine.plays).toHaveLength(1)
    expect(marked()).toEqual(['m33'])
    expect(screen.getByText('Which interval?')).toBeTruthy()
    expect(button(/Reveal/).getAttribute('aria-disabled')).toBeNull()
  })

  it('yields to a focused button, radio, tab and text field', () => {
    open()
    ask()
    press({ key: '3' }, button(/Reveal/))
    press({ key: '3' }, screen.getByRole('radio', { name: 'Piano' }))
    const tab = document.createElement('div')
    tab.setAttribute('role', 'tab')
    const field = document.createElement('input')
    field.type = 'text'
    document.body.append(tab, field)
    press({ key: '3' }, tab)
    press({ key: '3' }, field)
    tab.remove()
    field.remove()
    expect(hint()).toBe('')
  })

  it('releases focus after a pointer click on Listen buttons, keeps it for the keyboard', () => {
    open()
    ask()
    const m3 = button('m3')
    m3.focus()
    fireEvent.click(m3, { detail: 1 })
    expect(document.activeElement).toBe(document.body)
    const play = button(/Play again/)
    play.focus()
    fireEvent.click(play, { detail: 0 })
    expect(document.activeElement).toBe(play)
    fireEvent.click(play, { detail: 1 })
    expect(document.activeElement).toBe(document.body)
    press({ key: '2' })
    expect(hint()).toBe('M2 is not it — try another.')
  })
})

describe('pool', () => {
  function Shortcuts() {
    useShortcuts()
    return null
  }

  it('disables an out-of-pool interval at readable opacity and ignores its key', () => {
    const question = { root: 60, interval: interval(7), pitches: [60, 67] } as never
    const pool = INTERVALS.map((i) => i.semitones).filter((s) => s !== 1)
    const initial = { ...initialSession, practice: { ...initialSession.practice, pool, question } }
    render(
      <EngineProvider engine={engine}>
        <SessionProvider initial={initial}>
          <Shortcuts />
          <ListenView />
          <IntervalButtons />
        </SessionProvider>
      </EngineProvider>,
    )
    const m2 = button('m2')
    expect(m2.getAttribute('aria-disabled')).toBe('true')
    expect(m2.hasAttribute('data-out-of-pool')).toBe(true)
    press({ key: '1' })
    fireEvent.click(m2)
    expect(hint()).toBe('')
    expect(marked()).toEqual([])
  })
})
