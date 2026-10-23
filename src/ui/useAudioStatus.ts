import { useEffect, useSyncExternalStore } from 'react'
import type { AudioStatus } from '../audio/engine'
import { useEngine } from './EngineContext'

export function useAudioStatus(): AudioStatus {
  const engine = useEngine()
  return useSyncExternalStore(engine.subscribe, engine.status)
}

// While audio is blocked, the next key or pointer press is the gesture that wakes it.
export function useAudioWake() {
  const engine = useEngine()
  const status = useAudioStatus()

  useEffect(() => {
    if (status !== 'blocked') return
    const wake = () => engine.unlock()
    document.addEventListener('keydown', wake)
    document.addEventListener('pointerdown', wake)
    return () => {
      document.removeEventListener('keydown', wake)
      document.removeEventListener('pointerdown', wake)
    }
  }, [engine, status])
}
