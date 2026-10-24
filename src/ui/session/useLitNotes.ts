import type { Pitch } from '../../core/pitch'
import { useSettings } from '../settings/SettingsContext'
import { useSession } from './SessionContext'

export interface LitNotes {
  readonly pitches: readonly Pitch[]
  readonly root?: Pitch
}

// A revealed question lights its own two notes; a chosen fixed root lights itself in Listen; otherwise the workspace.
export function useLitNotes(): LitNotes {
  const { session } = useSession()
  const { settings } = useSettings()
  const { question, revealed, fixedRoot } = session.practice
  if (session.mode === 'listen' && revealed && question) return { pitches: question.pitches, root: question.root }
  if (session.mode === 'listen' && settings.rootMode === 'fixed' && fixedRoot !== null) return { pitches: [fixedRoot], root: fixedRoot }
  return { pitches: session.workspace.pitches }
}
