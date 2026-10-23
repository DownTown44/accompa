import { createContext, useContext, type ReactNode } from 'react'
import type { AudioEngine } from '../../audio/engine'

const EngineContext = createContext<AudioEngine | null>(null)

export function EngineProvider({ engine, children }: { engine: AudioEngine; children: ReactNode }) {
  return <EngineContext.Provider value={engine}>{children}</EngineContext.Provider>
}

export function useEngine(): AudioEngine {
  const engine = useContext(EngineContext)
  if (!engine) throw new Error('useEngine must be used inside EngineProvider')
  return engine
}
