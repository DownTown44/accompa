import type { Pitch } from '../core/pitch'
import type { Instrument } from '../core/model'

export type PlayMode = 'block' | 'arpeggio' | 'strum'

// idle: no gesture has reached the engine yet. blocked: a context exists but is not running.
// loading and failed: only a sampler reports them, while its set decodes or after it could not load.
export type AudioStatus = 'idle' | 'loading' | 'running' | 'blocked' | 'failed'

// Names of the sample sets that failed to load this session, kept outside the engines so a failure survives a rebuild.
export type LoadMemory = Set<string>

export interface AudioEngine {
  // Plays the list as given; an arpeggio sounds the notes in list order, a strum does too but a short spread apart. The engine owns all timing.
  // The instrument names which instrument the notes are for, so an engine may choose its timbre or sample set; the synth ignores it.
  play(pitches: readonly Pitch[], instrument: Instrument, mode: PlayMode): void
  stop(): void
  // Creates or resumes the audio context. Call it synchronously inside a user gesture.
  unlock(): void
  // Tells the engine which instrument is active so it can load that instrument's sounds ahead of the first play. Optional; the synth has none.
  prepare?(instrument: Instrument): void
  // False while the engine's sounds are loading or failed, so the router plays the synth instead. Optional; the synth has none.
  ready?(): boolean
  status(): AudioStatus
  subscribe(listener: () => void): () => void
}
