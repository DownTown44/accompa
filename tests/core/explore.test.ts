import { describe, expect, it } from 'vitest'
import { beyondFretboard, beyondFretboardNote, exploreReading, exploreReadout, leftOutCount, litPositions, MAX_LIT, pairInterval, pitchesOnString, placeLit, readingRootedOn, sameChoice, toggleLit } from '../../src/core/explore'
import { STANDARD_GUITAR_TUNING } from '../../src/core/instruments'
import { pitch, pitchClass } from '../../src/core/pitch'

const p = pitch

describe('toggleLit', () => {
  it('lights a pitch at the end and unlights a lit one', () => {
    expect(toggleLit([p(60)], p(67))).toEqual([60, 67])
    expect(toggleLit([p(60), p(67)], p(60))).toEqual([67])
  })

  it('keeps a third note and drops the oldest only past the cap', () => {
    expect(MAX_LIT).toBe(8)
    expect(toggleLit([p(60), p(67)], p(64))).toEqual([60, 67, 64])
    const full = [60, 61, 62, 63, 64, 65, 66, 67].map(p)
    expect(toggleLit(full, p(68))).toEqual([61, 62, 63, 64, 65, 66, 67, 68])
  })
})

describe('pairInterval', () => {
  it.each([
    [60, 67, 'P5'],
    [67, 60, 'P5'],
    [60, 66, 'A4'],
    [66, 60, 'A4'],
    [60, 64, 'M3'],
    [60, 76, 'M3'],
    [60, 72, 'P8'],
    [60, 84, 'P8'],
    [60, 63, 'm3'],
    [48, 83, 'M7'],
  ])('names %i and %i as %s', (a, b, name) => {
    expect(pairInterval(p(a), p(b))?.abbreviation).toBe(name)
  })

  it('has no name for a repeated pitch', () => {
    expect(pairInterval(p(60), p(60))).toBeNull()
  })
})

describe('exploreReadout', () => {
  it('is empty with nothing lit', () => expect(exploreReadout([])).toBeNull())
  it('names one note without an octave', () => expect(exploreReadout([p(63)])).toEqual({ label: 'E♭' }))
  it('names the pair', () => expect(exploreReadout([p(67), p(60)])).toEqual({ label: 'P5', name: 'perfect fifth' }))
})

describe('exploreReadout for three or more', () => {
  const label = (...n: number[]) => exploreReadout(n.map(p))
  it('names a triad in any order', () => {
    expect(label(64, 60, 67)).toEqual({ label: 'C', name: 'C major' })
  })
  it('names an inversion with the bass', () => {
    expect(label(64, 67, 72)).toEqual({ label: 'C/E', name: 'C major over E' })
  })
  it('names a seventh', () => expect(label(60, 64, 67, 71)).toEqual({ label: 'Cmaj7', name: 'C maj7' }))
  it('lists notes low to high when no chord fits', () => {
    expect(label(66, 60, 62)).toEqual({ label: 'C D F♯' })
  })
  it('lists two pitch classes instead of an interval', () => {
    expect(label(60, 64, 72)).toEqual({ label: 'C E' })
  })
  it.each([
    [[60, 64, 67], 'C'],
    [[60, 63, 67], 'Cm'],
    [[60, 63, 66], 'Cdim'],
    [[60, 64, 68], 'Caug'],
    [[60, 64, 67, 71], 'Cmaj7'],
    [[60, 64, 67, 70], 'C7'],
    [[60, 63, 67, 70], 'Cm7'],
    [[60, 63, 66, 70], 'Cm7♭5'],
    [[60, 63, 66, 69], 'Cdim7'],
  ])('reads %j as %s', (notes, symbol) => {
    expect(label(...notes)?.label).toBe(symbol)
  })
})

describe('litPositions', () => {
  it('uses a remembered position', () => {
    expect(litPositions([p(64)], { 64: { string: 4, fret: 5 } })).toEqual([{ string: 4, fret: 5 }])
  })

  it('falls back to the lowest fret for one pitch', () => {
    expect(litPositions([p(64)], {})).toEqual([{ string: 5, fret: 0 }])
  })

  it('puts two notes with no remembered position on different strings', () => {
    const [a, b] = litPositions([p(59), p(60)], {})
    expect(a!.string).not.toBe(b!.string)
  })

  it('keeps a remembered position and puts the other pitch at its lowest fret', () => {
    expect(litPositions([p(64), p(67)], { 64: { string: 4, fret: 5 } })).toEqual([
      { string: 4, fret: 5 },
      { string: 5, fret: 3 },
    ])
  })

  it('has no position for a pitch the guitar cannot play', () => {
    expect(litPositions([p(96)], {})).toEqual([null])
  })
})

describe('beyondFretboard', () => {
  it('counts none when every note has a place', () => {
    expect(beyondFretboard([])).toBe(0)
    expect(beyondFretboard([p(60), p(67)])).toBe(0)
  })

  it('counts one or two notes beyond the fretboard', () => {
    expect(beyondFretboard([p(90)])).toBe(1)
    expect(beyondFretboard([p(90), p(93)])).toBe(2)
  })

  it('counts only the notes beyond when the other is in range', () => {
    expect(beyondFretboard([p(60), p(90)])).toBe(1)
    expect(beyondFretboard([p(30), p(60)])).toBe(1)
  })
})

describe('beyondFretboardNote', () => {
  it('words one and two, and says nothing for none', () => {
    expect(beyondFretboardNote(0)).toBeUndefined()
    expect(beyondFretboardNote(1)).toBe('1 note lit beyond the fretboard')
    expect(beyondFretboardNote(2)).toBe('2 notes lit beyond the fretboard')
  })

  it('words left-out notes alone and with beyond notes', () => {
    expect(beyondFretboardNote(0, 1)).toBe('1 note left out: one note per string')
    expect(beyondFretboardNote(0, 2)).toBe('2 notes left out: one note per string')
    expect(beyondFretboardNote(1, 1)).toBe('1 note lit beyond the fretboard, 1 left out')
    expect(beyondFretboardNote(2, 1)).toBe('2 notes lit beyond the fretboard, 1 left out')
  })
})

describe('exploreReading', () => {
  const read = (...n: number[]) => exploreReading(n.map(p))
  const legend = (...n: number[]) => read(...n).legend.map((e) => (e.degree ? `${e.label} ${e.note} (${e.degree})` : `${e.label} ${e.note}`))

  it('is empty for no notes', () => {
    expect(read()).toEqual({ readout: null, roles: [], legend: [], readings: [], alternatives: [] })
  })

  it('gives a triad and a seventh their roles and legend', () => {
    expect(read(60, 64, 67).roles).toEqual(['root', 'third', 'fifth'])
    expect(legend(60, 64, 67)).toEqual(['root C', '3rd E (M3)', '5th G (P5)'])
    expect(read(60, 64, 67, 71).roles).toEqual(['root', 'third', 'fifth', 'seventh'])
    expect(legend(60, 64, 67, 71)).toEqual(['root C', '3rd E (M3)', '5th G (P5)', '7th B (M7)'])
  })

  it('spells a flat third and a diminished fifth', () => {
    expect(legend(60, 63, 66)).toEqual(['root C', '3rd E♭ (m3)', '5th G♭ (d5)'])
    expect(legend(60, 63, 66, 69)[3]).toBe('7th B𝄫 (d7)')
    expect(legend(60, 64, 68)[2]).toBe('5th G♯ (A5)')
    expect(legend(60, 64, 67, 70)[3]).toBe('7th B♭ (m7)')
  })

  it('roots an inversion on the reading root and a doubled root twice', () => {
    const inv = read(64, 67, 72)
    expect(inv.root).toBe(72)
    expect(inv.roles).toEqual(['third', 'fifth', 'root'])
    expect(legend(64, 67, 72)).toEqual(['root C', '3rd E (M3)', '5th G (P5)'])
    expect(read(60, 64, 67, 72).roles).toEqual(['root', 'third', 'fifth', 'root'])
    expect(read(55, 60, 64, 67, 76).root).toBe(60)
  })

  it('roots Am7/C on A', () => {
    const r = read(60, 64, 67, 69)
    expect(r.root).toBe(69)
    expect(r.roles).toEqual(['third', 'fifth', 'seventh', 'root'])
  })

  it('marks only the lowest for an unknown set, a pair and one note', () => {
    expect(read(62, 60, 66)).toMatchObject({ root: 60, roles: ['none', 'root', 'none'] })
    expect(legend(62, 60, 66)).toEqual(['root C'])
    expect(read(60, 67).roles).toEqual(['root', 'none'])
    expect(legend(60, 67)).toEqual(['root C'])
    expect(read(60, 72).roles).toEqual(['root', 'none'])
    expect(read(60).roles).toEqual(['root'])
  })
})

describe('chosen reading', () => {
  const dim7 = [60, 63, 66, 69].map(p)
  const aug = [60, 64, 68].map(p)

  it('lists the alternatives in namer order after the first reading', () => {
    const { readings, alternatives, readout } = exploreReading(dim7)
    expect(readings.map((r) => r.symbol)).toEqual(['Cdim7', 'E♭dim7/C', 'F♯dim7/C', 'Adim7/C'])
    expect(alternatives.map((r) => r.symbol)).toEqual(['E♭dim7/C', 'F♯dim7/C', 'Adim7/C'])
    expect(readout?.label).toBe('Cdim7')
    expect(exploreReading(aug).alternatives).toHaveLength(2)
  })

  it('has no alternatives for one reading, a pair or an unknown set', () => {
    expect(exploreReading([60, 64, 67].map(p)).alternatives).toEqual([])
    expect(exploreReading([60, 67].map(p)).readings).toEqual([])
    expect(exploreReading([60, 62, 66].map(p)).alternatives).toEqual([])
  })

  it('moves readout, root, roles, legend and spelling to the chosen reading', () => {
    const chosen = exploreReading(dim7).alternatives[2]!.choice
    const r = exploreReading(dim7, chosen)
    expect(r.readout).toEqual({ label: 'Adim7/C', name: 'A dim7 over C' })
    expect(r.root).toBe(69)
    expect(r.roles).toEqual(['third', 'fifth', 'seventh', 'root'])
    expect(r.legend.map((e) => `${e.label} ${e.note} ${e.degree ?? ''}`.trim())).toEqual(['root A', '3rd C m3', '5th E♭ d5', '7th G♭ d7'])
    expect(r.readings.map((x) => x.symbol)).toEqual(['Adim7/C', 'Cdim7', 'E♭dim7/C', 'F♯dim7/C'])
  })

  it('falls back to the first reading when the chosen one is gone', () => {
    const chosen = exploreReading(dim7).alternatives[0]!.choice
    expect(exploreReading([60, 64, 67].map(p), chosen).readout?.label).toBe('C')
    expect(exploreReading([60, 64, 68].map(p), { root: pitchClass(pitch(9)), quality: 'dim7' }).readout?.label).toBe('Caug')
  })

  it('treats choosing the first reading like any other', () => {
    const first = exploreReading(dim7).readings[0]!.choice
    expect(exploreReading(dim7, first)).toEqual(exploreReading(dim7))
  })
})

describe('exploreReading with a chosen root', () => {
  const notes = (...n: number[]) => n.map(p)

  it('roots a reading on the chosen pitch and marks it', () => {
    const r = exploreReading(notes(60, 63, 66, 69), undefined, p(66))
    expect(r.readout?.label).toBe('F♯dim7/C')
    expect(r.root).toBe(66)
    expect(r.roles).toEqual(['fifth', 'seventh', 'root', 'third'])
    expect(r.legend[0]).toEqual({ role: 'root', label: 'root', note: 'F♯' })
  })

  it('reads as unknown when the root roots no reading, listing every reading', () => {
    const r = exploreReading(notes(60, 64, 67, 71), undefined, p(64))
    expect(r.readout?.label).toBe('C E G B')
    expect(r.root).toBe(64)
    expect(r.roles).toEqual(['none', 'root', 'none', 'none'])
    expect(r.legend).toEqual([{ role: 'root', label: 'root', note: 'E' }])
    expect(r.alternatives.map((o) => o.symbol)).toEqual(['Cmaj7'])
    expect(r.readings).toEqual(r.alternatives)
  })

  it('wins over the reading choice and ignores a root that is not lit', () => {
    const choice = { root: pitchClass(p(69)), quality: 'dim7' }
    expect(exploreReading(notes(60, 63, 66, 69), choice, p(63)).readout?.label).toBe('E♭dim7/C')
    expect(exploreReading(notes(60, 63, 66, 69), choice, p(72))).toEqual(exploreReading(notes(60, 63, 66, 69), choice))
  })

  it('keeps the root through added notes and lists the other aug readings', () => {
    expect(exploreReading(notes(64, 67, 71, 74), undefined, p(64)).readout?.label).toBe('Em7')
    const aug = exploreReading(notes(60, 64, 68), undefined, p(64))
    expect(aug.root).toBe(64)
    expect(aug.alternatives).toHaveLength(2)
  })

  it('with one or two lit notes keeps the readout and moves the root marker and legend', () => {
    const one = exploreReading(notes(60), undefined, p(60))
    expect(one.readout?.label).toBe('C')
    const two = exploreReading(notes(60, 67), undefined, p(67))
    expect(two.readout?.label).toBe('P5')
    expect(two.root).toBe(67)
    expect(two.roles).toEqual(['none', 'root'])
    expect(two.legend).toEqual([{ role: 'root', label: 'root', note: 'G' }])
    expect(two.alternatives).toEqual([])
  })
})

describe('sameChoice', () => {
  it('is true for equal root and quality, false when either differs', () => {
    expect(sameChoice({ root: pitchClass(p(57)), quality: 'min7' }, { root: pitchClass(p(57)), quality: 'min7' })).toBe(true)
    expect(sameChoice({ root: pitchClass(p(57)), quality: 'min7' }, { root: pitchClass(p(60)), quality: 'min7' })).toBe(false)
    expect(sameChoice({ root: pitchClass(p(57)), quality: 'min7' }, { root: pitchClass(p(57)), quality: 'dom7' })).toBe(false)
  })
})

describe('readingRootedOn', () => {
  it('returns the reading rooted on the pitch class, or undefined', () => {
    const lit = [57, 60, 64, 67].map(p)
    expect(readingRootedOn(lit, p(57))?.root).toBe(pitchClass(p(57)))
    expect(readingRootedOn(lit, p(57))?.quality.name).toBe('min7')
    expect(readingRootedOn(lit, p(62))).toBeUndefined()
  })
})

describe('pitchesOnString', () => {
  it('lists the lit pitches shown on the string, by remembered or default position', () => {
    const remembered = { 60: { string: 3, fret: 5 } }
    expect(pitchesOnString([pitch(60), pitch(64)], remembered, 3)).toEqual([60])
    expect(pitchesOnString([pitch(60), pitch(64)], remembered, 5)).toEqual([64])
    expect(pitchesOnString([pitch(60)], remembered, 0)).toEqual([])
  })

  it('gives no string to a note beyond the fretboard', () => {
    for (let s = 0; s < 6; s++) expect(pitchesOnString([pitch(30)], {}, s)).toEqual([])
  })
})

describe('placeLit', () => {
  const strings = (lit: number[], remembered = {}) => placeLit(lit.map(p), remembered).positions.map((x) => x?.string)

  it('gives B3 and C4 their own strings', () => {
    const { positions, leftOut } = placeLit([p(59), p(60)], {})
    expect(positions[0]!.string).not.toBe(positions[1]!.string)
    expect(leftOut).toEqual([])
  })

  it('leaves out the higher of two notes that only sound on string 0', () => {
    const { positions, leftOut } = placeLit([p(40), p(41)], {})
    expect(positions).toEqual([{ string: 0, fret: 0 }, null])
    expect(leftOut).toEqual([41])
    expect(leftOutCount([p(40), p(41)], {})).toBe(1)
  })

  it('keeps remembered positions when free', () => {
    const remembered = { 60: { string: 3, fret: 5 }, 64: { string: 5, fret: 0 } }
    expect(placeLit([p(60), p(64)], remembered).positions).toEqual([{ string: 3, fret: 5 }, { string: 5, fret: 0 }])
  })

  it('leaves out the newest when more are lit than strings', () => {
    const lit = [40, 45, 50, 55, 59, 64, 65].map(p)
    const { positions, leftOut } = placeLit(lit, {})
    expect(leftOut).toEqual([65])
    expect(positions.slice(0, 6).every((x) => x !== null)).toBe(true)
    expect(positions[6]).toBeNull()
  })

  it('counts a note beyond the fretboard separately', () => {
    const { positions, leftOut } = placeLit([p(30), p(40), p(41)], {})
    expect(positions[0]).toBeNull()
    expect(leftOut).toEqual([41])
    expect(beyondFretboard([p(30), p(40), p(41)])).toBe(1)
  })

  it('uses a free string rather than a clash', () => {
    expect(new Set(strings([59, 60, 64])).size).toBe(3)
  })

  // A note is left out only when no one-per-string layout exists: a note that finds every
  // string taken asks an earlier, unremembered note to move to another free string first.
  it('rearranges so all six notes of C4 to A4 are shown', () => {
    const lit = [60, 62, 64, 65, 67, 69].map(p)
    const { positions, leftOut } = placeLit(lit, {})
    expect(leftOut).toEqual([])
    expect(positions.every((x) => x !== null)).toBe(true)
    expect(new Set(positions.map((x) => x!.string)).size).toBe(6)
    positions.forEach((x, i) => expect(STANDARD_GUITAR_TUNING[x!.string]! + x!.fret).toBe(lit[i]))
  })

  it('never moves a remembered position when rearranging', () => {
    const remembered = { 62: { string: 3, fret: 7 }, 64: { string: 4, fret: 5 } }
    const lit = [60, 62, 64, 65, 67, 69].map(p)
    const { positions } = placeLit(lit, remembered)
    expect(positions[1]).toEqual({ string: 3, fret: 7 })
    expect(positions[2]).toEqual({ string: 4, fret: 5 })
    expect(new Set(positions.filter((x) => x).map((x) => x!.string)).size).toBe(positions.filter((x) => x).length)
  })

  it('leaves a note out when no rearrangement gives it a string', () => {
    const { positions, leftOut } = placeLit([p(40), p(41), p(42)], {})
    expect(leftOut).toEqual([41, 42])
    expect(positions).toEqual([{ string: 0, fret: 0 }, null, null])
  })
})
