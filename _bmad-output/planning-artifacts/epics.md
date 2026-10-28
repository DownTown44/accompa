---
status: final
stepsCompleted: [1, 2, 3, 4]
phase2: in-progress
phase2StepsCompleted: [1, 2, 3]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-accompa-2026-10-22/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-accompa-2026-10-23/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-accompa-2026-10-23/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-accompa-2026-10-23/EXPERIENCE.md
---

# accompa - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for accompa, decomposing the requirements from the PRD, UX Design and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Guitar fretboard and piano keyboard views, both available from day one.
FR2: User can swap between views at any time. Visuals are minimal and elegant, not realistic.
FR3: Listen mode plays one interval (two notes) on request. Replay is unlimited.
FR4: Reveal shows the interval name, the two notes, and their positions on the active instrument.
FR5: Next plays a new interval.
FR6: Optional guess. The user can click an interval answer: a correct answer advances to the next interval, a wrong answer stays marked and the same question stays. Reveal always shows the answer with no penalty. No score counter.
FR7: User selects which intervals are in the pool, from the 12 semitone intervals.
FR8: Direction: ascending, descending, or harmonic (both notes together).
FR9: Root note: random or fixed.
FR10: In Explore, the user clicks any two notes on the active instrument. The app names the interval and plays it.
FR11: Every note shown can be heard. v1 uses synthesized sound, with a sound choice in the setup panel. Sampled instruments are Phase 2.
FR12: In Explore, the user builds a chord on the keyboard by clicking individual notes. Each clicked note sounds and is marked, the root is marked differently (lowest note by default, the user can change it), and the app names the chord live and shows the intervals from the root.
FR13: User plays the chord as a block or as an arpeggio.
FR14: Chord naming in Explore: the user toggles any notes and the app names the chord.
FR15: Swapping to the fretboard keeps the chord and shows it as a playable voicing in the register of the source chord (FR16, FR18), with the root highlighted and other notes marked by role (3rd, 5th, 7th). Swapping back keeps the chord.
FR16: User can find a playable guitar voicing for the chord and change it. A voicing is a specific set of fretted notes, at most one per string, with unused strings muted.
FR17: The app generates every playable voicing (reachable fret span, essential chord tones present) and the user steps through them. Common shapes (open, barre) rank first. Rules: max fret span 4 frets; open strings do not count toward the span; root and 3rd always present; 7th mandatory on seventh chords; the 5th required on triads and droppable only on seventh chords; at most four fingers (a barre at the lowest fretted fret counts as one finger unless an open string lies inside it or it includes neither the lowest nor the highest sounding string); an open string only when every fretted note is at or below fret 5; no fret above 12; no muted string between sounding strings; register distance is the distance between mean pitches (AD-8), grouped in buckets of 6 semitones, then common-shape match, then more sounding strings, then smaller fret span, then fewer distinct fretted frets, then exact distance. (As built; reconciled 2026-10-27.)
FR18: Voicings match the register of the source chord. A chord built high on the piano maps to the nearest-register guitar voicing, not an open chord.
FR19: User can hand-edit a voicing by moving notes on the fretboard. The app keeps naming the resulting chord.
FR20: User can play the voicing (strummed and as an arpeggio) to hear it.
FR21: WITHDRAWN. Voicings are guitar-only in Phase 1. Piano voicings and inversions are Phase 2. (Listed for numbering continuity; no story.)
FR22: Chord ear practice: same listen, replay, optional guess and reveal flow as intervals (FR3 to FR6), with a user-selected pool of chord qualities. No score counter.

Chord scope (Slice 1B): triads (major, minor, diminished, augmented) and 7ths (maj7, dom7, min7, m7b5, dim7), root position.

### NonFunctional Requirements

The PRD has no NFR section. These are derived from its Constraints, Principles and Out of Scope, plus the architecture and UX spines. Confirm or correct.

NFR1: Platform: current Chrome, Edge, Firefox and Safari on a laptop. Landscape tablets at about laptop width may work but are not designed for. No mobile, no portrait, no small-screen reflow. (PRD Constraints; UX Responsive)
NFR2: Client-only static app. No backend, no accounts, no network calls. Runs locally on the Vite dev server and can be hosted statically later without change. (Architecture)
NFR3: Audio is synthesized with the browser-native Web Audio API, no audio library. Audio never breaks theory features: failures surface as a UI message. (PRD Constraints; AD-7; Errors convention)
NFR4: Audio starts on the first user gesture with no enable-sound screen. A suspended AudioContext is treated as "not ready" and resumed on the next gesture. (AD-7)
NFR5: Notes sound on pointer-down, so click-to-sound feels immediate. (UX Accessibility, accepted limits)
NFR6: Persisted state is limited to sound choice, theme (with manual override) and interval pool, in localStorage. Direction, root mode, chord, voicing and current question are not persisted. A read failure falls back to defaults. (AD-6)
NFR7: Accessibility floor: keyboard-first for Listen, mode and instrument switching, transport and voicing stepping; visible focus ring on every control; roles never conveyed by color alone; respects prefers-reduced-motion; polite live regions; screen-reader support is best-effort. (UX Accessibility Floor)
NFR8: Quality gate: Vitest unit tests on `core/` (logic and risk live there), light component tests, no end-to-end suite. (Architecture Tests convention)
NFR9: Dependency boundaries: `core/` imports nothing from `ui/` or `audio/` and uses no browser APIs, enforced by an import-boundary check. (AD-1)
NFR10: Determinism: `core/` never calls Math.random; randomness is an injected function so tests are seeded. (AD-11)
NFR11: `core/` functions are total over valid input and return empty results, not exceptions, when no voicing exists. (Errors convention)
NFR12: Exact dependency versions are pinned in package.json per the architecture Stack table. (Architecture Stack)

### Additional Requirements

- **Starter template:** none specified. Epic 1 Story 1 is a manual Vite + React + TypeScript project setup using the pinned versions below, not a CLI starter.
- Stack (exact, pinned): TypeScript 7.0.2; React and react-dom 19.3.1; @types/react and @types/react-dom 19.3.0; Vite 8.3.5; @vitejs/plugin-react 6.1.2; Vitest 5.0.5; @testing-library/react 16.3.3; happy-dom 21.0.4 as component-test DOM (jsdom 30 needs Node 22.22+; local Node is 22.13.1). Add a linter only after checking TypeScript 7 support (typescript-eslint supports TypeScript below 6.1).
- Structure: `src/core/` (theory, spelling, voicing generation and ranking, shape templates), `src/audio/` (engine interface and synth), `src/ui/` (components, contexts, reducers, instrument views), `tests/` mirroring `core/`.
- AD-1: dependency direction, with an import-boundary lint rule.
- AD-2: pitch is an integer. MIDI note number as branded `Pitch`, `PitchClass` and `Interval` types. No note-name strings in `core/`. A spelled note is a struct of integers (`letter` 0 to 6, `accidental` offset).
- AD-3: one `core/spelling` module. Chord tones spelled by letter stepping from the spelled root. Default root table (Db, Eb, Gb, Ab, Bb flat; C#, F# sharp). Six semitones is always A4.
- AD-4: one table per music concept. Interval and chord-quality definitions live once in `core/theory`; UI lists, pools, namer and voicing generator derive from them.
- AD-5: the session model is instrument-independent, with two single-writer parts. Workspace (interval, chord, selected voicing per instrument) is written only by builder, free-play and voicing editing. Practice (question, reveal state, pool) is written only by practice rounds. Practice never writes to the workspace. Active instrument is separate. Types live in `core/model`.
- AD-6: React Context plus reducer, split into a settings context and a session context. Reducers are pure and live in `ui/`. Playing sound is a command to the audio engine, never React state.
- AD-7: one audio engine interface that plays an ordered list of absolute pitches as a block, arpeggio (list order) or strum (bass to treble), plus stop. The engine owns timing. First implementation is pure Web Audio synthesis; sampled instruments replace it later behind the same interface.
- AD-8: a voicing is an ordered pitch list, bass to treble; a guitar voicing adds per-string frets or muted. Generation (pure, unranked) is separate from ranking (pure). Ranking key is register distance (mean pitch difference, with bucket width as a parameter); template match breaks ties within a bucket. Voicing parameters are tunable constants in one place in `core/`.
- AD-9: common shapes are curated data in `core/`. Movable shapes are root-relative, open shapes are fixed, non-matching voicings are listed after matches. A test asserts every template yields exactly its chord's pitch classes. Each new chord quality needs templates added by hand.
- AD-10: the chord namer takes pitches and returns all ranked readings (root, quality, optional bass), lowest note as root first. It is the only path to a chord name in Phase 1. Choosing an alternative reading sets the root and spelling.
- AD-11: injected randomness (next interval, random root, next chord).
- Instrument parameters: guitar is six strings in standard tuning (E A D G B E) with 22 frets; tuning is a parameter to core functions. Each instrument's pitch range lives in one `core/instruments` module (piano default MIDI 36 to 96). Practice logic picks random roots so every note fits the active instrument's range.
- MIDI input is later: leave a seam so a note-on can drive the same click-to-sound path.
- Voicing generation must tolerate hand-edits (empty result is valid).

### UX Design Requirements

UX-DR1: Design tokens. Implement the DESIGN.md color tokens (light plus `-dark` twin), typography ramp (Palatino stack, italic everywhere except key-hint), rounded, and spacing tokens as CSS custom properties. Theme follows the system setting with a manual System / Light / Dark override.
UX-DR2: Layout shell on the 1280 x 800 canvas: Mode strip (min 84px, wordmark, Listen / Explore tabs, Piano|Guitar toggle pushed right, Setup opener, Help hint), then readout, role legend, instrument, control row. One screen, no scrolling, no reflow.
UX-DR3: Mode tab and Instrument toggle share the single selected-state treatment (accent fill, on-fill text, weight 600) and expose a selected role to assistive tech. `M` switches mode, `I` swaps instrument; the instrument crossfades.
UX-DR4: Piano keyboard component: three octaves, `[` and `]` shift one octave, octave labels (C3, C4, C5), black keys win hit-testing, dark-theme key-edge on black keys, click sounds on press and toggles lit on release. Lit-notes-offscreen Status note (`◀ 2 notes lit` / `3 notes lit ▶`).
UX-DR5: Fretboard component: surface slab, 2px fret wires, 7px nut, string names left, fret numbers below, open-string markers (role shape in a ring at the nut) and muted `x` markers. Clicking a fret sounds and toggles that note, at most one per string in a voicing.
UX-DR6: Role marker shapes plus color: root (ringed circle), 3rd (diamond), 5th (square, green), 7th (triangle), no-role small ink dot. 1.8px ink outline, minimum 18px. On piano keys, an 80% role tint plus the marker.
UX-DR7: Readout component: chord or interval name (84px; 56px for the Listen question), live updating. The first reading is large and alternatives are small clickable italic text. Clicking an alternative changes name and root. Empty, single-note and unresolved states per the State Patterns table.
UX-DR8: Role legend under the readout (`root C`, `3rd E`, `5th G`, `7th`) updating with the chord; lists only the root for unresolved sets and is absent for an empty chord.
UX-DR9: Action button component with a key-hint cap and a primary variant (apricot). One primary per row. Explore: Play (`Space`, an arpeggio low to high), Block (`Enter`, primary). Listen: Play again (`Space`), Reveal (`Enter`), which becomes Next after Reveal (`Enter` again).
UX-DR10: Interval button row (12 buttons, m2 to P8, keys `1`-`9`, `0`, `-`, `=`). Wrong state: wrong fill, inset 2px muted ring, struck-through label, `aria-disabled`, accessible name like `m3, tried`. Pool-excluded buttons are disabled and at least 55% opacity. Correct advances and auto-plays.
UX-DR11: Voicing stepper `◀ Voicing 1 of N ▶` (40 x 40px arrow targets, Left / Right keys, no wrap, inert end arrow shown as `·` with `aria-disabled`, with the focus-move rules). Hidden when there are fewer than two notes or no voicing.
UX-DR12 (dropped with Story 4.2, sprint change proposal 2026-10-26): Fret-region bar: drag across fret numbers to set the region; quiet `Clear fret region` button outside the track (hit area at least 28px, disabled when the region is the whole neck); stepper recomputes for the region.
UX-DR13: Setup panel: 560px non-modal floating overlay under the strip at the right; `P` or the gear Setup opener toggles it, `Esc` closes and returns focus to the opener. Contains pool chips (m2 to P8), segmented controls for Direction, Root, Sound and Theme, and setup labels associated with their controls.
UX-DR14: Pool chip behavior: on/off carried by fill, text color and weight (no check glyph); the last ticked chip cannot be unticked (`aria-disabled`, focusable, non-colour cue, live hint `Keep at least one interval.`).
UX-DR15: Setup opener (gear, 38px circle, `aria-expanded`, accessible name `Setup`) and Help hint (`?` circle that reveals the shortcuts list on hover or focus, `?` toggles, `Esc` dismisses).
UX-DR16: Status note component for these quiet, never-modal messages: `No voicing fits here. Try widening the region.`, `Press any key to wake the sound.`, offscreen-lit indicator, `Notes cleared. Undo` with an Undo button.
UX-DR17: Keyboard shortcut system per the Key map: ignores Ctrl/Alt/Meta (AltGr exception), `[` `]` match by key or code (Hungarian layout), Space and Enter ignore auto-repeat, shortcuts yield to focused tab/radio/chip/button, and pointer clicks outside the Setup panel return focus to the instrument.
UX-DR18: Focus ring: 2px ink outline with 2px offset, drawn outside the control on `:focus-visible` for every focusable control, as an element (not box-shadow) on SVG keys and frets. Focus order as specified in EXPERIENCE.md.
UX-DR19: Live regions (polite): Readout chord name (debounced 300 to 500 ms), voicing stepper changes, guess feedback and Reveal, audio-blocked / no-voicing / notes-cleared notes, pool hint.
UX-DR20: Motion: soft 120 to 200 ms fade for note light-up and an instrument crossfade, all instant under `prefers-reduced-motion`.
UX-DR21: Listen state patterns: waiting (`Which interval?`), wrong (`m3 is not it — try another.`), right (`P5. Next interval is playing.`), revealed (notes lit, name shown, Next appears, root marker plus no-role dot, one guitar position per note). Switching to Explore and back keeps the same question and wrong marks; changing pool, direction or root applies from the next question.
UX-DR22: Explore state patterns: empty prompt `Select notes to build a chord`, single note, unresolved set (lowest note keeps root marker, others get no-role dots), multiple readings, `R` then click sets root, `Esc` clears notes with Undo (button only).
UX-DR23: Voice and tone: quiet, short, sentence case, no exclamation marks, no scores, no praise, no shape labels. Names come only from the spelling module.
UX-DR24: Forced-colors robustness: build real buttons, groups and outlines (not span-built controls with box-shadow rings).
UX-DR25: Chord ear practice UI (Flow 3): reuse the Listen pattern with chord-quality answer buttons; layout and keys for chord qualities are set when slice 1B practice is built.

## Phase 2 Requirements Inventory

Added 2026-10-28 from the PRD Phase 2 section, the UX spines and the architecture spine (all updated 2026-10-28). Items marked amended or superseded replace the Phase 1 wording above for Phase 2 work; the Phase 1 text stays as the record of what was built.

### Phase 2 Functional Requirements

FR23: Sampled instruments: separate sample sets for piano and for guitar, chosen by the Sound setting in the setup panel (Samples or Synthesized). Samples are bundled, no network calls; the synthesized sound stays as a choice. (AD-7)
FR24: Eight chord qualities are added (sus2, sus4, 6, m6, add9, 9, maj9, m9), named, spelled and shown with roles in Explore like the existing nine, 17 in all. Names still come only from `nameChord`. (AD-4, AD-3, AD-10)
FR25: Guitar voicings exist for every new quality, using an omission rule for chords above four tones: the fifth is the only droppable tone, only on chords of more than three tones; root, third or sus tone and every extension are required. Span, finger and register rules stay. (AD-8)
FR26: The eight new qualities are Explore-only: Listen chord practice keeps its nine original qualities. (AD-4 Listen flag)
FR27: In Explore the user puts a chord in root position, 1st, 2nd or (four or more tones) 3rd inversion on either instrument; the chord is named as a slash chord. No piano voicing generator and no inversion ear practice. (AD-5, AD-8, AD-10)
FR28: In Explore the user picks a root and a quality; that chord lights in the workspace, is named, plays as block or arpeggio, and carries to the guitar as a voicing with the stepper. (AD-8, AD-10 picker)
FR29: In the Chord drill the app shows a chord name and the user builds it on the active instrument. (AD-13)
FR30: A Try button checks the lit notes and says right or wrong; there is no automatic check as notes are lit. (AD-13)
FR31: Reveal shows the answer at any time with no penalty; no score, no streak, no praise.
FR32: Navigation holds four sections (Listen, Explore, Chord drill, Circle of fifths) in a collapsible side rail, collapsed by default, state kept between sessions; it replaces the two-tab mode strip.
FR33: A Circle of fifths page: major keys outside, relative minors inside, selected key in the centre, neighbours and relative highlighted; choosing a key (minor: Natural / Harmonic / Melodic) shows its seven Roman-numeral triads, each clickable to hear. No instrument, progressions, key signature or ear training. (AD-12)

Amended earlier FRs: FR11 (sampled instruments now delivered by FR23), FR12 (chord library is FR28), FR21 (withdrawn; inversions delivered by FR27 on both instruments), FR22 (unchanged, Listen pool stays the nine flagged qualities).

### Phase 2 NonFunctional Requirement changes

Amended (give exact replacement text):
NFR2 (amended): Client-only static app. No backend, no accounts, no third-party requests. Bundled same-origin static files (the sample sets) may be fetched. Runs locally on the Vite dev server and can be hosted statically later without change. (AD-7, PRD FR-23)
NFR3 (amended): Audio uses the browser-native Web Audio API with no audio library. The default sound is bundled samples (piano on the piano, guitar on the guitar); a synthesized sound stays as a choice. Audio never breaks theory features: a sample set that fails to load falls back to the synth for that instrument for the session and shows a UI message. (AD-7; Errors convention)
NFR4 (amended): Audio starts on the first user gesture with no enable-sound screen. The AudioContext is created or resumed synchronously inside a click or keydown handler; a suspended context is "not ready" and resumes on the next gesture. (AD-7)
NFR6 (amended): Persisted state, each under its own localStorage key and read synchronously before first render: sound (`samples` or `synthesized`, default `samples`, key `accompa.sound.v2`; the Phase 1 key `accompa.sound` is never read or deleted), theme (with manual override), interval pool, Mark misses (default on) and rail collapsed (default collapsed). Direction, root mode, chord, voicing, inversion, the circle page's key, the drill question and the current question are not persisted. A read failure falls back to defaults. (AD-6)
NFR7 (amended): Accessibility floor: keyboard-first for Listen, instrument switching, transport, voicing and inversion stepping and the drill; section switching is by Tab and Enter or Space on the rail; visible focus ring on every control; roles never conveyed by colour alone (shape plus colour for seven roles and the no-role dot; drill wrong note by cross shape); respects prefers-reduced-motion; polite live regions; builder, circle and note toggling are pointer-first but their controls are Tab-reachable buttons; screen-reader support is best-effort. (EXPERIENCE Accessibility Floor)
NFR8 (amended): Quality gate adds: a test that every shape template yields exactly its chord's pitch classes (AD-9); a `core/keys` test that for all 12 keys and 4 scales `nameChord` of each chip's pitches returns the chip's pitch class and quality as the first reading, and the chips' spelled letters and accidentals are asserted separately against golden examples (AD-12); golden examples for new-quality voicings confirmed by Apor before build (AD-8).
NFR9 (amended): `core/` imports nothing from `ui/` or `audio/`; `audio/` imports `core/` types only; the Phase 2 modules `core/keys` and the drill check live in `core/` and stay pure. (AD-1, AD-12, AD-13)
NFR10 (amended): The drill's random chord (any of 17 qualities, 12 roots) and every Phase 2 random choice take an injected `random`. (AD-11, AD-13)
NFR12 (amended): No dependency is added in Phase 2; samples are static assets.
Unchanged: NFR1, NFR5, NFR11.

New:
NFR13: Sample sets are same-origin static assets, one per instrument, kept in memory; the set for the active instrument loads at startup and again on instrument change. A note played while its set loads goes through the synth, so a click is never silent. (AD-7)
NFR14: The sample format is one all four target browsers play, and re-encoded to a compressed format; format, encode settings and asset location are chosen in the sampled-sound story. (Assets and Licences; Open items)
NFR15: Licence duties: Salamander Grand Piano V3 (CC-BY 3.0, public-domain claim of 2022-03-04 unconfirmed) is credited to its author in the app and in the repo; FreePats Nylon-String Acoustic Guitar is CC0, credited as courtesy. (Assets and Licences)
NFR16: Sample load time and bundle size must not block theory features or the first click (sample source, size and load time belong to the sampled-sound story; no numeric budget is set anywhere). (PRD open question; EXPERIENCE open items)
NFR17: Instrument range: engine range stays MIDI 36 to 96; the drill and practice pick random roots so every note fits the active instrument. (Instrument parameters convention)

### Phase 2 Additional Requirements

- Stack: no new dependency; Phase 2 adds only static assets (under `public/samples`, location settled in the sampled-sound story). Structure adds `core/keys`, a drill-check module and `audio/` sampler. (Stack; Structural Seed)
- AD-3 amended: spelling is driven by tone degree (2nd or 9th +1, 3rd +2, 4th +3, 5th +4, 6th +5, 7th +6); a chord's root is a spelled note (letter and accidental), carried by namer readings and pickers alike; root spelling comes from the namer reading, the user's root change or a picker's explicit choice, else the default table; no double accidentals (twin rule).
- AD-4 amended: a quality is a list of tone records (semitones as pitch-class offset 0 to 11, degree 1/2/3/4/5/6/7/9, role root/third/fifth/seventh/ninth/fourth/sixth), ordered by degree; shapes, legend words and spelling read the tone record, never list position; 17 qualities; a Listen flag marks the original nine and derives Listen's pool and the `chordPool` default; builder and drill use all 17.
- AD-5 amended: workspace gains optional `bass` (pitch class of one of the chord's tones; absent = root position), pruned when the lit notes change by hand or no longer contain it; positions, voicing and inversion survive an instrument swap. Practice gains the drill's own slot (asked chord, attempt count, lit `pitches` and `positions` via `placeLit` and `pitchesOnString`); the drill never reads or writes Listen's questions or the workspace; the circle page's state is page-local and writes neither part.
- AD-6 amended: settings context adds mark misses and rail collapsed; persisted keys per NFR6; sound is `samples` or `synthesized`, default `samples`, stored under `accompa.sound.v2`.
- AD-7 amended: `play` takes the instrument; a sampler engine sits beside the synth behind the same interface; Sound picks the engine and the instrument picks the sample set (Synthesized ignores it); engine status idle, loading, running, blocked or failed shown in the Status note; synth fallback per NFR3; nearest sample shifted for in-between pitches; the circle page passes the last active instrument.
- AD-8 amended: generation takes an optional bass; `rootPositionPitches(root, quality)` (tones ascending, root in C4 to B4) places every picked chord (builder, circle chips, drill) and gives the ranking's source mean pitch; the omission rule (fifth only droppable, only above three tones; sus drops nothing; decided by tone role); fuller voicings rank first; inversions numbered by tone order (triad stops at 2nd, none past 3rd); guitar uses a strict bass filter with no fallback for an explicit inversion, root position keeps lowest-note preference with fallback; piano uses one pure layout function (tones below the bass move up an octave) applied once and stored in `pitches`; the inversion stepper works for any named chord; golden examples confirmed by Apor.
- AD-9 amended: templates are optional per quality; the eight new qualities ship without templates (generated voicings only).
- AD-10 amended: readings carry spelled root, quality and optional bass (slash chords); pickers (builder, circle chips) may bypass the namer for the label; a picked or stepped chord's lit notes still pass through the namer for the readout.
- AD-12 (new): `core/keys` is pure: `circleOfFifths()` returns 12 positions (major tonic, derived relative minor, two neighbours; F sharp major pairs with D sharp minor); `diatonicTriads(key)` returns 7 entries (Roman numeral derived from quality: upper case for major and augmented, lower for minor and diminished, with degree sign or plus); keys are major, natural, harmonic or melodic minor; the namer consistency test compares pitch class and quality only, and spelling is asserted against golden examples in the keys tests; chip click plays the root-position triad with the last active instrument; selected key and scale are page-local, not persisted; page opens on C major.
- AD-13 (new): the drill's check is a separate pure `core` function: right when every required tone of the asked chord (AD-8 omission rule from `VOICING_RULES` and tone roles) is lit and no tone outside the chord is lit; octave, voicing, inversion and doublings do not matter; an omitted fifth counts; it names nothing and is not built on `nameChord`; question pool is all 17 qualities and 12 roots via injected random, not selectable in Setup; after the second miss with Mark misses on, lit notes outside the chord are marked.
- Assets and Licences duties: credit Salamander Grand Piano V3 author in the app and repo until the public-domain claim is confirmed; re-encode piano samples to a compressed format; FreePats guitar CC0 credit as courtesy; both bundled and loaded lazily.
- Code to migrate to tone records (one bullet each): `STEP_ROLES` in `src/core/explore.ts`; `CHORD_STEPS` in `src/core/spelling.ts`; `VOICING_RULES.droppableSteps` in `src/core/voicings.ts`; span from `intervals[last]` in practice; `DEGREE_LABELS` in `src/core/theory.ts`; `chordPool` default in `src/core/model.ts` (becomes the Listen-flagged nine); `ChordReading.root` and `ReadingChoice.root` in `src/core/chords.ts` and `src/core/model.ts` (pitch class becomes spelled note, with the `SpelledNote` type; Story 10.1 owns it); `AudioEngine.play` signature in `src/audio/engine.ts` (gains the instrument) and `ENGINES` in `src/audio/engines.ts` (keyed by Sound only, now Sound plus instrument).
- Open items to settle in stories: piano licence confirmation; compressed format and encode settings; sample asset location.

### Phase 2 UX Design Requirements

Tag key: NEW, AMENDS UX-DRn, SUPERSEDES UX-DRn.

UX-DR26 (SUPERSEDES UX-DR2; amends UX-DR1): Layout shell: a full-height side rail left of the body (64px collapsed, 200px open, radius 14px, surface fill, no border), no top bar; body padding 20px 56px 44px; one screen, no scrolling at 1280 x 800. The instrument's top edge need only stay put within a section (rule changed). New tokens: rail, role-ninth/fourth/sixth (light and dark), rail-label, chord-chip, chip-label, key-hint-small, rounded cell and rail-item, spacing for rail, cells, chips, circle.
UX-DR27 (NEW): Rail collapse: opens collapsed on first run; the chevron beside the wordmark toggles it by click or keyboard (names `Expand navigation` / `Collapse navigation`, `aria-expanded`); no hover expansion; state persisted (NFR6). Collapsed shows the italic `a` and icons only; open shows `accompa` and icon plus label.
UX-DR28 (SUPERSEDES UX-DR3 for the mode tabs): Rail items: Listen, Explore, Chord drill, Circle of fifths; 44px, real buttons, one selected (accent fill, on-fill text and icon, weight 600), `aria-current="page"`; collapsed label hidden visually but still the accessible name; clicking keeps the instrument and the workspace; focus stays on the clicked rail item after a pointer click. Explore is the default section on open.
UX-DR29 (SUPERSEDES UX-DR3 for the Instrument toggle placement, AMENDS UX-DR3): Piano|Guitar toggle moved to the rail bottom: vertical pill, two 36px segments with icons (labels when open), same selected treatment, `I` still swaps and crossfades; hidden on the Circle of fifths where `I` does nothing; the choice is kept for other sections.
UX-DR30 (AMENDS UX-DR15): Setup opener (cog, 30px circle) and Help hint (`?`, 30px circle) sit side by side at the rail bottom below a divider, in every section; opener name `Setup`, `aria-expanded`, open state ink glyph with 2.4px stroke and the same chip fill; the shortcuts list opens away from the rail edge and stays open while hovered.
UX-DR31 (NEW): Rail icons: nine glyphs, soft-fill style (1.5px round-cap outline plus about 18% fill of the same colour, 24px, `aria-hidden`): headphones (Listen), compass (Explore), stacked notes (Chord drill), circle of fifths (outer ring, inner ring, four dots), piano, guitar, cog (eight teeth, small centre hole, no rays), `?`, plus the chevron. Glyph shapes are placeholders refined at build.
UX-DR32 (AMENDS UX-DR17): Key map: `M` removed (no shortcut for section switching); drill column added (`Space` plays what is lit, `Enter` Try then Next, `R` Reveal, `Esc` closes panel or hint else clears the lit notes); `Left`/`Right` and `[`/`]` rules; `I` does nothing on the Circle; `P` and `?` work in all sections; `Space`/`Enter` yield to any focused button, so rail items, root cells, quality chips, wedges, chord chips and scale pills always take them as activation; pointer clicks outside the Setup panel return focus to the instrument except in the rail.
UX-DR33 (AMENDS UX-DR18): Focus order: rail (chevron, four items, Instrument toggle, Setup opener, Help hint; wordmark not a stop) then section content (Explore: readout alternatives, steppers, instrument as one stop, Play and Block, root cells, quality chips, Undo; Listen: instrument, actions, interval row; drill: instrument, Play, Try, Reveal; Circle: major wedges then minor ring clockwise from top, scale picker, chord chips) then the Setup panel when open.
UX-DR34 (AMENDS UX-DR21): Listen block height: the Listen readout block is its own shorter height (about 176px: question, hint and legend rows) so the instrument is about 250px tall at 1280 x 800 (was 162px); Explore keeps its 238px block and about 300px instrument. DONE: shipped in commit 208ff11. Check Listen after any change to PianoKeyboard, Fretboard or the readout block.
UX-DR35 (AMENDS UX-DR5): Fretboard position markers: decorative inlay dots at frets 3, 5, 7, 9 and two at 12, about 18px across, muted at about 35% opacity, centred between wires, drawn under strings and role markers; not interactive, not announced.
UX-DR36 (AMENDS UX-DR6): Role shapes: add 2nd or 9th regular pentagon (lilac), 4th flat-top hexagon (teal), 6th five-point star (inner radius about 48%, drawn about 15px radius vs 13px; straw green); all with 1.8px ink outline, at least 18px; piano keys keep an 80% role tint plus marker; shape separates 9th from 7th (contrast 1.10 light / 1.14 dark); dark values computed but not viewed. Markers read the tone record, not list position.
UX-DR37 (AMENDS UX-DR8; UX-DR7): Role legend and readout words per role (`root C`, `3rd E`, `5th G`, `7th B`, `9th D`, `4th`, `6th`), one entry per role present; the readout reads a slash chord with an inversion (`C major / E`) and steps its type down for long names.
UX-DR38 (NEW): Root cell row: 12 cells, 50px squares, radius 11px, gap 4px; the seven naturals are one cell (name at 21px); the five two-spelling roots (C sharp/D flat, D sharp/E flat, F sharp/G flat, G sharp/A flat, A sharp/B flat) are one cell cut by a top-right to bottom-left diagonal hairline, sharp in the upper-left, flat in the lower-right at 15px, each half its own button (`C sharp`, `D flat`); selected half or whole cell takes accent fill and weight 700; pointer-only; selected state exposed as pressed.
UX-DR39 (NEW): Quality chips: 17 chips, 58px wide, gap 5px, in four labelled groups on one line (Triads: maj, min, dim, aug, sus2, sus4; Sixths: 6, m6; Sevenths: maj7, 7, m7, m7 flat 5, dim7; Ninths: add9, 9, maj9, m9), 12px italic muted group labels, groups 16px apart; selected accent fill weight 700; accessible name includes the group (`Sevenths, maj7`) and pressed state; labels are short forms and the readout name comes from the namer.
UX-DR40 (NEW; AMENDS UX-DR9): Explore builder layout and behaviour: one control line holds Play (`Space`), Block (`Enter`, primary) and the 12 root cells (Play and Block at 20px type, 12px 24px padding to fit 1152px), the 17 chips on the line under it, then the Status note. With both root and quality set, the chord replaces whatever was lit (no confirmation, Esc undo unchanged), is named, plays, carries to the guitar as best-fit voicing; piano lands at a fixed octave (C4 to B4 root); quality before root does nothing until both set; both highlights stay after a pick; a hand-clicked note clears both highlights; choosing a new chord resets the inversion to root position.
UX-DR41 (AMENDS UX-DR11): Inversion stepper in the Voicing row: `◀ Root position ▶`, `1st inversion`, `2nd inversion`, `3rd inversion`; same component and 40 x 40px arrows, no wrap, inert-end rule; chords of four or more tones reach 3rd inversion, triads stop at 2nd, fewer than three tones show none; piano: it is the only stepper; guitar: both steppers on one line, voicing first, 40px gap, list filtered to voicings whose lowest note is the bass and the count updates; focus moves to the remaining stepper control if one goes inert or hides; keys: `Up` / `Down` step the inversion, `Left` / `Right` keep stepping voicings.
UX-DR42 (AMENDS UX-DR16, UX-DR22): Explore states: guitar with no voicing for the chosen bass shows `No voicing fits these notes.` and the inversion stepper stays; builder-both-picked and inversion-available states per State Patterns.
UX-DR43 (NEW): Chord drill screen: readout is the asked chord name, one-line hint row, role legend only after the answer shows, the instrument, then Play, Try (primary, apricot) and Reveal; after a right answer or Reveal, Try and Reveal give way to Next (`Enter`) in the primary slot and Play stays; Try is `aria-disabled` under three lit notes; entering the drill starts a fresh board; nothing advances automatically.
UX-DR44 (NEW): Drill states and copy: building (lit notes are no-role dots, no legend); first miss `Not quite, try again.` with nothing marked; second miss or later with Mark misses on `Not quite. The crossed note is not in this chord.` and each lit note outside the chord shows the wrong-note cross (surface-fill ring with a 2.6px ink cross, about 18px; on a black key in surface colour); with Mark misses off the first-try hint repeats; missing notes are never shown; right or revealed: role shapes and legend appear, the chord plays, Next appears, no praise, no score.
UX-DR45 (NEW): No-role dot and wrong-note cross visuals: small solid ink dot for a lit note with no role (unresolved set, drill while building; surface colour on black keys); the cross is the only wrong-note cue besides the hint text.
UX-DR46 (NEW): Circle page layout: 560px circle centred in the body, seven-chord row along the bottom, minor-scale picker to the right of the circle (minor only), no instrument and no toggle; the page opens on C major.
UX-DR47 (NEW): Circle wedges: 24 buttons (12 major outside, relative minors inside, 2px gaps in bg); accessible names `G major`, `E minor` with selected exposed (`aria-pressed` or equivalent); selected accent fill weight 700; related wedges (key one step either side on both rings, plus the relative on the other ring) take a 33% accent tint; hover chip overlay; centre shows the short key name only (`G`, `Gm`) as live text; no key signature, no related-keys text; relative minor derived from the major (F sharp major pairs with D sharp minor).
UX-DR48 (NEW): Chord chips: seven in a row, equal width, gap 10px, radius 22px; each stacks Roman numeral, chord name (26px weight 600), role word (often empty); home chip (I or i) tinted accent as a fixed marker, no selected state kept; click or Enter plays the root-position triad with the active sound; names `IV, C` and `I, G, home`; names come from the namer.
UX-DR49 (NEW): Minor-scale picker: stacked pills Natural, Harmonic, Melodic with a `Minor scale` label, shown only when a minor wedge is selected, hidden for major without moving anything else; switching changes the chord row only. Natural i ii° III iv v VI VII; Harmonic i ii° III+ iv V VI vii°; Melodic ascending i ii III+ IV V vi° vii°. Major: I ii iii IV V vi vii°. Selecting a minor wedge selects that minor key.
UX-DR50 (AMENDS UX-DR13): Setup panel: 560px non-modal floating overlay at the right edge of the body (anchor assumption since the strip is gone), toggled by the cog or `P` from every section; content top to bottom: Listen setup (pool, Direction, Root), `Chord drill` with Mark misses, Sound, Theme.
UX-DR51 (AMENDS UX-DR13): Sound segmented control Samples | Synthesized (default Samples) with the hint `Samples follow the instrument: piano sound on the piano, guitar sound on the guitar.`; Mark misses On | Off (default On) under its own `Chord drill` heading with the hint `Crosses notes that are not in the chord after two tries.`; both persisted (NFR6); each has a Setup label.
UX-DR52 (AMENDS UX-DR16): Status note loading: `Loading the guitar sound.` (or piano) in the audio-blocked spot until the set is ready, notes sound when ready, disappears when loaded; synth is unaffected; a load failure shows a message and falls back to the synth (AD-7).
UX-DR53 (AMENDS UX-DR19): Live regions add the drill hint, the inversion stepper (`1st inversion`) and the sound-loading note (all polite).
UX-DR54 (AMENDS UX-DR23): Voice and tone adds: `Not quite, try again.`, `Not quite. The crossed note is not in this chord.`, `Loading the guitar sound.`; no scores, streaks or praise in the drill; chord names and spellings only from the namer.
UX-DR55 (NEW; AMENDS accessibility floor, UX-DR18, UX-DR24): Accessibility additions: rail names (`Listen`, `Chord drill`, `Piano`, `Setup`, `Help`); root halves separately named; quality chips named with group; circle wedges, chips and scale pills are real buttons; selection and relation carried in names, not tint alone; drill wrong note by cross shape plus words; forced-colors: real buttons and outlines, no box-shadow rings; the Phase 2 mocks are span-built and illustrative.
UX-DR56 (AMENDS UX-DR20, no change to timing): Motion unchanged; rail collapse and wedge selection add no animation beyond what is specified (instant under reduced motion).
UX-DR57 (NEW): Flows 4 to 6 as acceptance scripts: Flow 4 (pick F sharp m7 in the builder, hear it, carry to guitar, step voicings, 2nd inversion narrows the list, m9 replaces the chord and keeps the root cell lit, failure no-voicing keeps the stepper); Flow 5 (drill: build B flat maj7 on guitar as plain dots, first miss, second miss with a cross, right answer with shapes and legend, Next on Enter, Reveal on `R`); Flow 6 (circle: G major, relative Em, Harmonic row changes, hear D then Em).
UX-DR58 (AMENDS UX-DR25, unchanged scope): Chord ear practice keeps its nine original qualities (FR26); Flow 3 button layout still set when slice 1B practice is built; Phase 2 adds nothing to Listen except the shorter readout block (UX-DR34) and the rail.
UX-DR12: stays dropped.

Counts D: UX-DR26 to UX-DR58 = 33 items (UX-DR34 done; UX-DR56 and UX-DR58 are "no change" notes that can be folded into others).

### Existing items Phase 2 touches

| Existing | Phase 2 effect | Cite |
| --- | --- | --- |
| FR1, FR2 | Instrument toggle moves into the rail; hidden on Circle | UX-DR29 |
| FR3 to FR9 | Unchanged; Listen layout gets shorter readout block, rail replaces strip | UX-DR34 |
| FR11 | Sampled instruments delivered; synth stays a choice | FR23 |
| FR12 | Chord library part now FR28 | FR28 |
| FR13, FR20 | Play paths gain the instrument parameter | AD-7 |
| FR14 | Namer returns spelled root and slash readings | AD-10 |
| FR15 to FR19 | Voicings work for 17 qualities, bass filter, omission rule | AD-8, FR25 |
| FR21 | Withdrawn; delivered as FR27 | FR27 |
| FR22 | Unchanged; pool limited to the nine flagged qualities | FR26, AD-4 |
| NFR2, NFR3, NFR4, NFR6, NFR7, NFR8, NFR9, NFR10, NFR12 | Amended (section B) | |
| UX-DR1 | New tokens (roles, rail, cells, chips, circle) | UX-DR26 |
| UX-DR2 | Superseded (strip to rail) | UX-DR26 |
| UX-DR3 | Mode tabs superseded by rail items; instrument toggle moved; `M` gone | UX-DR28, 29 |
| UX-DR5 | Position marker dots | UX-DR35 |
| UX-DR6 | Three new role shapes | UX-DR36 |
| UX-DR7, UX-DR8 | Slash name, new legend words | UX-DR37 |
| UX-DR9 | Compact Explore buttons, drill Try and Next | UX-DR40, 43 |
| UX-DR11 | Inversion stepper, two steppers on one line | UX-DR41 |
| UX-DR13 | Setup panel anchor and content (Sound, Mark misses) | UX-DR50, 51 |
| UX-DR15 | Opener and Help move to the rail | UX-DR30 |
| UX-DR16 | Loading note | UX-DR52 |
| UX-DR17 | `M` removed, drill key column | UX-DR32 |
| UX-DR18 | New focus order | UX-DR33 |
| UX-DR19, UX-DR23 | New live regions and copy | UX-DR53, 54 |
| UX-DR21 | Listen block height change (done) | UX-DR34 |
| UX-DR22 | Builder clears and highlights, no-voicing with bass | UX-DR40, 42 |
| UX-DR25 | Unchanged scope | UX-DR58 |
| AD-3 to AD-10 | Amended (section C); AD-12, AD-13 new | |

### FR Coverage Map

FR1: Epic 1 - Guitar and piano views available from day one
FR2: Epic 1 - Swap between views at any time
FR3: Epic 1 - Play an interval on request, unlimited replay
FR4: Epic 1 - Reveal shows name, notes and positions on the active instrument
FR5: Epic 1 - Next plays a new interval
FR6: Epic 1 - Optional guess by click, no score
FR7: Epic 1 - Interval pool selection
FR8: Epic 1 - Direction: ascending, descending, harmonic
FR9: Epic 1 - Root note: random or fixed
FR10: Epic 2 - Click two notes, app names and plays the interval
FR11: Epic 1 - Synthesized sound with a sound choice in the setup panel
FR12: Epic 3 - Build a chord by clicking piano notes, live name and root
FR13: Epic 3 - Play chord as block or arpeggio
FR14: Epic 3 - Chord naming from toggled notes
FR15: Epic 4 - Chord carries to the fretboard as a voicing, role markers
FR16: Epic 4 - Find and change a playable guitar voicing
FR17: Epic 4 - Generate and step through all voicings, common shapes first
FR18: Epic 4 - Voicings match the source chord's register
FR19: Epic 4 - Hand-edit a voicing, name keeps updating
FR20: Epic 4 - Play the voicing strummed and as an arpeggio
FR21: Withdrawn (piano voicings and inversions are Phase 2)
FR22: Epic 5 - Chord ear practice with a quality pool
FR23: Epic 6 - Sampled piano and guitar, Samples or Synthesized in Setup
FR24: Epic 8 - Chord qualities tiers A and B named, spelled and shown with roles
FR25: Epic 8 - Guitar voicings for every new quality, omission rule
FR26: Epic 8 - New qualities are Explore-only, Listen keeps the nine
FR27: Epic 9 - Inversions on either instrument, slash-chord names
FR28: Epic 10 - Pick a root and a quality to light a chord in Explore
FR29: Epic 11 - The drill shows a chord name to build
FR30: Epic 11 - Try checks the chord, any voicing or inversion
FR31: Epic 11 - Reveal at any time, no score
FR32: Epic 7 - Side rail navigation for the four sections
FR33: Epic 12 - Circle of fifths page

## Epic List

### Epic 1: Interval ear practice
Apor opens the app, hears an interval, replays it, optionally guesses, and reveals the answer on a piano or guitar view. He can tune the pool, direction, root, sound and theme.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR11

### Epic 2: Explore intervals on the instruments
In Explore, Apor clicks any two notes on either instrument and the app names the interval and plays it. This finishes slice 1A.
**FRs covered:** FR10

### Epic 3: Build and name chords on the piano
Apor clicks notes on the keyboard and the app marks the root, names the chord live and plays it as a block or an arpeggio. He can switch between alternative readings.
**FRs covered:** FR12, FR13, FR14

#### Story 3.6: Choose the root by clicking a note

As Apor,
I want to pick which lit note is the root,
So that I can hear and see the same notes built from a different root.

**Covers:** FR12; UX-DR22

Split from Story 3.2; built after Story 3.3, so it must settle how a chosen root combines with the chosen reading.

**Acceptance Criteria:**

**Given** the root defaults to the reading's root
**When** I press `R` then click a lit note
**Then** that note becomes the root, the readout and legend update, and the notes themselves stay lit
**And** a Status note `Click a lit note to set the root.` shows while the gesture is armed, and `R` is in the shortcut list.

**Given** the clicked note is not the root of any reading
**When** it is chosen
**Then** it takes the root marker and the set reads as unknown (note names, no-role dots, legend with the root only).

**Given** the root is changed by the user
**When** later notes are added
**Then** the chosen root stays until it is unlit or the user changes it again.

### Story 3.7: Tidy up before the fretboard

As Apor,
I want the chord code and tests tidied before guitar voicings build on them,
So that Epic 4 starts from one rule per idea and a steady toolchain.

**Covers:** Epic 3 retrospective items

**Acceptance Criteria:**

**Given** a chosen reading is compared with a namer reading, and a root is looked up among the readings
**When** the reducer, the readout and the legend need either
**Then** one helper each in `core/explore.ts` serves all of them, and `ui/session` no longer calls `nameChord`.

**Given** `tests/ui/explore/ExploreView.test.tsx`
**When** it is read
**Then** it is split by concern (readout, readings, root, guitar) with no file near 600 lines, and no test is lost.

**Given** an agent edits source or test files
**When** it formats them
**Then** a formatter config, `.editorconfig` and `.gitattributes` matching the existing style (no semicolons, single quotes, width 140, one line ending) mean it does not reflow untouched lines or change line endings.

### Story 3.8: One note per string on the guitar

As Apor,
I want Explore on the guitar to hold at most one lit note per string,
So that what I build on the fretboard is a shape a hand can play, before voicings in Epic 4.

**Covers:** FR16 (the one-note-per-string rule); Epic 3 retrospective item

Decided by Apor after the Epic 3 retrospective: Explore stops two lit notes sharing a string. What a second click on a string does is settled in the story's spec.

**Acceptance Criteria:**

**Given** Explore on the guitar with a note lit on a string
**When** I click another fret on that string
**Then** the string holds only one lit note, and the readout, markers and legend follow the notes that remain.

The swap from the piano and the six-string limit are Story 3.9.

### Story 3.9: Carry piano notes to the guitar one per string

As Apor,
I want the swap from the piano to place the lit notes one per string,
So that the fretboard shows a shape a hand can play, and I am told what it left out.

**Covers:** FR16 (the one-note-per-string rule); Epic 3 retrospective item

Split from Story 3.8; built after it, reusing its placement function.

**Acceptance Criteria:**

**Given** lit piano notes that can only sit on the same guitar string
**When** I swap to the guitar
**Then** each note takes its remembered position or a free string, and a note with no free string is left out
**And** the Status note says how many were left out, together with any notes beyond the fretboard.

**Given** more than six notes are lit
**When** I swap to the guitar and back
**Then** the extra notes stay in the workspace and are lit again on the piano.

## Epic 4: Find the chord on guitar
Apor swaps to the fretboard with the chord carried over, sees a playable voicing in the register he built, and steps through ranked, register-matched voicings. He can hand-edit a voicing and hear it strummed or arpeggiated.
**FRs covered:** FR15, FR16, FR17, FR18, FR19, FR20

### Epic 5: Chord ear practice
Apor does the Listen flow with chord qualities: a pool of qualities, optional guess, Reveal lighting the chord on the active instrument.
**FRs covered:** FR22

### Epic 6: Real instrument sound
Apor hears sampled piano and guitar instead of the synth, loaded when needed, and chooses Samples or Synthesized in Setup.
**FRs covered:** FR23

### Epic 7: Side rail navigation
Apor moves between Listen, Explore, the drill and the circle from a collapsible side rail that remembers its state. The instrument toggle, gear and help move into it, the strip and the `M` shortcut go, and the fretboard gets its position dots.
**FRs covered:** FR32

### Epic 8: Richer chord vocabulary
Apor builds and names sus2, sus4, 6, m6, add9, 9, maj9 and m9 in Explore, sees their roles, and finds guitar voicings for each. Listen keeps the original nine.
**FRs covered:** FR24, FR25, FR26

### Epic 9: Inversions
Apor steps a chord through its inversions on either instrument and sees it named as a slash chord.
**FRs covered:** FR27

### Epic 10: Chord builder
Apor picks a root and a quality and the chord lights in Explore, named, playable and carried to the guitar with its voicings.
**FRs covered:** FR28

### Epic 11: Chord drill
Apor gets a chord name, builds it on the instrument, presses Try, and hears and sees the answer. No score.
**FRs covered:** FR29, FR30, FR31

### Epic 12: Circle of fifths
Apor opens a page with the circle of fifths, picks a major or minor key and hears its seven chords.
**FRs covered:** FR33

## Epic 1: Interval ear practice

Apor opens the app, hears an interval, replays it, optionally guesses, and reveals the answer on a piano or guitar view. He can tune the pool, direction, root, sound and theme.

### Story 1.1: Project scaffold and quality gates

As a developer (Apor, with an AI agent),
I want a running TypeScript, React and Vite project with tests and boundary checks in place,
So that every later story builds on the pinned stack and the architecture's dependency rules.

**Covers:** NFR2, NFR8, NFR9, NFR12; AD-1

**Acceptance Criteria:**

**Given** a fresh checkout and Node 22.13.1
**When** I install and run the dev server
**Then** a blank accompa page renders in the browser
**And** `package.json` pins every dependency to the exact versions in the architecture Stack table (TypeScript 7.0.2, React and react-dom 19.3.1, Vite 8.3.5, @vitejs/plugin-react 6.1.2, Vitest 5.0.5, @testing-library/react 16.3.3, happy-dom 21.0.4).

**Given** the project structure
**When** I list `src/` and `tests/`
**Then** `src/core/`, `src/audio/`, `src/ui/` and `tests/` exist as in the Structural Seed.

**Given** Vitest with happy-dom
**When** I run the tests
**Then** one `core/` unit spec and one React component spec pass.

**Given** the import-boundary check
**When** a file in `core/` imports from `ui/` or `audio/`, or an `audio/` file imports from `ui/`
**Then** the check fails with a message naming the offending import
**And** it passes on the clean project and is part of the npm test or check script.

**Given** the project has no linter yet
**When** the setup is reviewed
**Then** no linter is added unless it was verified to support TypeScript 7.

### Story 1.2: Themed app shell

As Apor,
I want a quiet mode strip with Listen / Explore tabs and a Piano / Guitar toggle, in the Rose Quartz look,
So that I can move around the app and it feels like my tool.

**Covers:** FR1, FR2; NFR1, NFR7; UX-DR1, UX-DR2, UX-DR3, UX-DR18, UX-DR20, UX-DR24

**Acceptance Criteria:**

**Given** the app opens
**When** the page renders
**Then** Listen is the selected mode (Explore opens as the default once Epic 2 ships it) and Piano the selected instrument
**And** the strip (at least 84px tall) shows the wordmark, the two Mode tabs, the Piano|Guitar toggle pushed right, and placeholder space for the Setup opener and Help hint
**And** the layout fits the 1280 x 800 canvas on one screen with no scrolling.

**Given** the design tokens
**When** I inspect the page
**Then** every DESIGN.md color token and its `-dark` twin, the typography ramp (italic Palatino stack, key-hint non-italic) and the rounded and spacing tokens exist as CSS custom properties
**And** the system color scheme selects light or dark.

**Given** a Mode tab or Instrument segment is selected
**When** I look at it
**Then** it uses the accent fill, on-fill text and weight 600 (the single selected-state treatment)
**And** it exposes a selected state to assistive tech.

**Given** focus is not in a text field
**When** I press `M` or `I`
**Then** the mode or instrument switches (Ctrl, Alt or Meta held does nothing)
**And** Tab moves focus from the Mode tabs to the Instrument toggle in that order.

**Given** any focusable control
**When** it receives keyboard focus
**Then** a 2px ink outline with a 2px gap is drawn outside the control.

**Given** `prefers-reduced-motion`
**When** it is set
**Then** all transitions are instant.

**Given** controls in the shell
**When** I inspect the markup
**Then** they are real buttons or radio-group elements and their rings are outlines, not box-shadow.

### Story 1.3: Hear a random interval

As Apor,
I want to press a button and hear a random interval, as many times as I like,
So that I can start ear practice with no setup.

**Covers:** FR3, FR5, FR11; AD-2, AD-4, AD-5, AD-7, AD-11; NFR3, NFR4, NFR5, NFR10

**Acceptance Criteria:**

**Given** the `core/` pitch types
**When** the tests run
**Then** `Pitch`, `PitchClass` and `Interval` are distinct branded types, pitch class is `n mod 12`, and the 12-entry interval table (semitones, name, abbreviation) holds m2 to P8 with 6 semitones as A4.

**Given** `core/` practice logic
**When** a question is generated with a seeded random function
**Then** the same seed always yields the same interval and root
**And** `core/` never calls `Math.random` directly
**And** every note falls inside the active instrument's range, which is owned by one `core/instruments` module (piano default MIDI 36 to 96).

**Given** the audio engine interface
**When** a caller plays an ordered list of pitches as a block or an arpeggio
**Then** the notes sound via a Web Audio synth, in list order for an arpeggio, and the engine owns all timing
**And** components only call that interface and never create audio nodes.

**Given** I am in Listen
**When** I click Play again or press `Space` (and `Enter` ignores auto-repeat)
**Then** the current interval plays, ascending by default, and replays identically each time
**And** the first gesture creates or resumes the AudioContext with no enable-sound screen.

**Given** the session model in `core/model`
**When** I inspect it
**Then** it has a workspace part (written only by Explore actions) and a practice part (current question, reveal state, wrong marks, pool in play, written only by practice rounds), plus a separate active instrument, as plain serializable data
**And** the Listen question state in this story lives in the practice part.

**Given** Listen is selected
**When** a question starts
**Then** the readout shows `Which interval?`
**And** the interval plays at once when I enter Listen with a click or `M`, and on app open it waits for `Space` or Play again, because audio needs a user gesture first.

**Given** audio is still blocked after a gesture
**When** the context is suspended
**Then** the Status note `Press any key to wake the sound.` shows and disappears when audio starts
**And** nothing else in the app breaks.

**Given** the active instrument and mode change
**When** I switch to Explore and back
**Then** the same question is kept and does not replay.

### Story 1.4: Piano keyboard

As Apor,
I want a three-octave piano keyboard on screen,
So that I can see notes on an instrument I read easily.

**Covers:** FR1; UX-DR4, UX-DR6, UX-DR16

**Acceptance Criteria:**

**Given** Piano is selected
**When** the instrument area renders
**Then** it shows three octaves with white keys on the surface color and keyline edge, black keys on top with a dark-theme key edge, and octave labels C3, C4, C5.

**Given** keys overlap
**When** I click inside a black key's rectangle
**Then** the black key receives the click.

**Given** the keyboard is rendered by a parent
**When** I press and release a key with the pointer
**Then** the component calls an `onNotePress` handler with the pitch on press and an `onNoteRelease` handler on release, and the component itself owns no musical state or sound.

**Given** the keyboard shows lit notes passed in as data
**When** a key is lit
**Then** it shows a no-role marker (small solid ink dot) and the key state is a pure render of the lit set.

**Given** I press `[` or `]` (or the key at BracketLeft or BracketRight, including through AltGr on layouts such as Hungarian)
**When** the window can move
**Then** the three-octave window shifts one octave down or up within the engine range (MIDI 36 to 96)
**And** the keys do nothing while Ctrl, Alt or Meta is held, except AltGr.

**Given** lit notes fall outside the shown window
**When** the window is shifted
**Then** a Status note shows `◀ 2 notes lit` or `3 notes lit ▶` at the matching edge.

**Given** the keyboard
**When** it is operated by Tab
**Then** it is one focus stop and carries the standard focus ring.

### Story 1.5: Guitar fretboard and instrument swap

As Apor,
I want a guitar fretboard I can swap to at any time,
So that I see notes where I actually play them.

**Covers:** FR1, FR2; UX-DR5

**Acceptance Criteria:**

**Given** Guitar is selected
**When** the instrument area renders
**Then** it shows six strings in standard tuning (E A D G B E) and 22 frets, with string names on the left, fret numbers below, fret wires, and a thick nut
**And** tuning is a parameter to `core/` functions rather than a constant inside the view.

**Given** lit positions passed in as data
**When** they render
**Then** each lit position shows the no-role dot, and open strings show the marker in a ring at the nut.

**Given** the fretboard is rendered by a parent
**When** I press and release a fret position with the pointer
**Then** the component calls `onNotePress` with the string and fret (and its pitch) on press and `onNoteRelease` on release, and owns no musical state or sound.

**Given** a pitch
**When** `core/instruments` maps it to the fretboard
**Then** it returns every string and fret that produces it within 22 frets (tested).

**Given** I click the Guitar or Piano segment, or press `I`
**When** the instrument swaps
**Then** the view crossfades (instantly under reduced motion)
**And** the session state (current question, lit notes) is unchanged and survives swap and swap-back.

**Given** the fretboard
**When** it is operated by Tab
**Then** it is one focus stop with the standard focus ring.

### Story 1.6: Reveal an interval

As Apor,
I want to reveal the answer after listening,
So that I learn what I heard without any penalty.

**Covers:** FR4, FR5; AD-3; UX-DR7, UX-DR9, UX-DR21

**Acceptance Criteria:**

**Given** a question is waiting
**When** I press `Enter` or click Reveal (the primary action button, with a key-hint cap)
**Then** the readout shows the interval name, both notes light on the active instrument (root with the root marker, the other with the no-role dot), and Reveal becomes Next in the same button
**And** focus stays on that button.

**Given** the spelling module
**When** the notes are named
**Then** all labels come from `core/spelling` (letter stepping from the root, 6 semitones always A4), no component spells a note itself
**And** a table-driven test covers all 12 intervals.

**Given** Reveal is shown on Guitar
**When** the notes light
**Then** one position per note is chosen, the closest pair near the lowest frets
**And** on Piano the actual keys light (shifting the window if needed to include them).

**Given** the question is revealed
**When** I press `Enter` again or click Next
**Then** a new interval is generated and plays, the readout returns to `Which interval?`, and the notes unlight.

**Given** a reveal
**When** it happens
**Then** no score, counter or praise appears and the Reveal text is announced in a polite live region.

**Given** the question is revealed
**When** I switch instruments
**Then** the lit notes re-render on the other instrument without a new question.

### Story 1.7: Guess an interval

As Apor,
I want to click an answer if I feel like guessing,
So that I can test my ear without being forced to.

**Covers:** FR6; UX-DR10, UX-DR19, UX-DR21, UX-DR23

**Acceptance Criteria:**

**Given** Listen is showing a question
**When** the controls render
**Then** a row of 12 interval buttons (m2 to P8) shows with key hints `1`-`9`, `0`, `-`, `=`.

**Given** I click a button or press its key
**When** the answer is correct
**Then** the hint `P5. Next interval is playing.` shows (name, no praise) and the next interval auto-plays.

**Given** I click a wrong answer
**When** the guess is evaluated
**Then** that button gets the wrong fill, an inset 2px muted ring and a struck-through label, and becomes `aria-disabled` (still focusable) with an accessible name like `m3, tried`
**And** the hint `m3 is not it — try another.` shows and the question stays
**And** the mark clears on the next question.

**Given** the question is revealed
**When** I look at the buttons
**Then** they are disabled.

**Given** an interval is not in the current pool
**When** the row renders
**Then** its button shows disabled at no less than 55% opacity.

**Given** a guess result
**When** it happens
**Then** the polite live region announces it and no score or streak is shown anywhere.

**Given** focus is on a button, tab, radio or text field
**When** I press a digit key
**Then** the shortcut yields to native behavior.

### Story 1.8: Choose which intervals to practise

As Apor,
I want to choose which intervals are in the pool,
So that I can focus on the ones I'm learning.

**Covers:** FR7; UX-DR13, UX-DR14, UX-DR15

**Acceptance Criteria:**

**Given** I press `P` or click the gear Setup opener (accessible name `Setup`, `aria-expanded`)
**When** the panel toggles
**Then** a 560px non-modal Setup panel opens on the surface color under the strip at the right
**And** focus enters it on open, and `Esc` or the gear closes it and returns focus to the opener.

**Given** the panel
**When** I look at the pool
**Then** it has a Setup label and 12 pool chips (m2 to P8), the selected ones with accent fill, ink text and weight 600 and no check glyph.

**Given** I toggle a chip
**When** the pool changes
**Then** it applies from the next question and the current question stays answerable
**And** new questions only come from the pool and the answer buttons outside it show disabled.

**Given** only one chip is ticked
**When** I try to untick it
**Then** nothing changes, the chip is `aria-disabled` but still focusable with a non-colour cue, and `Keep at least one interval.` is announced politely.

**Given** the pool changes
**When** I reload the page
**Then** the same pool is restored from `localStorage`
**And** if reading fails or the data is invalid, the full 12-interval default applies without an error.

**Given** I click inside the panel with the pointer
**When** the click lands on a panel control
**Then** focus stays inside the panel.

### Story 1.9: Set direction

As Apor,
I want to choose ascending, descending or harmonic,
So that I can practise each way I hear music.

**Covers:** FR8 (the Root half, FR9, moved to Story 1.12)

**Acceptance Criteria:**

**Given** the Setup panel
**When** I look at it
**Then** it holds a Direction segmented control (Ascending, Descending, Harmonic), with a label and the shared selected treatment.

**Given** Ascending, Descending or Harmonic
**When** an interval plays
**Then** the engine receives the ordered pitch list (low to high, high to low, or both as a block) and replays it identically.

**Given** I change direction
**When** a question is in progress
**Then** it applies from the next question and the current one stays answerable (superseded by Story 1.13).

**Given** a reload
**When** the app starts
**Then** direction returns to the default (Ascending), as it is not persisted.

### Story 1.10: Choose sound and theme

As Apor,
I want to pick the sound and the theme, and have them remembered,
So that the app is set up my way every time.

**Covers:** FR11; AD-6; NFR6

**Acceptance Criteria:**

**Given** the Setup panel
**When** I look at the Sound control
**Then** a segmented control offers `Synthesized` as the only v1 choice, and the choice is read from the settings context and passed to the audio engine.

**Given** the Theme control
**When** I choose System, Light or Dark
**Then** the app switches immediately, System follows the OS setting, and light and dark both use their full token sets.

**Given** settings
**When** the app saves them
**Then** only sound, theme and interval pool go to `localStorage`, as JSON
**And** direction, root mode, chord, voicing and the current question do not.

**Given** settings are stored
**When** I reload
**Then** sound, theme and pool are restored.

**Given** `localStorage` is unavailable or holds bad data
**When** the app starts
**Then** defaults apply without an error and the app keeps working.

**Given** settings state
**When** the reducers are tested
**Then** they are pure and serializable, with settings and session as separate contexts.

### Story 1.11: Shortcuts and help hint

As Apor,
I want a discoverable shortcuts list and reliable keys,
So that I can run Listen from the keyboard.

**Covers:** UX-DR15, UX-DR17

**Acceptance Criteria:**

**Given** the corner
**When** I hover or focus the `?` circle (or press `?`)
**Then** the shortcuts list opens, stays open while hovered, and `Esc` dismisses it
**And** the list matches the approved key map and notes that `Space` and `Enter` activate a focused button instead.

**Given** a shortcut key is pressed with Ctrl, Alt or Meta held
**When** the event is handled
**Then** no shortcut fires, except AltGr, which counts as no modifier.

**Given** `Space` or `Enter` is held down
**When** key repeat fires
**Then** only one action runs.

**Given** focus is on a tab, radio, pool chip, text field or button
**When** I press a digit, `Space` or `Enter`
**Then** the native behavior wins (for a text field, every shortcut key yields)
**And** the other shortcut keys (`M`, `I`, `P`, `[`, `]`, `?`, `Esc`) still fire from a focused control, as the UX key map says.

**Given** I click a control outside the Setup panel with the pointer
**When** the click ends
**Then** focus returns to the instrument so shortcuts keep working
**And** keyboard activation leaves focus where it is.

**Given** I press Tab through the app
**When** I move through the focus order
**Then** it runs Mode tabs, Instrument toggle, Instrument, Action buttons and interval row, Setup opener (and the panel when open), then Help hint last
**And** the wordmark is not a stop.

**Given** a control with a shortcut
**When** it renders
**Then** it shows a solid-color key hint cap, hidden from assistive tech, and exposes `aria-keyshortcuts`.

### Story 1.12: Fix the root

As Apor,
I want a random or fixed root for the interval questions,
So that I can practise from one note when I choose to.

**Covers:** FR9; carries the Root criteria split from Story 1.9

**Acceptance Criteria:**

**Given** the Setup panel
**When** I look at it
**Then** it holds a Root segmented control (Random, Fixed), labelled, with the shared selected treatment.

**Given** Root is Random
**When** a question is generated
**Then** the root is picked with the injected random function and the whole interval fits the active instrument's range.

**Given** Root is Fixed in Listen
**When** I press a note on the active instrument (no panel needed) [ASSUMPTION: the UX spec does not place this control]
**Then** that note sounds, becomes the fixed root, and shows the root marker on both instruments, and the Status note `Click a note to set the root.` shows until one is chosen
**And** the click changes only the practice state, never the workspace.

**Given** a fixed root
**When** questions are generated
**Then** every question uses that pitch class, the octave is the one nearest the clicked note in which the whole interval fits the instrument range, and the root changes only when I click another note
**And** if no root has been chosen yet, the first question picks one with the injected random function and shows it as the fixed root.

**Given** Root is Fixed and the fixed root is chosen
**When** I switch to Random and back
**Then** the previously chosen root is kept for the session.

**Given** I change the root mode
**When** a question is in progress
**Then** it applies from the next question and the current one stays answerable.

**Given** a reload
**When** the app starts
**Then** root mode returns to Random, as it is not persisted.

### Story 1.13: Fixes from the Epic 1 review

As Apor,
I want the practice flow and look to match how I use it,
So that I can drill intervals without extra clicks or visual noise.

**Covers:** user findings from the Epic 1 retrospective; supersedes parts of Stories 1.7, 1.9 and 1.12

**Acceptance Criteria:**

**Given** a correct guess
**When** I click the interval or press its key
**Then** the question is revealed exactly as the Reveal button does (name in the readout, notes lit, buttons disabled) and the next interval does not play
**And** `Enter` then moves to the next interval.

**Given** I change Direction
**When** the change is made
**Then** the question in progress is dropped and a new one is drawn with the new direction, silently, and `Space` plays it.

**Given** I switch Root to Fixed with a root already chosen
**When** the change is made
**Then** the question in progress is dropped and a new one is drawn on that root, silently, and `Space` plays it.

**Given** I switch Root to Fixed with no root chosen
**When** the change is made
**Then** the question in progress is dropped, `Click a note to set the root.` shows, and the next click on a note sounds it, sets the root and draws a new question on that root, silently, with `Space` playing it.

**Given** Root is Fixed and I click another note
**When** the root changes
**Then** the question in progress is dropped and a new one is drawn on the new root, silently.

**Given** I click the piano or the fretboard with the pointer
**When** the instrument takes focus
**Then** no large focus border shows; keyboard focus still shows the visible ring.

**Given** the Help hint
**When** it renders
**Then** the `?` is upright, not italic.

**Given** the Setup panel is open
**When** I click anywhere outside it
**Then** a transparent backdrop under the panel catches the click, the panel closes and focus returns to the opener, and the click does nothing else
**And** `Esc`, `P` and the gear still close it.

## Epic 2: Explore intervals on the instruments

In Explore, Apor clicks any two notes on either instrument and the app names the interval and plays it. This finishes slice 1A.

### Story 2.1: Name an interval from two clicked notes

As Apor,
I want to click two notes on the piano or fretboard and see the interval named,
So that I can check what any pair of notes is while I tinker.

**Covers:** FR10; UX-DR7, UX-DR22

**Acceptance Criteria:**

**Given** this story is done
**When** the app opens
**Then** Explore is now the selected mode by default (it was Listen before this epic), and `M` still switches.

**Given** Explore is selected and no notes are lit
**When** the readout renders
**Then** it shows the quiet prompt `Select notes to build a chord` and no role legend.

**Given** I press on a piano key or a fret position
**When** the pointer goes down
**Then** the note sounds immediately via the audio engine, as a one-pitch list, from the instruments' `onNotePress`
**And** on release it toggles lit (a lit note clicked again unlights).

**Given** one note is lit
**When** the readout updates
**Then** it shows that note's name (from `core/spelling`) and the note carries the root marker.

**Given** two notes are lit
**When** the readout updates
**Then** it shows the interval name between them (lower note first, 6 semitones as A4, intervals wider than an octave shown as their simple interval or the octave, tested in `core/`)
**And** the lower note carries the root marker and the upper the no-role dot.

**Given** two notes are lit and I click a third
**When** the click lands
**Then** the oldest lit note unlights so at most two stay lit in this epic.

**Given** Explore on Guitar
**When** I click a fret position
**Then** that exact string and fret is lit (several lit positions may share a string in Explore) and the pitch comes from `core/instruments`.

**Given** the interval changes
**When** the readout updates
**Then** the name is announced in a polite live region (debounced 300 to 500 ms).

**Given** I swap instrument with notes lit
**When** the view changes
**Then** the same pitches are lit on the other instrument.

### Story 2.2: Hear the interval and clear the notes

As Apor,
I want to replay the pair I built and clear it when I'm done,
So that I can compare intervals quickly.

**Covers:** FR10, FR11; UX-DR9, UX-DR16, UX-DR22

**Acceptance Criteria:**

**Given** two notes are lit in Explore
**When** I press `Space` or click the Play action
**Then** the pair plays as an arpeggio, low to high.

**Given** two notes are lit in Explore
**When** I press `Enter` or click Block
**Then** the pair plays together
**And** Block is the primary action button (apricot) with a key-hint cap.

**Given** fewer than two notes are lit
**When** I press `Space` or `Enter`
**Then** one lit note plays alone, and nothing plays when none is lit.

**Given** notes are lit and no panel or hint is open
**When** I press `Esc`
**Then** all notes unlight and a Status note `Notes cleared. Undo` shows with an Undo button that restores them
**And** the note stays until the next note change, and `Ctrl+Z` is not a gesture.

**Given** the Setup panel or the shortcuts list is open
**When** I press `Esc`
**Then** that closes first and notes are not cleared.

**Given** Space or Enter is pressed while a button is focused
**When** the key is handled
**Then** the button activates instead of the Explore shortcut.

### Story 2.3: Keep Explore and Listen separate

As Apor,
I want what I tinker with in Explore to survive a visit to Listen,
So that practice never wipes out my work.

**Covers:** AD-5

**Acceptance Criteria:**

**Given** the session model from Story 1.3
**When** Explore actions light notes
**Then** the lit notes are stored in the workspace part and never in the practice part.

**Given** notes are lit in Explore
**When** I switch to Listen, answer or reveal a question, and switch back
**Then** the workspace notes are unchanged.

**Given** a Listen question is in progress
**When** I switch to Explore, light notes, and switch back
**Then** the same question and wrong marks are still there and nothing replays.

**Given** the reducers
**When** they are tested
**Then** a practice action never alters the workspace and a workspace action never alters practice.

**Given** Listen reveals notes on the active instrument
**When** the reveal renders
**Then** it draws from practice state and not from the workspace.

### Story 2.4: Tidy up before chords

As Apor,
I want the small carry-overs from Epics 1 and 2 cleared in the app,
So that Epic 3 builds on shared code and a steady screen.

**Covers:** Epic 2 retrospective items

**Acceptance Criteria:**

**Given** the Listen and Explore screens
**When** I switch mode with `M` or the tabs
**Then** the instrument's top edge stays at the same place in both, so it does not jump.

**Given** the shared button, key-hint, controls-row and visually-hidden styles and the pointer-focus helper
**When** Explore renders
**Then** they come from a shared place and no `ui/explore` file imports from `ui/listen`.

**Given** a guess
**When** the hook, the interval buttons and the reducer decide whether it is allowed
**Then** one rule in one place (in the pool or the current answer, and not already tried) serves all three.

**Given** the built app loads in a browser
**When** it requests the favicon
**Then** it gets an icon and the console shows no 404.

**Given** Explore on the guitar with a lit note the fretboard cannot show (below E2 or above D6)
**When** the view renders
**Then** a Status note says how many notes are lit beyond the fretboard (for example `1 note lit beyond the fretboard`), in the same quiet style as the piano's offscreen note, and the readout is unchanged.

### Story 2.5: Share the test helpers

As Apor,
I want the UI tests to share their helpers and the long Setup test file split,
So that Epic 3's tests start from shared code.

**Covers:** Epic 2 retrospective item (Epic 1 item 2)

**Acceptance Criteria:**

**Given** the UI tests
**When** a test needs `press`, `radio` or the Setup panel opener
**Then** it imports them from `tests/ui/support` and no test file defines its own copy.

**Given** `tests/ui/setup/SetupPanel.test.tsx`
**When** it is split by story concern (panel, direction, sound and theme, root)
**Then** every test moves unchanged, no test is deleted or weakened, and the passing count does not drop.

## Epic 3: Build and name chords on the piano

Apor clicks notes on the keyboard and the app marks the root, names the chord live and plays it as a block or an arpeggio. He can switch between alternative readings.

### Story 3.1: Name chords in core

As Apor,
I want the app to know how to name any set of notes as a chord,
So that the readout can trust the name it shows.

**Covers:** FR12, FR14; AD-3, AD-4, AD-10; NFR11

**Acceptance Criteria:**

**Given** the chord quality table in `core/theory`
**When** I inspect it
**Then** it holds major, minor, diminished, augmented, maj7, dom7, min7, m7b5 and dim7, each as one entry (name, symbol, interval stack) in one place, and the UI reads from it, with the symbols `m`, `dim`, `aug`, `maj7`, `7`, `m7`, `m7♭5`, `dim7` and none for major.

**Given** the namer in `core/`
**When** it is given a set of pitches
**Then** it returns all matching readings as root, quality and optional bass note, ranked with the lowest sounding note as root first (root-position first, then inversions as slash chords), and an empty list for no match
**And** the tests cover every supported quality in root position, inversions, sets with several readings (augmented, diminished 7), C E G A reading only as `Am7/C` (there is no sixth quality in v1), and unknown sets.

**Given** chord tones
**When** a reading is spelled
**Then** `core/spelling` spells them by letter stepping from the spelled root (3rd = +2 letters, 5th = +4, 7th = +6) with the default root table (Db, Eb, Gb, Ab, Bb flat; C#, F# sharp) where no reading exists, and dim7 is spelled correctly (tested).

### Story 3.2: Root marker, role shapes and legend

As Apor,
I want each note marked by its role in the chord and the root clearly shown,
So that I can see the structure of the chord at a glance.

**Covers:** FR12; UX-DR6, UX-DR8, UX-DR22

**Acceptance Criteria:**

**Given** a recognised chord
**When** the notes render
**Then** the root is a ringed, filled circle, the 3rd a diamond, the 5th a square (green) and the 7th a triangle, each with its fill and a 1.8px ink outline at least 18px
**And** piano keys also carry an 80% tint of the role fill.

**Given** a recognised chord
**When** the legend renders
**Then** it lists only the roles present with note names (`root C`, `3rd E`, `5th G`, `7th B`) from `core/spelling`
**And** it updates as the chord changes and does not appear for an empty chord.

**Given** a recognised chord
**When** the readout renders
**Then** it also shows the intervals from the root for each note.

**Given** the root is the reading's root (the lowest lit note when no chord is named)
**When** a named inversion renders
**Then** the root marker sits on the reading's root, not the bass.

The `R` then click gesture was split out of this story into Story 3.6.

**Given** dark theme
**When** the markers render
**Then** the dark role tokens are used and shape plus colour carry the role.

### Story 3.3: Choose between alternative chord readings

As Apor,
I want to pick another name for the same notes,
So that I can see a diminished seventh or an augmented triad named from each of its notes.

**Covers:** FR14; AD-10; UX-DR7

**Acceptance Criteria:**

**Given** the notes have more than one reading
**When** the readout renders
**Then** the first reading is large and the others sit beneath as small clickable italic alternatives.

**Given** I click an alternative
**When** it is chosen
**Then** the readout name, the root marker, the legend and the intervals all change to that reading
**And** the notes stay the same and the spelling follows the chosen root.

**Given** the chosen reading
**When** a note is added or removed
**Then** the readout recomputes through the namer and falls back to its first reading if the chosen one no longer exists.

**Given** a surface needs a chord name
**When** it asks for one
**Then** it gets it only from the namer (no surface picks its own reading).

**Given** alternatives
**When** I navigate with Tab
**Then** they are focusable buttons after the readout in focus order, with the standard focus ring.

### Story 3.4: Play the chord as a block or an arpeggio

As Apor,
I want to hear the chord I built,
So that I can connect the name and shape with the sound.

**Covers:** FR13; UX-DR9, UX-DR16

**Acceptance Criteria:**

**Given** a chord is lit
**When** I press `Enter` or click Block (the primary action)
**Then** all notes sound together.

**Given** a chord is lit (three or more notes, once the two-note cap is lifted)
**When** I press `Space` or click Play (both built in Story 2.2)
**Then** the notes sound one after another from low to high, in list order
**And** there is no separate Arpeggio button or `A` key.

**Given** no notes are lit
**When** I press the play keys
**Then** nothing plays and nothing errors.

**Given** audio is blocked
**When** I play
**Then** the Status note `Press any key to wake the sound.` shows.

**Given** the Action buttons
**When** they render
**Then** each shows a key-hint cap in solid colour and exposes `aria-keyshortcuts`, and `Space` or `Enter` on a focused button activates that button.

### Story 3.5: See the chord named as I click notes

As Apor,
I want the app to name the chord as I click notes on the keyboard,
So that I learn what the notes I picked make.

**Covers:** FR12, FR14; UX-DR7, UX-DR22

Built after Story 3.1 and before Story 3.2; it was split from 3.1 so the naming core and the readout ship apart.

**Acceptance Criteria:**

**Given** I click C, E and G on the piano in Explore
**When** the third note lights
**Then** the notes are no longer limited to two and the readout shows `C` large (the chord symbol; a major triad is the bare letter)
**And** the chord name is announced politely after a debounce.

**Given** lit notes that form no known chord
**When** the readout updates
**Then** it shows the note names with no chord name
**And** the lowest note keeps the root marker and every other note shows the no-role dot.

**Given** a chord of three or more notes
**When** notes are added or removed
**Then** the name updates live.

## Epic 4: Find the chord on guitar

Apor swaps to the fretboard with the chord carried over, sees a playable voicing in the register he built, and steps through ranked, register-matched voicings. He can hand-edit a voicing and hear it strummed or arpeggiated.

### Story 4.1: Carry the chord to the fretboard

**Retired** (sprint change proposal 2026-10-26). Apor wants the chord on the guitar as a playable voicing in the register he built, not every position of each note. What is left of this story was delivered by Stories 3.8 and 3.9: the chord carries to the guitar and back, the empty fretboard shows the empty prompt, and pitches outside the guitar range stay in the readout. The voicing shown on the fretboard is Story 4.3.

### Story 4.2: Limit the fretboard to a fret region

**Dropped** (sprint change proposal 2026-10-26). A chord has a limited number of playable voicings, and Story 4.4 steps through them nearest register first, so a region bar adds a drag-only control for little. Revisit only if the stepper proves too slow in use.

### Story 4.3: Generate every playable guitar voicing

As Apor,
I want the app to find real ways to fret my chord,
So that I can play what I built on the piano.

**Covers:** FR16, FR17; AD-8; NFR11; UX-DR16

**Acceptance Criteria:**

**Given** the voicing parameters
**When** I inspect `core/`
**Then** max fret span 4, open strings excluded from the span, at most four fingers, no fret above 12, open strings only at or below fret 5, root and 3rd always present, the 7th mandatory on seventh chords, the 5th mandatory on triads and droppable only on seventh chords, and register bucket width 6 live as tunable constants in one place (as built; reconciled 2026-10-27).

**Given** a chord, tuning and constraints
**When** the pure generator runs
**Then** it returns every playable voicing (at most one fretted note per string, unused strings muted), unranked, each as an ordered pitch list bass to treble plus a per-string fret or muted assignment
**And** it is total: when none exists it returns an empty list, with no exception.

**Given** the generator tests
**When** they run
**Then** they cover all nine qualities, open strings, muted strings, span limits, dropped 5ths, and a no-voicing case, each checking that the pitch classes are exactly the chord's (allowed omissions aside).

**Given** the pure ranking function
**When** it ranks voicings for a source chord
**Then** register distance (absolute difference between mean pitches in semitones) is the primary key, grouped by a bucket-width parameter, followed by the playability keys (more sounding strings, smaller fret span, fewer distinct fretted frets, exact distance), and the generator is unchanged
**And** tests prove a high source chord returns high voicings first and a low one returns low ones first.

**Given** a chord on Guitar with at least one voicing
**When** the fretboard renders
**Then** the best-ranked voicing is shown with fretted markers, open strings as the role shape in a ring at the nut, and muted strings as a muted cross `x`, and nothing else is marked.

**Given** a single note is lit
**When** I swap to Guitar
**Then** it keeps the placement from Story 3.9 and no stepper shows.

**Given** no voicing fits
**When** the fretboard renders
**Then** it is empty with only the Status note `No voicing fits these notes.` under it, and notes stay lit on piano.

**Given** an optional fret range passed to the generator
**When** it runs
**Then** it returns only voicings inside the range.

### Story 4.4: Step through voicings, nearest register first

As Apor,
I want to browse voicings starting with the ones closest in register to what I built,
So that a high chord gives me a high shape, not an open chord.

**Covers:** FR17, FR18; AD-8; UX-DR11, UX-DR19

**Acceptance Criteria:**

**Given** voicings exist
**When** the Voicing stepper renders
**Then** it shows `◀ Voicing 1 of N ▶`, with arrows at least 40 x 40px, opening on the best-ranked voicing.

**Given** I press `Left` or `Right`, or click an arrow
**When** the stepper moves
**Then** the voicing changes, the stepper does not wrap, the arrow at either end is replaced by `·` and is inert with `aria-disabled`, and focus moves to the remaining arrow if the focused one goes inert.

**Given** one or no voicing
**When** the stepper renders
**Then** it is hidden for no voicing, with focus going to the instrument if no control is left.

**Given** a step
**When** it happens
**Then** the polite live region announces `Voicing 2 of 8`.

**Given** a swap to Piano and back
**When** I return to Guitar
**Then** the selected voicing is kept in the workspace.

**Given** the chord changes
**When** the voicing list is recomputed
**Then** the stepper reopens on the best voicing.

### Story 4.5: Common shapes rank first

As Apor,
I want familiar open and barre shapes at the top of the list,
So that the first voicings I see are the ones I would actually play.

**Covers:** FR17; AD-9

**Acceptance Criteria:**

**Given** the shape data in `core/`
**When** I inspect it
**Then** movable shapes (E-shape and A-shape barres and similar) are defined relative to the root, open shapes are fixed, and all are data, not logic.

**Given** every template
**When** the test runs
**Then** it asserts the template yields exactly its chord's pitch classes.

**Given** voicings within the same register bucket
**When** they are ranked
**Then** a template match breaks the tie and ranks first
**And** a fixed open shape ranks first only when it is within the source register.

**Given** voicings that match no template
**When** they are listed
**Then** they come after the matches in their bucket.

**Given** a quality with no templates yet
**When** voicings are generated
**Then** it falls back to generated voicings only, without an error.

### Story 4.6: Hand-edit a voicing

As Apor,
I want to move a note on the fretboard,
So that I can tune a voicing to a shape I like and still see its name.

**Covers:** FR19; AD-5, AD-10

**Acceptance Criteria:**

**Given** a voicing is shown
**When** I click a fret on a string
**Then** that string's note moves to that fret (one per string), the note sounds on press, and the pitch list and readout update
**And** clicking the string's current fretted note mutes that string.

**Given** the edited voicing
**When** the namer runs on its pitches
**Then** the readout shows the resulting chord name, alternatives and role markers, and a name that is no longer a known chord shows the note names.

**Given** I have edited a voicing
**When** the stepper renders
**Then** it shows `Voicing edited` in place of `Voicing n of N`, and the `◀ ▶` arrows return to the generated list (the first press goes to the generated voicing nearest the edit in the ranking) [ASSUMPTION: the UX spec does not cover this].

**Given** the workspace
**When** I swap instruments and back
**Then** the edited voicing positions survive, because a guitar voicing carries its string and fret positions.

**Given** an edit that leaves fewer than two notes
**When** the fretboard renders
**Then** it behaves as the single-note or empty state.

### Story 4.7: Hear the voicing strummed or arpeggiated

As Apor,
I want to hear exactly the fretted voicing,
So that I can check it against my own guitar.

**Covers:** FR20; AD-7; UX-DR9

**Acceptance Criteria:**

**Given** the audio engine interface from Story 1.3
**When** this story is done
**Then** it also offers a strum mode (an ordered pitch list played bass to treble with a short even spread), behind the same interface and with no timestamps from callers.

**Given** a voicing is shown
**When** I press `Enter` or click Block
**Then** the voicing strums, bass to treble, with a short even spread.

**Given** a voicing is shown
**When** I press `Space` or click Play
**Then** the notes sound one at a time from bass to treble in list order.

**Given** muted strings
**When** the voicing plays
**Then** they make no sound.

**Given** an edited voicing
**When** I play it
**Then** it plays the edited pitches.

**Given** the audio engine
**When** the voicing plays
**Then** the engine takes the ordered pitch list and owns all timing, so callers pass no timestamps.

### Story 4.8: Spell chords without double accidentals

As Apor,
I want chord and interval names that never need a double flat or double sharp,
So that I read `D♯m7♭5` and not `E♭m7♭5` with a `B𝄫`.

**Covers:** FR13; added after Apor tried Epic 4 (replaces the Epic 3 decision that double accidentals use the glyphs `𝄫` and `𝄪`)

**Acceptance Criteria:**

**Given** a chord whose usual root spelling would put a double flat or double sharp on a chord tone
**When** it is named and its notes are spelled
**Then** its root takes the enharmonic twin that avoids it (`E♭m7♭5` reads `D♯m7♭5`, `F♯aug` reads `G♭aug`), and where no twin exists a tone that would need a double takes its single-accidental name (`Baug` is `B D♯ G`)
**And** no name, note list, legend entry or interval readout shows `𝄫` or `𝄪`.

### Story 4.9: Keep the notes I click on the guitar

As Apor,
I want the notes I click on the guitar to stay exactly as I clicked them,
So that the app never completes my chord into a barre shape I did not ask for.

**Covers:** FR16; added after Apor tried Epic 4 (narrows Story 4.3: a voicing is shown only for a chord carried from the piano)

**Acceptance Criteria:**

**Given** I click notes on the guitar that form a named chord (for example C, E and G)
**When** the fretboard renders
**Then** it shows exactly the notes I clicked, with no added notes and no stepper, and the readout names the chord.

**Given** a chord built on the piano
**When** I swap to Guitar
**Then** it still shows as the best-ranked playable voicing with the stepper, and a fret click edits it (Story 4.6).

**Given** some lit notes were clicked on the guitar and others came from the piano
**When** I look at the fretboard
**Then** every note appears where it was placed or placed by the one-per-string rule, and no voicing is added.

### Story 4.10: Reject barres that miss the outer strings

As Apor,
I want guitar voicings that a hand can actually reach,
So that the shapes I step through and see revealed are playable.

**Covers:** FR17; added after Apor reviewed Epic 5 (2026-10-27); narrows Story 4.3 (voicing 4 of C major was `8 7 5 5 5 8`).

**Acceptance Criteria:**

**Given** a voicing whose notes at the lowest fretted fret form a barre
**When** the barre includes neither the lowest nor the highest sounding string
**Then** it does not count as one finger, each of its notes counts as one, and the four-finger limit decides
**And** the first eight C major voicings in the register of C4 E4 G4 are `8 10 10 9 8 8`, `x 3 5 5 5 3`, `x x x 5 5 3`, `x 3 5 5 5 0`, `x 3 5 0 5 3`, `8 10 10 9 8 x`, `x x 10 9 8 8`, `x x 10 12 8 12`
**And** every quality on every root keeps at least one voicing, and every shape template still matches.

## Epic 5: Chord ear practice

Apor does the Listen flow with chord qualities: a pool of qualities, optional guess, Reveal lighting the chord on the active instrument.

### Story 5.1: Choose chord practice and hear a chord

As Apor,
I want to switch Listen to chords and hear a random chord,
So that I can train my ear for chord quality as I did for intervals.

**Covers:** FR22; AD-11; UX-DR25

**Acceptance Criteria:**

**Given** the Setup panel
**When** I look at it
**Then** a Practice segmented control (Intervals, Chords) selects what Listen asks, with a Setup label, the shared selected treatment, and Intervals as the default (placement confirmed by Apor on 2026-10-27).

**Given** Chords is selected and I open Listen
**When** a question starts
**Then** a random chord from the chord pool (a Setup chip group of the nine qualities, all selected by default) plays as a plain block on both instruments (not a strum; decided by Apor on 2026-10-27), and the readout shows `Which chord?`.

**Given** the pool
**When** I untick chips
**Then** the last chip cannot be unticked (same rule as intervals) and the pool is not persisted (only sound, theme and interval pool are).

**Given** a question is generated
**When** the random function is injected
**Then** quality and root come from the seeded function in tests, every note fits the active instrument's range, and `core/` never calls `Math.random`.

**Given** `Space` in chord Listen
**When** pressed
**Then** the same chord replays identically as often as I like.

**Given** a pool, practice mode or question change
**When** it happens
**Then** it applies from the next question and the current one stays answerable.

### Story 5.2: Guess a chord quality

As Apor,
I want to click a chord quality if I feel like guessing,
So that I can test my ear without a score.

**Covers:** FR22; UX-DR10, UX-DR19, UX-DR25

**Acceptance Criteria:**

**Given** chord Listen shows a question
**When** the controls render
**Then** one answer button per quality in the pool shows (the nine qualities map to keys `1` to `9`), styled as Interval buttons with key-hint caps, and qualities outside the pool show disabled at no less than 55% opacity (layout and keys confirmed by Apor on 2026-10-27).

**Given** I choose the correct quality
**When** the guess is evaluated
**Then** the hint names it (for example `Minor. Next chord is playing.`) with no praise, and the next chord plays.

**Given** I choose a wrong quality
**When** the guess is evaluated
**Then** that button gets the wrong treatment (fill, inset ring, strike-through, `aria-disabled`, accessible name like `Minor, tried`), the hint `Minor is not it — try another.` shows, and the question stays.

**Given** a guess result
**When** it happens
**Then** a polite live region announces it and no score or streak appears.

**Given** the question is revealed
**When** I look at the buttons
**Then** they are disabled.

### Story 5.3: Reveal the chord on the instrument

As Apor,
I want to reveal the chord and see it lit on the piano or guitar,
So that I connect what I heard with its structure.

**Covers:** FR22; AD-3, AD-10; UX-DR6, UX-DR8, UX-DR21

**Acceptance Criteria:**

**Given** a chord question
**When** I press `Enter` or click Reveal
**Then** the readout shows the chord name (from the namer and spelling module), the notes light on the active instrument with their role shapes (root ringed, 3rd diamond, 5th square, 7th triangle), the role legend shows, and Reveal becomes Next
**And** the name is announced in a polite live region.

**Given** Reveal on Piano
**When** the notes light
**Then** the actual keys light and the window shifts to include them.

**Given** Reveal on Guitar
**When** the notes light
**Then** the chord shows as the best-ranked playable voicing in the register of the question chord, derived the same way as the Explore guitar (open and muted markers included, no stepper) (decided by Apor on 2026-10-27, replacing the nearest-low-frets cluster).

**Given** Next
**When** I press `Enter` or click it
**Then** a new chord plays and the notes unlight.

**Given** chord practice
**When** I reveal, guess or advance
**Then** the workspace (the chord I built in Explore) is untouched, and switching to Explore and back keeps the same question.

**Given** a reveal
**When** it happens
**Then** no score, counter or praise appears.

### Story 5.4: Fixes from the Epic 5 review

As Apor,
I want the chord answer to reveal before Next and the chord names to be short and consistent,
So that I see what I got right and the names fit the screen.

**Added after Apor reviewed Epic 5 (2026-10-27).** Reverses the Story 5.2 rule that a correct guess plays the next chord at once.

**Acceptance Criteria:**

**Given** chord Listen and a correct guess
**When** the guess is evaluated
**Then** the chord is revealed as Reveal does, the hint names the quality (for example `Min.`), and the next chord plays only when I press Next
**And** a wrong guess keeps its marked button and hint with no reveal.

**Given** the Setup chips, the answer buttons and the hints
**When** I read them
**Then** all use the short names `Maj, Min, Dim, Aug, Maj7, Dom7, Min7, m7♭5, Dim7`.

**Given** the high dim7 question (77 80 83 86)
**When** it is revealed on the guitar
**Then** the best voicing at or below fret 12 shows (a test pins its frets); the question range stays uncapped on purpose.

## Epic 6: Real instrument sound

Apor hears a sampled piano on the piano and a sampled guitar on the guitar instead of the synth, in every place the app makes a sound. The set for the active instrument loads at startup and on instrument change from bundled same-origin files, a note played while a set loads still sounds through the synth, and a set that fails to load never breaks a theory feature. A Sound control in Setup chooses Samples (the default) or Synthesized.

### Story 6.1: The engine knows the instrument

As Apor,
I want the audio engine to be told which instrument a sound is for, and the Sound setting to be stored under its final values,
So that the sampled sets in the next stories plug in without touching the UI again, and nothing changes audibly meanwhile.

**Covers:** FR23; AD-6, AD-7; NFR6

No sound changes in this story: both Sound values play the existing synth. It exists so that 6.2 to 6.4 are pure audio work. The migrations it carries are the `AudioEngine.play` signature in `src/audio/engine.ts` and `ENGINES` in `src/audio/engines.ts`.

**Acceptance Criteria:**

**Given** the `AudioEngine` interface
**When** a caller plays notes
**Then** `play` takes the instrument (`piano` or `guitar`) beside the pitches and the mode, every call site in `src/ui/session/useSessionActions.ts` passes the session's active instrument, and the fake engine in `tests/ui/support/fakeEngine.ts` records the instrument of each play
**And** a test pins that Listen interval and chord plays, Explore Play and Block, strum, arpeggio and a single-note click each reach the engine with the instrument that was active.

**Given** the `Sound` type in `src/core/model.ts`
**When** it is read
**Then** it is `samples | synthesized` and `initialSettings.sound` is `samples`.

**Given** the settings storage in `src/ui/settings/settingsStorage.ts`
**When** the app starts
**Then** sound is read synchronously from the new key `accompa.sound.v2` before the first render, a missing, unparsable or foreign value falls back to `samples`, and the Phase 1 key `accompa.sound` is never read, written or deleted (a test with `accompa.sound` set to `synthesized` still starts on `samples` and leaves that key untouched)
**And** a deliberate `synthesized` choice is saved under `accompa.sound.v2` and is still `synthesized` after a reload.

**Given** the engine selection
**When** it resolves an engine for each of the four combinations of sound and instrument
**Then** all four return the synth engine in this story, selection is keyed by sound and instrument so 6.2 and 6.3 only add entries, and a test covers the four combinations.

**Given** the engine host in `src/ui/app/App.tsx`
**When** the user swaps the instrument
**Then** the engine is not rebuilt and playback in progress is not stopped by the swap (the instrument is a play parameter), while a change of Sound still replaces the engine and stops the old one.

**Given** the Setup panel
**When** I open it
**Then** the Sound control still shows one option, `Synthesized`, and the Sound hint line is not added yet (6.2 adds Samples and the hint)
**And** with the default `samples` value no option shows selected, and clicking `Synthesized` stores `synthesized` and shows it selected. This interim state is the spec's call to confirm with Apor.

**Given** the change
**When** I run `npm run check` and `npm run build`
**Then** both pass, `src/core` is untouched, and the audible result in every section is the same as before.

### Story 6.2: Hear a sampled piano

As Apor,
I want the piano to sound like a piano,
So that the intervals and chords I train on have a real timbre.

**Covers:** FR23; AD-7; UX-DR51; NFR2, NFR12, NFR14, NFR15, NFR16

Adds the sampler engine behind the existing interface and the first sample set. The guitar still plays the synth until Story 6.3. Open items settled here: the compressed format, the encode settings, the asset location and which source notes are bundled.

**Acceptance Criteria:**

**Given** the sample format
**When** the story is specified
**Then** one compressed format is chosen that Chrome, Edge, Firefox and Safari all decode with `AudioContext.decodeAudioData`, with its encode settings, the asset location (proposed `public/samples/piano/`), the source notes bundled and the total size recorded in the spec and in `docs/codebase-map.md`
**And** the files are re-encoded from Salamander Grand Piano V3 and no dependency is added to `package.json`.

**Given** the sampler engine
**When** a piano pitch is requested
**Then** the nearest bundled sample is played, shifted by the semitone difference through the playback rate, for every MIDI pitch from 36 to 96
**And** a test pins the choice of sample and the shift for at least these pitches: a pitch that has its own sample, one a semitone above it, one a semitone below it, 36 and 96.

**Given** the sampler engine with the piano set loaded
**When** a block, an arpeggio or a strum is played
**Then** the notes sound in list order and with the same timing constants as the synth (`ARPEGGIO_STEP`, `STRUM_SPREAD`), `stop` silences everything and replay repeats the same list
**And** Listen intervals and chords, Explore block, strum and arpeggio, and a single-note click all use the piano samples when the instrument is the piano.

**Given** the app starts with Sound on `samples`
**When** the page loads
**Then** the piano set starts loading at once, no request leaves the app's own origin (a test or the browser network log shows only same-origin fetches), and theory features and the first click do not wait for the load.

**Given** the Setup panel
**When** I open it
**Then** the Sound control offers `Samples` and `Synthesized` in that order with the shared selected treatment, `Samples` is selected by default, and the hint `Samples follow the instrument: piano sound on the piano, guitar sound on the guitar.` shows under it in the muted hint style
**And** the choice persists under `accompa.sound.v2`, and choosing Synthesized plays the synth for both instruments.

**Given** the piano sound is CC-BY 3.0
**When** I use the app or read the repo
**Then** the author, Alexander Holm, and the licence are credited in the app and in a credits file in the repo and next to the samples, with the note that the author's public-domain claim of 2022-03-04 is unconfirmed
**And** the spec settles where the in-app credit sits (no UX document places it) using existing tokens and no new layout.

**Given** `src/core`
**When** the diff is read
**Then** `src/core` is unchanged and `src/audio` imports only `core` types.

**Given** a unit test environment
**When** the sampler is tested under happy-dom
**Then** a fake loader and decoder are injected so tests never fetch or decode real audio.

### Story 6.3: Hear a sampled guitar

As Apor,
I want the guitar to sound like a guitar,
So that a chord I find on the fretboard sounds the way it would in my hands.

**Covers:** FR23; AD-7; NFR13, NFR15

Adds the guitar set. The source is the FreePats Nylon-String Acoustic Guitar (CC0 1.0). The same format and location rules as Story 6.2 apply.

**Acceptance Criteria:**

**Given** the guitar sample set
**When** the story is specified
**Then** it is bundled under the asset location chosen in 6.2 (proposed `public/samples/guitar/`) in the same compressed format, with the source notes bundled chosen to cover the guitar's range (the lowest string open to fret 22 on the high string) and the size recorded, and it is credited as courtesy in the repo credits file and in the app next to the piano credit.

**Given** Sound is `samples`
**When** the instrument is the guitar
**Then** every sounding path (Listen intervals and chords, Explore Play, Block, strum, arpeggio, a single-note click, the Reveal chord) uses the guitar set, and when the instrument is the piano it uses the piano set
**And** swapping the instrument with `I` or the toggle switches the set for the next note with no gap in the app (a note on the new instrument never plays the other instrument's samples).

**Given** the app starts or the instrument changes
**When** Sound is `samples`
**Then** the set for the active instrument loads if it is not already in memory, a set that is loaded stays in memory and is not fetched again on the next swap, and the other instrument's set is not fetched until it is needed.

**Given** a strum on the guitar
**When** it plays
**Then** the notes sound from the bass string to the treble with the strum spread, as in the synth, and a test pins the order.

**Given** Sound is `synthesized`
**When** either instrument plays
**Then** the synth plays and no sample is fetched.

**Given** a guitar pitch between two bundled notes
**When** it plays
**Then** the nearest sample is shifted as on the piano, and a test pins the choice for a pitch with its own sample and a pitch one semitone off.

### Story 6.4: Loading and failure

As Apor,
I want the app to stay usable while a sound set loads and when it cannot load,
So that a click is never silent and theory features never break.

**Covers:** FR23; AD-7; UX-DR52, UX-DR53, UX-DR54; NFR2, NFR3, NFR13

**Acceptance Criteria:**

**Given** the `AudioStatus` type in `src/audio/engine.ts`
**When** it is read
**Then** it is `idle | loading | running | blocked | failed`, the status reflects the set of the active instrument, and the spec settles how the app tells the engine which instrument is active at startup and on a swap
**And** `useAudioStatus` subscribes to it and its tests cover every value.

**Given** a set is still loading
**When** I click a note, press `Space`, play a Listen question or any other sound command
**Then** the notes sound through the synth at once, so the click is never silent, and once the set is ready the next note uses the samples (a test with a never-resolving loader shows the synth is used, then resolves it and shows the samples are used).

**Given** a set is loading
**When** I look at the Status note
**Then** it reads `Loading the guitar sound.` (or `Loading the piano sound.`) in the spot of the audio-blocked note, it is inside the existing polite live region, and it disappears when the set is ready
**And** if the audio is also blocked, `Press any key to wake the sound.` takes precedence, and the loading note shows after the wake.

**Given** a set fails to load (network error, bad file or a decode error)
**When** the failure happens
**Then** the failure is sticky for that instrument for the rest of the session (no retry loop, no new fetch on each swap), every note on that instrument plays through the synth, and the Status note shows a short message in the same plain voice, for example `The guitar sound did not load. The synthesized sound is playing.` with the final text confirmed in the spec
**And** the other instrument's set is not affected, and switching Sound to Synthesized and back does not clear the sticky failure.

**Given** a load fails
**When** I use Listen, Explore, the chord readout, the voicings and the steppers
**Then** they all work exactly as with Synthesized and no error reaches the UI as an exception (a test with a rejecting loader exercises a Listen question, an Explore chord and a guitar voicing).

**Given** the loading and failure notes
**When** they show
**Then** they use the Status note's existing style, with no new component, no spinner and no animation, and no score, praise or exclamation mark.

**Given** all fetches in the app
**When** the network log is read
**Then** every request is to the app's own origin (NFR2) and a test asserts the loader builds only relative URLs.

**Given** the layout
**When** the Status note changes between the loading, failure, blocked and empty states
**Then** the layout check at 1280 x 800 shows that the instrument's top edge and the Status note stay put and the page does not scroll.

## Epic 7: Side rail navigation

Apor moves between sections from a collapsible rail on the left that opens collapsed and remembers its state. The Piano and Guitar toggle, the gear and the help hint move into it, the top strip and the `M` shortcut go, and the fretboard gets its position dots. The rail is built from a data list of sections, so the Chord drill and the Circle of fifths epics add an entry each instead of rebuilding it. Laptop only: no touch, phone or narrow-viewport handling.

### Story 7.1: The rail and its sections

As Apor,
I want a side rail that switches between Listen and Explore,
So that navigation has its permanent home and the later sections only add an item.

**Covers:** FR32; AD-6; UX-DR26 (the rail and its tokens), UX-DR27, UX-DR28, UX-DR31, UX-DR33 (rail part), UX-DR55 (rail names), UX-DR56; NFR6, NFR7

Interim state, so this story does not depend on 7.2 or 7.3: the rail takes the wordmark and the section switch. The strip stays as a slimmer header that holds only the Piano|Guitar toggle, and the Setup opener, the Help hint and the `M` key stay as they are. Story 7.2 moves the toggle, the gear and the hint into the rail and Story 7.3 removes the strip and `M`. The two items for the Chord drill and the Circle are not shown yet.

**Acceptance Criteria:**

**Given** a data list of sections (id, label, icon) in `src/ui/shell`
**When** the rail renders
**Then** it holds exactly one item per entry, the list has `Listen` and `Explore` now, and adding an entry in a test fixture adds a rail item with no other change
**And** the section the session is in is derived from the list.

**Given** the icon set
**When** it is built
**Then** nine soft-fill glyphs exist (headphones, compass, stacked notes, circle of fifths, piano, guitar, cog, help) plus the chevron, each 24px, drawn as a 1.5px round-cap outline in the current colour with a fill of about 18% of that colour, and each `aria-hidden`
**And** a test renders each one, and the Listen and Explore items show the headphones and the compass (the other glyphs are used from 7.2 and by later epics; their shapes are placeholders refined at build).

**Given** the first run (no saved rail value)
**When** the app opens
**Then** the rail is collapsed, 64px wide, full height, in the surface fill, radius 14px, no border, showing the italic `a` and icons only, and Explore is the selected section.

**Given** the rail is collapsed
**When** I click the chevron beside the wordmark, or focus it and press `Enter` or `Space`
**Then** the rail opens to 200px and shows the word `accompa`, and each item shows its icon plus its label
**And** the chevron's accessible name is `Collapse navigation` while open and `Expand navigation` while collapsed, with `aria-expanded` matching, and clicking it again collapses the rail.

**Given** the rail
**When** the pointer rests over it
**Then** nothing expands or moves on hover (no hover expansion), and the wordmark is not a Tab stop.

**Given** the collapsed or open state
**When** I reload the app
**Then** it is restored: the value is stored under its own `localStorage` key (proposed `accompa.rail`, read as `railCollapsed`) and read synchronously with the other settings before the first render, so the rail never flashes the wrong width, with `railCollapsed` added to the settings context and defaulting to `true`
**And** an unreadable, missing or foreign value falls back to collapsed, and a storage failure lasts for the visit only.

**Given** a rail item
**When** it is rendered
**Then** it is a real `button`, 44px, with the label hidden visually but still its accessible name when the rail is collapsed, and the selected one has the shared selected treatment (accent fill, on-fill text and icon, weight 600) from the same token as the other selected controls, with `aria-current="page"` on it only
**And** clicking an item switches the section, keeps the instrument and the workspace (the same behaviour as the Mode tabs today), and leaves focus on the clicked item after a pointer click.

**Given** the Tab order
**When** I press `Tab` from the start of the page
**Then** the rail comes first (the chevron, then the items), then the strip's controls and the section content as today
**And** every rail control shows the focus ring outside the control, and `Enter` or `Space` on a focused item switches to its section.

**Given** the strip
**When** the page renders
**Then** it no longer shows the wordmark or the Mode tabs, it keeps the Piano|Guitar toggle and the corner controls, and the old Mode tab tests move to rail tests with no test lost.

**Given** the layout at 1280 x 800
**When** I load the built app in headless Chrome (recipe in `docs/development-notes.md`) with the rail collapsed and open, on both instruments, in Listen and Explore
**Then** the page does not scroll (`scrollHeight` 800), the Status note stays inside the viewport, the instrument's top edge stays put inside each section as notes and states change (the new rule of UX-DR26), and the measured top edges are recorded in `docs/codebase-map.md`
**And** both themes render the rail legibly, with the selected item readable.

**Given** `prefers-reduced-motion`
**When** the rail collapses or opens
**Then** no animation runs beyond what the design specifies for other controls (UX-DR56), and the change is instant.

### Story 7.2: Instrument toggle, gear and help in the rail

As Apor,
I want the Piano and Guitar toggle, the Setup gear and the shortcuts hint at the bottom of the rail,
So that the top of the page is free and every control lives in one place.

**Covers:** FR32 (FR1, FR2 placement); UX-DR29, UX-DR30, UX-DR33, UX-DR50 (anchor), UX-DR55; NFR7

**Acceptance Criteria:**

**Given** the rail
**When** it renders
**Then** the Piano|Guitar toggle sits at its bottom as a vertical pill filled with the chip colour, two 36px segments with the piano and guitar icons (labels `Piano` and `Guitar` added when the rail is open), the selected segment using the shared selected treatment, with accessible names `Piano` and `Guitar`
**And** clicking a segment or pressing `I` swaps the instrument with the existing crossfade, and the strip no longer holds the toggle.

**Given** a section in the data list that has no instrument
**When** it is the current section
**Then** the toggle is not rendered and `I` does nothing, and the choice is kept for the other sections (tested with a fixture entry; the real section arrives in Epic 12).

**Given** the divider below the toggle
**When** the rail renders
**Then** the Setup opener (the cog, 30px circle) and the Help hint (`?`, 30px circle) sit side by side below it, in every section, the opener named `Setup` with `aria-expanded`, `aria-controls` and `aria-keyshortcuts="P"`, and its open state shows the ink glyph with a 2.4px stroke and the same chip fill
**And** the collapsed rail is 64px wide, so the spec settles how the two 30px circles and the 6px gap fit (they sum to 66px).

**Given** the Help hint
**When** I hover or focus it, or press `?`
**Then** the shortcuts list opens away from the rail edge so it stays on screen, it stays open while hovered, `Esc` closes it, and the existing help tests still pass.

**Given** the Setup panel
**When** I open it from the gear or `P`
**Then** it is the existing 560px non-modal panel, floated over the instrument at the right edge of the body (the anchor confirmed by Apor), fully visible at 1280 x 800 with the rail collapsed and open, `Esc` closes it and focus returns to the opener
**And** the strip no longer positions it, so `Corner` is replaced by rail controls and the panel component.

**Given** the Tab order
**When** I tab through the page
**Then** it is the rail (chevron, items, Instrument toggle, Setup opener, Help hint), then the section content, then the Setup panel when open
**And** the rail sits first in the DOM, and the shortcut tests that depend on focus order are updated.

**Given** the strip
**When** the page renders
**Then** it is empty and still present only until Story 7.3 removes it, with no leftover control.

**Given** the layout at 1280 x 800
**When** I load the built app in headless Chrome with the rail collapsed and open, on both instruments, in Listen and Explore, and with the Setup panel open
**Then** the page does not scroll, the instrument's top edge and the Status note stay put inside each section, and the toggle, gear and hint are fully visible at the bottom of the rail
**And** the measured values are recorded in `docs/codebase-map.md`.

### Story 7.3: Retire the strip and M

As Apor,
I want the old top strip and the `M` shortcut gone,
So that the page has one navigation and no dead code.

**Covers:** FR32; UX-DR26 (strip removed), UX-DR32 (`M` removed), UX-DR33; NFR7

**Acceptance Criteria:**

**Given** the page
**When** it renders
**Then** `ModeStrip` and its styles (`.strip`, `.strip-slot`, `.group-mode`, `.segment-mode`) are removed, so is `--spacing-strip-height` and every other strip-only token in `src/ui/theme/theme.css`, no top bar remains, and the body starts at the top of the canvas with the existing padding (`20px 56px 44px`)
**And** the instrument gets the 84px the strip used (the final heights are measured, see the layout criterion).

**Given** the `M` key
**When** I press it in any section
**Then** nothing happens, `toggleMode` and its branch in `src/ui/shortcuts/useShortcuts.ts` are removed, the `M` row is removed from the `ROWS` array in `src/ui/help/HelpHint.tsx`, and a test pins that `M` neither switches the section nor opens anything
**And** section switching is by rail click, or `Tab` then `Enter` or `Space`, only.

**Given** the planning documents
**When** the story is done
**Then** `docs/codebase-map.md` (the `shell/` row, the shortcuts and the layout numbers) and the EXPERIENCE key map and help references to `M` are updated, and `AGENTS.md` layout numbers are corrected if they changed (the instrument top 366.2 px and the Status note top 725.2 px are Phase 1 values).

**Given** the tests
**When** `npm run check` runs
**Then** the strip and `M` tests are deleted or rewritten as rail tests with no behaviour test lost, and the import-boundary check still passes.

**Given** the layout at 1280 x 800
**When** I load the built app in headless Chrome, rail collapsed and open, both instruments, Listen and Explore, with Setup open and closed
**Then** the page does not scroll (`scrollHeight` 800), the Status note stays inside the viewport, the instrument's top edge stays put inside each section, no layout regression appears in Listen (check the 250px instrument and the 12 interval buttons) or Explore, and the new measured top edges are recorded.

### Story 7.4: Fretboard position dots

As Apor,
I want inlay dots on the fretboard,
So that I find frets 3, 5, 7, 9 and 12 at a glance, like on a real guitar.

**Covers:** FR32 (Epic 7 scope as decided by Apor); UX-DR35

Independent of Stories 7.1 to 7.3; it touches `src/ui/instruments/guitar/Fretboard.tsx`, which serves Listen and Explore, so Listen is checked too.

**Acceptance Criteria:**

**Given** the fretboard in Explore or Listen
**When** it renders
**Then** a single dot sits at each of frets 3, 5, 7 and 9 and two dots at fret 12, each about 18px across, centred horizontally between the wires of that fret and vertically on the board (the double dot spaced evenly around the centre), in the muted colour at the opacity of a new token (about 35%, for example `--opacity-position-dot` in `src/ui/theme/theme.css`), light and dark
**And** nothing is drawn at the other frets.

**Given** the layers
**When** notes are lit
**Then** the dots are drawn under the strings and under every role marker, open ring and muted `x`, are not interactive (no pointer events, the click and press handling of the frets is unchanged) and are not announced (`aria-hidden`)
**And** a lit note at fret 5 still toggles and reads exactly as before.

**Given** the `frets` prop
**When** a test renders fewer frets than 12
**Then** only the dots that fit are drawn and nothing breaks, and the default 22 frets draw all of them.

**Given** the existing fretboard tests
**When** `npm run check` runs
**Then** they pass unchanged, and a new test pins the dot count (6 dots: 4 singles and 2 at fret 12) and their `aria-hidden`.

**Given** the layout at 1280 x 800
**When** I load the built app in headless Chrome on the guitar, in Explore and in Listen, in both themes
**Then** the dots are visible and muted, do not hide a role marker, the page does not scroll, and the instrument's top edge and the Status note do not move compared with before the change.

## Epic 8: Richer chord vocabulary

Apor names, sees and plays eight more chord qualities (sus2, sus4, 6, m6, add9, 9, maj9, m9) by clicking notes in Explore, 17 qualities in all. The chord table first changes shape, from a list of semitone steps to a list of tone records, so that a 9th, a 4th or a 6th is a tone with its own degree and role rather than a position in a list. Then the eight qualities are added with correct names and spellings, get their own marker shapes and legend words, and get guitar voicings under the omission rule. Listen chord practice keeps its nine original qualities. The builder that picks a root and a quality (FR28) is a later epic; in this epic the new qualities appear when Apor lights their notes.

### Story 8.1: Describe chord tones explicitly

As Apor,
I want each chord quality to be a list of tones with a degree and a role,
So that a 9th, a 4th or a 6th can be named, spelled, marked and voiced without any code assuming root, 3rd, 5th and 7th by position.

**Covers:** FR24 (groundwork); AD-3, AD-4, AD-8

**No visible change.** Every output for the nine existing qualities stays identical. This is a refactor of `src/core` with the smallest UI edit that keeps Listen unchanged.

**Acceptance Criteria:**

**Given** the code before any change
**When** the story starts
**Then** a golden test file is written first, against the current code, with literal expected values (not `toMatchSnapshot`) for the nine qualities: the `intervals`, the `degrees`, `symbol` and `name`; `chordSymbol`, `chordSpoken` and `spellChord` for all 12 roots; `exploreReading` roles and legend (role, label, note, degree) for each quality on C and on F sharp; `generateVoicings` count and first voicing after `rankVoicings` for C, F sharp and B flat of each quality; `generateChordQuestion` with a seeded `random` for each quality
**And** the file passes before the refactor and is not edited to make it pass afterwards.

**Given** `ChordQuality` in `src/core/theory.ts`
**When** I read the table
**Then** a quality holds a list of tone records ordered by degree, each with `semitones` (a pitch-class offset 0 to 11), `degree` (1, 2, 3, 4, 5, 6, 7 or 9) and `role` (`root`, `third`, `fifth`, `seventh`, `ninth`, `fourth`, `sixth`), and a boolean `listen` that is true for the nine existing qualities
**And** `intervals` and `degrees` are derived from the tones, not typed a second time
**And** a tone's octave placement is derived, never stored: a degree 9 tone with offset 2 is placed 14 semitones above the root, every other tone at its offset.

**Given** the nine existing qualities
**When** the derived values are compared with the old table
**Then** `intervals`, `degrees` and the placement of each tone are identical to before, and `DEGREE_LABELS` is keyed by degree and offset instead of by step position.

**Given** `STEP_ROLES` and `STEP_LABELS` in `src/core/explore.ts`, `CHORD_STEPS` in `src/core/spelling.ts` and `VOICING_RULES.droppableSteps` in `src/core/voicings.ts`
**When** the story is done
**Then** none of them reads a list position: roles and legend labels come from the tone's role and degree, the letter step comes from the degree table (2nd or 9th 1, 3rd 2, 4th 3, 5th 4, 6th 5, 7th 6), and `droppableSteps` becomes droppable roles (`['fifth']`), still applied only to chords of more than three tones.

**Given** the other positional code the architecture spine lists, plus the sites it does not list
**When** the story is done
**Then** the span in `generateChordQuestion` (`src/core/practice.ts`) comes from the derived placement of the last tone, `ROLE_BY_STEP` and the `intervals` lookup in `src/ui/session/useLitNotes.ts` read the tone record, and a grep for `intervals[` and index-based role arrays in `src/` finds no remaining positional use.

**Given** the Listen flag
**When** I read `src/core/model.ts`
**Then** `initialSettings.chordPool` is derived from the qualities with `listen` true, in table order, and equals the nine names it holds today
**And** the four UI sites that iterate every quality for Listen (`ChordButtons.tsx`, the chord chips in `SetupPanel.tsx`, the digit-key lookup in `useShortcuts.ts`, the pool toggle in `settings.ts`) iterate the Listen-flagged qualities through one exported list, so adding qualities in Story 8.2 leaves Listen unchanged.

**Given** the tone-record table
**When** the tests run
**Then** a core test asserts every quality is ordered by degree, has exactly one `root` tone with offset 0, has no two tones with the same offset, and that `nameChord` still matches by offsets mod 12.

**Given** the whole story
**When** `npm run check` and `npm run build` run
**Then** both pass, the golden file is unchanged, and `docs/codebase-map.md` ("Add a chord quality") describes tone records.

### Story 8.2: Name and spell the eight new qualities

As Apor,
I want sus2, sus4, 6, m6, add9, 9, maj9 and m9 chords named and spelled correctly when I light their notes,
So that Explore reads the chords I play on the piano and the guitar.

**Covers:** FR24, FR26; AD-3, AD-4, AD-10; UX-DR23, UX-DR58

**Acceptance Criteria:**

**Given** the tone-record table from Story 8.1
**When** the eight qualities are added
**Then** each is one entry, with these tones (degree and offset): sus2 (1, 2 at 2, 5 at 7), sus4 (1, 4 at 5, 5 at 7), 6 (1, 3 at 4, 5 at 7, 6 at 9), m6 (1, 3 at 3, 5 at 7, 6 at 9), add9 (1, 3 at 4, 5 at 7, 9 at 2), 9 (1, 3 at 4, 5 at 7, 7 at 10, 9 at 2), maj9 (1, 3 at 4, 5 at 7, 7 at 11, 9 at 2), m9 (1, 3 at 3, 5 at 7, 7 at 10, 9 at 2)
**And** the symbols are `sus2`, `sus4`, `6`, `m6`, `add9`, `9`, `maj9`, `m9`, the `listen` flag is false on all eight, and the internal quality names follow the existing `dom7` and `min7` style (the spec fixes them).

**Given** the lit notes of each new quality on the piano
**When** the readout names them
**Then** `nameChord` returns the quality as a reading, with no change to the namer's code beyond reading the table, and with the lowest note as root first, for example C D G reads `Csus2` first and `Gsus4/C` second, C E G A reads `C6` first and `Am7/C` second, C E♭ G A reads `Cm6` first and `Am7♭5/C` second
**And** the other readings follow in the namer's existing order.

**Given** a chord of each new quality on every one of the 12 roots
**When** `spellChord` spells it
**Then** each tone's letter is the root's letter stepped by the tone's degree (2nd and 9th by one, 4th by three, 6th by five), accidentals follow from the sounded pitch class, and no tone has a double accidental
**And** where the default root spelling would need a double accidental, the root takes its enharmonic twin, as for the existing qualities (the twin rule in `core/spelling`)
**And** a 9th spells as the 2nd's letter (C9 has D, not a doubled octave note).

**Given** the readout and the alternative readings for a new quality
**When** they render
**Then** the text comes only from `chordSymbol` and `chordSpoken` (`Csus2`, `C sus2`, `C9`), and no component spells a note or a quality itself.

**Given** Listen chord practice and the Setup chord pool
**When** the eight qualities exist
**Then** the Listen pool, its Setup chips, its answer buttons and the digit keys still show the nine original qualities, `chordPool` is the nine names, and a seeded `generateChordQuestion` returns the same questions as before (FR26, tested)
**And** a pool that holds a name without the `listen` flag is not reachable from the UI.

**Given** the full table of 17 qualities
**When** the core tests run
**Then** a test asserts that for every quality and every root, `nameChord` of the root-position pitches returns that quality and root among its readings, and that no two qualities share the same offset set unless the test lists the pair on purpose.

**Given** this story generates and ranks readings
**When** the story spec is drafted
**Then** the spec carries golden examples (the ordered readings and the spelled tones for named pitch sets, including the three above and one on a flat root and one on a sharp root) confirmed by Apor before the build.

**Given** the readings of an inverted chord with a new quality
**When** a note set such as E G A C (C6 in first inversion) is named
**Then** the story's tests record the namer's actual order (`Am7/E` ranks before `C6/E` because roots follow low to high), so Story 9.1 can keep the chord Apor stepped to; nothing in this story changes that order.

### Story 8.3: Roles for the new notes

As Apor,
I want the 2nd or 9th, the 4th and the 6th to have their own shape and colour,
So that I can see what each note is doing in a sus, sixth or ninth chord without relying on colour.

**Covers:** FR24; AD-4; UX-DR26 (role tokens only), UX-DR36, UX-DR37, UX-DR24, UX-DR55

**Acceptance Criteria:**

**Given** `Role` in `src/core/explore.ts` and the role marker in `src/ui/shared/RoleMarker.tsx`
**When** the story is done
**Then** `Role` also holds `ninth`, `fourth` and `sixth`, and the marker draws them from the tone's role: `ninth` a regular pentagon, `fourth` a flat-top hexagon, `sixth` a five-point star with an inner radius of about 48% of the outer, each with the 1.8px ink outline and at least 18px across, the star drawn about 15% larger than the other shapes so its points read
**And** the one `RoleMarker` serves the piano, the guitar and the legend, as the existing shapes do.

**Given** the design tokens
**When** I read `src/ui/theme/theme.css`
**Then** `--color-role-ninth`, `--color-role-fourth` and `--color-role-sixth` exist in light and dark with the values from DESIGN.md (`#D6B9EA`, `#9ED6D8`, `#D3DE9A` light; `#B896D0`, `#7FBFC2`, `#B5C27A` dark), declared for the system dark query and for the manual dark theme exactly as the existing role tokens are
**And** `.marker-ninth`, `.marker-fourth` and `.marker-sixth` in `src/ui/instruments/instruments.css` fill from them, and the piano's `data-tint` rules in `piano.css` give the three roles the same 80% tint on white and black keys as the existing roles.

**Given** a lit chord with a new quality on the piano or the guitar
**When** it renders (for example C D G, C E G A, C E G B♭ D)
**Then** the exploreReading roles are `ninth` for the 2nd of sus2 and the 9th of add9, 9, maj9 and m9, `fourth` for the 4th of sus4, `sixth` for the 6th of 6 and m6, and each note shows its shape with its fill
**And** on the guitar the open string shows the role shape inside the nut ring as for existing roles, and a fretted note shows the shape on the fret.

**Given** the role legend
**When** a chord with a new tone is lit
**Then** the entry for that tone reads from its degree, `2nd D (M2)` on sus2, `4th F (P4)` on sus4, `6th A (M6)` on 6 and m6, `9th D (M9)` on add9, 9, maj9 and m9, in the same shape-plus-label form as `5th G (P5)`, with one entry per role present
**And** the interval labels M2, P4, M6 and M9 are entered in the one degree-label table in `src/core/theory.ts`, and the spec asks Apor to confirm them.

**Given** the readout for C9, Cmaj9 and D♭maj9 (the longest legend)
**When** I look at the Explore screen at 1280 x 800
**Then** the legend stays on one line inside the readout block, the instrument's top edge stays at the same position as for a triad, the Status note stays put, the page does not scroll, and Listen looks the same as before (headless Chrome check, light and dark)
**And** the dark theme values, which were computed but never viewed, are looked at in the same check and any retune is reported to Apor.

**Given** the 9th and the 7th, which are 1.10 (light) and 1.14 (dark) apart in colour
**When** I look at C9
**Then** the pentagon and the triangle are told apart by shape alone, and a test asserts the two roles render different shapes and different `data-role` values.

**Given** forced-colors mode (headless Chrome with `forced-colors: active` emulated)
**When** a chord with all of root, 3rd, 5th, 7th and 9th is lit
**Then** every marker keeps its outline and shape, so each role is still told apart without colour.

**Given** the unit tests
**When** `npm run check` runs
**Then** component tests assert the three shapes (point counts 5, 6 and 10 for pentagon, hexagon and star), the legend texts above, and that markers read the role and not a list position.

### Story 8.4: Guitar voicings for the new qualities

As Apor,
I want to carry a sus, sixth or ninth chord to the guitar and step through playable voicings,
So that I can find a shape for it as I can for the original nine.

**Covers:** FR25; AD-8, AD-9

**Acceptance Criteria:**

**Given** a lit chord of any new quality on the piano, then the guitar
**When** the voicing list is generated
**Then** `generateVoicings` uses the omission rule by role: required are the root, the third or the sus tone, and every tone beyond the triad (6th, 7th, 9th); the only droppable tone is the one with role `fifth`, and only on a chord of more than three tones; the root is never dropped; sus2 and sus4, with three tones, drop nothing
**And** the rule is decided by role in `VOICING_RULES`, never by list position.

**Given** a 9, maj9, m9 or add9 chord
**When** any voicing is listed
**Then** it sounds the 9th, and a test asserts no listed voicing for those qualities lacks it.

**Given** the existing rules (max fret 12, span 4 frets, open strings only at or below fret 5, at most 4 fingers, mute only outside the sounding strings)
**When** the new qualities are generated
**Then** the rules are unchanged and still read from `VOICING_RULES`, one string sounds one note, and every listed voicing's pitch classes are all tones of the chord.

**Given** the ranking
**When** the voicings of a new quality are ranked
**Then** the existing order holds (register bucket, template match, more sounding strings, smaller span, fewer distinct frets, distance), and within one bucket a voicing that keeps the fifth ranks ahead of one that drops it, so the fuller voicing comes first
**And** the eight new qualities have no entry in `SHAPE_TEMPLATES`, `shapeFrets` returns an empty list for them (tested), and the list is generated voicings only (AD-9).

**Given** a chord with no playable voicing in the allowed region
**When** the list is empty
**Then** the result is an empty list, not an error, and the guitar shows the existing empty state with the Status note `No voicing fits these notes.`

**Given** each of the 17 qualities on all 12 roots
**When** the voicing tests run
**Then** a test asserts every list is non-empty or lists the combination on purpose, and that the nine original qualities give the same first voicing as before (the golden file from Story 8.1 still passes)
**And** the existing test that every shape template yields exactly its chord's pitch classes still passes.

**Given** a new-quality chord on the guitar
**When** I use the voicing stepper
**Then** it shows `Voicing 1 of N` with N from the generated list, steps with the arrows and `Left` and `Right`, does not wrap, and Play and Block sound the shown voicing, exactly as for the original nine
**And** the role legend and markers on the fretboard follow Story 8.3.

**Given** this story generates and ranks voicings
**When** the story spec is drafted
**Then** the spec carries golden examples (the first ranked voicing for named chords, for example Csus2, Dsus4, C6, Am6, Cadd9, C9, Cmaj9, Am9 and a flat-root chord, with their frets) confirmed by Apor before the build, and tests assert them exactly.

**Given** the whole story
**When** I look at the guitar Explore screen at 1280 x 800 with a new-quality chord and a stepper
**Then** nothing in the layout changed (no CSS is touched), and `npm run check` and `npm run build` pass.

## Epic 9: Inversions

Apor puts a named chord in root position, 1st, 2nd or 3rd inversion on the piano and on the guitar, and the chord is named as a slash chord. The piano needs no voicing generator, only one pure layout function; the guitar narrows its voicing list to shapes whose lowest note is the chosen bass. The inversion belongs to the workspace chord, survives an instrument swap, and goes away when the notes are edited. Inversions are Explore only and there is no ear practice for them.

### Story 9.1: Invert a chord on the piano

As Apor,
I want to step a chord through its inversions on the piano,
So that I can hear and see the same chord with a different note in the bass.

**Covers:** FR27; AD-5, AD-8, AD-10; UX-DR37, UX-DR41 (piano), UX-DR53

**Acceptance Criteria:**

**Given** `Workspace` in `src/core/model.ts`
**When** I read it
**Then** it has an optional `bass`, the pitch class of one of the chord's own tones; absent means root position
**And** `bass` is dropped by any action that changes the lit pitches other than the inversion step (clicking or adding or removing a note, a guitar hand edit, Esc clear), and whenever the lit notes no longer contain its pitch class (reducer tests).

**Given** the pure layout function in `src/core` (for example `src/core/inversions.ts`)
**When** it takes lit pitches and a bass pitch class
**Then** tones above the bass keep their place, tones below the bass move up an octave, so the bass becomes the lowest note, with no randomness and no UI import
**And** tests written first assert exact pitches, for example C4 E4 G4 to bass E gives E4 G4 C5, to bass G gives G4 C5 E5, and C E G B♭ to bass B♭ gives B♭ C5 E5 G5 in the octave order the spec fixes.

**Given** the stepping back to a lower inversion
**When** I step from 1st inversion to Root position
**Then** the chord returns to the pitches it had before (C4 E4 G4), not an octave higher, for any chord whose notes lie within one octave of its lowest note, and the spec carries the rule and golden examples for wider spreads
**And** a chord whose layout would leave the piano's MIDI 36 to 96 range is never lit beyond it (the spec fixes whether the step is inert or the chord drops an octave).

**Given** the tone order of a quality (root, third or sus tone, fifth, then the extensions, by degree)
**When** the number of inversions is computed
**Then** a chord of three tones has Root position, 1st and 2nd; a chord of four or more has Root position, 1st, 2nd and 3rd; none goes past 3rd, so a 9, maj9 or m9 chord never has the 9th in the bass; fewer than three tones have none
**And** the inversion shown is the index of the effective bass in tone order, where the effective bass is the workspace `bass`, else the namer reading's slash bass, else the root, so a hand-built E G C starts at `1st inversion`.

**Given** a named chord lit on the piano in Explore
**When** I look at the Voicing row
**Then** an inversion stepper shows `◀ Root position ▶`, then `1st inversion`, `2nd inversion`, `3rd inversion`, in the same component style as the voicing stepper (40 x 40px arrow targets, `·` and an inert end instead of an arrow at either end, no wrap), in the row that is already reserved, and it is the only stepper on the piano
**And** it shows for any named chord, hand-built or later picked, and is hidden for fewer than three lit pitch classes or a set the namer cannot name.

**Given** I press an arrow or the key set for the inversion stepper (`Up` and `Down`, decided by Apor on 2026-10-28)
**When** the step runs
**Then** one reducer action runs the layout once, stores the result in `pitches`, sets `bass`, refits the piano window so every lit note is visible, plays nothing, and leaves `practice` untouched by reference (reducer tests assert both halves, as the existing tests do)
**And** a chosen root (the `R` choice) moves with its note when that note moves an octave, so the root marker stays on the same pitch class.

**Given** a chord stepped to an inversion
**When** the readout renders
**Then** it names it through `nameChord` as a slash chord, `C major / E` for the large name and `C/E` as the symbol, with the quality and the bass from the reading
**And** the action keeps the reading the chord had when it was stepped (the workspace `reading` is set to the lead reading), so C6 in first inversion reads `C6/E` and does not turn into `Am7/E`, which the namer ranks first for those notes (the namer is not changed).

**Given** each step
**When** it completes
**Then** a polite live region announces the new state (`1st inversion`, `Root position`), and focus moves to the remaining arrow if the focused one goes inert.

**Given** the new row content
**When** I look at the Explore piano screen at 1280 x 800
**Then** the instrument's top edge, the Status note and the readout block keep their positions, the page does not scroll, and Listen is unchanged (headless Chrome check, light and dark).

### Story 9.2: Invert on the guitar

As Apor,
I want the inversion stepper on the guitar to narrow the voicings to shapes with that bass note,
So that I can find a playable inversion and still step through the others.

**Covers:** FR27; AD-5, AD-8; UX-DR19, UX-DR33, UX-DR41 (guitar), UX-DR42, UX-DR53

**Acceptance Criteria:**

**Given** `generateVoicings` in `src/core/voicings.ts`
**When** it is called for an explicit inversion (the workspace `bass` is set)
**Then** the bass filter is strict: only voicings whose lowest sounding note has the bass pitch class are returned, with no silent fallback to other voicings, even when that list is empty
**And** when no bass is set (Root position) the existing behaviour holds: the lowest-note preference for the root with its fallback (tests assert both cases, and the golden file for root position is unchanged).

**Given** the chord on the guitar and the inversion stepper
**When** I step to 1st inversion of C major
**Then** the voicing list holds only voicings whose lowest note is E, `Voicing 1 of N` shows the new N, the first of the filtered list is shown (any earlier selected voicing is cleared), and the role markers and the readout (`C major / E`) agree with it
**And** the ranking is unchanged apart from the filter, the cached ranking in `src/ui/session/useLitNotes.ts` is keyed by the bass too, and the spec carries golden examples (the first voicings for named chords and inversions, for example C major 1st and 2nd inversion, G7 3rd inversion, Csus2 1st inversion) confirmed by Apor before the build.

**Given** an inversion with no voicing in the allowed region
**When** the list is empty
**Then** the fretboard is empty, the Status note says `No voicing fits these notes.`, the notes stay lit on the piano, the voicing stepper is hidden, and the inversion stepper stays so I can step back
**And** the polite live region announces the note.

**Given** the guitar Voicing row
**When** a chord has two or more voicings
**Then** both steppers sit on one line, the voicing stepper first, a 40px gap, then the inversion stepper, each with 40 x 40px arrow targets, and in the DOM and Tab order the voicing arrows come before the inversion arrows, after the readout alternatives and before the instrument (as the focus order requires)
**And** with one voicing only the inversion stepper shows, centred as on the piano.

**Given** the keys
**When** I press `Left` or `Right`
**Then** they step voicings on the guitar exactly as before and do nothing on the piano, and the inversion keys (`Up` and `Down`, decided by Apor on 2026-10-28) step the inversion on both instruments, with the same yield rules (not from a focused radio, chip or text field; allowed from the instrument and the steppers), `event.repeat` ignored, and the shortcuts list (`ROWS` in `src/ui/help/HelpHint.tsx`) and `aria-keyshortcuts` updated.

**Given** focus on an arrow of either stepper
**When** that arrow goes inert or its stepper hides
**Then** focus moves to the remaining arrow of the same stepper, else to the other stepper, else to the instrument.

**Given** a chord whose notes were clicked on the guitar (not carried from the piano)
**When** I step the inversion
**Then** the layout runs once as on the piano, the remembered guitar positions are forgotten as when a hand edit is left, and the chord is shown as the filtered voicing list (the spec confirms this decision with Apor)
**And** an edited voicing is left in the same way.

**Given** a swap from the guitar to the piano
**When** I swap
**Then** the piano shows the lit pitches the last step stored, with the same inversion in the stepper.

**Given** the guitar Explore screen with a chord, both steppers and the no-voicing state
**When** I look at it at 1280 x 800
**Then** the instrument's top edge and the Status note keep their positions, the line holds both steppers without wrapping for the longest labels (`Voicing 12 of 99` and `1st inversion`), the page does not scroll, and Listen is unchanged (headless Chrome check, light and dark)
**And** `npm run check` and `npm run build` pass.

### Story 9.3: Keep the inversion across swaps and clear it on edits

As Apor,
I want the inversion to stay while I swap instruments and to go away when I change the chord,
So that what the stepper says always matches the notes.

**Covers:** FR27; AD-5; UX-DR22, UX-DR41 (focus and reset), UX-DR53; NFR6

**Acceptance Criteria:**

**Given** a chord in 2nd inversion on the piano
**When** I swap to the guitar and back
**Then** the workspace `bass` is the same value, the pitches are the same, the stepper reads `2nd inversion` on both instruments, and the guitar list is the one filtered to that bass (reducer and component tests, with the instrument and mode changes leaving `workspace` unchanged by reference)
**And** the same holds after swapping with the guitar showing the no-voicing state.

**Given** a chord in an inversion
**When** I click a lit note off, click a new note on, or click a note on either instrument
**Then** `bass` is dropped, the stepper reads `Root position` or the inversion the new notes read as (from the namer's slash bass), and no stale inversion is announced
**And** when the clicked note leaves the chord unnamed, the stepper hides.

**Given** a chord in an inversion on the guitar
**When** I hand-edit the voicing by clicking a fret
**Then** `bass` is dropped by the edit, and the stepper reads from the edited notes' reading.

**Given** a chord in an inversion
**When** I change the root (`R` then click a lit note, or an alternative reading)
**Then** choosing a root with `R` drops `bass`, and choosing an alternative reading keeps `bass` and recomputes the inversion number from the new reading's tone order (E in the bass is `1st inversion` of C6 and `2nd inversion` of Am7)
**And** the readout, the legend and the stepper agree.

**Given** a chord in an inversion
**When** I press `Esc` and clear the notes
**Then** the workspace is empty with no `bass`, and `Notes cleared. Undo` shows; pressing Undo restores the notes and the same `bass`, so the stepper reads the same inversion as before the clear
**And** a new note change after Esc discards that undo with the inversion, as the notes are discarded today.

**Given** every action that writes the workspace (toggleNote, chooseReading, chooseRoot, selectVoicing, editVoicing, dismiss, undoClear, the inversion step)
**When** the reducer tests run
**Then** a table-driven test states for each whether `bass` is kept, recomputed or dropped, and that `practice` is the same reference after each
**And** a Listen question or reveal does not read or change `bass`.

**Given** the settings and storage
**When** I reload the app
**Then** no inversion is restored (nothing is persisted under any key, NFR6), and the stepper reads `Root position` for any chord.

**Given** the whole story
**When** I do the sequence in a real browser at 1280 x 800 (a chord on the piano, 1st inversion, swap, step voicings, swap back, click a note, Esc, Undo)
**Then** the instrument's top edge and the Status note stay put, the page does not scroll, and `npm run check` and `npm run build` pass.

## Epic 10: Chord builder

Apor picks a root and a quality in Explore and the chord lights on the instrument, is named, plays as a block or an arpeggio, and carries to the guitar as a voicing he can step through. The builder needs the 17 qualities (Epic 8), the inversion and bass model (Epic 9) and the side rail layout (Epic 7). The first story is pure core and reducer work, the second is the pointer UI on the piano, the third makes the same row work on the guitar.

### Story 10.1: Place a picked chord

As Apor,
I want a chord picked by root and quality to replace what is lit, named and undoable,
So that the builder row has a tested engine before any button exists.

**Covers:** FR28; AD-3, AD-5, AD-8, AD-10, AD-11

**Acceptance Criteria:**

**Given** a root (a spelled note, so C sharp and D flat are different roots) and one of the 17 qualities
**When** `rootPositionPitches(root, quality)` is called (new, in `src/core`, with its tests written first in `tests/core`)
**Then** it returns the chord's tones ascending from the root, the root in C4 to B4 (MIDI 60 to 71), each later tone the next pitch above the previous one that has the tone's pitch-class offset (a 9th therefore lands in the next octave), with one pitch per tone and no doubling
**And** it takes no random function and never calls `Math.random`
**And** for all 12 roots and all 17 qualities every pitch lies inside the guitar range (40 to 86) and the piano range (36 to 96).

**Given** the pitches of a picked chord
**When** `nameChord` reads them
**Then** the first reading has the picked root's pitch class and the picked quality for all 12 roots and all 17 qualities, because the root is the lowest note
**And** the spec will carry golden examples (the pitches for C major, B flat maj7, F sharp m7, C sharp 9, A flat sus4 and E m9, and the first guitar voicing for each named pick) confirmed by Apor before build.

**Given** a new reducer action (for example `pickChord`) in `src/ui/session/session.ts` with the picked root and quality
**When** it is dispatched in Explore
**Then** `workspace` is replaced by one holding the chord's pitches, empty `positions`, no `voicing`, no `edited`, no `bass` and no `root` override, and a `reading` choice carrying the picked spelled root and quality
**And** the previous workspace is not kept for Undo as a clear, but the replacement is undoable in one step by the same Undo that Esc-clear uses (a spec decision: the previous workspace is stored in `cleared`, which keeps the Status note Undo button working)
**And** `practice` is the same object reference afterwards (the reducer test asserts it, as the other action tests do).

**Given** `ChordReading.root` and `ReadingChoice.root` (AD-3, AD-10)
**When** this story lands
**Then** a `SpelledNote` type (the AD-2 struct, `letter` 0 to 6 and `accidental` as a semitone offset) exists in `src/core` (in `pitch.ts` or `spelling.ts`), with a function that spells a tone from a spelled root and a tone degree (AD-3 letter steps and the twin rule), and both fields carry a spelled note instead of a pitch class
**And** `nameChord` still takes only pitches and returns the same readings in the same order for every input, now with the root spelled by the default table, and every output and test of Epics 1 to 5 (names, spellings, roles, voicings, practice) is unchanged
**And** Stories 11.1 and 12.1 reuse this type and no second spelled-note struct is added.

**Given** the user picked C sharp, then D flat, with the same quality
**When** the readout is read
**Then** it shows the user's spelling (`C♯maj7` then `D♭maj7`) from `nameChord` and `src/core/spelling.ts` and from no second naming path, and the pitches are identical in both cases.

**Given** a chord was lit by hand and an inversion was set
**When** a chord is picked
**Then** the lit notes, the positions, the voicing and the bass are all replaced, the inversion is back to root position, and `rootArmed` is false.

**Given** the action runs in Listen or in the drill
**When** it is dispatched
**Then** the state is returned unchanged (the workspace has one writer, Explore).

**Given** the piano is showing
**When** a chord is picked
**Then** the piano window refits so every lit note is visible (the existing `fitRevealed` path).

### Story 10.2: The builder row

As Apor,
I want 12 root cells and 17 quality chips at the bottom of Explore,
So that I can pick any chord with two clicks and hear it.

**Covers:** FR28; AD-5, AD-10; UX-DR18, UX-DR24, UX-DR33, UX-DR38, UX-DR39, UX-DR40, UX-DR55, UX-DR57

**Acceptance Criteria:**

**Given** Explore on the piano
**When** I look at the control line
**Then** Play (`Space`) and Block (`Enter`, primary) sit on one line with the 12 root cells, Play and Block at 20px type and 12px 24px padding so everything fits 1152px, and the 17 quality chips sit on the line under it, above the Status note (UX-DR40)
**And** the existing Explore controls, the Status note and `Undo` keep working.

**Given** the root cells
**When** they render
**Then** there are 12 cells, 50px squares, radius 11px, gap 4px; the seven naturals are one button each with the name at 21px; the five two-spelling roots (C sharp / D flat, D sharp / E flat, F sharp / G flat, G sharp / A flat, A sharp / B flat) are one square cut by a top-right to bottom-left diagonal hairline, sharp in the upper left and flat in the lower right at 15px, each half its own button (UX-DR38)
**And** the accessible names are `C`, `D` and so on, and for the split cells `C sharp` and `D flat` and so on, so the diagonal is never the only cue (UX-DR55)
**And** the selected cell or half takes accent fill and weight 700 and exposes `aria-pressed="true"`.

**Given** the quality chips
**When** they render
**Then** there are 17 chips, 58px wide, gap 5px, in four groups on one line with 12px italic muted group labels and 16px between groups: Triads (maj, min, dim, aug, sus2, sus4), Sixths (6, m6), Sevenths (maj7, 7, m7, m7 flat 5, dim7), Ninths (add9, 9, maj9, m9), all visible with no submenu (UX-DR39)
**And** the chip list is derived from the quality table in `src/core/theory.ts` plus a group field, not typed a second time in the UI, and the chip labels are the short forms while the readout name comes from the namer
**And** each chip's accessible name includes the group (`Sevenths, maj7`), the selected chip is accent filled at weight 700 and exposes `aria-pressed="true"`.

**Given** a root is chosen and no quality
**When** I click a quality chip first or a root first
**Then** nothing lights until both are chosen (quality before root does nothing, root before quality does nothing), and the chosen cell or chip is highlighted meanwhile
**And** the highlights are builder state held in the UI (a small component-level or Explore-scoped state), never in the workspace, practice or settings, and not persisted.

**Given** both a root and a quality are chosen
**When** the second one is clicked
**Then** the chord replaces whatever was lit through the Story 10.1 action, with no confirmation, is named in the readout, and plays as a block through the existing Block path (the sound of a pick is a decision for the spec; the default is the block)
**And** both the root cell and the quality chip stay highlighted, and clicking a different root or quality afterwards replaces the chord again with the other one kept.

**Given** both highlights are showing
**When** I click a note by hand, toggle one off, use the root-set `R` flow, edit a voicing, press `Esc`, or press Undo
**Then** both highlights clear, because they no longer describe the lit notes
**And** switching instrument, stepping a voicing or stepping an inversion leaves them on (they still describe the chord).

**Given** the builder row
**When** I use the keyboard
**Then** the cells and chips are real buttons reachable by `Tab` in the order readout alternatives, steppers, instrument, Play and Block, root cells, quality chips, Undo; `Space` and `Enter` on a focused cell or chip activate it and do not trigger Play or Block (the shortcut-yield rule); there is no arrow-key or letter shortcut for picking (pointer-first, UX-DR32)
**And** each has the 2px ink focus ring with 2px offset drawn as a real outline (UX-DR18), and cells and chips are real buttons so forced-colors mode shows them (UX-DR24)
**And** a pointer click on a cell or chip returns focus to the instrument, as for other controls outside the Setup panel.

**Given** the new tokens (chord-chip, chip-label, rounded cell, spacing for cells and chips)
**When** the CSS is added
**Then** they are defined once in `src/ui/theme/theme.css` for light and dark, and no touch, phone or narrow-viewport rule is added.

**Given** the change touches layout
**When** the built app is loaded in headless Chrome at 1280 x 800
**Then** on the piano and on the guitar and in both themes the page does not scroll (`scrollHeight` 800), the instrument's top edge stays put and the Status note stays put when a chord is picked, a quality group label is never clipped, and Listen is checked too because the shared readout block and instrument components are untouched in size.

**Given** UX-DR57 Flow 4, steps up to and including `m9 replaces the chord and keeps the root cell lit`
**When** the acceptance script is run by test on the piano
**Then** pick F sharp then m7: the chord is named `F♯m7`, plays, and both highlights show; pick m9: the chord is replaced, the F sharp cell stays lit.

### Story 10.3: The builder on the guitar

As Apor,
I want a picked chord to show on the guitar as a playable voicing I can step through,
So that I can find the chord on the neck as well as on the keys.

**Covers:** FR28; AD-5, AD-8, AD-10; UX-DR36, UX-DR37, UX-DR40, UX-DR42, UX-DR57

**Acceptance Criteria:**

**Given** a chord picked on the piano
**When** I swap to the guitar (`I` or the toggle), or I pick on the guitar
**Then** the chord shows as the best-ranked voicing from `generateVoicings` and `rankVoicings` with open and muted markers, the ranking's source mean pitch taken from `rootPositionPitches(root, quality)` (AD-8), so the first voicing is the same whichever way the chord got there
**And** the spec will carry golden examples (the first guitar voicing for the named picks of Story 10.1) confirmed by Apor before build, and a test pins them.

**Given** the guitar shows a picked chord
**When** I use the voicing stepper or `Left` and `Right`
**Then** it cycles the other voicings as for a hand-built chord with the count `Voicing 2 of 8` in the existing live region, and the builder highlights stay on (stepping does not change root or quality)
**And** a pick made while the guitar is showing does not use `placeLit` to choose frets: the notes come from the ranked voicing and `workspace.positions` stays empty so the chord counts as carried.

**Given** the guitar holds one lit note per string
**When** a voicing is shown
**Then** the lit notes are placed with `placeLit` and `pitchesOnString` as the existing carry flow does, and no new code in the UI chooses frets.

**Given** a shown voicing
**When** I look at the markers and the legend
**Then** role shapes (including the ninth, fourth and sixth shapes from Epic 8) and the legend words come from the namer's reading of the lit notes and the quality's tone records, with `root C`, `3rd E`, `9th D` style entries (UX-DR36, UX-DR37), and an omitted fifth simply has no legend entry.

**Given** I swap to the piano and back
**When** I look at the guitar
**Then** the same voicing is shown (positions, voicing and bass survive a swap, AD-5), and the builder highlights are unchanged.

**Given** a picked chord with no playable voicing at the current register and region
**When** the guitar is showing
**Then** the Status note reads `No voicing fits here. Try widening the region.` or the Epic 9 wording `No voicing fits these notes.` where a bass is set, the lit notes stay as the carried pitches, the stepper stays, and picking another chord works
**And** the piano still shows the chord.

**Given** a hand click or a fret edit on the guitar after a pick
**When** it happens
**Then** both builder highlights clear (Story 10.2) and the chord is read by the namer as any hand-built chord.

**Given** a picked chord with an inversion set (Epic 9) and then another pick
**When** the new chord is picked
**Then** the inversion resets to root position (UX-DR40) and the voicing list is the unfiltered list.

**Given** UX-DR57 Flow 4 in full
**When** the acceptance script is run by test
**Then** pick F sharp m7, swap to the guitar, step voicings, choose 2nd inversion and see the list narrow, pick m9 and see the root cell lit, and a no-voicing pick keeps the stepper.

**Given** the change touches the guitar layout
**When** the built app is loaded in headless Chrome at 1280 x 800
**Then** in both themes the page does not scroll, the instrument's top edge and the Status note stay put between a pick, a step and a no-voicing state, and the builder row fits on the guitar as it does on the piano.

## Epic 11: Chord drill

Apor opens Chord drill, sees a chord name, builds it on the active instrument, presses Try to check it, and presses Reveal whenever he wants to see the answer. There is no score, no streak and no praise. The check is a pure core function that accepts any voicing, octave or inversion. The drill needs the 17 qualities (Epic 8), the side rail (Epic 7) and `rootPositionPitches` (Story 10.1).

### Story 11.1: The drill's check, question and state slot

As Apor,
I want the drill to draw a chord and judge my notes by the chord's required tones,
So that any correct voicing counts and the drill can never disturb what I built in Explore or Listen.

**Covers:** FR29, FR30; AD-4, AD-5, AD-8, AD-11, AD-13; NFR9, NFR10

**Acceptance Criteria:**

**Given** a new pure function (for example `checkDrillAnswer(lit, root, quality)` in a new `src/core/drill.ts`, tests written first)
**When** it is called with the lit pitches and the asked chord
**Then** it returns right when every required tone is present by pitch class and no lit pitch has a pitch class outside the chord, and otherwise wrong, with the lit pitches that are outside the chord listed in lit order
**And** octave, voicing, inversion and doubled notes do not matter
**And** it does not call `nameChord` and returns no name, so `nameChord` stays the only source of chord names.

**Given** the required tones
**When** they are derived
**Then** they come from `VOICING_RULES` (`src/core/voicings.ts`) and the tone roles of the quality (AD-4, AD-8): the root, the third or sus tone and every tone beyond the triad are required; only the tone with the `fifth` role may be absent, and only for a chord of more than three tones; sus chords and triads drop nothing
**And** the decision reads the tone's role, never its position in a list.

**Given** a chord of more than three tones
**When** the fifth is not lit but every other tone is
**Then** the answer is right (an omitted fifth counts), for example C E B for C maj7 and C E Bb D (no G) for C 9, and a triad without its fifth is wrong
**And** the spec will carry golden examples (accepted and rejected sets for at least C major, C sus2, C 6, C maj7, C 9 and C m7 flat 5, in two octaves and an inversion each) confirmed by Apor before build.

**Given** extra or missing tones
**When** one lit note is outside the chord
**Then** the answer is wrong and that note is in the returned list; when a required tone is missing and nothing is outside, the answer is wrong and the list is empty (missing notes are never reported, UX-DR44).

**Given** a question draw (for example `generateDrillQuestion({ random })` in `src/core`)
**When** it is called with an injected random function
**Then** the quality is drawn from all 17 qualities and the root from all 12 spelled roots (the five two-spelling roots take the default spelling table's name, as `noteName` does), the reference pitches come from `rootPositionPitches`, tests use a seeded function, and every pitch fits both instruments
**And** `core/` never calls `Math.random`, and neither pool is a Setup option.

**Given** the drill's own practice slot (AD-5)
**When** the state is extended in `src/core/model.ts`
**Then** `Practice` gains an optional drill field holding the asked chord (root, quality, reference pitches), the count of wrong Tries, whether the answer is shown (right or revealed), and the drill's lit `pitches` and `positions` in the shape of the workspace's, edited with `toggleLit`, `placeLit` and `pitchesOnString` (never by choosing frets), with the same eight-note limit
**And** the field is absent until the first question so interval and chord Listen state is unchanged (existing tests still pass untouched).

**Given** new reducer actions in `src/ui/session/session.ts` (for example `setDrillQuestion`, `toggleDrillNote`, `tryDrill`, `revealDrill`, `clearDrillNotes`)
**When** each is dispatched
**Then** it changes only the drill field, and reducer tests assert by reference that `workspace` and Listen's `question`, `chordQuestion`, `wrongMarks`, `chordWrongMarks` and `fixedRoot` are the same objects afterwards
**And** the actions return the state unchanged when no drill question exists, and `tryDrill` with fewer than three lit notes, or after the answer is shown, returns the state unchanged.

**Given** the drill's note toggling
**When** a note is toggled on the guitar
**Then** the one-lit-note-per-string rule applies exactly as in Explore, using the same helpers.

### Story 11.2: The drill section

As Apor,
I want a Chord drill screen where I see a chord name and light notes on the instrument,
So that I can practise building chords from their names.

**Covers:** FR29; AD-5; UX-DR28, UX-DR33, UX-DR43, UX-DR44, UX-DR45

**Acceptance Criteria:**

**Given** the rail
**When** the Chord drill item is added
**Then** it is one more entry in the data-driven section list from Epic 7 (label `Chord drill`, stacked-notes icon), not a hand-written second item, and it behaves as the other items: `aria-current="page"`, instrument and workspace kept.

**Given** I enter Chord drill, from the rail or at any later time
**When** the section opens
**Then** a new question is drawn at once with `Math.random` injected only in `useSessionActions`, the board is fresh (no lit notes), and nothing sounds (no auto-play of the question; the name is the question)
**And** coming back to the drill later draws another question (the drill question is not persisted and not kept across sections).

**Given** the drill screen
**When** it renders
**Then** the readout is the asked chord's name, taken from `nameChord` of the reference pitches (the first reading has the asked root and quality) and the spelling module, with the one-line hint row, a role-legend row that is reserved (same height, empty) so nothing moves when it fills, the instrument, then the action row Play (`Space`), Try (`Enter`, primary) and Reveal (`R`), as in `mockups/chord-drill.html` (UX-DR43)
**And** the readout and hint use the same block height as Explore so the instrument sits in the same place as in Explore.

**Given** I click notes
**When** a note is lit on the piano or on the guitar
**Then** it sounds and shows as the plain no-role dot (UX-DR45: small solid ink dot, surface colour on black piano keys), never a role shape, and no legend shows
**And** the notes are the drill's own lit notes (Story 11.1): the Explore chord and the Listen question are unchanged by lighting, clearing, swapping the instrument or leaving and re-entering.

**Given** Play
**When** I press `Space` or click it
**Then** it sounds what is lit, as an arpeggio low to high (the Explore Play wording; the spec confirms block or arpeggio), and does nothing when nothing is lit
**And** it never reveals or checks anything.

**Given** fewer than three notes are lit
**When** I look at Try
**Then** it is `aria-disabled="true"`, stays focusable and does nothing on click or `Enter`.

**Given** I swap the instrument with `I`
**When** the drill is showing
**Then** the same question stays, the lit notes of the drill follow the same carry rules as Explore (positions survive a swap, a piano chord lands on the guitar one per string with `placeLit`), and `Esc` closes the Setup panel or the shortcuts list first, otherwise clears the drill's lit notes only.

**Given** the focus order (UX-DR33)
**When** I press `Tab` in the drill
**Then** the order after the rail is the instrument, then Play, Try, Reveal, then the Setup panel when open.

**Given** the change touches layout
**When** the built app is loaded in headless Chrome at 1280 x 800
**Then** on the piano and the guitar and in both themes the page does not scroll, the instrument's top edge and the Status note do not move when notes are lit, and Listen and Explore are checked again for the shared components.

### Story 11.3: Try and Reveal

As Apor,
I want to check my chord with Try and to see the answer with Reveal whenever I like,
So that I can practise without a score or a penalty.

**Covers:** FR30, FR31; AD-5, AD-13; UX-DR19, UX-DR23, UX-DR32, UX-DR43, UX-DR44, UX-DR53, UX-DR54, UX-DR57

**Acceptance Criteria:**

**Given** three or more lit notes
**When** I press `Enter` or click Try
**Then** what is lit sounds and the Story 11.1 check runs, and nothing is checked as notes are lit
**And** Try plays what is lit as a block (the spec confirms) whether the answer is right or wrong.

**Given** a wrong Try
**When** it is evaluated
**Then** the hint reads `Not quite, try again.`, the notes stay lit as plain dots, nothing is marked at this story (marks arrive in Story 11.4), and the wrong-Try count in the drill slot goes up by one
**And** the hint is a polite live region (UX-DR19, UX-DR53).

**Given** a right Try
**When** it is evaluated
**Then** the user's lit notes take their role shapes, read from the asked chord's tone records by pitch class and not from the namer (so a voicing without its fifth shows shapes too), the role legend appears with one entry per role present (`root C`, `3rd E` and so on), the chord plays as a block, and Try and Reveal give way to Next (`Enter`) in the primary slot with Play staying
**And** the hint stays free of praise: no `Correct`, no `Well done`, no exclamation mark, and no score, streak or counter appears anywhere.

**Given** Reveal at any time, with no notes lit or with wrong notes lit
**When** I press `R` or click Reveal
**Then** the drill's lit notes are replaced by the correct chord, with role shapes and the legend, the chord plays as a block, and Try and Reveal give way to Next
**And** on the piano the notes come from `rootPositionPitches` and the window refits to show them, on the guitar the chord shows as the best-ranked voicing derived as in Story 10.3 (and if no voicing fits, the reference pitches are placed with `placeLit`, one per string, and the Status note says so)
**And** Reveal has no penalty and does not change the wrong-Try count.

**Given** the answer is showing (right or revealed)
**When** I press `Enter` or click Next
**Then** a new question is drawn with injected random, the board clears, the hint and legend rows empty, Try and Reveal come back, and nothing plays
**And** nothing advances without my pressing Next, and `R` and Try do nothing while the answer is showing.

**Given** focus
**When** Try becomes Next in the same slot
**Then** focus stays on that button, and if Reveal was focused it moves to Next (EXPERIENCE focus rule).

**Given** the key map (UX-DR32)
**When** the drill is showing
**Then** `Space` plays what is lit, `Enter` is Try then Next, `R` is Reveal, all three ignore Ctrl, Alt and Meta (AltGr exception) and `Space` and `Enter` ignore auto-repeat, and all three yield to any focused button, radio, chip or text field so a focused Play, Try, Reveal or rail item takes `Space` and `Enter` as activation
**And** `R` in the drill does not arm Explore's root flow, `armRoot` is not dispatched in the drill, the shortcuts list in `src/ui/help/HelpHint.tsx` gains the drill rows, and `aria-keyshortcuts` is set on Play, Try and Reveal.

**Given** a right or revealed answer, and a hint change
**When** it happens
**Then** a polite live region announces the hint, the revealed chord name and the shown legend without repeating the name on every note, and the copy follows UX-DR23 (sentence case, short, no praise).

**Given** UX-DR57 Flow 5 up to the right answer
**When** the acceptance script is run by test on the guitar with a seeded random
**Then** build the asked chord as plain dots, Try wrong shows the first-miss hint, Try right shows shapes and legend and Next on `Enter`, and a second run ends on `R` Reveal.

**Given** the change touches layout
**When** the built app is loaded in headless Chrome at 1280 x 800
**Then** in both themes and on both instruments the page does not scroll and the instrument and Status note stay put through building, a miss, a right answer and Next, with the legend row filling the space reserved for it.

### Story 11.4: Mark misses

As Apor,
I want the drill to cross the notes that are not in the chord after two wrong tries,
So that I get a nudge without being told the answer.

**Covers:** FR30; AD-6, AD-13; UX-DR44, UX-DR45, UX-DR51, UX-DR54, UX-DR55; NFR6, NFR7

**Acceptance Criteria:**

**Given** the Setup panel
**When** I look at it
**Then** under its own `Chord drill` heading there is a Mark misses segmented control On | Off with a Setup label, the shared selected treatment and the hint `Crosses notes that are not in the chord after two tries.`, placed between Listen setup and Sound (UX-DR50, UX-DR51), built with `SegmentedGroup` and a `SettingsAction` in `src/ui/settings/settings.ts`
**And** the default is On.

**Given** the setting
**When** it changes
**Then** it is saved under its own localStorage key (for example `accompa.markMisses`, a key of its own beside `accompa.pool`, `accompa.theme` and the sound key), is read synchronously in `src/ui/settings/settingsStorage.ts` before the first render, and a missing, unreadable or malformed value falls back to On
**And** no other key is read or deleted, and a test covers the load, the save, the fallback and a throwing `localStorage`.

**Given** Mark misses is On and my second wrong Try (or a later one)
**When** it is evaluated
**Then** the hint reads `Not quite. The crossed note is not in this chord.` and every lit note whose pitch class is outside the chord shows the wrong-note cross: a surface-fill ring with a 2.6px ink cross about 18px across, drawn over the dot, and on a black piano key the cross is drawn in the surface colour (UX-DR44, UX-DR45)
**And** the hint is a polite live region, and the cross is a shape, so it reads without colour (NFR7).

**Given** my first wrong Try
**When** it is evaluated
**Then** nothing is marked and the hint is `Not quite, try again.` as in Story 11.3.

**Given** Mark misses is Off
**When** I make a second or later wrong Try
**Then** no cross is drawn and the first-try hint `Not quite, try again.` repeats.

**Given** a miss that has only missing tones
**When** it is the second wrong Try
**Then** no cross is drawn (nothing is outside the chord), the hint reads `Not quite, try again.` because the crossed-note hint would be untrue, and missing notes are never shown (the spec confirms this wording rule)
**And** the Story 11.1 list of outside notes drives both the cross and the hint choice.

**Given** a marked note
**When** I move it or unlight it, or light another note
**Then** the crosses update only on the next Try (they describe the last Try), and the next question, Next and Reveal clear them
**And** the cross is drawn on the guitar's frets and on white and black piano keys and the accessible name of a crossed note adds `not in this chord`.

**Given** the setting is changed while a question is open
**When** I close Setup
**Then** it applies from the next Try and the current marks stay as they are.

**Given** the change touches layout and adds a marker
**When** the built app is loaded in headless Chrome at 1280 x 800
**Then** in both themes and on both instruments the page does not scroll, the instrument top and Status note stay put when crosses appear, the cross is legible on a white key, a black key and a fret, and the Setup panel with the new heading still fits its 560px overlay without scrolling the page.

## Epic 12: Circle of fifths

Apor opens a Circle of fifths page from the rail, picks a major or minor key on the circle, and sees and hears the seven triads of that key with their Roman numerals. The theory lives in one pure `core/keys` module (AD-12) so the page owns no theory of its own, relative minors are derived and never typed, and the chord labels agree with the namer on pitch class and quality. It relies on the `SpelledNote` type and `rootPositionPitches` from Story 10.1. The page has no instrument, no key signature, no progressions and no ear training, and its state is page-local. Four stories: keys in core, the circle page, the seven chords, then the minor scales.

### Story 12.1: Keys in core

As Apor,
I want the keys, the circle and each key's seven triads computed in one pure module,
So that the circle page shows correct spellings and numerals without owning any theory.

**Covers:** FR33; AD-2, AD-3, AD-4, AD-10, AD-12; NFR8, NFR9

**Build notes.** The module is `src/core/keys.ts` with tests in `tests/core/keys.test.ts`, written first. It uses the `SpelledNote` type and the spell-from-spelled-root-and-degree function that Story 10.1 added (AD-2, AD-3), and `rootPositionPitches` from the same story; it adds no second spelled-note struct and does not change how existing callers spell anything.

**Acceptance Criteria:**

**Given** `core/keys`
**When** I read its exports
**Then** a `Key` is a spelled tonic plus a scale of `major`, `naturalMinor`, `harmonicMinor` or `melodicMinor`, `circleOfFifths()` and `diatonicTriads(key)` are exported, and the module imports only from `src/core` (no `ui/`, no `audio/`, no React, no `Math.random`; `npm run check` enforces it).

**Given** `circleOfFifths()`
**When** I call it
**Then** it returns 12 positions in fifths order starting at C (C, G, D, A, E, B, F♯, D♭, A♭, E♭, B♭, F), each with its spelled major tonic, its relative minor and its two neighbours (the positions one step either side)
**And** the major tonics use the default root table of `core/spelling` (F♯ at position 6, D♭ A♭ E♭ B♭ flat), so no tonic carries a double accidental.

**Given** a position's relative minor
**When** it is built
**Then** it is derived from the major tonic (a sixth above: the letter stepped five letters, the pitch three semitones down, with the accidental that results) and never typed as a second list
**And** a test pins all 12 pairs, including position 6 as F♯ major with D♯ minor (not E♭ minor, the error in the mockup) and position 5 as B major with G♯ minor.

**Given** `diatonicTriads(key)`
**When** I call it for any key
**Then** it returns exactly seven entries in degree order, each with a Roman numeral, a spelled root and a quality from the existing `CHORD_QUALITIES` table (major, minor, diminished, augmented), built as the triad on that scale degree (root, third and fifth taken from the key's scale).

**Given** a quality and a degree
**When** the numeral is derived
**Then** it comes from the quality and the degree only: upper case for major and augmented, lower case for minor and diminished, `°` appended for diminished and `+` for augmented (`I`, `ii`, `iii`, `IV`, `V`, `vi`, `vii°`, `III+`), with no numeral typed in a table per key.

**Given** the four scales on C or A as tonic
**When** `diatonicTriads` runs
**Then** the numerals and qualities match these rows, pinned by tests:
- major: I ii iii IV V vi vii°
- natural minor: i ii° III iv v VI VII
- harmonic minor: i ii° III+ iv V VI vii°
- melodic minor (ascending): i ii III+ IV V vi° vii°.

**Given** a scale degree that would need a double accidental (for example the raised seventh of D♯ harmonic minor, which is C double sharp)
**When** the root is spelled
**Then** the twin rule of `core/spelling` applies and the root takes its table name (D), never a double accidental, in any of the 12 keys x 4 scales
**And** a test asserts no spelled root or tonic in the module's output has an accidental other than natural, sharp or flat.

**Given** the chord names from the namer
**When** the consistency test runs over all 12 keys x 4 scales (the minor keys taken from the 12 relative minors) and every chip
**Then** `nameChord` of the chip's root-position pitches returns the chip's pitch class and quality as its first reading (spelling is not compared: the namer sees only pitches, so a sharp-key chip such as A♯m in F♯ major can read B♭m)
**And** the spelled letter and accidental of every chip are asserted separately in the `core/keys` tests against the golden examples.

**Given** a chip
**When** it is built
**Then** it is constructed from a spelled root and a quality (the AD-10 picker bypass) and not parsed from a name string, and the root-position pitches for playback are produced for it in `core/` (the triad placed in one octave, root in C4 to B4, using `rootPositionPitches` from Story 10.1).

**Given** the results this story generates
**When** the spec is written
**Then** the spec carries golden examples (the 12 circle positions, the 28 chips of C major, A natural, harmonic and melodic minor with each chip's spelled letter and accidental, and every case where the twin rule fires) confirmed by Apor before build.

### Story 12.2: The circle page

As Apor,
I want a Circle of fifths page with the circle, its 12 major and 12 relative-minor keys, and a selected key,
So that I can see how the keys relate at a glance.

**Covers:** FR33; AD-5, AD-6, AD-12; UX-DR28, UX-DR29, UX-DR46, UX-DR47, UX-DR33, UX-DR55, UX-DR56, UX-DR24

**Build notes.** Read `docs/development-notes.md` before any layout or CSS change. The page lives under `src/ui/circle/` and uses shared code only through `src/ui/shared`. The layout follows `_bmad-output/planning-artifacts/ux-designs/ux-accompa-2026-10-23/mockups/circle-page.html`, which is span-built and illustrative: build real buttons. Wedges are 24 real `<button>` elements placed over an SVG or CSS geometry, not span-built rings. Position labels come from `circleOfFifths()` (Story 12.1), never from a list in the UI.

**Acceptance Criteria:**

**Given** the rail
**When** I look at it
**Then** it lists Circle of fifths as the fourth section (added to the data-driven list from Epic 7, with the circle-of-fifths glyph of UX-DR31, or the Epic 7 placeholder entry replaced), a real button with `aria-current="page"` when selected, and the accessible name `Circle of fifths` even when the rail is collapsed
**And** clicking it keeps the active instrument, the workspace and the practice state as they were.

**Given** I open the page for the first time in a session
**When** it renders
**Then** C major is selected (accent fill, weight 700, `aria-pressed="true"`), the circle is 560px across and centred in the body, and the layout fits one screen at 1280 x 800 without scrolling.

**Given** the circle
**When** I read it
**Then** 12 major wedges form the outer ring and 12 relative-minor wedges the inner ring, with 2px gaps in the background colour, each pair aligned radially, labelled from `circleOfFifths()` (the minor at the F♯ position reads D♯m, not E♭m).

**Given** a key is selected
**When** I look at the ring
**Then** the selected wedge takes the accent fill, and the related wedges (the key one step either side on both rings, and the relative on the other ring) take the 33% accent tint
**And** selecting a minor wedge selects that minor key and tints its relative major and the neighbours on both rings by the same rule.

**Given** the centre of the circle
**When** a key is selected
**Then** it shows the key's short name only (`G`, `Gm`, `F♯`, `D♯m`) as live text in a polite live region, and no key signature, no relative-key line, no related-keys text and no progressions appear anywhere on the page.

**Given** each wedge
**When** a screen reader reads it
**Then** its accessible name is the key and mode (`G major`, `E minor`) followed, when it applies, by its state in words (`selected`, or `related to G major`), so selection and relation are never carried by tint alone
**And** the controls are real buttons that keep visible outlines in forced-colors mode (no box-shadow rings).

**Given** the keyboard
**When** I press `Tab`
**Then** focus moves through the major wedges clockwise from the top (C), then the minor ring clockwise from the top (Am), then on to the controls that follow in the focus order of UX-DR33, and `Enter` or `Space` on a focused wedge selects it
**And** arrow keys do nothing on the page (decision for this story: Tab only, as UX-DR33 and EXPERIENCE state, so the 24 wedges stay ordinary buttons); every shortcut that applies elsewhere follows the Circle column of the key map (`I` does nothing, `P` and `?` work, `Esc` closes the panel or hint).

**Given** the page has no instrument
**When** it shows
**Then** the Piano | Guitar toggle in the rail is hidden (UX-DR29), no piano or fretboard renders, and the last active instrument is kept in the session untouched for the other sections and for the chord chips of Story 12.3.

**Given** the selected key
**When** I switch to another section and come back, or reload the app
**Then** the page opens on C major again: the key is page-local state, never written to `Workspace` or `practice` (reducer tests keep asserting the other half untouched by reference where relevant) and never persisted to `localStorage`.

**Given** a wedge click
**When** the selection changes
**Then** nothing plays, and the highlight, the centre name and the live text change with no animation beyond what UX-DR56 allows (instant under `prefers-reduced-motion`).

**Given** any layout or CSS change in this story
**When** the built app is loaded in headless Chrome at 1280 x 800 in both the light and the dark theme
**Then** the circle is centred and fully visible, the page does not scroll, and the rail, status note and other sections are unchanged, and the check is recorded in the review log.

### Story 12.3: The seven chords

As Apor,
I want the seven chords of the selected key along the bottom, each playable with a click,
So that I can hear the key's chords and read their numerals.

**Covers:** FR33; AD-7, AD-10, AD-12; UX-DR48, UX-DR32, UX-DR33, UX-DR19, UX-DR23, UX-DR55

**Acceptance Criteria:**

**Given** a major key is selected
**When** the page renders
**Then** a row of seven equal-width chips (gap 10px, radius 22px) sits along the bottom, each stacking the Roman numeral, the chord name at 26px weight 600 and a role word, with C major reading `I C`, `ii Dm`, `iii Em`, `IV F`, `V G`, `vi Am`, `vii° B°`
**And** the row comes from `diatonicTriads(key)` of Story 12.1 with no names or numerals typed in the UI.

**Given** a chip's name
**When** it is built
**Then** it is built from the chip's spelled root and quality (`G`, `Am`, `B°`, `C+`: major no suffix, minor `m`, diminished `°`, augmented `+`), which AD-10 allows for pickers, and the root spelling is the one `core/keys` returns (G major reads `vii° F♯°`)
**And** the `°` and `+` suffixes are the page's chip labels and do not replace the `dim` and `aug` symbols of `CHORD_QUALITIES` anywhere else (the labels are one small function with its own tests, in `src/ui/shared/chordLabels.ts` or `core/keys`).

**Given** the home chip (I, or i in a minor key)
**When** I look at the row
**Then** it is tinted with the accent as a fixed marker and its role word reads `home`, the other six chips have an empty role word, and no chip ever shows a selected state or pressed state, including after a click.

**Given** a chip
**When** I click it, or focus it and press `Enter` or `Space`
**Then** the root-position triad plays as a block through the engine interface (`play` with the instrument parameter from Epic 6) using the last active instrument's sound, so the sound is the piano's when Piano was last active and the guitar's when Guitar was
**And** `Space` and `Enter` activate the focused chip rather than their section shortcuts, and auto-repeat plays nothing extra.

**Given** the chord pitches
**When** a chip plays
**Then** they come from `core/` (the triad from 12.1, root in C4 to B4, tones ascending), the chip makes no sound until clicked, and a test pins the pitches of the `V` chip in C major (G4 B4 D5, that is 67 71 74) and of the `III+` chip in A harmonic minor.

**Given** the chips
**When** a screen reader reads them
**Then** each is a real button named with numeral and chord, `IV, C`, the home chip `I, G, home`, in the chord order, after the wedges and the scale picker in the focus order of UX-DR33, with visible focus.

**Given** I select another key
**When** the selection changes
**Then** the row updates at once to that key's seven chords and nothing plays; selecting a key never auto-plays.

**Given** audio is blocked or the context is not running
**When** I click a chip
**Then** the existing audio-blocked note in the Status note shows, as for any other play, and the page keeps working silently.

**Given** a chip click
**When** it plays
**Then** the workspace, `practice` and the active instrument are unchanged (reducer and component tests assert it by reference), and no live-region announcement is made for the click.

**Given** the layout change
**When** the built app is loaded in headless Chrome at 1280 x 800 in both themes
**Then** the circle, the chord row and the Status note all fit without scrolling, the circle does not move when the row's content changes, and the check is recorded in the review log.

### Story 12.4: Minor scales

As Apor,
I want to choose the natural, harmonic or melodic minor for a minor key,
So that I can hear the chords of each minor scale.

**Covers:** FR33; AD-12; UX-DR49, UX-DR47, UX-DR33, UX-DR55, UX-DR46

**Acceptance Criteria:**

**Given** I click a minor wedge (for example E minor)
**When** the selection changes
**Then** that minor key is selected, the centre reads `Em`, the wedge, relative and neighbours highlight as in Story 12.2, and the scale defaults to Natural.

**Given** a minor key is selected
**When** the page renders
**Then** a picker with the label `Minor scale` and three stacked pills, Natural, Harmonic and Melodic, shows to the right of the circle, Natural selected, in the position of the mockup (right of the circle, vertically about the circle's upper third)
**And** the pills are a segmented group of real buttons with the shared selected treatment (accent fill, weight 700, `aria-pressed`), and `Tab` then `Enter` or `Space` operates them.

**Given** a major key is selected
**When** the page renders
**Then** the picker is not shown and its space is not reserved or collapsed, so nothing else on the page moves, and a test asserts the picker is absent for major and present for minor.

**Given** E minor and the three scales
**When** I switch the picker
**Then** the chord row follows, triads only, with these numeral rows (all from `diatonicTriads`, Story 12.1):
- Natural: i ii° III iv v VI VII (Em, F♯°, G, Am, Bm, C, D)
- Harmonic: i ii° III+ iv V VI vii° (Em, F♯°, G+, Am, B, C, D♯°)
- Melodic ascending: i ii III+ IV V vi° vii° (Em, F♯m, G+, A, B, C♯°, D♯°).

**Given** the picker is switched
**When** the row changes
**Then** only the chord row changes: the selected key, the circle highlight and the centre name stay as they were, the home chip stays tinted, and nothing plays.

**Given** the chords of the harmonic and melodic scales
**When** a root would need a double accidental
**Then** its table name is shown by the twin rule and the chip still plays the right pitches (a test covers D♯ harmonic minor, whose raised seventh is C double sharp and shows as `D°`).

**Given** I select a major wedge after a minor key
**When** the selection changes
**Then** the picker hides, the row shows the major key's seven chords, and selecting a minor wedge again starts at Natural (the scale is page-local and not remembered per key).

**Given** the focus order
**When** I press `Tab` from the last wedge
**Then** focus goes to the scale picker when a minor key is selected, then to the chord chips (UX-DR33), and if the picker disappears while one of its pills holds focus, focus moves to the selected wedge.

**Given** the picker and the row
**When** the scale changes
**Then** the scale and the key stay page-local state: not persisted, not written to `Workspace` or `practice`.

**Given** the results this story shows
**When** the spec is written
**Then** it carries golden examples (the rows above for E minor and A minor, plus D♯ minor and B♭ minor in each scale) confirmed by Apor before build.

**Given** the layout change
**When** the built app is loaded in headless Chrome at 1280 x 800 in both themes with a minor key selected and again with a major key selected
**Then** the circle does not move between the two, nothing overlaps the circle or the chord row, the page does not scroll, and the check is recorded in the review log.
