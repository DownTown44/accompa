---
title: 'Story 3.5: See the chord named as I click notes'
type: 'feature'
created: '2026-10-24'
status: 'done'
baseline_commit: '685d3ee9ae452881cc0868431b501eb3b5532518'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Explore lights at most two notes and only names a note or an interval, so the chord core from Story 3.1 is unreachable from the keyboard.

**Approach:** Lift the cap in `MAX_LIT` and let `exploreReadout` name three or more notes with `nameChord` and `chordSymbol`, falling back to `spellNotes`; show it in the existing 84px readout and live region.

## Boundaries & Constraints

**Always:** The cap lives only in `MAX_LIT`, now 8 (Apor's choice); past it the oldest note unlights as today. One lit note shows its name and two show the interval, as now. Three or more lit notes with at least three pitch classes and a reading show the first reading's `chordSymbol` (`C`, `Cm`, `Cmaj7`, `Am7/C`; a major triad is the bare letter), whatever the click order. Any other set of three or more (no reading, or only two pitch classes such as C4 E4 C5) shows `spellNotes` joined by spaces, low to high, no octave (`C D F♯`, `C E`), with no interval. The root marker stays on the lowest lit note and the others keep the no-role dot. The namer ranks the lowest note first, so an inversion reads with the marker on its bass (E G C reads `C/E`, marker on E). The readout is one line at a fixed height: the `<p>` keeps its height, `white-space: nowrap`, and the font steps by label length (84px up to 6 characters, `--type-readout-question-size` up to 10, 36px beyond), so `Cm7♭5/E♭` and the longest note list never wrap or move the instrument. The visually hidden text and the polite live region (400 ms debounce, as now) carry a spoken form: `C major`, `A min7 over C`, the interval name, or the note names. Play and Block stay as they are. Guitar notes keep rendering at their remembered or lowest-fret position.

**Never:** No root marker shapes or legend (3.2), no alternative readings or `R` (3.3), no playback changes (3.4). No new quality, no change to `nameChord` ranking. No `Math.random` in `core/`. No story or epic references in comments.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Triad, any order | click E4, C4, G4 | readout `C`, spoken `C major`, marker on C4 | N/A |
| Grow and shrink | C4 G4, then E4, then unlight E4 and G4, then C4 | `P5`, `C`, `P5`, `C`, prompt after C4 is unlit | N/A |
| Inversion | E4 G4 C5 | `C/E`, marker on E4, spoken `C major over E` | N/A |
| Seventh | C4 E4 G4 B4 | `Cmaj7` | N/A |
| Unknown set | C4 D4 F♯4 | `C D F♯`, marker on C4, dots on the rest, no spoken chord | N/A |
| Two classes, three notes | C4 E4 C5 | `C E`, not an interval | N/A |
| Long name | C♯ D♯ F♯ G♯ A♯ B C D lit | one line at 36px, no overflow; `Cm7♭5/E♭` at 56px | N/A |
| Beyond range | chord with a note below E2 or above D6, on the guitar | name unchanged; Status note counts it beyond the fretboard | N/A |
| Instrument still | 0, 1, 2 and 3+ notes | instrument top edge equal in every state, piano and guitar | N/A |
| Clear, Undo | chord lit, `Esc`, Undo | readout returns to the chord, no sound | N/A |
| Swap | chord lit, `I` | same name; each note at its remembered or lowest fret | N/A |
| Play, Block | three notes lit | engine gets the sorted three as `arpeggio` and `block` | N/A |
| Cap reached | 8 notes lit, one more | oldest unlights; 8 stay lit | N/A |

</frozen-after-approval>

## Code Map

- `src/core/explore.ts` -- `MAX_LIT`, `toggleLit`, `exploreReadout` (the only readout logic; today note or `pairInterval`), `litPositions` (takes any count: the closest-pair rule applies only to exactly two unplaced notes), `beyondFretboard`.
- `src/core/chords.ts`, `src/core/spelling.ts` -- `nameChord` (`[]` under three pitch classes), `chordSymbol`, `spellNotes`; add `chordSpoken(reading)` beside them (`ROOT_NAMES` root, `quality.name`, `over` bass).
- `src/ui/explore/ExploreView.tsx`, `explore.css` -- readout `<p>`, live region; add the length-stepped font size and `nowrap` to `.readout-interval`.
- `src/ui/theme/theme.css` -- `--spacing-readout-block-height`, `--type-readout-size`, `--type-readout-question-size`.
- `src/ui/session/session.ts` (`toggleNote`), `useLitNotes.ts` -- already count-free; root is the lowest pitch.
- `src/ui/instruments/guitar/GuitarStage.tsx` -- Explore uses the exact `positions` path, so `closestPair` there is Listen-only; no change expected.
- `src/ui/app/App.tsx` -- offscreen and `beyondFretboardNote` read `lit.pitches`; no change expected.
- Tests: `tests/core/explore.test.ts` (asserts `MAX_LIT` is 2), `tests/ui/session/session.test.ts` (`unlights the oldest on a third note`), `tests/ui/explore/ExploreView.test.tsx` (same name, announce test), `tests/ui/app/BeyondFretboard.test.tsx`, `tests/core/spelling.test.ts`; helpers in `tests/ui/support/dom.ts`, `keys.ts`, `fakeEngine.ts`.

## Tasks & Acceptance

**Execution:**
- [x] `src/core/explore.ts` -- raise `MAX_LIT`; `exploreReadout` returns the chord symbol with spoken name, else `spellNotes` for three or more -- one readout path
- [x] `src/core/spelling.ts` -- add `chordSpoken` -- natural screen reader text
- [x] `src/ui/explore/ExploreView.tsx`, `explore.css` -- length-stepped size, `nowrap`, spoken text in the hidden span and live region -- fixed height
- [x] `tests/core/explore.test.ts`, `tests/core/spelling.test.ts` -- replace the cap test; readout rows (chord, inversion, unknown, two classes, nine qualities through `chordSymbol`), `chordSpoken`
- [x] `tests/ui/session/session.test.ts`, `tests/ui/explore/ExploreView.test.tsx`, `tests/ui/app/BeyondFretboard.test.tsx` -- replace the third-note tests; matrix rows including swap, clear and Undo, Play and Block with three notes, beyond-range count, live region text after 400 ms
- [x] Headless Chrome at 1280 x 800 -- measure the instrument top with 0, 1, 2, 3 and `MAX_LIT` notes on both instruments, and the long names

**Acceptance Criteria:**
- Given C, E and G are lit in any order, when the third lights, then the readout shows `C` and no cap drops a note.
- Given notes that form no chord, when the readout updates, then it shows their names low to high with the root marker on the lowest.
- Given a chord is lit, when a note is added or removed, then the name updates live and is announced politely after 400 ms.
- Given any readout, when it changes, then the instrument does not move.

## Implementation Notes

## Verification

**Commands:**
- `npm run check` -- expected: pass
- `npm run build` -- expected: success

**Manual checks (if no CLI):**
- Headless Chrome at 1280 x 800: Explore, piano and guitar; light C E G, then `Cm7♭5/E♭` and the longest unknown set; compare the instrument top to the empty state.

## Review Triage Log

| # | Layer | Finding | Verdict | Route | Evidence |
|---|-------|---------|---------|-------|----------|
| 1 | blind | First reading wins with no tie-break | false | rejected | The frozen block says "the first reading"; ranking is Story 3.1's and alternatives are Story 3.3. |
| 2 | blind | `C E` for two pitch classes hides the interval | false | rejected | The frozen block and matrix row ("not an interval") require it. |
| 3 | blind, edge | Font tiers: hard-coded 36px, `question-size` reuse, overflow on narrow screens | low | rejected | Tiers and 36px are in the frozen block; laptop-only; headless Chrome at 1280 x 800 shows no overflow for 8 notes (`scrollWidth <= clientWidth`). |
| 4 | blind | Spoken form of the note list and `min7` wording | false | rejected | Spec fixes `A min7 over C` and the note names as the spoken text. |
| 5 | blind | Cap of 8 under-tested; no hint on the silent drop | low | rejected | Cap, swap, Play and Block rows each have a test; the silent drop is today's behaviour. |
| 6 | blind | Test edits weaken old assertions | low | rejected | The extra `click(key(64))` keeps the old test's two-note setup; the position test sets one position, so `{}` is the whole expectation. |
| 7 | blind | Fallback spelling untested for enharmonics | low | rejected | `spellNotes` is Story 3.1's, tested there; the new rows cover `C D F♯` and `C E`. |
| 8 | verification-gap | Beyond-fretboard test asserts `toContain('E')`, which a note list also satisfies | medium | patch | Fixed: exact label `E` and spoken `E major`. |
| 9 | edge | C4 C5 C6 reads `C`, like one note | low | rejected | Follows the frozen rule (only sets with a reading or two pitch classes are special); the fix adds a branch. |
| 10 | edge | `label.length` counts UTF-16 units | false | rejected | `♭` and `♯` are one unit; only the rare double glyphs count two, which steps down early and safely. |
| 11 | edge, gap | No automated check of CSS size steps or boundaries 6/7 and 10/11 | low | rejected | CSS cannot run in happy-dom; the Chrome check covers it. |
| 12 | edge | Matrix long-name spelling differs (`E♭`, `B♭`) | false | rejected | The matrix names the lit keys; `spellNotes` uses the default root table by decision. Chrome shows `C♯ E♭ F♯ A♭ B♭ B C D`. |
