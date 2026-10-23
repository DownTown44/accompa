import { useState } from 'react'
import { offscreenLit, offscreenNote } from '../core/piano'
import { createSynthEngine } from '../audio/synth'
import type { AudioEngine } from '../audio/engine'
import { EngineProvider } from './EngineContext'
import { GuitarStage } from './GuitarStage'
import { ListenControls } from './ListenControls'
import { ListenView } from './ListenView'
import { ModeStrip } from './ModeStrip'
import { PianoStage } from './PianoStage'
import { SessionProvider, useSession } from './SessionContext'
import { StatusNote } from './StatusNote'
import { useAudioStatus, useAudioWake } from './useAudioStatus'
import { useLitNotes } from './useLitNotes'
import { useShortcuts } from './useShortcuts'

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
      <main className="body">
        <ListenView />
        <PianoStage />
        <GuitarStage />
        <ListenControls />
        <StatusNote message={audio === 'blocked' ? 'Press any key to wake the sound.' : offscreen} />
      </main>
    </div>
  )
}

export function App({ engine }: { engine?: AudioEngine }) {
  const [audio] = useState(() => engine ?? createSynthEngine())
  return (
    <EngineProvider engine={audio}>
      <SessionProvider>
        <Shell />
      </SessionProvider>
    </EngineProvider>
  )
}
