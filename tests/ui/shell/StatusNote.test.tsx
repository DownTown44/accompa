import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine } from '../support/fakeEngine'

const message = 'Press any key to wake the sound.'

describe('audio status note', () => {
  it('shows nothing before any gesture', () => {
    render(<App engine={createFakeEngine('idle')} />)
    expect(screen.queryByText(message)).toBeNull()
  })

  it('shows the note while audio is blocked and removes it when audio runs', () => {
    const engine = createFakeEngine('idle')
    render(<App engine={engine} />)
    act(() => engine.setStatus('blocked'))
    expect(screen.getByText(message)).toBeTruthy()
    act(() => engine.setStatus('running'))
    expect(screen.queryByText(message)).toBeNull()
  })

  it('keeps the note in a polite live region that exists before the message', () => {
    render(<App engine={createFakeEngine('idle')} />)
    expect(document.querySelector('.status-note[aria-live="polite"]')).not.toBeNull()
  })

  it('unlocks audio on the next key press while blocked', () => {
    const engine = createFakeEngine('blocked')
    render(<App engine={engine} />)
    fireEvent.keyDown(document.body, { key: 'a' })
    expect(engine.unlocks).toBe(1)
  })

  it('unlocks audio on the next click while blocked', () => {
    const engine = createFakeEngine('blocked')
    render(<App engine={engine} />)
    fireEvent.click(document.body)
    expect(engine.unlocks).toBe(1)
  })

  it('does not unlock when audio is not blocked', () => {
    const engine = createFakeEngine('running')
    render(<App engine={engine} />)
    fireEvent.keyDown(document.body, { key: 'a' })
    fireEvent.click(document.body)
    expect(engine.unlocks).toBe(0)
  })
})
