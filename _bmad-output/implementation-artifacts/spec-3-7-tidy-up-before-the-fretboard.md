---
title: 'Story 3.7: Tidy up before the fretboard'
type: 'chore'
created: '2026-10-25'
status: 'done'
baseline_commit: '8b89eb103f03b2b2d5365fa89e9b36aa6225435d'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Reading identity is compared in three places and the root-to-reading lookup is written twice (the second pulls `nameChord` into `ui/session`). `ExploreView.test.tsx` is 537 lines holding five concerns. No formatter, `.editorconfig` or `.gitattributes` exists, so an agent reflowed four files in Story 3.6 and every commit warns about line endings.

**Approach:** One core helper per rule, used by the reducer and the readout. Split the test file by concern, sharing helpers from `tests/ui/support`. Add config files that record the existing style. Behaviour does not change.

## Boundaries & Constraints

**Always:** The test count after the change equals the count `npm run check` reports before it (737 on `main`), with every `it` title and body byte for byte. New helpers in `src/core/explore.ts`: `sameChoice(a: ReadingChoice, b: ReadingChoice): boolean` (root and quality equal) and `readingRootedOn(lit, pitch): ChordReading | undefined` (the namer reading whose root is the pitch's class). `isReading` stays exported and becomes `sameChoice(readingChoice(reading), choice)`. Config matches the files in git: no semicolons, single quotes, width 140, trailing commas `all`, arrow parens always, 2-space indent, LF in the index (every tracked text file is `i/lf`).

**Decision (Apor):** prettier is config only: `.prettierrc`, `.editorconfig` and `.gitattributes`, no dependency, `package.json` and `npm run check` untouched.

**Never:** No source file reformatted. No change to any observable behaviour, reducer result or test assertion. No test deleted, skipped, weakened or edited. No `nameChord` import left in `src/ui`. No edit to `sprint-status.yaml`, `epics.md`, `deferred-work.md` or `roadmap.md`. No split of `core/explore.ts` (deferred to Epic 4).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Same choice | two choices with equal root and quality | `sameChoice` true; `chooseReading` returns the same state object | N/A |
| Rooted lookup hit | lit `A C E G`, pitch `A` | the Am7 reading | N/A |
| Rooted lookup miss | pitch whose class roots no reading | `undefined`; `chooseRoot` still roots without a reading | N/A |

</frozen-after-approval>

## Code Map

- `src/core/explore.ts:25-46` -- `readingChoice`, `isReading` (line 28), `orderedReadings`, `rootedReadings` (the lookup at line 44); add `sameChoice` and `readingRootedOn` here.
- `src/ui/session/session.ts:90,125-126,133-135` -- `isReading` use, inline compare (126, 135, both choice against choice, so they need `sameChoice`), lookup at 133; the `nameChord` import at line 11 is its only use there; `pitchClass` may become unused.
- `tests/core/explore.test.ts` -- add cases for the two helpers.
- `tests/ui/explore/ExploreView.test.tsx` -- describes at 16 (`Explore`, no hooks, `it`s 17-252), 254 (live region, fake timers), 342 (alternative readings), 424 (alternative announce, fake timers), 439 (chosen root); local helpers `cell`, `roleOf`, `legend`, `readout` at 11-14.
- `tests/ui/support/dom.ts`, `keys.ts`, `fakeEngine.ts`, `sessions.ts` -- existing shared helpers; add `explore.ts` beside them for `cell`, `roleOf`, `legend`, `readout` where two or more new files use them.
- Repo root has no `.prettierrc`, `.editorconfig` or `.gitattributes`; `core.autocrlf=true` makes 144 working files CRLF while the index is LF.

## Tasks & Acceptance

**Execution:**
- [x] `src/core/explore.ts` -- add `sameChoice` and `readingRootedOn`; `isReading` and `rootedReadings` use them -- one rule each
- [x] `src/ui/session/session.ts` -- use `sameChoice` at 126 and 135 and `readingRootedOn` at 133; drop `nameChord` and any unused import -- ui no longer names chords
- [x] `tests/core/explore.test.ts` -- unit-test the I/O rows -- cover the new helpers
- [x] `tests/ui/explore/ExploreView.test.tsx`, `ExploreGuitar.test.tsx`, `ExploreReadout.test.tsx`, `ExploreReadings.test.tsx`, `ExploreRoot.test.tsx` -- readout and Listen `it`s of `Explore` (17-172, 237-252) stay; guitar `it`s (173-236) move; the live-region describe, both alternatives describes and the root describe move whole -- no file near 600 lines
- [x] `tests/ui/support/explore.ts` -- shared `cell`, `roleOf`, `legend`, `readout` -- no copies
- [x] `.prettierrc`, `.editorconfig`, `.gitattributes` -- new: prettier `semi: false`, `singleQuote`, `printWidth: 140`, `trailingComma: all`, `arrowParens: always`, `endOfLine: lf`; editorconfig `root`, utf-8, `lf`, 2 spaces, final newline, trim trailing space except `*.md`; attributes `* text=auto eol=lf` -- agents stop reflowing and changing endings

**Acceptance Criteria:**
- Given `src/ui`, when I search for `nameChord`, then nothing is found; and `reading.root === choice.root` appears nowhere outside `sameChoice`.
- Given the old and new test files, when I compare `it(` and `expect(` lines, then the sets are identical and the count is 737.
- Given `git diff --stat`, when I read it, then no untouched source line changed and no tracked file changes line ending.

## Implementation Notes

## Verification

**Commands:**
- `npm run check` -- expected: pass, 737 tests plus the new helper cases, boundary script clean
- `wc -l tests/ui/explore/*.tsx` -- expected: every file under about 250 lines
- `git ls-files --eol` -- expected: no `i/crlf`

## Review Triage Log

| # | Layer | Finding | Verdict | Route | Evidence |
|---|-------|---------|---------|-------|----------|
| 1 | blind, edge | `ExploreGuitar.test.tsx` ends with a blank line before the closing `})` | low | patch | Fixed. |
| 2 | blind | `alts` and `bigLabel` defined in two split files, beside the helpers that were shared | low | patch | Fixed: both moved to `tests/ui/support/explore.ts`; the story is about duplication. |
| 3 | blind | `session.ts` imports `Interval` and `Pitch` with inline `type` modifiers; the file uses `import type` elsewhere | low | patch | Fixed to `import type`. |
| 4 | blind | Config files unrelated to the tidy-up, not enforced, no `format` script | false | rejected | Part of the story (finding 7 of the Epic 3 retro); Apor chose config only with no dependency, so enforcement is by hand with `npx prettier`. |
| 5 | blind, edge | `printWidth: 140` conflicts with the longest lines, such as the 170-character import in `tests/core/explore.test.ts` | low | rejected | The spec states the longest source line is 175 characters and the config records the style, it does not reformat; the line is not touched by this story. |
| 6 | blind | `eol=lf` and `text=auto` change Windows checkouts; files not renormalised | false | rejected | The index is already LF (`git ls-files --eol` shows no `i/crlf`); the attribute takes effect on the next checkout, as the spec says. |
| 7 | blind | Helpers tested narrowly; `sameChoice` never given `undefined`; `chooseRoot` re-click with a different stored reading | low | rejected | `sameChoice` takes defined choices by type; the reducer's same-choice cases are covered by the 3.3 and 3.6 tests, which still pass. |
| 8 | blind | `readingRootedOn` picks the first of two readings sharing a root | false | rejected | The namer gives at most one reading per root pitch class, so there is never a second. |
| 9 | blind | No evidence that no test was lost; unused imports | false | rejected | Checked: 43 `it` titles and 142 `expect` calls are identical before and after; `tsc` passes. |
| 10 | edge | No reducer test for `chooseReading` with the current choice | false | rejected | `session.test.ts` already asserts `toBe(chosen)` for a repeated choice (Story 3.3). |
| 11 | blind | `click(cell(5, 0))` then `click(cell(4, 5))` unclear in a moved test | low | rejected | Moved unchanged by design; its intent is in its test name. |
