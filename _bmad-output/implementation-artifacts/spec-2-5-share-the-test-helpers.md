---
title: 'Story 2.5: Share the test helpers'
type: 'chore'
created: '2026-10-24'
status: 'done'
baseline_commit: 'c1390c48f40c7289be6769a6be27e1fc67b5e6bd'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-2-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The UI tests copy the same helpers file by file: `press` in 10 files (two shapes, one with AltGraph), `radio` in 6 (three with `hidden: true`, three without, three of them inside a `describe`), the Setup opener in 4, `panel` in 3, and `key`, `click`, `lit`, `rooted` in 3 each. `SetupPanel.test.tsx` is 604 lines holding four unrelated concerns.

**Approach:** Put one shared version of each repeated helper in `tests/ui/support` and import it everywhere, then split `SetupPanel.test.tsx` into one file per `describe`, moving the shared setup into support. Tests move unchanged.

## Boundaries & Constraints

**Always:** Every `it` and every assertion moves byte for byte; only imports, helper definitions and the `describe` wrappers' file move. The passing count stays at the total `npm run check` reports before the change (626 on the 2-4 branch). Shared `press(init | key, target = document.body, altGraph = false)` dispatches a bubbling, cancelable `keydown` inside `act`, sets `getModifierState` (`AltGraph` only when `altGraph`, else false), and returns the event; a plain string means `{ key }`. Shared `radio(name)` is `getByRole('radio', { name, hidden: true })`. Helpers copied in three or more files with identical bodies are shared; a helper whose copies differ stays local (`lit` in the Root describe has no `.sort()`, `note` differs between files). New files are `tests/ui/support/keys.ts` (`press`), `dom.ts` (`radio`, `opener`, `panel`, `key`, `click`, `lit`, `rooted`) and `setupPanel.ts` (`chip`, `chips`, `answer`, and one function registering the `Math.random` spy and the `localStorage`/`data-theme`/`restoreAllMocks` cleanup).

**Never:** No test deleted, weakened, skipped or reordered within its describe; no assertion edited; no change under `src/`, `scripts/` or config; no new dependency; no file left defining its own `press`, `radio`, `opener` or `panel`. No size cap beyond the split (each describe is 106 to 190 lines).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| `radio` with hidden | file that used `{ name, hidden: true }` (Setup, ModeSeparation) | finds the same input; same results | N/A |
| `radio` without hidden | file that used `{ name }` (ListenView, ExploreView, ModeStrip, useShortcuts) | still finds exactly one element, same results | a duplicate match fails the run; fix by adding an optional `{ hidden }` argument, defaulting to the old per-file behavior |
| AltGraph press | `press({ key: 'm', ctrlKey: true, altKey: true }, document.body, true)` | `getModifierState('AltGraph')` true; same shortcut result as before | N/A |
| Plain press | `press({ key: ' ' })` or `press('m')` | `getModifierState` false; event returned, `defaultPrevented` readable (ListenView) | N/A |
| Target press | `press({ key: 'Enter' }, button)` | dispatched on the target | N/A |
| useShortcuts caller | old `press(init, true)` | becomes `press(init, document.body, true)`; its events become cancelable | a `defaultPrevented` difference would show as a failure; none is asserted there |
| Local radio in a describe | direction, sound and theme, root describes | use the shared import; the local line is removed with the file's other helpers | N/A |
| Split | the four describes | each file runs alone and together; test names unchanged | N/A |

</frozen-after-approval>

## Code Map

- `tests/ui/support/fakeEngine.ts`, `sessions.ts` -- existing support; the new files sit beside them.
- `press` copies: `setup/SetupPanel`, `help/HelpHint` (with `altGraph`), `listen/ListenView` (returns the event), `listen/IntervalButtons`, `shell/Corner`, `shortcuts/useShortcuts` (altGraph second); `fireEvent.keyDown(body, { key })` one-liners: `explore/ExploreControls` (with target), `explore/ExploreView`, `app/BeyondFretboard`, `app/ModeSeparation`.
- `radio` copies: `setup/SetupPanel` (3 local, `hidden: true`), `app/ModeSeparation` (`hidden: true`), `listen/ListenView`, `explore/ExploreView`, `shell/ModeStrip`, `shortcuts/useShortcuts` (no `hidden`). `help/HelpHint` and `ModeStrip` also inline `getByRole('radio', ...)`; leave inline uses.
- `opener` copies: `setup/SetupPanel`, `help/HelpHint`, `shell/Corner`, `app/ModeSeparation`. `panel`: `SetupPanel`, `HelpHint`, `Corner`.
- `key`, `click`, `lit` (sorted), `rooted`: `explore/ExploreView`, `explore/ExploreControls`, `app/ModeSeparation` (`rooted` also local in the Root describe).
- `tests/ui/setup/SetupPanel.test.tsx` -- describes: setup panel (33), direction (185), sound and theme (309), root control (415); top-level helpers `chip`, `chips`, `answer`, hooks `beforeEach`/`afterEach`.

## Tasks & Acceptance

**Execution:**
- [x] `tests/ui/support/keys.ts`, `dom.ts`, `setupPanel.ts` -- new; the shared helpers as specified in Boundaries -- one copy each
- [x] `tests/ui/setup/SetupPanel.test.tsx` -- keep the `setup panel` describe; remove the other three and the local helpers; import from support -- split by concern
- [x] `tests/ui/setup/SetupDirection.test.tsx`, `SetupSoundTheme.test.tsx`, `SetupRoot.test.tsx` -- new; the `direction`, `sound and theme` and `root control` describes moved unchanged, describe-local helpers (`theme`, `note`, `lit`, `rooted`, `key`, `cell`, `fixed`) kept with them except `radio` -- one file per concern
- [x] `tests/ui/help/HelpHint.test.tsx`, `listen/ListenView.test.tsx`, `listen/IntervalButtons.test.tsx`, `shell/Corner.test.tsx`, `shortcuts/useShortcuts.test.tsx` -- delete local `press`, `radio`, `opener`, `panel` as present; import shared; change the one `useShortcuts` AltGraph call to the shared argument order
- [x] `tests/ui/explore/ExploreControls.test.tsx`, `explore/ExploreView.test.tsx`, `app/BeyondFretboard.test.tsx`, `app/ModeSeparation.test.tsx`, `shell/ModeStrip.test.tsx` -- same for `press`, `radio`, `opener`, `key`, `click`, `lit`, `rooted`
- [ ] every file above -- drop imports that became unused -- lint stays clean

**Acceptance Criteria:**
- Given the UI tests, when I search `tests/ui` for `function press`, `const press`, `const radio`, `const opener` and `const panel`, then they are found only under `tests/ui/support`.
- Given `SetupPanel.test.tsx`, when the split is done, then four files in `tests/ui/setup` hold the four describes with every `it` title and body unchanged.
- Given the suite before and after, when `npm run check` runs, then the passing count is equal and nothing is skipped.
- Given the diff, when I compare it with the previous commit, then nothing under `src/` changed and no assertion line was edited.

## Implementation Notes

## Verification

**Commands:**
- `npm run check` -- expected: pass, same test count as before the change (626 on the 2-4 branch), no skipped
- `git diff --stat -- src scripts` -- expected: empty

**Manual checks (if no CLI):**
- `git diff` of the moved describes shows only import and helper lines changed; the `it` lines match the old file.

## Review Triage Log

| Finding | Layer | Verdict | Evidence / route |
|---|---|---|---|
| `act` import left unused in `Corner.test.tsx` | blind, edge, gap | low, patch | Confirmed by a scan of every changed test file for unused testing-library imports; only this one was unused. Removed. |
| Shared `radio` always uses `hidden: true`, so four files' lookups are looser | blind, edge, gap | low, rejected | The spec decided it; each of those lookups still finds exactly one element, and the suite passes. |
| `press` event shape changed (cancelable, stubbed `getModifierState`) | blind, edge | false | The spec named the risk; `defaultPrevented` is asserted only in `ListenView.test.tsx`, which passes with the shared helper. |
| Test count and names unchanged after the split | blind | false | Checked by script: 375 `it` lines and 906 `expect` lines are identical to the baseline, 626 tests before and after. |
| `press` half adopted in the Root tests; two call forms; positional `altGraph` | blind | low, rejected | The spec required no local copies, not rewriting every `fireEvent` call; the string and object forms keep old call sites unedited. |
| `lit`, `rooted`, `key`, `cell` local copies differ between files | blind | low, rejected | The spec leaves helpers whose copies differ local; renaming adds churn. |
| `registerSetupHooks()` is implicit; theme and storage cleanup not global | blind, edge | low, rejected | The spec chose it; no other file touches that state today. |
| Stray blank line, no header comments, no tests for the helpers | blind, edge | low, rejected | Cosmetic, or helpers exercised by every test that uses them. |
| Verification gap layer | gap | none | No gaps found. |
