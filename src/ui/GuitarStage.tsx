import { positionsForPitch, STANDARD_GUITAR_TUNING } from '../core/instruments'
import { Fretboard } from './Fretboard'
import { useSession } from './SessionContext'

export function GuitarStage() {
  const { session } = useSession()
  if (session.instrument !== 'guitar') return null
  const lit = [...new Set(session.workspace.pitches)].flatMap((p) => positionsForPitch(p))
  return (
    <div className="stage stage-fade">
      <Fretboard tuning={STANDARD_GUITAR_TUNING} lit={lit} />
    </div>
  )
}
