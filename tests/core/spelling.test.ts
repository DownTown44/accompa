import { describe, expect, it } from 'vitest'
import { STANDARD_GUITAR_TUNING } from '../../src/core/instruments'
import type { ChordReading } from '../../src/core/chords'
import { CHORD_QUALITIES, INTERVALS } from '../../src/core/theory'
import { interval, pitch, pitchClass } from '../../src/core/pitch'
import { chordSpoken, chordSymbol, noteName, octaveLabel, spellChord, spellInterval, stringNames } from '../../src/core/spelling'

const DOUBLE = /\u{1D12B}|\u{1D12A}|\u266D\u266D|\u266F\u266F/u

describe('octaveLabel', () => {
  it('labels C keys', () => {
    expect(octaveLabel(pitch(48))).toBe('C3')
    expect(octaveLabel(pitch(60))).toBe('C4')
    expect(octaveLabel(pitch(36))).toBe('C2')
    expect(octaveLabel(pitch(72))).toBe('C5')
  })
})

describe('stringNames', () => {
  it('names standard tuning E A D G B e', () => {
    expect(stringNames(STANDARD_GUITAR_TUNING)).toEqual(['E', 'A', 'D', 'G', 'B', 'e'])
  })

  it('follows another tuning', () => {
    expect(stringNames([38, 45, 50, 55, 59, 64].map(pitch))).toEqual(['D', 'A', 'd', 'G', 'B', 'E'])
  })
})

describe('spellInterval', () => {
  const LETTERS = 'CDEFGAB'
  const SIZE: Record<number, number> = { 1: 2, 2: 2, 3: 3, 4: 3, 5: 4, 6: 4, 7: 5, 8: 6, 9: 6, 10: 7, 11: 7, 12: 8 }
  const NATURAL: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
  const SHIFT: Record<string, number> = { '': 0, '♯': 1, '♭': -1 }
  const rows = INTERVALS.flatMap((i) => Array.from({ length: 12 }, (_, root) => [i.semitones, root] as const))
  const letterOf = (name: string) => LETTERS.indexOf(name[0]!)
  const classOf = (name: string) => (((NATURAL[name[0]!]! + SHIFT[name.slice(1)]!) % 12) + 12) % 12

  it.each(rows)('interval %i from pitch class %i', (semitones, root) => {
    const { root: rootName, upper } = spellInterval(pitch(60 + root), interval(semitones))
    if (letterOf(upper) !== (letterOf(rootName) + SIZE[semitones]! - 1) % 7) expect(upper).toBe(noteName(pitch(60 + root + semitones)))
    expect(classOf(upper)).toBe(pitchClass(pitch(60 + root + semitones)))
    expect(classOf(rootName)).toBe(root)
  })

  it('uses the root table', () => {
    const names = Array.from({ length: 12 }, (_, i) => spellInterval(pitch(60 + i), interval(7)).root)
    expect(names).toEqual(['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'])
  })

  it('spells 6 semitones as A4 where that needs no double', () => {
    expect(spellInterval(pitch(60), interval(6)).upper).toBe('F♯')
    expect(spellInterval(pitch(62), interval(6)).upper).toBe('G♯')
  })

  it.each([
    [61, 4, 'C♯', 'E♯'],
    [63, 7, 'E♭', 'B♭'],
    [68, 4, 'A♭', 'C'],
    [60, 3, 'C', 'E♭'],
    [60, 6, 'C', 'F♯'],
    [66, 6, 'F♯', 'B♯'],
    [70, 11, 'B♭', 'A'],
    [62, 8, 'D', 'B♭'],
    [60, 12, 'C', 'C'],
  ])('spells %i plus %i semitones as %s to %s', (root, semitones, from, to) => {
    expect(spellInterval(pitch(root), interval(semitones))).toEqual({ root: from, upper: to })
  })

  it('names the letter-stepped note, except in the two cases that would need a double', () => {
    const FALLBACK = new Map([
      ['1:6', 'G'],
      ['8:1', 'A'],
    ])
    const TABLE = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B']
    let fallbacks = 0
    for (const i of INTERVALS) {
      for (let root = 0; root < 12; root++) {
        const { root: r, upper } = spellInterval(pitch(60 + root), interval(i.semitones))
        expect(r + upper).not.toMatch(DOUBLE)
        const letter = (letterOf(TABLE[root]!) + SIZE[i.semitones]! - 1) % 7
        const offset = ((((root + i.semitones) % 12) - NATURAL[LETTERS[letter]!]! + 18) % 12) - 6
        const expected = FALLBACK.get(`${root}:${i.semitones}`)
        if (expected !== undefined) {
          expect(Math.abs(offset)).toBe(2)
          expect(upper).toBe(expected)
          fallbacks++
        } else {
          expect(upper).toBe(LETTERS[letter]! + (offset === 1 ? '♯' : offset === -1 ? '♭' : ''))
        }
      }
    }
    expect(fallbacks).toBe(2)
  })
})

describe('spellChord and chordSymbol', () => {
  const major = CHORD_QUALITIES[0]!
  const reading = (root: number, name: string, bass?: number): ChordReading => ({
    root: pitchClass(pitch(root)),
    quality: CHORD_QUALITIES.find((q) => q.name === name)!,
    ...(bass === undefined ? {} : { bass: pitchClass(pitch(bass)) }),
  })

  it('spells a flat key root by stepping', () => {
    expect(spellChord({ root: pitchClass(pitch(63)), quality: major })).toEqual(['E♭', 'G', 'B♭'])
  })

  it('spells a sharp key root with the default table', () => {
    expect(spellChord({ root: pitchClass(pitch(66)), quality: major })).toEqual(['F♯', 'A♯', 'C♯'])
  })

  it('respells a root whose default needs a double', () => {
    expect(chordSymbol(reading(63, 'm7b5'))).toBe('D♯m7♭5')
    expect(spellChord(reading(63, 'm7b5'))).toEqual(['D♯', 'F♯', 'A', 'C♯'])
    expect(spellChord(reading(63, 'dim7'))).toEqual(['D♯', 'F♯', 'A', 'C'])
    expect(spellChord(reading(68, 'dim7'))).toEqual(['G♯', 'B', 'D', 'F'])
    expect(spellChord(reading(66, 'augmented'))).toEqual(['G♭', 'B♭', 'D'])
    expect(chordSymbol(reading(66, 'augmented'))).toBe('G♭aug')
    expect(spellChord(reading(61, 'augmented'))).toEqual(['D♭', 'F', 'A'])
    expect(chordSpoken(reading(63, 'm7b5'))).toBe('D♯ m7b5')
  })

  it('gives a tone that still needs a double its table name', () => {
    expect(spellChord(reading(71, 'augmented'))).toEqual(['B', 'D♯', 'G'])
    expect(spellChord(reading(60, 'dim7'))).toEqual(['C', 'E♭', 'G♭', 'A'])
  })

  it('keeps unchanged chords and takes a slash bass from the default table', () => {
    expect(spellChord(reading(60, 'major'))).toEqual(['C', 'E', 'G'])
    expect(spellChord(reading(63, 'major'))).toEqual(['E♭', 'G', 'B♭'])
    expect(spellChord(reading(70, 'min7'))).toEqual(['B♭', 'D♭', 'F', 'A♭'])
    expect(spellChord(reading(66, 'm7b5'))).toEqual(['F♯', 'A', 'C', 'E'])
    expect(chordSymbol(reading(63, 'm7b5', 66))).toBe('D♯m7♭5/F♯')
  })

  it('spells every quality on every root without a double and with the right pitch classes', () => {
    const SHIFT: Record<string, number> = { '': 0, '♯': 1, '♭': -1 }
    const BASE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
    for (let root = 0; root < 12; root++) {
      for (const quality of CHORD_QUALITIES) {
        const tones = spellChord({ root: pitchClass(pitch(root)), quality })
        tones.forEach((tone, i) => {
          expect(tone.slice(1) in SHIFT).toBe(true)
          const sounded = (((BASE[tone[0]!]! + SHIFT[tone.slice(1)]!) % 12) + 12) % 12
          expect(sounded).toBe((root + quality.intervals[i]!) % 12)
        })
        const r = { root: pitchClass(pitch(root)), quality }
        expect(chordSymbol(r) + chordSpoken(r) + tones.join('')).not.toMatch(DOUBLE)
        expect(tones[0]).toBe(chordSymbol(r).slice(0, tones[0]!.length))
      }
    }
  })

  it('names a slash bass from the default table', () => {
    expect(chordSymbol(reading(64, 'augmented', 60))).toBe('Eaug/C')
    expect(chordSymbol(reading(63, 'm7b5', 66))).toBe('D♯m7♭5/F♯')
    expect(chordSpoken(reading(63, 'm7b5', 66))).toBe('D♯ m7b5 over F♯')
    expect(chordSymbol(reading(71, 'augmented', 63))).toBe('Baug/E♭')
    expect(chordSpoken(reading(66, 'augmented', 70))).toBe('G♭ augmented over B♭')
  })

  it('never puts a double accidental in a symbol or spoken name, with or without a bass', () => {
    for (const quality of CHORD_QUALITIES) {
      for (let root = 0; root < 12; root++) {
        for (let bass = -1; bass < 12; bass++) {
          const r: ChordReading = { root: pitchClass(pitch(root)), quality, ...(bass < 0 ? {} : { bass: pitchClass(pitch(bass)) }) }
          expect(chordSymbol(r)).not.toMatch(DOUBLE)
          expect(chordSpoken(r)).not.toMatch(DOUBLE)
        }
      }
    }
  })

  it('keeps a fallback tone only on roots with no twin', () => {
    const kept: string[] = []
    for (const quality of CHORD_QUALITIES) {
      for (let root = 0; root < 12; root++) {
        const tones = spellChord({ root: pitchClass(pitch(root)), quality })
        const base = 'CDEFGAB'.indexOf(tones[0]![0]!)
        if (tones.some((t, i) => t[0] !== 'CDEFGAB'[(base + [0, 2, 4, 6][i]!) % 7])) kept.push(`${quality.name}:${root}`)
      }
    }
    expect(kept).toEqual(['augmented:11', 'dim7:0', 'dim7:5'])
  })

  it('builds symbol strings', () => {
    expect(chordSymbol(reading(60, 'major'))).toBe('C')
    expect(chordSymbol(reading(60, 'm7b5'))).toBe('Cm7♭5')
    expect(chordSymbol(reading(60, 'major', 64))).toBe('C/E')
    expect(chordSymbol(reading(69, 'min7', 60))).toBe('Am7/C')
    expect(chordSymbol(reading(64, 'augmented', 60))).toBe('Eaug/C')
  })
})

describe('chordSpoken', () => {
  const quality = (name: string) => CHORD_QUALITIES.find((q) => q.name === name)!
  it('says root and quality, and the bass of an inversion', () => {
    expect(chordSpoken({ root: pitchClass(pitch(60)), quality: quality('major') })).toBe('C major')
    expect(chordSpoken({ root: pitchClass(pitch(69)), quality: quality('min7'), bass: pitchClass(pitch(60)) })).toBe('A min7 over C')
  })
})
