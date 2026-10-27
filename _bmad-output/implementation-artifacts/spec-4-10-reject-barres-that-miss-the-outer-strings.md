---
title: 'Story 4.10: Reject barre shapes whose barre misses both outer strings'
type: 'feature'
created: '2026-10-27'
status: 'done'
baseline_commit: '18cb57241802c6cd1331bd8044eb1d0e04fdef8b'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Apor's review of 2026-10-27: some voicings are still very hard or impossible to reach, for example voicing 4 of C major, `8 7 5 5 5 8`. `fingersNeeded` counts the three notes at fret 5 as one barre finger (four fingers in all), but the barre sits on the middle strings while both outer strings are fretted higher.

**Approach:** A barre is real only when its strings include the lowest or the highest sounding string. A group of notes at the lowest fretted fret that does not is not a barre: each of its notes needs its own finger, and the existing four-finger limit then rejects the shape.

## Boundaries & Constraints

**Always:** The change lives in `fingersNeeded` (`src/core/voicings.ts`) and its comment. Rule: the notes at the lowest fretted fret count as one finger only when there are two or more, no open string lies between the outer two, and they include the lowest or the highest sounding string (a muted string is not sounding). `maxFingers` (4), the span, open-position, bass and register rules and `rankVoicings` are unchanged. Every instantiated template of `shapeFrets` must still be generated (a test already asserts it; verified for all 9 qualities and 12 roots).

**Never:** No change to `src/core/shapes.ts`, the ranking, the UI, the layout, Listen, or the hand edit of Story 4.6 (a hand-edited shape is not filtered). No fingering display. No other playability rule (stretch, wrist, fret position).

## I/O & Edge-Case Matrix

Golden rows, computed with the real code (register of C4 E4 G4, mean 63.67; E-based qualities at E4; frets low to high string, `x` muted). Apor to confirm.

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| C major, top 8 before | C4 E4 G4 | `8 10 10 9 8 8`, `x 3 5 5 5 3`, `x x x 5 5 3`, `8 7 5 5 5 8`, `x 3 5 5 5 0`, `x 3 5 0 5 3`, `8 10 10 9 8 x`, `x x 10 9 8 8` (30 voicings) | N/A |
| C major, top 8 after | C4 E4 G4 | `8 10 10 9 8 8`, `x 3 5 5 5 3`, `x x x 5 5 3`, `x 3 5 5 5 0`, `x 3 5 0 5 3`, `8 10 10 9 8 x`, `x x 10 9 8 8`, `x x 10 12 8 12` (28 voicings) | N/A |
| Good barres stay | `8 10 10 9 8 8`, `x 3 5 5 5 3`, open `x 3 2 0 1 0` | 4, 4 and 3 fingers, kept | N/A |
| Middle barre | `8 7 5 5 5 8` | 6 fingers, rejected | N/A |
| Already out | `8 7 5 5 8 8`, `3 2 3 0 3 3` | rejected (5 fingers before, 6 now for the first) | N/A |
| Fragment | `x x x 5 5 0` | still passes: its barre includes the lowest sounding string | N/A (decided by Apor on 2026-10-27: leave it to the ranking, where fragments already come last; no further rule) |
| E major, top 3 after | E4 G#4 B4 | `x 7 9 9 9 7`, `x x x 9 9 7`, `12 11 9 9 9 x` (before: the third was `12 11 9 9 9 12`) | N/A |
| High question chord | dim7 on 77 | 35 before, 32 after; first two unchanged `x x x 10 9 10`, `x 8 9 7 9 7` | N/A |
| No quality empty | 9 qualities x 12 roots | lowest count 10 (minor on Eb, was 12); per quality minimum: major 12, minor 10, dim 11, aug 12, maj7 18, 7 16, m7 15, m7b5 15, dim7 15 | fails the test if any is 0 |
| Templates | every `shapeFrets` instance | all still generated | fails the test |

</frozen-after-approval>

## Code Map

- `src/core/voicings.ts` -- `fingersNeeded`: add the outer-string condition to the barre test; update its comment and the `maxFingers` comment if they mention the barre.
- `src/core/shapes.ts` -- read only; every template still satisfies the rule.
- `tests/core/voicings.test.ts` -- `fingersNeeded` cases near lines 83-94 (`8 7 5 5 8 8` is now 6, not 5), the all-qualities finger-limit test, ranking rows.
- `tests/core/shapes.test.ts` -- the generated-template test must still pass unchanged.
- `tests/ui/explore/*` -- a first or Nth voicing may change; fix expectations only.

## Tasks & Acceptance

**Execution:**
- [ ] `src/core/voicings.ts` -- add the outer-string condition to `fingersNeeded`
- [ ] `tests/core/voicings.test.ts` -- cases: `8 7 5 5 5 8` is 6; `8 10 10 9 8 8`, `x 3 5 5 5 3`, `x 3 2 0 1 0` unchanged; update `8 7 5 5 8 8`; C major never lists `8 7 5 5 5 8`; every quality on every root keeps at least one voicing
- [ ] Fix UI test expectations that listed a removed voicing (assert the intent, not the old index)
- [ ] `_bmad-output/planning-artifacts/epics.md`, `epic-4-context.md` -- add the rule to the finger sentence

**Acceptance Criteria:**
- Given any chord, when the voicings are generated, then none has a barre of two or more notes that misses both the lowest and the highest sounding string while counting as one finger.
- Given the golden C major and E-major rows, when ranked, then the lists match the table.

## Review Triage Log

| # | Layer | Finding | Verdict | Route | Evidence |
|---|-------|---------|---------|-------|----------|
| 1 | blind | The negative-side test asserts a positive case (`x x x 5 5 0` is one finger), so the new rule's rejection has no direct test; muted outer strings, one-sided barres and a two-note middle barre are missing | medium | patch | Exact `fingersNeeded` cases added for each. |
| 2 | blind | Stale test titles ('rejects five fingers' for a value of 6; 'at least 10' asserting exactly 10) and an unexplained changed C7 expectation | low | patch | Titles renamed and a comment says the C7 pick moved because the middle-barre shape `8 7 5 5 5 6` is now rejected. |
| 3 | edge | An open outer string counts as the outer sounding string, so a barre beside it, such as `0 5 5 5 7 7`, is rejected | low | rejected | The spec's rule text says sounding string and an open string sounds; the open position allows no fret above 5, so `0 5 5 5 7 7` was never a generated voicing; all template shapes still generate. |
| 4 | edge, blind | Only the lowest-fret group is examined, so a higher barre is not considered; the physical rationale is thin; rule text is repeated in three places | low | rejected | Unchanged behaviour of `fingersNeeded` (Story 4.3); the rule was Apor's own and the golden rows are his; the repeated sentence is code comment and two doc lines that must agree. |
| 5 | blind | The golden tests are brittle and one subsumes another | low | rejected | The exact lists are the golden examples Apor confirmed on 2026-10-27; pinning them is the point. |
| 6 | blind | No test that templates satisfy `maxFingers` | low | false | The implementer confirmed every `shapeFrets` instance for every quality and root is still generated, and `shapes.test.ts` passes unchanged. |

## Design Notes

A middle barre such as `x 3 5 5 5 3` is fine because the fret-3 notes are the lowest fretted fret and include string 5; `8 7 5 5 5 8` has fret 7 and 8 notes on both outer strings above the barre, so the index finger cannot lie across them. Alternative (not chosen): reject the shape outright; counting each note as a finger gives the same result on the golden rows and keeps three-finger non-barre shapes like `0 x 5 5 5 x` legal.

## Verification

**Commands:**
- `npm run check` -- expected: tsc, boundaries and tests pass
- `npm run build` -- expected: success

**Manual checks:**
- Explore: carry C4 E4 G4 to the guitar and step; no `8 7 5 5 5 8`. No layout change, so no Chrome check.
