import { describe, expect, it } from 'vitest'
import { pitchAt, STANDARD_GUITAR_TUNING } from '../../src/core/instruments'
import { pitch, pitchClass, type PitchClass } from '../../src/core/pitch'
import { CHORD_QUALITIES } from '../../src/core/theory'
import { shapeFrets } from '../../src/core/shapes'
import { fingersNeeded, generateVoicings, mean, moveFret, rankVoicings, VOICING_RULES, voicingPitches, type GuitarVoicing } from '../../src/core/voicings'

const quality = (name: string) => CHORD_QUALITIES.find((q) => q.name === name)!
const C = pitchClass(pitch(60))
const chord = (name: string, root: PitchClass = C) => ({ root, quality: quality(name) })
const classesOf = (v: GuitarVoicing) => new Set(v.pitches.map((p) => (pitchClass(p) - C + 12) % 12))
const fretted = (v: GuitarVoicing) => v.frets.filter((f): f is number => f !== null && f > 0)

describe('generateVoicings', () => {
  it.each(CHORD_QUALITIES.map((q) => q.name))('uses only chord tones of %s and drops at most the 5th', (name) => {
    const q = quality(name)
    const all = generateVoicings(chord(name))
    expect(all.length).toBeGreaterThan(0)
    for (const v of all) {
      const classes = classesOf(v)
      for (const c of classes) expect(q.intervals).toContain(c)
      for (const [step, interval] of q.intervals.entries()) if (step !== 2) expect(classes.has(interval)).toBe(true)
      expect(v.frets).toHaveLength(6)
      expect(v.pitches.length).toBe(v.frets.filter((f) => f !== null).length)
      expect([...v.pitches]).toEqual([...v.pitches].sort((a, b) => a - b))
    }
  })

  it.each(CHORD_QUALITIES.map((q) => q.name))('never mutes a string between two sounding strings for %s', (name) => {
    for (const v of generateVoicings(chord(name))) {
      const on = v.frets.map((f, s) => (f === null ? -1 : s)).filter((s) => s >= 0)
      expect(on[on.length - 1]! - on[0]! + 1).toBe(on.length)
    }
  })

  it('keeps fretted notes within the span and ignores open strings in it', () => {
    const all = generateVoicings(chord('major'))
    for (const v of all) {
      const f = fretted(v)
      if (f.length) expect(Math.max(...f) - Math.min(...f)).toBeLessThanOrEqual(VOICING_RULES.maxSpan)
    }
  })

  it.each(CHORD_QUALITIES.map((q) => q.name))('never mixes an open string with a fret above the open position for %s', (name) => {
    for (const v of generateVoicings(chord(name))) {
      if (v.frets.includes(0)) expect(Math.max(...fretted(v), 0)).toBeLessThanOrEqual(VOICING_RULES.openPositionMaxFret)
    }
  })

  it.each(CHORD_QUALITIES.map((q) => q.name))('uses no fret above the limit for %s and always has a voicing', (name) => {
    for (let r = 0; r < 12; r++) {
      const all = generateVoicings(chord(name, r as PitchClass))
      expect(all.length).toBeGreaterThan(0)
      for (const v of all) for (const f of v.frets) expect(f === null || f <= VOICING_RULES.maxFret).toBe(true)
    }
  })

  it('includes open and muted strings and the open C shape', () => {
    const all = generateVoicings(chord('major'))
    expect(all.some((v) => v.frets.includes(0))).toBe(true)
    expect(all.some((v) => v.frets.includes(null))).toBe(true)
    expect(all.some((v) => v.frets.join() === ',3,2,0,1,0')).toBe(true)
  })

  it.each(['major', 'minor', 'diminished', 'augmented'])('keeps root, 3rd and 5th in every %s voicing', (name) => {
    const q = quality(name)
    const all = generateVoicings(chord(name))
    expect(all.length).toBeGreaterThan(0)
    for (const v of all) for (const interval of q.intervals) expect(classesOf(v).has(interval)).toBe(true)
  })

  it.each(['maj7', 'dom7', 'min7', 'm7b5', 'dim7'])('may omit the 5th of a %s but never the root, 3rd or 7th', (name) => {
    const q = quality(name)
    const all = generateVoicings(chord(name))
    expect(all.some((v) => !classesOf(v).has(q.intervals[2]!))).toBe(true)
    for (const v of all) for (const step of [0, 1, 3]) expect(classesOf(v).has(q.intervals[step]!)).toBe(true)
  })

  describe('finger rule', () => {
    const shapes = (name: string) => generateVoicings(chord(name)).map((v) => v.frets.map((f) => (f === null ? 'x' : f)).join(' '))

    it('counts a barre as one finger', () => {
      expect(fingersNeeded([8, 10, 10, 9, 8, 8])).toBe(4)
      expect(fingersNeeded([null, 3, 5, 5, 5, 3])).toBe(4)
      expect(fingersNeeded([null, 3, 2, 0, 1, 0])).toBe(3)
    })

    it('does not count a barre when an open string lies inside it', () => {
      expect(fingersNeeded([3, 2, 3, 0, 3, 3])).toBe(5)
      expect(fingersNeeded([3, null, null, 0, null, 3])).toBe(2)
    })

    it('rejects five fingers and keeps the common C shapes', () => {
      expect(fingersNeeded([8, 7, 5, 5, 8, 8])).toBe(5)
      const c = shapes('major')
      expect(c).toContain('8 10 10 9 8 8')
      expect(c).toContain('x 3 5 5 5 3')
      expect(c).toContain('x 3 2 0 1 0')
      expect(c).not.toContain('8 7 5 5 8 8')
      expect(shapes('dom7')).not.toContain('3 2 3 0 3 3')
    })

    it('needs at most the maximum fingers in every voicing of the nine qualities', () => {
      for (const q of CHORD_QUALITIES) for (const v of generateVoicings(chord(q.name))) expect(fingersNeeded(v.frets)).toBeLessThanOrEqual(VOICING_RULES.maxFingers)
    })
  })

  it('always keeps the 7th on a seventh chord', () => {
    for (const v of generateVoicings(chord('maj7'))) expect(classesOf(v).has(11)).toBe(true)
  })

  it('stays inside a fret range and allows open strings only from fret 0', () => {
    const all = generateVoicings(chord('major'), STANDARD_GUITAR_TUNING, VOICING_RULES, { low: 5, high: 9 })
    expect(all.length).toBeGreaterThan(0)
    for (const v of all) for (const f of v.frets) if (f !== null) expect(f >= 5 && f <= 9).toBe(true)
    const low = generateVoicings(chord('major'), STANDARD_GUITAR_TUNING, VOICING_RULES, { low: 0, high: 3 })
    expect(low.some((v) => v.frets.includes(0))).toBe(true)
  })

  it('returns an empty list when nothing fits', () => {
    expect(generateVoicings(chord('maj7'), STANDARD_GUITAR_TUNING, VOICING_RULES, { low: 5, high: 5 })).toEqual([])
    expect(generateVoicings(chord('major'), STANDARD_GUITAR_TUNING, VOICING_RULES, { low: 9, high: 3 })).toEqual([])
  })

  it('is deterministic', () => {
    expect(generateVoicings(chord('min7'))).toEqual(generateVoicings(chord('min7')))
  })

  it('pitches match the tuning and frets', () => {
    for (const v of generateVoicings(chord('dom7')).slice(0, 50)) {
      const expected = v.frets.flatMap((f, s) => (f === null ? [] : [pitchAt(STANDARD_GUITAR_TUNING, s, f)])).sort((a, b) => a - b)
      expect([...v.pitches]).toEqual(expected)
    }
  })
})

describe('bass note', () => {
  const lowestClass = (v: GuitarVoicing) => pitchClass(v.pitches[0]!)

  it('puts the root in the bass and generates both the open and the barre C', () => {
    const all = generateVoicings(chord('major'))
    for (const v of all) expect(lowestClass(v)).toBe(C)
    const has = (shape: string) => all.some((v) => v.frets.map((f) => (f === null ? 'x' : f)).join(' ') === shape)
    expect(has('x 3 2 0 1 0')).toBe(true)
    expect(has('8 10 10 9 8 8')).toBe(true)
    const source = mean([60, 64, 67].map(pitch))
    const best = rankVoicings(all, source)[0]!
    expect(Math.floor(Math.abs(mean(best.pitches) - source) / VOICING_RULES.bucketWidth)).toBe(0)
  })

  it('puts both C barres in the first register bucket and the open C after them', () => {
    const all = generateVoicings(chord('major'))
    const shape = (v: GuitarVoicing) => v.frets.map((f) => (f === null ? 'x' : f)).join(' ')
    const source = mean([60, 64, 67].map(pitch))
    const bucket = (shapeName: string) => {
      const v = all.find((x) => shape(x) === shapeName)!
      expect(v).toBeDefined()
      return Math.floor(Math.abs(mean(v.pitches) - source) / VOICING_RULES.bucketWidth)
    }
    expect(bucket('x 3 5 5 5 3')).toBe(0)
    expect(bucket('8 10 10 9 8 8')).toBe(0)
    expect(bucket('x 3 2 0 1 0')).toBeGreaterThan(0)
    const ranked = rankVoicings(all, source).map(shape)
    expect(ranked.indexOf('x 3 2 0 1 0')).toBeGreaterThan(ranked.indexOf('x 3 5 5 5 3'))
    expect(ranked.indexOf('x 3 2 0 1 0')).toBeGreaterThan(ranked.indexOf('8 10 10 9 8 8'))
  })

  it('ranks a first-bucket voicing first, and the nearer one first when the shape ties', () => {
    const all = generateVoicings(chord('major'))
    const source = mean([60, 64, 67].map(pitch))
    expect(Math.floor(Math.abs(mean(rankVoicings(all, source)[0]!.pitches) - source) / VOICING_RULES.bucketWidth)).toBe(0)
    const a: GuitarVoicing = { frets: [null, null, null, 7, 7, 0], pitches: [62, 66, 64].map(pitch) }
    const b: GuitarVoicing = { frets: [null, null, null, 5, 5, 0], pitches: [60, 64, 64].map(pitch) }
    expect(rankVoicings([a, b], 58, 1000)[0]).toBe(b)
    expect(rankVoicings([a, b], 68, 1000)[0]).toBe(a)
  })

  it('inside a bucket, more sounding strings rank first', () => {
    const v = (...frets: (number | null)[]): GuitarVoicing => ({ frets, pitches: frets.flatMap((f, s) => (f === null ? [] : [pitchAt(STANDARD_GUITAR_TUNING, s, f)])).sort((a, b) => a - b) })
    const six = v(8, 10, 10, 9, 8, 8)
    const three = v(null, null, null, 5, 5, 0)
    expect(rankVoicings([three, six], 60, 1000)[0]).toBe(six)
    expect(rankVoicings([six, three], 60, 1000)[0]).toBe(six)
  })

  it('inside a bucket, a smaller span ranks first, then fewer distinct frets', () => {
    const v = (...frets: (number | null)[]): GuitarVoicing => ({ frets, pitches: frets.flatMap((f, s) => (f === null ? [] : [pitchAt(STANDARD_GUITAR_TUNING, s, f)])).sort((a, b) => a - b) })
    const wide = v(null, 3, 5, 7, 5, 3)
    const narrow = v(null, 3, 2, 0, 1, 0)
    const spread = v(null, 3, 5, 5, 4, 3)
    const barre = v(null, 3, 5, 5, 5, 3)
    // A huge bucket puts them all together, so only the playability keys decide.
    expect(rankVoicings([wide, narrow], 60, 1000)[0]).toBe(narrow)
    expect(rankVoicings([spread, barre], 60, 1000)[0]).toBe(barre)
    expect(rankVoicings([barre, spread], 60, 1000)[0]).toBe(barre)
  })

  it('puts the slash bass lowest', () => {
    const all = generateVoicings({ ...chord('major'), bass: pitchClass(pitch(64)) })
    expect(all.length).toBeGreaterThan(0)
    for (const v of all) expect(lowestClass(v)).toBe(pitchClass(pitch(64)))
  })

  it('lets another note be lowest when no voicing has the bass, without throwing', () => {
    const all = generateVoicings(chord('major'), STANDARD_GUITAR_TUNING, VOICING_RULES, { low: 5, high: 12 })
    expect(all.length).toBeGreaterThan(0)
    const none = generateVoicings({ ...chord('major'), bass: pitchClass(pitch(61)) })
    expect(none.length).toBeGreaterThan(0)
    expect(none.every((v) => lowestClass(v) !== pitchClass(pitch(61)))).toBe(true)
  })
})

describe('rankVoicings', () => {
  const all = generateVoicings(chord('major'))
  const first = (source: number) => rankVoicings(all, source, VOICING_RULES.bucketWidth)[0]!

  it('puts voicings near a high source first, and near a low one first', () => {
    expect(mean(first(76).pitches)).toBeGreaterThan(mean(first(52).pitches))
    expect(first(76).frets.every((f) => f === null || f <= VOICING_RULES.maxFret)).toBe(true)
    expect(Math.abs(mean(first(52).pitches) - 52)).toBeLessThan(VOICING_RULES.bucketWidth)
  })

  it('keeps generator order for equal distances and does not change the input', () => {
    const copy = [...all]
    const twice = [...all.slice(0, 5), ...all.slice(0, 5)]
    const ranked = rankVoicings(twice, 60)
    for (let i = 0; i < ranked.length - 1; i++) {
      if (mean(ranked[i]!.pitches) === mean(ranked[i + 1]!.pitches)) expect(twice.indexOf(ranked[i]!)).toBeLessThanOrEqual(twice.indexOf(ranked[i + 1]!))
    }
    expect(all).toEqual(copy)
  })
})

describe('rankVoicings with common shapes', () => {
  const fretText = (frets: readonly (number | null)[]) => frets.map((f) => (f === null ? 'x' : f)).join(' ')
  const text = (v: GuitarVoicing) => fretText(v.frets)
  const rank = (name: string, source: number, root: PitchClass = C, withShapes = true) => {
    const q = quality(name)
    return rankVoicings(generateVoicings({ root, quality: q }), source, VOICING_RULES.bucketWidth, withShapes ? shapeFrets({ root, quality: q }) : []).map(text)
  }
  const A = 9 as PitchClass
  const v = (...frets: (number | null)[]): GuitarVoicing => ({ frets, pitches: frets.flatMap((f, s) => (f === null ? [] : [pitchAt(STANDARD_GUITAR_TUNING, s, f)])).sort((a, b) => a - b) })

  it('ranks the open C first in the low register, where unshaped ranking picks another', () => {
    const source = mean([48, 52, 55])
    expect(rank('major', source)[0]).toBe('x 3 2 0 1 0')
    expect(rank('major', source, C, false)[0]).toBe('x 3 5 0 5 0')
  })

  it('still ranks the E-shape barre first for C4 E4 G4', () => {
    expect(rank('major', mean([60, 64, 67]))[0]).toBe('8 10 10 9 8 8')
  })

  it('does not rank the open C first in a higher register, but a movable shape', () => {
    const ranked = rank('major', mean([72, 76, 79]))
    expect(ranked[0]).not.toBe('x 3 2 0 1 0')
    expect(ranked[0]).toBe('x x 10 9 8 8')
  })

  it('ranks the open A minor first where unshaped ranking picks another', () => {
    const source = mean([48, 51, 55])
    expect(rank('minor', source, A)[0]).toBe('x 0 2 2 1 0')
    expect(rank('minor', source, A, false)[0]).toBe('5 0 2 5 5 0')
  })

  it('ranks a match ahead of a six-string non-match in the same bucket', () => {
    const match = v(null, 3, 5, 5, 5, 3)
    const other = v(8, 10, 10, 9, 8, 8)
    expect(rankVoicings([other, match], 60, 1000, [match.frets])[0]).toBe(match)
    expect(rankVoicings([other, match], 60, 1000)[0]).toBe(other)
  })

  it('counts an open shape as a match only in bucket 0', () => {
    const open = v(null, 3, 2, 0, 1, 0)
    // Same bucket 1, and the non-match is ahead on every later key (more strings, smaller span).
    const other = v(3, 2, 0, 0, 0, 3)
    const far = (open.pitches.reduce((a, b) => a + b, 0) / open.pitches.length) + 8
    const bucket = (x: GuitarVoicing) => Math.floor(Math.abs(mean(x.pitches) - far) / 6)
    expect(bucket(open)).toBe(bucket(other))
    expect(bucket(open)).toBeGreaterThan(0)
    expect(rankVoicings([open, other], far, 6, [open.frets])[0]).toBe(other)
    // Near the open shape, in bucket 0, the match wins.
    const near = mean(open.pitches)
    expect(rankVoicings([other, open], near, 6, [open.frets])[0]).toBe(open)
  })

  it('keeps the unshaped order for a quality with no templates', () => {
    for (const name of ['diminished', 'augmented', 'm7b5', 'dim7']) {
      const q = quality(name)
      const all = generateVoicings({ root: C, quality: q })
      expect(rankVoicings(all, 60, 6, shapeFrets({ root: C, quality: q }))).toEqual(rankVoicings(all, 60, 6))
    }
  })

  it('ranks the A-shape barre first for C7 in the low register, where unshaped ranking picks another', () => {
    const source = mean([48, 52, 55, 58])
    expect(rank('dom7', source)[0]).toBe('x 3 5 3 5 3')
    expect(rank('dom7', source, C, false)[0]).toBe('8 7 5 5 5 6')
  })
})

describe('moveFret', () => {
  it('moves one string, mutes with null, and leaves the input and other strings alone', () => {
    const frets = [null, 3, 2, 0, 1, 0]
    expect(moveFret(frets, 4, 3)).toEqual([null, 3, 2, 0, 3, 0])
    expect(moveFret(frets, 1, null)).toEqual([null, null, 2, 0, 1, 0])
    expect(moveFret(frets, 0, 0)).toEqual([0, 3, 2, 0, 1, 0])
    expect(frets).toEqual([null, 3, 2, 0, 1, 0])
  })
})

describe('voicingPitches', () => {
  it('lists the sounding pitches bass to treble, muted strings silent', () => {
    expect(voicingPitches([null, 3, 2, 0, 1, 0])).toEqual([48, 52, 55, 60, 64])
  })

  it('keeps a doubled pitch and sorts by pitch', () => {
    expect(voicingPitches([0, 7, null, null, null, 0])).toEqual([40, 52, 64])
    expect(voicingPitches([null, 7, null, null, null, 3])).toEqual([52, 67])
    expect(voicingPitches([null, null, 5, null, 5, null])).toEqual([55, 64])
    expect(voicingPitches([null, null, null, null, null, null])).toEqual([])
  })

  it('takes the tuning as a parameter', () => {
    expect(voicingPitches([0, null, null, null, null, 0], [38, 45, 50, 55, 59, 64].map(pitch))).toEqual([38, 64])
  })
})
