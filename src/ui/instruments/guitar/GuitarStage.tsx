import '../instruments.css'
import './guitar.css'
import { closestPair, type FretPosition, positionsForPitch, STANDARD_GUITAR_TUNING } from '../../../core/instruments'
import { Fretboard } from './Fretboard'
import { useSession } from '../../session/SessionContext'
import { useSessionActions } from '../../session/useSessionActions'
import { useLitNotes } from '../../session/useLitNotes'

export function GuitarStage() {
  const { session } = useSession()
  const { pitches, root, positions, rootPosition, positionRoles } = useLitNotes()
  const { pressNote, releaseNote } = useSessionActions()
  if (session.instrument !== 'guitar') return null
  const upper = root === undefined ? undefined : pitches.find((p) => p !== root)
  const pair = root !== undefined && upper !== undefined ? closestPair(root, upper) : null
  const all = [...new Set(pitches)].flatMap((p) => positionsForPitch(p))
  const exact = session.mode === 'explore' && positions !== undefined
  const lit = exact ? positions : pair ? [pair.root, pair.upper] : all
  // A lone root lights every position and rings the one with the lowest fret.
  const ring = exact
    ? rootPosition
    : pair
    ? pair.root
    : root === undefined
      ? undefined
      : positionsForPitch(root).reduce<FretPosition | undefined>((best, p) => (best === undefined || p.fret < best.fret ? p : best), undefined)
  return (
    <div className="stage stage-fade">
      <Fretboard tuning={STANDARD_GUITAR_TUNING} lit={lit} root={ring} roles={exact ? positionRoles : undefined} onNotePress={(note) => pressNote(note.pitch)} onNoteRelease={(note) => releaseNote(note.pitch, { string: note.string, fret: note.fret })} />
    </div>
  )
}
