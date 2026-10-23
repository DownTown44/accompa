import './listen.css'
import { useSession } from '../session/SessionContext'
import { useSessionActions } from '../session/useSessionActions'
import { releaseFocusAfterPointer } from './focus'

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
        onClick={(event) => {
          releaseFocusAfterPointer(event)
          play()
        }}
      >
        Play again <span className="key-hint">Space</span>
      </button>
      <button
        type="button"
        className="action-button action-primary"
        aria-disabled={question ? undefined : true}
        onClick={(event) => {
          releaseFocusAfterPointer(event)
          revealOrNext()
        }}
      >
        {revealed ? 'Next' : 'Reveal'} <span className="key-hint">Enter</span>
      </button>
    </div>
  )
}
