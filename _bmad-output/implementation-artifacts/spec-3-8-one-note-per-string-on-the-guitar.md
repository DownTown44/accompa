---
title: 'Story 3.8: One note per string on the guitar'
type: 'feature'
created: '2026-10-25'
status: 'done'
baseline_commit: 'e20c9b8f9a08616678878372f3693e14e3c69471'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Explore on the guitar lets two lit notes share a string (retro finding 15), so the fretboard can show a shape no hand can play, which FR-16 rules out for voicings in Epic 4.

**Approach:** Explore on the guitar holds at most one lit note per string. A click on a string that already holds a lit note replaces that note. The click rule is one pure function in `core/explore.ts`; Story 3.9 (the swap from the piano) is built after this one and reuses it.

## Boundaries & Constraints

**Always:** The rule applies to guitar clicks only; the replaced note is unlit everywhere (`Workspace.pitches` is the one list), so the piano, readout, markers, legend, Play and Block follow, and it loses its remembered position. No Status note: the click is visible. The occupant of a string is the lit pitch whose shown position (`litPositions`) is on it; notes beyond the fretboard have no string. A move of a lit note to another string replaces that string's note too. The 8-note cap still unlights the oldest. The chosen reading is kept only while still named; a chosen root goes if its pitch is replaced. Esc and Undo carry the whole workspace (notes, positions, reading, root). `exploreReading` and `nameChord` keep taking `Pitch[]`. The instrument does not move.

**Never:** No change to the swap, `litPositions`' placement of unremembered notes, the Status note, Listen, `nameChord`, spelling or playback; no voicings; no `ui/` import or `Math.random` in `core/`; no change to `PianoKeyboard`, `Fretboard`, `RoleMarker`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Free string | guitar, C4 at s3 f5, click E4 open s5 | E4 lights, both lit | N/A |
| Same string | C4 at s3 f5, click D4 at s3 f7 | C4 unlit on both instruments, D4 lit at s3 f7; readout reads D4 | N/A |
| Move onto taken string | C4 s3 f5, B3 s4 f0, click lit C4 at s4 f1 | B3 unlit, C4 at s4 f1; one note | N/A |
| Move within string | C4 at s3 f5, click lit C4 at its only other string | position moves, nothing replaced | N/A |
| Unlight | click a lit note at its own position | unlit as today | N/A |
| Pictured chord | Cmaj7 C4 E4 G4 B4 lit (guitar), click a fret on E4's string | the E replaced; reading, legend and markers follow the three remaining plus the new note | N/A |
| Root replaced | root E4 chosen, E4 replaced | root cleared, reading falls back as for an unlit root | N/A |
| Beyond the fretboard | C2 lit (no string), click any string | C2 stays, no string taken | N/A |
| Cap | 8 lit, click a free string | oldest unlit as today | N/A |
| Undo, Esc | Esc then Undo after a replace | notes, positions, reading, root restored | N/A |
| Piano | click on the piano | unchanged | N/A |
| Listen | any | unchanged | N/A |
| Instrument does not move | before, after a replace, 0 to 6 notes, both instruments, both themes | instrument top and Status note area keep their place | N/A |

</frozen-after-approval>

## Code Map

- `src/core/explore.ts` -- `litPositions`, `toggleLit`, `RememberedPositions`. Add `pitchesOnString(lit, remembered, string)` (the occupants by shown position) and use it in the click rule; 3.9 builds its placement beside it.
- `src/ui/session/session.ts` -- `toggleNote`: the position-move branch and the light branch drop occupants of `position.string` (other than the clicked pitch), then `keep` prunes positions, `pruneReading`, root kept only while lit.
- `src/ui/session/useSessionActions.ts` -- `releaseNote` passes the position; unchanged.
- Tests: `tests/core/explore.test.ts`, `tests/ui/session/*`, `tests/ui/explore`; helpers `press`, `click`, `lit`, `rooted`.

## Tasks & Acceptance

**Execution:**
- [x] `core/explore.ts`, `ui/session/session.ts` -- occupant function, replace in both branches
- [x] Tests per matrix row, with reducer reference checks
- [x] Headless Chrome 1280 x 800 -- picture same-string replace and a chord with one replaced, guitar and piano, light and dark; compare instrument top and Status area

**Acceptance Criteria:**
- Given a note lit on a string, when I click another fret on it, then the string holds only one lit note and the readout, markers and legend follow the notes that remain.

## Review Triage Log

| # | Layer | Finding | Verdict | Route | Evidence |
|---|-------|---------|---------|-------|----------|
| 1 | edge | After a replacement leaves exactly two notes with no remembered position, `litPositions` re-pairs them by the closest-pair rule, which can put them on one string | medium | defer | The spec leaves `litPositions` unchanged by design; Story 3.9 replaces that placement. A matrix row ("After a click replaces a note") was added to the 3.9 draft so it is covered there. |
| 2 | blind | Replacing gives no cue (no Status note or announcement) | false | rejected | Apor's decision: replace, no Status note, since the click is visible; Esc then Undo restores. |
| 3 | edge | The move branch leaves `rootArmed` unchanged | false | rejected | The moved note stays lit, so the toggle branch's `next.length > 0 && armed` is also true there. |
| 4 | edge | The replace rule is an inline closure, not a core function Story 3.9 can reuse | false | rejected | The spec puts only the occupant lookup (`pitchesOnString`) in 3.8 and the placement function in 3.9. |
| 5 | edge | A moved note whose shown position is null skips the unlight check | low | rejected | A cell exists only for playable pitches; no input reaches it. |
| 6 | blind | The move branch repeats the `pruneReading` workspace construction | low | rejected | Six lines inside one function; no divergence shown. |
| 7 | blind | Missing session tests: piano click replaces nothing, a surviving root is kept on a move, `cleared` resets | low | rejected | The piano path is unchanged and covered by the existing tests; the replaced-root case is covered; no failing input shown. |
| 8 | blind | `pitchesOnString` relies on `litPositions` alignment and default positions may shift after a removal | low | rejected | The first part is the same finding as 1; alignment is by construction (one entry per lit pitch). |
| 9 | blind | Local `roleAt` helper in `ExploreGuitar.test.tsx`; `fireEvent` for Undo | low | rejected | Cosmetic; `roleOf` looks up by pitch and guitar cells carry a position. |
| 10 | blind | The removed "allows two on one string" test has no note | false | rejected | The matrix replaces it and the spec's frozen block records the reversal. |
