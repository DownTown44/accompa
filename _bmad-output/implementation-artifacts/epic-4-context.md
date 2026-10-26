# Epic 4 Context: Find the chord on guitar

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Apor builds a chord on the piano, swaps to the fretboard with it carried over, sees a playable voicing in the register he built, and steps through ranked voicings whose register matches (a high chord gives high shapes, not open chords). He can limit the neck to a fret region, hand-edit a voicing while the name keeps updating, and hear the exact fretted voicing strummed or arpeggiated. This is the payoff of the chord-builder flow and finishes the guitar side of slice 1B.

## Stories

- Story 4.1: Carry the chord to the fretboard (retired, delivered by Stories 3.8 and 3.9)
- Story 4.2: Limit the fretboard to a fret region
- Story 4.3: Generate every playable guitar voicing (also ranks by register and shows the best-ranked voicing)
- Story 4.4: Step through voicings, nearest register first (stepper only)
- Story 4.5: Common shapes rank first
- Story 4.6: Hand-edit a voicing
- Story 4.7: Hear the voicing strummed or arpeggiated

## Requirements & Constraints

- Guitar is six strings, standard tuning (E A D G B E), 22 frets; tuning is a parameter to core functions (no tuning UI).
- Generation returns every playable voicing, unranked: at most one fretted note per string, unused strings muted. It is total: no voicing means an empty list, never an exception.
- Voicing parameters are tunable constants kept in one place in `core/`: max fret span 4, open strings excluded from the span, root and 3rd always present, 7th mandatory on seventh chords, only the 5th droppable, register bucket width.
- Ranking is a separate pure function, built in Story 4.3 alongside the generator. Primary key is register distance (absolute difference of mean pitch to the source chord, in semitones), grouped by bucket width; tests prove a high source chord returns high voicings first and a low one low voicings first. Story 4.5 adds the template tie-break within a bucket (a fixed open shape ranks first only within the source register; non-matching voicings follow the matches).
- Common shapes are curated data (movable shapes relative to the root, open shapes fixed). A test asserts every template yields exactly its chord's pitch classes. A quality with no templates falls back to generated voicings only.
- Pitch class, not octave, decides which notes a voicing may use; chord pitches outside the guitar range stay in the readout.
- Generation respects the fret region: only voicings inside it are generated and shown.
- Fret region is drag-only (accepted limit), session-only, not persisted; Clear must be a real, keyboard-operable button with a hit area of at least 28px.
- Playback: Block (`Enter`) strums bass to treble with a short even spread; Play (`Space`) sounds notes one at a time bass to treble; muted strings are silent; an edited voicing plays the edited pitches.
- Tests cover all nine qualities, open and muted strings, span limits, dropped 5ths, and a no-voicing case, checking pitch classes exactly match the chord (allowed omissions aside).

## Technical Decisions

- Layers: `core/` is pure (no browser APIs, no audio, no UI imports); `audio/` imports core types only; `ui/` may import both. Randomness is injected, never `Math.random` in core.
- Pitch is a MIDI integer (`Pitch`, `PitchClass`, `Interval` branded types); no note-name strings stored or compared. Spelling goes only through `core/spelling`; chord names only through the namer.
- A voicing is an ordered pitch list, bass to treble; a guitar voicing adds a per-string fret or muted assignment. Naming and playback take the pitch list and ignore how the voicing was produced. Generation and ranking stay separate functions.
- Session: workspace (chord, selected voicing per instrument, written by builder, free-play and voicing editing) is separate from practice. A guitar voicing carries string and fret positions so edits survive an instrument swap and swap-back. Views are pure renders of session state; changes go through reducer actions.
- Until Story 4.3 lands, a chord on the guitar keeps the one-note-per-string placement from Story 3.9 (`placeLit`); Story 4.3 replaces it with a voicing. A single lit note keeps that placement and shows no stepper.
- Namer returns ranked readings (first shown large, rest as alternatives); an edited voicing is re-named by the namer, and a non-chord shows note names.
- Audio engine is one interface: ordered pitch list played as block, arpeggio or strum, plus stop. Story 4.7 adds strum mode behind the same interface. The engine owns timing; callers pass no timestamps.
- Only sound, theme and interval pool persist; chord, voicing and region do not.

## UX & Interaction Patterns

- Swap with `I` or the toggle. The fretboard shows the chord as one playable voicing in the register built: root as a ringed filled circle, other notes by role shape and colour (3rd, 5th, 7th). Legend and readout match piano.
- Voicing markers: fretted markers, open strings as the role shape in a ring at the nut, muted strings as a muted cross `x`; nothing else is marked.
- Empty fretboard shows the empty prompt. A single lit note shows where it is placed, with no stepper (a voicing needs two or more notes).
- No voicing fits: fretboard empty, stepper hidden, only the Status note `No voicing fits here. Try widening the region.`; notes stay lit on piano.
- Fret-region bar sits over the fret numbers; set by dragging, filled with the accent. Default is the whole neck, where the quiet muted clear cross sits right of the bar and is disabled.
- Voicing stepper `◀ Voicing 1 of N ▶`, arrows at least 40 x 40px, opens on the best-ranked voicing, `Left`/`Right` step, no wrap. The end arrow becomes an inert `·` with `aria-disabled`; focus moves to the remaining arrow, or to the instrument if the stepper hides. A polite live region announces `Voicing 2 of 8`. It reopens on the best voicing when the chord changes; the selected voicing is kept across a swap to piano and back.
- Hand-edit: clicking a fret moves that string's note there (sounds on press); clicking the current fretted note mutes the string. The stepper shows `Voicing edited`; the first arrow press returns to the generated voicing nearest the edit (an assumption). Fewer than two notes behaves as single-note or empty.
- Focus order: Readout alternatives and stepper, then `Clear fret region`, then action buttons.
- After any layout or CSS change, check Listen too (shared piano, fretboard and readout components).

## Cross-Story Dependencies

- Story 4.1 is retired: carry-over, swap back, the empty prompt and the out-of-range readout behaviour were delivered by Stories 3.8 and 3.9, so Epic 4 builds on them directly. Build order is 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, with no renumbering.
- 4.2 (region) comes first so that 4.3 can honour it.
- 4.3 holds the generator, the register-distance ranking and the display of the best-ranked voicing; 4.4 adds only the stepper over that ranked list; 4.5 adds the template tie-break (the ranking function must accept template data).
- 4.6 (hand-edit) needs 4.3 and 4.4 (the voicing shown and the stepper state); 4.7 needs the shown or edited voicing from 4.6 and extends the Epic 1 audio engine with strum mode.
- Builds on Epic 3: the chord, namer readings and chosen root, and the one-note-per-string placement from Stories 3.8 and 3.9.
- Epic 5 (chord ear practice) later reuses the fretboard to reveal chords.
