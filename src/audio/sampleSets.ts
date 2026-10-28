import type { Pitch } from '../core/pitch'

export interface SampleNote {
  name: string
  midi: number
}

export interface SampleSet {
  directory: string
  notes: readonly SampleNote[]
  // file extension without the dot, as published
  extension: string
  // per-note gain before dividing by the square root of the note count; a starting value that Apor tunes by ear
  gain: number
  // the pitches the set serves; pitches outside clamp to it. Defaults to the lowest and highest note.
  range?: readonly [number, number]
}

const NAMES = ['C', 'Ds', 'Fs', 'A'] as const

// C2 Ds2 Fs2 A2 ... A6 C7: every third semitone from MIDI 36 to 96, 21 files.
const pianoNotes: SampleNote[] = []
for (let midi = 36; midi <= 96; midi += 3) {
  const octave = Math.floor(midi / 12) - 1
  pianoNotes.push({ name: `${NAMES[((midi - 36) / 3) % 4]}${octave}`, midi })
}

export const PIANO_SET: SampleSet = { directory: 'piano', notes: pianoNotes, extension: 'mp3', gain: 0.8 }

// FreePats Spanish classical guitar, 18 files; `#` is `s` in file names so URLs stay valid.
const guitarNotes: SampleNote[] = [
  ['F2', 41], ['G2', 43], ['A2', 45], ['B2', 47], ['D3', 50], ['F3', 53], ['Gs3', 56], ['B3', 59], ['D4', 62],
  ['F4', 65], ['G4', 67], ['As4', 70], ['C5', 72], ['Ds5', 75], ['Fs5', 78], ['Gs5', 80], ['B5', 83], ['C6', 84],
].map(([name, midi]) => ({ name: name as string, midi: midi as number }))

export const GUITAR_SET: SampleSet = { directory: 'guitar', notes: guitarNotes, extension: 'flac', gain: 0.8, range: [40, 86] }

export interface NearestSample {
  name: string
  // playbackRate that shifts the bundled note to the pitch
  rate: number
}

// The nearest bundled note for a pitch, which is at most one semitone away within the piano's range (the guitar set's top two pitches shift further), with a tie going to the lower note; pitches outside the set's range clamp to its edge.
export function nearestSample(pitch: Pitch, set: SampleSet = PIANO_SET): NearestSample {
  const lowest = set.notes[0]
  const highest = set.notes[set.notes.length - 1]
  const [low, high] = set.range ?? [lowest.midi, highest.midi]
  const clamped = Math.min(high, Math.max(low, pitch))
  let best = lowest
  for (const note of set.notes) {
    if (Math.abs(note.midi - clamped) < Math.abs(best.midi - clamped)) best = note
  }
  return { name: best.name, rate: 2 ** ((clamped - best.midi) / 12) }
}

// Same-origin, under the app's base path.
export const sampleUrl = (set: SampleSet, name: string) =>
  `${import.meta.env.BASE_URL}samples/${set.directory}/${name}.${set.extension}`
