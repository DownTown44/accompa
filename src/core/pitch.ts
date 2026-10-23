export type Pitch = number & { readonly __brand: 'Pitch' }
export type PitchClass = number & { readonly __brand: 'PitchClass' }

export const pitch = (midi: number): Pitch => midi as Pitch

export const pitchClass = (p: Pitch): PitchClass => (((p % 12) + 12) % 12) as PitchClass
