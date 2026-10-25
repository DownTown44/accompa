---
title: 'Story 3.2: Root marker, role shapes and legend'
type: 'feature'
created: '2026-10-25'
status: 'done'
baseline_commit: 'e9416766b82a0efe0fb86f67cedbffc2c4ea7d6d'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Explore names the chord but every lit note looks the same (an ink dot, the lowest one ringed), so the chord's structure is invisible.

**Approach:** Derive each lit note's role in `core/` from the same reading that names the chord. Draw it as shape plus colour on both instruments and add a role legend with chord-degree intervals under the readout.

## Boundaries & Constraints

**Always:** One pure function in `core/explore.ts` takes the lit pitches and returns the reading, the root pitch, each pitch's role and the legend entries; readout, markers and legend all read it. The root is the reading's root: the lowest lit note of the root's pitch class (so `C/E` roots on C5, `Am7/C` on A); with no reading, the lowest lit note. Decisions: a named inversion puts the marker on the reading's root, not the bass (supersedes the earlier marker-on-bass row); every lit note takes the role of its pitch class, so a doubled root is also a root marker; legend entries carry the interval from the root inside the entry, `3rd E (M3)`, using chord-degree labels (m3, M3, d5, P5, A5, d7, m7, M7) added beside `CHORD_QUALITIES`, not `INTERVALS` abbreviations. The 3rd, 5th and 7th show only for a recognised chord (three or more notes with a reading). Any other set (one or two notes, no reading, two pitch classes) shows the root marker on the lowest lit note, a no-role ink dot on every other, and a legend with only the root. Shapes: root a filled circle with an outer ring, 3rd a diamond, 5th a square (green), 7th a triangle, no-role a small ink dot; role fill, 1.8px ink outline, each at least 18px, drawn by one shared marker component for piano, guitar and legend. Piano keys also carry an 80% tint of the role fill. Dark theme uses the existing dark role tokens. Guitar open strings keep the nut ring with the role shape inside. The legend lists only the roles present with note names from `spellChord`, is absent (empty) for no notes, is not in the live region, and sits on a reserved one-line row. `--spacing-readout-block-height` grows to hold readout, gap and legend line, for Explore and Listen alike, so the instrument stays put across states and modes. Listen is unchanged (root marker and no-role dot, no legend). Tone: short, sentence case, no praise.

**Never:** No `R` key, chosen root, `Workspace` change or armed state. No alternative readings (3.3), no playback change (3.4), no new quality, no change to `nameChord` ranking. No role by colour alone. No `Math.random` or browser or `ui/` import in `core/`; no story references in comments.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Triad, piano | C4 E4 G4 | ringed circle on C, diamond on E, green square on G, white keys tinted 80%; legend `root C`, `3rd E (M3)`, `5th G (P5)` | N/A |
| Seventh | C4 E4 G4 B4 | adds triangle on B; legend adds `7th B (M7)` | N/A |
| Black key | C4 E♭4 G4 | diamond on the dark key, tint and outline legible | N/A |
| Guitar fret | same chord, guitar | same shapes at each remembered or lowest-fret position, no key tint | N/A |
| Open string | chord with E2 on the open low string | role shape inside the nut ring | N/A |
| Inversion | E4 G4 C5 | `C/E`; ringed root on C5, diamond on E4, square on G4; legend `root C` | N/A |
| Doubled | C4 E4 G4 C5 | both C keys are ringed circles | N/A |
| Diminished | C4 E♭4 G♭4 | legend `5th G♭ (d5)` | N/A |
| Unknown set | C4 D4 F♯4 | ringed root on C, dots on D and F♯, legend `root C` | N/A |
| Two, one, none | C4 G4; C4; nothing | root and dot, `P5`; root only; no markers, empty legend row, prompt | N/A |
| Dark theme | triad, dark | dark role fills, ink outline, legend shapes match | N/A |
| Updates | C E G, add B, unlight E | roles and legend re-derive each time | N/A |
| Listen | reveal an interval | root marker and no-role dot, no legend | N/A |
| Instrument does not move | 0, 1, 2, 3, 4 notes, unknown set, Listen vs Explore, both instruments, both themes | instrument top edge equal in every state | N/A |

</frozen-after-approval>

## Code Map

- `src/core/explore.ts` -- `exploreReadout`, `litPositions`; add the role and legend function here.
- `src/core/theory.ts`, `chords.ts`, `spelling.ts` -- `CHORD_QUALITIES`, `nameChord`, `spellChord`; add degree labels beside the table.
- `src/ui/session/useLitNotes.ts` -- Explore root is `Math.min(...pitches)`; return root, `rootPosition` and roles from the new function. Listen branches stay.
- `src/ui/instruments/piano/PianoKeyboard.tsx`, `guitar/Fretboard.tsx` -- draw `root-ring` plus `lit-dot` with `data-lit`, `data-root`; add optional `roles` (default keeps root plus dot) and `data-role`; keep existing attributes. `PianoStage.tsx`, `GuitarStage.tsx` pass roles.
- `src/ui/instruments/instruments.css`, `piano.css`, `guitar.css` -- marker styles, key tint.
- `src/ui/shared/` -- new marker component and CSS (`scripts/check-boundaries.mjs` bars `explore` and `listen` sharing code except via `shared`).
- `src/ui/explore/ExploreView.tsx`, `explore.css`, `src/ui/theme/theme.css` -- legend row; the block height variable is shared with `listen.css`.
- Tests: `tests/core/explore.test.ts`, `tests/core/theory.test.ts`, `tests/ui/explore/ExploreView.test.tsx`, `tests/ui/instruments/{piano,guitar}/*`, `tests/ui/listen/ListenView.test.tsx`; helpers `lit`, `rooted`, `key`, `click` in `tests/ui/support/dom.ts`.

## Tasks & Acceptance

**Execution:**
- [x] `src/core/theory.ts`, `src/core/explore.ts` -- degree labels; role and legend function -- one source
- [x] `src/ui/shared/` marker, `PianoKeyboard.tsx`, `Fretboard.tsx`, stages, `useLitNotes.ts`, CSS -- shapes, tint, open ring, dark tokens
- [x] `src/ui/explore/ExploreView.tsx`, `explore.css`, `theme.css` -- legend row, block height
- [x] Tests per Code Map -- every matrix row, Listen regression
- [x] Headless Chrome 1280 x 800 -- picture the matrix shapes in light and dark on both instruments; compare instrument top edge across the stability states

**Acceptance Criteria:**
- Given a recognised chord, when it renders, then each note shows its role shape and colour, piano keys carry the tint, and the legend lists the roles present with intervals.
- Given notes with no chord, when they render, then the lowest is ringed, the rest are dots, and the legend lists the root only.
- Given any readout or legend change, when it appears, then the instrument does not move.

## Implementation Notes

## Verification

**Commands:**
- `npm run check` -- expected: pass
- `npm run build` -- expected: success

**Manual checks (if no CLI):**
- Headless Chrome at 1280 x 800, light and dark: C E G, C E G B, E G C, an unknown set; measure the instrument top.

## Review Triage Log

| # | Layer | Finding | Verdict | Route | Evidence |
|---|-------|---------|---------|-------|----------|
| 1 | edge, blind | Without `roles`, Listen's non-root dot shrinks to r5 and the piano root key gets the tint | medium | patch | Fixed: the default path draws the old r9 dot and no tint; a Listen test through `App` asserts it. |
| 2 | gap | No guitar test with an off-board note; sorted multiset hides role-to-position mix-ups | medium | patch | Fixed: per-position roles for E4 E6 G4 C5 after a swap (E6 is unplaced, root last). |
| 3 | edge, gap | No test for the Listen, black-key rows | medium | patch | Fixed: Listen test and a black-key `lit-dot-black` test added. |
| 4 | blind, edge | Legend or readout overflows on narrow viewports; fixed 34px row with large text | low | rejected | Laptop-only; Chrome at 1280 x 800 shows the instrument top at 264.19 in every state. |
| 5 | edge, blind | `Math.min` of an empty filter gives `Infinity` | false | rejected | A reading's root class always comes from a lit pitch, so the filter is never empty. |
| 6 | edge | Block height switched to the readout size and is shared with Listen | false | rejected | Measured: instrument top is 264.19 in Listen and Explore, light and dark. |
| 7 | edge | `justify-content: flex-start` may shift the prompt or a wrapped readout | false | rejected | The readout is `nowrap` and the prompt state measured at the same top. |
| 8 | edge | Root beyond the fretboard gives no guitar ring | low | rejected | Same as before this story; the status note counts the unplaced note and the fix adds guards. |
| 9 | blind | Guitar roles dropped when `exact` is false | false | rejected | `exact` is false only in Listen, which has no roles by design. |
| 10 | edge | `stepOf` of -1 relies on `STEP_ROLES[-1]` being undefined | low | rejected | Falls to `none`; a deliberate fallback with no failing input shown. |
| 11 | blind | Legend not in the live region; empty `<ul>` exposed | low | rejected | The spec puts the legend outside the live region; the readout and spoken name carry the chord. |
| 12 | blind | Magic numbers in the triangle, repeated tint rules, unused `marker-none` CSS, 1px stroke on black no-role dot | low | rejected | Cosmetic; no named harm, and the fix is refactoring. |
| 13 | blind | Colour-blind and contrast checks of role fills | low | rejected | Shape is the primary cue (spec: no role by colour alone); screenshots show legible shapes in light and dark. |
| 14 | edge | `upper` and `pair` in `GuitarStage` still derive from `root` | low | rejected | Unused when `exact`; no failing case. |
| 15 | blind | `as FretPosition & { role }` cast | low | rejected | Cosmetic. |
