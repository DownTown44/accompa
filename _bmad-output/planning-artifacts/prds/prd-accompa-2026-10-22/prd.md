---
title: accompa PRD
status: final
created: 2026-10-22
updated: 2026-10-23
---

# accompa — PRD

> **Status: final.** Phase 1 defined. Phase 2 direction only.

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
- Chord library: picking a chord by root and quality (Phase 2)
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

## Open Questions

None open; assumptions are tagged inline.

## Phase 2 direction

- Chord library: pick a chord by root and quality.
- Piano inversions (FR-21 withdrawn); voicings are guitar-only in Phase 1.
- Sampled guitar and piano sound; the sample source is decided then.
- Further capability areas as listed above (scales and modes, circle of fifths, progression analysis).
