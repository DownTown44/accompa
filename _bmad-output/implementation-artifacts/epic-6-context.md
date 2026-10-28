# Epic 6 Context: Real instrument sound

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Apor hears a sampled piano on the piano and a sampled guitar on the guitar instead of the synth, in every place the app makes a sound. Each instrument's set loads from bundled same-origin files, a note played while a set loads still sounds through the synth, and a set that fails to load never breaks a theory feature. A Sound control in Setup chooses Samples (the default) or Synthesized.

## Stories

- Story 6.1: The engine knows the instrument
- Story 6.2: Hear a sampled piano
- Story 6.3: Hear a sampled guitar
- Story 6.4: Loading and failure

## Requirements & Constraints

- Separate sample sets for piano and guitar; the Sound setting (Samples or Synthesized) picks the engine, and with Samples the instrument picks the set. Synthesized ignores the instrument and fetches no samples.
- Client-only: no third-party requests. Bundled same-origin static files may be fetched; all loader URLs are relative. No dependency is added; Web Audio only, no audio library.
- Audio starts on the first user gesture, with no enable-sound screen. The AudioContext is created or resumed synchronously inside a click or keydown handler; a suspended context is "not ready" and resumes on the next gesture.
- Persisted sound value is `samples` or `synthesized`, default `samples`, under the new key `accompa.sound.v2`, read synchronously before first render. The Phase 1 key `accompa.sound` is never read, written or deleted. A missing, unparsable or foreign value falls back to `samples`.
- Sets are one per instrument, kept in memory: the active instrument's set loads at startup and on instrument change; the other instrument's set is not fetched until needed; a loaded set is not refetched.
- A note played while its set loads goes through the synth, so a click is never silent.
- A load failure (network, bad file, decode) is sticky per instrument for the session: no retry loop, the synth plays that instrument, the Status note shows a short plain message, the other instrument is unaffected, and toggling Sound does not clear it. Theory features keep working with no exception reaching the UI.
- Engine range stays MIDI 36 to 96. A pitch between bundled notes plays the nearest sample, shifted by the semitone difference through playback rate.
- Sample load time and bundle size must not block theory features or the first click; no numeric budget is set.
- Licences: Salamander Grand Piano V3 (Alexander Holm, CC-BY 3.0; his 2022-03-04 public-domain claim is unconfirmed) is credited in the app and the repo, with a credits file also next to the samples. FreePats Nylon-String Acoustic Guitar is CC0, credited as courtesy. Piano samples are re-encoded to a compressed format.
- Open items settled in Story 6.2: compressed format (decodable by Chrome, Edge, Firefox and Safari via `decodeAudioData`), encode settings, asset location (proposed `public/samples/piano/` and `public/samples/guitar/`), which source notes are bundled, total size, and where the in-app credit sits. Record them in the spec and `docs/codebase-map.md`.

## Technical Decisions

- One audio engine interface: `play` takes an ordered list of absolute pitches, the instrument, and a mode (block, arpeggio, strum bass to treble), plus `stop`. Replay repeats the same list. The engine owns timing (`ARPEGGIO_STEP`, `STRUM_SPREAD`); callers pass no timestamps; components never create Web Audio nodes.
- A sampler engine sits beside the synth behind the same interface. Engine selection is keyed by Sound plus instrument (four combinations), so later stories only add entries.
- Migrations: `AudioEngine.play` in `src/audio/engine.ts` gains the instrument; `ENGINES` in `src/audio/engines.ts` becomes keyed by Sound and instrument; the `Sound` type in `src/core/model.ts` becomes `samples | synthesized` with `initialSettings.sound` of `samples`.
- Instrument is a play parameter: swapping it does not rebuild the engine or stop playback in progress; changing Sound replaces the engine and stops the old one.
- Engine status is `idle | loading | running | blocked | failed` and reflects the active instrument's set; `useAudioStatus` subscribes to it. Story 6.4's spec settles how the app tells the engine which instrument is active at startup and on a swap.
- Layering: `src/audio` imports only `core` types; `src/core` stays untouched in this epic. Tests inject a fake loader and decoder, never fetch or decode real audio under happy-dom; the fake engine in `tests/ui/support/fakeEngine.ts` records each play's instrument.
- Call sites to update are in `src/ui/session/useSessionActions.ts`; the engine host is `src/ui/app/App.tsx`.
- Audio failures surface as a UI message and never break theory features.

## UX & Interaction Patterns

- Setup Sound control: segmented `Samples | Synthesized` with the shared selected treatment, Samples selected by default. Hint below it in muted hint style: `Samples follow the instrument: piano sound on the piano, guitar sound on the guitar.`
- Status note: loading reads `Loading the guitar sound.` (or piano) in the spot of the audio-blocked note, inside the existing polite live region, and disappears when ready. If audio is also blocked, `Press any key to wake the sound.` takes precedence. Failure reads in the same plain voice, e.g. `The guitar sound did not load. The synthesized sound is playing.` (final text confirmed in the 6.4 spec).
- Existing Status note style only: no new component, spinner, animation, score, praise or exclamation mark.
- Layout check at 1280 x 800 after Status note changes: the instrument's top edge and the Status note stay put and the page does not scroll.
- Laptop only: no touch, phone or narrow-viewport handling.

## Cross-Story Dependencies

- 6.1 changes no sound (both Sound values play the synth). Its Setup control shows only `Synthesized`, with no option selected under the default `samples` and no hint; 6.2 adds Samples and the hint. This interim state is for the spec to confirm with Apor.
- 6.2 adds the sampler engine and the piano set; the guitar still plays the synth until 6.3. 6.3 reuses 6.2's format and location rules and adds the guitar set and its credit beside the piano credit. 6.4 adds loading, failure and status behaviour on top of both.
- Later epics call `play` with the instrument: Epic 7 moves the Setup opener and the instrument toggle into the rail (the Setup panel and Status note persist); the drill and the circle page play through the same interface, the circle using the last active instrument's sound.
