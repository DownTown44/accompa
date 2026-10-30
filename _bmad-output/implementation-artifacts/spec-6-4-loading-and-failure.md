---
title: 'Story 6.4: Loading and failure'
type: 'feature'
created: '2026-10-30'
status: 'done'
baseline_commit: '0abb2e64d9e6b8341790187741ad43b12f6a783e'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-6-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Under Samples a note played before its set has decoded, or after a fetch or decode failed, is silent, and nothing on screen says why. A failed set is retried on every Sound change because the router is rebuilt.

**Approach:** The sampler reports `loading` and `failed`, the router plays the synth for any instrument whose set is not ready, and the Status note says which. A failure is remembered for the session outside the router, so it survives toggling Sound.

## Boundaries & Constraints

**Always:**
1. `AudioStatus` becomes `idle | loading | running | blocked | failed` and reflects the active instrument's engine. A sampler reports `blocked` first (the gate's context is not running), then `loading` (set not yet decoded, including before the first gesture), then `failed`, otherwise the gate's status. The synth never reports `loading` or `failed`.
2. `AudioEngine` gains optional `ready?(): boolean`: `false` while its set is loading or failed. The router's `play` uses the synth, built on first need and sharing the router's `stop` and `unlock`, when the chosen engine's `ready?.()` is `false`, and still calls that engine's `prepare` so a loading set finishes. Once ready, the next note uses the samples. A `play` stops every other built engine, the fallback synth included.
3. A set is all-or-nothing: any file failing to fetch or decode (a synchronous throw too) marks the whole set `failed`. No retry, no timeout, no new fetch on a swap. A loader that never settles leaves the set `loading` and the synth playing.
4. A failure is recorded in a `LoadMemory` (a `Set` of set directory names) passed to `createEngine(sound, memory)` and on to the sampler factory. `EngineHost` creates one per app and keeps it across Sound changes, so a sampler built after toggling Sound starts `failed` and fetches nothing. The other instrument is unaffected.
5. Status note text, plain voice, no exclamation mark: `Loading the piano sound.` / `Loading the guitar sound.` and `The piano sound did not load. The synthesized sound is playing.` / `The guitar sound did not load. The synthesized sound is playing.`, for the active instrument. Order, decided by Apor 2026-10-30: `Press any key to wake the sound.`, the set-the-root notes, loading or failure, `Notes cleared.` with Undo, the offscreen notes. The Undo button shows only when `Notes cleared.` does. With Synthesized no loading or failure note shows.
6. The note stays inside the existing `aria-live="polite"` Status note, in its existing style: no new component, spinner, animation, score or praise. `src/core` is untouched, `src/audio` imports only `core` types, no dependency is added, every sample URL stays relative to the app's own origin, tests inject loaders and never fetch or decode real audio.
7. Theory features (Listen, Explore, the chord readout, the voicings, the steppers) behave exactly as with Synthesized when a set fails, and no exception reaches the UI.

**Never:** No retry button or loop, no fetch timeout, no spinner, no sharing of decoded buffers or closing of old contexts (deferred), no change to the synth's sound, no touch, phone or narrow-viewport work.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Loading | loader never settles, play on the guitar | the synth sounds, status `loading`, note `Loading the guitar sound.` | N/A |
| Ready | the loader then resolves | status `running`, note gone, the next play uses the guitar buffers | N/A |
| Blocked and loading | context not running, set loading | status `blocked`, note `Press any key to wake the sound.`; after the wake `Loading the guitar sound.` | N/A |
| Fetch fails | one file rejects, or the decoder rejects or throws | status `failed`, synth plays that instrument, note `The guitar sound did not load. The synthesized sound is playing.` | swallowed, no exception |
| Sticky | failed guitar, Sound to Synthesized and back, swap away and back | still `failed`, zero new fetches | N/A |
| Other set | guitar failed, swap to the piano | the piano loads and plays its samples, no failure note | N/A |
| Theory features | rejecting loader | a Listen question, an Explore chord and a guitar voicing play through the synth, readout and steppers unchanged | N/A |
| Note order | failed or loading with `Click a lit note to set the root.` or `Notes cleared.` | the root note shows over the failure; the failure shows over `Notes cleared.` and Undo is hidden | N/A |
| Synthesized | Sound `synthesized` | no loading or failure note, no fetch | N/A |
| URLs | any sample URL | relative, no scheme or host | N/A |
| Layout | loading, failed, blocked and empty notes, 1280 x 800 | instrument top edge and Status note fixed, page does not scroll | N/A |

</frozen-after-approval>

## Code Map

- `src/audio/engine.ts` -- `AudioStatus` gains `loading`, `failed`; optional `ready?()`.
- `src/audio/sampler.ts` -- load state (`idle | loading | ready | failed`), failure memory (new fifth parameter, default a fresh `Set`), `status` composition, `ready`, `subscribe` merging gate and load listeners. Reuse `createContextGate`; do not change it.
- `src/audio/engines.ts` -- router: lazy fallback synth keyed in `byFactory`, `play` falls back on `ready?.() === false`, `createEngine(sound, memory)`, factories take the memory.
- `src/ui/app/App.tsx` -- `EngineHost` holds the `LoadMemory`; `Shell` message order and the Undo condition.
- `src/ui/engine/useAudioStatus.ts` -- unchanged logic; its tests cover every status.
- Tests: `tests/audio/sampler.test.ts`, `tests/audio/engines.test.ts`, `tests/ui/app/App.test.tsx` (note order, theory features), a `useAudioStatus` test, a relative-URL test in `tests/audio/sampleSets.test.ts`. Reuse `tests/audio/support/fakeContext.ts`, `tests/ui/support/fakeEngine.ts` (`setStatus`); `tests/setup.ts` rejects every fetch, which is the failure case.
- `docs/codebase-map.md`, `README.md` if it mentions silence, `deferred-work.md` entries for silent failures.

## Tasks & Acceptance

**Execution:**
- [x] tests listed above -- red first, per the matrix -- tests-first
- [x] `src/audio/engine.ts`, `src/audio/sampler.ts` -- statuses, `ready`, failure memory -- AD-7
- [x] `src/audio/engines.ts` -- synth fallback and memory in the router -- AD-7
- [x] `src/ui/app/App.tsx` -- memory in `EngineHost`, note order and Undo -- UX-DR52 to 54
- [x] `docs/codebase-map.md`, `README.md`, `deferred-work.md` -- docs; record the stalled-fetch gap as deferred

**Acceptance Criteria:**
- Given a set still loading, when I click a note or play a question, then the synth sounds and the note reads `Loading the guitar sound.`; once ready, the guitar plays.
- Given a failed set, when I use any feature, then the synth plays, the failure note shows, and a Sound toggle does not clear it.
- Given `npm run check` and `npm run build`, then both pass; in headless Chrome at 1280 x 800 the layout holds for each note state.

## Implementation Notes

- Implemented by a subagent, then checked by Amelia against the diff. `npm run check` (1108 tests) and `npm run build` pass.
- Real Chrome check (headless, `vite preview`, requests aborted or left hanging, 1280 x 800, both themes): empty, loading and failed notes on the piano and on the guitar; the Status note stays at 725 to 756, the instrument at 366 to 636, and `scrollHeight` is 800. The blocked state was not forced in a real browser; its text and precedence are unchanged and unit-tested.
- The browser check found a bug the unit tests missed: on a piano start `Loading the piano sound.` never showed, because the sampler did not notify subscribers when loading began and the router only notifies on an instrument change. Fixed with a red test first (`tells subscribers when loading starts and when it ends`) and `notifyLoad()` on entering `loading`.
- The theory-features test (`tests/ui/app/TheoryWithFailedSet.test.tsx`) plays a Listen question, an Explore chord and a single guitar note through a failed set; it does not play a multi-note voicing or the steppers.

## Spec Change Log

## Review Triage Log

| Layer | Finding | Verdict | Route | Evidence |
|-------|---------|---------|-------|----------|
| Blind, Edge case | Loading or failure note hides the offscreen and No-voicing notes for the session | medium | deferred | Order decided by Apor 2026-10-30 (Always 5); the information loss while a set is failed is real, recorded in `deferred-work.md`. |
| Blind, Edge case | A suspended fallback synth context shows no wake message (status follows the sampler only) | low | deferred | Fallback plays only from gestures, where the context starts running; recorded in `deferred-work.md` for a stall that is not shown. |
| Edge case | `play` for an instrument other than the active one leaves status on the wrong engine | low | rejected | The `Shell` effect prepares on every instrument change before any play; same finding rejected in 6.3. |
| Edge case | One frame of the old instrument's load state under the new name after a swap | low | rejected | Cosmetic, one commit before the effect re-points; the fix adds a branch. |
| Edge case | `prepare` keeps fetching after a synchronous loader throw | low | rejected | Real loaders reject asynchronously and every fetch is already issued; only a throwing test loader reaches it. |
| Edge case, Verification gap | Sound toggled mid-load duplicates the fetch; the new sampler learns of a late failure only from its own fetches | low | rejected | Both converge on failed; no wrong state; sharing buffers is deferred from 6.2. |
| Edge case | Empty `set.notes` stays loading | false | rejected | Both sets are constants with 21 and 18 notes. |
| Edge case | A throwing subscriber turns a decoded set failed | low | rejected | The only subscriber is React's `useSyncExternalStore`; the fix adds a try/catch. |
| Blind, Edge case | Tests rely on the global fetch rejection in `tests/setup.ts` | low | rejected | The Code Map names that setup as the failure case; sampler tests inject loaders. |
| Blind | Failure is permanent with no retry or reload hint | false | rejected | Sticky, no retry is the intent (Boundaries Always 3 and Never). |
| Blind | Stalled fetch shows Loading forever and a test pins it | false | rejected | Known and recorded as deferred; the test names the behaviour. |
| Blind, Verification gap | Late completions after a failure and `prepare` idempotence while loading are untested | low | rejected | The guard only prevents a `buffers.set` after the clear; one failed file keeps `pending` above zero, so `ready` cannot flip. |
| Blind | Other consumers of `AudioStatus` unchecked | false | rejected | `tsc` passes; `useAudioWake` reads only `blocked`. |
| Blind | `memory` keyed by directory, `override` path ignores it | low | rejected | Directories are unique constants; an override engine has no samplers. |
| Blind | Status changes may not be announced | false | rejected | The note sits in the existing `aria-live="polite"` region. |
| Blind | Docs do not describe play during loading; `as never` casts in tests | false | rejected | `docs/codebase-map.md` and `README.md` describe the synth fallback; casts are test hygiene. |

## Verification

**Commands:**
- `npm run check` -- expected: tsc, import boundaries and all tests pass
- `npm run build` -- expected: succeeds

**Manual checks (if no CLI):**
- Headless Chrome at 1280 x 800 against `vite preview` (`docs/development-notes.md`): block the sample requests to see the failure note, throttle them to see loading, check the instrument top edge, the Status note and page scroll in each state. Stop the preview server afterwards.
