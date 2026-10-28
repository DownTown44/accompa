---
title: 'Story 6.2: Hear a sampled piano'
type: 'feature'
created: '2026-10-28'
status: 'done'
baseline_commit: '2d5e24a9d8f5e14757a0de91ef5b01b179188694'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-6-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Every sound in the app is the synth. Story 6.1 made the engine instrument-aware, but there is no sampled piano, and the Setup Sound control cannot offer Samples.

**Approach:** A sampler engine behind the existing `AudioEngine` interface plays a bundled Salamander piano set on the piano, shifting the nearest bundled note by playback rate. The guitar stays on the synth until Story 6.3. The Setup Sound control offers `Samples | Synthesized` with a hint and the credit.

## Boundaries & Constraints

**Always:**
1. Format: MP3, decoded with `decodeAudioData` (the only compressed format verified in Chrome, Edge, Firefox and Safari without caveats). Location `public/samples/piano/`, served at `/samples/piano/<name>.mp3`; fetch URLs are built from `import.meta.env.BASE_URL` and stay same-origin. No dependency is added to `package.json`.
2. Bundled notes: the 21 files `C2 Ds2 Fs2 A2 C3 Ds3 Fs3 A3 C4 Ds4 Fs4 A4 C5 Ds5 Fs5 A5 C6 Ds6 Fs6 A6 C7` (MIDI 36, 39, 42, 45 ... 96), about 1.36 MB in total. Every MIDI pitch from 36 to 96 plays the nearest bundled note, shifted by `playbackRate = 2^(semitones/12)`; no pitch is more than one semitone from a bundled note and no pitch is equidistant between two. Pitches outside 36 to 96 clamp to the nearest edge note.
3. Sampler behaviour: notes sound in list order with the same `LEAD_IN`, `ARPEGGIO_STEP` and `STRUM_SPREAD` as the synth, exported from a new `src/audio/timing.ts` that the synth and the sampler both import. `stop` silences every sounding source; the latest `play` wins; replay repeats the same list. Per-note gain is a named constant divided by the square root of the note count; Apor tunes it by ear at review.
4. The context plumbing (create or resume inside a gesture, `idle | running | blocked`, generation counter) is extracted from `src/audio/synth.ts` into `src/audio/contextGate.ts` with no behaviour change; the synth tests stay unchanged and pass.
5. The router builds the piano engine when `createEngine` runs, so the set starts loading at startup. `ENGINES.samples.piano` builds the sampler; `samples.guitar` and both `synthesized` entries stay the synth.
6. The Setup Sound control lists `Samples` then `Synthesized`, `Samples` selected by default, with the hint `Samples follow the instrument: piano sound on the piano, guitar sound on the guitar.` in a new muted `.setup-hint` class (not the live-region `.setup-note`). The credit line sits under the hint in the same style.
7. Credits: `CREDITS.md` at the repo root and `public/samples/piano/CREDITS.txt` name Alexander Holm, the licence CC BY 3.0 with its URL, the source, that the files were trimmed and converted to MP3, and that the author's public-domain claim of 2022-03-04 is unconfirmed. The in-app credit reads `Piano sound: Salamander Grand Piano V3 by Alexander Holm, CC BY 3.0.`
8. `src/core` is untouched, `src/audio` imports only `core` types, and tests inject a fake loader and decoder; no test fetches or decodes real audio.
9. Docs: `docs/codebase-map.md` gets the new files and a short Samples section (format, location, notes bundled, total size); `README.md` no longer says that no samples are downloaded.
10. Decided by Apor, 2026-10-28: the 21 MP3 files are copied from the Tone.js audio repository set (`Tonejs/audio`, `salamander/`, C2 to C7), a CC BY 3.0 derivative of Salamander V3; no encoder is needed and the credit files say they were trimmed and converted to MP3 and taken from that repository. The in-app credit sits under the Sound hint in the Setup panel. A play before the set has decoded makes no sound; Story 6.4 adds the synth fallback.

**Never:** No guitar set (6.3). No loading or failure UI, no Status note, no synth fallback and no change to `AudioStatus`, `status`, `subscribe` or `unlock` semantics (6.4). No change to the router's `unlock`, `status` and `subscribe` (the piano engine keeps driving them). No new dependency, no CDN, no third-party request. No touch, phone or narrow-viewport work.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Nearest sample, own note | MIDI 60 | sample `C4`, rate 1 | N/A |
| A semitone above | MIDI 61 | sample `C4`, rate 2^(1/12) | N/A |
| A semitone below | MIDI 59 | sample `C4`, rate 2^(-1/12) | N/A |
| Range edges | MIDI 36 and 96 | `C2` and `C7`, rate 1 | N/A |
| Outside the range | MIDI 30, 100 | clamps to `C2` and `C7`, shifted by the clamped distance never more than one semitone | N/A |
| Block | `[60, 64, 67]`, piano | three sources start at the same time, gain from the named constant over the square root of 3 | N/A |
| Arpeggio and strum | list `[60, 64, 67]` | start times step by `ARPEGGIO_STEP` and `STRUM_SPREAD` in list order | N/A |
| Stop and latest wins | a play, then another play, then `stop` | the first play's sources are silenced by the second; `stop` silences the rest | N/A |
| Replay | the same list twice | the same sources in the same order | N/A |
| Startup | `samples` default | 21 same-origin fetches begin at once, each URL starts with the base path, none leaves the origin | a failed fetch leaves the sampler silent and throws nothing into the UI |
| Not loaded yet | a play before decode finishes | nothing sounds (6.4 adds the synth fallback) | N/A |
| Instrument | `play` on the guitar with `samples` | still the synth (6.3 adds the guitar set) | N/A |
| Synthesized | Sound set to `synthesized` | piano and guitar both play the synth; no sample is fetched | N/A |
| Setup panel | open it | two options, `Samples` selected by default, the hint and the credit show; choosing `Synthesized` persists under `accompa.sound.v2` | N/A |
| Layout | Setup open, 1280 x 800, both themes | the panel stays on screen, the page does not scroll, the instrument top edge and the Status note stay put | N/A |

</frozen-after-approval>

## Code Map

- `src/audio/synth.ts` -- constants at L4-10 are private; extract `LEAD_IN`, `ARPEGGIO_STEP`, `STRUM_SPREAD` to `timing.ts`; move the context plumbing (`ensureContext`, `refresh`, `whenRunning`, status, listeners, generation) to `contextGate.ts`; behaviour and the synth tests unchanged.
- `src/audio/sampler.ts` (new) -- `createSamplerEngine(set, createContext, load, decode)`: plan the sources, nearest-note choice, rate, start times; `AudioBufferSourceNode` per note; `stop` stops all sources.
- `src/audio/sampleSets.ts` (new) -- the piano set: file names, MIDI of each, `nearestSample(pitch)` returning name and rate, URL builder from `import.meta.env.BASE_URL`.
- `src/audio/engines.ts` -- `ENGINES.samples.piano` builds the sampler; `createEngine` builds the piano engine at creation; leave `unlock`, `status`, `subscribe` on the piano.
- `src/audio/engine.ts` -- unchanged.
- `public/samples/piano/` (new) -- the 21 MP3s plus `CREDITS.txt`; `public/` today holds only `favicon.svg`.
- `src/ui/setup/SetupPanel.tsx` -- `SOUNDS` (L31) lists Samples then Synthesized; add the hint and the credit after the Sound group, before the Theme heading. `setup.css` -- new `.setup-hint` with the `.setup-note` tokens (`--color-muted`, `--type-legend-size`, `--type-legend-weight`), a small top margin, no live-region role.
- `CREDITS.md` (new), `README.md` (L38 says no samples are downloaded), `docs/codebase-map.md` (audio rows at L36-37, setup row L47, new Samples section, test helper list).
- Tests: `tests/audio/synth.test.ts` (private fakes at the top: move `FakeContext` and friends to `tests/audio/support/fakeContext.ts`, add `createBufferSource` and `decodeAudioData`), new `tests/audio/sampler.test.ts` and `sampleSets.test.ts`, `tests/audio/engines.test.ts` (L24 tripwire and L13-22 rewritten: the router now builds the piano at creation), `tests/ui/setup/SetupSoundTheme.test.tsx` (L15 test: two options, Samples checked, hint, credit), `tests/ui/engineInstrument.test.tsx` unchanged.
- Reuse: `StatusNote`, `useAudioStatus` and the router's status plumbing are untouched.

## Tasks & Acceptance

**Execution:**
- [x] `tests/audio/support/fakeContext.ts`, `tests/audio/sampler.test.ts`, `tests/audio/sampleSets.test.ts`, `tests/audio/engines.test.ts`, `tests/ui/setup/SetupSoundTheme.test.tsx` -- red tests first: nearest-sample and rate pins, timing, stop and latest-wins, replay, startup fetch URLs and failure, the router, the Setup control -- tests-first
- [x] `src/audio/timing.ts`, `src/audio/contextGate.ts`, `src/audio/synth.ts` -- extract the timing constants and the context plumbing, no behaviour change -- the sampler reuses both
- [x] `src/audio/sampleSets.ts`, `src/audio/sampler.ts`, `src/audio/engines.ts` -- the piano set, the sampler engine and its entry; build the piano engine at creation -- AD-7
- [x] `public/samples/piano/*`, `public/samples/piano/CREDITS.txt`, `CREDITS.md`, `README.md` -- the 21 files per the answer to Open Question 1, the credits and the README line -- licence and provenance
- [x] `src/ui/setup/SetupPanel.tsx`, `src/ui/setup/setup.css` -- Samples then Synthesized, the hint, the credit -- UX-DR51
- [x] `docs/codebase-map.md` -- new files and the Samples section -- it indexes the code

**Acceptance Criteria:**
- Given the built app on the piano with Samples, when I play a block, an arpeggio and a strum, then the sound is the piano set and the timing matches the synth's.
- Given Sound on Synthesized, when I play on either instrument, then the synth sounds and no sample is requested.
- Given the Network log in the built app, when the page loads, then only same-origin requests are made and `/samples/piano/` serves 21 files.
- Given the Setup panel, when I open it, then the Sound control, hint and credit show in both themes and `npm run check` and `npm run build` pass.

## Implementation Notes

- Implemented by a subagent; the diff was checked by Amelia against every task and I/O row. `npm run check` (1055 tests) and `npm run build` pass; `dist/samples/piano/` holds the 21 files (1,355,324 bytes).
- Real Chrome check (headless, `vite preview`): 21 same-origin requests on load and no other origin; clicking piano key 60 started one `AudioBufferSourceNode` at rate 1 with the 16.2 s `C4` buffer, no console errors. The `OfflineAudioContext` decode path works in Chrome; Safari and Firefox were not tried.
- Matrix audit found one row without a test (Synthesized requests no sample and Samples requests 21); added to `tests/audio/engines.test.ts` and guarded once (pointing `synthesized.piano` at the sampler fails it, then restored).
- Beyond the spec, accepted: `tests/setup.ts` (via `vite.config.ts` `setupFiles`) makes every test `fetch` reject, because the router now fetches when it is created and the real `<App />` tests produced hundreds of ECONNREFUSED traces; and `.setup-panel` gets `max-height: calc(100vh - 100px); overflow-y: auto`, because the panel's bottom was already at 845 px on an 800 px viewport before this story and the hints would have pushed the Theme group off screen. After it the panel bottom is at 784, the instrument top stays at 366 and the Status note bottom at 756, in both themes. Easy to revert if you prefer another fix.
- `SAMPLE_GAIN` is 0.8, a placeholder for Apor to tune by ear.

## Spec Change Log

## Review Triage Log

| Layer | Finding | Verdict | Route | Evidence |
|-------|---------|---------|-------|----------|
| Verification gap | Nothing checks the 21 files named in `PIANO_SET` exist on disk | medium | patch | A renamed or missing file shipped green and silent. Added a test comparing `public/samples/piano` to the set (non-empty, no extras); removing `Fs4.mp3` once failed it, then restored. |
| Blind | Sampler `unlock` and two pitches sharing a buffer untested | low | patch | Two tests added to `tests/audio/sampler.test.ts`. |
| Blind | `stepFor` re-declares the mode union instead of `PlayMode` | low | patch | `timing.ts` now imports the type from `engine.ts`. |
| Blind | Credits record no retrieval date or version of the Tone.js copy | low | patch | `CREDITS.md` and `CREDITS.txt` now say `Retrieved 2026-10-28`. |
| Edge case, Blind | A failed, partial or stalled fetch is silent; a chord can lose notes; no retry or timeout | medium | defer | Loading, failure, retry and the synth fallback are Story 6.4; the frozen spec says Never. Deferred. |
| Edge case, Blind | Switching Sound re-fetches and re-decodes the 21 files and leaves the old `AudioContext` open | medium | defer | `createEngine` runs again on each Sound change (browser cache serves the files); the context never closes, as already deferred for 6.1. Deferred to the engine lifecycle in 6.4. |
| Edge case | `OfflineAudioContext` decode may fail or resample outside Chrome | maybe-false | defer | Works in Chrome (21 requests, a source at rate 1 with the 16.2 s C4 buffer). Firefox and Safari were not tried; trying them settles it (marked unverified, medium if true). |
| Edge case, Blind | Abrupt `source.stop()` may click; sample tails run their full length (about 16 s); loudness vs the synth | maybe-false | defer | Needs listening; Apor tunes `SAMPLE_GAIN` by ear at review. Settle by ear and add a short gain release if a click is heard. |
| Blind | Setup hint promises a guitar sample sound the guitar does not have yet | false | rejected | The hint text is fixed by the story and UX-DR51; Story 6.3 makes it true. |
| Blind | The credit shows even on Synthesized, without a licence link | false | rejected | Decided by Apor (credit under the hint, Open Question 2); the licence link and the changes note are in the two credits files. |
| Edge case | Out-of-range pitches clamp to the edge note with no signal | false | rejected | Specified in the I/O matrix (clamp); the engine range is 36 to 96. |
| Edge case | Empty pitch list gives an infinite gain | false | rejected | No source is made for an empty list, so no gain node exists; callers never play an empty list. |
| Edge case | A throw midway through scheduling leaves a partial chord | false | rejected | `createBufferSource` and `connect` do not throw on a running context; the outer catch already marks blocked. |
| Blind | `FakeContext` carries unused members; fetch is stubbed twice | low | rejected | Cosmetic; the duplicate stub is local to one test file. |
| Blind | `startsWith('/')` in `sampleSets.test.ts` is fragile if `base` changes | low | rejected | The test records today's base; a deliberate `base` change updates it. |
| Blind | `contextGate.ts` has no direct test | low | rejected | It is exercised through the unchanged synth tests and the sampler tests. |
| Blind | Setup panel CSS change shows no layout check | false | rejected | The check ran: with Setup open in both themes the panel spans 84 to 784, the stage top is 280 in Listen, the Status note bottom is 756 and the page does not scroll. |

## Design Notes

The sampler decodes with a short `OfflineAudioContext` in production, so decoding needs no user gesture and no suspended `AudioContext` warning; the buffers play on the live context. The guitar keeps its own synth context, created inside the first play, which runs inside a gesture handler, so the deferred "guitar-first unlock" gap from Story 6.1 stays a 6.3 and 6.4 matter. A failed fetch or decode only leaves the sampler silent here; showing it and falling back are Story 6.4.

## Verification

**Commands:**
- `npm run check` -- expected: tsc, import boundaries and all tests pass
- `npm run build` -- expected: succeeds; `dist/samples/piano/` holds the 21 files

**Manual checks (if no CLI):**
- Layout check after the Setup change: build, `npx vite preview --port 4173`, load in headless Chrome at 1280 x 800 (steps in `docs/development-notes.md`), open Setup in both themes: the panel stays on screen, the page does not scroll, the instrument top edge and the Status note stay put. Stop the preview server afterwards.
- Listen: play a few intervals and chords on the piano and tune the sample gain by ear; confirm the guitar still plays the synth.
