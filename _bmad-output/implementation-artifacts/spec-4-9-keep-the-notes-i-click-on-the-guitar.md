---
title: 'Story 4.9: Keep the notes I click on the guitar'
type: 'feature'
created: '2026-10-27'
status: 'done'
baseline_commit: '990d0644a1cd09b861602e3abb422d209020cc9e'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** When Apor clicks three notes on the guitar that form a named chord, the app replaces them with a six-string barre voicing (Story 4.3 shows the best voicing for any named chord of three or more lit notes). He did not ask for the added notes.

**Approach:** A generated voicing and the stepper show only for a chord carried from the piano, that is when no lit note has a remembered guitar position. Notes clicked on the guitar stay exactly as clicked.

## Boundaries & Constraints

**Always:** The rule lives in `useShown` in `src/ui/session/useLitNotes.ts` and nowhere else: a generated voicing (and the stepper, Left and Right, and the voicing playback of Story 4.7) applies only when `Workspace.positions` holds no entry for any lit pitch. Otherwise the lit notes are drawn by the existing placement (`litPositions`, Stories 3.8 and 3.9) and a fret click follows the 3.8 rule. A hand-edited voicing (`Workspace.edited`, Story 4.6) is unaffected: it still shows, still has its stepper row and list, and a fret click still edits it. Nothing changes on the piano, in Listen, in `core/` or in the layout (the stepper row stays reserved); the reducer changes only in `selectVoicing`, which also drops `Workspace.positions` when it leaves a hand edit (an edit writes positions for its notes, and without this the arrow press of Story 4.6 would clear the edit but show no generated voicing). Names, roles, legend and the readout stay on the lit notes as today.

**Never:** No new reducer action or workspace field; no voicing offered for notes clicked on the guitar (no button, no key); no change to the generator, the ranking, the shapes, the 4.6 edit or the 4.7 playback rules.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Click a chord on the guitar | empty guitar, click C, E, G notes (three strings) | exactly those three notes, readout `C major`, no stepper, no added notes | N/A |
| Carry from the piano | C4 E4 G4 on the piano, swap | best-ranked voicing with the stepper, as in Story 4.3 | N/A |
| Edit a carried voicing | carried voicing, click a fret | edited voicing, `Voicing edited`, as in Story 4.6 | N/A |
| Leave an edit | edited voicing, press Left or Right | the first generated voicing for the edited pitches with `Voicing 1 of N`, as in Story 4.6 | N/A |
| Mixed | a piano chord, a guitar click on another string | every note shown by the 3.9 placement, no voicing, no stepper | N/A |
| Round trip | clicked chord, swap to the piano and back | the same clicked notes | N/A |
| Remove a clicked note | clicked chord, click one lit note again | that note unlights, the rest stay as clicked | N/A |
| Esc, Undo | clicked chord, Esc then Undo | the clicked notes return exactly | N/A |
| Play and Block | clicked chord on the guitar | the lit notes sound as today (block of the lit pitches), no strum | N/A |
| Listen | any | unchanged | N/A |
| Instrument does not move | clicked chord, carried chord, both themes | instrument top and Status note keep their place | N/A |

</frozen-after-approval>

## Code Map

- `src/ui/session/useLitNotes.ts` -- `useShown`: gate `shownOf(ranked, voicing)` on no lit pitch having an entry in `session.workspace.positions`; keep the `edited` branch first. `rankedVoicings` and the edit path keep working as they are.
- `src/core/model.ts` -- `Workspace.positions` (remembered guitar position per pitch); read only.
- `src/ui/session/useSessionActions.ts` -- `releaseNote` uses `voicingFrets`; with no shown voicing it falls through to the 3.8 rule, so no change expected.
- Tests: `tests/ui/explore/ExploreGuitar.test.tsx`, `ExploreEdit.test.tsx`, `ExploreStepper.test.tsx` (some may build a chord by guitar clicks and expect a voicing); `tests/ui/support/explore.ts`.

## Tasks & Acceptance

**Execution:**
- [ ] `useLitNotes.ts` -- gate the generated voicing on carried notes only
- [ ] Tests per matrix row; fix tests that built a chord on the guitar and expected a voicing (build it on the piano and swap instead)
- [ ] Headless Chrome 1280 x 800 -- click C, E, G on the guitar (no added notes), carry the same chord from the piano (voicing and stepper), both themes; compare instrument top and Status area

**Acceptance Criteria:**
- Given I click notes on the guitar that form a named chord, when the fretboard renders, then it shows exactly those notes and no voicing.

## Implementation Notes

## Spec Change Log

## Review Triage Log

| # | Layer | Finding | Verdict | Route | Evidence |
|---|-------|---------|---------|-------|----------|
| 1 | gap, blind, edge | The Mixed and Round trip matrix rows have no test | medium | patch | Fixed: a guitar click then piano keys then a swap shows every note by the 3.9 placement with no voicing; a clicked chord survives a swap to the piano and back. |
| 2 | gap, blind, edge | The carried-chord edit test lost its readout, legend and role assertions | low | patch | Fixed: exact frets before and after the edit, the readout, the legend and the roles are asserted again. |
| 3 | blind | The Esc and Undo test expects the same list both times | low | patch | Fixed: empty after Esc, the clicked notes after Undo. |
| 4 | blind | `positions` doubles as the clicked-on-the-guitar marker with no comment saying why | low | patch | Fixed: a comment above the `carried` line and above the reset in `selectVoicing`. |
| 5 | blind, edge | Leaving an edit drops every remembered position | false | rejected | An edit rewrites `positions` for all its notes, so nothing older exists to lose. |
| 6 | edge | A carried chord reduced to one note by edits cannot return to a voicing; `edited` without a voicing is decided by stale positions | low | rejected | One note has no voicing; `edited` is only set together with a voicing. |
| 7 | edge | `toggleNote` on a carried chord compares with a position that is not drawn | false | rejected | With a voicing shown a fret click is an edit (`releaseNote`), so `toggleNote` runs only when no voicing is drawn. |
| 8 | blind | Tests depend on the first lit note of the top voicing; playback logic not shown in the diff | low | rejected | Unchanged code; the playback choice already follows `voicingFrets`, which is undefined for a clicked chord. |

## Verification

**Commands:**
- `npm run check` -- expected: tsc, boundaries and tests pass
- `npm run build` -- expected: success
