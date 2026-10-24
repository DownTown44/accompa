---
status: final
stepsCompleted: [1, 2, 3, 4]
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
FR15: Swapping to the fretboard keeps the chord. All positions of the chord's notes show across the neck, with the root highlighted and other notes marked by role (3rd, 5th, 7th). User can limit the view to a fret region.
FR16: User can find a playable guitar voicing for the chord and change it. A voicing is a specific set of fretted notes, at most one per string, with unused strings muted.
FR17: The app generates every playable voicing (reachable fret span, essential chord tones present) and the user steps through them. Common shapes (open, barre) rank first. Rules: max fret span 4 frets; open strings do not count toward the span; root and 3rd always present; 7th mandatory on seventh chords; only the 5th may be dropped; register distance is the distance between mean pitches (AD-8).
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
- Voicing generation must tolerate hand-edits and fret regions (empty result is valid).

### UX Design Requirements

UX-DR1: Design tokens. Implement the DESIGN.md color tokens (light plus `-dark` twin), typography ramp (Palatino stack, italic everywhere except key-hint), rounded, and spacing tokens as CSS custom properties. Theme follows the system setting with a manual System / Light / Dark override.
UX-DR2: Layout shell on the 1280 x 800 canvas: Mode strip (min 84px, wordmark, Listen / Explore tabs, Piano|Guitar toggle pushed right, Setup opener, Help hint), then readout, role legend, instrument, control row. One screen, no scrolling, no reflow.
UX-DR3: Mode tab and Instrument toggle share the single selected-state treatment (accent fill, on-fill text, weight 600) and expose a selected role to assistive tech. `M` switches mode, `I` swaps instrument; the instrument crossfades.
UX-DR4: Piano keyboard component: three octaves, `[` and `]` shift one octave, octave labels (C3, C4, C5), black keys win hit-testing, dark-theme key-edge on black keys, click sounds on press and toggles lit on release. Lit-notes-offscreen Status note (`◀ 2 notes lit` / `3 notes lit ▶`).
UX-DR5: Fretboard component: surface slab, 2px fret wires, 7px nut, string names left, fret numbers below, open-string markers (role shape in a ring at the nut) and muted `x` markers. Clicking a fret sounds and toggles that note, at most one per string in a voicing.
UX-DR6: Role marker shapes plus color: root (ringed circle), 3rd (diamond), 5th (square, green), 7th (triangle), no-role small ink dot. 1.8px ink outline, minimum 18px. On piano keys, an 80% role tint plus the marker.
UX-DR7: Readout component: chord or interval name (84px; 56px for the Listen question), live updating. The first reading is large and alternatives are small clickable italic text. Clicking an alternative changes name and root. Empty, single-note and unresolved states per the State Patterns table.
UX-DR8: Role legend under the readout (`root C`, `3rd E`, `5th G`, `7th`) updating with the chord; lists only the root for unresolved sets and is absent for an empty chord.
UX-DR9: Action button component with a key-hint cap and a primary variant (apricot). One primary per row. Explore: Block (`Enter`), Arpeggio (`A`). Listen: Play again (`Space`), Reveal (`Enter`), which becomes Next after Reveal (`Enter` again).
UX-DR10: Interval button row (12 buttons, m2 to P8, keys `1`-`9`, `0`, `-`, `=`). Wrong state: wrong fill, inset 2px muted ring, struck-through label, `aria-disabled`, accessible name like `m3, tried`. Pool-excluded buttons are disabled and at least 55% opacity. Correct advances and auto-plays.
UX-DR11: Voicing stepper `◀ Voicing 1 of N ▶` (40 x 40px arrow targets, Left / Right keys, no wrap, inert end arrow shown as `·` with `aria-disabled`, with the focus-move rules). Hidden when there are fewer than two notes or no voicing.
UX-DR12: Fret-region bar: drag across fret numbers to set the region; quiet `Clear fret region` button outside the track (hit area at least 28px, disabled when the region is the whole neck); stepper recomputes for the region.
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
FR15: Epic 4 - Chord carries to fretboard, role markers, fret region
FR16: Epic 4 - Find and change a playable guitar voicing
FR17: Epic 4 - Generate and step through all voicings, common shapes first
FR18: Epic 4 - Voicings match the source chord's register
FR19: Epic 4 - Hand-edit a voicing, name keeps updating
FR20: Epic 4 - Play the voicing strummed and as an arpeggio
FR21: Withdrawn (piano voicings and inversions are Phase 2)
FR22: Epic 5 - Chord ear practice with a quality pool

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

### Epic 4: Find the chord on guitar
Apor swaps to the fretboard with the chord carried over, sees every chord position, and steps through ranked, register-matched voicings. He can limit the view to a fret region, hand-edit a voicing and hear it strummed or arpeggiated.
**FRs covered:** FR15, FR16, FR17, FR18, FR19, FR20

### Epic 5: Chord ear practice
Apor does the Listen flow with chord qualities: a pool of qualities, optional guess, Reveal lighting the chord on the active instrument.
**FRs covered:** FR22

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

### Story 1.9: Set direction and root

As Apor,
I want to choose ascending, descending or harmonic, and a random or fixed root,
So that I can practise each way I hear music.

**Covers:** FR8 (FR9 and the Root criteria below moved to Story 1.12)

**Acceptance Criteria:**

**Given** the Setup panel
**When** I look at it
**Then** it holds a Direction segmented control (Ascending, Descending, Harmonic) and a Root segmented control (Random, Fixed), with labels and the shared selected treatment.

**Given** Ascending, Descending or Harmonic
**When** an interval plays
**Then** the engine receives the ordered pitch list (low to high, high to low, or both as a block) and replays it identically.

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

**Given** I change direction or root
**When** a question is in progress
**Then** it applies from the next question and the current one stays answerable.

**Given** a reload
**When** the app starts
**Then** direction and root mode return to defaults (Ascending, Random), as they are not persisted.

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

**Given** focus is on a tab, radio, pool chip, text field or (for `Space` and `Enter`) a button
**When** I press a shortcut key
**Then** the native behavior wins.

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

## Epic 3: Build and name chords on the piano

Apor clicks notes on the keyboard and the app marks the root, names the chord live and plays it as a block or an arpeggio. He can switch between alternative readings.

### Story 3.1: See the chord named as I click notes

As Apor,
I want the app to name the chord as I click notes on the keyboard,
So that I learn what the notes I picked make.

**Covers:** FR12, FR14; AD-3, AD-4, AD-10; NFR11; UX-DR7, UX-DR22

**Acceptance Criteria:**

**Given** the chord quality table in `core/theory`
**When** I inspect it
**Then** it holds major, minor, diminished, augmented, maj7, dom7, min7, m7b5 and dim7, each as one entry (name, symbol, interval stack) in one place, and the UI reads from it.

**Given** the namer in `core/`
**When** it is given a set of pitches
**Then** it returns all matching readings as root, quality and optional bass note, ranked with the lowest sounding note as root first (root-position first, then inversions as slash chords), and an empty list for no match
**And** the tests cover every supported quality in root position, inversions, C6 vs Am7/C, and unknown sets.

**Given** chord tones
**When** a reading is spelled
**Then** `core/spelling` spells them by letter stepping from the spelled root (3rd = +2 letters, 5th = +4, 7th = +6) with the default root table (Db, Eb, Gb, Ab, Bb flat; C#, F# sharp) where no reading exists, and dim7 is spelled correctly (tested).

**Given** I click C, E and G on the piano in Explore
**When** the third note lights
**Then** the notes are no longer limited to two and the readout shows `C major` large
**And** the chord name is announced politely after a debounce.

**Given** lit notes that form no known chord
**When** the readout updates
**Then** it shows the note names with no chord name
**And** the lowest note keeps the root marker and every other note shows the no-role dot.

**Given** a chord of three or more notes
**When** notes are added or removed
**Then** the name updates live.

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

**Given** the root defaults to the lowest note
**When** I press `R` then click a lit note
**Then** that note becomes the root, the readout and legend update, and the notes themselves stay lit.

**Given** the root is changed by the user
**When** later notes are added
**Then** the chosen root stays until it is unlit or the user changes it again.

**Given** dark theme
**When** the markers render
**Then** the dark role tokens are used and shape plus colour carry the role.

### Story 3.3: Choose between alternative chord readings

As Apor,
I want to pick another name for the same notes,
So that I can see Am7/C and C6 as two views of one set of notes.

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

**Given** a chord is lit
**When** I press `A` or click Arpeggio
**Then** the notes sound one after another from low to high, in list order.

**Given** `Space` in Explore
**When** a chord is lit
**Then** it plays the selected notes as an arpeggio.

**Given** no notes are lit
**When** I press the play keys
**Then** nothing plays and nothing errors.

**Given** audio is blocked
**When** I play
**Then** the Status note `Press any key to wake the sound.` shows.

**Given** the Action buttons
**When** they render
**Then** each shows a key-hint cap in solid colour and exposes `aria-keyshortcuts`, and `Space` or `Enter` on a focused button activates that button.

## Epic 4: Find the chord on guitar

Apor swaps to the fretboard with the chord carried over, sees every chord position, and steps through ranked, register-matched voicings. He can limit the view to a fret region, hand-edit a voicing and hear it strummed or arpeggiated.

### Story 4.1: Carry the chord to the fretboard

As Apor,
I want to swap to the guitar and see where every chord note lives,
So that I can start finding a way to play the chord.

**Covers:** FR15; AD-5; UX-DR5, UX-DR6, UX-DR8

**Acceptance Criteria:**

**Given** a chord built on the piano
**When** I swap to Guitar (`I` or the toggle)
**Then** the chord carries over from the workspace
**And** every position of each chord note across the 22 frets shows, with the root as a ringed filled circle and the others marked by role shape and colour (3rd, 5th, 7th)
**And** the legend and readout are the same as on piano.

**Given** I swap back to Piano
**When** the keyboard renders
**Then** the same chord and root are still there.

**Given** I swap to Guitar with no chord
**When** the fretboard renders
**Then** it is empty and shows the empty prompt.

**Given** a single note is lit
**When** I swap to Guitar
**Then** that note shows at every position, with no stepper.

**Given** the chord's pitches may be outside the guitar's range
**When** a pitch cannot be played on the fretboard
**Then** it is still listed in the readout and the other notes still show, and the pitch class (not the octave) decides which positions show.

**Given** the pitch-to-position mapping
**When** it is tested
**Then** every chord pitch class maps to all positions for standard tuning, with tuning as a parameter.

### Story 4.2: Limit the fretboard to a fret region

As Apor,
I want to focus on one part of the neck,
So that I only see shapes I can reach.

**Covers:** FR15; UX-DR12

**Acceptance Criteria:**

**Given** the Fret-region bar over the fret numbers
**When** I drag across fret numbers
**Then** the region is set, the bar shows the region fill (accent) with on-fill text, and only chord positions inside the region show.

**Given** the region is the whole neck (default)
**When** I look at the clear control
**Then** the quiet muted cross sits to the right of the bar on the page background, is disabled, and looks the same.

**Given** a region is set
**When** I click the `Clear fret region` button
**Then** the whole neck returns
**And** the button is a real button with a hit area of at least 28px, the standard focus ring, and keyboard operation.

**Given** the region is set
**When** I swap instruments and back
**Then** the region is kept for the session and not persisted.

**Given** the region is drag-only
**When** I use the keyboard
**Then** no keyboard way to set the region is required (accepted limit), while Clear stays keyboard operable.

### Story 4.3: Generate every playable guitar voicing

As Apor,
I want the app to find real ways to fret my chord,
So that I can play what I built on the piano.

**Covers:** FR16, FR17; AD-8; NFR11; UX-DR16

**Acceptance Criteria:**

**Given** the voicing parameters
**When** I inspect `core/`
**Then** max fret span 4, open strings excluded from the span, root and 3rd always present, the 7th mandatory on seventh chords, only the 5th droppable, and register bucket width live as tunable constants in one place.

**Given** a chord, tuning and constraints
**When** the pure generator runs
**Then** it returns every playable voicing (at most one fretted note per string, unused strings muted), unranked, each as an ordered pitch list bass to treble plus a per-string fret or muted assignment
**And** it is total: when none exists it returns an empty list, with no exception.

**Given** the generator tests
**When** they run
**Then** they cover all nine qualities, open strings, muted strings, span limits, dropped 5ths, and a no-voicing case, each checking that the pitch classes are exactly the chord's (allowed omissions aside).

**Given** a chord on Guitar with at least one voicing
**When** the fretboard renders
**Then** the first generated voicing is shown with fretted markers, open strings as the role shape in a ring at the nut, and muted strings as a muted cross `x`
**And** other chord positions are dimmed.

**Given** no voicing fits
**When** the fretboard renders
**Then** it is empty with only the Status note `No voicing fits here. Try widening the region.` under it, and notes stay lit on piano.

**Given** the region from Story 4.2
**When** it is set
**Then** generation respects it and only returns voicings inside the region.

### Story 4.4: Step through voicings, nearest register first

As Apor,
I want to browse voicings starting with the ones closest in register to what I built,
So that a high chord gives me a high shape, not an open chord.

**Covers:** FR17, FR18; AD-8; UX-DR11, UX-DR19

**Acceptance Criteria:**

**Given** the pure ranking function
**When** it ranks voicings for a source chord
**Then** register distance (absolute difference between mean pitches in semitones) is the primary key, grouped by a bucket-width parameter, and the generator is unchanged
**And** tests prove a high source chord returns high voicings first and a low one returns low ones first.

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
**When** I press `A` or click Arpeggio
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
**Then** a Practice segmented control (Intervals, Chords) selects what Listen asks, with a Setup label, the shared selected treatment, and Intervals as the default [ASSUMPTION: the UX spec does not place this control].

**Given** Chords is selected and I open Listen
**When** a question starts
**Then** a random chord from the chord pool (a Setup chip group of the nine qualities, all selected by default) plays as a block, and the readout shows `Which chord?`.

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
**Then** one answer button per quality in the pool shows (the nine qualities map to keys `1` to `9`), styled as Interval buttons with key-hint caps, and qualities outside the pool show disabled at no less than 55% opacity [ASSUMPTION: layout and keys are set here per UX-DR25].

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
**Then** each chord note shows at one position, the cluster nearest the lowest frets [ASSUMPTION: Epic 5 does not depend on voicings from Epic 4].

**Given** Next
**When** I press `Enter` or click it
**Then** a new chord plays and the notes unlight.

**Given** chord practice
**When** I reveal, guess or advance
**Then** the workspace (the chord I built in Explore) is untouched, and switching to Explore and back keeps the same question.

**Given** a reveal
**When** it happens
**Then** no score, counter or praise appears.
