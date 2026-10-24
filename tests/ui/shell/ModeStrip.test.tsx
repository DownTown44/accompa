import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '../../../src/ui/app/App'
import { createFakeEngine } from '../support/fakeEngine'
import { listenSession } from '../support/sessions'

const radio = (name: string) => screen.getByRole('radio', { name }) as HTMLInputElement

describe('mode strip', () => {
  it('opens on Listen and Piano', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    expect(radio('Listen').checked).toBe(true)
    expect(radio('Explore').checked).toBe(false)
    expect(radio('Piano').checked).toBe(true)
    expect(radio('Guitar').checked).toBe(false)
  })

  it('shows the wordmark, the two groups, the opener, the hint and two empty slots', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    expect(screen.getByRole('heading', { name: 'accompa' })).toBeTruthy()
    const mode = screen.getByRole('radiogroup', { name: 'Mode' })
    const instrument = screen.getByRole('radiogroup', { name: 'Instrument' })
    expect(within(mode).getAllByRole('radio')).toHaveLength(2)
    expect(within(instrument).getAllByRole('radio')).toHaveLength(2)
    expect(document.querySelectorAll('.strip-slot[aria-hidden="true"]')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Setup' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Shortcuts' })).toBeTruthy()
  })

  it('switches mode and instrument on selection, one checked per group', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    fireEvent.click(radio('Explore'))
    expect(radio('Explore').checked).toBe(true)
    expect(radio('Listen').checked).toBe(false)
    fireEvent.click(radio('Guitar'))
    expect(radio('Guitar').checked).toBe(true)
    expect(radio('Piano').checked).toBe(false)
    expect(radio('Explore').checked).toBe(true)
  })

  it('puts the mode group before the instrument group, then the keyboard and the Listen controls', () => {
    render(<App session={listenSession} engine={createFakeEngine()} />)
    const focusable = [...document.querySelectorAll<HTMLElement>('input, button, a[href], select, textarea, [tabindex]')].filter((el) => !el.closest('[hidden]'))
    expect(focusable.map((el) => (el as HTMLInputElement).value || el.textContent)).toEqual(['listen', 'explore', 'piano', 'guitar', 'C3C4C5', 'Play again Space', 'Reveal Enter', 'm21', 'M22', 'm33', 'M34', 'P45', 'A46', 'P57', 'm68', 'M69', 'm70', 'M7-', 'P8=', '⚙︎', '?'])
    for (const slot of document.querySelectorAll('.strip-slot[aria-hidden]')) expect(slot.querySelector('button, [tabindex]')).toBeNull()
  })
})

describe('instrument swap', () => {
  it('swaps and swaps back by click and by I', () => {
    const { container } = render(<App session={listenSession} engine={createFakeEngine()} />)
    fireEvent.click(radio('Guitar'))
    expect(container.querySelector('.fretboard')).not.toBeNull()
    fireEvent.click(radio('Piano'))
    expect(container.querySelector('.piano')).not.toBeNull()
    fireEvent.keyDown(document.body, { key: 'i' })
    expect(radio('Guitar').checked).toBe(true)
    expect(container.querySelector('.fretboard')).not.toBeNull()
    fireEvent.keyDown(document.body, { key: 'i' })
    expect(radio('Piano').checked).toBe(true)
  })
})

describe('shell styles', () => {
  const dir = join(process.cwd(), 'src', 'ui')
  const css = (readdirSync(dir, { recursive: true }) as string[])
    .filter((name) => name.endsWith('.css'))
    .map((name) => readFileSync(join(dir, name), 'utf8'))
    .join('\n')

  it('draws rings as outlines, never box-shadow', () => {
    expect(css).not.toMatch(/box-shadow/)
    expect(css).toMatch(/:focus-visible[^{]*{[^}]*outline:\s*var\(--spacing-focus-ring-width\) solid var\(--color-focus\)/)
    expect(css).toMatch(/outline-offset:\s*var\(--spacing-focus-ring-offset\)/)
  })

  it('gives the strip its minimum height and the selected state one treatment', () => {
    expect(css).toMatch(/min-height:\s*var\(--spacing-strip-height\)/)
    expect(css).toMatch(/:checked[^{]*{[^}]*background:\s*var\(--color-accent\)[^}]*color:\s*var\(--color-on-fill\)[^}]*font-weight:\s*600/)
  })
})
