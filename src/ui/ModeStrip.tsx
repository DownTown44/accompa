import './shell.css'
import { SegmentedGroup } from './SegmentedGroup'
import { useSession } from './SessionContext'

export function ModeStrip() {
  const { session, dispatch } = useSession()
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
        onChange={(mode) => dispatch({ type: 'setMode', mode })}
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
        onChange={(instrument) => dispatch({ type: 'setInstrument', instrument })}
      />
      <span className="strip-slot" aria-hidden="true" />
      <span className="strip-slot" aria-hidden="true" />
    </header>
  )
}
