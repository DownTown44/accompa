import './setup.css'
import { useEffect, useRef, useState } from 'react'
import type { Direction, PracticeKind, RootMode, Sound, Theme } from '../../core/model'
import type { Interval } from '../../core/pitch'
import { CHORD_QUALITIES, INTERVALS } from '../../core/theory'
import { qualityLabel } from '../shared/chordLabels'
import { SegmentedGroup } from '../shell/SegmentedGroup'
import { useSession } from '../session/SessionContext'
import { useSessionActions } from '../session/useSessionActions'
import { useSettings } from '../settings/SettingsContext'

export const SETUP_PANEL_ID = 'setup-panel'
export const SETUP_OPENER_ID = 'setup-opener'

const PRACTICES: readonly { value: PracticeKind; label: string }[] = [
  { value: 'intervals', label: 'Intervals' },
  { value: 'chords', label: 'Chords' },
]

const DIRECTIONS: readonly { value: Direction; label: string }[] = [
  { value: 'ascending', label: 'Ascending' },
  { value: 'descending', label: 'Descending' },
  { value: 'harmonic', label: 'Harmonic' },
]

const ROOT_MODES: readonly { value: RootMode; label: string }[] = [
  { value: 'random', label: 'Random' },
  { value: 'fixed', label: 'Fixed' },
]

const SOUNDS: readonly { value: Sound; label: string }[] = [
  { value: 'samples', label: 'Samples' },
  { value: 'synthesized', label: 'Synthesized' },
]

const THEMES: readonly { value: Theme; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

export function SetupPanel() {
  const { session } = useSession()
  const { settings, dispatch } = useSettings()
  const { setPractice, setDirection, setRootMode } = useSessionActions()
  const open = session.setupOpen
  const { pool, chordPool } = settings
  const chords = settings.practice === 'chords'
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

  function onChordChip(name: string) {
    if (chordPool.length === 1 && chordPool[0] === name) {
      setKeepNote(true)
      return
    }
    setKeepNote(false)
    dispatch({ type: 'toggleChordPool', quality: name })
  }

  return (
    <section id={SETUP_PANEL_ID} className="setup-panel" aria-labelledby="setup-label" hidden={!open}>
      <h2 id="setup-label" className="setup-label">
        Setup
      </h2>
      <h3 id="practice-label" className="setup-sublabel setup-sublabel-first">
        Practice
      </h3>
      <SegmentedGroup<PracticeKind>
        label="Practice"
        labelledBy="practice-label"
        name="practice"
        variant="setup"
        options={PRACTICES}
        value={settings.practice}
        onChange={(practice) => {
          setKeepNote(false)
          setPractice(practice)
        }}
      />
      {chords ? (
        <div className="setup-chips setup-chips-gap" role="group" aria-label="Chord qualities">
          {CHORD_QUALITIES.map((quality, index) => {
            const selected = chordPool.includes(quality.name)
            const last = selected && chordPool.length === 1
            return (
              <button
                key={quality.name}
                ref={index === 0 ? first : undefined}
                type="button"
                className="setup-chip"
                aria-pressed={selected}
                aria-disabled={last ? true : undefined}
                onClick={() => onChordChip(quality.name)}
              >
                {qualityLabel(quality.name)}
              </button>
            )
          })}
        </div>
      ) : (
      <div className="setup-chips setup-chips-gap" role="group" aria-labelledby="setup-label">
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
      )}
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
        disabled={chords}
        onChange={setDirection}
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
        disabled={chords}
        onChange={setRootMode}
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
      <p className="setup-hint">
        Samples follow the instrument: piano sound on the piano, guitar sound on the guitar.
      </p>
      <p className="setup-hint">Piano sound: Salamander Grand Piano V3 by Alexander Holm, CC BY 3.0.</p>
      <p className="setup-hint">Guitar sound: FreePats Nylon-String Acoustic Guitar, CC0.</p>
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
        {keepNote ? (chords ? 'Keep at least one chord quality.' : 'Keep at least one interval.') : ''}
      </p>
    </section>
  )
}
