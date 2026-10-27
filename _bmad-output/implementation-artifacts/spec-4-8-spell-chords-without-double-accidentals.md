---
title: 'Story 4.8: Spell chords without double accidentals'
type: 'feature'
created: '2026-10-27'
status: 'done'
baseline_commit: '7708dcdc4c7d3eeff74c77f60621da4569647cbb'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Chord tones are spelled by stepping letters from the root, so some chords need a double flat or double sharp (`E♭m7♭5` has `B𝄫`, `F♯aug` has `C𝄪`). Apor does not want to see them.

**Approach:** Replace the Epic 3 decision that double accidentals use `𝄫` and `𝄪`. In `core/spelling.ts` a chord root takes the enharmonic twin that avoids a double on any chord tone, and where no twin exists a tone that would need a double takes its single-accidental name. Intervals follow the same rule.

## Boundaries & Constraints

**Always:** Pure `core/`, no `ui/` import. The default root table stays (`C♯ E♭ F♯ A♭ B♭`); a root changes only when its default spelling gives a double on some chord tone. Twins: `C♯`/`D♭`, `E♭`/`D♯`, `F♯`/`G♭`, `A♭`/`G♯`, `B♭`/`A♯`; a natural root keeps its name. A tone that still needs a double takes the default table name for its pitch class (`Baug` is `B D♯ G`, `Cdim7` is `C E♭ G♭ A`). One function decides the spelled root, used by the chord symbol, the spoken name, the tone list and the legend, so they cannot disagree; a slash bass uses the default root table (Apor's Epic 3 decision, kept: `Eaug/C`, and `Baug` over its D♯ reads `/E♭`, even where the tone list says D♯). `spellInterval` also never returns a double (C♯ up 6 semitones names G, not F𝄪). `𝄫` and `𝄪` are removed from the module. Chord names still come only from `nameChord`; only spelling changes.

**Never:** No change to `nameChord`, readings, roots (the chosen root is a pitch), playback, voicings, Listen interval names for cases that never needed a double, UI layout.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Apor's example | E♭ m7♭5 notes | symbol `D♯m7♭5`, tones `D♯ F♯ A C♯` | N/A |
| Diminished seventh | root pitch class 3 and 8 | `D♯dim7` (`D♯ F♯ A C`), `G♯dim7` (`G♯ B D F`) | N/A |
| Augmented | F♯ and C♯ augmented | `G♭aug` (`G♭ B♭ D`), `D♭aug` (`D♭ F A`) | N/A |
| No twin | B augmented, C diminished seventh | `B D♯ G`, `C E♭ G♭ A` | N/A |
| Unchanged | C major, E♭ major, B♭ m7, F♯ m7♭5 | same names and tones as before | N/A |
| Every quality and root | 9 qualities x 12 roots | no tone, symbol or spoken name contains `𝄫` or `𝄪` | N/A |
| Slash chord | an inversion with a respelled root | root respelled, bass from the default table (`Eaug/C` stays `Eaug/C`) | N/A |
| Interval | C♯ up a tritone, G♭ up a major 3rd | upper note without a double accidental | N/A |
| Explore and legend | E♭ m7♭5 lit on the piano | readout `D♯m7♭5`, legend `3rd F♯`, `5th A`, `7th C♯` | N/A |
| Listen, layout | any | unchanged; the instrument does not move | N/A |

</frozen-after-approval>

## Code Map

- `src/core/spelling.ts` -- `ROOT_NAMES`, `ACCIDENTALS` (remove `𝄫`/`𝄪`), `spellChord`, `chordSymbol`, `chordSpoken`, `spellInterval`, `spellNotes`: add the spelled-root function and the no-double fallback.
- `src/core/chords.ts`, `src/core/explore.ts` -- callers of the spelling helpers; names only through them.
- Tests: `tests/core/spelling.test.ts`, `tests/core/explore.test.ts` (both mention `𝄫`/`𝄪` today), UI tests that assert a chord or note name (grep for `♭♭`, `𝄫`, `E♭m7`).

## Tasks & Acceptance

**Execution:**
- [ ] `core/spelling.ts` -- one spelled-root function, no double accidentals in chords or intervals
- [ ] `tests/core/spelling.test.ts` -- matrix rows plus all 108 root and quality pairs and all root and interval pairs
- [ ] Update other tests that expect a double accidental or the old name
- [ ] Grep `src` and `tests` for `𝄫`, `𝄪`, `♭♭`; none remain

**Acceptance Criteria:**
- Given any of the nine qualities on any root, when it is named or its notes are spelled, then no name or note contains a double flat or a double sharp.

## Implementation Notes

## Spec Change Log

## Review Triage Log

| # | Layer | Finding | Verdict | Route | Evidence |
|---|-------|---------|---------|-------|----------|
| 1 | blind, edge | The slash bass is named from the default table, so it can differ from the tone list (`Baug/E♭` against a tone `D♯`) | low | rejected | Apor's Epic 3 decision, kept: the slash bass uses the default root table (`Eaug/C`). A first fix that named the bass by the spelled tone gave `Eaug/B♯` and was reverted; the spec and tests state the rule. |
| 2 | blind | The interval test's invariant was a conditional assertion | low | patch | Fixed: an explicit table of the only two pairs that need a double (C♯ up 6 gives `G`, A♭ up 1 gives `A`) and an exact letter-stepped check for every other pair. |
| 3 | blind | The double-accidental regex is copied into three tests; no test for a twin that also needs a double | low | patch | Fixed: one shared constant; a sweep of the 108 pairs shows only twinless roots keep a fallback tone (B aug, C dim7, F dim7). |
| 4 | blind, edge | `needsDouble` has no comment; a stray blank line | low | patch | Fixed. |
| 5 | edge | Quality with more than four tones breaks the letter step | false | rejected | All nine qualities have at most four tones. |
| 6 | edge | A fallback tone can repeat a letter; the legend shows `7th A (d7)` | low | rejected | The letters of `B D♯ G` and `C E♭ G♭ A` are distinct; the `(d7)` label names the interval, which is the point of avoiding the double flat. Noted for Apor. |
| 7 | edge | `spellInterval` has no twin selection; `spelledRoot` is a second naming path; the grep claim still matches `♭♭` in a guard regex | low | rejected | The root of an interval is the user's note; `nameChord` still names, spelling only chooses letters; the glyphs `𝄫` and `𝄪` are gone and the guard regex uses escapes. |

## Verification

**Commands:**
- `npm run check` -- expected: tsc, boundaries and tests pass
- `npm run build` -- expected: success
