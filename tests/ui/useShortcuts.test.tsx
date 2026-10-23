import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '../../src/ui/App'
import { createFakeEngine } from './fakeEngine'

const radio = (name: string) => screen.getByRole('radio', { name }) as HTMLInputElement

// happy-dom reports AltGraph whenever Alt is down, which browsers do not.
function press(init: KeyboardEventInit, altGraph = false) {
  const event = new KeyboardEvent('keydown', { bubbles: true, ...init })
  event.getModifierState = (key: string) => key === 'AltGraph' && altGraph
  act(() => {
    document.body.dispatchEvent(event)
  })
}

describe('M and I shortcuts', () => {
  it('M toggles the mode, I toggles the instrument', () => {
    render(<App engine={createFakeEngine()} />)
    fireEvent.keyDown(document.body, { key: 'm' })
    expect(radio('Explore').checked).toBe(true)
    fireEvent.keyDown(document.body, { key: 'M' })
    expect(radio('Listen').checked).toBe(true)
    fireEvent.keyDown(document.body, { key: 'i' })
    expect(radio('Guitar').checked).toBe(true)
    fireEvent.keyDown(document.body, { key: 'I' })
    expect(radio('Piano').checked).toBe(true)
  })

  it('works while a radio has focus', () => {
    render(<App engine={createFakeEngine()} />)
    radio('Piano').focus()
    fireEvent.keyDown(radio('Piano'), { key: 'm' })
    expect(radio('Explore').checked).toBe(true)
  })

  it.each([
    ['ctrlKey'],
    ['altKey'],
    ['metaKey'],
  ])('ignores %s', (modifier) => {
    render(<App engine={createFakeEngine()} />)
    press({ key: 'm', [modifier]: true })
    press({ key: 'i', [modifier]: true })
    expect(radio('Listen').checked).toBe(true)
    expect(radio('Piano').checked).toBe(true)
  })

  it('accepts AltGr, which reports Ctrl and Alt together', () => {
    render(<App engine={createFakeEngine()} />)
    press({ key: 'm', ctrlKey: true, altKey: true }, true)
    expect(radio('Explore').checked).toBe(true)
  })

  it('ignores auto-repeat', () => {
    render(<App engine={createFakeEngine()} />)
    fireEvent.keyDown(document.body, { key: 'm', repeat: true })
    expect(radio('Listen').checked).toBe(true)
  })

  it('ignores keys typed into a text field', () => {
    render(
      <>
        <App engine={createFakeEngine()} />
        <input type="text" aria-label="note" />
      </>,
    )
    const field = screen.getByLabelText('note')
    fireEvent.keyDown(field, { key: 'm' })
    fireEvent.keyDown(field, { key: 'i' })
    expect(radio('Listen').checked).toBe(true)
    expect(radio('Piano').checked).toBe(true)
  })

  it('ignores other keys', () => {
    render(<App engine={createFakeEngine()} />)
    fireEvent.keyDown(document.body, { key: 'x' })
    expect(radio('Listen').checked).toBe(true)
  })
})
