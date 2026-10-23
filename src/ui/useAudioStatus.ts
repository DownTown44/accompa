import { useEffect, useSyncExternalStore } from 'react'
import type { AudioStatus } from '../audio/engine'
import { useEngine } from './EngineContext'

export function useAudioStatus(): AudioStatus {
  const engine = useEngine()
  return useSyncExternalStore(engine.subscribe, engine.status)
}

// While audio is blocked, the next key press or click is the gesture that wakes it.
export function useAudioWake() {
  const engine = useEngine()
  const status = useAudioStatus()

  useEffect(() => {
    if (status !== 'blocked') return
    const wake = () => engine.unlock()
    document.addEventListener('keydown', wake)
    document.addEventListener('click', wake)
    return () => {
      document.removeEventListener('keydown', wake)
      document.removeEventListener('click', wake)
    }
  }, [engine, status])
}
