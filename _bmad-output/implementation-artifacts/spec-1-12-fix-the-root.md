---
title: 'Story 1.12: Fix the root'
type: 'feature'
created: '2026-10-24'
status: 'ready-for-dev'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Every question has a random root. There is no way to practise from one note, and a click on an instrument does nothing in Listen.

**Approach:** Add a Root control (Random, Fixed) to the Setup panel. With Fixed, pressing a note on the active instrument sounds it and makes its pitch class the root of every later question. The note shows the root marker on both instruments until another is chosen.

## Boundaries & Constraints

**Always:** Root mode is a setting next to direction: `random` or `fixed`, default Random, never persisted, applied from the next question. The fixed root is practice state (`Practice.fixedRoot`, a pitch or null), kept when switching to Random and back, never written to the workspace. `generateQuestion` takes an optional `fixedRoot` pitch; the question's root is the note heard first (the lower note for Ascending and Harmonic, the higher for Descending), has the fixed root's pitch class, and sits in the octave nearest the clicked note (ties to the lower) in which the whole interval fits `COMMON_RANGE`. Randomness stays injected. In Fixed with no root chosen, the first question draws a random root and records it as the fixed root. A press on a note while Fixed in Listen, on either instrument, calls the engine with that single pitch in `block` mode inside the gesture and sets `fixedRoot`; the question in play, its marks and its replay are untouched. In Random, or in Explore, a note press does nothing. While Fixed has a chosen root, in Listen and not revealed, that pitch shows lit with the root ring on both instruments (on the guitar every position of that pitch is lit, and the ring goes on the one with the lowest fret); a revealed question lights its own notes as before. The Status note reads `Click a note to set the root.` in Listen while Fixed has no root, below the `Press any key to wake the sound.` message in priority. The Root control is a labelled radiogroup under Direction in the panel, with the shared selected treatment; the panel still fits 1280 x 800 without scrolling. Digit keys and `P` keep yielding as before while a radio has focus.

**Never:** No persistence, no new shortcut, no Explore behavior, no note names, no change to the workspace, no `Math.random` in `core/`, no story or epic references in comments.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Default | fresh load | Root Random selected, no marker, no status note | N/A |
| Fixed, none chosen | pick Fixed | Status note shows; the next question has a random root, becomes the fixed root, note clears | N/A |
| Choose root | Fixed, press A3 on either instrument | A3 sounds once, shows the root marker on both instruments, status note gone | N/A |
| Next questions | fixed root A3, Ascending | every root has pitch class A, octave nearest A3 where the interval fits | N/A |
| Octave fit | fixed root near the top, P8 | octave moved down so both notes fit the range | N/A |
| Descending | fixed root A3 | the higher note is the root, pitch class A, octave nearest where the pair fits | N/A |
| Mid-question | press another note | question, marks and replay unchanged; next question uses the new root | N/A |
| Random and back | Fixed with root, Random, Fixed | same root kept, marker shows again | N/A |
| Random or Explore | press a note | nothing sounds, nothing changes | N/A |
| Reveal | revealed question, Fixed | the question's two notes are lit with the root ring on its root | N/A |
| Reload | Fixed with a root, reload | Random, no fixed root | N/A |
| Yield | focus on a Root radio, press a digit | native behavior, no guess | N/A |

</frozen-after-approval>

## Code Map

- `src/core/model.ts` -- add `RootMode`, `rootMode` in `Settings` (default `random`), `fixedRoot: Pitch | null` in `Practice`. `src/core/practice.ts` -- `generateQuestion` accepts `fixedRoot`; keep the random draw as is when absent.
- `src/ui/settings/settings.ts` -- `setRootMode` action; `settingsStorage.ts` does not save or load it.
- `src/ui/session/session.ts`, `useSessionActions.ts` -- `setFixedRoot` action; `startQuestion` passes `fixedRoot` in Fixed and, when none is chosen, records the drawn root; `pressNote(pitch)` plays it and sets the root only in Listen and Fixed.
- `src/ui/session/useLitNotes.ts` -- before reveal in Listen with Fixed and a chosen root, lit is `[fixedRoot]` with `root` set; the guitar stage already rings `root` when both notes are given, so check it handles a single note.
- `src/ui/instruments/piano/PianoStage.tsx`, `guitar/GuitarStage.tsx` -- pass `onNotePress` (`PianoKeyboard` gives a pitch, `Fretboard` gives a `FretNote` with `pitch`).
- `src/ui/app/App.tsx` -- Status note message priority.
- `src/ui/setup/SetupPanel.tsx` -- Root group via `SegmentedGroup` (`setup` variant) under Direction.
- Tests: `tests/core/practice.test.ts` (octave fit for all intervals and directions, seeded), `tests/ui/settings/settings.test.ts`, `tests/ui/session/session.test.ts`, `tests/ui/setup/SetupPanel.test.tsx`, stage tests, `tests/ui/app/App.test.tsx`.

## Tasks & Acceptance

**Execution:**
- [ ] `src/core/model.ts`, `src/core/practice.ts`, `tests/core/practice.test.ts` -- fixed-root generation with octave fit
- [ ] `src/ui/settings/settings.ts`, `src/ui/session/session.ts`, `useSessionActions.ts`, tests -- root mode, fixed root, `pressNote`, first-question rule
- [ ] `src/ui/session/useLitNotes.ts`, `PianoStage.tsx`, `GuitarStage.tsx`, `App.tsx`, tests -- marker, press wiring, Status note
- [ ] `src/ui/setup/SetupPanel.tsx`, tests -- Root control; every matrix row tested

**Acceptance Criteria:**
- Given the Setup panel, then Root shows Random and Fixed with a label and the shared selected treatment.
- Given Fixed with a chosen root, then every question's root has that pitch class in the nearest octave where the interval fits, in all three directions.
- Given a press on a note in Fixed, then it sounds, shows the marker on both instruments, and only practice state changes.
- Given 1280 x 800, then nothing scrolls with the panel open, in light and dark.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Design Notes

The marker sits on the clicked note, which can be an octave away from the question's root; both share a pitch class, and a revealed question lights its own notes.

## Verification

**Commands:**
- `npm run check` -- expected: tsc clean, boundary check passes, all specs green
- `npm run build` -- expected: succeeds

**Manual checks:**
- Choose Fixed, press notes on piano and guitar, hear each, run several questions in each direction and reveal; panel fits 1280 x 800 in light and dark.
