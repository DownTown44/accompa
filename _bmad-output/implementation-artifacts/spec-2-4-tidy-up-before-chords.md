---
title: 'Story 2.4: Tidy up before chords'
type: 'chore'
created: '2026-10-24'
status: 'done'
baseline_commit: '2e8da4afe61ac3ab86b6bb7366050acb46f90107'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-2-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Epic 2 retrospective left five carry-overs in the app (the test-helper clean-up is Story 2.5): the instrument jumps 16px between Explore (top 216px) and Listen (232px); Explore and `ui/shell` import styles and the focus helper from `ui/listen`; guess validity is written three times; the built app 404s on the favicon; and a lit note below E2 or above D6 is silently missing from the guitar.

**Approach:** Match the two readout blocks, move the shared styles and helper to `ui/shared`, put one guess rule in `core/`, add an SVG favicon, and add a quiet Status note for notes lit beyond the fretboard. No other behaviour changes.

## Boundaries & Constraints

**Always:** Listen's readout block keeps its size; Explore's grows to match it by a shared height (question line, gap and hint line), so the instrument top is the same in both modes (232px at 1280 x 800), and the Explore prompt and readout keep one fixed height inside it (commit 776c399). Shared UI (`.controls`, `.action-button`, `.action-primary`, `.action-button .key-hint`, `.visually-hidden`, `focusInstrument`) lives in `src/ui/shared/`; nothing under `ui/explore` or `ui/shell` imports from `ui/listen`, and `ui/listen` and `ui/explore` do not import each other. `scripts/check-boundaries.mjs` enforces this and its own test covers it. The guess rule is: the interval is in the pool or is the current answer, and has not been tried; the reducer's other checks (question present, not revealed, not the answer) stay. The beyond-fretboard count is the `null` entries of `litPositions`; the note shows on the guitar in Explore only, takes the slot of the piano's offscreen note (last in `App`'s order: audio blocked, Fixed-root prompt, clear note with Undo, offscreen or beyond), and has no direction arrows. The favicon uses the Rose Quartz colors from `theme.css`.

**Never:** No test deleted or weakened; the passing count does not drop below 600. No move of `press`, `radio` or the Setup opener into shared helpers and no split of `SetupPanel.test.tsx` (Story 2.5); new tests may define their own local helpers. No change to the readout, Action buttons, shortcuts, session state shape (beyond the `pool` field the guess action carries), or lit-note cap. No `Math.random` in `core/`. No story or epic references in comments. No new dependency.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Mode switch, top edge | `M` or the tabs, both ways, with none, one or two notes lit, either instrument | `.stage svg` top is the same in both modes | N/A |
| Notes added or cleared | add a note, add a second, `Esc`, Undo | top edge does not move | N/A |
| Swap with out-of-range note | piano key 90 lit; `I` to guitar | Status note `1 note lit beyond the fretboard`; readout unchanged; guitar shows nothing for it | N/A |
| Both out of range | two notes above D6 on the piano; swap | `2 notes lit beyond the fretboard`; readout names the interval | N/A |
| One in range, one out | C4 and key 90; swap | `1 note lit beyond the fretboard`; C4 lit on the fretboard | N/A |
| Swap back to piano | any of the above; `I` | beyond-fretboard note gone; piano's own offscreen note applies | N/A |
| Clear, then Undo | out-of-range note lit on the guitar; `Esc`; Undo | `Notes cleared.` with Undo while cleared; after Undo the beyond note returns | N/A |
| Audio blocked | out-of-range note lit; audio blocked | `Press any key to wake the sound.` wins | N/A |
| Guess in pool | Listen, interval in the pool, not tried, not the answer | wrong mark added | N/A |
| Out of pool, is the answer | answer not in the pool | guess is allowed and reveals | N/A |
| Out of pool, not the answer | interval not in the pool | button and hook ignore it; no mark | N/A |
| Already tried | interval in `wrongMarks` | ignored by button, hook and reducer | N/A |
| Favicon | built app loads | `/favicon.svg` served; console shows no 404 | N/A |

</frozen-after-approval>

## Code Map

- `src/ui/listen/listen.css` -- holds `.listen` (question 56px, gap 14px, `.guess-hint` min-height 1.4em: the 232px block) and the shared pieces to move: `.controls`, `.action-button`, `.action-primary`, `.visually-hidden`.
- `src/ui/explore/explore.css` -- `.explore`, fixed-height `.readout-interval` and `.explore-prompt` (the 216px block).
- `src/ui/theme/theme.css` -- `--type-readout-question-*`, `--type-hint-size`, `--spacing-readout-gap`; place for the shared readout height token.
- `src/ui/listen/focus.ts` -- `focusInstrument`; imported by `src/ui/explore/ExploreControls.tsx`, `src/ui/shell/SegmentedGroup.tsx`, `ListenControls.tsx`, `IntervalButtons.tsx`.
- `src/ui/listen/ListenControls.tsx`, `ListenView.tsx`, `IntervalButtons.tsx`, `src/ui/explore/ExploreView.tsx` -- import `listen.css` or use the shared classes.
- `src/ui/shortcuts/useShortcuts.ts` -- imports `../listen/intervalKeys`; out of scope.
- `scripts/check-boundaries.mjs`, `tests/scripts/check-boundaries.test.ts` -- layer rule (`core`, `audio`, `ui`) only; no rule between `ui` folders.
- `src/ui/listen/IntervalButtons.tsx` (`inPool`, `tried`), `src/ui/session/useSessionActions.ts` (`guess`), `src/ui/session/session.ts` (`guess` case, no pool today) -- the three copies.
- `src/core/explore.ts` (`litPositions`, null beyond E2 to D6), `src/core/piano.ts` (`offscreenNote`), `src/ui/app/App.tsx` (`Shell` message, `useLitNotes`, `workspace.positions`) -- the beyond-fretboard note.
- `tests/core/explore.test.ts`, `tests/core/piano.test.ts` -- style reference for core tests.
- `index.html` -- no icon link; no `public/` folder.

## Tasks & Acceptance

**Execution:**
- [x] `src/ui/shared/shared.css`, `src/ui/shared/focus.ts` -- new; move the shared rules and `focusInstrument` here (git mv for `focus.ts`); `listen.css` keeps only Listen rules -- shared UI outside feature folders
- [x] `src/ui/explore/ExploreControls.tsx`, `ExploreView.tsx`, `src/ui/listen/ListenControls.tsx`, `ListenView.tsx`, `IntervalButtons.tsx`, `src/ui/shell/SegmentedGroup.tsx` -- import from `../shared/`; no `../listen/` import left in explore or shell
- [x] `scripts/check-boundaries.mjs`, `tests/scripts/check-boundaries.test.ts` -- add rule: no import between `ui/listen` and `ui/explore`, and none from `ui/shell` into either; test violations and the allowed `shared` import -- stop the regression
- [x] `src/ui/theme/theme.css`, `src/ui/listen/listen.css`, `src/ui/explore/explore.css` -- one readout block height token used by `.listen` and `.explore` (Explore content centred inside it) -- instrument does not move on mode switch
- [x] `src/core/guess.ts`, `tests/core/guess.test.ts` -- new `canGuess(interval, pool, answer, tried)`; test the matrix's four guess rows -- one rule
- [x] `src/ui/listen/IntervalButtons.tsx`, `src/ui/session/useSessionActions.ts`, `src/ui/session/session.ts` -- all call `canGuess`; the `guess` action carries `pool`; update reducer test dispatches to pass it -- no behaviour change
- [x] `src/core/explore.ts`, `tests/core/explore.test.ts` -- add `beyondFretboard(lit, remembered)` (count of null positions) and `beyondFretboardNote(count)` (`1 note lit beyond the fretboard`, `2 notes lit beyond the fretboard`, undefined for 0); test 0, 1, 2, mixed and remembered-position cases
- [x] `src/ui/app/App.tsx`, `tests/ui/app/App.test.tsx` -- guitar in Explore uses the beyond note in the offscreen slot; tests for the swap, both out, mixed, swap back, clear and Undo, audio blocked
- [x] `public/favicon.svg`, `index.html` -- one small SVG (rounded square `#FDF1E8` with a `#F3B5B0` and a `#F6D0A8` dot, `#2C2A2B` stroke) and `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`

**Acceptance Criteria:**
- Given Listen and Explore at 1280 x 800, when I switch mode with `M` or the tabs, then the instrument's top edge is at the same place and Listen still fits the screen.
- Given Explore renders, when the imports are read, then no `ui/explore` or `ui/shell` file imports from `ui/listen`, and `npm run check` fails if one is added.
- Given a guess, when the buttons, the hook and the reducer decide, then all three call `canGuess` and behave as before.
- Given the built app loads, when it requests the icon, then the console shows no 404.
- Given a guitar note count beyond the fretboard, when the view renders, then the Status note shows it and the readout is unchanged.

## Implementation Notes

## Verification

**Commands:**
- `npm run check` -- expected: pass, test count at least 600 plus the new tests
- `npm run build` -- expected: success; `dist/favicon.svg` exists

**Manual checks (if no CLI):**
- Headless Chrome at 1280 x 800: measure `.stage svg` top across `M` and tab switches with empty, one and two notes, on both instruments, after `I` swaps, `Esc` and Undo; every value is the same (232px expected) and Listen shows nothing cut off.
- Light two piano notes above D6, swap to the guitar: the note reads `2 notes lit beyond the fretboard`, the readout shows the interval; swap back and it is gone.
- Load the built app: console shows no 404.

## Review Triage Log

| Finding | Layer | Verdict | Evidence / route |
|---|---|---|---|
| The pool-or-answer half of the guess rule is still written inline in `IntervalButtons` (`inPool`, for the out-of-pool style) | edge | low, patch | Added `inPlay` to `core/guess.ts`; `canGuess` and the buttons use it; test added. |
| `ui/shared` could import a feature folder, so the boundary rule has a back door | blind | medium, patch | Added `shared` to the rule's map and three failing-import tests. |
| Fixed readout height can overflow if text wraps; token duplicates the hint's `1.4` line height | blind, edge | low, rejected | Single-line text at a fixed size; measured 232px in every state; the fix adds more tokens. |
| Boundary rule covers only listen, explore, shell, shared; relative specifiers only | blind, edge | low, rejected | Matches the spec and the existing script style; no alias imports exist. |
| `guess` action carries `pool`; the answer half of `canGuess` is dead in the reducer | blind, edge | low, rejected | The spec chose it, the reducer has no pool otherwise, and `canGuess` is tested for the answer. |
| Favicon href is root-absolute, hard-coded colours, no `.ico` | blind, edge | low, rejected | The app is served from the root; the build shows no 404. |
| Beyond-fretboard note: nested ternary, no direction, no priority test with Fixed-root prompt | blind | low, rejected | Wording is the user's choice; the Fixed-root prompt shows in Listen only, so the two never meet. |
| New BeyondFretboard tests in their own file; magic pitches; selectors | blind, edge | low, rejected | The spec's file list was a pointer; the pitches follow the story's E2 to D6 bounds. |
| `shared.css` imported by five components | blind | low, rejected | Vite dedupes; each component names what it uses. |
| Verification gap layer | gap | none | No gaps found. |
