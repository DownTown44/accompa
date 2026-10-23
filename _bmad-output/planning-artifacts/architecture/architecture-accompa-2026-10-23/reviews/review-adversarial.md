# Adversarial Review — ARCHITECTURE-SPINE.md (accompa)

Reviewer stance: find pairs of units one level down that obey every AD literally and still do not fit together. Sources: spine and PRD only. roadmap.md was not read.

## Verdict

**Not ready to build against as-is. Fix 6 blockers first.** The layering (AD-1) and the pitch-as-integer decision (AD-2) are sound. The shared-entity decisions are not. The spine fixes where code lives but never fixes the shape or owner of the entities that cross unit boundaries: current interval, current chord, voicing, spelled root, namer reading. It also contains one direct internal conflict (AD-8 ranking vs FR-18). Two parallel builders would each pass lint and the spine's own rules and still collide at integration.

## A. Incompatible-pair findings (each pair obeys every AD)

### B1. Pitch-only session cannot carry guitar position (guitar view vs session; free-play vs voicing editor)
- AD-2 and AD-5 say the session holds "the current interval or chord" and a view is a pure render. AD-2 makes the shared currency a MIDI number.
- The same MIDI pitch exists at up to 4 to 5 string/fret places on a guitar. FR-4 ("positions on the active instrument"), FR-10 (user clicks two specific notes), FR-16 (at most one note per string), and FR-19 (hand-edit by moving notes) all depend on *which* string and fret.
- Builder A (fretboard view) stores the click as `{pitch}` and renders all positions. Builder B (voicing editor) stores `{pitch, string, fret}` in a local component because AD-8 puts string/fret in the guitar voicing. Both comply. On swap guitar to piano to guitar, A re-renders every position and B loses its assignment. FR-10 on guitar cannot even say which of two same-pitch clicks the user meant.
- Gap: nothing says whether fret assignment is session state, view state, or derived. AD-5's "neither view owns musical state" is violated by B and cannot be checked.

### B2. Two owners of "current chord"; chord shape undefined (builder vs namer vs ear practice vs voicing)
- The chord can be authored as root + quality (FR-12), as a toggled pitch set (FR-12, FR-14), as a generated voicing (FR-16/17/21), as a hand-edited voicing (FR-19, "keeps naming the resulting chord"), and as a random chord from practice (FR-22, AD-11 `next chord`).
- AD-5 has one slot "current chord". Unit X (builder) stores `{rootPc, qualityId}`. Unit Y (free-play/namer) stores `pitches[]`. Unit Z (ear practice) writes its random chord into the same slot. Every one is lawful.
- Consequences: a practice round overwrites the chord the user built, which breaks the FR-15 carry-over promise. Hand-edit (FR-19) produces a pitch set that has no quality id, so "current chord" is now a different type than the builder's. Does the edited voicing's name feed back to the piano (a cycle)? Does the selected voicing (FR-21 on piano) replace the built pitch set, or sit beside it? AD-6 lists "voicing selection" in session without saying whether it is an index into a generated list (unstable when the fret-region/constraints change) or a value.
- Required: a single canonical `Chord` type, an explicit statement of which fields are source-of-truth vs derived, and separate slots (or a mode flag) for builder chord, practice chord, and selected/edited voicing.

### B3. Namer root rule vs inversions and spelling root (namer vs spelling vs piano voicings)
- AD-10: namer prefers the lowest sounding note as root. FR-21: inversions and spread voicings of the built chord, "naming" kept. A first-inversion C major (E G C) read by lowest-note-as-root yields E-rooted readings first (e.g. a nonsense Em(b6)); the user built C. A literal AD-10 namer and a literal FR-21 view disagree on the label of the very chord being built.
- AD-3 says root spelling comes from "the user's pick in the builder", default table otherwise. The namer's chosen root is a different thing from the builder's pick. Which root spells the tones when the namer output (root = bass) and the builder pick (root = C) differ? Two roots, no precedence. For toggled-notes free-play there is no pick, so the default table applies, and it produces D-flat vs C-sharp by table, not by the key of the reading chosen.
- Fix: namer returns `{rootPc, qualityId, bassPc}` readings (slash-chord model), ranking is explicit and deterministic (tie-breaks listed), and spelling takes the chosen reading, not a "user pick".

### B4. AD-2 "no note-name strings passed between modules" vs AD-3/AD-10 outputs and spelling inputs
- AD-3: spelling "turns pitches into labels", but a MIDI integer cannot encode C-sharp vs D-flat, nor B-double-flat in a dim7. Spelling therefore needs a spelled root (letter + accidental) as input, i.e. a note-name-like value that crosses modules. Either that value is a string (violating AD-2) or it is an unspecified structure ("SpelledRoot"). Two units will define two such structures.
- Intervals have no spelling rule. FR-4 shows "the two notes" of an interval, including random-root intervals (FR-9) and descending ones. AD-3's rule is only about chord tones by letter stepping. The practice unit will invent its own spelling for interval upper notes (e.g. tritone as F-sharp vs G-flat, always-sharp vs by-interval-name) while the chord unit follows AD-3. Piano view and fretboard may both call `core/spelling` yet get different answers depending on what context they pass.

### B5. Interval vs chord session shape, and direction (practice logic vs audio engine vs views)
- "Current interval" is undefined: `{rootPitch, semitones, direction}`, or `{pitchA, pitchB}`? FR-8 adds direction (asc/desc/harmonic), FR-10 gives two arbitrary clicked pitches (so an interval can be 0..>12 semitones, or descending by click order).
- AD-7: audio plays "a set of absolute pitches ... as a block, arpeggio or strum". A "set" has no order, but ascending vs descending arpeggio is order. Practice unit A reverses the list for descending and calls `arpeggio`. Audio unit B sorts ascending inside `arpeggio` for guitar-realistic strum. Both comply; descending intervals play ascending. Timing/tempo, note duration, overlap on replay (FR-3 unlimited replay: stop-then-play or layer?) and completion callbacks are unspecified.
- AD-4's single interval table has 12 entries; unison/octave (0, 12), compound intervals from FR-10 clicks, and tritone naming (A4 vs d5) are not covered, so the FR-10 namer and the FR-7 pool will disagree on whether 12 or 13 entries exist and on the tritone's name.

### B6. Random root needs instrument range; range is deferred (practice core vs views vs audio)
- FR-9 random root plus FR-8 descending. Core generates the next pitches (AD-11) but "piano keyboard range" and fret-region details are deferred as UX, while guitar range is a convention (E2 to 22 frets). The practice function in `core/` has no range parameter in the spine. Unit A picks MIDI 48..72; the piano view (built later by another unit) shows 3 octaves starting at F2; the fretboard cannot show pitches above its 22nd fret. Reveal (FR-4) then points at a note that is not on the active instrument. Range must be shared data in `core/`, not UX.

### B7. Who dispatches practice results (practice core vs reducers vs contexts)
- The diagram shows `Practice logic (core) --> Session`. Core cannot import `ui/` (AD-1), and reducers live in `ui/`. So core must define its own return shape and the reducer maps it, or the session type must live in `core/`. The spine does not say where the session/settings types live. Two builders will each define `SessionState` (one in `ui/`, one in `core/`).
- Reveal state (hidden/revealed) and mode (practice vs free-play vs chord builder vs chord ear practice) are not placed in settings or session. The same applies to the FR-22 chord-quality pool (settings context is listed as "interval pool, direction, root mode" only) and the fixed root value for FR-9 (mode is in settings, value location unspecified; the value can be in either context).
- FR-15 fret-region limit: a view-local control, or session? AD-5 says views own no state; AD-6 session does not list it. On swap it resets or persists depending on who wrote it.

### B8. Voicing generator vs ranker contract (the AD-8 split)
- "Generation: chord, instrument, tuning and constraints in, every playable voicing out, unranked." "Ranking orders by (a) template match, (b) closeness to the register of the source chord." The ranker needs: the source chord's pitches (generator did not return them), the template set, and a distance metric. Its signature is not given. Template matching is also ambiguous: exact shape match (fret pattern) vs pitch-class match. Generator authors will emit `Voicing[]`; ranker authors will want `ScoredVoicing` or a template tag on each voicing. AD-8 says "Naming and playback take the pitch list and ignore how produced", so the template tag cannot ride on the voicing. The ranker must re-derive template matches from the string/fret assignment, which only guitar voicings have.
- Piano voicings (FR-21, inversions/spread): generation "instrument, constraints" for piano has no defined constraints, no templates (AD-9 templates are fret-based), and `ranking (a)` is vacuous. A spread-vs-inversion ordering is unspecified, so the piano and guitar steppers (FR-21 "steppable the same way") will not share a stepper contract.

## B. Direct internal contradiction

### C1. AD-8 ranking order defeats FR-18
- AD-8 ranks lexicographically by (a) template match, then (b) register. FR-17 wants common shapes first, but FR-18 says a chord built high on piano maps to the nearest-register voicing, "not an open chord". With open shapes defined as fixed templates (AD-9), a high C chord still matches the open C template, so it ranks first under (a). The rationale line ("so a high chord surfaces high voicings first") is false for any quality that has an open shape. The ranking needs register as the primary key or a weighted score, or templates must be filtered by register first. Because ranking is "a pure function," this is a correctness bug in the rule, not an implementation detail. The Deferred section also leaves "how closest register is measured" open, which is the term the whole rule depends on.

## C. FRs lacking a governing AD (or with a mismatched one)

| FR | Gap |
| --- | --- |
| FR-4 / FR-9 | Interval note spelling and range (see B4, B6). Mapped only to AD-2/AD-4. |
| FR-10 | Pitch-only click loses position (B1); interval beyond 12 semitones. Map lists AD-2, AD-4 only. |
| FR-15 | Fret region limit state and role derivation. Mapped only to AD-5; the role (3rd, 5th, 7th) labels derive from AD-4 stacks but are not bound. Highlight root plus "all positions" needs a pitch-to-positions function in `core/` that no AD owns (it is a view of tuning, not a voicing). |
| FR-16 / FR-19 | Hand-edit is a state-mutation path not covered by AD-5/6: reducer actions for edited voicing, validity of an edited voicing (more than one per string, fret out of span), re-naming. Need an AD on voicing state ownership. |
| FR-18 | Needs a defined source-register notion; governed only by AD-8, which conflicts (C1). |
| FR-21 | Piano voicings share nothing in AD-9 and have no constraint definition (B8). |
| FR-11 | "Every note shown can be heard" implies the views emit a play command on a note click; no AD says who triggers (view vs session reducer) and whether audio is state-free on failure. |
| FR-12 | Chord definition with both quality and toggled paths (B2). Map: AD-3, 4, 10 only. |
| FR-22 | Chord pool in settings undefined (B7); randomness covered by AD-11 but not what "pool" persists. |
| FR-2 | Swap "at any time" includes mid-playback: stop semantics on swap not stated (AD-7 `stop` exists but nothing triggers it). |
| Persistence | `localStorage` settings schema has no version or validation rule; "read failures fall back" does not cover a parseable-but-stale shape after a pool entry is added or removed (AD-4 adds qualities by editing data). |

## D. ADs whose Rule is not enforceable (or not as written)

- **AD-2:** `number` is used for MIDI pitch, pitch class, and interval alike, so TypeScript cannot catch passing a pitch class where a pitch is needed. "No note-name strings stored, passed or compared" has no mechanism (and is contradicted by B4). `n mod 12` in JS is wrong for negative values (`-1 % 12 === -1`); needs a mandated helper. Suggest branded types plus a lint/grep rule.
- **AD-3:** "No component spells notes itself" is not lintable as written. Suggest a restricted-string-literal rule or a convention test that no `ui/` file contains note-letter tables. The default table covers only 5 pitch classes and omits A-sharp/D-sharp/G-sharp, and handles D-flat/C-sharp inconsistently for minor keys; a pitch class with no entry has no defined fallback.
- **AD-4:** "UI lists, practice pools, namer and generator derive from" the tables is untested. A cheap test (no interval/quality literals outside `core/theory`) would make it enforceable.
- **AD-5:** "A view is a pure render" is an aspiration. Enforce by convention: views take props only, no `useState` for musical data, no `useReducer`. Needs a lint or review checklist.
- **AD-6:** "Playing a sound is a command ... never React state", but audio failure must "surface as a UI message" (Errors convention) and buttons will want a playing/stopped state. This is audio-derived state in React, so the rule and the convention conflict. State the exception (e.g. one `audioStatus` field).
- **AD-7:** "Components call only that interface": enforceable only with a lint rule banning `AudioContext` and `audio/` internals imports from `ui/`. Not stated. The interface itself is not specified (signature, ordering, timing, async/promise), so "one interface" is not enough to build two sides against.
- **AD-8:** "Closeness of register" is unspecified (Deferred). A ranking rule without a measure is not testable. Also "every playable voicing" is not testable until span and drop rules exist; these are deferred but they are inputs to the generator contract, not internal parameters.
- **AD-10:** "Ranked, preferring lowest sounding note" is a single tiebreak; two namers can order other readings differently, and each surface "may list the rest," so the list order varies. Reading type is undefined.
- **AD-11:** Enforceable with `no-restricted-properties` on `Math.random` and `Date.now`, but the spine says only "never calls Math.random". Add the lint rule explicitly (AD-1's lint is mentioned; AD-11's is not).
- **AD-1:** enforceable, but "uses no browser APIs" needs an actual rule (`no-restricted-globals`, TS `lib` without DOM for `core/`). Without `tsconfig` separation, `core/` will compile with DOM types.

## E. Smaller observations

- AD-6 `Binds: FR-1 to FR-22 (UI)` and AD-1 `Binds: all` dilute the Binds field; it is not a useful traceability signal for those two.
- Structural seed lacks a home for shared domain types (`Chord`, `Voicing`, `Reading`, `Session`). Put them in `core/` explicitly. Otherwise `audio/` ("core types only") will duplicate them.
- Tests: "mirroring core/" plus "light component tests" with no location; fine, but the reducer and AD-6 session transitions (swap preserves chord) are exactly where B1/B2 will break and have no named test.

## Top recommendations (in order)
1. Add an AD defining the canonical session shape: `Interval`, `Chord`, `Voicing` types in `core/`; owners (builder chord vs practice chord vs selected/edited voicing); where fret assignment lives; reveal/mode/pool/fixed-root fields.
2. Resolve AD-8 ranking vs FR-18 (register-first or scored), and give the ranker a signature plus the register metric.
3. Rework AD-3/AD-10 together: namer returns slash-chord readings with a root; spelling takes a spelled-root structure (not a string), and add an interval spelling rule.
4. Specify AD-7's interface: ordering, timing, stop/replay semantics, and the allowed audio-status exception to AD-6.
5. Move instrument ranges (piano span, guitar tuning/fret count) into `core/` shared data.
6. Add enforcement mechanisms (branded types, lint rules, a convention test) for AD-2, 3, 4, 5, 7, 11.
