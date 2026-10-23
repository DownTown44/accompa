import type { Pitch } from '../core/pitch'

export type PlayMode = 'block' | 'arpeggio'

// idle: no gesture has reached the engine yet. blocked: a context exists but is not running.
export type AudioStatus = 'idle' | 'running' | 'blocked'

export interface AudioEngine {
  // Plays the list as given; an arpeggio sounds the notes in list order. The engine owns all timing.
  play(pitches: readonly Pitch[], mode: PlayMode): void
  stop(): void
  // Creates or resumes the audio context. Call it synchronously inside a user gesture.
  unlock(): void
  status(): AudioStatus
  subscribe(listener: () => void): () => void
}
