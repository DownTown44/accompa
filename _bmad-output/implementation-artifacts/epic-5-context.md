# Epic 5 Context: Chord ear practice

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Apor runs the Listen flow with chord qualities instead of intervals: he switches practice to Chords, hears a random chord, optionally guesses its quality from a pool he chooses, and reveals it lit on the active instrument. It trains the ear for chord quality the way Epics 1 to 3 trained it for intervals, with no score, streak or praise, and it reuses the Epic 4 voicing path so the guitar reveal shows a real playable shape.

## Stories

- Story 5.1: Choose chord practice and hear a chord
- Story 5.2: Guess a chord quality
- Story 5.3: Reveal the chord on the instrument

## Requirements & Constraints

- Same listen, replay, optional guess and reveal flow as interval practice, with a user-selected pool of the nine chord qualities (all selected by default). No score counter.
- The last pool chip cannot be unticked. The chord pool is not persisted (only sound, theme and interval pool persist). Practice defaults to Intervals on load.
- Question quality and root come from an injected random function; every note must fit the active instrument's range. `core/` never calls `Math.random`.
- `Space` replays the same chord identically. Pool, practice mode or question changes apply from the next question; the current one stays answerable.
- Decided 2026-10-27: the question chord plays as a plain block on both instruments, not a strum (Explore's Block strums on a shown guitar voicing; Listen must not).
- Guess feedback: correct names the quality and plays the next chord (`Minor. Next chord is playing.`); wrong shows the wrong treatment (fill, inset ring, strike-through, `aria-disabled`, accessible name like `Minor, tried`) and `Minor is not it — try another.`, and the question stays. Results go to a polite live region. Buttons are disabled once revealed. Pool-excluded buttons are disabled at no less than 55% opacity.
- Reveal (`Enter` or click): readout shows the chord name, notes light with role shapes (root ringed, 3rd diamond, 5th square, 7th triangle), legend shows, Reveal becomes Next; the name is announced politely. Next plays a new chord and unlights.
- Piano reveal lights the actual keys and shifts the window to include them. Guitar reveal shows the best-ranked playable voicing in the register of the question chord, derived as the Explore guitar does (open and muted markers included, no stepper). Decided 2026-10-27, replacing the nearest-low-frets cluster.
- Chord practice never touches the workspace (the chord built in Explore); switching to Explore and back keeps the same question. No score, counter or praise on reveal.
- Laptop-only: no touch or narrow-viewport handling.

## Technical Decisions

- Chord names come only from `nameChord` (`src/core/chords.ts`) with spelling from `core/spelling`, which avoids double accidentals (Story 4.8); no surface picks its own reading.
- `Workspace` and `practice` change only through reducer actions in `src/ui/session/session.ts`; reducer tests assert the other half is untouched by reference. Practice state holds the question and wrong marks.
- Voicings: `generateVoicings(chord, tuning, rules, range?)` and `rankVoicings(...)` in `core/voicings.ts`, templates from `core/shapes.ts`, tuning and `VOICING_RULES` as constants. The reveal takes the best-ranked voicing whose register matches the question chord's mean pitch.
- Audio engine takes an ordered pitch list with a play mode (block, arpeggio, `'strum'`); Listen uses block.
- UI features share code only through `src/ui/shared`; `npm run check` enforces boundaries. Shared test helpers live in `tests/ui/support/`.
- Known follow-up: `useShown` / `useVoicingList` / `useLitNotes` are recomputed in about seven consumers; a shared provider was planned before more consumers are added (retro action item 2).

## UX & Interaction Patterns

- Setup panel gets a Practice segmented control (Intervals, Chords) with a Setup label and the shared selected treatment, plus a chip group of the nine qualities when Chords is chosen. The control's placement is an assumption of Story 5.1.
- Readout waits with `Which chord?`. Answer buttons mirror the Interval row: one per quality, keys `1` to `9`, key-hint caps.
- Listen states mirror intervals: waiting, wrong, right, revealed; polite live regions for guess results and Reveal.
- The shared piano, fretboard and readout block height (which includes the reserved stepper row) serve Explore and Listen: check Listen and Explore after any layout change, and in headless Chrome at 1280 x 800 confirm the instrument's top edge and Status note stay put and the page does not scroll.

## Cross-Story Dependencies

- 5.1 introduces the practice mode, chord pool and question generator; 5.2 needs its question and pool; 5.3 needs the question and the Epic 4 voicing path.
- Builds on Epic 1 (Listen flow, audio, interval pool pattern), Epic 3 (namer, role shapes, legend, readout) and Epic 4 (voicing generation, ranking, spelling).
