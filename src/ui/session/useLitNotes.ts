import { useMemo } from 'react'
import { exploreReading, litPositions, orderedReadings, readingChoice, readingRootedOn, type Role } from '../../core/explore'
import { pitchClass } from '../../core/pitch'
import { STANDARD_GUITAR_TUNING, type FretPosition } from '../../core/instruments'
import type { Pitch } from '../../core/pitch'
import { CHORD_QUALITIES } from '../../core/theory'
import { generateVoicings, mean, rankVoicings, VOICING_RULES, type GuitarVoicing } from '../../core/voicings'
import type { Workspace } from '../../core/model'
import { useSettings } from '../settings/SettingsContext'
import { useSession } from './SessionContext'

export interface LitNotes {
  readonly pitches: readonly Pitch[]
  readonly root?: Pitch
  // Explore only: the exact guitar position of each lit note, and the root's.
  readonly positions?: readonly FretPosition[]
  readonly rootPosition?: FretPosition
  // Explore only: each note's role, aligned with `pitches` (piano) and with `positions` (guitar).
  readonly roles?: readonly Role[]
  readonly positionRoles?: readonly Role[]
  // Explore guitar only: the strings the shown voicing mutes.
  readonly muted?: readonly number[]
  // Explore guitar only: a named chord has no playable voicing, so nothing is placed.
  readonly noVoicing?: boolean
  // Explore guitar only: the shown voicing leaves out the chord's 5th.
  readonly fifthLeftOut?: boolean
}

const ROLE_BY_STEP = ['root', 'third', 'fifth', 'seventh'] as const

interface Shown {
  readonly voicing: GuitarVoicing | null
  readonly roles: readonly Role[]
  readonly fifthLeftOut: boolean
}

// The best-ranked voicing of the chord the lit notes read as; undefined unless they form a named chord.
function bestVoicing(pitches: readonly Pitch[], workspace: Pick<Workspace, 'reading' | 'root'>): Shown | undefined {
  if (pitches.length < 3) return undefined
  const chosenRoot = workspace.root !== undefined && pitches.includes(workspace.root) ? workspace.root : undefined
  const lead = chosenRoot === undefined ? orderedReadings(pitches, workspace.reading)[0] : readingRootedOn(pitches, chosenRoot)
  if (!lead) return undefined
  const quality = CHORD_QUALITIES.find((q) => q.name === readingChoice(lead).quality)
  if (!quality) return undefined
  const ranked = rankVoicings(generateVoicings({ root: lead.root, quality, bass: lead.bass }, STANDARD_GUITAR_TUNING, VOICING_RULES), mean(pitches), VOICING_RULES.bucketWidth)
  const voicing = ranked[0] ?? null
  const stepOf = (p: Pitch) => quality.intervals.findIndex((i) => i === (pitchClass(p) - lead.root + 12) % 12)
  const steps = new Set(voicing?.pitches.map(stepOf))
  return {
    voicing,
    roles: voicing === null ? [] : voicing.pitches.map((p) => ROLE_BY_STEP[stepOf(p)] ?? 'none'),
    fifthLeftOut: voicing !== null && !steps.has(2),
  }
}

// Listen lights a revealed question or a chosen fixed root, and nothing else; Explore lights its own workspace.
export function useLitNotes(): LitNotes {
  const { session } = useSession()
  const { settings } = useSettings()
  const { question, revealed, fixedRoot } = session.practice
  const { pitches, reading, root: chosenRoot } = session.workspace
  const onGuitar = session.mode === 'explore' && session.instrument === 'guitar'
  const shown = useMemo(() => (onGuitar ? bestVoicing(pitches, { reading, root: chosenRoot }) : undefined), [onGuitar, pitches, reading, chosenRoot])
  if (session.mode === 'listen' && revealed && question) return { pitches: question.pitches, root: question.root }
  if (session.mode === 'listen' && settings.rootMode === 'fixed' && fixedRoot !== null) return { pitches: [fixedRoot], root: fixedRoot }
  if (session.mode === 'explore') {
    const { positions } = session.workspace
    const { root, roles } = exploreReading(pitches, reading, chosenRoot)
    if (shown) return voicingNotes(pitches, root, roles, shown)
    const placed = litPositions(pitches, positions)
    return {
      pitches,
      root,
      roles,
      positions: placed.filter((p): p is FretPosition => p !== null),
      positionRoles: roles.filter((_, i) => placed[i] !== null),
      rootPosition: root === undefined ? undefined : (placed[pitches.indexOf(root)] ?? undefined),
    }
  }
  return { pitches: [] }
}

// The lit notes with the guitar side replaced by the shown voicing; the piano side and readout stay on the lit notes.
function voicingNotes(pitches: readonly Pitch[], root: Pitch | undefined, roles: readonly Role[], { voicing, roles: voicingRoles, fifthLeftOut }: Shown): LitNotes {
  if (voicing === null) return { pitches, root, roles, positions: [], positionRoles: [], muted: [], noVoicing: true }
  const sounding = voicing.frets.flatMap((fret, string) => (fret === null ? [] : [{ string, fret }]))
  const byPitch = [...sounding].sort((a, b) => STANDARD_GUITAR_TUNING[a.string]! + a.fret - (STANDARD_GUITAR_TUNING[b.string]! + b.fret))
  const rootPosition = byPitch.find((_, i) => voicingRoles[i] === 'root')
  return {
    pitches,
    root,
    roles,
    positions: byPitch,
    positionRoles: voicingRoles,
    rootPosition,
    muted: voicing.frets.flatMap((fret, string) => (fret === null ? [string] : [])),
    fifthLeftOut,
  }
}
