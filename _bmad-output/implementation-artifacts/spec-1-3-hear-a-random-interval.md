---
title: 'Story 1.3: Hear a random interval'
type: 'feature'
created: '2026-10-23'
status: 'done'
baseline_commit: '97d2038ffc38d12787a737b66ba4ba21a9b7498b'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** accompa makes no sound. There is no interval table, no practice logic, no audio engine and no Listen screen, so Apor cannot start ear practice.

**Approach:** Add the pure `core/` pieces (branded `Interval`, the 12-interval table, instrument ranges, seeded question generation, session model), a Web Audio synth behind one engine interface, and a Listen view where Play again and `Space` replay the current interval as an ascending arpeggio.

## Boundaries & Constraints

**Always:** `core/` has no browser APIs and never calls `Math.random`; randomness is an injected `() => number`, supplied from `ui/`. Every note of a question fits the active instrument's range (piano MIDI 36 to 96; guitar 40 to 86: low E2 plus 22 frets on standard tuning, held with the tuning in `core/instruments`). The engine owns all timing, callers pass pitch lists only, and components never create audio nodes. The AudioContext is created or resumed synchronously in a gesture handler. A question is kept when mode or instrument changes and never replays on its own. Practice writes only the practice part of the session, never the workspace. Audio failure shows a Status note and never breaks the app.

**Never:** No Reveal, Next, guessing, interval buttons, pool or direction controls, setup panel, piano or fretboard (later stories). No audio library, no samples. No `Math.random` anywhere in `core/`. No story or epic references in comments.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Seeded question | same seed, pool, range | same root and interval every time | N/A |
| Range fit | any seed, all 12 intervals, piano and guitar | `root` and `root + semitones` inside the range | N/A |
| App opens | Listen, no question | readout `Which interval?`, no sound, no status note | N/A |
| Space or Play again, no question | Listen | question generated, ascending arpeggio plays, context created in the gesture | N/A |
| Space or Play again, question exists | Listen | same pitches replay identically | N/A |
| Space auto-repeat | `event.repeat` | ignored | N/A |
| Space while a button, radio or text field has focus | any | shortcut yields to the control | N/A |
| Enter Listen by click or `M` | no question yet | question generated and played at once | N/A |
| Enter Listen by click or `M` | question exists | nothing plays, question kept | N/A |
| Context blocked after a gesture | engine status `blocked` | Status note `Press any key to wake the sound.` until audio runs | Engine failures caught, app keeps working |
| Pointer click on a mode or instrument control | click with `detail > 0` | focus moves off the control so `Space` and `M` keep working | Keyboard activation keeps focus |

</frozen-after-approval>

## Code Map

- Reuse `src/core/pitch.ts` (`Pitch`, `PitchClass`, `pitch()`, `pitchClass()`); `src/ui/session.ts`, `SessionContext.tsx`, `useShortcuts.ts`, `App.tsx`, `SegmentedGroup.tsx` are extended, not replaced. Existing tests in `tests/ui/session.test.ts` and `useShortcuts.test.tsx` need updating for the new session shape.
- `src/core/pitch.ts` -- add branded `Interval`
- `src/core/theory.ts` -- `INTERVALS`: 12 entries `{ semitones 1..12, name, abbreviation }`, m2 to P8, 6 is A4 (AD-4)
- `src/core/instruments.ts` -- `INSTRUMENT_RANGES`, standard guitar tuning and fret count (single owner of ranges)
- `src/core/practice.ts` -- `Random` type, `generateQuestion({ pool, range, random })` returning `{ root, interval, pitches }`, ascending
- `src/core/model.ts` -- `Instrument`, `Workspace` (`pitches`), `Practice` (`question`, `revealed`, `wrongMarks`, `pool`), initial values, plain data (AD-5)
- `src/audio/engine.ts` -- `AudioEngine` interface: `play(pitches, 'block' | 'arpeggio')`, `stop()`, `status()` (`idle | running | blocked`), `subscribe()`, `unlock()`
- `src/audio/synth.ts` -- `createSynthEngine(createContext?)` on Web Audio oscillators; timing constants in one place; failures caught
- `src/ui/EngineContext.tsx` -- provider and `useEngine()`; `App` takes an optional `engine` prop for tests
- `src/ui/StatusNote.tsx`, `src/ui/ListenView.tsx`, `src/ui/useAudioStatus.ts` -- note, readout plus Play again button with a `Space` key hint, status subscription
- `src/ui/useShortcuts.ts` -- add `Space`; handlers come from a `useSessionActions` hook that owns select-mode, toggle, play

## Tasks & Acceptance

**Execution:**
- [x] `src/core/pitch.ts`, `theory.ts`, `instruments.ts`, `tests/core/theory.test.ts`, `instruments.test.ts` -- types, table, ranges
- [x] `src/core/practice.ts`, `tests/core/practice.test.ts` -- seeded determinism, range fit over seeds, a test that fails if any `core/` file contains `Math.random`
- [x] `src/core/model.ts`, `src/ui/session.ts`, tests -- practice and workspace parts, `setQuestion` leaves workspace untouched
- [x] `src/audio/engine.ts`, `synth.ts`, `tests/audio/synth.test.ts` -- fake context: arpeggio notes start in list order at increasing times, block starts together, suspended context reports `blocked`, errors caught
- [x] `src/ui/EngineContext.tsx`, `StatusNote.tsx`, `useAudioStatus.ts`, `ListenView.tsx`, `useSessionActions.ts`, `useShortcuts.ts`, `SegmentedGroup.tsx`, `App.tsx`, `tests/ui/ListenView.test.tsx` -- every matrix row

**Acceptance Criteria:**
- Given the `core/` types and table, then `Pitch`, `PitchClass`, `Interval` are distinct, pitch class is `n mod 12`, and the table holds m2 to P8 with A4 at 6.
- Given a seeded random function, then the same seed always yields the same interval and root, `core/` never calls `Math.random`, and every note is in the active range.
- Given the engine, when a caller plays a list as block or arpeggio, then notes sound via Web Audio in list order for an arpeggio, and components only use the interface.
- Given Listen, when I click Play again or press `Space`, then the current interval plays ascending and replays identically, and no enable-sound screen exists.
- Given the session model, then it has workspace, practice and a separate active instrument as plain serializable data, and the Listen question lives in practice.
- Given a question starts, then the readout shows `Which interval?`; entering Listen by click or `M` with no question plays at once, and app open waits for `Space` or Play again.
- Given the context stays suspended after a gesture, then `Press any key to wake the sound.` shows until audio starts, and nothing else breaks.
- Given mode changes to Explore and back, then the same question is kept and does not replay.

## Implementation Notes

- Questions are drawn from `COMMON_RANGE` (40 to 86, the span both instruments can show), a subset of each active instrument's range, so a question kept across an instrument swap still fits the other view. Piano never plays 36 to 39 or 87 to 96 in practice.
- A play request is dropped if `stop()` or a newer `play()` arrives while the context is still resuming.
- Leaving Listen stops the arpeggio (not in the spec; added after review).
- The audio wake path listens for `keydown` and `click`; a mouse `pointerdown` is not a user activation.

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Evidence / route |
|---|---|---|
| UI range and pool wiring untested; replay test uses a constant random so regeneration would pass | medium | Verified by mutation reasoning: a wrong range passes at 0.5. **patch**: tests at random 0 and 0.999999 and with a changing source |
| A play queued behind resume survives `stop()` or a newer `play()`; two lists can stack | medium | Real, only when the context is suspended. **patch**: generation counter, tests |
| Error thrown inside the resume callback is an unhandled rejection and shows no note | medium | **patch**: catch reports blocked, test |
| Wake listens on `pointerdown`, which is not a user activation for a mouse in Chrome | medium | **patch**: listen for `click`, tests updated |
| Audio keeps ringing after leaving Listen | low | Cheap and direct. **patch**: `engine.stop()` on entering Explore, test |
| Reducer `toggleMode` action is dead after the hook took over toggling | low | **patch**: action and its tests removed |
| Gain scaling and envelope not asserted | low | Audible only; fake would need to expose gain nodes. Rejected |
| Play lost when audio is blocked and needs a second press | low | The waking press is itself a Space or click that plays. Rejected |
| No release ramp on `stop()` (click risk) | low | Cosmetic, not observable in tests. Rejected |
| No `unavailable` status when `AudioContext` is missing; closed and interrupted map to blocked | low | All target browsers have Web Audio. Rejected |
| `generateQuestion` has no guard for an empty pool or a range narrower than the interval | low | Pool is never empty in v1 and the range is a constant; a guard adds branches. Rejected |
| Math.random scan is a shallow text test; Math.random is injected in `ui/` | low | The injection point is intentional. Rejected |
| Legacy `Spacebar` key value; Space on a focused radio does nothing | low | Modern browsers only; native radio behavior by design. Rejected |
| Blurring a control after a pointer click hurts focus continuity | low | Only `detail > 0` clicks; the input covers its label, so pointer clicks land on it. Keyboard activation keeps focus. Rejected |
| Unmount does not stop the engine | low | The app never unmounts. Rejected |
| Hard-coded 96px and 8px, no hover state, no forced-colors for the button, no playing feedback | low | Cosmetic; the design shows no playing state. Rejected |
| Whole-state equality in session tests; literal tab-order label; no unmount cleanup test | low | Test hardening. Rejected |
| Questions use the shared range, not the active instrument's range | low | Stricter subset, recorded in Implementation Notes. Rejected |

## Design Notes

Status note visibility follows the engine, not React state: `idle` before any gesture (no note), `running`, or `blocked` when a context exists but is not running after a gesture. While blocked, the next key or pointer press calls `unlock()`. After a pointer click on a strip control the control is blurred, standing in for "focus returns to the instrument" until the instrument exists.

## Verification

**Commands:**
- `npm run check` -- expected: tsc clean, boundary check passes, all specs green
- `npm run build` -- expected: succeeds
- `npm run dev` then fetch the dev URL -- expected: new `src` files transform without error

**Manual checks:**
- In a browser: press Space on a fresh load and hear a rising two-note interval; press Space again and hear the same one; click Explore then Listen and hear nothing new; reload, press `M` twice, hear an interval.
