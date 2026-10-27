---
title: 'Story 5.3: Reveal the chord on the instrument'
type: 'feature'
created: '2026-10-27'
status: 'done'
baseline_commit: '533c5afbfa2ebab2d3e242c6635e9f8e68d13a9a'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** In Chords, Reveal and Next are inert (5.1), so Apor hears a chord and guesses its quality but cannot see the chord lit, or move on without guessing right.

**Approach:** Reveal (`Enter` or click) names the chord and lights it on the active instrument with role shapes and the legend: the exact question keys on the piano, the best-ranked voicing in the question's register on the guitar. Next draws and plays a new chord.

## Boundaries & Constraints

**Always:** Build on 5.1 and 5.2 (check their real names in the tree; the spec names are `Practice.chordQuestion`, `chordWrongMarks`, `ChordButtons`). Add `Practice.chordRevealed`, separate from `revealed`, so an interval reveal never shows in Chords and the reverse; 5.2's chord paths (`ChordButtons`, `guessChord`, `chordRight`) read it instead of `revealed`. New actions `revealChord` and a draw that resets it (`setChordQuestion`) touch `practice` and `feedback` only; reducer tests assert `workspace` and `question` are the same reference. The name comes from `exploreReading(question.pitches, undefined, question.root)` (the namer and spelling, never a second reading; no double accidentals). Lit state derives from `useLitNotes`, so it survives an instrument swap, Explore round trip and Space replay. Guitar: `rankedVoicings` with `mean(question.pitches)`, root chosen, first entry via `shownOf`/`voicingNotes`; open and muted markers drawn as in Explore; no stepper, no voicing list, no edit on fret click in Listen. Space and the heard sound stay the plain block of `question.pitches`. The readout, legend and instrument keep Listen's block height. Reveal and Next stay silent except Next's new chord. `Space` (Play again) after a reveal replays the heard plain block, on both instruments, even when the guitar shows a voicing with extra notes (decided by Apor on 2026-10-27).

**Never:** No change to `Workspace`, `Practice.question`, the one-lit-note-per-string rule, `placeLit`, the generator, ranking or shapes (a reveal is not a workspace edit). No score, counter or praise. No strum. No stepper in Listen. No touch or narrow-viewport handling. No new dependency. No `Math.random` in `src/core`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Piano reveal | question C4 E4 G4 (60 64 67), press Enter | keys 60, 64, 67 lit, 60 ringed, 64 diamond, 67 square; readout the namer's C major symbol; legend root, 3rd, 5th; button reads Next; name in the polite region | N/A |
| Guitar reveal | same question, guitar | first of `rankVoicings(generateVoicings(C major), 63.67, 6, shapeFrets)`, not a hand-set fret list (expected a bucket-0 shape such as x35553 rather than open C; implementer confirms); roles on its notes, root ringed, muted strings marked, no stepper | N/A |
| High register | dim7 on 77 (77 80 83 86) | piano window shifts to include all four; guitar shows the voicing nearest that register (upper neck) | N/A |
| No voicing | a quality and root with no playable voicing, if the sweep of 9 qualities x 12 roots finds one | guitar shows no notes and the existing `No voicing fits these notes.` note; readout and legend still show | Guard only if the sweep finds none |
| Next after reveal | revealed, Enter | new chord from the pool plays as one block, notes unlit, button Reveal, marks cleared | N/A |
| Correct guess then Next | guess right (5.2 plays the next chord, no reveal), then Enter | reveals the new chord; Enter again draws another | N/A |
| Buttons | revealed | all nine answer buttons disabled | N/A |
| Swap | revealed, press instrument key | same chord lit on the other instrument, name unchanged | N/A |
| Explore round trip | revealed, Explore, back | still revealed, workspace same reference | N/A |
| Intervals and Explore | any | unchanged; existing tests pass unmodified | N/A |
| Layout | Chords, both instruments, both themes, waiting and revealed | instrument top and Status note do not move; no scroll at 1280 x 800 | N/A |

</frozen-after-approval>

## Code Map

- `src/core/model.ts` -- `Practice`, `initialPractice`: add `chordRevealed`.
- `src/ui/session/session.ts` -- `sessionReducer` (`reveal`, `setChordQuestion`, `chordRight`, `guessChord`), `fitRevealed` (uses `question.pitches` only; it cannot see `settings.practice`, so choose how it fits `chordQuestion.pitches` without shifting for a hidden chord).
- `src/ui/session/useSessionActions.ts` -- `reveal`, `next`, `revealOrNext`, `startChordQuestion`, `guessChord`: drop the `practice === 'chords'` returns, add the chord branch.
- `src/ui/session/useLitNotes.ts` -- `useLitNotes`, `rankedOnce`, `shownOf`, `voicingNotes`: add a Listen chord-reveal branch; `useShown` stays Explore-only so the stepper cannot appear.
- `src/ui/listen/ListenControls.tsx` (`aria-disabled`, Next label), `ListenView.tsx` (chord readout, legend, spoken name), `ChordButtons.tsx` (disabled when revealed), `src/ui/shortcuts/useShortcuts.ts` (`Enter`).
- `src/ui/instruments/guitar/GuitarStage.tsx` (`exact` is Explore-only; include the chord reveal), `src/ui/app/App.tsx` (`offscreen`/`noVoicing` note), `PianoStage.tsx` (roles already read).
- `src/ui/explore/ExploreView.tsx`, `explore.css` -- the `role-legend` markup and CSS: extract a `RoleLegend` into `src/ui/shared` (boundaries) with Explore output unchanged.
- `src/core/explore.ts` (`exploreReading`, `readingRootedOn`), `voicings.ts` (`generateVoicings`, `rankVoicings`, `mean`, `VOICING_RULES`), `shapes.ts` (`shapeFrets`), `spelling.ts` -- reused, not edited.
- Tests: `tests/ui/session/session.test.ts`, `tests/ui/listen/ListenView.test.tsx`, `tests/ui/shortcuts/`, `tests/ui/support/{sessions,fakeEngine}.ts`.

## Tasks & Acceptance

**Execution:**
- [ ] `model.ts`, `session.ts` -- `chordRevealed`, `revealChord`, reset on a new draw, piano window fit -- reducer tests assert `workspace` and `question` untouched by reference
- [ ] `useSessionActions.ts`, `useShortcuts.ts`, `ListenControls.tsx`, `ChordButtons.tsx` -- Reveal, Next, `Enter`, disabled buttons in Chords -- interval path untouched
- [ ] `useLitNotes.ts`, `GuitarStage.tsx`, `App.tsx` -- chord reveal lights from the question; guitar voicing in its register -- no stepper
- [ ] `ListenView.tsx`, shared `RoleLegend` -- name, legend, polite announcement
- [ ] Tests per matrix row (seeded `random`, fake engine); a sweep of 9 qualities x 12 roots for a voicing; piano and guitar first voicing equal the ranked call
- [ ] Headless Chrome 1280 x 800 per `docs/development-notes.md`: piano and guitar, light and dark, waiting and revealed; compare instrument top, `.interval-row`, `.status-note`, `scrollHeight`; then Explore and Listen Intervals

**Acceptance Criteria:**
- Given a chord question, when I press `Enter`, then the chord is named and lit with roles on the active instrument, and `Enter` again plays a new chord and unlights it.

## Implementation Notes

## Spec Change Log

## Review Triage Log

| # | Layer | Finding | Verdict | Route | Evidence |
|---|-------|---------|---------|-------|----------|
| 1 | gap, blind, edge | The `chords` flag passed by `selectMode`, `selectInstrument` and `toggleInstrument` is untested; dropping it fails nothing | medium | patch | A high chord revealed on the guitar would be off the piano window after a swap; tests added for the swap, the radio and `m`, each checked to fail without the flag. |
| 2 | gap, blind | The Status note for a revealed guitar chord, and the no-voicing path, are not asserted | medium | patch | `App.tsx` now reads `lit.positions !== undefined`; assertions added. |
| 3 | blind | The revealed name is compared only with `exploreReading` (circular) | medium | patch | Golden symbols for the nine qualities on C are asserted. |
| 4 | blind | "Next draws a new chord" runs with `Math.random` at 0 and cannot show a change; Reveal and Next by click are untested | low | patch | A random sequence and button clicks are added. |
| 5 | blind | The legend row appears on reveal and may move the layout | low | false | The Chrome check at 1280 x 800 in waiting and revealed states, both instruments and themes, held the instrument top at 366 and the Status note in place with no scroll. |
| 6 | blind, edge | Practice switched to Chords with a chord already revealed does not refit the piano window or plays the chord again | low | rejected | Needs a reveal, a practice switch, an interval reveal that moves the window and a switch back; the replay on a practice change is the specified behaviour; the refit adds a dispatch and a parameter for a rare path. Noted. |
| 7 | blind | The `App.tsx` offscreen branch change alters the Explore case | low | false | In Explore `useLitNotes` always returns `positions`, so the condition is true exactly as before; Listen intervals return none. |
| 8 | edge | No readout fallback if `exploreReading` returns none; `next` throws if no question; `chords` flag optional | low | rejected | The question pitches are always a named chord and the pool is never empty (5.1); the optional flag defaults to the interval behaviour that existed before. |
| 9 | blind | The chord name is announced twice for screen readers; the legend and voicing are not announced | low | rejected | The hidden name plus the polite region mirrors the interval reveal; announcing the legend is not in the spec. |
| 10 | edge | The spec lists `useShortcuts.ts` as changed but the diff does not touch it; 5.1 and 5.2 chord tests were rewritten | low | rejected | `Enter` already routes through `revealOrNext`, which now branches on the practice; the spec reverses 5.1's inert rule, so four 5.1 and 5.2 tests had to change. |

## Verification

**Commands:**
- `npm run check` -- expected: tsc, boundaries and tests pass
- `npm run build` -- expected: success
