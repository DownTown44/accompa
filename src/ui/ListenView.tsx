import { useSession } from './SessionContext'
import { useSessionActions } from './useSessionActions'

export function ListenView() {
  const { session } = useSession()
  const { play } = useSessionActions()
  if (session.mode !== 'listen') return null
  return (
    <section className="listen" aria-label="Listen">
      <p className="readout-question">Which interval?</p>
      <div className="controls">
        <button type="button" className="action-button" onClick={play}>
          Play again <span className="key-hint">Space</span>
        </button>
      </div>
    </section>
  )
}
