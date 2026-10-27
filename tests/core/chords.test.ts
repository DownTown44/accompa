import { describe, expect, it } from 'vitest'
import { nameChord } from '../../src/core/chords'
import { pitch } from '../../src/core/pitch'
import { chordSymbol, spellNotes } from '../../src/core/spelling'
import { CHORD_QUALITIES } from '../../src/core/theory'

const names = (midi: number[]) => nameChord(midi.map(pitch)).map(chordSymbol)

describe('nameChord', () => {
  it.each(CHORD_QUALITIES.map((q) => [q.name, q.symbol, q.intervals] as const))('names %s on C', (_n, symbol, stack) => {
    expect(names(stack.map((i) => 60 + i))[0]).toBe(`C${symbol}`)
  })

  it('names inversions as slash chords', () => {
    expect(names([64, 67, 72])[0]).toBe('C/E')
    expect(names([55, 60, 64, 71])[0]).toBe('Cmaj7/G')
  })

  it('lists symmetric sets root position first', () => {
    expect(names([60, 64, 68])).toEqual(['Caug', 'Eaug/C', 'A♭aug/C'])
    expect(names([60, 63, 66, 69])).toEqual(['Cdim7', 'D♯dim7/C', 'F♯dim7/C', 'Adim7/C'])
  })

  it('names an added sixth only as a minor seventh', () => {
    expect(names([60, 64, 67, 69])).toEqual(['Am7/C'])
  })

  it('ignores doubled classes and input order', () => {
    expect(names([60, 64, 67, 72])).toEqual(['C'])
    expect(names([72, 67, 60, 64])).toEqual(['C'])
  })

  it('returns nothing for unknown sets and fewer than three classes', () => {
    expect(nameChord([60, 62, 66].map(pitch))).toEqual([])
    expect(nameChord([60, 64].map(pitch))).toEqual([])
    expect(nameChord([60, 72].map(pitch))).toEqual([])
    expect(nameChord([])).toEqual([])
  })
})

describe('spellNotes', () => {
  it('lists distinct names low to high', () => {
    expect(spellNotes([66, 60, 62].map(pitch))).toEqual(['C', 'D', 'F♯'])
    expect(spellNotes([60, 64].map(pitch))).toEqual(['C', 'E'])
    expect(spellNotes([60, 72].map(pitch))).toEqual(['C'])
    expect(spellNotes([63].map(pitch))).toEqual(['E♭'])
  })
})
