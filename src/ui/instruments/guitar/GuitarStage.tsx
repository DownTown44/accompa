import '../instruments.css'
import './guitar.css'
import { closestPair, type FretPosition, positionsForPitch, STANDARD_GUITAR_TUNING } from '../../../core/instruments'
import { Fretboard } from './Fretboard'
import { useSession } from '../../session/SessionContext'
import { useSessionActions } from '../../session/useSessionActions'
import { useLitNotes } from '../../session/useLitNotes'

export function GuitarStage() {
  const { session } = useSession()
  const { pitches, root } = useLitNotes()
  const { pressNote } = useSessionActions()
  if (session.instrument !== 'guitar') return null
  const upper = root === undefined ? undefined : pitches.find((p) => p !== root)
  const pair = root !== undefined && upper !== undefined ? closestPair(root, upper) : null
  const all = [...new Set(pitches)].flatMap((p) => positionsForPitch(p))
  const lit = pair ? [pair.root, pair.upper] : all
  // A lone root lights every position and rings the one with the lowest fret.
  const ring = pair
    ? pair.root
    : root === undefined
      ? undefined
      : positionsForPitch(root).reduce<FretPosition | undefined>((best, p) => (best === undefined || p.fret < best.fret ? p : best), undefined)
  return (
    <div className="stage stage-fade">
      <Fretboard tuning={STANDARD_GUITAR_TUNING} lit={lit} root={ring} onNotePress={(note) => pressNote(note.pitch)} />
    </div>
  )
}
