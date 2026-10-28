import type { Pitch } from '../core/pitch'

export interface SampleNote {
  name: string
  midi: number
}

export interface SampleSet {
  directory: string
  notes: readonly SampleNote[]
}

const NAMES = ['C', 'Ds', 'Fs', 'A'] as const

// C2 Ds2 Fs2 A2 ... A6 C7: every third semitone from MIDI 36 to 96, 21 files.
const pianoNotes: SampleNote[] = []
for (let midi = 36; midi <= 96; midi += 3) {
  const octave = Math.floor(midi / 12) - 1
  pianoNotes.push({ name: `${NAMES[((midi - 36) / 3) % 4]}${octave}`, midi })
}

export const PIANO_SET: SampleSet = { directory: 'piano', notes: pianoNotes }

export interface NearestSample {
  name: string
  // playbackRate that shifts the bundled note to the pitch
  rate: number
}

// The nearest bundled note for a pitch, which is never more than one semitone away; pitches outside the set clamp to its edge note.
export function nearestSample(pitch: Pitch, set: SampleSet = PIANO_SET): NearestSample {
  const lowest = set.notes[0]
  const highest = set.notes[set.notes.length - 1]
  const clamped = Math.min(highest.midi, Math.max(lowest.midi, pitch))
  let best = lowest
  for (const note of set.notes) {
    if (Math.abs(note.midi - clamped) < Math.abs(best.midi - clamped)) best = note
  }
  return { name: best.name, rate: 2 ** ((clamped - best.midi) / 12) }
}

// Same-origin, under the app's base path.
export const sampleUrl = (set: SampleSet, name: string) =>
  `${import.meta.env.BASE_URL}samples/${set.directory}/${name}.mp3`
