---
title: 'Story 3.4: Play the chord as a block or an arpeggio'
type: 'chore'
created: '2026-10-25'
status: 'done'
baseline_commit: '07f7dc56af739f90bb8d320200fa7de058aab704'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 3.4 asks that Block and Play sound a lit chord together or low to high. Stories 2.2 and 3.5 already built this for any count, so nothing is missing in behavior; what is missing is tests that pin it for chords of three to eight notes.

**Approach:** Add no behavior and no layout change. Pin the story's four acceptance criteria with tests at the engine and UI level, then mark the story done.

## Boundaries & Constraints

**Always:** Play (`Space`, arpeggio) and Block (`Enter`, primary) keep their current look, key hints, `aria-keyshortcuts` and focus order. Both sound the lit pitches sorted low to high, whatever the click order. Nothing lit plays nothing and raises nothing. The engine owns timing; callers pass no timestamps. Playback uses the lit pitches only: the chosen reading or root (3.3, 3.6) does not reorder or change the sound.

**Decisions (Apor):** Scope is verification only: tests only, no source change. The arpeggio keeps its 0.55 s steps for every count.

**Never:** No Arpeggio button or `A` key. No change to `engine.ts`, `synth.ts` timing constants, or the `play` and `revealOrNext` actions unless a new test exposes a bug. No source edits for their own sake.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Block | E4 G4 C4 lit, `Enter` or Block click | engine gets `[60,64,67]` as `block`; one start time | N/A |
| Play | same notes, `Space` or Play click | engine gets `[60,64,67]` as `arpeggio`; start times strictly rising | N/A |
| Long chord | 8 notes lit, Play | eight oscillators, steps equal, order low to high | N/A |
| Nothing lit | `Space`, `Enter`, button clicks | no engine call, no error; buttons stay `aria-disabled` | N/A |
| Audio blocked | chord lit, Play | Status note `Press any key to wake the sound.` | existing path |
| Chosen reading | dim7 with another reading chosen | same sorted pitches sound | N/A |

</frozen-after-approval>

## Code Map

- `src/ui/explore/ExploreControls.tsx` -- Play and Block buttons, `aria-keyshortcuts`, `aria-disabled` when empty. Reuse; do not change.
- `src/ui/session/useSessionActions.ts` -- `playLit(mode)` sorts `workspace.pitches` and skips an empty list; `play` and `revealOrNext` call it in Explore.
- `src/ui/shortcuts/useShortcuts.ts` -- `Space` and `Enter` yield to a focused control. Reuse.
- `src/audio/synth.ts` -- `ARPEGGIO_STEP` 0.55 s, `NOTE_LENGTH` 1.2 s; peak gain divided by the square root of the count. Reuse.
- `src/ui/app/App.tsx` -- Status note wake message when audio is blocked.
- Tests to extend: `tests/audio/synth.test.ts` (has two-note arpeggio, descending list, three-note block), `tests/ui/explore/ExploreControls.test.tsx` (pair only), `tests/ui/explore/ExploreView.test.tsx` (three-note Play and Block at line ~144), `tests/ui/app/BeyondFretboard.test.tsx` (wake note). Helpers in `tests/ui/support/` (`fakeEngine.ts`, `keys.ts`, `dom.ts`).
- Working tree note: Story 3.6 is being built on another branch; this story touches tests only.

## Tasks & Acceptance

**Execution:**
- [x] `tests/audio/synth.test.ts` -- eight-note arpeggio has strictly rising, equal-step start times; eight-note block starts together -- long-chord timing
- [x] `tests/ui/explore/ExploreControls.test.tsx` -- rows for Block, Play, nothing lit, key hints (`Space`, `Enter`) and `aria-keyshortcuts`, unsorted click order, chosen reading unchanged -- matrix
- [x] `tests/ui/explore/ExploreControls.test.tsx` -- chord lit with audio blocked shows the wake note -- blocked path

**Acceptance Criteria:**
- Given a chord of three to eight notes is lit, when Block sounds, then all notes start together.
- Given the same chord, when Play sounds, then notes start one after another from low to high.
- Given nothing is lit, when I press the play keys, then nothing plays and nothing errors.
- Given audio is blocked, when I play, then the wake note shows.

## Verification

**Commands:**
- `npm run check` -- expected: pass

## Review Triage Log

| # | Layer | Finding | Verdict | Route | Evidence |
|---|-------|---------|---------|-------|----------|
| 1 | blind, edge | The arpeggio test checks equal steps but not the 0.55 s step Apor chose | medium | patch | Fixed: the first step is asserted with `toBeCloseTo(0.55, 10)`; no other test pinned `ARPEGGIO_STEP`. |
| 2 | blind, edge | The reading test never proves the reading changed; the `!` hides a missing button | medium | patch | Fixed: alternatives asserted before the click and the large readout text differs after it. |
| 3 | edge | The wake-note test passes if the note is always shown | medium | patch | Fixed: starts idle, asserts no wake text, plays, then blocks the engine and asserts the text. A `'blocked'` fake shows the note at once, so the order differs from the review's suggestion. |
| 4 | blind | Synth tests never pass unsorted input; sorting is untested in the engine | false | rejected | `playLit` sorts before calling the engine; the UI tests assert the sorted lists and the synth is meant to play the given order. |
| 5 | blind | Gain, headroom, `currentTime`, overlap with a previous chord, one-note arpeggio, duplicates | low | rejected | Production behaviour outside a tests-only story; the earlier synth tests cover gain scaling and single notes. |
| 6 | blind, edge | Chord sizes 5 to 7, repeated pitch classes, Block at eight notes | low | rejected | The sort is count-free and pinned at 3, 4 and 8; no failing input shown. |
| 7 | blind, edge | Focus yield: Enter or Space on a focused button double-fires | false | rejected | Shortcuts yielding to a focused button is covered since Story 2.2. |
| 8 | blind | Static key-hint test; disabled buttons with no notes; accessible names | low | rejected | The nothing-lit row is covered by an existing test; the hint test pins what the spec lists. |
| 9 | edge | Task list implies new nothing-lit tests | low | rejected | The spec's matrix row is satisfied by the existing test; no new test was needed. |
