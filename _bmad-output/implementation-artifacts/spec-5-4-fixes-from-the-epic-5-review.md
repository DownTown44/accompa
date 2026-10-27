---
title: 'Story 5.4: Fixes from the Epic 5 review'
type: 'feature'
created: '2026-10-27'
status: 'in-review'
baseline_commit: '18cb57241802c6cd1331bd8044eb1d0e04fdef8b'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** In chord Listen a correct guess plays the next chord at once, so Apor never sees the chord he just named. The Setup chips print raw names (`dom7`, `m7b5`, `major`) while the answer buttons print longer ones (`Major`, `Diminished`), and the high dim7 guitar reveal has no test that pins what it shows.

**Approach:** A correct guess reveals the chord like Reveal does and waits for Next. One short name per quality, from `qualityLabel`, on chips, buttons and hints. One test pins the high dim7 guitar voicing.

## Boundaries & Constraints

**Always:** Decided by Apor, 2026-10-27:
1. A correct chord guess reveals exactly as Reveal does (piano keys or guitar voicing lit, name, legend, nine buttons disabled, the button reads Next, piano window fitted) and shows the hint `Min.` (the short quality name and a full stop; `Next chord is playing.` is dropped). The next chord plays only on Next (Enter or the button). This reverses the Story 5.2 rule "a correct guess plays the next chord".
2. A wrong guess is unchanged: button marked, hint `Min is not it — try another.`, no reveal, chord unchanged, no sound.
3. Names are `Maj, Min, Dim, Aug, Maj7, Dom7, Min7, m7♭5, Dim7` on the Setup chord chips, the answer buttons and the hints, from `qualityLabel` only (`chordLabels.ts`; replace its `Major`, `Minor`, `Diminished`, `Augmented`; the rest stay). Chip accessible names follow the label.
4. Accepted deviation, not a fix: the `77 80 83 86` (F dim7) row of the Story 5.3 spec shows on the guitar a 3-note best voicing at or below fret 12, dropping the 5th and sitting below the question register (65 68 74 against 77 to 86). The 12-fret limit of Epic 4 and the ranking cause it; the question range stays uncapped on purpose, to train the ear beyond guitar registers. A test asserts the actual literal frets once. The 5.3 spec is not edited.

The wrong marks stay shown after the reveal as today. Setup chip edits touch the creation lines only; no re-indent of untouched lines (AGENTS.md no-reflow pitfall). Check Intervals Listen and Explore after the change.

**Never:** No change to Intervals, Explore, `src/core`, the generator, the ranking or the voicing rules. No score or praise. No new setting. No touch, phone or narrow-viewport handling. No second label table.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Correct guess reveals | chord asked (min), click or key `Min` | chord lit on the active instrument, name and legend shown, nine buttons `aria-disabled`, button reads Next, no sound, question unchanged | N/A |
| Hint wording | same | hint `Min.`; never `Next chord is playing.` | N/A |
| Wrong guess unchanged | guess `Dim7` on min | hint `Dim7 is not it — try another.`, `Dim7, tried`, no reveal, no sound, chord unchanged | repeat click ignored |
| Next after a correct reveal | revealed after a correct guess, Enter or click Next | a new chord plays once as a block, unrevealed, marks and hint cleared | N/A |
| Reveal after a wrong guess | wrong guess then Reveal | reveals as today, hint cleared | N/A |
| Buttons disabled after reveal | revealed | all nine disabled, clicks and keys 1 to 9 do nothing | N/A |
| Same labels | chips and buttons | both print `Maj Min Dim Aug Maj7 Dom7 Min7 m7♭5 Dim7` | N/A |
| Setup chips | Chords practice, Setup open | nine chips with the short names; toggling and the last-chip rule as today | N/A |
| High dim7 literal frets | question `77 80 83 86`, guitar, revealed | lit exactly `3:10 4:9 5:10` (string:fret, three lowest strings muted), no 5th shown | N/A |
| Intervals unchanged | Intervals practice | guess, Reveal, Next and hints as today | N/A |
| Explore unchanged | any | unchanged | N/A |
| Layout | Listen chords, waiting, wrong, revealed, both instruments and themes, 1280 x 800 | instrument top and Status note keep their place; no page scroll | N/A |

</frozen-after-approval>

## Code Map

- `src/ui/session/session.ts` -- `chordRight` currently stores the next question and clears marks; change it to reveal the current chord (set `chordRevealed`, `fitRevealed(..., true)`, keep marks) with `feedback: { kind: 'chordRight', quality }` and no new question. `revealChord` and `setChordQuestion` stay. Same-state guard `chordRevealed` stays.
- `src/ui/session/useSessionActions.ts` -- `guessChord`: on a correct quality dispatch `chordRight` only (drop `generateChordQuestion` and `engine.play`); `next` and `revealOrNext` already start a chord from a revealed state.
- `src/ui/listen/ListenView.tsx` -- `chordRight` hint becomes `${qualityLabel(quality)}.`
- `src/ui/listen/chordLabels.ts` -- the short names; update the comment.
- `src/ui/setup/SetupPanel.tsx` -- chip text from `qualityLabel(quality.name)`. Feature code may share only through `src/ui/shared`, so move `chordLabels.ts` to `src/ui/shared/chordLabels.ts` and update the imports in `ChordButtons.tsx`, `ListenView.tsx` and the test; `npm run check` enforces it.
- `src/ui/listen/ChordButtons.tsx`, `ListenControls.tsx` -- no change expected; the buttons already follow `chordRevealed`.
- Tests to change (they encode the old rule or the old names):
  - `tests/ui/chordGuess.test.tsx`: `names the quality on a correct guess and plays the next chord as a block` (now reveals, hint `Maj.`, no plays); `dims out-of-pool buttons...` and `guesses with keys 1 to 9...` (hint `Min. Next chord is playing.`); the reducer test `stores the next chord, clears marks and names the quality` (now reveals and keeps the question); `askMinor` and every `named('Major'|'Minor'|'Dim7')`, the nine-label list at the top and `chip('major')` lookups; the `qualityLabel` import path and its `not.toBe(q.name)` test (`Dom7` is not `dom7`, still true; `Maj7` equals `maj7` only by case, check).
  - `tests/ui/chordPractice.test.tsx`: the chips list (`['major', ... 'm7b5', 'dim7']`), the `not.toContain('major')` line and every `chip('major'|'minor')`.
  - `tests/ui/chordReveal.test.tsx`: new tests only, plus the high dim7 literal-frets test.
  - `tests/ui/support/setupPanel.ts`: `chip(name)` matches `textContent`; callers pass the short name.
- `tests/ui/setup/SetupPanel.test.tsx`, `ModeSeparation.test.tsx`: check for chord chip names.

## Tasks & Acceptance

**Execution:**
- [ ] `src/ui/session/session.ts`, `useSessionActions.ts`, `ListenView.tsx` -- correct guess reveals and shows `Min.`; Next plays the next chord
- [ ] `chordLabels.ts` (moved to `src/ui/shared`), `SetupPanel.tsx`, `ChordButtons.tsx` -- one short label source on chips, buttons, hints
- [ ] Tests -- update the cases listed in the Code Map; add one per matrix row (reveal by click and by key, no sound on a correct guess, Next plays one new block after it, Reveal after a wrong guess, chips equal buttons labels, high dim7 literal frets `3:10 4:9 5:10` with the muted strings, reducer reference checks that `workspace` and the interval half stay untouched)
- [ ] Headless Chrome 1280 x 800 (`docs/development-notes.md` recipe), because button widths change -- waiting, wrong, correct-revealed, both instruments, both themes; instrument top and Status note identical, no scroll; chips fit without wrapping changes in Setup

**Acceptance Criteria:**
- Given I guess the right quality, when the guess lands, then the chord is shown and nothing plays until I press Next.
- Given any chord quality, when it appears as a chip, a button or a hint, then it uses the same short name.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Design Notes

A correct guess reuses the reveal path, so the piano window fit and the legend need no new code. Marks stay after a correct reveal, as they do after Reveal. The question range stays uncapped on purpose, so the high dim7 guitar reveal stays a low 3-note shape; the new test fails loudly if the ranking or the 12-fret limit ever changes it.

## Verification

**Commands:**
- `npm run check` -- expected: tsc, import boundaries and tests pass
- `npm run build` -- expected: succeeds

**Manual checks (if no CLI):**
- Headless Chrome at 1280 x 800 on the built app: instrument top and Status note do not move across waiting, wrong and revealed states; the page does not scroll.
