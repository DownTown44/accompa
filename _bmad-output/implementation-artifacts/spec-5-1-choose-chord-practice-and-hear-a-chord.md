---
title: 'Story 5.1: Choose chord practice and hear a chord'
type: 'feature'
created: '2026-10-27'
status: 'done'
baseline_commit: '71ef443c06f2e1f6a3d54362506f7265c0c4ac53'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Listen only asks intervals. Apor cannot switch it to chords, so he cannot hear a random chord to train his ear for chord quality.

**Approach:** A Setup Practice control (Intervals, Chords) and a chord pool of the nine qualities. In Chords, Listen draws a root-position chord from a seeded `random`, fitting both instruments, and plays it as one block. Guess and Reveal are Stories 5.2 and 5.3.

## Boundaries & Constraints

**Always:** `generateChordQuestion` in `src/core/practice.ts` takes `random` and a range, draws the quality first, then a root so every note fits `COMMON_RANGE`, and returns `{ root, quality, pitches }` (root position, close, low to high). Chord names come only from `nameChord`. The question lives in `Practice` beside the interval `question`, which is never read or cleared by chord practice. Practice mode and the chord pool live in `Settings`, are never saved, and start as Intervals and all nine. Changing them leaves the current chord replayable; the next question uses them. Chord Listen plays `engine.play(pitches, 'block')` on both instruments. Interval digits `1`-`9` and `guess` do nothing in Chords. The Listen answer row keeps its height in Chords (empty, until Story 5.2), so nothing moves. Until Story 5.3, Reveal and Next stay inert in Chords (`aria-disabled`; decided by Apor on 2026-10-27). Direction and Root stay in Setup but show disabled while Chords is chosen, so the panel keeps its height (decided by Apor on 2026-10-27).

**Never:** No guess UI, key mapping, reveal or lighting (5.2, 5.3). No strum. No change to the interval flow, the interval pool or its saved key. No workspace change. No touch or narrow-viewport handling. No new dependency.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Seeded draw | random 0, 0, all nine | major on E2: pitches 40 44 47; `nameChord` first reading is E major | N/A |
| Seeded top | random 0.999999, 0.999999 | dim7 on 77: 77 80 83 86, all in 40-86 | N/A |
| Pool of one | pool = minor | every question is minor, any seed | N/A |
| Range | seeds 0 and 0.999999, either instrument | every pitch within 40-86, so it fits piano and guitar | N/A |
| Last chip | one chip selected, click it | stays selected, note `Keep at least one chord quality.` | Pool unchanged |
| Not persisted | untick chips, choose Chords, reload | Intervals, all nine; interval pool, sound, theme still restore | N/A |
| Replay | question playing, press Space twice | the same pitches in the same order, as one block each time | N/A |
| Change mid-question | tick a chip or switch practice | current chord unchanged and replayable; next differs per new setting | N/A |
| Switch to Chords in Listen | Intervals question waiting | `Which chord?`; a chord plays; switching back restores the interval question | N/A |
| Intervals unchanged | practice Intervals | all existing Listen tests pass unmodified | N/A |
| Keys in Chords | press `3` | nothing guessed, no sound | N/A |
| Explore round trip | chord question, Explore, back | same chord, workspace identical by reference | N/A |
| Reveal, Next in Chords | chord question showing | both `aria-disabled`, pressing does nothing | N/A |
| Direction, Root in Chords | Setup open, Chords chosen | both controls shown disabled, panel height unchanged; enabled again in Intervals | N/A |
| Layout | Chords, both instruments and themes, Setup open and shut | instrument top and Status note do not move, no scroll at 1280 x 800 | N/A |

</frozen-after-approval>

## Code Map

- `src/core/practice.ts` -- `generateQuestion`, `pick`, `Random`: add `generateChordQuestion` beside it, same pick rule.
- `src/core/theory.ts` -- `CHORD_QUALITIES` (name, intervals); `src/core/chords.ts` -- `nameChord`; `src/core/instruments.ts` -- `COMMON_RANGE` (40-86).
- `src/core/model.ts` -- `Practice`, `Settings`, `initialSettings`, `Question`: add `ChordQuestion`, `Practice.chordQuestion`, `Settings.practice`, `Settings.chordPool`.
- `src/ui/settings/settings.ts`, `settingsStorage.ts`, `SettingsContext.tsx` -- reducer (mirror `togglePool`); storage and its save effects stay as they are, so the new fields are unsaved.
- `src/ui/session/session.ts` -- `sessionReducer` `setQuestion`/`clearQuestion` pattern: add `setChordQuestion`, touching `practice` only.
- `src/ui/session/useSessionActions.ts` -- `startQuestion`, `play`, `playQuestion`, `next`, `selectMode`, `guess`: branch on `settings.practice`.
- `src/ui/setup/SetupPanel.tsx`, `setup.css`; `src/ui/shell/SegmentedGroup.tsx` -- Practice group, chip group.
- `src/ui/listen/ListenView.tsx`, `IntervalButtons.tsx`, `listen.css`; `src/ui/shortcuts/useShortcuts.ts` -- readout, row height, key guard.
- Tests: `tests/core/practice.test.ts`, `tests/ui/settings/settings.test.ts`, `tests/ui/session/session.test.ts`, `tests/ui/setup/SetupPanel.test.tsx`, `tests/ui/listen/ListenView.test.tsx`; helpers `tests/ui/support/{sessions,setupPanel,fakeEngine}.ts`.

## Tasks & Acceptance

**Execution:**
- [ ] `model.ts`, `practice.ts` -- ChordQuestion type, settings fields, `generateChordQuestion` -- core stays pure and seedable
- [ ] `settings.ts` -- `setPractice`, `toggleChordPool` (last chip refused, pool kept in quality order) -- same rule as intervals
- [ ] `session.ts` -- `setChordQuestion` -- reducer tests assert `workspace` and the interval `question` are the same reference
- [ ] `useSessionActions.ts`, `useShortcuts.ts` -- chord draw, block play, replay of the stored chord, no guess in Chords -- Intervals path untouched
- [ ] `SetupPanel.tsx`, `ListenView.tsx`, `IntervalButtons.tsx`, css -- Practice control with Setup label, nine chips, `Which chord?`, reserved row
- [ ] Tests per matrix row, using seeded `random` in core and a fake engine for block and replay; Intervals tests unchanged
- [ ] Headless Chrome 1280 x 800 per `docs/development-notes.md`: piano and guitar, light and dark, Setup open and shut, Intervals vs Chords; compare instrument top, `.status-note` and `scrollHeight`; then check Explore and Listen Intervals

**Acceptance Criteria:**
- Given Chords and Listen, when a question starts, then a chord from the pool plays as one block and `Which chord?` shows.

## Implementation Notes

## Spec Change Log

## Review Triage Log

| # | Layer | Finding | Verdict | Route | Evidence |
|---|-------|---------|---------|-------|----------|
| 1 | gap | The chords guards (guess, reveal, next, pressNote, useLitNotes) are tested only with no interval question, so removing them fails nothing | medium | patch | Every chord test starts from an empty `practice.question`; a test that starts from a revealed interval and a Fixed root is added. |
| 2 | gap | Switching back to Intervals does not assert the draw or the play | medium | patch | The restore test checks only `Which interval?`; assertions on the draw and `engine.plays` are added. |
| 3 | blind, gap | No test for `setPractice` in Explore; the Explore round trip test does not check the mode changed | low | patch | `m` is the mode key (`useShortcuts.ts:53`); the Explore view is asserted between the presses and the lazy first draw is tested. |
| 4 | edge | `setDirection` and `setRootMode` have no chords guard | low | rejected | The controls are disabled in Chords and no shortcut calls these actions (`useShortcuts.ts`), so no path reaches them. |
| 5 | edge, blind | An empty or unknown pool throws in `generateChordQuestion`; a range narrower than the chord gives no error | low | rejected | The last chip cannot be unticked, the pool starts at all nine, and the range is the constant `COMMON_RANGE`; a guard is extra branching for an unreachable state. |
| 6 | edge, blind | Switching practice starts playback with no engine stop; back to Intervals gives no cue | low | rejected | `engine.play` bumps the generation and replaces the sounding notes; restoring the interval question is the spec's rule. |
| 7 | edge, blind | `keepNote` can go stale; the interval chip group is labelled `Setup`; `SetupPanel` indentation and near-duplicate toggle code | low | rejected | Only the Practice group and the chips change the pool; the interval group label is unchanged code; re-indenting unchanged lines is what AGENTS.md forbids. |
| 8 | blind | `quality` is a bare string; `chordQuestion` is optional while `question` is nullable | low | rejected | Quality names are strings in `core/theory.ts` and the pool follows the interval pool's shape; the optional field keeps the existing exact-shape tests unchanged. |
| 9 | blind | Disabled Direction and Root and the inert Reveal have no explanation; the live regions are empty placeholders | low | rejected | Apor decided disabled controls and inert Reveal and Next on 2026-10-27; Story 5.2 fills the row and the hint. |
| 10 | blind | Chord chips show the raw quality names (`dom7`, `m7b5`) | low | rejected | The spec leaves the labels to the implementer and they are quality names, not chord names; noted for Apor. |

## Verification

**Commands:**
- `npm run check` -- expected: tsc, boundaries and tests pass
- `npm run build` -- expected: success
