import type { PlayMode } from './engine'

// Seconds. Shared by the synth and the sampler so every sound steps the same way.
export const LEAD_IN = 0.03
export const ARPEGGIO_STEP = 0.55
export const STRUM_SPREAD = 0.04

export const stepFor = (mode: PlayMode) =>
  mode === 'arpeggio' ? ARPEGGIO_STEP : mode === 'strum' ? STRUM_SPREAD : 0
