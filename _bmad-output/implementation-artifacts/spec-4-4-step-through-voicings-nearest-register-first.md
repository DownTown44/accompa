---
title: 'Story 4.4: Step through voicings, nearest register first'
type: 'feature'
created: '2026-10-26'
status: 'done'
baseline_commit: '62b9e6e858b3c6a2fca348867a022139ea888324'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 4.3 shows only the best-ranked guitar voicing; Apor cannot reach the other playable shapes of the chord, nearest register first.

**Approach:** A Voicing stepper over the ranked list 4.3 already derives, with the selected voicing kept in the workspace. The ranking, generator and markers are unchanged; this story adds the stepper only.

## Boundaries & Constraints

**Always:** The stepper reads `◀ Voicing 1 of N ▶` and shows only on the guitar, in Explore, when the ranked list has two or more voicings. Arrows are real buttons, at least 40 x 40px, named `Previous voicing` and `Next voicing`. It opens on the best-ranked voicing. `Left`/`Right` and clicks step by one, with no wrap. At an end the arrow is replaced by an inert, non-focusable `·` with `aria-disabled="true"`; if the focused arrow goes inert, focus moves to the remaining arrow. With one or no voicing the stepper is hidden, and focus that was inside it goes to the instrument. A visually hidden polite live region says `Voicing 2 of 8`, only after a step, debounced 400 ms like the readout announcer (`ExploreView`). No shape label.

Selection: the workspace gets an optional `voicing` holding the selected voicing's `frets` (which voicing, not an index), written only by a new reducer action `selectVoicing`; the reducer leaves `practice` untouched by reference. The shown voicing is the list entry whose `frets` equal it, else the best (the stored value is not rewritten). `toggleNote`, `chooseReading` and `chooseRoot` drop it, so the stepper reopens on the best when the chord's notes, reading or root change; Esc clears it with the workspace and Undo restores it; a swap to Piano and back keeps it. A fret click keeps the 3.8 rule and recomputes the list from the lit notes (4.3 Q2a decision), so it reopens on the best until Story 4.6. The ranked list is derived on each render in one shared place (`useLitNotes`), and the shown voicing, `5th left out`, `x` and ring markers follow the selected one.

Focus order: Readout alternatives, then the stepper, then the action buttons (there is no region bar; Story 4.2 was dropped). `Left`/`Right` step in Explore on the guitar with two or more voicings, when focus is on the instrument, on the stepper's arrows, or on no control; they yield to any other focused button, text field or `Ctrl`/`Alt`/`Meta`, and do nothing on the piano or in Listen. Layout: the stepper row is reserved in Explore on both instruments (40px plus gap), inside the readout block, so the instrument top and the Status note keep their place; the block height token grows for Explore and Listen together, so a mode switch still moves nothing.

**Never:** No region UI, shape templates (4.5), hand-edit (4.6) or `Voicing edited` state, strum (4.7); no wrap; no dimmed or extra positions; no touch, phone or narrow-viewport handling; no change to the generator, ranking, `placeLit`, `nameChord` or Listen's content; Play and Block still sound the lit notes.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Open | C4 E4 G4, swap to guitar | `Voicing 1 of N` (N at least 2), the best-ranked voicing, `◀` inert `·` | N/A |
| Step | `Right` or click `▶` | voicing 2, both arrows live; markers, ring and `x` follow it; announces `Voicing 2 of N` after 400 ms | N/A |
| End | at voicing N | `▶` becomes `·`; if it had focus, `◀` takes it | no wrap |
| Start | at voicing 1, press `Left` | nothing changes, no announcement | N/A |
| One voicing | list of one | stepper hidden; focus from inside it goes to the instrument | N/A |
| No voicing or under 3 notes | `No voicing fits these notes.`, single note, interval | no stepper, row empty | N/A |
| Chord changes | step to 3, then light another note or choose another reading or root | list recomputed, opens on voicing 1 | N/A |
| Swap | step to 3, swap to piano and back | still voicing 3 | N/A |
| Undo | step to 3, Esc, Undo | voicing 3 again | N/A |
| Stale selection | stored `frets` not in the list | best voicing, no throw | N/A |
| Focus elsewhere | focus on a reading alternative or Play | `Left`/`Right` do nothing | N/A |
| Instrument focused | focus on the fretboard | `Left`/`Right` step | N/A |
| Beyond note, 5th | stepping to a voicing with no 5th | Status `5th left out` follows the shown voicing | N/A |
| Piano | any | no stepper, shortcuts do nothing | N/A |
| Listen | any | Listen unchanged, its instrument top where it was | N/A |
| Instrument does not move | open, step to each end, hidden, empty result, both instruments and themes | instrument top and Status note keep their place; no page scroll at 1280 x 800 | N/A |

</frozen-after-approval>

## Code Map

- `src/core/model.ts` -- `Workspace` gets `voicing?: readonly (number | null)[]`; `initialWorkspace` unchanged.
- `src/ui/session/session.ts` -- add `selectVoicing { frets }`; delete `voicing` in `chooseReading` and `chooseRoot` (both spread `rest`); `toggleNote` rebuilds the workspace already without it; `dismiss`/`undoClear` already carry it.
- `src/ui/session/useLitNotes.ts` -- `bestVoicing` becomes `rankedVoicings` returning list, selected index and the existing roles and `fifthLeftOut`; export a small hook so the stepper reads the same memo.
- `src/ui/explore/VoicingStepper.tsx` (new), `explore.css`, `ExploreView.tsx` -- stepper after `.reading-alternatives`, live region beside the existing announcer; reserved row; block height token in the shared CSS.
- `src/ui/shortcuts/useShortcuts.ts`, `useSessionActions.ts` -- `Left`/`Right` and `stepVoicing(direction)`; `isControl` yields except inside the stepper.
- `src/ui/shared/focus.ts` -- reuse the instrument focus; `src/core/voicings.ts`, `GuitarStage.tsx`, `Fretboard.tsx` unchanged.
- Tests: `tests/ui/session/` reducer (practice and the other half untouched by reference), `tests/ui/explore/ExploreStepper.test.tsx`; helpers in `tests/ui/support/` (`keys.ts`, `explore.ts`).

## Tasks & Acceptance

**Execution:**
- [ ] `model.ts`, `session.ts`, `useSessionActions.ts` -- `voicing`, `selectVoicing`, drops on chord change, tests
- [ ] `useLitNotes.ts` -- ranked list and selected index, shown voicing follows selection
- [ ] `VoicingStepper.tsx`, `ExploreView.tsx`, css -- stepper, inert ends, focus moves, live region, reserved row
- [ ] `useShortcuts.ts` -- `Left`/`Right` rule
- [ ] UI tests per matrix row
- [ ] Headless Chrome 1280 x 800 -- stepper at start, middle, end, hidden, both themes and instruments; compare instrument top and Status note; check Listen

**Acceptance Criteria:**
- Given a named chord with several voicings on the guitar, when I press `Right`, then the next-ranked voicing shows and `Voicing 2 of N` is announced.

## Review Triage Log

| # | Layer | Finding | Verdict | Route | Evidence |
|---|-------|---------|---------|-------|----------|
| 1 | gap | The no-announcement-on-swap check never advances the fake timers, so it cannot fail | medium | patch | Fixed: the test advances 400 ms inside `act` before each assertion. |
| 2 | gap, edge | Focus handoff tested for one of three branches (previous to next, hidden with focus, one voicing) | medium | patch | Fixed: tests for Previous to Next, `i` hiding the stepper (focus on `.piano`), and a one-voicing mock (`ExploreStepperOne.test.tsx`). |
| 3 | gap, blind, edge | The Left/Right guard test ends without assertions; no arrow key from `.piano`; shown frets only compared as different | low | patch | Fixed: asserts the count after returning to Explore, dispatches from `.piano`, compares the shown frets with the ranked entry. |
| 4 | blind, edge | `selectVoicing` writes in any mode and when the frets are unchanged; `chooseRoot` guards both | low | patch | Fixed: returns the same state unless the mode is Explore and the frets differ; reducer rows added. |
| 5 | edge | `stepped` is never cleared, so identical text after a new chord is not re-announced and stale text lingers | low | patch | Fixed: cleared when the list identity changes; test added. |
| 6 | blind, gap | No test for a stale stored voicing | low | patch | Fixed: the shown voicing falls back to 1 and nothing throws. |
| 7 | blind | Left and Right are missing from the shortcut list | low | patch | Fixed: row added to `HelpHint.tsx` and its test; the list has no fixed height and ends at y 689 in Chrome. |
| 8 | blind, edge, gap | `useShown` runs in four consumers, so generation and ranking run four times per change | low | rejected | Real but small (a few thousand leaves); sharing the memo needs a provider, more than a direct fix. Browser check showed no delay. |
| 9 | blind | `_voicing` destructuring may trip lint | false | rejected | `tsc` and the full check pass. |
| 10 | blind, edge | Announcer compares array identity | false | rejected | The ranked list is rebuilt only when the lit notes, reading or root change, which is a new chord and is not announced by design. |
| 11 | edge | Left and Right step while Setup or Help is open | low | rejected | The other shortcuts (`m`, `p`, `r`, interval keys) behave the same; the panels are not modal. |
| 12 | edge | Focus drops to the body when an arrow is focused and the mode switches to Listen | low | rejected | The stepper unmounts with Explore; any focused control in Explore does the same on a mode switch. |
| 13 | edge | Two quick keydowns read a stale list | false | rejected | React commits the discrete keydown and runs the layout effect before the next event. |
| 14 | blind | `aria-disabled` on a span, duplicate live region, hover styles, a named `Frets` type | low | rejected | The inert `·` with `aria-disabled` is the planned design; the rest is cosmetic. |
| 15 | blind, gap | No layout check for the taller block height | false | rejected | Done in headless Chrome at 1280 x 800, both themes: instrument top 366.2, Status top 725.2, no scroll on every step, Listen and the help list included. |

## Design Notes

Storing `frets` survives list changes with no index to repair; a swap leaves the stored value untouched, so the same voicing returns while the list is unchanged.

## Verification

**Commands:**
- `npm run check` -- expected: tsc, boundaries and tests pass
- `npm run build` -- expected: success

**Manual checks (if no CLI):**
- Built app at 1280 x 800: instrument top and Status note stay put on piano, guitar and Listen; no page scroll.
