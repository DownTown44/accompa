import { closestPair, positionsForPitch, STANDARD_GUITAR_TUNING } from '../core/instruments'
import { Fretboard } from './Fretboard'
import { useSession } from './SessionContext'
import { useLitNotes } from './useLitNotes'

export function GuitarStage() {
  const { session } = useSession()
  const { pitches, root } = useLitNotes()
  if (session.instrument !== 'guitar') return null
  const upper = root === undefined ? undefined : pitches.find((p) => p !== root)
  const pair = root !== undefined && upper !== undefined ? closestPair(root, upper) : null
  const lit = pair ? [pair.root, pair.upper] : [...new Set(pitches)].flatMap((p) => positionsForPitch(p))
  return (
    <div className="stage stage-fade">
      <Fretboard tuning={STANDARD_GUITAR_TUNING} lit={lit} root={pair?.root} />
    </div>
  )
}
