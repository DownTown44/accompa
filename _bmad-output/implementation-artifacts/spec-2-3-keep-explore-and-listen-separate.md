---
title: 'Story 2.3: Keep Explore and Listen separate'
type: 'feature'
created: '2026-10-24'
status: 'done'
baseline_commit: '78ddf38b73044822d7c399d2f46feed0501651c6'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-2-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Stories 2.1 and 2.2 already keep the workspace and practice parts apart, but only a few reducer cases and one UI round trip prove it, and Direction or Root changed in Explore replaces the waiting Listen question.

**Approach:** Pin the separation with reducer, hook and app tests across every pictured use, and fix only the real gaps those tests expose.

## Boundaries & Constraints

**Always:** The workspace (`pitches`, `positions`) is written only by `toggleNote`, `dismiss` (Explore clear) and `undoClear`; practice (`question`, `revealed`, `wrongMarks`, `fixedRoot`) only by `setQuestion`, `clearQuestion`, `setFixedRoot`, `reveal` and `guess`. A mode switch changes neither, and switching to Listen with a question already there sounds nothing. Listen lights only a revealed question or the Fixed root, never workspace notes; Explore lights only the workspace. Switching to Explore may stop a sounding question, as it does today. The kept clear (`cleared`) is workspace data and survives Listen visits. Changing Direction or Root while in Explore stores the setting only: the waiting question, its wrong marks and its reveal stay, and the new setting applies from the next question (from Listen, the change still replaces the question silently as it does today). With Fixed chosen in Explore and no fixed root yet, the old question stays and the root is chosen in Listen as before.

**Never:** No change to the two-note cap, the readout, the Action buttons, or Listen's guess and reveal rules. No new persisted state. No workspace data inside practice or the reverse. No `Math.random` in `core/`. No story or epic references in comments.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Light, answer, back | C4, G4 lit in Explore; `M`; reveal a question; `M` | same two notes lit, same root marker, piano window shows them | N/A |
| Wrong marks kept | Listen question with one wrong mark; `M`, light notes, `M` | same question, mark still shown, revealed unchanged, engine plays nothing | N/A |
| Reveal not from workspace | notes lit in Explore; Listen, reveal | only the question's two notes are lit, none of the workspace | N/A |
| Nothing lit in Listen | notes lit in Explore; Listen, question unrevealed | no note lit | N/A |
| Clear, visit, return | `Esc` clears in Explore; Listen, answer; back | workspace still empty, `Notes cleared.` and Undo present, Undo restores | N/A |
| Instrument swap in Listen | notes lit; Listen; `I`; back | workspace unchanged, same pitches lit on the other instrument | N/A |
| Setting changed in Explore | Listen question waiting; Setup open in Explore; change Direction or Root; Listen | same question, marks and reveal; the next question uses the new setting; nothing replays | N/A |
| Pool or theme changed in Explore | same; toggle an interval chip or theme | question and marks unchanged | N/A |
| First Listen visit | no question yet; `M` | a question plays once; Explore notes untouched | N/A |
| Purity | any practice action | workspace and `cleared` identical by reference | N/A |
| Purity | any workspace action | practice identical by reference | N/A |

</frozen-after-approval>

## Code Map

- `src/ui/session/session.ts` -- reducer; already separates workspace, `cleared` and practice; `setMode` only refits the piano window.
- `src/ui/session/useSessionActions.ts` -- `selectMode` plays a question only when none exists and stops the engine on entering Explore; `setDirection` and `setRootMode` restart the question regardless of mode (the real gap).
- `src/ui/session/useLitNotes.ts` -- Listen branch reads practice and the Fixed root, Explore branch reads the workspace.
- `src/ui/listen/ListenView.tsx`, `src/ui/explore/ExploreView.tsx` -- each renders only in its own mode.
- `src/ui/app/App.tsx` -- Undo shows only in Explore.
- Tests: `tests/ui/session/session.test.ts` (has partial separation and clear cases), `tests/ui/explore/ExploreView.test.tsx` ("keeps the notes through Listen"), `tests/ui/support/sessions.ts`, `tests/ui/support/fakeEngine.ts`.

## Tasks & Acceptance

**Execution:**
- [x] `tests/ui/session/session.test.ts` -- replace the partial "leaves practice untouched" case with an exhaustive one: each workspace action keeps `practice` by reference, each practice action keeps `workspace` and `cleared` by reference, plus the Listen-reveal piano refit on returning to Explore -- reducer purity AC
- [x] `tests/ui/app/ModeSeparation.test.tsx` -- new; the matrix rows rendered through `App` with the fake engine: light/answer/back, wrong marks kept and nothing replayed, reveal lights only the question, clear-visit-return, swap in Listen, pool and theme change, first Listen visit -- the pictured uses
- [x] `src/ui/session/useSessionActions.ts` -- `setDirection` and `setRootMode` store the setting and leave the question alone when the mode is Explore; tests beside the rows above -- real gap
- [x] `_bmad-output/implementation-artifacts/epic-2-context.md` -- add the separation patterns to Patterns Built So Far -- hand-off to Epic 3

**Acceptance Criteria:**
- Given notes are lit in Explore, when I switch to Listen, answer or reveal a question, and switch back, then the same notes are lit and visible.
- Given a Listen question with wrong marks, when I switch to Explore, light and unlight notes, and switch back, then the same question, marks and reveal state remain and nothing plays.
- Given Listen reveals a question while notes are lit in Explore, when the reveal renders, then only the question's notes are lit.
- Given a Listen question is waiting, when I change Direction or Root in Setup while in Explore and return, then it is the same question with its marks and the next one uses the new setting.
- Given any single reducer action, when it runs, then the part it does not own is unchanged by reference.

## Implementation Notes

## Verification

**Commands:**
- `npm run check` -- expected: pass
- `npm run build` -- expected: success

**Manual checks (if no CLI):**
- Headless Chrome at 1280 x 800: light two notes in Explore, `M`, reveal a question, `M`; the notes and root marker are where they were. Repeat from a waiting Listen question, lighting notes in Explore.

## Review Triage Log

| Finding | Layer | Verdict | Evidence / route |
|---|---|---|---|
| Waiting question keeps its old direction or root after a change in Explore, with no indicator | blind, edge | false | The user chose this behaviour at the spec checkpoint; the next question uses the new setting. |
| Fixed root lit in Listen while the waiting question has another root | edge | low, rejected | Follows from keeping the question; a cosmetic mismatch until Next and the fix adds branching. |
| Pool change in Explore could remove the waiting question's interval | blind, edge | false | An interval leaving the pool stays guessable for the current question; unchanged and tested earlier. |
| Reducer purity cases: duplicate `toggleNote` titles; `dismiss` and `undoClear` run from a state with nothing kept; `setMode` loop could be vacuous | blind, edge | low, rejected | The cases still assert reference equality of the part not owned; `setMode` always returns a new object. |
| Piano refit assertion loose | edge | false | Strengthened before review: 36 before, and only a start of 60 shows notes 80 and 84. |
| Magic numbers, selectors tied to CSS classes, `detail: 1`, no RTL cleanup call | blind | low, rejected | Same conventions as the existing app tests; auto-cleanup is on. |
| No focused unit test of the `useSessionActions` mode gate | blind | false | The two Explore setting tests fail with the fix removed (checked), so the gate is pinned. |
| Dropped the by-reference check of `setQuestion` from a state with a lit workspace and no question | edge | low, rejected | The new cases cover `setQuestion` from states with lit notes. |
| Verification gap layer | gap | none | No gaps found. |
