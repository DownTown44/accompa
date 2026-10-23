import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { pitch } from '../../../../src/core/pitch'
import { App, Shell } from '../../../../src/ui/app/App'
import { EngineProvider } from '../../../../src/ui/engine/EngineContext'
import { SettingsProvider } from '../../../../src/ui/settings/SettingsContext'
import { SessionProvider } from '../../../../src/ui/session/SessionContext'
import { initialSession, type Session } from '../../../../src/ui/session/session'
import { createFakeEngine } from '../../support/fakeEngine'

const labels = (container: HTMLElement) => [...container.querySelectorAll('.octave-label')].map((t) => t.textContent)
const note = (container: HTMLElement) => container.querySelector('.status-note')?.textContent

function renderWith(pitches: number[], engine = createFakeEngine()) {
  const initial: Session = { ...initialSession, workspace: { pitches: pitches.map(pitch) } }
  return render(
    <EngineProvider engine={engine}>
      <SettingsProvider>
        <SessionProvider initial={initial}>
          <Shell />
        </SessionProvider>
      </SettingsProvider>
    </EngineProvider>,
  )
}

describe('piano stage', () => {
  it('shows the keyboard in Listen and Explore, hides it for Guitar', () => {
    const { container } = render(<App engine={createFakeEngine()} />)
    expect(labels(container)).toEqual(['C3', 'C4', 'C5'])
    fireEvent.keyDown(document.body, { key: 'm' })
    expect(labels(container)).toEqual(['C3', 'C4', 'C5'])
    fireEvent.keyDown(document.body, { key: 'i' })
    expect(container.querySelector('.piano')).toBeNull()
    fireEvent.keyDown(document.body, { key: 'i' })
    expect(container.querySelector('.piano')).not.toBeNull()
  })

  it('shifts with ] and [ and stops at the ends', () => {
    const { container } = render(<App engine={createFakeEngine()} />)
    fireEvent.keyDown(document.body, { key: ']' })
    expect(labels(container)).toEqual(['C4', 'C5', 'C6'])
    fireEvent.keyDown(document.body, { key: ']' })
    expect(labels(container)).toEqual(['C4', 'C5', 'C6'])
    fireEvent.keyDown(document.body, { code: 'BracketLeft', key: 'Dead' })
    fireEvent.keyDown(document.body, { key: '[' })
    expect(labels(container)).toEqual(['C2', 'C3', 'C4'])
    fireEvent.keyDown(document.body, { key: '[' })
    expect(labels(container)).toEqual(['C2', 'C3', 'C4'])
  })

  it('ignores shift keys with a modifier, repeat, or in a text field', () => {
    const { container } = render(
      <>
        <App engine={createFakeEngine()} />
        <input type="text" aria-label="note" />
      </>,
    )
    fireEvent.keyDown(document.body, { key: ']', ctrlKey: true })
    fireEvent.keyDown(document.body, { key: ']', metaKey: true })
    fireEvent.keyDown(document.body, { key: ']', repeat: true })
    fireEvent.keyDown(screen.getByLabelText('note'), { key: ']' })
    expect(labels(container)).toEqual(['C3', 'C4', 'C5'])
  })

  it('accepts AltGr', () => {
    const { container } = render(<App engine={createFakeEngine()} />)
    const event = new KeyboardEvent('keydown', { bubbles: true, key: ']', ctrlKey: true, altKey: true })
    event.getModifierState = (k: string) => k === 'AltGraph'
    act(() => {
      document.body.dispatchEvent(event)
    })
    expect(labels(container)).toEqual(['C4', 'C5', 'C6'])
  })

  it('does not light or play on click', () => {
    const engine = createFakeEngine()
    const { container } = render(<App engine={engine} />)
    fireEvent.pointerDown(container.querySelector('[data-pitch="48"]')!)
    expect(container.querySelectorAll('[data-lit]')).toHaveLength(0)
    expect(engine.plays).toHaveLength(0)
  })

  it('shows lit notes and the offscreen note', () => {
    const { container } = renderWith([40, 41, 50, 90, 91, 92])
    expect(container.querySelectorAll('[data-lit]')).toHaveLength(1)
    expect(note(container)).toBe('◀ 2 notes lit · 3 notes lit ▶')
  })

  it.each([
    [[40, 41], '◀ 2 notes lit'],
    [[90, 91, 92], '3 notes lit ▶'],
    [[90], '1 note lit ▶'],
    [[50], ''],
  ])('offscreen text for %j', (pitches, text) => {
    const { container } = renderWith(pitches)
    expect(note(container)).toBe(text)
  })

  it('moves lit dots and the offscreen note with the window', () => {
    const { container } = renderWith([50])
    expect(container.querySelectorAll('[data-lit]')).toHaveLength(1)
    expect(note(container)).toBe('')
    fireEvent.keyDown(document.body, { key: ']' })
    expect(container.querySelectorAll('[data-lit]')).toHaveLength(0)
    expect(note(container)).toBe('◀ 1 note lit')
  })

  it('lets the audio-blocked note take precedence', () => {
    const { container } = renderWith([40], createFakeEngine('blocked'))
    expect(note(container)).toBe('Press any key to wake the sound.')
  })

  it('shows no offscreen note on the guitar', () => {
    const { container } = renderWith([40])
    fireEvent.keyDown(document.body, { key: 'i' })
    expect(note(container)).toBe('')
  })
})
