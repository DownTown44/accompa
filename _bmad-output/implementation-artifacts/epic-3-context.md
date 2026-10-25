# Epic 3 Context: Build and name chords on the piano

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

In Explore, Apor clicks any notes on the piano keyboard and the app marks the root, names the chord live, shows each note's role and its interval from the root, and plays the chord as a block or an arpeggio. When the same notes have several names (a diminished seventh or an augmented triad), he can pick another reading. This lifts the two-note cap from Epic 2 and replaces the interval readout with chord naming. Guitar voicings (Epic 4) and chord ear practice (Epic 5) build on the chord quality table and namer created here.

## Stories

- Story 3.1: Name chords in core
- Story 3.2: Root marker, role shapes and legend
- Story 3.3: Choose between alternative chord readings
- Story 3.4: Play the chord as a block or an arpeggio
- Story 3.5: See the chord named as I click notes (split from 3.1; built after 3.1, before 3.2)

## Requirements & Constraints

- Scope is triads (major, minor, diminished, augmented) and sevenths (maj7, dom7, min7, m7b5, dim7), root position as the first reading; inversions appear as slash chords.
- The user builds a chord by clicking individual keys; each click sounds on pointer-down and toggles lit on release. No keyboard note building.
- Naming is live: the readout updates on every note change and is announced politely, debounced 300 to 500 ms.
- Root is the reading's root (the lowest lit note of that pitch class; the lowest lit note when nothing is named). `R` then a click on a lit note sets it; clicking an alternative reading sets it too. A user-chosen root stays until that note is unlit or the user changes it again.
- Unknown note sets show the note names with no chord name; the lowest note keeps the root marker, others get the no-role dot, and the legend lists only the root.
- Readout also shows the intervals from the root for each note. The legend lists only roles present with note names (`root C`, `3rd E`, `5th G`, `7th B`) and is absent for an empty chord.
- Roles are never conveyed by color alone: root is a ringed filled circle, 3rd a diamond, 5th a square (green), 7th a triangle, no-role a small ink dot; 1.8px ink outline, at least 18px; piano keys add an 80% role tint. Dark theme uses the dark role tokens.
- Play (`Space`) is the arpeggio low to high, Block (`Enter`, primary) sounds all notes together; there is no separate Arpeggio button or `A` key. No notes means nothing plays and nothing errors. A blocked audio context shows the Status note `Press any key to wake the sound.`
- Tone: short, sentence case, no praise, no exclamation marks.

## Technical Decisions

- One chord quality table in `core/theory` (name, symbol, interval stack) is the single source; UI lists, namer, later voicing generator and practice pools derive from it. Adding a quality means adding one entry.
- The namer is a new pure `core/` module: pitches in, all ranked readings out (root, quality, optional bass), lowest sounding note as root first, root position before inversions, empty list for no match. It is the only path to a chord name; no surface picks its own reading. Choosing an alternative reading sets the root and the spelling.
- `core/` stays pure: no browser APIs, no imports from `ui/` or `audio/`, and no `Math.random` (randomness is injected, tests are seeded). Functions are total and return empty results, not exceptions.
- Pitch is an integer (branded `Pitch`, `PitchClass`, `Interval`); no note-name strings in `core/`. A spelled note is a struct of integers.
- Spelling lives in `core/spelling`: chord tones are spelled by letter stepping from the spelled root (3rd +2 letters, 5th +4, 7th +6), with the default root table (Db, Eb, Gb, Ab, Bb flat; C#, F# sharp) where no reading fixes the root. dim7 must spell correctly. Six semitones is always A4.
- Tests to cover: every supported quality in root position, inversions, diminished-seventh and augmented alternatives, unknown sets, dim7 spelling, and the first-reading fallback when a chosen reading disappears.
- The workspace holds lit notes and the chosen reading or root; practice never writes it. Lit notes and the chosen reading are not persisted.
- Playing is a command to the audio engine with an ordered pitch list (block or arpeggio in list order); the engine owns timing and callers pass no timestamps.

## UX & Interaction Patterns

- Readout: the first reading is large (84px), alternatives are small clickable italic text beneath, and they are focusable buttons that follow the readout in the focus order, with the standard focus ring.
- Empty state keeps the prompt `Select notes to build a chord`; a single note shows its name with the root marker.
- Focus order: Mode strip, Instrument, Readout alternatives, Action buttons, Status note Undo, Setup opener, Help hint.
- `R` sits in the key map as "Set root"; shortcuts yield to a focused button, tab, radio or chip and ignore Ctrl, Alt and Meta.

## Cross-Story Dependencies

- 3.1 creates the quality table, namer and spelling extension and lifts the two-note cap; 3.2 to 3.4 build on its readings.
- 3.2 adds roles, legend and the `R` root gesture on top of 3.1's default root.
- 3.3 adds reading selection and depends on 3.1's ranked readings and 3.2's root and legend updating.
- 3.4 reuses the Play and Block buttons from Story 2.2 and extends them to three or more notes.
- Epic 4 (carrying the chord to the fretboard, voicings) and Epic 5 (chord practice and Reveal) reuse the quality table, namer, spelling and role markers.

## Patterns Built So Far

- Workspace and cleared state: `Workspace` holds `pitches` (oldest first) and `positions` (guitar position remembered per pitch); `Session.cleared` holds the notes restored by Undo. They are written only by `toggleNote`, `dismiss` and `undoClear`; practice is written only by its own actions, and a reducer test checks every action by reference. Mode switches write neither.
- Two-note cap: `MAX_LIT` in `src/core/explore.ts` is the one place the cap lives, used by `toggleLit`. Epic 3 lifts it there; `pairInterval`, `exploreReadout` and `litPositions` in the same file are the interval-era readout logic Epic 3 replaces or extends.
- Explore readout: `ui/explore/ExploreView` shows the prompt or the 84px name, with the full name visually hidden and a polite live region debounced 400 ms. The prompt and readout share one height (`--spacing-readout-block-height`), so the instrument top stays put; keep that when adding alternatives and the legend.
- Lit notes: `useLitNotes` returns the workspace with exact guitar positions and the root (lowest pitch) in Explore, and only a revealed question or the Fixed root in Listen. Epic 3 made the root the reading's root and user-selectable (`exploreReading`, `Workspace.root`).
- Play and Block: `ui/explore/ExploreControls` reuses the `action-button` look; `play` and `revealOrNext` in `useSessionActions` are mode-aware and sound the lit pitches low to high (arpeggio or block). These already handle any count of pitches. `dismiss` (`Esc`) closes the shortcuts list, then Setup, then clears the notes with Undo.
- Status note priority: `StatusNote` takes an optional `action` button; `App` picks the message in the order audio blocked, Fixed-root prompt, clear note with Undo, offscreen (piano offscreen-lit and guitar `beyondFretboard`).
- Shared UI in `src/ui/shared/`: `.controls`, `.action-button`, `.visually-hidden` styles and `focusInstrument`. `scripts/check-boundaries.mjs` stops `ui/listen`, `ui/explore`, `ui/shell` and `ui/shared` importing one another's feature code, so new chord UI goes in `ui/explore` or `ui/shared`, not borrowed from Listen.
- Test helpers: `press`, `radio`, `opener`, `panel`, `key`, `click`, `lit`, `rooted` in `tests/ui/support/dom.ts` and `keys.ts`; new UI tests import these instead of defining copies. `tests/ui/app/ModeSeparation.test.tsx` holds the Explore and Listen separation uses through `App`.
- Chord naming is a new `core/` module with no precedent in the code; it must be pure and free of seeded or unseeded random calls.
- Chord core (3.1): `CHORD_QUALITIES` (name, symbol, interval stack) in `core/theory.ts`; `nameChord(pitches)` in `core/chords.ts` returns readings `{ root, quality, bass? }` (lowest note first, then other roots low to high; `[]` under three pitch classes); `chordSymbol`, `spellChord` and `spellNotes` in `core/spelling.ts`. Symbols are the display names (`C`, `Am7/C`, `Cm7♭5`); the slash bass uses the default root table; pitch class 6 is F♯; double accidentals use `𝄫` and `𝄪`; no sixth quality (so `C E G A` is only `Am7/C`).
- Chord readout (3.5): `MAX_LIT` is now 8 and still the only place the cap lives. `exploreReadout` in `core/explore.ts` is the single readout path: one note shows its name, two the interval, three or more the first `nameChord` reading as `chordSymbol` with `chordSpoken` (`C major`, `A min7 over C`) as the spoken name, else `spellNotes` joined by spaces. `ExploreView` sets `data-size` (large up to 6 characters, medium up to 10, small beyond) on the `nowrap` readout `<p>`; the instrument top and the block height stay fixed across states. The Explore root is still the lowest lit note, so an inversion marks its bass until 3.2 moves the marker to the reading's root.
- Roles and legend (3.2): `exploreReading(lit)` in `core/explore.ts` is the one reading of the lit notes (readout, root, per-pitch `Role`, legend entries); the root is the reading's root (lowest lit note of that pitch class; the lowest lit note when nothing is named), so `C/E` marks C5 and a doubled root is also a root marker. `CHORD_QUALITIES` carry `degrees` (m3, M3, d5, P5, A5, d7, m7, M7). `ui/shared/RoleMarker` draws every marker (ringed circle root, diamond 3rd, square 5th, triangle 7th, small dot for none); `PianoKeyboard` and `Fretboard` take optional `roles` and, without them (Listen), keep the old root marker, r9 dot and no key tint. The legend is a reserved row (`.role-legend`, `--spacing-legend-height`) outside the live region, and `--spacing-readout-block-height` holds readout, gap and legend line for Explore and Listen, so the instrument top stays put.
- Reading choice (3.3): `Workspace.reading` (`ReadingChoice`: root pitch class and quality name, not persisted) is written only by the `chooseReading` action and pruned by `toggleNote` when the reading stops existing; Esc clears it and Undo restores it with the workspace. `exploreReading(lit, chosen?)` and `orderedReadings` in `core/explore.ts` put the chosen reading first and the rest in namer order, falling back to the first reading; it returns `readings` and `alternatives`. `ExploreView` shows the alternatives as `type=button` italic buttons in a reserved `.reading-alternatives` row between readout and legend, keyed by list position so focus stays put; the block height grew by `--spacing-alternatives-height` plus a gap. Only diminished sevenths (four readings) and augmented triads (three) have alternatives. Story 3.6 (chosen root) must combine its root with this reading.
- Chosen root (3.6): `Workspace.root` (a lit `Pitch`) is written only by `chooseRoot` (which also stores that root's reading in `Workspace.reading`, or removes it when no reading has that root, so the set reads as unknown) and dropped by `toggleNote` when the note is unlit; `chooseReading` clears it. `Session.rootArmed` is session state outside `Workspace` (set by `armRoot`, the `R` key), never undone, and cleared by a second `R`, Esc (after the shortcuts list and Setup), a mode switch or no lit notes. `exploreReading(lit, chosen?, root?)` gives a lit root precedence; for an unknown set `readings` and `alternatives` list every namer reading. `releaseNote` makes a lit note the root while armed without moving its guitar position; an unlit click lights it and stays armed. The Status note `Click a lit note to set the root.` ranks after audio blocked.
