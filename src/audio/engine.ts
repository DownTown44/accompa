import type { Pitch } from '../core/pitch'
import type { Instrument } from '../core/model'

export type PlayMode = 'block' | 'arpeggio' | 'strum'

// idle: no gesture has reached the engine yet. blocked: a context exists but is not running.
export type AudioStatus = 'idle' | 'running' | 'blocked'

export interface AudioEngine {
  // Plays the list as given; an arpeggio sounds the notes in list order, a strum does too but a short spread apart. The engine owns all timing.
  // The instrument names which instrument the notes are for, so an engine may choose its timbre or sample set; the synth ignores it.
  play(pitches: readonly Pitch[], instrument: Instrument, mode: PlayMode): void
  stop(): void
  // Creates or resumes the audio context. Call it synchronously inside a user gesture.
  unlock(): void
  // Tells the engine which instrument is active so it can load that instrument's sounds ahead of the first play. Optional; the synth has none.
  prepare?(instrument: Instrument): void
  status(): AudioStatus
  subscribe(listener: () => void): () => void
}
