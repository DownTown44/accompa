import { describe, expect, it } from 'vitest'
import { orderedReadings, readingChoice } from '../../../src/core/explore'
import { pitch } from '../../../src/core/pitch'
import { initialSession, sessionReducer, type Session } from '../../../src/ui/session/session'

const C = pitch(60)
const E = pitch(64)
const G = pitch(67)
const frets = [null, 3, 2, 0, 1, 0] as const

const chord = (): Session => [C, E, G].reduce((s, p) => sessionReducer(s, { type: 'toggleNote', pitch: p }), initialSession)
const selected = (): Session => sessionReducer(chord(), { type: 'selectVoicing', frets })

describe('selectVoicing', () => {
  it('stores the frets and leaves practice and the rest of the session untouched by reference', () => {
    const before = chord()
    const after = sessionReducer(before, { type: 'selectVoicing', frets })
    expect(after.workspace.voicing).toEqual(frets)
    expect(after.practice).toBe(before.practice)
    expect(after.workspace.pitches).toBe(before.workspace.pitches)
    expect(after.workspace.positions).toBe(before.workspace.positions)
  })

  it('forgets the positions only when it leaves a hand edit', () => {
    const edited = sessionReducer({ ...chord(), instrument: 'guitar' }, { type: 'editVoicing', frets: [null, 3, 2, 0, 1, 3] })
    expect(Object.keys(edited.workspace.positions).length).toBeGreaterThan(0)
    const left = sessionReducer(edited, { type: 'selectVoicing', frets })
    expect(left.workspace.positions).toEqual({})
    expect(left.workspace.edited).toBeUndefined()
    const plain = sessionReducer({ ...chord(), workspace: { ...chord().workspace, positions: { [C]: { string: 1, fret: 3 } } } }, { type: 'selectVoicing', frets })
    expect(plain.workspace.positions).toEqual({ [C]: { string: 1, fret: 3 } })
  })

  it('does nothing outside Explore or when the frets are already stored', () => {
    const listen = sessionReducer(chord(), { type: 'setMode', mode: 'listen' })
    expect(sessionReducer(listen, { type: 'selectVoicing', frets })).toBe(listen)
    const stored = selected()
    expect(sessionReducer(stored, { type: 'selectVoicing', frets: [...frets] })).toBe(stored)
  })

  it('is dropped when a note is lit or unlit', () => {
    expect(sessionReducer(selected(), { type: 'toggleNote', pitch: pitch(71) }).workspace.voicing).toBeUndefined()
    expect(sessionReducer(selected(), { type: 'toggleNote', pitch: G }).workspace.voicing).toBeUndefined()
  })

  it('is dropped when the reading or the root changes', () => {
    const dim7 = [60, 63, 66, 69].reduce((st, p) => sessionReducer(st, { type: 'toggleNote', pitch: pitch(p) }), initialSession)
    const withVoicing = sessionReducer(dim7, { type: 'selectVoicing', frets })
    const other = readingChoice(orderedReadings(dim7.workspace.pitches)[1]!)
    const withReading = sessionReducer(withVoicing, { type: 'chooseReading', reading: other })
    expect(withVoicing.workspace.voicing).toEqual(frets)
    expect(withReading.workspace.voicing).toBeUndefined()
    expect(sessionReducer(selected(), { type: 'chooseRoot', pitch: E }).workspace.voicing).toBeUndefined()
  })

  it('is cleared with the workspace by Esc and restored by Undo', () => {
    const cleared = sessionReducer(selected(), { type: 'dismiss' })
    expect(cleared.workspace.voicing).toBeUndefined()
    expect(sessionReducer(cleared, { type: 'undoClear' }).workspace.voicing).toEqual(frets)
  })

  it('survives a swap to piano and back', () => {
    const swapped = sessionReducer(sessionReducer(selected(), { type: 'toggleInstrument' }), { type: 'toggleInstrument' })
    expect(swapped.workspace.voicing).toEqual(frets)
  })
})
