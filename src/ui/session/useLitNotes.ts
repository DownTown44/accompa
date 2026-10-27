import { useMemo } from 'react'
import { exploreReading, isCarried, litPositions, orderedReadings, readingChoice, readingRootedOn, type Role } from '../../core/explore'
import { STANDARD_GUITAR_TUNING, type FretPosition } from '../../core/instruments'
import { pitchClass, type Pitch, type PitchClass } from '../../core/pitch'
import { CHORD_QUALITIES } from '../../core/theory'
import { shapeFrets } from '../../core/shapes'
import { generateVoicings, mean, rankVoicings, VOICING_RULES, voicingPitches, type GuitarVoicing } from '../../core/voicings'
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
  // Explore guitar only: the frets of the shown voicing (the edited ones once edited); a fret click edits these.
  readonly voicingFrets?: readonly (number | null)[]
}

const NO_FRETS: readonly (readonly (number | null)[])[] = []

const ROLE_BY_STEP = ['root', 'third', 'fifth', 'seventh'] as const

interface Ranked {
  readonly list: readonly GuitarVoicing[]
  readonly frets: readonly (readonly (number | null)[])[]
  readonly lead: { readonly root: PitchClass }
  readonly intervals: readonly number[]
}

interface Shown {
  readonly voicing: GuitarVoicing | null
  readonly index: number
  readonly count: number
  readonly frets: readonly (readonly (number | null)[])[]
  readonly roles: readonly Role[]
  // The voicing is the user's hand edit, not a list entry; its index is -1.
  readonly edited: boolean
}

// Every playable voicing of the chord the lit notes read as, best first; undefined unless they form a named chord.
function rankedVoicings(pitches: readonly Pitch[], workspace: Pick<Workspace, 'reading' | 'root'>): Ranked | undefined {
  if (pitches.length < 3) return undefined
  const chosenRoot = workspace.root !== undefined && pitches.includes(workspace.root) ? workspace.root : undefined
  const lead = chosenRoot === undefined ? orderedReadings(pitches, workspace.reading)[0] : readingRootedOn(pitches, chosenRoot)
  if (!lead) return undefined
  const quality = CHORD_QUALITIES.find((q) => q.name === readingChoice(lead).quality)
  if (!quality) return undefined
  const list = rankVoicings(generateVoicings({ root: lead.root, quality, bass: lead.bass }, STANDARD_GUITAR_TUNING, VOICING_RULES), mean(pitches), VOICING_RULES.bucketWidth, shapeFrets({ root: lead.root, quality }))
  return { list, frets: list.map((v) => v.frets), lead, intervals: quality.intervals }
}

// Every component that shows or steps voicings asks for the same list, so the last ranking is kept: it runs once per change, not once per hook.
let lastRanking: { pitches: readonly Pitch[]; reading: Workspace['reading']; root: Workspace['root']; ranked: Ranked | undefined } | undefined

function rankedOnce(pitches: readonly Pitch[], workspace: Pick<Workspace, 'reading' | 'root'>): Ranked | undefined {
  const { reading, root } = workspace
  if (lastRanking && lastRanking.pitches === pitches && lastRanking.reading === reading && lastRanking.root === root) return lastRanking.ranked
  const ranked = rankedVoicings(pitches, workspace)
  lastRanking = { pitches, reading, root, ranked }
  return ranked
}

const sameFrets = (a: readonly (number | null)[], b: readonly (number | null)[]) => a.length === b.length && a.every((f, i) => f === b[i])

// The selected voicing is the list entry with the stored frets, else the best.
function shownOf({ list, frets, lead, intervals }: Ranked, selected: Workspace['voicing']): Shown {
  const found = selected === undefined ? -1 : list.findIndex((v) => sameFrets(v.frets, selected))
  const index = found < 0 ? 0 : found
  const voicing = list[index] ?? null
  const stepOf = (p: Pitch) => intervals.findIndex((i) => i === (pitchClass(p) - lead.root + 12) % 12)
  return {
    voicing,
    index,
    count: list.length,
    frets,
    roles: voicing === null ? [] : voicing.pitches.map((p) => ROLE_BY_STEP[stepOf(p)] ?? 'none'),
    edited: false,
  }
}

// The hand-edited frets as the shown voicing: roles from the namer's reading of the edited pitches, the list the generated voicings of those pitches.
function editedOf(ranked: Ranked | undefined, frets: readonly (number | null)[], workspace: Pick<Workspace, 'pitches' | 'reading' | 'root'>): Shown {
  const sounding = voicingPitches(frets)
  const { roles } = exploreReading(workspace.pitches, workspace.reading, workspace.root)
  return {
    voicing: { pitches: sounding, frets },
    index: -1,
    count: ranked?.list.length ?? 0,
    frets: ranked?.frets ?? NO_FRETS,
    roles: sounding.map((p) => roles[workspace.pitches.indexOf(p)] ?? 'none'),
    edited: true,
  }
}

function useShown(): Shown | undefined {
  const { session } = useSession()
  const { pitches, reading, root, voicing, edited, positions } = session.workspace
  const onGuitar = session.mode === 'explore' && session.instrument === 'guitar'
  // Notes clicked on the guitar stay as clicked: a generated voicing shows only for a chord carried from the piano.
  const carried = isCarried({ pitches, positions })
  const ranked = useMemo(() => (onGuitar ? rankedOnce(pitches, { reading, root }) : undefined), [onGuitar, pitches, reading, root])
  return useMemo(() => {
    if (!onGuitar) return undefined
    if (edited && voicing) return editedOf(ranked, voicing, { pitches, reading, root })
    return ranked && carried ? shownOf(ranked, voicing) : undefined
  }, [onGuitar, ranked, carried, voicing, edited, pitches, reading, root])
}

// The stepper's view of the ranked list: how many voicings there are and which one is shown.
export interface VoicingList {
  readonly count: number
  // -1 while the voicing is edited.
  readonly index: number
  readonly edited: boolean
  // The frets of every voicing, best first.
  readonly frets: readonly (readonly (number | null)[])[]
}

export function useVoicingList(): VoicingList {
  const shown = useShown()
  return useMemo(() => ({ count: shown?.count ?? 0, index: shown?.index ?? 0, edited: shown?.edited ?? false, frets: shown?.frets ?? NO_FRETS }), [shown])
}

// The stepper row shows with two or more voicings, or while the voicing is edited (the arrows are inert without a list).
export const showsStepper = (list: VoicingList): boolean => list.edited || list.count >= 2

export const canStep = (list: VoicingList): boolean => (list.edited ? list.count >= 1 : list.count >= 2)

// A revealed chord question on the guitar: the best-ranked voicing in the question's register, with no stepper.
function useChordReveal(): Shown | undefined {
  const { session } = useSession()
  const { settings } = useSettings()
  const { chordQuestion, chordRevealed } = session.practice
  const active = session.mode === 'listen' && settings.practice === 'chords' && chordRevealed === true && chordQuestion !== undefined && session.instrument === 'guitar'
  return useMemo(() => {
    if (!active || !chordQuestion) return undefined
    const ranked = rankedOnce(chordQuestion.pitches, { root: chordQuestion.root })
    return ranked ? shownOf(ranked, undefined) : { voicing: null, index: 0, count: 0, frets: NO_FRETS, roles: [], edited: false }
  }, [active, chordQuestion])
}

// Listen lights a revealed question or a chosen fixed root, and nothing else; Explore lights its own workspace.
export function useLitNotes(): LitNotes {
  const { session } = useSession()
  const { settings } = useSettings()
  const { question, revealed, fixedRoot } = session.practice
  const { pitches, reading, root: chosenRoot } = session.workspace
  const shown = useShown()
  const chordShown = useChordReveal()
  const { chordQuestion, chordRevealed } = session.practice
  const chords = settings.practice === 'chords'
  if (session.mode === 'listen' && chords && chordRevealed && chordQuestion) {
    const { roles } = exploreReading(chordQuestion.pitches, undefined, chordQuestion.root)
    if (chordShown) return voicingNotes(chordQuestion.pitches, chordQuestion.root, roles, chordShown)
    return { pitches: chordQuestion.pitches, root: chordQuestion.root, roles }
  }
  if (session.mode === 'listen' && !chords && revealed && question) return { pitches: question.pitches, root: question.root }
  if (session.mode === 'listen' && !chords && settings.rootMode === 'fixed' && fixedRoot !== null) return { pitches: [fixedRoot], root: fixedRoot }
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
function voicingNotes(pitches: readonly Pitch[], root: Pitch | undefined, roles: readonly Role[], { voicing, roles: voicingRoles }: Shown): LitNotes {
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
    voicingFrets: voicing.frets,
  }
}
