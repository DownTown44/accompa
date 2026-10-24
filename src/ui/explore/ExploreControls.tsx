import '../listen/listen.css'
import { useSession } from '../session/SessionContext'
import { useSessionActions } from '../session/useSessionActions'
import { focusInstrument } from '../listen/focus'

export function ExploreControls() {
  const { session } = useSession()
  const { play, revealOrNext } = useSessionActions()
  if (session.mode !== 'explore') return null
  const disabled = session.workspace.pitches.length === 0 ? true : undefined
  return (
    <div className="controls">
      <button
        type="button"
        className="action-button"
        aria-disabled={disabled}
        aria-keyshortcuts="Space"
        onClick={(event) => {
          focusInstrument(event)
          play()
        }}
      >
        Play <span className="key-hint" aria-hidden="true">Space</span>
      </button>
      <button
        type="button"
        className="action-button action-primary"
        aria-disabled={disabled}
        aria-keyshortcuts="Enter"
        onClick={(event) => {
          focusInstrument(event)
          revealOrNext()
        }}
      >
        Block <span className="key-hint" aria-hidden="true">Enter</span>
      </button>
    </div>
  )
}
