---
title: 'Story 5.2: Guess a chord quality'
type: 'feature'
created: '2026-10-27'
status: 'draft'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-5-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** After Story 5.1 Listen plays a chord in Chords practice but the answer row is empty, so Apor cannot test his ear on its quality.

**Approach:** Fill that row with one button per quality, keys `1` to `9`, reusing the interval guess flow: a correct guess names the quality and plays the next chord, a wrong one is marked and the question stays. No score, no reveal.

## Boundaries & Constraints

**Always:** Build on 5.1 (`Practice.chordQuestion`, `Settings.chordPool`, `Settings.practice`). Nine buttons in `CHORD_QUALITIES` order, keys `1`-`9`, in the existing `.interval-row`, with the Interval button classes and key-hint caps, so the row keeps its height. A quality is in play when it is in `Settings.chordPool` or is the answer; out-of-play buttons carry `data-out-of-pool` (opacity 0.55, never lower, and `aria-disabled`). A guess counts when in play, not yet tried, and the question is not revealed (same rule as `canGuess`, made generic in `src/core/guess.ts`, interval tests unchanged). Wrong: button gets `wrong`, `aria-disabled`, accessible name `Minor, tried`; hint `Minor is not it — try another.`; the chord is unchanged and `Space` still replays it. Correct: hint `Minor. Next chord is playing.` and a new chord is drawn from the pool with the 5.1 generator and played as a block. Hints sit in the existing polite `.guess-hint`; nothing shows a score or streak. Buttons are disabled when `practice.revealed` (5.3 sets it). A pool or practice change leaves the current question answerable; its answer stays in play. Wrong marks clear when a new chord is drawn.

**Never:** No change to the interval flow, `Practice.question`, `wrongMarks`, or `Workspace`. No Reveal or Next behavior: both stay inert in Chords until 5.3, as 5.1 decided. No chord name from anywhere but `nameChord` (button labels are fixed text, not a reading). No touch or narrow-viewport handling. No new dependency.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Correct guess | chord is minor, click Minor | hint `Minor. Next chord is playing.`, a new chord plays as one block, marks cleared | N/A |
| Wrong guess | chord is minor, click Major | Major marked wrong, name `Major, tried`, hint `Major is not it — try another.`, no sound, same chord | N/A |
| Repeat wrong guess | click Major again | nothing changes, no second mark | ignored |
| Pool-restricted | pool major, minor | all nine shown; seven at 0.55 opacity and `aria-disabled`; clicking them does nothing | N/A |
| Keys | press `1`-`9` | quality at that position guessed as by click; `0`, `-`, `=` do nothing; out-of-pool key does nothing | N/A |
| Pool change mid-question | answer minor, untick Minor | Minor stays clickable and correct; next chord follows the new pool | N/A |
| Revealed | `practice.revealed` true | all nine disabled | N/A |
| Intervals unchanged | practice Intervals, keys `1`-`9` | guess intervals as today; existing tests pass unmodified | N/A |
| Layout | Chords, both instruments, both themes, wrong state | instrument top, row and Status note do not move; no scroll at 1280 x 800 | N/A |
| Explore | switch away and back | same chord, wrong marks kept, workspace same reference | N/A |

</frozen-after-approval>

## Open Questions

- What the nine buttons say (hint text uses the same words) — options: short names `Major, Minor, Diminished, Augmented, Maj7, Dom7, Min7, m7♭5, Dim7` (match the epic's `Minor`, fit nine in a row; sevenths read as chord-chart shorthand) / spelled out `Major 7th, Dominant 7th, Minor 7th, Half-diminished, Diminished 7th` (clearer, but wider buttons and the row may crowd at 1280 px; `m7♭5` becomes `Half-diminished`, which the rest of the app does not use).

## Code Map

- `src/core/guess.ts` -- `inPlay`, `canGuess`: make generic over the guess type; strings for qualities.
- `src/core/theory.ts` -- `CHORD_QUALITIES` (`name` is the key); `src/ui/listen/intervalKeys.ts` -- `INTERVAL_KEYS` (first nine are `1`-`9`).
- `src/core/model.ts` -- `Practice`: add `chordWrongMarks`; `initialPractice`.
- `src/ui/session/session.ts` -- `Feedback` (add chord wrong and right kinds with the quality), `sessionReducer` (`guess`, `setQuestion` are the models): add `guessChord` (wrong mark and feedback) and one action for a correct guess that stores the new chord, clears marks and sets the right feedback; both touch `practice` and `feedback` only.
- `src/ui/session/useSessionActions.ts` -- `guess`, `startQuestion`, `playQuestion`: add `guessChord(quality)` drawing the next chord with `Math.random` like `startQuestion`.
- `src/ui/shortcuts/useShortcuts.ts` -- the `INTERVAL_KEYS` branch: in Chords route `1`-`9` to `guessChord`.
- `src/ui/listen/IntervalButtons.tsx` -- pattern to copy; new `ChordButtons.tsx` beside it, mounted where 5.1 reserved the row; `ListenView.tsx` -- hint wording; `listen.css` -- reuse `.interval-button`, `.wrong`, `[data-out-of-pool]`; add no opacity below 0.55.
- Tests: `tests/core/guess.test.ts`, `tests/ui/session/session.test.ts` (workspace and interval `question` same reference), `tests/ui/listen/ListenView.test.tsx`, `tests/ui/shortcuts/`; helpers `tests/ui/support/{sessions,fakeEngine}.ts`.

## Tasks & Acceptance

**Execution:**
- [ ] `guess.ts`, `model.ts`, `session.ts` -- generic guess rule, `chordWrongMarks`, chord actions -- reducer tests assert `workspace` and `question` untouched by reference
- [ ] `useSessionActions.ts`, `useShortcuts.ts` -- `guessChord`, keys `1`-`9` in Chords -- Intervals path untouched
- [ ] `ChordButtons.tsx`, `ListenView.tsx`, `listen.css` -- row, wrong treatment, hints
- [ ] Tests per matrix row, seeded `random` where core is used, fake engine for the next-chord block
- [ ] Headless Chrome 1280 x 800 per `docs/development-notes.md`: piano and guitar, light and dark, waiting and wrong states, restricted pool; compare instrument top, `.interval-row`, `.status-note`, `scrollHeight`; then Explore and Intervals

**Acceptance Criteria:**
- Given chord Listen with a question, when I click the right quality, then the hint names it with no praise and the next chord plays.

## Verification

**Commands:**
- `npm run check` -- expected: tsc, boundaries and tests pass
- `npm run build` -- expected: success
