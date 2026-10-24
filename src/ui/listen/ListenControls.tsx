import '../shared/shared.css'
import './listen.css'
import { useSession } from '../session/SessionContext'
import { useSessionActions } from '../session/useSessionActions'
import { focusInstrument } from '../shared/focus'

export function ListenControls() {
  const { session } = useSession()
  const { play, revealOrNext } = useSessionActions()
  if (session.mode !== 'listen') return null
  const { question, revealed } = session.practice
  return (
    <div className="controls">
      <button
        type="button"
        className="action-button"
        aria-keyshortcuts="Space"
        onClick={(event) => {
          focusInstrument(event)
          play()
        }}
      >
        Play again <span className="key-hint" aria-hidden="true">Space</span>
      </button>
      <button
        type="button"
        className="action-button action-primary"
        aria-disabled={question ? undefined : true}
        aria-keyshortcuts="Enter"
        onClick={(event) => {
          focusInstrument(event)
          revealOrNext()
        }}
      >
        {revealed ? 'Next' : 'Reveal'} <span className="key-hint" aria-hidden="true">Enter</span>
      </button>
    </div>
  )
}
