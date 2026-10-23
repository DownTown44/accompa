import type { Pitch } from './pitch'

// Label for a C key, with C4 = MIDI 60 and C3 = 48.
export const octaveLabel = (p: Pitch): string => `C${Math.floor(p / 12) - 1}`
