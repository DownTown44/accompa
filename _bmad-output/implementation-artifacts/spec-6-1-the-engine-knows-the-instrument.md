---
title: 'Story 6.1: The engine knows the instrument'
type: 'feature'
created: '2026-10-28'
status: 'done'
baseline_commit: '5d67ef03bc2975f3a19ed80957cf1342bb5dd276'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-6-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `AudioEngine.play` has no instrument, so the sampled sets of Stories 6.2 and 6.3 cannot choose a piano or a guitar set. The Sound setting still holds the Phase 1 value `synthesized` under the Phase 1 key, which would silently override the new Samples default.

**Approach:** `play` takes the instrument and every call site passes the active one. `Sound` becomes `samples | synthesized`, stored under `accompa.sound.v2`. Engine selection is keyed by sound and instrument, all four combinations still returning the synth, so nothing is audible.

## Boundaries & Constraints

**Always:** Decided by the story text and the architecture spine (AD-6, AD-7):
1. `play(pitches, instrument, mode)`: the instrument is the second argument. The fake engine in `tests/ui/support/fakeEngine.ts` records `{ pitches, instrument, mode }`.
2. `Sound = 'samples' | 'synthesized'`, `initialSettings.sound = 'samples'`. Sound is read synchronously from `accompa.sound.v2` before the first render; a missing, unparsable or foreign value falls back to `samples`. `accompa.sound` is never read, written or deleted. A deliberate `synthesized` is saved under `accompa.sound.v2` and survives a reload.
3. `ENGINES` is `Record<Sound, Record<Instrument, () => AudioEngine>>`, all four entries `createSynthEngine`. The host builds one engine per Sound: a small router that creates an instrument's engine on first use and shares one instance between instruments whose factory is the same function, so the synth never gets two `AudioContext`s. `EngineHost` keys on `settings.sound` only: an instrument swap neither rebuilds the engine nor stops playback; a change of Sound replaces the engine and stops the old one.
4. `src/core` changes only in `src/core/model.ts`: the `Sound` type and `initialSettings.sound`.
5. No audible change in any section. `npm run check` and `npm run build` pass.
6. Decided by Apor, 2026-10-28: the Setup Sound control keeps the default `samples` in this story, lists only `Synthesized`, and shows nothing selected until Story 6.2 adds Samples.
7. Decided by Apor, 2026-10-28: the status API (`status`, `subscribe`) is unchanged here; Story 6.4 decides how status follows the instrument.

**Never:** No sampler, no assets, no loading or failure states (Stories 6.2 to 6.4). No change to `AudioStatus`, `status`, `subscribe`, `unlock` or the synth's timing. No Samples option, no hint line in Setup. No other change in `src/core`. No touch, phone or narrow-viewport work.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Instrument reaches the engine | Listen interval play, Listen chord play, Explore Play (arpeggio), Block, strum, a single-note click; piano then guitar active | each `plays` entry carries the instrument that was active | N/A |
| Swap then play | click a note on the piano, swap to the guitar, play | the first entry says `piano`, the next says `guitar`; the engine object is the same | N/A |
| First run | no `accompa.sound.v2` | `settings.sound` is `samples`; sound is played by the synth | N/A |
| Phase 1 key present | `accompa.sound` = `"synthesized"`, no v2 key | starts on `samples`; `accompa.sound` is unchanged afterwards | N/A |
| Foreign v2 value | `accompa.sound.v2` = `"loud"`, `null`, `42`, bad JSON | `samples` | N/A |
| Deliberate synthesized | click `Synthesized`, reload | `accompa.sound.v2` is `"synthesized"` and it starts on `synthesized` | storage unavailable: choice lasts the visit |
| Four combinations | resolve `samples`/`synthesized` x `piano`/`guitar` | each returns an engine that plays through the synth; the router makes one synth for all four | N/A |
| Sound change | switch Sound | the old engine is stopped and a new one is built | N/A |
| Setup interim | default `samples`, open Setup | one option `Synthesized`, none selected; clicking it selects it | N/A |

</frozen-after-approval>

## Code Map

- `src/audio/engine.ts` -- `AudioEngine.play(pitches, mode)` becomes `play(pitches, instrument, mode)`; import `Instrument` from `../core/model`. Leave `AudioStatus`, `status`, `subscribe`, `unlock`, `stop`.
- `src/audio/synth.ts` -- `play` (about L97) accepts and ignores the instrument; `schedule` and all timing stay.
- `src/audio/engines.ts` -- `ENGINES` keyed by sound and instrument; add the router (`createEngine(sound)`) that builds per-instrument engines lazily and shares an instance per factory.
- `src/core/model.ts` -- `Sound` (L76) and `initialSettings.sound` (L93) only.
- `src/ui/settings/settingsStorage.ts` -- `KEYS.sound` becomes `accompa.sound.v2`; `SOUNDS` lists both values; fix the comment. `SettingsContext.tsx` and `settings.ts` (`setSound`) need no change.
- `src/ui/app/App.tsx` -- `EngineHost` builds from the router keyed on `settings.sound` only; the instrument is not a dependency.
- `src/ui/session/useSessionActions.ts` -- every `engine.play` (about L52, 73, 81, 85, 90, 105, 146, 150, 171) passes the instrument; check `selectInstrument` (about L195) and any handler that dispatches and plays together, because `session.instrument` is a stale closure there.
- `src/ui/setup/SetupPanel.tsx` -- `SOUNDS` keeps one option (L31); `SegmentedGroup` must tolerate a value that is not in its options (check `src/ui/shell/SegmentedGroup.tsx`).
- `tests/ui/support/fakeEngine.ts` -- `plays` entries gain `instrument`; about 30 UI test files use it, so check every `toEqual` on whole `plays` entries (chordGuess, chordPractice, chordReveal, explore, listen, instruments, shortcuts, app, shell, help, setup).
- `tests/audio/synth.test.ts` (about L80-279, 30 calls) -- add the instrument argument. `tests/audio/engines.test.ts` -- rewrite for the four combinations and the router.
- `tests/ui/settings/settings.test.ts` (L8-12, L37), `settingsStorage.test.ts` (L18-21, L38-41), `tests/ui/setup/SetupSoundTheme.test.tsx` (L15-20, L109) -- update to the new default and key; add the Phase 1 key test.
- `docs/codebase-map.md` -- L35 (`play` signature), L37 (`ENGINES`, `EngineHost`), L44 and L63 (settings keys).
- Reuse: `index.html` reads only the theme key, so it is untouched.

## Tasks & Acceptance

**Execution:**
- [x] `tests/ui/support/fakeEngine.ts`, `tests/audio/engines.test.ts`, `tests/ui/settings/*`, `tests/ui/setup/SetupSoundTheme.test.tsx` -- write the red tests first: instrument recorded on every play kind, four combinations, router sharing one synth, stored-value matrix, Phase 1 key untouched -- tests-first
- [x] `src/audio/engine.ts`, `src/audio/synth.ts`, `src/audio/engines.ts` -- new `play` signature, ignored by the synth; `ENGINES` map and router -- AD-7
- [x] `src/core/model.ts`, `src/ui/settings/settingsStorage.ts` -- `Sound` type, default, v2 key, accepted values -- AD-6
- [x] `src/ui/app/App.tsx`, `src/ui/session/useSessionActions.ts` -- host keyed on sound only; pass the active instrument at every call site -- AD-7
- [x] `tests/audio/synth.test.ts` and the UI tests that assert whole `plays` entries -- add the instrument argument -- keep the suite green
- [x] `docs/codebase-map.md` -- update the audio and settings lines -- it indexes the code

**Acceptance Criteria:**
- Given the Setup panel, when I open it, then the Sound control shows only `Synthesized`, none selected, with no hint line.
- Given any section, when I play, then the sound is the same synth as before and `npm run check` and `npm run build` pass.
- Given the instrument is swapped while a chord is sounding, when the swap happens, then the sound is not cut off.

## Implementation Notes

- Implemented by a subagent from the spec; the diff was checked by Amelia against every task and the I/O matrix. `npm run check` and `npm run build` pass.
- Matrix audit found two rows without a test (Sound change replaces and stops the engine; clicking Synthesized saves under the v2 key and survives a reload). Both tests added to `tests/ui/engineInstrument.test.tsx` and `tests/ui/setup/SetupSoundTheme.test.tsx`; the replace-engine guard was checked by removing `settings.sound` from the `EngineHost` memo dependencies once (the test failed, then the dependency was restored).
- The router's `status`, `subscribe` and `unlock` follow the piano's engine until Story 6.4.
- `SettingsContext` writes `samples` to `accompa.sound.v2` on first mount, as it always saved the current value; unchanged behaviour.

## Spec Change Log

## Review Triage Log

| Layer | Finding | Verdict | Route | Evidence |
|-------|---------|---------|-------|----------|
| Verification gap | Router forwarding, factory sharing and stop fan-out untested | medium | patch | `tests/audio/engines.test.ts` only asserted no-throw; mutating `play` to a fixed `'piano'` or removing the `byFactory` cache left it green. Three router tests added with spy engines; both mutations now fail, then reverted. |
| Edge case | Instrument swap not guarded on the real host path (fake engine bypasses `EngineHost`) | low | patch | Added a test with a mocked `createEngine`: swapping Guitar and Piano builds no second engine and stops nothing. |
| Blind | `AudioEngine.play` comment does not say what an engine may do with the instrument | low | patch | One-line comment added to `src/audio/engine.ts`. |
| Blind | Placeholder test `factories.size === 1` will fail in 6.2 | low | patch | Labelled in the test as a tripwire that 6.2 changes on purpose. |
| Edge case | Sound change leaves the old synth's `AudioContext` open | medium | defer | The synth has no `close()` anywhere (pre-existing); engine replacement could not happen in Phase 1 (one Sound value) and cannot yet in 6.1 (only Synthesized is selectable). It becomes reachable in 6.2. Deferred. |
| Blind | A new play does not stop the other instrument's engine when the factories differ | low | defer | Harmless while one shared synth that cuts its own notes; matters in 6.3 when engines differ. Deferred to 6.3. |
| Edge case, Blind, Verification gap | `unlock`, `status`, `subscribe` follow the piano engine only | low | defer | Decided by Apor (Open Question 2, option A): Story 6.4 settles status per instrument. A guitar-first gesture unlock matters only once factories differ; deferred to 6.3 and 6.4. |
| Blind, Verification gap | Setup Sound control shows no selected option | false | rejected | Decided by Apor (Open Question 1, option A) and pinned by the spec's I/O matrix; 6.2 adds Samples. |
| Blind | Phase 1 key orphaned, Phase 1 users move to Samples | false | rejected | Decided in the architecture review and the story text: the old key is never read, so a fresh start on Samples is intended. |
| Edge case, Blind | Test pins `samples` being written to `accompa.sound.v2` on mount | low | rejected | `SettingsContext` already saved every setting on mount in Phase 1; the test documents existing behaviour and the default is permanent. |
| Edge case | `stop` only reaches engines already built | false | rejected | An engine not yet built has nothing sounding; nothing to stop. |
| Edge case | `ENGINES[sound][instrument]` has no guard for unexpected values | false | rejected | Both are union types and `loadSettings` validates the stored Sound; a guard would add an unreachable branch. |
| Blind | `session.instrument` repeated at nine call sites; suggests a `playOn` wrapper | low | rejected | A refactor beyond a direct correction; the spec fixes the argument order. No stale-closure case: `selectInstrument` and `toggleInstrument` only dispatch and never play. |
| Blind | Parameter order or an options object for `play` | false | rejected | Fixed by Always 1 in the frozen spec. |

## Design Notes

The router exists because selection is keyed by sound and instrument while the host must not rebuild on a swap: one engine object lives per Sound and picks the instrument's engine inside `play`. Sharing instances by factory identity keeps a single `AudioContext` while every entry is the synth, and 6.2 and 6.3 add entries without touching the host.

## Verification

**Commands:**
- `npm run check` -- expected: tsc, import boundaries and all tests pass
- `npm run build` -- expected: succeeds

**Manual checks (if no CLI):**
- Open Setup in the built app: Sound lists only `Synthesized`; clicking it selects it and survives a reload.
- Click notes, Play, Block and Listen on both instruments: the synth sounds as before.
