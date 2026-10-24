import './corner.css'
import { HelpHint } from '../help/HelpHint'
import { SETUP_OPENER_ID, SETUP_PANEL_ID, SetupPanel } from '../setup/SetupPanel'
import { useSession } from '../session/SessionContext'
import { useSessionActions } from '../session/useSessionActions'

// Sits after the main content in the DOM so its controls come last in the Tab order,
// and is placed over the strip's right edge by CSS.
export function Corner() {
  const { session } = useSession()
  const { toggleSetup } = useSessionActions()
  return (
    <div className="corner">
      <button
        type="button"
        id={SETUP_OPENER_ID}
        className="setup-opener"
        aria-label="Setup"
        aria-expanded={session.setupOpen}
        aria-controls={SETUP_PANEL_ID}
        aria-keyshortcuts="P"
        onClick={toggleSetup}
      >
        <span aria-hidden="true">{'⚙︎'}</span>
      </button>
      <SetupPanel />
      <HelpHint />
    </div>
  )
}
