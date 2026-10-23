import './shell.css'
import { SegmentedGroup } from './SegmentedGroup'
import { SETUP_OPENER_ID, SETUP_PANEL_ID } from '../setup/SetupPanel'
import { useSession } from '../session/SessionContext'
import { useSessionActions } from '../session/useSessionActions'

export function ModeStrip() {
  const { session } = useSession()
  const { selectMode, selectInstrument, toggleSetup } = useSessionActions()
  return (
    <header className="strip">
      <h1 className="wordmark">accompa</h1>
      <SegmentedGroup
        label="Mode"
        name="mode"
        variant="mode"
        options={[
          { value: 'listen', label: 'Listen' },
          { value: 'explore', label: 'Explore' },
        ]}
        value={session.mode}
        onChange={selectMode}
      />
      <SegmentedGroup
        label="Instrument"
        name="instrument"
        variant="segment"
        options={[
          { value: 'piano', label: 'Piano' },
          { value: 'guitar', label: 'Guitar' },
        ]}
        value={session.instrument}
        onChange={selectInstrument}
      />
      <span className="strip-slot">
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
          <span aria-hidden="true">{'\u2699\uFE0E'}</span>
        </button>
      </span>
      <span className="strip-slot" aria-hidden="true" />
    </header>
  )
}
