import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { pitch } from '../../../../src/core/pitch'
import { App, Shell } from '../../../../src/ui/app/App'
import { EngineProvider } from '../../../../src/ui/engine/EngineContext'
import { SettingsProvider } from '../../../../src/ui/settings/SettingsContext'
import { SessionProvider } from '../../../../src/ui/session/SessionContext'
import { createFakeEngine } from '../../support/fakeEngine'
import { initialSession } from '../../../../src/ui/session/session'
import { listenSession } from '../../support/sessions'

describe('guitar stage', () => {
  it('shows only on Guitar, and hides the piano', () => {
    const { container } = render(<App engine={createFakeEngine()} />)
    expect(container.querySelector('.fretboard')).toBeNull()
    fireEvent.keyDown(document.body, { key: 'i' })
    expect(container.querySelector('.fretboard')).not.toBeNull()
    expect(container.querySelector('.piano')).toBeNull()
    fireEvent.keyDown(document.body, { key: 'i' })
    expect(container.querySelector('.fretboard')).toBeNull()
    expect(container.querySelector('.piano')).not.toBeNull()
  })

  it('lights the lowest-fret position of a workspace pitch with no remembered position', () => {
    const initial = { ...initialSession, instrument: 'guitar' as const, workspace: { pitches: [pitch(64)], positions: {} } }
    const { container } = render(
      <EngineProvider engine={createFakeEngine()}>
        <SettingsProvider>
          <SessionProvider initial={initial}>
            <Shell />
          </SessionProvider>
        </SettingsProvider>
      </EngineProvider>,
    )
    expect([...container.querySelectorAll('[data-lit]')].map((n) => n.getAttribute('data-lit'))).toEqual(['5:0'])
  })

  it('fades the piano in when swapping back', () => {
    const { container } = render(<App engine={createFakeEngine()} />)
    fireEvent.keyDown(document.body, { key: 'i' })
    fireEvent.keyDown(document.body, { key: 'i' })
    expect(container.querySelector('.piano')!.parentElement!.classList.contains('stage-fade')).toBe(true)
  })

  it('does not light or play on click', () => {
    const engine = createFakeEngine()
    const { container } = render(<App session={listenSession} engine={engine} />)
    fireEvent.keyDown(document.body, { key: 'i' })
    fireEvent.pointerDown(container.querySelector('.fb-cell')!)
    expect(container.querySelectorAll('[data-lit]')).toHaveLength(0)
    expect(engine.plays).toHaveLength(0)
  })

  it('fades in, and not under reduced motion', () => {
    const { container } = render(<App engine={createFakeEngine()} />)
    fireEvent.keyDown(document.body, { key: 'i' })
    expect(container.querySelector('.stage')!.classList.contains('stage-fade')).toBe(true)
    const css = readFileSync(join(process.cwd(), 'src', 'ui', 'instruments', 'instruments.css'), 'utf8')
    expect(css).toMatch(/\.stage-fade\s*{[^}]*animation:[^}]*stage-fade-in/)
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*{\s*\.stage-fade\s*{\s*animation:\s*none/)
  })
})
