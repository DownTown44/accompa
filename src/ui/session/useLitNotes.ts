import { litPositions } from '../../core/explore'
import type { FretPosition } from '../../core/instruments'
import type { Pitch } from '../../core/pitch'
import { useSettings } from '../settings/SettingsContext'
import { useSession } from './SessionContext'

export interface LitNotes {
  readonly pitches: readonly Pitch[]
  readonly root?: Pitch
  // Explore only: the exact guitar position of each lit note, and the root's.
  readonly positions?: readonly FretPosition[]
  readonly rootPosition?: FretPosition
}

// Listen lights a revealed question or a chosen fixed root, and nothing else; Explore lights its own workspace.
export function useLitNotes(): LitNotes {
  const { session } = useSession()
  const { settings } = useSettings()
  const { question, revealed, fixedRoot } = session.practice
  if (session.mode === 'listen' && revealed && question) return { pitches: question.pitches, root: question.root }
  if (session.mode === 'listen' && settings.rootMode === 'fixed' && fixedRoot !== null) return { pitches: [fixedRoot], root: fixedRoot }
  if (session.mode === 'explore') {
    const { pitches, positions } = session.workspace
    const root = pitches.length > 0 ? (Math.min(...pitches) as Pitch) : undefined
    const placed = litPositions(pitches, positions)
    return {
      pitches,
      root,
      positions: placed.filter((p): p is FretPosition => p !== null),
      rootPosition: root === undefined ? undefined : (placed[pitches.indexOf(root)] ?? undefined),
    }
  }
  return { pitches: [] }
}
