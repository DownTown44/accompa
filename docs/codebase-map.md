# Codebase map

Index for agents. Policy and pitfalls are in `AGENTS.md`; the story workflow and the browser check are in `docs/development-notes.md`. Line numbers drift; names do not.

## Layers and the import rule

- `src/core`: pure TypeScript, imports nothing else in `src`. No React, no DOM, no `Math.random` (randomness comes in as a `random` parameter).
- `src/audio`: may import `core` only.
- `src/ui`: may import `core` and `audio`.
- Inside `ui`, the features `listen`, `explore` and `shell` must not import each other; `shared` must not import `listen`, `explore` or `shell`. Other folders (`session`, `settings`, `setup`, `shortcuts`, `help`, `instruments`, `engine`, `app`) are not restricted by the table.
- Enforced by `scripts/check-boundaries.mjs` (tables `allowed` and `feature`), run by `npm run check` and tested in `tests/scripts/check-boundaries.test.ts`.
- Entry: `src/main.tsx` renders `App` (`src/ui/app/App.tsx`), which nests `SettingsProvider`, `EngineHost`, `SessionProvider`, then `Shell`.

## src/core

| File | Owns | Key exports | Used by |
| --- | --- | --- | --- |
| `pitch.ts` | Branded numbers | `Pitch`, `PitchClass`, `Interval`, `pitch`, `pitchClass`, `interval` | everything |
| `theory.ts` | The two tables | `INTERVALS` (12, `IntervalDefinition`), `CHORD_QUALITIES` (9, `ChordQuality` with `name`, `symbol`, `intervals`, `degrees`) | chords, practice, settings, UI buttons |
| `chords.ts` | The only chord namer | `nameChord(pitches)` returns `ChordReading[]` (`root`, `quality`, optional `bass`), lowest note as root first | explore, session, useLitNotes |
| `spelling.ts` | Note and chord text | `noteName`, `spellChord`, `chordSymbol`, `chordSpoken`, `spellNotes`, `stringNames`, `octaveLabel`, `spelledRoot`, `spellInterval` (tested, not used by the UI) | explore, Fretboard, PianoKeyboard |
| `explore.ts` | Explore logic | `toggleLit`, `MAX_LIT`, `exploreReading` (readout, root, roles, legend, readings), `orderedReadings`, `readingRootedOn`, `readingChoice`, `sameChoice`, `placeLit`, `litPositions`, `pitchesOnString`, `beyondFretboard`, `leftOutCount`, `beyondFretboardNote`, `Role`, `LegendEntry` | session.ts, useLitNotes, App, ListenView, shared |
| `voicings.ts` | Guitar voicing generation and ranking | `VOICING_RULES` (the tunable rules), `generateVoicings`, `rankVoicings`, `fingersNeeded`, `moveFret`, `voicingPitches`, `mean` | useLitNotes, useSessionActions, shapes |
| `shapes.ts` | Common guitar shapes as data | `SHAPE_TEMPLATES`, `shapeFrets(chord)` | useLitNotes |
| `practice.ts` | Question generation | `generateQuestion` (interval), `generateChordQuestion`, `Random` | useSessionActions |
| `guess.ts` | Guess rules shared by both kinds | `inPlay`, `canGuess` | session.ts, useSessionActions, both button rows |
| `instruments.ts` | Instrument geometry | `STANDARD_GUITAR_TUNING`, `GUITAR_FRETS`, `INSTRUMENT_RANGES`, `COMMON_RANGE`, `positionsForPitch`, `closestPair`, `pitchAt`, `FretPosition` | most of ui and core |
| `piano.ts` | The 36-semitone piano window | `windowPitches`, `shiftWindow`, `fitWindow`, `isBlackKey`, `offscreenLit`, `offscreenNote`, `DEFAULT_WINDOW_START` | session.ts, PianoKeyboard, App |
| `model.ts` | Shared types and initial state | `Workspace`, `Practice`, `Settings`, `Question`, `ChordQuestion`, `ReadingChoice`, `PracticeKind`, `initialWorkspace`, `initialPractice`, `initialSettings` | session, settings, UI |

## src/audio

| File | Owns |
| --- | --- |
| `engine.ts` | The `AudioEngine` interface (`play(pitches, instrument, mode)`, `stop`, `unlock`, `status`, `subscribe`) and `PlayMode` (`block`, `arpeggio`, `strum`). |
| `synth.ts` | `createSynthEngine`: Web Audio triangle oscillators. |
| `timing.ts` | `LEAD_IN`, `ARPEGGIO_STEP`, `STRUM_SPREAD`, `stepFor(mode)`; shared by the synth and the sampler. |
| `contextGate.ts` | `createContextGate`: create or resume the `AudioContext` inside a gesture, `idle \| running \| blocked`, the generation counter; shared by the synth and the sampler. |
| `sampleSets.ts` | `PIANO_SET` (21 notes), `nearestSample(pitch)` (name and playback rate), `sampleUrl` (built from `import.meta.env.BASE_URL`). |
| `sampler.ts` | `createSamplerEngine(set, createContext, load, decode)`: loads and decodes the set at creation, plays `AudioBufferSourceNode`s; `SAMPLE_GAIN`. A play before the set has decoded is silent (Story 6.4 adds the synth fallback). |
| `engines.ts` | `ENGINES`: one engine factory per `Sound` and `Instrument` (`samples` + piano is the sampler, the other three are the synth); `createEngine(sound)` is the router that builds the piano engine at creation (so its samples start loading) and the guitar's on first use, sharing one instance per factory. `EngineHost` in `App.tsx` builds it keyed on `settings.sound` only. |

### Samples

- Format: MP3, decoded with `decodeAudioData` (an `OfflineAudioContext`, so no gesture is needed); the buffers play on the live context.
- Location: `public/samples/piano/<name>.mp3`, fetched from `import.meta.env.BASE_URL` plus `samples/piano/`; same-origin only. Credits sit beside the files in `CREDITS.txt` and at the repo root in `CREDITS.md`.
- Bundled notes: 21 files, `C2 Ds2 Fs2 A2 ... A6 C7` (MIDI 36, 39 ... 96), about 1.36 MB in total. Every pitch from 36 to 96 plays the nearest file shifted by `playbackRate = 2^(semitones/12)`, at most one semitone; pitches outside clamp to the edge note.
- Source: the Tone.js audio repository (`Tonejs/audio`, `salamander/`), a trimmed MP3 derivative of Salamander Grand Piano V3 (CC BY 3.0).
- The guitar has no set yet (Story 6.3).

## src/ui

| Folder | Files and role |
| --- | --- |
| `session/` | `session.ts`: `Session`, `SessionAction`, `sessionReducer`, `initialSession`, `Feedback`, `Mode`. `SessionContext.tsx`: `SessionProvider`, `useSession`. `useSessionActions.ts`: every action a component may call (plays sound, draws questions, dispatches); 15 components call it. `useLitNotes.ts`: what the instruments light, `useLitNotes`, `useVoicingList`, `showsStepper`, `canStep`, voicing ranking cache `rankedOnce`. |
| `settings/` | `settings.ts`: `settingsReducer`, `SettingsAction`. `SettingsContext.tsx`: provider, theme attribute, saves `pool`, `sound`, `theme`. `settingsStorage.ts`: `loadSettings`, `saveSetting`, keys `accompa.pool`, `accompa.sound.v2` (Phase 1 `accompa.sound` is never touched), `accompa.theme`. |
| `listen/` | `ListenView.tsx` (question readout, hint, chord legend), `ListenControls.tsx` (Play again, Reveal or Next), `IntervalButtons.tsx` (renders `ChordButtons` when practice is chords), `ChordButtons.tsx`, `intervalKeys.ts` (`INTERVAL_KEYS`, also used by shortcuts). |
| `explore/` | `ExploreView.tsx` (readout, alternative readings, announcements), `ExploreControls.tsx` (Play, Block), `VoicingStepper.tsx`. |
| `setup/` | `SetupPanel.tsx`: Practice, pool chips, Direction, Root, Sound (Samples, Synthesized, a hint and the piano credit in `.setup-hint`), Theme; `SETUP_PANEL_ID`, `SETUP_OPENER_ID`. |
| `shell/` | `ModeStrip.tsx` (Mode and Instrument), `Corner.tsx` (Setup opener, panel, help), `SegmentedGroup.tsx` (all radio groups), `StatusNote.tsx`. |
| `instruments/` | `piano/PianoKeyboard.tsx`, `PianoStage.tsx`; `guitar/Fretboard.tsx`, `GuitarStage.tsx`; `instruments.css`. Keyboard and Fretboard are presentational; Stages read `useLitNotes` and call `pressNote` and `releaseNote`. |
| `shortcuts/` | `useShortcuts.ts`: one `keydown` listener for the whole app. |
| `help/` | `HelpHint.tsx`: the `?` list; the `ROWS` array is the shortcut text. |
| `theme/` | `theme.css`: all colour, type and spacing tokens, light and dark. |
| `shared/` | `RoleMarker.tsx`, `RoleLegend.tsx`, `chordLabels.ts` (`qualityLabel`: Maj, Dom7, m7♭5), `focus.ts` (`focusInstrument`), `shared.css`. |
| `engine/` | `EngineContext.tsx` (`useEngine`), `useAudioStatus.ts` (`useAudioStatus`, `useAudioWake`). |
| `app/` | `App.tsx`: providers, `Shell` (layout, Status note text). |

## State model

- `Session` (reducer in `session.ts`, never saved): `mode`, `instrument`, `pianoStart`, `feedback`, `setupOpen`, `helpOpen`, `rootArmed`, `cleared` (for Undo), plus two halves that must not touch each other.
- `Workspace` (Explore): `pitches` (max 8, oldest first), `positions` (guitar position per pitch), `reading`, `root`, `voicing`, `edited`. Changed by `toggleNote`, `chooseReading`, `chooseRoot`, `selectVoicing`, `editVoicing`, `dismiss` (clears), `undoClear`.
- `Practice` (Listen rounds): `question`, `revealed`, `wrongMarks`, `fixedRoot`, and the optional chord fields `chordQuestion`, `chordWrongMarks`, `chordRevealed`. Changed by `setQuestion`, `setChordQuestion`, `clearQuestion`, `setFixedRoot`, `reveal`, `revealChord`, `guess`, `guessChord`, `chordRight`.
- Session-level actions: `setMode`, `setInstrument`, `toggleInstrument` (these take `chords` because the reducer cannot see settings), `shiftPiano`, `armRoot`, `toggleSetup`, `closeSetup`, `openHelp`, `closeHelp`, `toggleHelp`. `reveal`, `revealChord`, `chordRight`, mode and instrument changes and `undoClear` refit the piano window through `fitRevealed`.
- `Settings` (`settingsReducer`): `practice` (not saved), `pool` (saved), `chordPool` (not saved), `direction` (not saved), `rootMode` (not saved), `sound` (`samples` or `synthesized`, default `samples`, saved), `theme` (saved).
- Reducer tests assert the untouched half is the same reference (`tests/ui/session/session.test.ts`, "workspace and practice stay apart").

## Main data flows

- Listen interval question: `startQuestion` (useSessionActions) calls `generateQuestion` with `settings.pool`, `COMMON_RANGE`, `Math.random`; dispatches `setQuestion`; `playQuestion` calls `engine.play`. A guess goes `IntervalButtons` to `guess()`: right dispatches `reveal`, wrong dispatches `guess`. Reveal makes `useLitNotes` return the question pitches; `ListenView` shows the abbreviation.
- Listen chord question and reveal: `startChordQuestion` calls `generateChordQuestion`, dispatches `setChordQuestion`, plays a block. `guessChord` dispatches `chordRight` (reveals, silent) or `guessChord` (marks). `revealChord` is Reveal. `useLitNotes` returns the chord with roles from `exploreReading`; on the guitar `useChordReveal` ranks voicings and shows the best one. `ListenView` shows the name from `exploreReading`.
- Explore click to chord name: Stage `onNoteRelease` calls `releaseNote`, which dispatches `toggleNote`. `ExploreView` calls `exploreReading(pitches, reading, root)`, which calls `nameChord` and the spelling functions; alternatives are buttons that dispatch `chooseReading`.
- Carry to guitar and voicing list: notes lit on the piano have no entry in `workspace.positions`. `useShown` (useLitNotes) then calls `rankedOnce`, that is `generateVoicings`, `shapeFrets`, `rankVoicings`. `VoicingStepper` and the arrow keys dispatch `selectVoicing`. Notes clicked on the guitar have positions and are shown as clicked, with `placeLit` keeping one per string.
- Hand edit: with a voicing shown, a fret click calls `releaseNote(..., voicingFrets)`, which dispatches `editVoicing` with `moveFret` frets. The reducer rewrites `pitches` and `positions` and sets `edited`; leaving the edit (`selectVoicing`) clears `positions`.

## Where to change X

- Add a chord quality: `CHORD_QUALITIES` in `core/theory.ts`; `LABELS` in `ui/shared/chordLabels.ts`; `SHAPE_TEMPLATES` in `core/shapes.ts` if it has common shapes; `DEGREE_LABELS` in theory.ts if a new degree appears. Key hints for the buttons come from `INTERVAL_KEYS`, which has 12 entries. Check `tests/core/chords.test.ts` and the chord UI tests that iterate the table.
- Add an interval: `INTERVALS` in `core/theory.ts`; `INTERVAL_KEYS` slices to its length; `SIZES` in `core/spelling.ts`; help row text in `HelpHint.tsx`.
- Change voicing rules: `VOICING_RULES` in `core/voicings.ts`; ranking order in `rankVoicings`; shapes in `core/shapes.ts`.
- Change a shortcut: the branch chain in `ui/shortcuts/useShortcuts.ts`, the `ROWS` array in `help/HelpHint.tsx`, and `aria-keyshortcuts` on the control.
- Add a Setup control: `SettingsAction` and `settingsReducer` in `settings/settings.ts`; field and default in `core/model.ts`; a `SegmentedGroup` in `SetupPanel.tsx`; save it by adding a key in `settingsStorage.ts` and an effect in `SettingsContext.tsx`; a sound-making control goes through `useSessionActions`.
- Change a label: button text `chordLabels.ts` (chords) or `INTERVALS` (`abbreviation`, `name`); chord names are text from `core/spelling.ts` only.
- Change layout: tokens in `ui/theme/theme.css` (`--spacing-*`, `--type-*`); the readout block height is `--spacing-readout-block-height`; page frame in `shell/shell.css`; then run the browser check.

## Tests

- `tests/core` has one file per core module plus `chordQuestion.test.ts`; `tests/audio`; `tests/scripts`; `tests/ui` by feature folder, plus three chord files at the root (`chordPractice`, `chordGuess`, `chordReveal`). Reducer tests: `tests/ui/session/`. About 1,000 tests; a full run takes about 30 s, mostly happy-dom set-up.
- Helpers in `tests/ui/support/`: `dom.ts` (`radio`, `opener`, `panel`, `key`, `click`, `lit`, `rooted`), `explore.ts` (`cell`, `roleOf`, `legend`, `readout`, `alts`, `status`, `mutedStrings`), `fakeEngine.ts` (`createFakeEngine`: records `plays`, `unlocks`, `stops`), `tests/audio/support/fakeContext.ts` (`FakeContext`, `FakeGain`, `FakeOscillator`, `FakeSource` for the synth and sampler tests), `keys.ts` (`press`), `sessions.ts` (`listenSession`), `setupPanel.ts` (`chip`, `answer`, `registerSetupHooks`).
- UI tests render `<App session={...} engine={fakeEngine} />`. Random questions are fixed by mocking `Math.random` (about 16 call sites in 10 files).

## Quirks that bite

- Working copies are CRLF (`autocrlf`), the index is LF. Never reflow or re-indent lines you did not change; run `npx prettier` only on files you created. `SetupPanel.tsx` has an unindented JSX block on purpose.
- One lit note per string: place notes with `placeLit` and `pitchesOnString`, never by choosing frets in the UI.
- Chord names come only from `nameChord`; spelling only from `core/spelling.ts`.
- `src/core` takes randomness as a `random` parameter. `Math.random` appears only in `useSessionActions.ts`.
- `Workspace.positions` is also the marker for "clicked on the guitar" (`useShown` in `useLitNotes.ts`, comment in `session.ts` `selectVoicing`).
- `rankedOnce` in `useLitNotes.ts` is a module-level single-entry cache, because `useSessionActions` calls `useLitNotes` in each of its 15 callers.
- Layout is not covered by unit tests. After a layout change, load the built app in headless Chrome at 1280 x 800: the instrument top stays 366.2 px, the Status note top 725.2 px, `scrollHeight` 800 (recipe in `docs/development-notes.md`).
- `PianoKeyboard`, `Fretboard` and the readout block height serve Listen and Explore; check Listen after changing them.
- Laptop only: no touch, phone or narrow-viewport handling.
