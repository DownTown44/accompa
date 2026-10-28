---
title: 'Story 6.3: Hear a sampled guitar'
type: 'feature'
created: '2026-10-28'
status: 'done'
baseline_commit: 'f5547ff06a92ccfc7db7e5b4df8ef80289aedb0b'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-6-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Only the piano has a sampled sound. With Samples selected the guitar still plays the synth, the Setup hint already says "guitar sound on the guitar", and the piano set loads when the router is created even if the app opens on the guitar.

**Approach:** Add a guitar set from the FreePats Spanish classical (nylon-string) guitar, CC0. Sets load lazily: the sampler loads its set when told to prepare, and the shell tells the engine which instrument is active at startup and on every swap. The router routes `play` by instrument, so each instrument plays only its own samples.

## Boundaries & Constraints

**Always:**
1. Guitar set: the 18 files `F2 G2 A2 B2 D3 F3 Gs3 B3 D4 F4 G4 As4 C5 Ds5 Fs5 Gs5 B5 C6` (MIDI 41, 43, 45, 47, 50, 53, 56, 59, 62, 65, 67, 70, 72, 75, 78, 80, 83, 84), one velocity layer, about 1.38 MB, copied unchanged from the FreePats Spanish classical guitar SFZ FLAC archive (`SpanishClassicalGuitar-SFZ+FLAC-20190618.7z`, `samples/`), in `public/samples/guitar/`, served at `/samples/guitar/<name>.flac`. `#` is renamed `s` in file names (`G#3.flac` becomes `Gs3.flac`) so URLs stay valid. Names follow C4 = MIDI 60.
2. Nearest-note rule is the piano's: nearest bundled note, shifted by `2^(semitones/12)`; a tie goes to the lower note. This set covers the guitar's range, MIDI 40 to 86: every pitch is within one semitone of a bundled note except 85 and 86, which play `C6` shifted up one and two semitones. Pitches outside the set's lowest and highest note clamp to it.
3. `SampleSet` gains a file extension and a gain: the piano keeps `.mp3` and 0.8, the guitar uses `.flac` and a starting gain of 0.8 that Apor tunes by ear.
4. Lazy loading: the sampler no longer fetches when it is created. It loads and decodes its set once, when `prepare` runs, and keeps the buffers; a second `prepare` fetches nothing. A play before the set has decoded still makes no sound (Story 6.4 adds the synth fallback), and `play` calls `prepare` as a safety net.
5. `AudioEngine` gains an optional `prepare?(instrument: Instrument): void`. The router implements it: it records the active instrument, builds that instrument's engine and prepares it. The synth has none. The `Shell` in `src/ui/app/App.tsx` calls `engine.prepare?.(session.instrument)` in an effect on the engine and the active instrument, so the active instrument's set loads at startup and on a swap, and the other instrument's set is not fetched until needed.
6. The router: `ENGINES.samples.guitar` builds the guitar sampler; `createEngine` no longer builds the piano at creation. `unlock` unlocks every engine that has been built. `status` and `subscribe` follow the active instrument's engine (the router forwards to its own listeners and re-points when the active instrument changes). A `play` stops every other built engine first, so a ringing note of the other instrument is cut by the new play; a swap on its own cuts nothing.
7. With Sound `synthesized` the synth plays both instruments and nothing is fetched. With `samples` the piano plays the piano set and the guitar the guitar set, in every path: Listen intervals and chords, Explore Play, Block, strum, arpeggio, a single-note click and the Reveal chord. A strum plays in list order, bass to treble, `STRUM_SPREAD` apart.
8. Credits: the Setup panel gets a second credit line under the piano one in the same `.setup-hint` style, `Guitar sound: FreePats Nylon-String Acoustic Guitar, CC0.`; `CREDITS.md` gets a `## Guitar sound` section and `public/samples/guitar/CREDITS.txt` is added, each naming the FreePats Spanish classical guitar (recorded in 2008 by roberto@zenvoid.org), CC0 1.0 with its URL, the source archive and that the files were copied unchanged except for `#` renamed to `s`, with a retrieval date.
9. `src/core` is untouched, `src/audio` imports only `core` types, no dependency is added, no request leaves the app's own origin, and tests inject a fake loader and decoder.
10. Docs: `docs/codebase-map.md` (audio rows, Samples section with the guitar set, format, location, notes and size, the Setup row, the test helper list) and `README.md` (the guitar no longer uses the synthesizer under Samples).
11. Decided by Apor, 2026-10-28: the guitar files are bundled as published FLAC (`.flac`), unchanged and CC0, with no conversion and no encoder; and the engine learns the active instrument through the optional `prepare(instrument)` method on `AudioEngine`, called from the shell at startup and on every swap, with the router tracking the active instrument.

**Never:** No loading or failure UI, no Status note, no synth fallback, no retry and no change to the status vocabulary (Story 6.4). No change to the synth's behaviour. No conversion or re-encoding of the guitar files and no encoder. No touch, phone or narrow-viewport work.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Own sample | guitar MIDI 53 | sample `F3`, rate 1 | N/A |
| One semitone off | MIDI 52 and 54 | `F3` at 2^(-1/12) and 2^(1/12) | N/A |
| Tie | MIDI 42 (between 41 and 43) | `F2` at 2^(1/12) (the lower note) | N/A |
| Range edges | MIDI 40, 85, 86 | `F2` at 2^(-1/12); `C6` at 2^(1/12) and 2^(2/12) | N/A |
| Outside the set | MIDI 30, 100 | clamps to `F2` and `C6` | N/A |
| Guitar plays | Samples, instrument guitar, any path | the guitar buffers sound, never the piano's | N/A |
| Piano plays | Samples, instrument piano | the piano buffers sound | N/A |
| Swap | piano then guitar | the next note is the guitar's; nothing is cut by the swap itself | N/A |
| New play cuts the other | piano chord ringing, play on the guitar | the piano engine stops, the guitar sounds | N/A |
| Strum order | guitar voicing as a strum | start times rise in list order by `STRUM_SPREAD`, bass first | N/A |
| Startup on piano | Samples | 21 piano files fetched, no guitar file | failed fetch leaves it silent |
| Startup on guitar | Samples, session starts on guitar | 18 guitar files fetched, no piano file | failed fetch leaves it silent |
| Swap to the other | first swap to guitar | 18 guitar files fetched once; swapping back and forth fetches nothing more | N/A |
| Synthesized | Sound `synthesized` | synth on both instruments, no request | N/A |
| Unlock | a gesture | every built engine's context is unlocked | N/A |
| Status | guitar active and its context blocked | the router reports blocked; with the piano active it reports the piano engine's status | N/A |
| Setup | open it | the hint and both credits show, none clipped by the page | N/A |
| Layout | Setup open, 1280 x 800, both themes | the panel scrolls inside the viewport, the page does not, the instrument top edge and the Status note stay put | N/A |

</frozen-after-approval>

## Code Map

- `src/audio/sampler.ts` -- `createSamplerEngine(set, ...)`: the fetch and decode loop at the top moves into an idempotent `prepare`; `play` calls it; per-engine `buffers` stay; add `prepare` to the returned engine; use `set.gain` for `SAMPLE_GAIN`.
- `src/audio/sampleSets.ts` -- `SampleSet` gains `extension` and `gain`; add `GUITAR_SET` (the 18 notes above); `sampleUrl` uses the extension; `nearestSample(pitch, set)` tie goes to the lower note (check it already does).
- `src/audio/engine.ts` -- add optional `prepare?(instrument: Instrument): void`.
- `src/audio/engines.ts` -- `ENGINES.samples.guitar` builds the guitar sampler; router: active instrument, `prepare`, `unlock` all built, `status` and `subscribe` follow the active engine, `play` stops the other built engines first, no piano build at creation.
- `src/ui/app/App.tsx` -- `Shell` (inside the providers, where `session.instrument` and the engine are available) gets the effect calling `engine.prepare?.(session.instrument)`; `EngineHost` stays above the session and is unchanged.
- `public/samples/guitar/` (new) -- the 18 FLAC files from the archive (extract with `tar` into a scratch folder, copy, rename `#` to `s`) plus `CREDITS.txt`.
- `src/ui/setup/SetupPanel.tsx` -- the second credit line after the piano one.
- `CREDITS.md`, `README.md`, `docs/codebase-map.md`.
- Tests: `tests/audio/sampler.test.ts` (no fetch at creation; `prepare` loads once; a second `prepare` fetches nothing; `play` prepares; strum order), `tests/audio/sampleSets.test.ts` (the guitar set: 18 files on disk non-empty and no others, notes, nearest pins from the matrix, URLs), `tests/audio/engines.test.ts` (the tripwire that expected the piano alone to have a factory, the piano-at-creation test, the 21-fetch test, the router tests for `prepare`, unlock all, status follows active, the new play stopping the other engine), `tests/ui/setup/SetupSoundTheme.test.tsx` (the guitar credit), a UI test that the shell prepares the active instrument and swapping prepares the other.
- Reuse: `tests/audio/support/fakeContext.ts`, `tests/setup.ts` (every fetch rejects unless a test stubs it).

## Tasks & Acceptance

**Execution:**
- [x] `tests/audio/sampler.test.ts`, `tests/audio/sampleSets.test.ts`, `tests/audio/engines.test.ts`, `tests/ui/setup/SetupSoundTheme.test.tsx`, a shell prepare test -- red tests first, per the matrix -- tests-first
- [x] `src/audio/sampleSets.ts`, `src/audio/sampler.ts`, `src/audio/engine.ts` -- the guitar set, extension and gain, idempotent `prepare`, the optional interface method -- AD-7
- [x] `src/audio/engines.ts`, `src/ui/app/App.tsx` -- guitar entry; router active instrument, `prepare`, unlock all, status follows active, new play stops the other; shell effect -- AD-7
- [x] `public/samples/guitar/*`, `public/samples/guitar/CREDITS.txt`, `CREDITS.md`, `README.md` -- the 18 files per the answer to Open Question 1, the credits -- licence and provenance
- [x] `src/ui/setup/SetupPanel.tsx` -- the guitar credit line -- UX-DR51
- [x] `docs/codebase-map.md` -- audio, Samples, Setup and tests -- it indexes the code

**Acceptance Criteria:**
- Given the built app on the guitar with Samples, when I play a voicing as a strum and a single note, then the sound is the nylon guitar and the strum goes bass to treble.
- Given Samples, when I swap between the instruments, then each plays its own samples and the second swap to an instrument fetches nothing.
- Given Synthesized, when I play on either instrument, then the synth sounds and no sample is requested.
- Given `npm run check` and `npm run build`, when I run them, then both pass and `dist/samples/guitar/` holds the 18 files.

## Implementation Notes

- Implemented by a subagent; the diff was checked by Amelia against every task and matrix row. `npm run check` (1077 tests) and `npm run build` pass; `public/samples/guitar/` holds the 18 FLACs (1,381,961 bytes) plus `CREDITS.txt`.
- Real Chrome check (headless, `vite preview`): on load 21 piano files and no guitar file; after the swap to the guitar 18 guitar files; swapping back and forth fetched nothing more; only `localhost` origins; a click on the guitar string-3 fret-2 note (57) started one source with the decoded FLAC buffer (3.34 s, 44.1 kHz) at rate 1.0595 (`Gs3`, one semitone up), no console errors. So `decodeAudioData` takes these FLAC files in Chrome. Setup with the extra credit line, both themes: panel 84 to 784 and scrolling inside, stage top 280 in Listen, Status note bottom 756, no page scroll.
- Spec contradiction settled by the implementer: the piano's clamp would have played MIDI 85 and 86 as an unshifted `C6`, but the matrix needs `C6` shifted up one and two semitones. `SampleSet` gained an optional `range` (`[40, 86]` for the guitar): pitches clamp to the range, then take the nearest note, so 30 plays `F2` at one semitone down and 100 plays `C6` at two up. The matrix row "clamps to `F2` and `C6`" holds; the piano is unchanged and the guitar cannot sound outside 40 to 86 anyway.
- Gain 0.8 is the starting value for the guitar; Apor tunes it by ear.

## Spec Change Log

## Review Triage Log

| Layer | Finding | Verdict | Route | Evidence |
|-------|---------|---------|-------|----------|
| Verification gap | Re-preparing after a Sound change has no test | medium | patch | Dropping `engine` from the `Shell` effect deps left every test green and made the first note after switching back to Samples silent. Added a test (21 fetches at start, none for Synthesized, 21 more on Samples before any play); the dropped dependency now fails it, then restored. |
| Verification gap | The guitar tie-break (lower note) is not pinned | medium | patch | Changing `<` to `<=` flipped MIDI 44, 46 and 79 silently. Rows added; the mutation now fails four cases, then restored. |
| Blind | Router subscribe, unsubscribe and same-instrument `prepare` untested | low | patch | Two tests added: one attach for two listeners, detach after the last, attach again; `prepare` of the active instrument notifies nobody. |
| Blind | Guitar gain copied, comment says tuned by ear | low | patch | The `SampleSet.gain` comment now says it is a starting value Apor tunes by ear. |
| Blind | The guitar is named two ways in the credits | low | patch | Credits files now say `FreePats Nylon-String Acoustic Guitar (the Spanish classical guitar bank)`. |
| Edge case | `deferred-work.md` still names the removed `SAMPLE_GAIN` constant | low | patch | Reworded to the sample gain. |
| Edge case, Verification gap | First guitar notes after a swap are silent until the set decodes | medium | rejected | Known and deferred to Story 6.4 (synth fallback); `prepare` runs on the swap so the local files load within moments. Carried from the 6.2 deferral. |
| Edge case | A failed fetch leaves a note silent for the session (no retry) | medium | rejected | Retry is Story 6.4; carried from the 6.2 deferral. |
| Edge case, Blind | Status after a swap can read idle until the new engine's context exists | false | rejected | An idle status shows no note; `play` creates the context inside the gesture, and `unlock` runs for every built engine on each gesture. |
| Edge case | `play` for an instrument `prepare` has not named leaves status on the wrong engine | low | rejected | The `Shell` effect runs `prepare` on every instrument change before any play; only tests with stub engines skip it. |
| Edge case | `unlock` builds an unused piano sampler when the app opens on the guitar | false | rejected | The router builds nothing at creation; only the active and played instruments are built. |
| Edge case, Blind | 30 and 100 play shifted, and `range` is a second source of truth | low | rejected | Decided in the Implementation Notes: pitches clamp to `[40, 86]` first, which the matrix row allows; the guitar cannot sound outside 40 to 86. |
| Blind | Two `AudioContext`s on the Samples path | low | rejected | By design: each sampler owns its gate (spec Always 6); a shared context would change the 6.2 engine for no audible gain. |
| Blind | `guitarNotes` casts; `prepare` ignores its argument; stubs unstubbed at test end | low | rejected | Cosmetic and test hygiene, not worth added code. |
| Verification gap | The 18 FLACs decode in a real browser is untested | false | rejected | Checked by hand in headless Chrome: a click on a guitar note started a source with the decoded FLAC buffer (3.34 s, 44.1 kHz). |

## Design Notes

The 18 notes were chosen by a search over the 48 files of the pack: every pitch from 40 to 86 within one semitone of a bundled note (two semitones for 85 and 86, which the pack's top sample, `C6` at MIDI 84, has to serve), at the least total size. The smaller 10-file set within two semitones (0.8 MB) would shift the timbre more; the same one-semitone rule as the piano keeps the sound consistent. FLAC names with `#` are renamed because `#` starts a URL fragment.

## Verification

**Commands:**
- `npm run check` -- expected: tsc, import boundaries and all tests pass
- `npm run build` -- expected: succeeds; `dist/samples/guitar/` holds the 18 files

**Manual checks (if no CLI):**
- Headless Chrome at 1280 x 800 against `vite preview` (steps in `docs/development-notes.md`): on load only the active instrument's files are requested, swapping requests the other set once, all same-origin; a click on a guitar note starts a sampler source with a decoded FLAC buffer (confirms `decodeAudioData` takes the FLAC); open Setup in both themes and check the panel, the instrument top edge and the Status note. Stop the preview server afterwards.
- Listen to the guitar and tune its gain by ear.
