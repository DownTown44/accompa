import './help.css'
import { useRef } from 'react'
import { useSession } from '../session/SessionContext'
import { useSessionActions } from '../session/useSessionActions'

export const HELP_LIST_ID = 'help-list'

interface Row {
  keys: readonly string[]
  meaning: string
}

const ROWS: readonly Row[] = [
  { keys: ['Space'], meaning: 'Play and replay' },
  { keys: ['Enter'], meaning: 'Reveal, then next' },
  { keys: ['1–9', '0', '-', '='], meaning: 'Pick m2 to P8' },
  { keys: ['M'], meaning: 'Listen or Explore' },
  { keys: ['I'], meaning: 'Piano or Guitar' },
  { keys: ['P'], meaning: 'Setup' },
  { keys: ['[', ']'], meaning: 'Piano octave down, up' },
  { keys: ['Esc'], meaning: 'Close panel or list' },
  { keys: ['?'], meaning: 'This list' },
]

export function HelpHint() {
  const { session } = useSession()
  const { openHelp, closeHelp } = useSessionActions()
  const hovering = useRef(false)
  const focused = useRef(false)

  function enter() {
    hovering.current = true
    openHelp()
  }
  function leave() {
    hovering.current = false
    if (!focused.current) closeHelp()
  }

  // Hover and focus open the list, so a click on the hint must not close it again.
  return (
    <>
      <button
        type="button"
        className="help-hint"
        aria-label="Shortcuts"
        aria-expanded={session.helpOpen}
        aria-controls={HELP_LIST_ID}
        aria-keyshortcuts="?"
        onMouseEnter={enter}
        onMouseLeave={leave}
        onFocus={() => {
          focused.current = true
          openHelp()
        }}
        onBlur={() => {
          focused.current = false
          if (!hovering.current) closeHelp()
        }}
      >
        <span aria-hidden="true">?</span>
      </button>
      <div id={HELP_LIST_ID} className="help-list" hidden={!session.helpOpen} onMouseEnter={enter} onMouseLeave={leave}>
        <ul className="help-rows">
          {ROWS.map((row) => (
            <li key={row.meaning} className="help-row">
              <span className="help-keys">
                {row.keys.map((key) => (
                  <span key={key} className="key-hint help-cap">
                    {key}
                  </span>
                ))}
              </span>
              <span className="help-meaning">{row.meaning}</span>
            </li>
          ))}
        </ul>
        <p className="help-note">Space and Enter on a focused button activate that button.</p>
      </div>
    </>
  )
}
