import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine } from '../support/fakeEngine'
import { listenSession } from '../support/sessions'
import { radio } from '../support/dom'
import { press } from '../support/keys'

describe('M and I shortcuts', () => {
  it('M toggles the mode, I toggles the instrument', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
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
    render(<App session={listenSession} engine={createFakeEngine()} />)
    radio('Piano').focus()
    fireEvent.keyDown(radio('Piano'), { key: 'm' })
    expect(radio('Explore').checked).toBe(true)
  })

  it.each([
    ['ctrlKey'],
    ['altKey'],
    ['metaKey'],
  ])('ignores %s', (modifier) => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    press({ key: 'm', [modifier]: true })
    press({ key: 'i', [modifier]: true })
    expect(radio('Listen').checked).toBe(true)
    expect(radio('Piano').checked).toBe(true)
  })

  it('accepts AltGr, which reports Ctrl and Alt together', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    press({ key: 'm', ctrlKey: true, altKey: true }, document.body, true)
    expect(radio('Explore').checked).toBe(true)
  })

  it('ignores auto-repeat', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    fireEvent.keyDown(document.body, { key: 'm', repeat: true })
    expect(radio('Listen').checked).toBe(true)
  })

  it('ignores keys typed into a text field', () => {
    render(
      <>
        <App session={listenSession} engine={createFakeEngine()} />
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
    render(<App session={listenSession} engine={createFakeEngine()} />)
    fireEvent.keyDown(document.body, { key: 'x' })
    expect(radio('Listen').checked).toBe(true)
  })
})
