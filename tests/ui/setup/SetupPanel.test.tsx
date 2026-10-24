import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine } from '../support/fakeEngine'
import { listenSession } from '../support/sessions'
import { opener, panel } from '../support/dom'
import { press } from '../support/keys'
import { answer, chip, chips, registerSetupHooks } from '../support/setupPanel'

registerSetupHooks()

describe('setup panel', () => {
  it('is hidden at first and the opener describes it', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    expect(panel().hidden).toBe(true)
    expect(opener().getAttribute('aria-expanded')).toBe('false')
    expect(opener().getAttribute('aria-controls')).toBe('setup-panel')
  })

  it('opens with the opener, focuses the first chip, and shows 12 pressed chips with a label', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    fireEvent.click(opener())
    expect(panel().hidden).toBe(false)
    expect(opener().getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(chips()[0])
    expect(chips()).toHaveLength(12)
    expect(chips().every((c) => c.getAttribute('aria-pressed') === 'true')).toBe(true)
    expect(chips().map((c) => c.textContent)).toEqual(['m2', 'M2', 'm3', 'M3', 'P4', 'A4', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'])
    expect(screen.getByRole('group', { name: 'Setup' })).toBeTruthy()
  })

  it('toggles with P and closes with Esc and with P, returning focus to the opener', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    press({ key: 'p' })
    expect(panel().hidden).toBe(false)
    expect(document.activeElement).toBe(chips()[0])
    press({ key: 'Escape' }, document.activeElement!)
    expect(panel().hidden).toBe(true)
    expect(document.activeElement).toBe(opener())
    press({ key: 'p' })
    press({ key: 'p' }, document.activeElement!)
    expect(panel().hidden).toBe(true)
    expect(document.activeElement).toBe(opener())
  })

  it('ignores P with a modifier or repeat', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    press({ key: 'p', ctrlKey: true })
    press({ key: 'p', repeat: true })
    expect(panel().hidden).toBe(true)
  })

  it('unticks a chip, disables its answer button, and persists the pool', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    press({ key: ' ' })
    fireEvent.click(opener())
    fireEvent.click(chip('m2'))
    expect(chip('m2').getAttribute('aria-pressed')).toBe('false')
    expect(JSON.parse(localStorage.getItem('accompa.pool')!)).not.toContain(1)
    expect(answer('m2').getAttribute('aria-disabled')).toBe('true')
    expect(answer('M2').getAttribute('aria-disabled')).toBeNull()
  })

  it('keeps the current answer guessable after it leaves the pool', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    press({ key: ' ' }) // P5
    fireEvent.click(opener())
    fireEvent.click(chip('P5'))
    expect(answer('P5').getAttribute('aria-disabled')).toBeNull()
    expect(answer('P5').hasAttribute('data-out-of-pool')).toBe(false)
    expect(answer('P4').hasAttribute('data-out-of-pool')).toBe(false)
  })

  it('accepts the right answer after its chip is unticked, by click and by key', () => {
    const engine = createFakeEngine()
    render(<App session={listenSession} engine={engine} />)
    press({ key: ' ' }) // P5
    fireEvent.click(opener())
    fireEvent.click(chip('P5'))
    fireEvent.click(answer('P5'))
    expect(document.querySelector('.guess-hint')!.textContent).toBe('')
    expect(engine.plays).toHaveLength(1)
    expect(answer('P5').getAttribute('aria-disabled')).toBe('true')

    press({ key: 'Escape' })
    ;(document.activeElement as HTMLElement).blur()
    press({ key: 'Enter' })
    expect(engine.plays).toHaveLength(2)
    const next = engine.plays[1].pitches
    const semitones = next[1] - next[0]
    const key = String(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='][[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].indexOf(semitones)])
    fireEvent.click(opener())
    fireEvent.click(chips()[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].indexOf(semitones)])
    press({ key: 'Escape' })
    press({ key })
    expect(engine.plays).toHaveLength(2)
    expect(document.querySelector('.readout-question')!.textContent).not.toBe('Which interval?')
  })

  it('draws questions only from the saved pool', () => {
    localStorage.setItem('accompa.pool', '[12]')
    const engine = createFakeEngine()
    render(<App session={listenSession} engine={engine} />)
    press({ key: ' ' })
    const [root, top] = engine.plays[0].pitches
    expect(top - root).toBe(12)
    press({ key: '=' })
    expect(engine.plays).toHaveLength(1)
    press({ key: 'Enter' })
    const [nextRoot, nextTop] = engine.plays[1].pitches
    expect(nextTop - nextRoot).toBe(12)
  })

  it('does not untick the last chip and says why', () => {
    localStorage.setItem('accompa.pool', '[12]')
    render(<App session={listenSession} engine={createFakeEngine()} />)
    fireEvent.click(opener())
    const last = chip('P8')
    expect(last.getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(last)
    expect(last.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('status').textContent).toBe('Keep at least one interval.')
    fireEvent.click(chip('m2'))
    expect(screen.getByRole('status').textContent).toBe('')
    fireEvent.click(chip('m2'))
    fireEvent.click(last)
    expect(screen.getByRole('status').textContent).toBe('Keep at least one interval.')
    press({ key: 'Escape' })
    expect(document.querySelector('.setup-note')!.textContent).toBe('')
  })

  it('restores a saved pool and disables the other buttons', () => {
    localStorage.setItem('accompa.pool', '[7, 12]')
    render(<App session={listenSession} engine={createFakeEngine()} />)
    expect(answer('P5').hasAttribute('data-out-of-pool')).toBe(false)
    expect(answer('m2').hasAttribute('data-out-of-pool')).toBe(true)
  })

  it('falls back to all 12 for bad storage', () => {
    localStorage.setItem('accompa.pool', '[99]')
    render(<App session={listenSession} engine={createFakeEngine()} />)
    expect(document.querySelectorAll('[data-out-of-pool]')).toHaveLength(0)
  })

  it('does not guess when a digit is pressed inside the panel', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    press({ key: ' ' })
    fireEvent.click(opener())
    press({ key: '1' }, chips()[0])
    expect(document.querySelectorAll('.interval-button.wrong')).toHaveLength(0)
  })

  it('keeps focus on the opener after a pointer click', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    opener().focus()
    fireEvent.click(opener(), { detail: 1 })
    expect(opener().getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(opener(), { detail: 1 })
    expect(opener().getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(opener())
  })
})
