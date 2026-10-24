import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { offscreenLit, offscreenNote } from '../../core/piano'
import { ENGINES } from '../../audio/engines'
import type { AudioEngine } from '../../audio/engine'
import { EngineProvider } from '../engine/EngineContext'
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

export function Shell() {
  useShortcuts()
  useAudioWake()
  const audio = useAudioStatus()
  const { session } = useSession()
  const { settings } = useSettings()
  const lit = useLitNotes()
  const { undoClear } = useSessionActions()
  const chooseRoot = session.mode === 'listen' && settings.rootMode === 'fixed' && session.practice.fixedRoot === null
  const offscreen = session.instrument === 'piano' ? offscreenNote(offscreenLit(lit.pitches, session.pianoStart)) : undefined
  const undo = session.mode === 'explore' && session.cleared !== null && audio !== 'blocked'
  const message =
    audio === 'blocked' ? 'Press any key to wake the sound.' : chooseRoot ? 'Click a note to set the root.' : undo ? 'Notes cleared.' : offscreen
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
  const engine = useMemo(() => override ?? ENGINES[settings.sound](), [override, settings.sound])
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
