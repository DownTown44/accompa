import { useEffect, useState } from 'react'
import { initialPractice } from '../../core/model'
import { offscreenLit, offscreenNote } from '../../core/piano'
import { createSynthEngine } from '../../audio/synth'
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
import { loadPool, savePool } from '../session/poolStorage'
import { initialSession } from '../session/session'
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
  useEffect(() => savePool(session.practice.pool), [session.practice.pool])
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

export function App({ engine }: { engine?: AudioEngine }) {
  const [audio] = useState(() => engine ?? createSynthEngine())
  const [initial] = useState(() => ({ ...initialSession, practice: { ...initialPractice, pool: loadPool() } }))
  return (
    <EngineProvider engine={audio}>
      <SessionProvider initial={initial}>
        <Shell />
      </SessionProvider>
    </EngineProvider>
  )
}
