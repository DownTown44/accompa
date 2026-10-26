import { describe, expect, it } from 'vitest'
import { orderedReadings, readingChoice } from '../../../src/core/explore'
import { pitch } from '../../../src/core/pitch'
import { moveFret } from '../../../src/core/voicings'
import { initialSession, sessionReducer, type Session } from '../../../src/ui/session/session'

const OPEN_C = [null, 3, 2, 0, 1, 0]
const chord = (...p: number[]): Session => p.reduce((s, n) => sessionReducer(s, { type: 'toggleNote', pitch: pitch(n) }), { ...initialSession, instrument: 'guitar' } as Session)
const edited = (frets: (number | null)[] = OPEN_C): Session => sessionReducer(chord(60, 64, 67), { type: 'editVoicing', frets })

describe('editVoicing', () => {
  it('ignores an edit outside Explore, on the piano, or with the wrong number of strings', () => {
    const base = chord(60, 64, 67)
    const listen = sessionReducer(base, { type: 'setMode', mode: 'listen' })
    expect(sessionReducer(listen, { type: 'editVoicing', frets: OPEN_C })).toBe(listen)
    const piano = sessionReducer(base, { type: 'setInstrument', instrument: 'piano' })
    expect(sessionReducer(piano, { type: 'editVoicing', frets: OPEN_C })).toBe(piano)
    expect(sessionReducer(base, { type: 'editVoicing', frets: [null, 3, 2] })).toBe(base)
    expect(sessionReducer(base, { type: 'editVoicing', frets: [...OPEN_C, 0] })).toBe(base)
  })

  it('stores the frets with the flag, sets pitches and positions, and leaves practice untouched by reference', () => {
    const before = chord(60, 64, 67)
    const after = sessionReducer(before, { type: 'editVoicing', frets: OPEN_C })
    expect(after.workspace.voicing).toEqual(OPEN_C)
    expect(after.workspace.edited).toBe(true)
    expect(after.workspace.pitches).toEqual([48, 52, 55, 60, 64])
    expect(after.workspace.positions[52]).toEqual({ string: 2, fret: 2 })
    expect(after.practice).toBe(before.practice)
  })

  it('keeps the root only while its pitch is still lit', () => {
    const base = sessionReducer(chord(60, 64, 67), { type: 'chooseRoot', pitch: pitch(60) })
    expect(sessionReducer(base, { type: 'editVoicing', frets: OPEN_C }).workspace.root).toBe(60)
    expect(sessionReducer(base, { type: 'editVoicing', frets: moveFret(OPEN_C, 4, 3) }).workspace.root).toBeUndefined()
  })

  it('drops the voicing and flag below two notes without an Undo entry', () => {
    const one = sessionReducer(edited(), { type: 'editVoicing', frets: [null, 3, null, null, null, null] })
    expect(one.workspace.pitches).toEqual([48])
    expect(one.workspace.voicing).toBeUndefined()
    expect(one.workspace.edited).toBeUndefined()
    expect(one.workspace.positions[48]).toEqual({ string: 1, fret: 3 })
    const none = sessionReducer(edited(), { type: 'editVoicing', frets: [null, null, null, null, null, null] })
    expect(none.workspace).toEqual({ pitches: [], positions: {} })
    expect(none.cleared).toBeNull()
    const two = sessionReducer(edited(), { type: 'editVoicing', frets: [null, 3, 2, null, null, null] })
    expect(two.workspace.edited).toBe(true)
  })

  it('is replaced by selectVoicing, even with the same frets', () => {
    const selected = sessionReducer(edited(), { type: 'selectVoicing', frets: OPEN_C })
    expect(selected.workspace.voicing).toEqual(OPEN_C)
    expect(selected.workspace.edited).toBeUndefined()
  })

  it('survives choosing a reading or a root, and is dropped by toggleNote', () => {
    const dim = [60, 63, 66, 69].reduce((st, p) => sessionReducer(st, { type: 'toggleNote', pitch: pitch(p) }), { ...initialSession, instrument: 'guitar' } as Session)
    const frets = [null, 3, 1, 2, 7, null]
    const e = sessionReducer(dim, { type: 'editVoicing', frets })
    const other = readingChoice(orderedReadings(e.workspace.pitches)[1]!)
    const withReading = sessionReducer(e, { type: 'chooseReading', reading: other })
    expect(withReading.workspace.edited).toBe(true)
    expect(withReading.workspace.voicing).toEqual(frets)
    const rooted = sessionReducer(e, { type: 'chooseRoot', pitch: e.workspace.pitches[1]! })
    expect(rooted.workspace.edited).toBe(true)
    expect(rooted.workspace.voicing).toEqual(frets)
    const toggled = sessionReducer(edited(), { type: 'toggleNote', pitch: pitch(71) })
    expect(toggled.workspace.voicing).toBeUndefined()
    expect(toggled.workspace.edited).toBeUndefined()
  })

  it('is cleared by Esc, restored by Undo, and survives a swap', () => {
    const cleared = sessionReducer(edited(), { type: 'dismiss' })
    expect(sessionReducer(cleared, { type: 'undoClear' }).workspace.edited).toBe(true)
    const swapped = sessionReducer(sessionReducer(edited(), { type: 'toggleInstrument' }), { type: 'toggleInstrument' })
    expect(swapped.workspace.voicing).toEqual(OPEN_C)
    expect(swapped.workspace.edited).toBe(true)
  })
})
