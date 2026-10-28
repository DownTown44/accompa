import type { AudioStatus } from './engine'

export interface ContextGate {
  // Creates the context on first use; reports blocked and returns null when the browser refuses.
  ensureContext(): AudioContext | null
  // Runs the callback once the context is running; reports blocked when it cannot be.
  whenRunning(ctx: AudioContext, callback: () => void): void
  // Bumped by play and stop so a request still waiting on resume cannot start late.
  invalidate(): void
  setBlocked(): void
  status(): AudioStatus
  subscribe(listener: () => void): () => void
}

export function createContextGate(createContext: () => AudioContext): ContextGate {
  let context: AudioContext | null = null
  let status: AudioStatus = 'idle'
  let generation = 0
  const listeners = new Set<() => void>()

  function setStatus(next: AudioStatus) {
    if (next === status) return
    status = next
    listeners.forEach((listener) => listener())
  }

  function refresh() {
    if (context) setStatus(context.state === 'running' ? 'running' : 'blocked')
  }

  return {
    ensureContext() {
      if (context) return context
      try {
        context = createContext()
        context.onstatechange = refresh
        return context
      } catch {
        setStatus('blocked')
        return null
      }
    },
    whenRunning(ctx, callback) {
      const requested = generation
      if (ctx.state === 'running') {
        refresh()
        callback()
        return
      }
      ctx.resume().then(
        () => {
          refresh()
          if (ctx.state === 'running' && requested === generation) callback()
        },
        refresh,
      ).catch(() => setStatus('blocked'))
    },
    invalidate() {
      generation++
    },
    setBlocked: () => setStatus('blocked'),
    status: () => status,
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
