---
title: 'Story 4.3: Generate every playable guitar voicing'
type: 'feature'
created: '2026-10-26'
status: 'done'
baseline_commit: 'c6620d329b007a9c1cb0c8e1576714876ddd9cea'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A chord swapped to the guitar shows one note per string (Story 3.9), often three scattered notes, not a shape Apor can play in the register he built.

**Approach:** Built before Story 4.2 (decided by Apor: the region bar waits until after Story 4.4), so only the generator takes a fret range. A pure generator returns every playable voicing of the chord; a separate pure ranking puts the register nearest the piano chord first; the fretboard shows the best-ranked one. The stepper is Story 4.4.

## Boundaries & Constraints

**Always:** New `core/voicings.ts`, pure, no `ui/` or audio import, no `Math.random`. One constants object holds max span 4 (open strings excluded), root and 3rd required, the 5th required on triads and droppable only on seventh chords (changed by Apor after trying it: triads are root, 3rd and 5th), the 7th required on seventh chords, at most four fingers (a fretted note is a finger; two or more notes at the lowest fretted fret share one finger as a barre, but only when no open string lies between the barre's outer strings; a shape needing more than four fingers is not a voicing, so `8 7 5 5 8 8` is out; changed by Apor after trying it: barre, open and triad shapes are welcome, unplayable ones are not), bucket width (6, so the A-shape barre `x 3 5 5 5 3` and the E-shape barre at the 8th fret count as the same register as C4 E4 G4; decided by Apor). `generateVoicings(chord, tuning, rules, range?)` takes the root pitch class, quality, tuning and an optional fret range; it returns `GuitarVoicing[]`, each with `pitches` (bass to treble) and a fret or `null` (muted) per string; at most one note per string; every pitch class is a chord tone; chord tones may double across strings; the lowest sounding note is the reading's bass note when it has one (a slash chord), else its root, and only when no such voicing exists may another note be lowest (decided by Apor: a C major must not show as C/E); muted strings are fine only below the lowest or above the highest sounding string (no muted string between two sounding strings, so `8 x x 12 x 12` is not a voicing); an open string is allowed only when every fretted note is at or below fret 5 (a tunable constant, `openPositionMaxFret`), so `8 10 10 0 8 0` is not a voicing; unranked, in a fixed order that does not prefer voicings with more strings sounding; `[]` when none, never throws. A note is in range only inside `range`, and an open string only when the range includes fret 0 (the whole neck by default). `rankVoicings(voicings, sourceMean, bucketWidth)` sorts by `floor(|mean pitch - sourceMean| / bucketWidth)`, then by more sounding strings (so full chords come before two- and three-string fragments, which stay reachable later), then by playability (smaller fret span of the fretted notes, then fewer different fretted frets), then exact register distance, then stable (Story 4.5 puts template matches before this), and does not touch the generator. The source is the mean pitch of the lit notes. The chord is the one reading `exploreReading` leads with (chosen root and reading honoured), so names stay with `nameChord`. A voicing shows only for a named chord of three or more notes; one note, two notes (an interval), or notes with no reading, keep the 3.9 placement and no stepper. A click on the fretboard keeps the 3.8 rule (replace the string's occupant) and the voicing is recomputed from the lit notes. There is no `5th left out` Status line (removed by Apor: it was confusing); the readout, legend and name stay on the lit notes. The voicing is derived on each render, written to no state; the workspace, lit notes, readout, legend, piano, Play and Block are unchanged. Markers: fretted notes by role, an open string as the role shape in a ring at the nut, a muted string as `x`, nothing else. No voicing fits: empty fretboard and the Status note `No voicing fits these notes.`; the notes stay lit. The instrument does not move.

**Never:** No region UI (Story 4.2), stepper (4.4), shape templates (4.5), hand-edit (4.6), strum (4.7), dimmed or extra positions, tuning UI, persistence, new reducer action, change to `placeLit`, `nameChord` or Listen.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Chord shown | C4 E4 G4 on piano, swap | one voicing nearest that register: fretted, open (ringed) and muted (`x`) strings marked, root ringed | N/A |
| Root in the bass | C4 E4 G4 | lowest sounding note is C; the open shape (`x 3 2 0 1 0`) and the barre (`8 10 10 9 8 8`) are both candidates, the barre ranks first by register | N/A |
| Slash chord | C4 E4 G4 built as E4 G4 C5 (C/E) | lowest sounding note is E | N/A |
| No root in the bass | a chord with no such voicing | another note may be lowest; no throw | N/A |
| Register | C5 E5 G5 versus C3 E3 G3 | high chord ranks high voicings first, low chord low ones | N/A |
| Seventh | C maj7 | 7th always present; 5th may be missing; root and 3rd always present | N/A |
| All qualities | each of the nine | every voicing's pitch classes are the chord's, only a 5th omitted | N/A |
| Span | any voicing | fretted notes within 4 frets; open strings do not count | N/A |
| Region | range 5 to 9 | only voicings with every fretted note inside it; no open string unless range starts at 0 | N/A |
| No voicing | impossible range | `[]`; empty fretboard; Status `No voicing fits these notes.` | no throw |
| Finger count | any voicing | at most four fingers with the barre rule; `8 10 10 9 8 8` and `x 3 5 5 5 3` and `x 3 2 0 1 0` pass, `8 7 5 5 8 8` and `3 2 3 0 3 3` do not | N/A |
| Triad | C major | every voicing has C, E and G; a seventh chord may omit its 5th | N/A |
| One or two notes | single note, or an interval | 3.9 placement, no stepper | N/A |
| Click while a voicing shows | click a fret on another note's string | 3.8 replace, voicing recomputed from the lit notes | N/A |
| Unnamed set | notes with no reading | 3.9 placement | N/A |
| Beyond range | a lit note below E2 | voicing from the pitch classes; Status note for beyond notes as today | N/A |
| Swap back | voicing shown, swap to piano | all lit notes show | N/A |
| Undo, Esc | clear then Undo | voicing returns | N/A |
| Listen | any | unchanged | N/A |
| Instrument does not move | swap with a voicing, the `x` markers, an empty result with the longer Status text, both themes | instrument top and Status area keep their place | N/A |

</frozen-after-approval>

## Code Map

- `src/core/explore.ts` -- `placeLit`, `litPositions`, `leftOutCount` stay for single notes and unnamed sets; `exploreReading` gives root, quality roles. Do not change.
- `src/core/instruments.ts` -- `STANDARD_GUITAR_TUNING`, `GUITAR_FRETS`, `pitchAt`, `FretPosition`; tuning is passed in.
- `src/core/chords.ts`, `theory.ts` -- `nameChord`, `CHORD_QUALITIES` (nine, `intervals`): the chord tones; no name made here.
- `src/core/voicings.ts` (new) -- constants, `GuitarVoicing`, `generateVoicings`, `rankVoicings`.
- `src/ui/session/useLitNotes.ts` -- explore branch builds `positions`, `positionRoles`, `rootPosition` and a new `muted` list from the best voicing, else as today.
- `src/ui/app/App.tsx` -- Status note: the no-voicing message and `5th left out`, ranked with the beyond note.
- `src/ui/instruments/guitar/GuitarStage.tsx`, `Fretboard.tsx` -- the open ring (`fb-open-ring` at fret 0, `OPEN_X`) already exists; add an optional `muted` prop drawing `x` at `OPEN_X`, default none so Listen is unchanged; `guitar.css` style `fb-muted`. `shared/RoleMarker` unchanged.
- `src/ui/session/session.ts` -- no change; clicks keep the 3.8 rule.
- Tests: `tests/core/voicings.test.ts` (new), `tests/ui/explore/ExploreGuitar.test.tsx`; helpers `tests/ui/support/explore.ts`.

## Tasks & Acceptance

**Execution:**
- [ ] `core/voicings.ts` -- constants, generator with optional range, ranking
- [ ] `tests/core/voicings.test.ts` -- nine qualities, open, muted, span, dropped 5th, region, `[]`, high versus low register
- [ ] `useLitNotes.ts`, `App.tsx`, `GuitarStage.tsx`, `Fretboard.tsx`, `guitar.css` -- show the best voicing, `x`, Status
- [ ] UI tests per matrix row
- [ ] Headless Chrome 1280 x 800 -- picture a chord with open and muted strings, no voicing, light and dark; compare instrument top and Status area; check Listen

**Acceptance Criteria:**
- Given a named chord on the piano, when I swap to the guitar, then the best-ranked playable voicing shows in the register I built.

## Review Triage Log

| # | Layer | Finding | Verdict | Route | Evidence |
|---|-------|---------|---------|-------|----------|
| 1 | gap, blind, edge | No test reaches the `No voicing fits these notes.` path | medium | patch | Fixed: `ExploreNoVoicing.test.tsx` mocks the generator to `[]` and asserts the Status text and an empty board. No named chord lacks a voicing on the whole neck, so the path is otherwise unreachable. |
| 2 | gap, blind, edge | The `5th left out` test cannot fail | medium | patch | Fixed: F A C ranks `1 0 3 2 x x` with no C; the test asserts the exact text, and C major shows none. |
| 3 | gap | Chosen-root and slash-bass paths into the voicing have no UI test | medium | patch | Fixed: E4 G4 C5 shows an E lowest; a chosen root on an augmented chord moves the ring. |
| 4 | gap, blind | Muted and root-ring assertions only count; several tests loosened to `>= 3` | low | patch | Fixed: exact fret and role assertions; muted strings equal the unlit strings. |
| 5 | gap, blind, edge | The click-recompute test asserts nothing about the voicing | low | patch | Fixed: asserts the readout and that the markers equal a fresh render of the same lit notes. |
| 6 | blind, edge | The register test resets `document.body` and renders a second `App` | low | patch | Fixed: split into a high and a low chord test. |
| 7 | gap | The 3.9 placement test lost its placement assertions | low | patch | Fixed: restored on a two-note set. |
| 8 | blind | Test comment says the beyond-fretboard pitch changes nothing | low | patch | Fixed: the register follows the mean of all lit notes, as the spec's Design Notes say. |
| 9 | blind | `const highest = max` alias | low | patch | Fixed. |
| 10 | blind | Source register uses off-fretboard pitches | false | rejected | Specified in Design Notes: the mean uses all lit notes. |
| 11 | blind, edge | Roles and positions can misalign for equal pitches; no root ring for a rootless voicing | false | rejected | Equal pitches share a pitch class and role; the root step is never droppable, so a voicing always has one. |
| 12 | blind, edge | `bestVoicing` re-implements reading selection | low | rejected | It uses the same `orderedReadings` and `readingRootedOn` helpers the readout uses; a chosen-root test now pins it. |
| 13 | blind, edge | "5th" hard-coded as step 2; other steps get `none` | false | rejected | All nine qualities list root, 3rd and 5th at indices 0 to 2; the 7th is index 3. |
| 14 | blind, edge | Clicking a shown voicing note whose pitch is not lit adds a note; no mapping back; the voicing may differ from the clicked marker | medium | rejected | Apor's decision (Q2a): clicks keep the 3.8 rule until Story 4.6 (hand-edit). Noted for the end-of-epic review. |
| 15 | edge | Beyond note hides `5th left out`; `noVoicing` hides the beyond note; bass fallback has no signal; `bestVoicing` falls back to 3.9 for an unreadable set | low | rejected | The spec ranks one Status line, specifies the bass fallback and the 3.9 fallback for unnamed sets. |
| 16 | blind, edge | Generator performance, a bucket width of 0 or NaN, an empty pitch list | low | rejected | The constants are fixed, a voicing always has a root, and the browser check showed no delay. |
| 17 | blind | The muted `x` has no accessible name or contrast check | low | rejected | Screen-reader support is best effort (NFR7); `--color-muted` is the quiet token used elsewhere. |

Accepted deviations recorded for later runs: the ranking is bucket (6 semitones), more sounding strings, smaller fret span, fewer distinct fretted frets, exact distance, generator order, with an open string only at or below fret 5. Story 4.5 puts template matches ahead of the span keys. The `x` marker was checked only in unit tests, because the piano range gave no chord whose best voicing mutes a string.

## Design Notes

Search string by string (muted or a chord-tone fret), pruning on span, so the cost stays small; compute once per render with `useMemo`. Source mean uses all lit notes, including any beyond the fretboard.

## Verification

**Commands:**
- `npm run check` -- expected: tsc, boundaries and tests pass
- `npm run build` -- expected: success

**Manual checks (if no CLI):**
- Built app at 1280 x 800: instrument top and Status note stay put, no page scroll.
