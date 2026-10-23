import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { offscreenLit, offscreenNote } from '../../core/piano'
import { ENGINES } from '../../audio/engines'
import type { AudioEngine } from '../../audio/engine'
import { EngineProvider } from '../engine/EngineContext'
import { GuitarStage } from '../instruments/guitar/GuitarStage'
import { IntervalButtons } from '../listen/IntervalButtons'
import { ListenControls } from '../listen/ListenControls'
import { ListenView } from '../listen/ListenView'
import { ModeStrip } from '../shell/ModeStrip'
import { PianoStage } from '../instruments/piano/PianoStage'
import { SessionProvider, useSession } from '../session/SessionContext'
import { SetupPanel } from '../setup/SetupPanel'
import { SettingsProvider, useSettings } from '../settings/SettingsContext'
import { loadSettings } from '../settings/settingsStorage'
import { StatusNote } from '../shell/StatusNote'
import { useAudioStatus, useAudioWake } from '../engine/useAudioStatus'
import { useLitNotes } from '../session/useLitNotes'
import { useShortcuts } from '../shortcuts/useShortcuts'

export function Shell() {
  useShortcuts()
  useAudioWake()
  const audio = useAudioStatus()
  const { session } = useSession()
  const lit = useLitNotes()
  const offscreen = session.instrument === 'piano' ? offscreenNote(offscreenLit(lit.pitches, session.pianoStart)) : undefined
  return (
    <div className="page">
      <ModeStrip />
      <SetupPanel />
      <main className="body">
        <ListenView />
        <PianoStage />
        <GuitarStage />
        <ListenControls />
        <IntervalButtons />
        <StatusNote message={audio === 'blocked' ? 'Press any key to wake the sound.' : offscreen} />
      </main>
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

export function App({ engine }: { engine?: AudioEngine }) {
  const [initial] = useState(loadSettings)
  return (
    <SettingsProvider initial={initial}>
      <EngineHost override={engine}>
        <SessionProvider>
          <Shell />
        </SessionProvider>
      </EngineHost>
    </SettingsProvider>
  )
}
