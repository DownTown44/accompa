# Adversarial Review, Phase 2 — ARCHITECTURE-SPINE.md (accompa)

Reviewer stance: find pairs of units one level down that obey every AD to the letter and still build incompatibly. Scope: Phase 2 content (AD-4 to AD-8, AD-10, AD-12, AD-13). Claims checked against `src/` (core/theory, chords, explore, spelling, voicings, practice, model; ui/session, ui/settings; audio/engine, engines). roadmap.md was not read. Already-decided items (licence, format, asset path, omitted-fifth unnamed) are not raised.

## Verdict

Ten real holes. Four are high: AD-5 describes a workspace the code does not have, the 9th's semitone value is unspecified, "spelled root" has no type that survives the namer, and the drill has no question slot of its own. The rest are medium. Several ADs also contradict the code as it stands today; those are noted inline.

## Findings (ranked by likelihood x cost)

### 1. Two owners of "the workspace chord" (HIGH)
- **Units:** Inversion-stepper/builder story vs the existing Explore free-play code.
- **AD text:** AD-5 "workspace ... the chord (spelled root, quality and an optional bass ...), and the selected voicing per instrument"; AD-8 "an inversion is the workspace chord's optional bass"; "stepper is available for any named chord, hand-built or picked."
- **Code reality:** `Workspace` (`core/model.ts`) is `pitches` (lit notes) + `positions` + `reading?` (root pc + quality name) + `root?` + `voicing?`. There is no spelled root, no bass, no chord object. The bass is derived from the lowest lit pitch in `nameChord`.
- **Divergence:** Builder A adds `chord: {root, quality, bass?}` beside `pitches`, and derives pitches from it. Builder B keeps `pitches` as truth and writes the piano layout output into `pitches` on each step. Both are "workspace written only by builder, inversion stepping". Under A, toggling a note in free-play leaves `chord` stale; under B, `bass` has no home and stepping rewrites the user's lit notes (and, on guitar, `positions`, MAX_LIT 8). A hand-built Am7/C already has a bass; "step to 1st inversion" is counted from which root, the namer's first reading or a chosen alternative?
- **Tightening:** State that the workspace's lit `pitches` stay the single source of truth; "optional bass" is a `Workspace` field `bass?: PitchClass` that is pruned (like `pruneReading`) whenever the pitches or chosen reading stop containing it; stepping writes `bass` only and the piano layout function runs at render, never into `pitches`. Inversion number is counted from the displayed reading's root.

### 2. The 9th: 14 semitones or 2? (HIGH)
- **Units:** Quality-table story (AD-4) vs namer/practice/layout stories.
- **AD text:** AD-4 "each tone record has its semitones above the root ... degree (... 9)". "The `intervals` list is derived from the tones." The 2nd and 9th "share the ninth role".
- **Divergence:** Table author writes add9 as `[0,4,7,14]` (literal "above the root"); another writes `[0,4,7,2]`-style or mod 12. `nameChord` (`core/chords.ts`) tests `quality.intervals.every(i => offsets.has(i))` against mod-12 offsets, so 14 never matches and add9/9/maj9/m9 are never named; with 2, `generateChordQuestion` builds `root + i` with the 9th below the 3rd and takes `span = last interval` (wrong), and the piano layout puts the 9th in the wrong octave. Sorted-by-semitones vs sorted-by-degree orders also differ for sus2.
- **Tightening:** Tone record carries `semitones` (0 to 11, pitch class offset, used by namer and check) and `degree`; compound placement is derived (`degree 9` places at `semitones + 12` in layouts and questions). Tone list is ordered by degree. Namer and drill check compare `semitones mod 12`.

### 3. "Spelled root" has no type, and the AD-12 test cannot detect the mislabel it exists for (HIGH)
- **Units:** Circle/keys story vs spelling/namer story.
- **AD text:** AD-3 "root spelling comes from the namer's chosen reading, the user's explicit root change, or a picker's explicit choice"; AD-12 "test asserts `nameChord` of each chip's pitches returns the chip's root and quality as the first reading"; Open items "covered by the namer consistency test".
- **Code reality:** `ChordReading.root` is a `PitchClass`; `spelledRoot(reading)` picks `ROOT_NAMES`/twin by `needsDouble`. It cannot receive a picked spelling. For the F♯ position's minor, `spelledRoot` returns E♭ (no double needed), so the namer path labels D♯m as E♭m: exactly the mock bug.
- **Divergence:** `core/keys` author stepping letters from the key (D♯m, and E♯dim in D♯ minor) vs a builder who spells chips by calling `spelledRoot`/`chordSymbol` (E♭m, F dim). The test passes both, because it compares root by pitch class (D♯ = E♭). Harmonic and melodic minors also yield double-sharp roots (D♯ harmonic minor vii° on C𝄪): "twin rule" substitutes D, which breaks the key's letter order; AD-3 and AD-12 each pick a different fallback.
- **Tightening:** Define `SpelledNote = {letter, accidental}` in `core/model`; `ChordReading`/`ChordPick` carry an optional `spelledRoot`; `spellChord`/`chordSymbol` use it when present. The AD-12 test compares the spelled root (letter and accidental), not the pitch class, and the AD lists the exact rule for double-accidental roots in a key (use the twin and mark it, or exclude).

### 4. Drill question has no slot; it collides with Listen's chord question (HIGH)
- **Units:** Drill story vs Listen chord practice (existing).
- **AD text:** AD-5 practice = "the current question, reveal state, the attempt count, the lit notes of a drill answer and the pool in play"; AD-13 pool is all 17 qualities.
- **Code reality:** `Practice.chordQuestion`/`chordRevealed`/`chordWrongMarks` are Listen's, shaped as `{root, quality, pitches}` with wrong marks as quality names; `toggleNote` writes `workspace` regardless of mode.
- **Divergence:** Drill A reuses `chordQuestion` (stores `pitches`, which leak the answer, and stomps Listen's question on a mode switch; `chordWrongMarks` has no attempt count). Drill B adds `drillQuestion` plus `drillLit`. Both satisfy AD-5. Also, "lit notes of a drill answer" are pitches only; the guitar's one-note-per-string `positions` (`placeLit`) has no home in practice, so the drill on guitar either writes `workspace.positions` (breaking "practice never writes the workspace") or places notes by choosing frets (breaking AGENTS.md).
- **Tightening:** Name the field: `practice.drill = {root, qualityIndex, attempts, lit: Pitch[], positions}` separate from Listen's question; state that note-toggle actions route by mode to workspace or `practice.drill`; the Listen flag does not apply to the drill pool.

### 5. Engine interface has no instrument (HIGH)
- **Units:** Sampler story vs every caller (Listen, Explore, circle chips, drill).
- **AD text:** AD-7 "play an ordered list ... **on an instrument**"; "with Samples the instrument picks the sample set ... in every section"; AD-12 "sound of the instrument that was last active."
- **Code reality:** `AudioEngine.play(pitches, mode)` has no instrument; `ENGINES: Record<Sound, () => AudioEngine>` is one engine per sound; callers in `useSessionActions.ts` pass nothing.
- **Divergence:** Sampler A adds `instrument` as a third `play` argument (all call sites change). Sampler B makes the engine subscribe to session or take an instrument at creation (breaks AD-7 "engine independent of UI", and `EngineContext` provides one engine). The circle page sits outside the instrument views: "last active" is session.instrument if the page does not change it, or a page-local value if it does.
- **Tightening:** `play(pitches, mode, instrument)`; `ENGINES` maps `Sound` to a factory that builds one engine handling both instruments internally. "Last active" means `session.instrument`, which the circle page never writes.

### 6. Not-ready, load trigger and fallback are undefined in behaviour (MEDIUM-HIGH)
- **Units:** Sampler story vs Listen/drill callers vs Status note story.
- **AD text:** AD-7 "loads lazily on first use ... reports not-ready while a set loads ... a failed set falls back to the synth for that instrument and shows a message ... treats `suspended` as not ready."
- **Code reality:** `AudioStatus` is `'idle'|'running'|'blocked'`; `Listen` plays on Next (`useSessionActions.ts:105`).
- **Divergence:** a `play` during loading is dropped (Listen's first question is silent, user must Replay), queued then played late (overlaps Replay), or played on the synth (sound changes mid-session). "First use" is a first play, a first Setup selection or a first instrument swap. Fallback is per-session sticky vs retried next play; the message lives in engine status vs React state (AD-6 forbids audio in React state, yet the UI must show it).
- **Tightening:** Add `'loading'` and `'failed'` to the status union; a play while loading is queued once (latest wins) and plays on load; the set starts loading on selection of Samples and on instrument change; failure is sticky until reload and exposed through `status()`/`subscribe`.

### 7. Picked chords have no register (MEDIUM-HIGH)
- **Units:** Builder story vs circle chip story vs voicing ranking.
- **AD text:** AD-10 pickers "construct a chord from a spelled root and a quality"; AD-12 "plays the root-position triad"; AD-8 ranking by "distance ... to the source chord's mean pitch."
- **Divergence:** Builder places the root in octave 4 (60 to 71); the chip places it nearest the piano window or range centre; ranking's "source mean pitch" is undefined for a chord with no lit notes, so guitar golden examples (the first voicing for a picked chord) differ by builder. B major vs C major roots at MIDI 59 or 71 changes the voicing order.
- **Tightening:** One `core` function `rootPositionPitches(root, quality, register)` with one default register constant in `core/` ("root within 60 to 71"); builder, chip and ranking source all use it.

### 8. Inversion semantics left to the reader (MEDIUM)
- **Units:** Stepper story (piano layout) vs guitar voicing-list story vs namer.
- **AD text:** AD-8 "root, 1st, 2nd, 3rd; a three-tone chord stops at the 2nd and no chord goes past the 3rd"; "tones above the bass keep their place, tones below move up an octave"; "bass is one of the chord's own tones."
- **Divergence:** "1st" is the second tone in list order (by degree) vs the next-higher tone by pitch; for 9th chords (5 tones) the namer can return a slash reading with the 9th or 5th in the bass that the stepper cannot reach, and stepping back from it is undefined. "Tones above the bass keep their place": the layout's starting pitches (source register) are not stated, so the piano and the guitar (generator bass filter, which falls back to all voicings when none has that bass) can show different inversions.
- **Tightening:** Inversion index n means the n-th tone in the quality's degree-ordered list; a bass from a namer reading outside indexes 0 to 3 displays as slash but the stepper starts from root position; the guitar shows a visible "no voicing with this bass" state instead of the generator's silent fallback.

### 9. AD-8 and AD-4 say "by role"; the code is positional, and Listen flag shape is open (MEDIUM)
- **Units:** Voicing generator and drill check vs spelling/explore/practice vs settings.
- **AD text:** AD-8 omission "decided by tone role, never by list position"; AD-13 "read from `VOICING_RULES` and tone roles"; AD-4 "one flag marks the qualities Listen practice may use".
- **Code reality:** `VOICING_RULES.droppableSteps: [2]` (step index), `generateVoicings` uses `steps.length > 3`; `spellChord` uses `CHORD_STEPS = [0,2,4,6]` by index; `explore.ts` `STEP_ROLES`/`STEP_LABELS` by index; `generateChordQuestion` takes `intervals[last]` as the span; `initialSettings.chordPool` is all of `CHORD_QUALITIES`.
- **Divergence:** The drill author reads `VOICING_RULES.droppableSteps` as the AD says and gets index 2, which happens to be the fifth in all 17 lists, hiding the bug until a table is reordered; the spelling author keeps `CHORD_STEPS` (sus2 spelled with a third's letter, wrong). Flag: `ChordQuality.listen?: boolean` vs a separate `LISTEN_QUALITIES` list; with the first, `chordPool` default stays 17 unless someone filters, so Listen draws sus and 9th chords.
- **Tightening:** Change `VoicingRules` to `droppableRoles: ['fifth']`, with the drill check reading it; list the files to convert (spelling, explore, voicings, practice). The flag is `listen: boolean` on every `ChordQuality` and `chordPool` default and `generateChordQuestion` both filter on it.

### 10. Sound key name and migration (MEDIUM-LOW)
- **Units:** Settings-storage story vs `index.html`/Setup story.
- **AD text:** AD-6 "stored under a new key name so a stale `synthesized` value ... is ignored once"; sound is `samples|synthesized`.
- **Code reality:** `KEYS.sound = 'accompa.sound'`; `Sound = 'synthesized'` only; `ENGINES` keyed by `Sound`.
- **Divergence:** No key name is given, so two stories pick different ones (and tests assert different ones). "Ignored once" is read as "delete the old key" vs "leave it and never read it". Whether a deliberate `synthesized` choice made under the new key persists is not said.
- **Tightening:** Name the key (`accompa.sound.v2`), state the old key is never read or written, and a stored `synthesized` under the new key is honoured.

## Considered and discarded
Role marker shapes and legend words for `ninth`/`fourth`/`sixth` (UX spine territory); sample range coverage for high pitches; the circle page's mode in the `Mode` union (follows from #5 and #1).
