---
title: 'Story 1.9: Set direction'
type: 'feature'
created: '2026-10-24'
status: 'draft'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Every question is ascending and arpeggiated. There is no way to practise descending or harmonic intervals.

**Approach:** Add a Direction segmented control (Ascending, Descending, Harmonic) to the Setup panel. A question carries its own direction, set when it is drawn; the engine gets the ordered pitch list and replays it identically. The Root half of the epic story (Random or Fixed) is deferred, with the Setup panel left without a Root control.

## Boundaries & Constraints

**Always:** Direction is session state, default Ascending, never persisted. A question records its direction when drawn; Play again, replays and a right guess's next question use the recorded value, so a setting change applies from the next question and the current one stays answerable. Ascending plays low then high as an arpeggio. Descending plays high then low as an arpeggio, and its root is the first note, the higher one, with the other note `interval` semitones below. Harmonic plays low and high together in `block` mode, with the lower note as root. The whole interval fits `COMMON_RANGE` in every direction, and `core/` draws with the injected random function. The control is a labelled `radiogroup` named `Direction` with the shared selected treatment, placed in the panel under the pool chips with a Setup label; the panel stays reachable and fits 1280 x 800. Digit keys and `P` keep yielding as before while a radio has focus. Reveal lights both notes and the root marker on the root note.

**Never:** No Root control, no Fixed root, no root clicking, no new persistence, no sound or theme controls, no change to `AudioEngine`, no `Math.random` in `core/`, no story or epic references in comments.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Ascending | question P5 from C4 | engine gets `[C4, G4]` as `arpeggio` | N/A |
| Descending | question P5 | root is the higher note; engine gets `[G4, C4]` as `arpeggio`; reveal marks the higher note as root | N/A |
| Harmonic | question P5 | engine gets `[C4, G4]` as `block` | N/A |
| Replay | any direction, press `Space` | same list and mode as the first play | N/A |
| Change mid-question | Descending selected during an ascending question | question, marks and buttons unchanged; the next question is Descending | N/A |
| Range | octave in Descending or Harmonic | both notes inside `COMMON_RANGE` for every seeded draw | N/A |
| Reload | Descending chosen, page reloaded | Ascending again | N/A |
| Yield | focus on a Direction radio, press a digit | native behavior, no guess | N/A |

</frozen-after-approval>

## Code Map

- `src/core/model.ts` -- add `Direction` and a `direction` field on `Question`. `src/core/practice.ts` -- `generateQuestion` takes `direction`; Descending sets `root` to the upper note and `pitches` high to low; Harmonic and Ascending as today. Keep `random` injected; existing tests pass `direction` explicitly.
- `src/audio/engine.ts` -- unchanged; `PlayMode` already has `block` and `arpeggio`.
- `src/ui/session/session.ts` -- add `direction` to `Session` (default `ascending`) and a `setDirection` action; `setQuestion` keeps the drawn question as is.
- `src/ui/session/useSessionActions.ts` -- `startQuestion` passes `session.direction`; replace the four `engine.play(..., 'arpeggio')` calls with one `playQuestion(question)` that picks `block` for Harmonic; expose `setDirection`.
- `src/ui/setup/SetupPanel.tsx`, `setup.css` -- Direction group below the chips with a Setup label; reuse `src/ui/shell/SegmentedGroup.tsx` (add a `setup` variant, no `margin-left: auto`, same checked treatment from `shell.css`).
- `src/ui/session/useLitNotes.ts`, `GuitarStage.tsx` -- read `root` from the question; `GuitarStage` pairs root and upper by `find`, so check Descending still lights both notes with the marker on the higher one.
- `tests/core/practice.test.ts`, `tests/ui/session/session.test.ts`, `tests/ui/setup/SetupPanel.test.tsx`, `tests/ui/listen/IntervalButtons.test.tsx` (fake engine records `mode`).

## Tasks & Acceptance

**Execution:**
- [ ] `src/core/model.ts`, `src/core/practice.ts`, `tests/core/practice.test.ts` -- direction in questions, range fit for each direction
- [ ] `src/ui/session/session.ts`, `useSessionActions.ts`, tests -- direction state, `playQuestion`, mid-question rule
- [ ] `src/ui/shell/SegmentedGroup.tsx`, `src/ui/setup/SetupPanel.tsx`, `setup.css` -- Direction control in the panel
- [ ] `src/ui/session/useLitNotes.ts`, `GuitarStage.tsx`, tests -- reveal markers for Descending on both instruments; matrix tests

**Acceptance Criteria:**
- Given the Setup panel, then Direction shows three options with a label and the shared selected treatment, Ascending selected.
- Given any direction, when an interval plays, then the engine gets the ordered list and mode from the matrix and replays it identically.
- Given a direction change, when a question is in progress, then it applies from the next question.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Design Notes

Descending keeps the root as the note heard first, so "root" always means the starting note. Fixed root (deferred) will need this: it fixes the starting note's pitch class.

## Verification

**Commands:**
- `npm run check` -- expected: tsc clean, boundary check passes, all specs green
- `npm run build` -- expected: succeeds

**Manual checks:**
- Pick each direction in the panel, hear the play, reveal on piano and guitar; panel fits 1280 x 800 in light and dark.
