// Short fixed names for the answer buttons and hints, in CHORD_QUALITIES order (not a chord reading).
const LABELS: Readonly<Record<string, string>> = {
  major: 'Major',
  minor: 'Minor',
  diminished: 'Diminished',
  augmented: 'Augmented',
  maj7: 'Maj7',
  dom7: 'Dom7',
  min7: 'Min7',
  m7b5: 'm7♭5',
  dim7: 'Dim7',
}

export function qualityLabel(name: string): string {
  return LABELS[name] ?? name
}
