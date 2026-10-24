import '../instruments.css'
import './piano.css'
import { PianoKeyboard } from './PianoKeyboard'
import { useSession } from '../../session/SessionContext'
import { useSessionActions } from '../../session/useSessionActions'
import { useLitNotes } from '../../session/useLitNotes'

export function PianoStage() {
  const { session } = useSession()
  const { pitches, root } = useLitNotes()
  const { pressNote } = useSessionActions()
  if (session.instrument !== 'piano') return null
  return (
    <div className="stage stage-fade">
      <PianoKeyboard start={session.pianoStart} lit={pitches} root={root} onNotePress={pressNote} />
    </div>
  )
}
