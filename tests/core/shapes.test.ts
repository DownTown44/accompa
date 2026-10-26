import { describe, expect, it } from 'vitest'
import { GUITAR_FRETS, pitchAt, STANDARD_GUITAR_TUNING } from '../../src/core/instruments'
import { pitchClass, type PitchClass } from '../../src/core/pitch'
import { SHAPE_TEMPLATES, shapeFrets } from '../../src/core/shapes'
import { CHORD_QUALITIES } from '../../src/core/theory'
import { generateVoicings } from '../../src/core/voicings'

const quality = (name: string) => CHORD_QUALITIES.find((q) => q.name === name)!
const roots = Array.from({ length: 12 }, (_, i) => i as PitchClass)
const text = (frets: readonly (number | null)[]) => frets.map((f) => (f === null ? 'x' : f)).join(' ')

describe('shapeFrets', () => {
  it('has only known qualities and no template for diminished, augmented, m7b5 or dim7', () => {
    for (const t of SHAPE_TEMPLATES) expect(CHORD_QUALITIES.map((q) => q.name)).toContain(t.quality)
    for (const name of ['diminished', 'augmented', 'm7b5', 'dim7']) for (const root of roots) expect(shapeFrets({ root, quality: quality(name) })).toEqual([])
  })

  it('instantiates the named shapes', () => {
    const C = 0 as PitchClass
    const shapes = shapeFrets({ root: C, quality: quality('major') }).map(text)
    expect(shapes).toContain('x 3 2 0 1 0')
    expect(shapes).toContain('8 10 10 9 8 8')
    expect(shapes).toContain('x 3 5 5 5 3')
    expect(shapes).toContain('x x x 5 5 3')
    expect(shapeFrets({ root: 9 as PitchClass, quality: quality('minor') }).map(text)).toContain('x 0 2 2 1 0')
  })

  it('anchors movable shapes on fret 1 to 12 or an octave up, and drops instances off the neck', () => {
    const triad = (root: number) => shapeFrets({ root: root as PitchClass, quality: quality('major') }).filter((f) => f[0] === null && f[1] === null && f[2] === null)
    for (const root of roots) {
      for (const name of CHORD_QUALITIES.map((q) => q.name)) {
        for (const frets of shapeFrets({ root, quality: quality(name) })) {
          const sounding = frets.filter((f): f is number => f !== null)
          for (const f of sounding) expect(f >= 0 && f <= GUITAR_FRETS).toBe(true)
          if (!sounding.includes(0)) {
            const anchor = frets.find((f) => f !== null)!
            expect((anchor >= 1 && anchor <= 12) || (anchor >= 13 && anchor - 12 <= 12 && anchor <= GUITAR_FRETS)).toBe(true)
          }
        }
      }
    }
    // The G, B and high E triad: for G the anchor is fret 12 (`x x x 12 12 10`); its octave copy would pass the neck and is dropped.
    expect(triad(7).map(text)).toEqual(['x x x 12 12 10'])
    // For C the anchor is fret 5 and its octave copy 17 fits.
    expect(triad(0).map(text)).toEqual(['x x x 5 5 3', 'x x x 17 17 15'])
    // For D#/E-flat the anchor is fret 8 and the copy at 20 would put the high E at 18, still on the neck.
    expect(triad(3).map(text)).toEqual(['x x x 8 8 6', 'x x x 20 20 18'])
  })

  it('applies an open shape only to its root', () => {
    expect(shapeFrets({ root: 2 as PitchClass, quality: quality('major') }).map(text)).toContain('x x 0 2 3 2')
    expect(shapeFrets({ root: 1 as PitchClass, quality: quality('major') }).some((f) => f.includes(0))).toBe(false)
  })

  it.each(CHORD_QUALITIES.map((q) => q.name))('every %s template yields exactly the chord pitch classes and is generated', (name) => {
    const q = quality(name)
    for (const root of roots) {
      const generated = new Set(generateVoicings({ root, quality: q }).map((v) => text(v.frets)))
      for (const frets of shapeFrets({ root, quality: q })) {
        const classes = new Set(frets.flatMap((f, s) => (f === null ? [] : [pitchClass(pitchAt(STANDARD_GUITAR_TUNING, s, f))])))
        const chordClasses = q.intervals.map((i) => (root + i) % 12)
        // No extra notes; none missing but the 5th of a seventh chord, which the generator may drop (open C7 `x 3 2 3 1 0` has none).
        for (const c of classes) expect(chordClasses).toContain(c)
        chordClasses.forEach((c, step) => {
          if (step !== 2 || q.intervals.length === 3) expect(classes.has(c as PitchClass)).toBe(true)
        })
        expect(generated.has(text(frets))).toBe(true)
      }
    }
  })
})
