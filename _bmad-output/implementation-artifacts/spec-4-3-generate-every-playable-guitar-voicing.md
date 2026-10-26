---
title: 'Story 4.3: Generate every playable guitar voicing'
type: 'feature'
created: '2026-10-26'
status: 'draft'
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

**Always:** New `core/voicings.ts`, pure, no `ui/` or audio import, no `Math.random`. One constants object holds max span 4 (open strings excluded), root and 3rd required, 7th required on seventh chords, only the 5th droppable, bucket width (3). `generateVoicings(chord, tuning, rules, range?)` takes the root pitch class, quality, tuning and an optional fret range; it returns `GuitarVoicing[]`, each with `pitches` (bass to treble) and a fret or `null` (muted) per string; at most one note per string; every pitch class is a chord tone; chord tones may double across strings; unranked, in a fixed order; `[]` when none, never throws. A note is in range only inside `range`, and an open string only when the range includes fret 0 (the whole neck by default). `rankVoicings(voicings, sourceMean, bucketWidth)` sorts by `floor(|mean pitch - sourceMean| / bucketWidth)`, stable within a bucket, and does not touch the generator. The source is the mean pitch of the lit notes. The chord is the one reading `exploreReading` leads with (chosen root and reading honoured), so names stay with `nameChord`. A voicing shows only for a named chord of three or more notes; one note, two notes (an interval), or notes with no reading, keep the 3.9 placement and no stepper. A click on the fretboard keeps the 3.8 rule (replace the string's occupant) and the voicing is recomputed from the lit notes. When the shown voicing leaves out the chord's 5th, one Status line says `5th left out`, ranked with the beyond note; the readout, legend and name stay on the lit notes. The voicing is derived on each render, written to no state; the workspace, lit notes, readout, legend, piano, Play and Block are unchanged. Markers: fretted notes by role, an open string as the role shape in a ring at the nut, a muted string as `x`, nothing else. No voicing fits: empty fretboard and the Status note `No voicing fits here. Try widening the region.`; the notes stay lit. The instrument does not move.

**Never:** No region UI (Story 4.2), stepper (4.4), shape templates (4.5), hand-edit (4.6), strum (4.7), dimmed or extra positions, tuning UI, persistence, new reducer action, change to `placeLit`, `nameChord` or Listen.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Chord shown | C4 E4 G4 on piano, swap | one voicing nearest that register: fretted, open (ringed) and muted (`x`) strings marked, root ringed | N/A |
| Register | C5 E5 G5 versus C3 E3 G3 | high chord ranks high voicings first, low chord low ones | N/A |
| Seventh | C maj7 | 7th always present; 5th may be missing; root and 3rd always present | N/A |
| All qualities | each of the nine | every voicing's pitch classes are the chord's, only a 5th omitted | N/A |
| Span | any voicing | fretted notes within 4 frets; open strings do not count | N/A |
| Region | range 5 to 9 | only voicings with every fretted note inside it; no open string unless range starts at 0 | N/A |
| No voicing | impossible range | `[]`; empty fretboard; Status `No voicing fits here. Try widening the region.` | no throw |
| 5th left out | best voicing has no 5th | Status `5th left out`; readout and legend unchanged | N/A |
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

## Design Notes

Search string by string (muted or a chord-tone fret), pruning on span, so the cost stays small; compute once per render with `useMemo`. Source mean uses all lit notes, including any beyond the fretboard.

## Verification

**Commands:**
- `npm run check` -- expected: tsc, boundaries and tests pass
- `npm run build` -- expected: success

**Manual checks (if no CLI):**
- Built app at 1280 x 800: instrument top and Status note stay put, no page scroll.
