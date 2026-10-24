import './setup.css'
import { useEffect, useRef, useState } from 'react'
import type { Direction, RootMode, Sound, Theme } from '../../core/model'
import type { Interval } from '../../core/pitch'
import { INTERVALS } from '../../core/theory'
import { SegmentedGroup } from '../shell/SegmentedGroup'
import { useSession } from '../session/SessionContext'
import { useSettings } from '../settings/SettingsContext'

export const SETUP_PANEL_ID = 'setup-panel'
export const SETUP_OPENER_ID = 'setup-opener'

const DIRECTIONS: readonly { value: Direction; label: string }[] = [
  { value: 'ascending', label: 'Ascending' },
  { value: 'descending', label: 'Descending' },
  { value: 'harmonic', label: 'Harmonic' },
]

const ROOT_MODES: readonly { value: RootMode; label: string }[] = [
  { value: 'random', label: 'Random' },
  { value: 'fixed', label: 'Fixed' },
]

const SOUNDS: readonly { value: Sound; label: string }[] = [{ value: 'synthesized', label: 'Synthesized' }]

const THEMES: readonly { value: Theme; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

export function SetupPanel() {
  const { session } = useSession()
  const { settings, dispatch } = useSettings()
  const open = session.setupOpen
  const { pool } = settings
  const [keepNote, setKeepNote] = useState(false)
  const first = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)

  useEffect(() => {
    if (open) first.current?.focus()
    else if (wasOpen.current) {
      document.getElementById(SETUP_OPENER_ID)?.focus()
      setKeepNote(false)
    }
    wasOpen.current = open
  }, [open])

  function onChip(semitones: Interval) {
    if (pool.length === 1 && pool[0] === semitones) {
      setKeepNote(true)
      return
    }
    setKeepNote(false)
    dispatch({ type: 'togglePool', interval: semitones })
  }

  return (
    <section id={SETUP_PANEL_ID} className="setup-panel" aria-labelledby="setup-label" hidden={!open}>
      <h2 id="setup-label" className="setup-label">
        Setup
      </h2>
      <div className="setup-chips" role="group" aria-labelledby="setup-label">
        {INTERVALS.map((definition, index) => {
          const selected = pool.includes(definition.semitones)
          const last = selected && pool.length === 1
          return (
            <button
              key={definition.semitones}
              ref={index === 0 ? first : undefined}
              type="button"
              className="setup-chip"
              aria-pressed={selected}
              aria-disabled={last ? true : undefined}
              onClick={() => onChip(definition.semitones)}
            >
              {definition.abbreviation}
            </button>
          )
        })}
      </div>
      <h3 id="direction-label" className="setup-sublabel">
        Direction
      </h3>
      <SegmentedGroup<Direction>
        label="Direction"
        labelledBy="direction-label"
        name="direction"
        variant="setup"
        options={DIRECTIONS}
        value={settings.direction}
        onChange={(direction) => dispatch({ type: 'setDirection', direction })}
      />
      <h3 id="root-label" className="setup-sublabel">
        Root
      </h3>
      <SegmentedGroup<RootMode>
        label="Root"
        labelledBy="root-label"
        name="root"
        variant="setup"
        options={ROOT_MODES}
        value={settings.rootMode}
        onChange={(rootMode) => dispatch({ type: 'setRootMode', rootMode })}
      />
      <h3 id="sound-label" className="setup-sublabel">
        Sound
      </h3>
      <SegmentedGroup<Sound>
        label="Sound"
        labelledBy="sound-label"
        name="sound"
        variant="setup"
        options={SOUNDS}
        value={settings.sound}
        onChange={(sound) => dispatch({ type: 'setSound', sound })}
      />
      <h3 id="theme-label" className="setup-sublabel">
        Theme
      </h3>
      <SegmentedGroup<Theme>
        label="Theme"
        labelledBy="theme-label"
        name="theme"
        variant="setup"
        options={THEMES}
        value={settings.theme}
        onChange={(theme) => dispatch({ type: 'setTheme', theme })}
      />
      <p className="setup-note" role="status" aria-live="polite">
        {keepNote ? 'Keep at least one interval.' : ''}
      </p>
    </section>
  )
}
