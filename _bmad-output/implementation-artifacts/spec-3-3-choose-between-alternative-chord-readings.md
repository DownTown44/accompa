---
title: 'Story 3.3: Choose between alternative chord readings'
type: 'feature'
created: '2026-10-25'
status: 'draft'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Explore always shows the namer's first reading, so a set with several names (a diminished seventh, an augmented triad) cannot be seen as another chord.

**Approach:** Show the other readings beneath the readout as small italic buttons. Choosing one makes it the large readout, moves the root marker, legend and intervals to it, and respells the notes. The choice lives in `Workspace`.

## Boundaries & Constraints

**Always:** The namer stays the only source of readings; `exploreReading(lit, chosen?)` in `core/explore.ts` takes the chosen reading's identity (root pitch class and quality name) and uses the first reading when it is absent or no longer among `nameChord(lit)`; markers, legend, readout and `useLitNotes` all read it. `Workspace.reading` holds that identity, is written only by a new `chooseReading` action and pruned by `toggleNote` when the reading stops existing; a chosen reading otherwise stays while notes change. Undo restores it; Esc clears it; Listen and mode switches never touch it. Alternatives are every other reading in namer order, `type=button`, in the focus order right after the readout; the chosen reading takes the large slot and the previous one joins the list. Choosing the first reading is stored like any other. Focus stays on the same list position after a choice. Shortcuts already yield to a focused button. The live region announces the new spoken name. The alternatives row is reserved (one line, empty with fewer than two readings) and `--spacing-readout-block-height` grows by it, so the instrument does not move. `Workspace.reading` is not persisted. Decision: the nine qualities stay, with no sixth quality, so alternatives appear only for diminished sevenths (four readings) and augmented triads (three); the epic's `C6` against `Am7/C` example does not exist and the pictured uses use `Cdim7` and `Caug`.

**Never:** No `R` key, no chosen root, no root state: the deferred root-gesture story (last entry of `deferred-work.md`) adds `Workspace.root` later and must settle how it combines with `Workspace.reading`; this story only stores a reading. No new quality, no change to `nameChord` ranking, no playback change. No reading picked outside the namer. No `Math.random` or `ui/` import in `core/`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Several readings | C4 E♭4 G♭4 A4 (dim7) | `Cdim7` large; the other readings as buttons beneath | N/A |
| One reading | C4 E4 G4 | no buttons, row empty | N/A |
| Choose | click an alternative | name, root marker, legend, intervals and spelling follow it; notes unchanged; the old first reading joins the list | N/A |
| Choose first again | click the original name in the list | back to it; stored | N/A |
| Add or remove a note | chosen reading still among the readings | it stays chosen | N/A |
| Reading gone | note change leaves the chosen reading missing | first reading shows, choice cleared | N/A |
| Fewer than three pitch classes | chosen set, unlight one note | single or pair readout, no buttons, choice cleared | N/A |
| Undo, Esc | Esc then Undo | Esc clears notes and choice; Undo restores both | N/A |
| Keyboard | Tab from Instrument | alternatives next, then action buttons; Enter or Space on one chooses it and does not play | N/A |
| Piano, guitar | choose, swap instrument | same reading, markers follow root | N/A |
| Dark theme | choose | button text and focus ring legible | N/A |
| Listen | any | unchanged, no alternatives | N/A |
| Instrument does not move | 0, 1, 2, 3 notes, one reading, 2 to 4 readings, long symbols, Listen vs Explore, both instruments, both themes | instrument top edge equal in every state | N/A |

</frozen-after-approval>

## Code Map

- `src/core/model.ts` -- `Workspace`, `initialWorkspace`; add optional `reading`.
- `src/core/explore.ts` -- `exploreReading`; take the chosen identity, expose `readings` (symbols and spoken names, the large one first) and the alternatives; reuse `nameChord`, `chordSymbol`, `chordSpoken`, `spellChord`.
- `src/ui/session/session.ts` -- add `chooseReading`; prune in `toggleNote`; `dismiss` and `undoClear` already carry the whole workspace.
- `src/ui/session/useLitNotes.ts`, `useSessionActions.ts` -- pass the chosen reading in, expose the action.
- `src/ui/explore/ExploreView.tsx`, `explore.css`, `src/ui/theme/theme.css` -- alternatives row between readout and legend; block height; focus ring as `action-button`.
- Tests: `tests/core/explore.test.ts`, `tests/ui/session/*`, `tests/ui/explore/ExploreView.test.tsx`; helpers `press`, `click`, `lit` in `tests/ui/support/`. Do not change `PianoKeyboard`, `Fretboard`, `RoleMarker`.

## Tasks & Acceptance

**Execution:**
- [ ] `src/core/model.ts`, `src/core/explore.ts` -- chosen identity in, readings and alternatives out, fallback -- one source
- [ ] `src/ui/session/*` -- action, pruning, `useLitNotes` wiring -- single writer
- [ ] `src/ui/explore/*`, `theme.css` -- buttons, focus, reserved row, announce
- [ ] Tests per Code Map -- every matrix row, reducer reference checks for Workspace writes
- [ ] Headless Chrome 1280 x 800 -- picture a dim7 and an aug set before and after a choice on both instruments, light and dark; compare instrument top across the stability states

**Acceptance Criteria:**
- Given a set with several readings, when I choose one, then name, root marker, legend, intervals and spelling all show that reading.
- Given a chosen reading, when a note change removes it, then the first reading shows without error.
- Given any readout change, when it appears, then the instrument does not move.

## Implementation Notes

## Verification

**Commands:**
- `npm run check` -- expected: pass
- `npm run build` -- expected: success

**Manual checks (if no CLI):**
- Headless Chrome at 1280 x 800: dim7 and aug before and after a choice, keyboard-only choice, measure the instrument top in each state.
