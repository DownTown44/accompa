import { useState } from 'react'
import { createSynthEngine } from '../audio/synth'
import type { AudioEngine } from '../audio/engine'
import { EngineProvider } from './EngineContext'
import { ModeStrip } from './ModeStrip'
import { SessionProvider } from './SessionContext'
import { StatusNote } from './StatusNote'
import { useAudioStatus, useAudioWake } from './useAudioStatus'
import { useShortcuts } from './useShortcuts'

function Shell() {
  useShortcuts()
  useAudioWake()
  const audio = useAudioStatus()
  return (
    <div className="page">
      <ModeStrip />
      <main className="body">
        <StatusNote message={audio === 'blocked' ? 'Press any key to wake the sound.' : undefined} />
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
