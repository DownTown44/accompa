import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { AudioStatus } from '../../../src/audio/engine'
import { EngineProvider } from '../../../src/ui/engine/EngineContext'
import { useAudioStatus } from '../../../src/ui/engine/useAudioStatus'
import { createFakeEngine } from '../support/fakeEngine'

describe('useAudioStatus', () => {
  it('returns every status the engine reports', () => {
    const engine = createFakeEngine('idle')
    const { result } = renderHook(() => useAudioStatus(), {
      wrapper: ({ children }) => <EngineProvider engine={engine}>{children}</EngineProvider>,
    })
    expect(result.current).toBe('idle')
    for (const status of ['loading', 'running', 'blocked', 'failed'] as AudioStatus[]) {
      act(() => engine.setStatus(status))
      expect(result.current).toBe(status)
    }
  })
})
