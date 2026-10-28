---
title: accompa PRD
status: final
created: 2026-10-22
updated: 2026-10-27
---

# accompa — PRD

> **Status: final.** Phase 1 defined and built. Phase 2 scope defined 2026-10-27; its UX decided 2026-10-28.

## Vision

accompa is a personal music-theory practice app for one user (Apor, guitarist of a couple of years, some piano). Free apps aren't enough, paid ones aren't wanted, and a custom tool can fit exactly how he learns.

**The job:** when an idea hits, find it on the instrument without hunting. When listening to music, recognize what's happening ("oh, I see what you did there").

That is two skills:
- **Fluency (eyes):** knowing where intervals, chords and scales live on the fretboard and keyboard.
- **Recognition (ears):** hearing intervals, chords and progressions.

## Users and Context

- Single user, personal tool. No accounts, monetization or scale concerns.
- Laptop web app. No mobile.
- Built by Apor with an AI agent under his supervision.

## Principles

- **Exploration over drilling.** The user tinkers and the app shows and plays what's going on. Quizzing is never forced: in Listen the user may guess by clicking an answer, or just Reveal. Adaptive drilling and progress tracking may come later as a layer on top.
- **One concept, two instruments.** A swappable guitar-fretboard / piano-keyboard view. Every exercise works on either. Piano is included mainly because it makes chord structure easy to see.
- **Sound is first-class.** Ear training is important, so everything the user can see should also be playable.
- **Small slices.** The topic list is large ("basically everything"). Build one usable slice at a time.

## Capability Areas (long-term, unprioritized beyond Phase 1)

| Area                       | Note                                                       |
| -------------------------- | ---------------------------------------------------------- |
| Instrument views           | Swappable guitar fretboard and piano keyboard              |
| Intervals                  | See, hear, compare                                         |
| Chords                     | Simple chords (triads, maybe 7ths) shown as note structure |
| Scales and modes           |                                                            |
| Circle of fifths           | Interactive, for moving easily between keys                |
| Chord progression analysis | Roman-numeral analysis. Likely last.                       |
| Ear training               | Hear intervals, chords and progressions                    |

## Phase 1 — Intervals, then Chords

Built in two slices, in order. 1A (intervals) must be usable on its own before 1B (chords) starts.

**Two core loops:**
1. **On-demand ear practice.** Open the app, hear something, no setup.
2. **Build on piano, find it on guitar.** Build a chord on the keyboard, where structure is easy to see, then swap to the fretboard and find a way to play it. The chord is shared state and carries over on swap.

### Slice 1A — Interval Ear Training

#### Functional Requirements

**Instrument view**
- FR-1: Guitar fretboard and piano keyboard views, both available from day one.
- FR-2: User can swap between views at any time. Visuals are minimal and elegant, not realistic.

**Listen mode (listen, guess if you like, reveal)**
- FR-3: Play sounds one interval (two notes) on request. Replay is unlimited.
- FR-4: Reveal shows the interval name, the two notes, and their positions on the active instrument.
- FR-5: Next plays a new interval.
- FR-6: Optional guess. The user can click an interval answer: a correct answer advances to the next interval, a wrong answer stays marked and the same question stays. Reveal always shows the answer with no penalty. No score counter.

**Listen settings**
- FR-7: User selects which intervals are in the pool, from the 12 semitone intervals.
- FR-8: Direction: ascending, descending, or harmonic (both notes together).
- FR-9: Root note: random or fixed.

**Explore mode**
- FR-10: In Explore, the user clicks any two notes on the active instrument. The app names the interval and plays it.

**Sound**
- FR-11: Every note shown can be heard. v1 uses synthesized sound, with a sound choice in the setup panel. Sampled instruments are Phase 2.

### Slice 1B — Chords and Voicings

Chord scope: triads (major, minor, diminished, augmented) and 7ths (maj7, dom7, min7, m7♭5, dim7). The builder works in root position.

**Chord builder**
- FR-12: In Explore, the user builds a chord on the keyboard by clicking individual notes. Each clicked note sounds and is marked, the root is marked differently (lowest note by default, the user can change it), and the app names the chord live and shows the intervals from the root. Choosing a chord by root and quality is a chord library, planned for Phase 2.
- FR-13: User plays the chord as a block or as an arpeggio.
- FR-14: Chord naming in Explore: the user toggles any notes and the app names the chord.

**Transfer to guitar**
- FR-15: Swapping to the fretboard keeps the chord and shows it as a playable voicing in the register of the source chord (FR-16, FR-18), with the root highlighted and other notes marked by role (3rd, 5th, 7th). Swapping back keeps the chord.

**Voicings**
- FR-16: User can find a playable guitar voicing for the chord and change it. A voicing is a specific set of fretted notes, at most one per string, with unused strings muted. Voicings exist because a triad built on the piano usually maps to a guitar barre chord, and one chord can be played several ways on guitar.
- FR-17: The app generates every playable voicing (reachable fret span, essential chord tones present) and the user steps through them. Common shapes (open, barre) rank first. Voicing rules are decided parameters (defaults in one place, tunable constants in `core/`, revisit only if real voicings feel wrong): max fret span 4 frets (user-confirmed); open strings do not count toward the span; root and 3rd are always present; the 7th is mandatory on seventh chords; only the 5th may be dropped; register distance is the distance between mean pitches (architecture AD-8).
- FR-18: Voicings match the register of the source chord. A chord built high on the piano maps to the nearest-register guitar voicing, not an open chord.
- FR-19: User can hand-edit a voicing by moving notes on the fretboard. The app keeps naming the resulting chord.
- FR-20: User can play the voicing (strummed and as an arpeggio) to hear it.
- FR-21: Withdrawn. Voicings are guitar-only in Phase 1. Piano voicings and inversions are Phase 2.

**Chord ear practice**
- FR-22: Same listen, replay, optional guess and reveal flow as intervals (FR-3 to FR-6), with a user-selected pool of chord qualities. No score counter.

### Success Measure

The user can name M3, P4, P5 and the 7th intervals (m7, M7) by ear without looking. One line to mark when 1A is done, not a metric to track.

## Out of Scope (for now)

- Progress tracking and adaptive drilling (possible later phase)
- Chord library: picking a chord by root and quality (now in Phase 2 as the chord builder, FR-28)
- Instrument input (mic, MIDI). MIDI keyboard input is wanted later; leave a seam, build on-screen instruments only for now.
- Mobile
- Accounts, sharing, monetization

## Constraints and Dependencies

- Laptop browser (landscape tablets at about laptop width may work but are not designed for). Audio synthesis and playback are required.
- Tech stack: TypeScript, React, Vite and Web Audio, client-only. See `architecture/architecture-accompa-2026-10-23/ARCHITECTURE-SPINE.md`.
- Swappable-view UX is designed: see `ux-designs/ux-accompa-2026-10-23/` (DESIGN.md, EXPERIENCE.md).

## Resolved

- Usage scenario: not needed. The user knows what they want (on-demand ear practice, chord build and transfer).
- Phase 1 scope: intervals (1A), then chords and voicings (1B).
- Chord scope: triads and 7ths.
- Voicings: in scope. A chord built on piano is useless if the user can't find a way to play it on guitar.
- State on swap: the chord carries over.
- Modes are named Listen and Explore. Piano / Guitar is an always-visible instrument toggle, not a mode.
- Guess-by-click in Listen is optional, with no score (replaces the old reveal-only rule).
- Voicings are guitar-only in Phase 1 (FR-21 withdrawn). Piano inversions are deferred to Phase 2.
- Voicing rules: max fret span 4 frets confirmed by the user; the other voicing defaults were delegated to the team by the user and are decided under FR-17.
- Sound: synthesized in v1 with a sound choice in the setup panel. Sampled instruments are Phase 2, and the sample source is decided then.
- Tech stack: resolved in the architecture spine (TypeScript, React, Vite, Web Audio).
- Instrument swap UX: resolved in the UX spines.
- Persisted settings: sound choice, theme (with manual override of system) and interval pool only. Chord, voicing, current question, direction and root mode are not persisted.
- Interval label: 6 semitones is A4 in the PRD, UX spines and architecture (AD-3).
- Chord ear practice (FR-22): the Listen pattern with a chord-quality pool and answer buttons, Reveal lighting the chord on the active instrument (user-confirmed).

- Phase 2 (2026-10-27): the chord library of FR-12 is the chord builder (FR-28). Piano inversions of FR-21 become inversions on both instruments in Explore (FR-27), with no piano voicing generator. Tier C chords, scales, and Listen practice for new qualities and inversions are a Phase 3 maybe list.
- Phase 2 and the Vision: the Vision lists hearing progressions as part of Recognition. In Phase 2 the progressions page has no ear training, so progression ear practice stays later.

## Open Questions

- Sample source and bundle size (FR-23): owner architecture.
- Voicing omission rule for chords above four tones (FR-25): owner architecture.

Other assumptions are tagged inline.

## Phase 2 — Richer chords, real sound, a place to learn progressions

Scope agreed with the user on 2026-10-27. Phase 2 deepens chords in Explore, adds a chord flash drill, replaces the synth as the default sound, and adds a visual reference for keys and progressions. Listen practice does not change in Phase 2.

### Epic order (proposed)

| Epic | Area | Open with |
| ---- | ---- | --------- |
| 6 | Sampled sound | Architecture (bundling, licensing) |
| 7 | Chord vocabulary, tiers A and B | Architecture (voicing rules) |
| 8 | Inversions | PM |
| 9 | Chord builder | UX (controls) |
| 10 | Chord flash drill | UX (navigation) |
| 11 | Circle of fifths and progressions | UX (discovery first) |
| — | Navigation for four sections | UX (decided 2026-10-28); blocks epics 10 and 11 |

### Functional Requirements

**Sound**
- FR-23: Sampled instruments, with different samples for piano and for guitar, chosen in the Sound setting of the setup panel. Samples are bundled with the app: no network calls (NFR2). The synthesized sound stays as a choice (user-confirmed 2026-10-27). The sample source is decided in architecture and must be freely redistributable.

**Chord vocabulary (Explore)**
- FR-24: Chord qualities added, tiers A and B: sus2, sus4, 6, m6, add9, 9, maj9, m9. They are named, spelled and shown with roles in Explore like the nine existing qualities. Chord names still come only from the namer.
- FR-25: Guitar voicings exist for every new quality. Voicing rules (FR-17) need an omission rule for chords with more than four distinct tones on six strings (for example a 9th chord). The rule is decided in architecture. [ASSUMPTION: the existing rules for span, fingers and register stay.]
- FR-26: The new qualities are Explore-only in Phase 2: they do not enter Listen practice.

**Inversions (Explore)**
- FR-27: In Explore, the user can put the chord in an inversion (root position, 1st, 2nd, and 3rd on chords with four or more tones) on either instrument. The chord is named as a slash chord. There is no piano voicing generator: an inversion is the same chord tones with a different bass note. There is no inversion ear practice in Phase 2.

**Chord builder (Explore)**
- FR-28: In Explore, the user picks a root note and a quality and the app lights that chord in the Explore workspace. It then behaves like any chord: it is named, playable as a block or an arpeggio, and carries to the guitar as a voicing with the stepper. The picker controls (for example two dropdowns or a matrix) are decided in UX. This is the chord library that FR-12 deferred.

**Chord flash drill (its own section)**
- FR-29: The app shows a chord name and the user builds it on the active instrument.
- FR-30: A Try button checks the user's chord and says right or wrong. There is no automatic check as notes are lit.
- FR-31: Reveal shows the answer at any time with no penalty. No score, no streak, no praise.

**Navigation**
- FR-32: A navigation that holds the four sections, Listen, Explore, the flash drill and the circle reference, replacing the two-tab mode strip. Decided in UX (2026-10-28): a collapsible side rail, collapsed by default, with its state kept between sessions. The flash drill and circle epics wait for it.

**Circle of fifths**
- FR-33: A separate page with a large, clickable circle of fifths: major keys outside, relative minors inside, the chosen key shown in the middle, its neighbours and relative highlighted. Choosing a key (or a minor key, with a Natural / Harmonic / Melodic choice) shows its seven chords as Roman-numeral triads that can be clicked to hear. It has no instrument, no common-progression paths, no key signature and no ear training. Decided in UX on 2026-10-28.
- Architecture note: this page introduces keys and Roman-numeral analysis, a concept the app does not have today. Architecture hears about it early.

### Phase 3 (maybe, not committed)

- Tier C chords: 11ths, 13ths and altered chords. Seven-note chords on six strings need a new omission rule.
- Scales from a root.
- Listen practice for the new chord qualities.
- Inversion ear training.

### Not in Phase 2 (decided)

- Alternate guitar tunings.
- A piano voicing generator (inversions only).
- Ear training for progressions.
- Anything for touch, phones or narrow viewports.
- Scores, streaks or progress tracking.
