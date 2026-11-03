import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Instrument } from '../../core/model'
import { beyondFretboard, beyondFretboardNote, leftOutCount } from '../../core/explore'
import { offscreenLit, offscreenNote } from '../../core/piano'
import { createEngine } from '../../audio/engines'
import type { AudioEngine, AudioStatus, LoadMemory } from '../../audio/engine'
import { EngineProvider, useEngine } from '../engine/EngineContext'
import { ExploreControls } from '../explore/ExploreControls'
import { ExploreView } from '../explore/ExploreView'
import { GuitarStage } from '../instruments/guitar/GuitarStage'
import { IntervalButtons } from '../listen/IntervalButtons'
import { ListenControls } from '../listen/ListenControls'
import { ListenView } from '../listen/ListenView'
import { Corner } from '../shell/Corner'
import { ModeStrip } from '../shell/ModeStrip'
import { PianoStage } from '../instruments/piano/PianoStage'
import { SessionProvider, useSession } from '../session/SessionContext'
import type { Session } from '../session/session'
import { SettingsProvider, useSettings } from '../settings/SettingsContext'
import { loadSettings } from '../settings/settingsStorage'
import { StatusNote } from '../shell/StatusNote'
import { useAudioStatus, useAudioWake } from '../engine/useAudioStatus'
import { useLitNotes } from '../session/useLitNotes'
import { useSessionActions } from '../session/useSessionActions'
import { useShortcuts } from '../shortcuts/useShortcuts'

const NO_VOICING_NOTE = 'No voicing fits these notes.'

function loadNote(audio: AudioStatus, instrument: Instrument): string | undefined {
  if (audio === 'loading') return `Loading the ${instrument} sound.`
  if (audio === 'failed') return `The ${instrument} sound did not load. The synthesized sound is playing.`
  return undefined
}

export function Shell() {
  useShortcuts()
  useAudioWake()
  const audio = useAudioStatus()
  const { session } = useSession()
  const { settings } = useSettings()
  const engine = useEngine()
  // The active instrument's sample set loads at startup and on a swap; the other's waits until needed.
  useEffect(() => {
    engine.prepare?.(session.instrument)
  }, [engine, session.instrument])
  const lit = useLitNotes()
  const { undoClear } = useSessionActions()
  const chooseRoot = session.mode === 'listen' && settings.rootMode === 'fixed' && session.practice.fixedRoot === null
  const offscreen =
    session.instrument === 'piano'
      ? offscreenNote(offscreenLit(lit.pitches, session.pianoStart))
      : lit.positions !== undefined
        ? lit.noVoicing
          ? NO_VOICING_NOTE
          : beyondFretboardNote(beyondFretboard(lit.pitches), lit.muted ? 0 : leftOutCount(lit.pitches, session.workspace.positions))
        : undefined
  const loading = loadNote(audio, session.instrument)
  const undo = session.mode === 'explore' && session.cleared !== null && audio !== 'blocked' && loading === undefined
  const message =
    audio === 'blocked'
      ? 'Press any key to wake the sound.'
      : session.rootArmed
        ? 'Click a lit note to set the root.'
        : chooseRoot
          ? 'Click a note to set the root.'
          : (loading ?? (undo ? 'Notes cleared.' : offscreen))
  return (
    <div className="page">
      <ModeStrip />
      <main className="body">
        <ExploreView />
        <ListenView />
        <PianoStage />
        <GuitarStage />
        <ExploreControls />
        <ListenControls />
        <IntervalButtons />
        <StatusNote message={message} action={undo ? { label: 'Undo', onClick: undoClear } : undefined} />
      </main>
      <Corner />
    </div>
  )
}

// The engine follows the chosen sound; replacing it stops whatever the old one was playing.
function EngineHost({ override, children }: { override?: AudioEngine; children: ReactNode }) {
  const { settings } = useSettings()
  // Failed sets are remembered here, outside the engine, so changing Sound does not clear a failure.
  const [memory] = useState<LoadMemory>(() => new Set())
  const engine = useMemo(() => override ?? createEngine(settings.sound, memory), [override, settings.sound, memory])
  useEffect(() => () => engine.stop(), [engine])
  return <EngineProvider engine={engine}>{children}</EngineProvider>
}

export function App({ engine, session }: { engine?: AudioEngine; session?: Session }) {
  const [initial] = useState(loadSettings)
  return (
    <SettingsProvider initial={initial}>
      <EngineHost override={engine}>
        <SessionProvider initial={session}>
          <Shell />
        </SessionProvider>
      </EngineHost>
    </SettingsProvider>
  )
}
