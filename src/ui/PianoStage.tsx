import { PianoKeyboard } from './PianoKeyboard'
import { useSession } from './SessionContext'

export function PianoStage() {
  const { session } = useSession()
  if (session.instrument !== 'piano') return null
  return (
    <div className="stage">
      <PianoKeyboard start={session.pianoStart} lit={session.workspace.pitches} />
    </div>
  )
}
