import '../instruments.css'
import './piano.css'
import { PianoKeyboard } from './PianoKeyboard'
import { useSession } from '../../session/SessionContext'
import { useLitNotes } from '../../session/useLitNotes'

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
