---
title: accompa PRD
status: draft
created: 2026-10-22
updated: 2026-10-23
---

# accompa — PRD (living draft)

> **Status: draft.** Vision, scope and Phase 1 (interval ear training) are defined. Phase 2 (chords) is direction only. Open items are in the last section.

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

- **Exploration over drilling.** The user tinkers and the app shows and plays what's going on. Instant right/wrong quizzing is not the default. Quizzes may come later as a layer on top.
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

**Practice mode (listen and reveal)**
- FR-3: Play sounds one interval (two notes) on request. Replay is unlimited.
- FR-4: Reveal shows the interval name, the two notes, and their positions on the active instrument.
- FR-5: Next plays a new interval.
- FR-6: No scoring, no right/wrong, no guess-first step.

**Practice settings**
- FR-7: User selects which intervals are in the pool, from the 12 semitone intervals.
- FR-8: Direction: ascending, descending, or harmonic (both notes together).
- FR-9: Root note: random or fixed.

**Free-play mode**
- FR-10: User clicks any two notes on the active instrument. The app names the interval and plays it.

**Sound**
- FR-11: Every note shown can be heard. Audio quality target is open (see Open Questions).

### Slice 1B — Chords and Voicings

Chord scope: triads (major, minor, diminished, augmented) and 7ths (maj7, dom7, min7, m7♭5, dim7). The builder works in root position.

**Chord builder**
- FR-12: User builds a chord on the keyboard by choosing root and quality, or by toggling individual notes. The app shows the note names and the intervals from the root.
- FR-13: User plays the chord as a block or as an arpeggio.
- FR-14: Chord free-play: user toggles any notes and the app names the chord.

**Transfer to guitar**
- FR-15: Swapping to the fretboard keeps the chord. All positions of the chord's notes show across the neck, with the root highlighted and other notes marked by role (3rd, 5th, 7th). User can limit the view to a fret region.

**Voicings**
- FR-16: User can find a playable guitar voicing for the chord and change it. A voicing is a specific set of fretted notes, at most one per string, with unused strings muted.
- FR-17: The app generates every playable voicing (reachable fret span, essential chord tones present) and the user steps through them. Common shapes (open, barre) rank first. `[ASSUMPTION]` span limit and which chord tones may be dropped are defined at architecture or UX time.
- FR-18: Voicings match the register of the source chord. A chord built high on the piano maps to the nearest-register guitar voicing, not an open chord.
- FR-19: User can hand-edit a voicing by moving notes on the fretboard. The app keeps naming the resulting chord.
- FR-20: User can play the voicing (strummed and as an arpeggio) to hear it.
- FR-21: Voicings also work on the piano: inversions and spread voicings of the built chord, playable and steppable the same way.

**Chord ear practice**
- FR-22: Same listen, replay, reveal flow as intervals, with a user-selected pool of chord qualities. No scoring.

### Success Measure

The user can name M3, P4, P5 and the 7th intervals (m7, M7) by ear without looking. One line to mark when 1A is done, not a metric to track.

## Out of Scope (for now)

- Progress tracking and adaptive drilling (possible later phase)
- Instrument input (mic, MIDI)
- Mobile
- Accounts, sharing, monetization

## Constraints and Dependencies

- Laptop browser. Audio synthesis and playback are required.
- Tech stack is undecided. To be chosen with Winston (architect).
- Swappable-view UX is to be explored with Sally (UX designer).

## Resolved

- Usage scenario: not needed. The user knows what they want (on-demand ear practice, chord build and transfer).
- Phase 1 scope: intervals (1A), then chords and voicings (1B).
- Chord scope: triads and 7ths.
- Voicings: in scope. A chord built on piano is useless if the user can't find a way to play it on guitar.
- State on swap: the chord carries over.

## Open Questions

1. **Sound approach.** Plain synthesized tone, or sampled guitar and piano? The user wants to explore options before choosing. (Winston)
2. **Tech stack.** (Winston)
3. **Instrument swap UX.** Layout, transitions, and how the interval selection shows on each view. (Sally)
4. **Voicing rules.** Max fret span, which chord tones may be dropped, how open strings count, and how "closest register" is measured. Defined with Winston (algorithm) and Sally (how candidates are browsed).
