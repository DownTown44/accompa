import { PianoKeyboard } from './PianoKeyboard'
import { useSession } from './SessionContext'
import { useLitNotes } from './useLitNotes'

export function PianoStage() {
  const { session } = useSession()
  const { pitches, root } = useLitNotes()
  if (session.instrument !== 'piano') return null
  return (
    <div className="stage stage-fade">
      <PianoKeyboard start={session.pianoStart} lit={pitches} root={root} />
    </div>
  )
}
