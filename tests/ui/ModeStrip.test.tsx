import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '../../src/ui/App'
import { createFakeEngine } from './fakeEngine'

const radio = (name: string) => screen.getByRole('radio', { name }) as HTMLInputElement

describe('mode strip', () => {
  it('opens on Listen and Piano', () => {
    render(<App engine={createFakeEngine()} />)
    expect(radio('Listen').checked).toBe(true)
    expect(radio('Explore').checked).toBe(false)
    expect(radio('Piano').checked).toBe(true)
    expect(radio('Guitar').checked).toBe(false)
  })

  it('shows the wordmark, the two groups and the placeholder slots', () => {
    render(<App engine={createFakeEngine()} />)
    expect(screen.getByRole('heading', { name: 'accompa' })).toBeTruthy()
    const mode = screen.getByRole('radiogroup', { name: 'Mode' })
    const instrument = screen.getByRole('radiogroup', { name: 'Instrument' })
    expect(within(mode).getAllByRole('radio')).toHaveLength(2)
    expect(within(instrument).getAllByRole('radio')).toHaveLength(2)
    expect(document.querySelectorAll('.strip-slot[aria-hidden="true"]')).toHaveLength(2)
  })

  it('switches mode and instrument on selection, one checked per group', () => {
    render(<App engine={createFakeEngine()} />)
    fireEvent.click(radio('Explore'))
    expect(radio('Explore').checked).toBe(true)
    expect(radio('Listen').checked).toBe(false)
    fireEvent.click(radio('Guitar'))
    expect(radio('Guitar').checked).toBe(true)
    expect(radio('Piano').checked).toBe(false)
    expect(radio('Explore').checked).toBe(true)
  })

  it('puts the mode group before the instrument group, then the Listen controls and the keyboard', () => {
    render(<App engine={createFakeEngine()} />)
    const focusable = [...document.querySelectorAll<HTMLElement>('input, button, a[href], select, textarea, [tabindex]')]
    expect(focusable.map((el) => (el as HTMLInputElement).value || el.textContent)).toEqual(['listen', 'explore', 'piano', 'guitar', 'Play again Space', 'C3C4C5'])
    for (const slot of document.querySelectorAll('.strip-slot')) expect(slot.querySelector('button, [tabindex]')).toBeNull()
  })
})

describe('shell styles', () => {
  const dir = join(process.cwd(), 'src', 'ui')
  const css = readdirSync(dir)
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
