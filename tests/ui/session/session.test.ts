import { describe, expect, it } from 'vitest'
import { pitch, pitchClass, interval } from '../../../src/core/pitch'
import { INTERVALS } from '../../../src/core/theory'
import { initialSession, sessionReducer, type SessionAction } from '../../../src/ui/session/session'
import { listenSession } from '../support/sessions'

const fullPool = INTERVALS.map((definition) => definition.semitones)

describe('sessionReducer', () => {
  it('starts in Explore on the piano', () => {
    expect(initialSession.mode).toBe('explore')
    expect(initialSession.instrument).toBe('piano')
    expect(initialSession.practice.question).toBeNull()
  })

  it('sets the mode', () => {
    expect(sessionReducer(initialSession, { type: 'setMode', mode: 'explore' }).mode).toBe('explore')
  })

  it('sets the instrument', () => {
    expect(sessionReducer(initialSession, { type: 'setInstrument', instrument: 'guitar' }).instrument).toBe('guitar')
  })

  it('toggles between the two instruments', () => {
    const guitar = sessionReducer(initialSession, { type: 'toggleInstrument' })
    expect(guitar.instrument).toBe('guitar')
    expect(sessionReducer(guitar, { type: 'toggleInstrument' }).instrument).toBe('piano')
  })

  it('keeps the instrument when the mode changes and the mode when the instrument changes', () => {
    const guitarExplore = sessionReducer(sessionReducer(initialSession, { type: 'setInstrument', instrument: 'guitar' }), { type: 'setMode', mode: 'explore' })
    expect(guitarExplore.mode).toBe('explore')
    expect(guitarExplore.instrument).toBe('guitar')
  })

  it('does not mutate the previous state', () => {
    sessionReducer(initialSession, { type: 'setMode', mode: 'listen' })
    expect(initialSession.mode).toBe('explore')
  })

  it('stores a question in the practice part and leaves the workspace untouched', () => {
    const question = { direction: 'ascending' as const, root: pitch(60), interval: interval(7), pitches: [pitch(60), pitch(67)] }
    const next = sessionReducer(initialSession, { type: 'setQuestion', question })
    expect(next.practice.question).toBe(question)
    expect(next.workspace).toBe(initialSession.workspace)
  })

  it('keeps the question when the mode or instrument changes', () => {
    const question = { direction: 'ascending' as const, root: pitch(60), interval: interval(7), pitches: [pitch(60), pitch(67)] }
    let state = sessionReducer(initialSession, { type: 'setQuestion', question })
    state = sessionReducer(state, { type: 'setMode', mode: 'explore' })
    state = sessionReducer(state, { type: 'toggleInstrument' })
    state = sessionReducer(state, { type: 'setMode', mode: 'listen' })
    expect(state.practice.question).toBe(question)
  })
})

describe('instrument swap', () => {
  it('changes only the instrument, there and back', () => {
    const question = { direction: 'ascending' as const, root: pitch(60), interval: interval(7), pitches: [pitch(60), pitch(67)] }
    let state = sessionReducer(initialSession, { type: 'setQuestion', question })
    state = sessionReducer(state, { type: 'shiftPiano', direction: 1 })
    const guitar = sessionReducer(state, { type: 'toggleInstrument' })
    expect({ ...guitar, instrument: state.instrument }).toEqual(state)
    const back = sessionReducer(guitar, { type: 'toggleInstrument' })
    expect(back).toEqual(state)
    expect(back.pianoStart).toBe(60)
  })
})

describe('piano window in the session', () => {
  it('starts at C3', () => expect(initialSession.pianoStart).toBe(48))

  it('shifts by an octave and clamps at both ends', () => {
    const up = sessionReducer(initialSession, { type: 'shiftPiano', direction: 1 })
    expect(up.pianoStart).toBe(60)
    expect(sessionReducer(up, { type: 'shiftPiano', direction: 1 })).toBe(up)
    const down = sessionReducer(initialSession, { type: 'shiftPiano', direction: -1 })
    expect(down.pianoStart).toBe(36)
    expect(sessionReducer(down, { type: 'shiftPiano', direction: -1 })).toBe(down)
  })

  it('does not move the hidden window while Guitar is active', () => {
    const guitar = sessionReducer(initialSession, { type: 'setInstrument', instrument: 'guitar' })
    expect(sessionReducer(guitar, { type: 'shiftPiano', direction: 1 })).toBe(guitar)
  })

  it('leaves the rest of the session untouched', () => {
    const next = sessionReducer(initialSession, { type: 'shiftPiano', direction: 1 })
    expect({ ...next, pianoStart: 48 }).toEqual(initialSession)
  })
})

describe('window refit on mode and instrument change', () => {
  const question = { direction: 'ascending' as const, root: pitch(40), interval: interval(7), pitches: [pitch(40), pitch(47)] }
  const revealed = () => {
    let state = sessionReducer(listenSession, { type: 'setQuestion', question })
    state = sessionReducer(state, { type: 'reveal' })
    state = sessionReducer(state, { type: 'shiftPiano', direction: 1 })
    state = sessionReducer(state, { type: 'shiftPiano', direction: 1 })
    expect(state.pianoStart).toBe(60)
    return state
  }

  it('refits when returning to Listen', () => {
    const explore = sessionReducer(revealed(), { type: 'setMode', mode: 'explore' })
    expect(explore.pianoStart).toBe(60)
    expect(sessionReducer(explore, { type: 'setMode', mode: 'listen' }).pianoStart).toBe(36)
  })

  it('refits when choosing the piano again', () => {
    const guitar = sessionReducer(revealed(), { type: 'setInstrument', instrument: 'guitar' })
    expect(guitar.pianoStart).toBe(60)
    expect(sessionReducer(guitar, { type: 'setInstrument', instrument: 'piano' }).pianoStart).toBe(36)
  })
})

describe('reveal', () => {
  const question = { direction: 'ascending' as const, root: pitch(40), interval: interval(7), pitches: [pitch(40), pitch(47)] }
  const asked = sessionReducer(listenSession, { type: 'setQuestion', question })

  it('does nothing without a question', () => {
    expect(sessionReducer(initialSession, { type: 'reveal' })).toBe(initialSession)
  })

  it('reveals and shifts the piano window to include both notes', () => {
    const next = sessionReducer(asked, { type: 'reveal' })
    expect(next.practice.revealed).toBe(true)
    expect(next.pianoStart).toBe(36)
    expect(next.workspace).toBe(initialSession.workspace)
  })

  it('a new question clears it', () => {
    const next = sessionReducer(sessionReducer(asked, { type: 'reveal' }), { type: 'setQuestion', question })
    expect(next.practice.revealed).toBe(false)
  })

  it('fits the window when swapping back to the piano', () => {
    let state = sessionReducer(asked, { type: 'toggleInstrument' })
    state = sessionReducer(state, { type: 'reveal' })
    expect(state.pianoStart).toBe(48)
    expect(sessionReducer(state, { type: 'toggleInstrument' }).pianoStart).toBe(36)
  })
})

describe('guess', () => {
  const question = { direction: 'ascending' as const, root: pitch(60), interval: interval(7), pitches: [pitch(60), pitch(67)] }
  const asked = sessionReducer(initialSession, { type: 'setQuestion', question })

  it('appends wrong marks and records the feedback', () => {
    const one = sessionReducer(asked, { type: 'guess', interval: interval(3), pool: fullPool })
    const two = sessionReducer(one, { type: 'guess', interval: interval(9), pool: fullPool })
    expect(two.practice.wrongMarks).toEqual([3, 9])
    expect(two.feedback).toEqual({ kind: 'wrong', interval: 9 })
    expect(two.practice.question).toBe(question)
  })

  it('ignores repeats, the right answer, no question and revealed', () => {
    const one = sessionReducer(asked, { type: 'guess', interval: interval(3), pool: fullPool })
    expect(sessionReducer(one, { type: 'guess', interval: interval(3), pool: fullPool })).toBe(one)
    expect(sessionReducer(asked, { type: 'guess', interval: interval(7), pool: fullPool })).toBe(asked)
    expect(sessionReducer(initialSession, { type: 'guess', interval: interval(3), pool: fullPool })).toBe(initialSession)
    const revealed = sessionReducer(asked, { type: 'reveal' })
    expect(sessionReducer(revealed, { type: 'guess', interval: interval(3), pool: fullPool })).toBe(revealed)
  })

  it('ignores an interval outside the pool', () => {
    expect(sessionReducer(asked, { type: 'guess', interval: interval(3), pool: [interval(2), interval(7)] })).toBe(asked)
  })

  it('reveal and a new question clear the feedback, and marks reset on a new question', () => {
    const wrong = sessionReducer(asked, { type: 'guess', interval: interval(3), pool: fullPool })
    expect(sessionReducer(wrong, { type: 'reveal' }).feedback).toBeNull()
    const next = sessionReducer(wrong, { type: 'setQuestion', question })
    expect(next.feedback).toBeNull()
    expect(next.practice.wrongMarks).toEqual([])
  })

  it('clearQuestion drops the question, reveal, marks and feedback and keeps the fixed root', () => {
    const rooted = sessionReducer(asked, { type: 'setFixedRoot', pitch: pitch(57) })
    const wrong = sessionReducer(rooted, { type: 'guess', interval: interval(3), pool: fullPool })
    const cleared = sessionReducer(wrong, { type: 'clearQuestion' })
    expect(cleared.practice).toEqual({ question: null, revealed: false, wrongMarks: [], fixedRoot: 57 })
    expect(cleared.feedback).toBeNull()
  })

  it('keeps the feedback and marks across mode and instrument changes', () => {
    const wrong = sessionReducer(asked, { type: 'guess', interval: interval(3), pool: fullPool })
    const back = sessionReducer(sessionReducer(wrong, { type: 'setMode', mode: 'explore' }), { type: 'setMode', mode: 'listen' })
    expect(back.feedback).toEqual(wrong.feedback)
    expect(back.practice.wrongMarks).toEqual([3])
  })
})

describe('setup panel', () => {
  const question = { direction: 'ascending' as const, root: pitch(60), interval: interval(7), pitches: [pitch(60), pitch(67)] }

  it('opens and closes the panel', () => {
    expect(initialSession.setupOpen).toBe(false)
    const open = sessionReducer(initialSession, { type: 'toggleSetup' })
    expect(open.setupOpen).toBe(true)
    expect(sessionReducer(open, { type: 'closeSetup' }).setupOpen).toBe(false)
    expect(sessionReducer(open, { type: 'toggleSetup' }).setupOpen).toBe(false)
  })

  it('holds no setting', () => {
    expect(Object.keys(initialSession)).not.toContain('direction')
    expect(Object.keys(initialSession.practice)).not.toContain('pool')
  })

  it('keeps the question, reveal state and wrong marks', () => {
    let state = sessionReducer(initialSession, { type: 'setQuestion', question })
    state = sessionReducer(state, { type: 'guess', interval: interval(2), pool: fullPool })
    const next = sessionReducer(state, { type: 'toggleSetup' })
    expect(next.practice.question).toBe(question)
    expect(next.practice.revealed).toBe(false)
    expect(next.practice.wrongMarks).toEqual([2])
  })
})

describe('help state', () => {
  it('opens, closes and toggles', () => {
    let s = sessionReducer(initialSession, { type: 'openHelp' })
    expect(s.helpOpen).toBe(true)
    s = sessionReducer(s, { type: 'closeHelp' })
    expect(s.helpOpen).toBe(false)
    expect(sessionReducer(s, { type: 'toggleHelp' }).helpOpen).toBe(true)
  })

  it('dismiss closes help first, then the Setup panel', () => {
    let s = { ...initialSession, helpOpen: true, setupOpen: true }
    s = sessionReducer(s, { type: 'dismiss' })
    expect(s).toMatchObject({ helpOpen: false, setupOpen: true })
    s = sessionReducer(s, { type: 'dismiss' })
    expect(s).toMatchObject({ helpOpen: false, setupOpen: false })
    expect(sessionReducer(s, { type: 'dismiss' })).toBe(s)
  })

  it('records a fixed root in practice only, and keeps it across questions', () => {
    const set = sessionReducer(initialSession, { type: 'setFixedRoot', pitch: pitch(57) })
    expect(set.practice.fixedRoot).toBe(57)
    expect(set.workspace).toBe(initialSession.workspace)
    expect(sessionReducer(set, { type: 'setFixedRoot', pitch: pitch(57) })).toBe(set)
    const question = { direction: 'ascending' as const, root: pitch(60), interval: interval(7), pitches: [pitch(60), pitch(67)] }
    const next = sessionReducer(set, { type: 'setQuestion', question })
    expect(next.practice.fixedRoot).toBe(57)
    expect(sessionReducer(next, { type: 'reveal' }).practice.fixedRoot).toBe(57)
  })
})

describe('toggleNote', () => {
  const toggle = (state: typeof initialSession, n: number, position?: { string: number; fret: number }) =>
    sessionReducer(state, { type: 'toggleNote', pitch: pitch(n), position })

  it('lights and unlights a note', () => {
    const lit = toggle(initialSession, 60)
    expect(lit.workspace.pitches).toEqual([60])
    expect(toggle(lit, 60).workspace.pitches).toEqual([])
  })

  it('keeps a third note and unlights the oldest past the cap', () => {
    const three = toggle(toggle(toggle(initialSession, 60), 67), 64)
    expect(three.workspace.pitches).toEqual([60, 67, 64])
    let full = initialSession
    for (let n = 60; n < 68; n++) full = toggle(full, n)
    expect(toggle(full, 70).workspace.pitches).toEqual([61, 62, 63, 64, 65, 66, 67, 70])
  })

  it('unlights a note lit without a position when its shown position is clicked, and moves it from another', () => {
    const lit = toggle(initialSession, 64)
    expect(toggle(lit, 64, { string: 5, fret: 0 }).workspace.pitches).toEqual([])
    const moved = toggle(lit, 64, { string: 4, fret: 5 })
    expect(moved.workspace.pitches).toEqual([64])
    expect(moved.workspace.positions).toEqual({ 64: { string: 4, fret: 5 } })
  })

  it('remembers a position and forgets it with the note', () => {
    const lit = toggle(initialSession, 64, { string: 4, fret: 5 })
    expect(lit.workspace.positions).toEqual({ 64: { string: 4, fret: 5 } })
    expect(toggle(lit, 64, { string: 4, fret: 5 }).workspace).toEqual({ pitches: [], positions: {} })
  })

  it('moves a lit pitch to another position instead of unlighting it', () => {
    const lit = toggle(initialSession, 64, { string: 5, fret: 0 })
    const moved = toggle(lit, 64, { string: 4, fret: 5 })
    expect(moved.workspace.pitches).toEqual([64])
    expect(moved.workspace.positions).toEqual({ 64: { string: 4, fret: 5 } })
  })

  it('drops the position of the note that falls off', () => {
    let state = toggle(initialSession, 60, { string: 3, fret: 5 })
    for (let n = 61; n < 69; n++) state = toggle(state, n)
    expect(state.workspace.positions).toEqual({})
  })


  it('fits the piano window to the lit notes when the instrument changes', () => {
    let state = toggle({ ...initialSession, instrument: 'guitar' }, 40, { string: 0, fret: 0 })
    state = sessionReducer(state, { type: 'setInstrument', instrument: 'piano' })
    expect(state.pianoStart).toBe(36)
  })
})

describe('workspace and practice stay apart', () => {
  const question = { direction: 'ascending' as const, root: pitch(40), interval: interval(7), pitches: [pitch(40), pitch(47)] }
  const litBase = sessionReducer(
    sessionReducer(initialSession, { type: 'toggleNote', pitch: pitch(60), position: { string: 2, fret: 1 } }),
    { type: 'toggleNote', pitch: pitch(67) },
  )
  const asked = sessionReducer(sessionReducer(litBase, { type: 'setQuestion', question }), { type: 'guess', interval: interval(3), pool: fullPool })
  const withKept = sessionReducer(asked, { type: 'dismiss' })

  const workspaceActions: SessionAction[] = [
    { type: 'toggleNote', pitch: pitch(64) },
    { type: 'toggleNote', pitch: pitch(60) },
    { type: 'toggleNote', pitch: pitch(60), position: { string: 1, fret: 5 } },
    { type: 'dismiss' },
    { type: 'undoClear' },
  ]
  const practiceActions: SessionAction[] = [
    { type: 'setQuestion', question },
    { type: 'clearQuestion' },
    { type: 'setFixedRoot', pitch: pitch(57) },
    { type: 'reveal' },
    { type: 'guess', interval: interval(2), pool: fullPool },
  ]

  it.each(workspaceActions)('workspace action $type keeps practice by reference', (action) => {
    for (const state of [asked, withKept]) {
      expect(sessionReducer(state, action).practice).toBe(state.practice)
    }
  })

  it.each(practiceActions)('practice action $type keeps workspace and cleared by reference', (action) => {
    for (const state of [asked, withKept]) {
      const next = sessionReducer(state, action)
      expect(next.workspace).toBe(state.workspace)
      expect(next.cleared).toBe(state.cleared)
    }
  })

  it('a mode switch changes neither part, and Listen only reads the practice', () => {
    for (const mode of ['listen', 'explore'] as const) {
      const next = sessionReducer(withKept, { type: 'setMode', mode })
      expect(next.workspace).toBe(withKept.workspace)
      expect(next.cleared).toBe(withKept.cleared)
      expect(next.practice).toBe(withKept.practice)
    }
  })

  it('refits the piano to the Explore notes after a reveal in Listen moved the window', () => {
    const high = sessionReducer(sessionReducer(asked, { type: 'toggleNote', pitch: pitch(80) }), { type: 'toggleNote', pitch: pitch(84) })
    let state = sessionReducer(high, { type: 'setMode', mode: 'listen' })
    state = sessionReducer(state, { type: 'reveal' })
    expect(state.pianoStart).toBe(36)
    state = sessionReducer(state, { type: 'setMode', mode: 'explore' })
    expect(state.pianoStart).toBeGreaterThan(48)
    expect(state.pianoStart + 36).toBeGreaterThan(84)
    expect(state.workspace).toBe(high.workspace)
  })
})

describe('clear and undo', () => {
  const lit = sessionReducer(
    sessionReducer(initialSession, { type: 'toggleNote', pitch: pitch(60), position: { string: 2, fret: 1 } }),
    { type: 'toggleNote', pitch: pitch(67) },
  )

  it('Esc clears the notes and keeps them; undo restores them', () => {
    const cleared = sessionReducer(lit, { type: 'dismiss' })
    expect(cleared.workspace.pitches).toEqual([])
    expect(cleared.cleared).toEqual(lit.workspace)
    const back = sessionReducer(cleared, { type: 'undoClear' })
    expect(back.workspace).toEqual(lit.workspace)
    expect(back.cleared).toBeNull()
  })

  it('closes a panel first and leaves the notes', () => {
    const s = sessionReducer({ ...lit, setupOpen: true }, { type: 'dismiss' })
    expect(s.workspace).toEqual(lit.workspace)
    expect(s.cleared).toBeNull()
  })

  it('does nothing with nothing lit or in Listen', () => {
    expect(sessionReducer(initialSession, { type: 'dismiss' })).toBe(initialSession)
    const l = { ...lit, mode: 'listen' as const }
    expect(sessionReducer(l, { type: 'dismiss' })).toBe(l)
  })

  it('drops the kept notes on the next note change', () => {
    const cleared = sessionReducer(lit, { type: 'dismiss' })
    const s = sessionReducer(cleared, { type: 'toggleNote', pitch: pitch(64) })
    expect(s.cleared).toBeNull()
    expect(sessionReducer(s, { type: 'undoClear' })).toBe(s)
  })

  it('survives an instrument swap', () => {
    const swapped = sessionReducer(sessionReducer(lit, { type: 'dismiss' }), { type: 'toggleInstrument' })
    expect(sessionReducer(swapped, { type: 'undoClear' }).workspace).toEqual(lit.workspace)
  })

  it('closes the shortcuts list first and leaves the notes', () => {
    const s = sessionReducer({ ...lit, helpOpen: true }, { type: 'dismiss' })
    expect(s.helpOpen).toBe(false)
    expect(s.workspace).toEqual(lit.workspace)
    expect(s.cleared).toBeNull()
  })

  it('brings the piano window to the restored notes after the window moved', () => {
    const high = sessionReducer(initialSession, { type: 'toggleNote', pitch: pitch(40) })
    const away = sessionReducer(sessionReducer(high, { type: 'dismiss' }), { type: 'shiftPiano', direction: 1 })
    expect(away.pianoStart).toBeGreaterThan(40)
    const back = sessionReducer(away, { type: 'undoClear' })
    expect(back.pianoStart).toBeLessThanOrEqual(40)
    expect(back.pianoStart + 36).toBeGreaterThan(40)
  })

  it('keeps the kept notes through a visit to Listen, since the workspace is unchanged', () => {
    const cleared = sessionReducer(lit, { type: 'dismiss' })
    const trip = sessionReducer(sessionReducer(cleared, { type: 'setMode', mode: 'listen' }), { type: 'setMode', mode: 'explore' })
    expect(trip.cleared).toEqual(lit.workspace)
    expect(sessionReducer(trip, { type: 'undoClear' }).workspace).toEqual(lit.workspace)
  })
})

describe('chooseReading', () => {
  const dim7 = [60, 63, 66, 69].reduce((s, n) => sessionReducer(s, { type: 'toggleNote', pitch: pitch(n) }), initialSession)
  const adim7 = { root: pitchClass(pitch(9)), quality: 'dim7' } as const
  const chosen = sessionReducer(dim7, { type: 'chooseReading', reading: adim7 })

  it('stores the reading in the workspace only', () => {
    expect(chosen.workspace.reading).toEqual(adim7)
    expect(chosen.workspace.pitches).toBe(dim7.workspace.pitches)
    expect(chosen.practice).toBe(dim7.practice)
    expect(chosen.cleared).toBe(dim7.cleared)
  })

  it('ignores the same choice and a reading the notes do not have', () => {
    expect(sessionReducer(chosen, { type: 'chooseReading', reading: adim7 })).toBe(chosen)
    expect(sessionReducer(dim7, { type: 'chooseReading', reading: { root: pitchClass(pitch(0)), quality: 'major' } })).toBe(dim7)
  })

  it('keeps the reading while it exists and drops it when it stops existing', () => {
    const more = sessionReducer(chosen, { type: 'toggleNote', pitch: pitch(72) })
    expect(more.workspace.reading).toEqual(adim7)
    const gone = sessionReducer(chosen, { type: 'toggleNote', pitch: pitch(63) })
    expect('reading' in gone.workspace).toBe(false)
  })

  it('keeps the reading when a guitar note only moves position', () => {
    const moved = sessionReducer(chosen, { type: 'toggleNote', pitch: pitch(60), position: { string: 2, fret: 1 } })
    expect(moved.workspace.reading).toEqual(adim7)
  })

  it('Esc clears it with the notes and Undo restores both; mode switches keep it', () => {
    const cleared = sessionReducer(chosen, { type: 'dismiss' })
    expect(cleared.workspace.reading).toBeUndefined()
    expect(sessionReducer(cleared, { type: 'undoClear' }).workspace.reading).toEqual(adim7)
    for (const mode of ['listen', 'explore'] as const) {
      expect(sessionReducer(chosen, { type: 'setMode', mode }).workspace).toBe(chosen.workspace)
    }
  })

  it('leaves practice by reference', () => {
    expect(sessionReducer(chosen, { type: 'chooseReading', reading: { root: pitchClass(pitch(3)), quality: 'dim7' } }).practice).toBe(chosen.practice)
  })
})

describe('chooseRoot and armRoot', () => {
  const lit = (ns: number[]) => ns.reduce((s, n) => sessionReducer(s, { type: 'toggleNote', pitch: pitch(n) }), initialSession)
  const dim7 = lit([60, 63, 66, 69])
  const aug = lit([60, 64, 68])
  const armed = sessionReducer(dim7, { type: 'armRoot' })

  it('arms only in Explore with a lit note, and toggles', () => {
    expect(sessionReducer(initialSession, { type: 'armRoot' })).toBe(initialSession)
    expect(sessionReducer({ ...dim7, mode: 'listen' }, { type: 'armRoot' }).rootArmed).toBe(false)
    expect(armed.rootArmed).toBe(true)
    expect(sessionReducer(armed, { type: 'armRoot' }).rootArmed).toBe(false)
  })

  it('stores the root and its reading, disarms, and leaves the rest by reference', () => {
    const next = sessionReducer(armed, { type: 'chooseRoot', pitch: pitch(66) })
    expect(next.workspace.root).toBe(66)
    expect(next.workspace.reading).toEqual({ root: pitchClass(pitch(66)), quality: 'dim7' })
    expect(next.rootArmed).toBe(false)
    expect(next.workspace.pitches).toBe(armed.workspace.pitches)
    expect(next.practice).toBe(armed.practice)
    expect(next.cleared).toBe(armed.cleared)
  })

  it('removes the reading when the root roots none, and ignores unlit pitches', () => {
    const maj7 = lit([60, 64, 67, 71])
    const choice = sessionReducer(maj7, { type: 'chooseReading', reading: { root: pitchClass(pitch(0)), quality: 'maj7' } })
    const next = sessionReducer(choice, { type: 'chooseRoot', pitch: pitch(67) })
    expect(next.workspace.root).toBe(67)
    expect('reading' in next.workspace).toBe(false)
    expect(sessionReducer(maj7, { type: 'chooseRoot', pitch: pitch(61) })).toBe(maj7)
  })

  it('returns the same state for the same root', () => {
    const once = sessionReducer(aug, { type: 'chooseRoot', pitch: pitch(64) })
    expect(sessionReducer(once, { type: 'chooseRoot', pitch: pitch(64) })).toBe(once)
  })

  const rooted = sessionReducer(dim7, { type: 'chooseRoot', pitch: pitch(66) })

  it('persists through added notes and a guitar move, and clears when unlit', () => {
    expect(sessionReducer(rooted, { type: 'toggleNote', pitch: pitch(72) }).workspace.root).toBe(66)
    expect(sessionReducer(rooted, { type: 'toggleNote', pitch: pitch(60), position: { string: 2, fret: 1 } }).workspace.root).toBe(66)
    const unlit = sessionReducer(rooted, { type: 'toggleNote', pitch: pitch(66) })
    expect('root' in unlit.workspace).toBe(false)
  })

  it('keeps the root when its class stops rooting a reading', () => {
    const gone = sessionReducer(rooted, { type: 'toggleNote', pitch: pitch(63) })
    expect(gone.workspace.root).toBe(66)
    expect('reading' in gone.workspace).toBe(false)
  })

  it('choosing an alternative reading clears the root', () => {
    const next = sessionReducer(rooted, { type: 'chooseReading', reading: { root: pitchClass(pitch(0)), quality: 'dim7' } })
    expect('root' in next.workspace).toBe(false)
    expect(next.workspace.reading?.root).toBe(0)
  })

  it('Esc disarms first, Undo restores the root but not the armed state, a mode switch disarms', () => {
    const a = sessionReducer(rooted, { type: 'armRoot' })
    const esc1 = sessionReducer(a, { type: 'dismiss' })
    expect(esc1.rootArmed).toBe(false)
    expect(esc1.workspace).toBe(a.workspace)
    const cleared = sessionReducer(esc1, { type: 'dismiss' })
    const undone = sessionReducer(cleared, { type: 'undoClear' })
    expect(undone.workspace.root).toBe(66)
    expect(undone.rootArmed).toBe(false)
    const listen = sessionReducer(a, { type: 'setMode', mode: 'listen' })
    expect(listen.rootArmed).toBe(false)
    expect(listen.workspace).toBe(a.workspace)
  })

  it('lighting no notes disarms', () => {
    const a = sessionReducer(lit([60]), { type: 'armRoot' })
    expect(sessionReducer(a, { type: 'toggleNote', pitch: pitch(60) }).rootArmed).toBe(false)
  })

  it('re-clicking the current root while armed only disarms', () => {
    const again = sessionReducer(rooted, { type: 'armRoot' })
    expect(again.workspace.root).toBe(66)
    const next = sessionReducer(again, { type: 'chooseRoot', pitch: pitch(66) })
    expect(next.rootArmed).toBe(false)
    expect(next.workspace).toBe(again.workspace)
  })
})
