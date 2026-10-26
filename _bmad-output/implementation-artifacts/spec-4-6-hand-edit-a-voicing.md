---
title: 'Story 4.6: Hand-edit a voicing'
type: 'feature'
created: '2026-10-26'
status: 'done'
baseline_commit: '82e9707c6d9015377b9ecc6b12c3a070b64710f0'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The shown guitar voicing cannot be tuned: a fret click still follows the 3.8 rule and recomputes the voicing from the lit notes (4.3 interim), so Apor cannot bend a shape and keep its name.

**Approach:** While a voicing is shown, a fret click edits it in place, one note per string, and the readout names the result. The edit is stored as frets with an `edited` flag; the stepper reads `Voicing edited` and its arrows return to the generated list.

## Boundaries & Constraints

**Always:** Applies in Explore on the guitar when a voicing is shown (or already edited). A click on a fret moves that string's note there; a click on the string's current note, fretted or open, mutes it; a click on a muted string or on an open fret sets it. The note sounds on press (`pressNote`, as today). Span 4 and open-position rules are not enforced on an edit; the name keeps updating.

Storage: `Workspace` gets `edited?: true` beside `voicing` (the edited frets), written only by a new reducer action `editVoicing { frets }`; `practice` untouched by reference. The reducer sets `pitches` to the sounding pitches, unique, bass to treble, so the piano, readout and Play and Block (the lit pitches; the strum is 4.7) follow the edit; `positions` holds each note's exact place; `reading` stays only while still named (`pruneReading`), `root` only while still lit. A core helper `moveFret(frets, string, fret)` returns the new frets, `null` fret meaning mute; it lives in `core/voicings.ts`, and the shown frets are the base (the edited frets once edited).

Name: the namer runs on the edited pitches, so the readout, alternatives and role markers follow, and a non-chord shows note names; markers, `x` and rings follow the edited frets, roles from `exploreReading`. No `5th left out` Status note for an edited voicing. `chooseReading` and `chooseRoot` keep an edited voicing (only the reading changes); `toggleNote` (piano click, or fret click with no voicing) drops it and the 3.8 placement uses the remembered positions; Esc clears it with the workspace, Undo restores it; a swap to piano and back keeps it.

Stepper: while edited it reads `Voicing edited`, announced like a step; the list is the generated voicings of the edited pitches, ranked against their mean, and both arrows are live while it is non-empty; either arrow's first press selects its first entry (nearest the edit), `selectVoicing` drops `edited`, and `Voicing 1 of N` follows. With no generated voicing the arrows are inert `·`. `Left`/`Right` follow the same rule.

Leaving fewer than two notes drops the voicing and the flag: one note keeps its position as the single-note state, none is the empty state (no Undo entry). Two notes stay edited and read as the interval. With no voicing shown (single note, interval, no voicing fits) a fret click keeps the 3.8 rule.

**Never:** No change to the generator, ranking, shapes, `placeLit`, `nameChord`, Listen, Play or Block sound (4.7 strums); no span or open rule on edits; no edit-undo; no touch, phone or narrow-viewport handling; no new layout row.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Move | C major voicing `x 3 2 0 1 0`, click fret 3 on the B string | B string moves to fret 3; sounds on press; pitches, piano and readout follow; stepper `Voicing edited` | N/A |
| Mute | click the string's current fretted note | string `x`, notes drop by one, name updates | N/A |
| Open string | click fret 0 on a string | string open, ring at the nut; clicking it again mutes it | N/A |
| Muted string | click a fret on an `x` string | string sounds there | N/A |
| Non-chord | edit to `x 3 2 0 3 0` | readout shows note names, markers by role, stepper `Voicing edited` | N/A |
| Break rules | span 6 or open string beyond fret 5 | allowed, name updates | N/A |
| First arrow | edited, press `Right` or `Left` | first generated voicing of the edit's chord, `Voicing 1 of N`, `edited` gone | no list: arrows inert |
| Chord change | edited, then piano click, Esc | piano click drops the edit; Esc clears, Undo restores the edit | N/A |
| Reading, root | edited, choose another reading or root | voicing kept, name and roles follow | N/A |
| Swap | edit, swap to piano and back | same frets, `Voicing edited` | N/A |
| Too few notes | mute until one is left, or none | single-note state, or the empty prompt | N/A |
| Two notes | mute down to two | interval readout, still `Voicing edited` | N/A |
| No voicing shown | single note, interval, no voicing fits | click follows the 3.8 rule | N/A |
| Listen | any | Listen unchanged | N/A |
| Instrument does not move | edit, step, both themes | instrument top and Status note keep their place; no page scroll at 1280 x 800 | N/A |

</frozen-after-approval>

## Code Map

- `src/core/model.ts` -- `Workspace.edited?: true`; comment on `voicing`.
- `src/core/voicings.ts` -- `moveFret(frets, string, fret)`, pure; imports `pitchAt` for the reducer's pitches.
- `src/ui/session/session.ts` -- `editVoicing { frets }`: pitches, positions, prune, `rootArmed` as `toggleNote`; `selectVoicing` drops `edited`; `chooseReading`/`chooseRoot` keep both when edited; `toggleNote` already drops them.
- `src/ui/session/useLitNotes.ts` -- `useShown`: edited frets give the voicing, roles from `exploreReading`, no `fifthLeftOut`; the list ranks the edited pitches; `LitNotes.voicingFrets`; `VoicingList.edited`, index -1.
- `src/ui/session/useSessionActions.ts` -- `releaseNote(pitch, position, shown?)` dispatches `editVoicing` with `moveFret`, the armed-root rule first; `stepVoicing` picks the list's first entry when edited.
- `src/ui/instruments/guitar/GuitarStage.tsx` -- pass `voicingFrets` to `releaseNote`; `Fretboard.tsx` unchanged.
- `src/ui/explore/VoicingStepper.tsx`, `ExploreView.tsx`, `src/ui/shortcuts/useShortcuts.ts` -- label, visible while edited, live arrows, announcer, `Left`/`Right`.
- Tests: `tests/ui/session/` reducer rows; `tests/core/voicings.test.ts` `moveFret`; `tests/ui/explore/ExploreEdit.test.tsx`; `ExploreStepper.test.tsx` (the 4.4 fret-click row changes).

## Tasks & Acceptance

**Execution:**
- [ ] `model.ts`, `voicings.ts`, `session.ts` -- flag, `moveFret`, `editVoicing`, drops and keeps, reducer tests
- [ ] `useLitNotes.ts`, `GuitarStage.tsx`, `useSessionActions.ts` -- edited voicing shown, click edits, sound on press
- [ ] `VoicingStepper.tsx`, `useShortcuts.ts`, `ExploreView.tsx` -- `Voicing edited`, first-press return, announcer
- [ ] UI tests per matrix row
- [ ] Headless Chrome 1280 x 800 -- edit, mute, non-chord, step back, both themes; compare instrument top and Status note; check Listen

**Acceptance Criteria:**
- Given a shown voicing, when I click another fret on a string, then that note moves, sounds, and the readout names the result.

## Review Triage Log

| # | Layer | Finding | Verdict | Route | Evidence |
|---|-------|---------|---------|-------|----------|
| 1 | gap | Roles and legend after an edit that stays a named chord are not asserted; the old assertions were deleted | medium | patch | Fixed: the high e string moved from fret 0 to 12 asserts root, third, fifth cells and the legend; the "moved one note" test again asserts the exact lit set and legend. |
| 2 | blind, edge | `editVoicing` has no guard for mode, instrument or a malformed frets array | low | patch | Fixed: returns the same state unless Explore, guitar and six frets; reducer rows added. |
| 3 | edge | Consecutive edits give identical live-region text, so a screen reader does not re-announce | low | patch | Fixed: the text is cleared before the delayed set; a test checks two edits are each announced. |
| 4 | blind, edge | The stepper repeats the visibility rule that `canStep` holds | low | patch | Fixed: one `showsStepper` rule beside `canStep` in `useLitNotes.ts`. |
| 5 | blind, edge | The 3.8 replace rule lost UI coverage; the returns-to-list test asserts only a regex; no Left/Right test from an edit; no repeat-click mute test | low | patch | Fixed: tests added for each. |
| 6 | blind | Any fret click now edits a pictured voicing, so the old light or unlight flow is gone | low | rejected | Planned in this story: an edit replaces the interim 3.8 click rule when a voicing shows; the rule stays with no voicing, and a test covers it. |
| 7 | blind | Edits may break the span or open-position rules | low | rejected | Planned decision: the user's choice, the name keeps updating. |
| 8 | blind, edge | Both arrows from `Voicing edited` do the same; the nearest voicing is approximate | low | rejected | Planned decision: the first entry of the generated list ranked against the edit's mean pitch. |
| 9 | blind | No Undo entry for an edit | low | rejected | Planned decision: Esc clears the workspace and Undo restores it; no edit-level undo. |
| 10 | blind, edge | A unison pitch on two strings collapses to one note | low | rejected | Planned decision: unique pitches. Both strings still show on the fretboard because the markers come from the frets. |
| 11 | edge | Leaving an edit by arrow leaves the piano on the edited pitches | low | rejected | The generated list is built from the edited pitch classes, so the readout name and notes agree; only octave and doubling differ, as in Story 4.3. |
| 12 | edge, blind | "Voicing edited" is announced on Undo and on a reading or root change; armed root wins over an edit | low | rejected | Harmless text; the armed-root rule is planned. |
| 13 | blind, edge | The stepper test timeout was raised to 20 s | low | rejected | One arrow-click test of 96 voicings takes about 0.8 s alone and passes in the full run; noted for the end-of-epic review. |
| 14 | blind | The happy-dom layout test cannot fail; no layout check | false | rejected | Checked in headless Chrome at 1280 x 800, both themes: instrument top 366.2, Status top 725.2, no scroll through an edit, a mute, stepping, a swap and Listen. |

## Verification

**Commands:**
- `npm run check` -- expected: tsc, boundaries and tests pass
- `npm run build` -- expected: success

**Manual checks (if no CLI):**
- Built app at 1280 x 800: instrument top and Status note stay put on piano, guitar and Listen; no page scroll.
