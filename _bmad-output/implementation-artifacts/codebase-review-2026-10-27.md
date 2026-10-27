# Codebase review, 2026-10-27

Scope: `src` (about 4,400 lines including CSS) and `tests` (about 7,300 lines) at `main` after the Epic 5 close and the CI commit. Read in full: `src/core`, `src/audio`, `src/ui` TSX and TS, the Epic 5 retro; tests sampled. `npm run check` was not re-run for the review; one `vitest run` showed 1,007 tests passing in 29 s. Nothing was changed except this file and `docs/codebase-map.md`.

## Is it easy to work with

Mostly yes. The layers are enforced by script, core is pure and well commented, the reducer invariants are tested by reference, and the comments explain why. The friction is concentrated in one seam: the Listen screen branches on the practice kind in many places (below). Everything else is small and local. No file is a god class: the largest source files are `session.ts` 273 lines, `useSessionActions.ts` 206, `useLitNotes.ts` 205, `SetupPanel.tsx` 193.

## Largest or most-branched units

1. `src/ui/session/session.ts` (273 lines). One reducer with 26 action types. The long cases are `toggleNote` (`:110-143`, two returns, position bookkeeping with `keep` and `without`), `chooseRoot` (`:151-160`), `editVoicing` (`:169-185`). Each case is readable and the tests are thorough (`tests/ui/session/session.test.ts`, 622 lines). Splitting into two reducers would break the "reducer tests assert the other half is untouched by reference" rule that AGENTS.md relies on. Leave alone. If anything, extract the pure workspace transitions (`toggleNote`, `editVoicing`) as functions in `core/explore.ts`; low value.
2. `src/ui/session/useSessionActions.ts` (206 lines). Not complex in itself: each function is 5 to 15 lines. The branching is the practice-kind branching (next section). Its size will grow by roughly 10 lines for each new practice kind, so it is the file to watch.
3. `src/ui/session/useLitNotes.ts` (205 lines) holds three jobs: voicing ranking and the `Shown` model (`:34-140`), `useChordReveal` (`:143-153`) and the `LitNotes` assembly for four situations (`:156-187`). The first job is pure and depends only on core (`rankedVoicings` at `:52` uses `orderedReadings`, `rankVoicings`, `shapeFrets`). Moving `rankedVoicings`, `shownOf`, `editedOf` and the `Ranked` and `Shown` types into their own file would leave `useLitNotes.ts` at about 90 lines. Worth doing only together with the `rankedOnce` fix below.
4. `src/ui/setup/SetupPanel.tsx` (193 lines). Mostly declarative JSX; the logic is `onChip` and `onChordChip` (`:59-75`), identical except for the dispatch. Not worth splitting. The interval chip block (`:118-136`) is deliberately not re-indented (AGENTS.md pitfall), which reads oddly but is policy.
5. `src/ui/app/App.tsx` `Shell` (`:37-55`) builds the Status note message from two nested ternaries (offscreen, then message). It works and is covered by `tests/ui/app/BeyondFretboard.test.tsx`; a small pure `statusMessage(...)` function would be clearer but nothing forces it.
6. `src/ui/explore/ExploreView.tsx:25-49` holds two announcement effects with timers and `useRef` comparisons of the previous list. It is the hardest code to read in `ui` and is fragile to touch; its behaviour is pinned by `ExploreStepper.test.tsx` and `ExploreEdit.test.tsx`. Leave alone.

## The practice-kind seam

Facts (grep of `practice ===` and `practice !==` in `src`): `settings.practice` is compared in 20 places in 7 files: `useSessionActions.ts` lines 47, 50, 90, 96, 104, 114, 121, 134, 149, 168, 171, 195, 196; `useLitNotes.ts:147,164`; `ListenControls.tsx:12`; `ListenView.tsx:14`; `IntervalButtons.tsx:17`; `SetupPanel.tsx:45`; `useShortcuts.ts:43`.

- `Practice` keeps the interval fields required and the chord fields optional (`core/model.ts:51-62`, with defaults only for the interval ones in `initialPractice`), so each reader defaults them (`chordWrongMarks = []` at `session.ts:227`, `useSessionActions.ts:132`, `ChordButtons.tsx:20`; `chordRevealed === true` at `useLitNotes.ts:147`). The retro (findings 3 to 5) records that reviewers raised this and triage rejected it.
- `Settings.practice` is a setting (`model.ts:83`, never saved) but it decides which half of `Practice` is live, so the reducer cannot see it. The workaround is a `chords?: boolean` field on three actions (`session.ts:43-45`) and three call sites that pass `settings.practice === 'chords'` (`useSessionActions.ts:168,195,196`).
- Near-duplicates: `ChordButtons.tsx` and `IntervalButtons.tsx` (same markup and logic, 49 and 50 lines); `guess` and `guessChord` (`useSessionActions.ts:118-141`) and their reducer cases (`session.ts:214-245`); `startQuestion` and `startChordQuestion` (`:23-43`). The shared rule is already extracted (`core/guess.ts`, generic).

Proposal, smallest useful step (not a model change): add `src/ui/session/practiceView.ts` with a pure function `practiceView(practice, settings)` returning `{ chords, hasQuestion, revealed, tried }`, and a shared `AnswerRow` component (items: key, label, tried, disabled, inPool, onGuess) used by both button rows. Effect: the five `chords ? a : b` reads in `ListenControls.tsx:12-16`, `useSessionActions.ts:96-115` and `useLitNotes.ts:147-171` become one call each, and the two 50-line rows become one 30-line component. Blast radius: `ListenControls.tsx`, `IntervalButtons.tsx`, `ChordButtons.tsx`, `useSessionActions.ts`, `useLitNotes.ts`, plus one new file each; the DOM and the reducer do not change, so the 854 lines of chord tests and `IntervalButtons.test.tsx` act as the safety net with no test edits expected. Gain: moderate; it removes duplication, not risk.

Not proposed: turning `Practice` into a discriminated union by kind. It touches `model.ts`, the reducer (all of `session.ts:189-245`), `session.test.ts` and every test fixture that builds `practice.chordQuestion` (`tests/ui/chordReveal.test.tsx:20`), and the reducer-by-reference tests. Do that only when a third kind is planned (the retro's stated trigger).

## Dead code, unused exports, stale comments

Checked with grep over `src` for exports with no importer outside their own file, then manually.

- `spellInterval` (`core/spelling.ts:76`) and its `SpelledInterval` type: used only by `tests/core/spelling.test.ts`; documented as intentional in `spec-1-6-reveal-an-interval.md:73` (no note names on screen). Dead in production since Epic 1. Delete or keep with a decision; low value either way.
- Exported but only used inside their own file (the export is for tests or nothing): `WINDOW_SEMITONES` (`piano.ts:4`), `spelledRoot` (`spelling.ts:64`), `MAX_LIT`, `pairInterval`, `exploreReadout`, `placeLit` (`explore.ts`), `fingersNeeded`, `SHAPE_TEMPLATES`, `EXPLORE_PROMPT` (`ExploreView.tsx:13`), `HELP_LIST_ID` (`HelpHint.tsx:6`), `Shell` (`App.tsx:28`). Harmless; some are used by tests.
- Types exported with no importer: `ReadingOption`, `ExploreReadout`, `ExploreReading`, `RememberedPositions`, `LitPlacement`, `PositionPair`, `OffscreenLit`, `QuestionOptions`, `ChordQuestionOptions`, `ShapeTemplate`, `VoicingRules`, `FretRange`, `VoicingChord`, `FretNote`, `Feedback`, `LitNotes`, `SavedSetting`. Harmless.
- No `TODO`, `FIXME`, `XXX` or `HACK` in `src`, `tests` or `scripts` (grep). No commented-out code found in the files read.
- Stale or duplicated comments: `session.ts:20` says the feedback wording is "derived from the interval" but `Feedback` now has chord variants; `useLitNotes.ts:136-137` has two comments saying nearly the same thing about the stepper; `model.ts:80` describes Settings as "the pool of intervals, how they sound and how the app looks" but it now also holds practice, chord pool, direction and root mode; `HelpHint.tsx:16` says "Pick m2 to P8" and does not say the same keys pick a chord quality in Chords practice; `useLitNotes.ts:3` and `:5` import from `core/pitch` twice.
- The Epic 5 retro finding 17 counts three `Math.random` call sites in `useSessionActions.ts`; there are now two (`:29`, `:40`).

## Duplicated logic across features

- `togglePool` and `toggleChordPool` (`settings.ts:18-25` and `:30-38`) differ only in the table; `onChip` and `onChordChip` (`SetupPanel.tsx:59-75`) likewise. About 20 lines saved by one generic helper; low value.
- `Fretboard.tsx:56-67` and `PianoKeyboard.tsx:45-56` repeat the press and release handling (held ref, capture, button check). Small; leave.
- Both stages and both readouts compute roles through `exploreReading`; that is sharing, not duplication.

## Test suite

- Size: 7,292 lines in 52 files, 1,007 tests, 29 s wall; 51% of tracked time is import and 33% environment creation (vitest's own summary: happy-dom created 52 times, 170 s total). Test bodies are 14%. The two slowest tests are 1.2 s (`ExploreStepper.test.tsx` arrow focus) and 1.3 s (`chordReveal.test.tsx` fixed symbol for each quality). Nothing is slow by itself. vitest suggests `pool: 'vmThreads'` or `isolate: false` in `vite.config.ts`; untested here, so only a lead.
- Long files: `session.test.ts` 622 lines, `voicings.test.ts` 395, `explore.test.ts` 365, `chordReveal.test.tsx` 335, `ExploreGuitar.test.tsx` 307. All are one subject; the reducer file would split cleanly by `describe` (it has 14) if it keeps growing.
- `Math.random` mocks: 16 `vi.spyOn(Math, 'random')` calls across 10 files (`tests/ui/...`; `grep spyOn(Math`), with magic values such as 0.5, 0.1, 0.999 whose meaning is in a trailing comment (`IntervalButtons.test.tsx:25`). Core is tested with an injected `random` (`tests/core/practice.test.ts`), so only UI tests are tied to it. Source of the tie: `useSessionActions.ts:29,40` pass `Math.random` directly. An optional `random` on the engine or a `RandomContext` would remove the mocks but adds production surface for a test concern; leave.
- Repeated set-up: three chord files each open Setup, click Chords and close (`chordPractice.test.tsx:26`, `chordReveal.test.tsx:22`, `chordGuess.test.tsx:35,46,63,...` eight times inline). A shared `openChords` in `tests/ui/support/` would remove about 30 lines. Low value, low risk.
- `tests/ui/support/setupPanel.ts` mixes DOM helpers (`chip`, `answer`) with hooks (`registerSetupHooks`, which mocks `Math.random`); `chordGuess.test.tsx` imports `chip` from it without wanting the mock. Cosmetic.

## Things that make future work harder

1. Hidden coupling: `Workspace.positions` doubles as the "clicked on the guitar" marker. `useShown` computes `carried = !pitches.some((p) => p in positions)` (`useLitNotes.ts:112`), and `selectVoicing` clears `positions` after a hand edit to make notes count as carried again (`session.ts:165-167`). Both sites carry a warning comment, but a change to how positions are written silently changes which chords get a voicing. A named field (`workspace.origin: 'piano' | 'guitar'`) or a helper `isCarried(workspace)` in `core/explore.ts` would make it explicit. Blast radius: `model.ts`, the reducer cases that write `positions` (`toggleNote`, `editVoicing`, `selectVoicing`), `useShown`; tests in `session.test.ts`, `editVoicing.test.ts`, `selectVoicing.test.ts`. A helper alone (no data change) touches two files and is safe.
2. `rankedOnce` (`useLitNotes.ts:64-72`) is a module-level single-entry cache keyed by array identity. It exists because `useSessionActions` calls `useLitNotes()` only to read `voicingFrets` (`useSessionActions.ts:20`), and 15 components call `useSessionActions`, so each render of each of them recomputes the lit notes and the ranking. Module state also survives between tests. Cleaner: compute `useLitNotes` once in a provider (or pass `voicingFrets` to `releaseNote`'s callers, which already do: `GuitarStage.tsx:30` passes it) and drop `useLitNotes` from `useSessionActions`. The Stage already passes `voicingFrets` into `releaseNote`, but `playLit` (`useSessionActions.ts:78-86`) still reads it from the hook. Fixing `playLit` to take it as an argument would remove the coupling, and then `rankedOnce` is plain per-hook `useMemo`. Medium risk: `useShortcuts` and `ExploreControls` call `play` and `revealOrNext` without voicing data, so they would need it from `useVoicingList` or a context. Retro finding 9 accepted the cache; revisit when touching this area.
3. Naming: `interval-row`, `interval-button` and `interval-label` CSS classes are used by the chord buttons too (`ChordButtons.tsx:26,35,43`), and tests select on them (`tests/ui/support/setupPanel.ts:7`). `IntervalButtons` renders `ChordButtons`. Misleading for a newcomer; renaming costs CSS plus about a dozen test selectors.
4. `Settings.practice` lives in settings but acts as session state (see the seam above).
5. Setup shows the chips' short labels now (`SetupPanel.tsx:112` uses `qualityLabel`), so the retro action item 2 is done; the quality names remain `string` everywhere (`model.ts:21`, `session.ts:23`), a decision recorded as rejected.
6. `Settings.sound` has one value (`model.ts:76`, `SetupPanel.tsx:31`): a placeholder control and a persistence path for a single option. Intentional, per the planning docs; do not remove unless the product drops the choice.

## Ranking

| # | Candidate | Value | Risk | Verdict |
| --- | --- | --- | --- | --- |
| 1 | Fix stale comments (`session.ts:20`, `useLitNotes.ts:136-137`, `model.ts:80`) and the help row for chords (`HelpHint.tsx:16`) | low | none | Do now, with the next story that touches those files; comments only, created-lines rule applies |
| 2 | `isCarried(workspace)` helper for the `positions` marker | medium | low | Worth doing now: two call sites, tests exist, removes the most dangerous hidden coupling |
| 3 | Shared `AnswerRow` for `IntervalButtons` and `ChordButtons`, plus `practiceView` | medium | low to medium | Can wait for a third guess row or practice kind (the retro's trigger); small enough to do earlier if wanted |
| 4 | Drop `useLitNotes` from `useSessionActions`, retire `rankedOnce` | medium | medium | Can wait; do it together with extracting the ranking into its own file if the voicing area is opened again |
| 5 | Shared `openChords` helper in `tests/ui/support/` | low | low | Can wait |
| 6 | Vitest `pool` or `isolate` tuning | low | low (untested) | Can wait; measure first |
| 7 | Rename `interval-*` classes | low | medium (CSS and test selectors) | Leave alone |
| 8 | Split `session.ts`, discriminated-union `Practice`, typed quality literals | low now | high | Leave alone until a third practice kind |
| 9 | Delete `spellInterval` | low | low | Optional; needs a decision on the "no note names on screen" rule |

## Recommendation

No refactor story is needed now. If one small story is wanted, take candidates 1 and 2 together: both are local, covered by tests, and neither changes behaviour. Candidates 3 and 4 are the ones to schedule before the next feature that touches Listen practice or the voicing area.
