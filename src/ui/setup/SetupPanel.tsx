import './setup.css'
import { useEffect, useRef, useState } from 'react'
import type { Direction } from '../../core/model'
import type { Interval } from '../../core/pitch'
import { INTERVALS } from '../../core/theory'
import { SegmentedGroup } from '../shell/SegmentedGroup'
import { useSession } from '../session/SessionContext'
import { useSessionActions } from '../session/useSessionActions'

export const SETUP_PANEL_ID = 'setup-panel'
export const SETUP_OPENER_ID = 'setup-opener'

const DIRECTIONS: readonly { value: Direction; label: string }[] = [
  { value: 'ascending', label: 'Ascending' },
  { value: 'descending', label: 'Descending' },
  { value: 'harmonic', label: 'Harmonic' },
]

export function SetupPanel() {
  const { session } = useSession()
  const { togglePool, setDirection } = useSessionActions()
  const open = session.setupOpen
  const { pool } = session.practice
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
    togglePool(semitones)
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
        value={session.direction}
        onChange={setDirection}
      />
      <p className="setup-note" role="status" aria-live="polite">
        {keepNote ? 'Keep at least one interval.' : ''}
      </p>
    </section>
  )
}
