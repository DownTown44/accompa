import type { Pitch } from '../core/pitch'
import { useSession } from './SessionContext'

export interface LitNotes {
  readonly pitches: readonly Pitch[]
  readonly root?: Pitch
}

// A revealed question lights its own two notes; everything else shows the workspace.
export function useLitNotes(): LitNotes {
  const { session } = useSession()
  const { question, revealed } = session.practice
  if (session.mode === 'listen' && revealed && question) return { pitches: question.pitches, root: question.root }
  return { pitches: session.workspace.pitches }
}
