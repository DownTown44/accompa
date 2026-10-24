---
title: 'Story 3.1: Name chords in core'
type: 'feature'
created: '2026-10-24'
status: 'done'
baseline_commit: 'fa5b6790ec7898111a66ad4d0d3597cae27889dd'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `core/` cannot name a set of notes as a chord, so the Explore readout (Story 3.5) has nothing it can trust to show.

**Approach:** Add the chord quality table, a pure namer, chord spelling and chord symbols to `core/`, fully tested. No visible change in the app.

## Boundaries & Constraints

**Always:** The nine qualities (major, minor, diminished, augmented, maj7, dom7, min7, m7b5, dim7; no major 6th) are one `CHORD_QUALITIES` table in `core/theory`, each entry name, symbol and interval stack. Symbols: none for major, `m`, `dim`, `aug`, `maj7`, `7`, `m7`, `m7♭5`, `dim7`. The namer takes pitches and needs three or more distinct pitch classes; it returns every match as root, quality and optional bass, ranked with the lowest sounding note as root first (root position, then inversions as slash chords), and `[]` for no match or fewer than three classes. Symmetric sets (augmented, dim7) list the root-position reading first, then the others low to high by root. Chord tones are spelled by letter stepping from the spelled root (3rd +2 letters, 5th +4, 7th +6), the root by the default root table (C♯, E♭, F♯, A♭, B♭, as the existing table spells them); in a slash chord the bass after `/` is spelled by the same default root table (so `Eaug/C`, never `Eaug/B♯`), while `spellChord` still spells every chord tone by stepping (dim7 gives B♭♭ and similar). A reading's symbol string is the spelled root, the quality symbol and `/bass` for an inversion (`C`, `Cm7♭5`, `C/E`, `Am7/C`). An unknown set is listed as its distinct note names low to high, no octaves, in the existing spelling (so pitch class 3 is `E♭`). All functions are total, pure and in `core/`.

**Never:** No UI, session, readout, live region or `MAX_LIT` change, and no Chrome check (Story 3.5). No octave in any name. No `Math.random`, no browser or `ui/` imports in `core/`, no story references in comments.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Nine qualities | C4 with the stack of each quality | one root-position reading on C each: `C`, `Cm`, `Cdim`, `Caug`, `Cmaj7`, `C7`, `Cm7`, `Cm7♭5`, `Cdim7` | N/A |
| First inversion | E4 G4 C5 | first reading `C/E` | N/A |
| Seventh, second inversion | G3 C4 E4 B4 | `Cmaj7/G` | N/A |
| Augmented | C4 E4 G♯4 | `Caug`, `Eaug/C`, `A♭aug/C` | N/A |
| Diminished 7 | C4 E♭4 G♭4 A4 | `Cdim7`, `E♭dim7/C`, `F♯dim7/C`, `Adim7/C` | N/A |
| Added sixth | C4 E4 G4 A4 | only `Am7/C` | N/A |
| Doubled class | C4 E4 G4 C5 | same readings as C E G: `C` | N/A |
| Unknown set | C4 D4 F♯4 | no reading; names `C D F♯` | `[]`, no throw |
| Two classes | C4 E4 | no reading; names `C E` | `[]` |
| Same class, two octaves | C4 C5 | no reading; names `C` | `[]` |
| Flat key root | pitch class 3 as root, major | `E♭`, third G, fifth B♭ | N/A |
| Sharp key root | pitch class 6 as root, major | root spelled by the default table; third and fifth by stepping | N/A |
| Dim7 on a flat root | E♭ dim7 | tones E♭ G♭ B♭♭ D♭♭ | N/A |

</frozen-after-approval>

## Code Map

- `src/core/theory.ts` -- `INTERVALS` shows the `define` pattern; add `ChordQuality` and `CHORD_QUALITIES` here.
- `src/core/chords.ts` (new) -- `nameChord(pitches): ChordReading[]`, `ChordReading = { root: PitchClass, quality: ChordQuality, bass?: PitchClass }`.
- `src/core/spelling.ts` -- `noteName`, `ROOT_NAMES`, `SIZES`, `ACCIDENTALS`, `spellInterval` give the stepping; add `spellChord(reading)`, `chordSymbol(reading)` and `spellNotes(pitches)` (the unknown-set list).
- `src/core/explore.ts`, `src/ui/**` -- untouched; Story 3.5 wires them.
- Tests: `tests/core/theory.test.ts`, `tests/core/spelling.test.ts`, new `tests/core/chords.test.ts`.

## Tasks & Acceptance

**Execution:**
- [x] `src/core/theory.ts` -- `ChordQuality` and the nine-entry `CHORD_QUALITIES` with symbols -- single source for namer and UI
- [x] `src/core/chords.ts` -- `nameChord` ranked readings -- the only path to a chord name
- [x] `src/core/spelling.ts` -- `spellChord`, `chordSymbol`, `spellNotes`, with dim7 and slash bass -- spelling by letter stepping
- [x] `tests/core/theory.test.ts` -- table holds nine qualities once each with the listed symbols
- [x] `tests/core/chords.test.ts` -- matrix rows for naming, ranking, inversions, symmetric sets, C E G A, unknown sets, fewer than three classes, duplicates
- [x] `tests/core/spelling.test.ts` -- spelling, symbols and note list rows, dim7 double flats

**Acceptance Criteria:**
- Given the table in `core/theory`, when it is inspected, then it holds the nine qualities once each with their symbols and interval stacks.
- Given any pitch set, when `nameChord` runs, then it returns the same result for any input order and never throws.
- Given a reading, when it is spelled, then tones follow letter stepping and the symbol string matches the matrix.
- Given the `core/` sources, when searched, then they hold no `Math.random` and no `ui/` or browser import.
- Given the app after this story, when it runs, then nothing visible has changed.

## Implementation Notes

- Apor chose `F♯dim7/C` over `G♭dim7/C` (the existing default table spells pitch class 6 as F♯) and corrected the matrix row and the parenthetical listing the table.
- Double flats and sharps use the app's existing `𝄫` and `𝄪` glyphs (`B𝄫`, `D𝄫`), not `♭♭`, so the matrix's `B♭♭ D♭♭` reads as `B𝄫 D𝄫` on screen and in tests.

## Verification

**Commands:**
- `npm run check` -- expected: pass
- `npm run build` -- expected: success

## Spec Change Log

- Matrix and table text: the dim7 row read `G♭dim7/C` and the default-table parenthetical listed G♭, but the existing table spells pitch class 6 as F♯; Apor chose `F♯dim7/C` and the spec was corrected before review (implementation report, 2026-10-24). Double accidentals use the existing `𝄫` and `𝄪` glyphs.

## Review Triage Log

| Finding | Layer | Verdict | Evidence / route |
|---|---|---|---|
| `spellChord` can silently give a wrong note on a triple accidental (sharp roots, dim7 or augmented) | blind, edge | medium, patch (test only) | Brute-forced all 12 roots times 9 qualities: no triple accidental, every tone sounds the right pitch class. Pinned with a permanent test. |
| `ChordQuality` comment says the stack starts at the 3rd but it starts at the root | blind | low, patch | Comment corrected. |
| Slash bass is spelled from the default table and can disagree with the chord-tone spelling | blind, edge | false | Apor chose plain bass names (`Eaug/C`) at the checkpoint. |
| Missing chord types (6, sus, add9, power chords, dyads); C6 never offered | blind | false | The epic fixes the nine qualities, and Apor chose to keep nine. |
| NaN, non-integer or out-of-range pitches give bogus classes | edge, blind | false | `Pitch` is a branded integer built from the instruments; no caller can reach it. |
| `?? ''` and `?? 0` fallbacks in `spellChord` could hide a bad quality | blind, edge | low, rejected | Unreachable with the nine qualities, and the new test would fail first. |
| `theory.test.ts` copies the table; no uniqueness invariants | blind | low, rejected | Cosmetic; the namer tests exercise the table. |
| Pitch-class de-duplication written twice (`nameChord`, `spellNotes`) | blind | low, rejected | Two five-line loops with different outputs. |
| Type-only import `spelling.ts` from `chords.ts` is a cycle | blind | false | `chords.ts` does not import `spelling.ts`; no cycle. |
| Verification gap layer | gap | none | No gaps found. |
