---
title: 'Story 3.9: Carry piano notes to the guitar one per string'
type: 'feature'
created: '2026-10-25'
status: 'done'
baseline_commit: '08c7eb5f4e94a47455936c34622737d55a2ce048'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Swapping from the piano places lit notes by `litPositions`, which can put several on one string (two notes pair on one string on purpose), and the piano may light 7 or 8 notes for six strings.

**Approach:** Built after Story 3.8, beside its string rule in `core/explore.ts`. The swap places the lit notes one per string and says what it left out. Left-out notes stay lit, so swapping back restores them.

## Boundaries & Constraints

**Always:** One pure placement function returns the positions and the left-out pitches. Order: each note takes its remembered position if that string is free; the rest go lower pitch first, each to a free string at its lowest fret, so a free string beats a clash; a note with no free string is left out, the newest first when more are lit than strings. Left-out notes stay in `Workspace.pitches`: the piano, Play and Block, the readout, legend and chosen reading and root still use all lit notes; only the guitar markers omit them. The swap writes no positions; a left-out note has none. The piano is unchanged (a 7th and 8th note still light). Notes beyond the fretboard take no string and count separately. One Status line: `1 note left out: one note per string`, with beyond notes `2 notes lit beyond the fretboard, 1 left out` (either part alone reads as today); it ranks where `beyondFretboard` does. A click on a string (Story 3.8) replaces the occupant, so a left-out note may then be unlit by the rule or stay hidden. Esc and Undo carry the whole workspace. The instrument does not move.

**Never:** No change to the 3.8 click rule, `nameChord`, Listen, playback or the piano's `MAX_LIT`; no voicing search; no `ui/` import or `Math.random` in `core/`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Clash avoided | piano B3 C4, swap | each on its own string; no Status note | N/A |
| After a click replaces a note | a guitar click on another note's string leaves exactly two notes with no remembered position (for example B3 and C4) | the two are shown on different strings, not the closest-pair shared string | N/A |
| Left out | piano E2 F2 (both sound only on string 0), swap | lower E2 keeps string 0, F2 left out, Status `1 note left out: one note per string` | N/A |
| Remembered kept | C4 clicked at s3 f5, E4 at s5 f0, round trip | same positions if free | N/A |
| Seven notes | 7 lit on piano, swap | six shown, newest left out, Status says so, piano still shows 7 | N/A |
| Swap back | guitar with a left-out note, swap to piano | all lit notes show | N/A |
| Beyond and left out | C2 beyond, one clash | `1 note lit beyond the fretboard, 1 left out` | N/A |
| Reading and root | left-out note is the root or a third | readout, legend and chosen root unchanged | N/A |
| Undo, Esc | clear then Undo after a swap | restored | N/A |
| Listen | swap | unchanged | N/A |
| Instrument does not move | swap with 0 to 8 notes, with and without the Status line, both themes | instrument top and Status note area keep their place | N/A |

</frozen-after-approval>

## Code Map

- `src/core/explore.ts` -- `litPositions`, `beyondFretboard`, `beyondFretboardNote`, `pitchesOnString` (3.8). Add the placement function and a left-out count; `litPositions` becomes its caller. Reuse `positionsForPitch`, `closestPair` stays only for a free choice.
- `src/ui/session/useLitNotes.ts` -- builds `positions`, `positionRoles`, `rootPosition` from the placement; left-out notes have no marker.
- `src/ui/app/App.tsx` -- Status note (`beyondFretboard`); one combined line.
- `src/ui/session/session.ts` -- `toggleNote` uses the placement to find occupants; no new state.
- Tests: `tests/core/explore.test.ts`, `tests/ui/session/*`, `tests/ui/app/ModeSeparation.test.tsx`; helpers `press`, `click`, `lit`, `rooted`.

## Tasks & Acceptance

**Execution:**
- [x] `core/explore.ts` -- placement and left-out, beside the 3.8 function
- [x] `useLitNotes.ts`, `App.tsx` -- show it, Status line
- [x] Tests per matrix row and reference checks
- [x] Headless Chrome 1280 x 800 -- picture a clash, seven notes and swap back, light and dark; compare instrument top and Status area, with the longest Status text

**Acceptance Criteria:**
- Given lit notes on the piano that map to the same guitar string, when I swap to the guitar, then one note per string shows and the Status note says what was left out.

## Review Triage Log

| # | Layer | Finding | Verdict | Route | Evidence |
|---|-------|---------|---------|-------|----------|
| 1 | blind, edge | The `leftOut` comment says newest first but the list is in lit order | low | patch | Fixed: the comment now says lit order, and keeps "newest go first" only for the six-note cutoff. |
| 2 | blind, edge | The stale `beyondFretboard` test no longer passes a remembered position | low | patch | Fixed: deleted; a remembered position on an out-of-range pitch cannot arise through the API. |
| 3 | blind | `place` mutates shared maps and a visited set; the invariant is undocumented | low | patch | Fixed: a comment states the invariant. |
| 4 | edge | When two notes compete for one string the lower pitch wins, not the newest | false | rejected | Apor's decision (tie order: lower pitch first); newest-first applies to the six-note cutoff only. |
| 5 | edge | The six-note cutoff hides the newest note even when the user placed it by hand | false | rejected | Apor's decision: the swap leaves out the newest extras and swapping back restores them. |
| 6 | edge, blind | Unremembered markers can move to other strings or frets when a note is added | low | rejected | Apor's decision: the swap never writes positions it chose, so they stay computed; the old closest-pair rule moved markers the same way. |
| 7 | blind | No fret-span heuristic: `closestPair` is no longer used for placement, so notes can sit far apart | low | rejected | Apor's decision: a free string at the lowest fret; playability and shapes belong to Epic 4's voicing stories. `closestPair` is still used by `GuitarStage`. |
| 8 | edge | A remembered position whose string does not produce the pitch | false | rejected | Remembered positions are written only from clicks on real cells, so they always match their pitch. |
| 9 | blind | Two remembered positions on one string; remembered positions that block a rearrangement | low | rejected | One lit note per string is enforced on every click (Story 3.8), so two remembered notes cannot share a string. |
| 10 | blind | `placeLit` is called several times per render | low | rejected | At most eight notes and a six-string search; no measured cost. |
| 11 | blind | The Status text does not name the left-out notes or repeat the reason in the combined wording | false | rejected | The wording is Apor's decision (Q6). |
| 12 | blind | Test organisation and an uncommented fixture position | low | rejected | Cosmetic. |

Accepted deviation recorded here so later runs stop re-flagging it: `placeLit` rearranges notes that have no remembered position to make room, so a note is left out only when no one-per-string layout exists (six consecutive semitones all show). The spec said only "else left out"; Apor's rule "a free string beats a clash" is the reason, and the tests pin it.
