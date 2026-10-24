# Epic 2 Context: Explore intervals on the instruments

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

In Explore, Apor clicks any two notes on the piano or the fretboard and the app names the interval between them and plays it. He can replay the pair, clear it with an undo, and tinker without disturbing a Listen question in progress. This finishes slice 1A and makes Explore the mode the app opens in. Chord building, naming and voicings come in later epics, so this epic caps lit notes at two.

## Stories

- Story 2.1: Name an interval from two clicked notes
- Story 2.2: Hear the interval and clear the notes
- Story 2.3: Keep Explore and Listen separate

## Requirements & Constraints

- Every note click sounds immediately on pointer-down, then toggles lit on release; clicking a lit note unlights it.
- Explore is the default mode on app open (Listen was the default before); `M` still switches.
- At most two notes stay lit in this epic: a third click unlights the oldest.
- Readout states: no notes shows the quiet prompt `Select notes to build a chord` with no role legend; one note shows its name; two notes show the interval name, lower note first.
- Intervals wider than an octave show as their simple interval or the octave; 6 semitones is always A4. This rule is tested in `core/`.
- On the fretboard the exact clicked string and fret lights, and several lit positions may share a string in Explore. The pitch comes from `core/instruments`.
- Swapping instrument keeps the same pitches lit on the other instrument.
- The interval name goes to a polite live region, debounced 300 to 500 ms.
- Tone: short, sentence case, no praise, no exclamation marks.
- Notes only sound from the audio engine interface; audio failures surface as the Status note and never break naming.

## Technical Decisions

- Pitch is an integer (branded `Pitch`); the lit set is pitches in the workspace, not note-name strings. All labels come from `core/spelling` (interval name, note names); no component spells a note.
- The interval table in `core/theory` is the single source for interval names; the naming rule for the pair lives in `core/` and is unit tested.
- Session has two single-writer parts: workspace (written only by Explore actions: lit notes) and practice (written only by Listen rounds). A practice action never alters the workspace and a workspace action never alters practice. Active instrument is separate. Types in `core/model`, reducers pure and in `ui/`.
- Lit notes are plain serializable data and are not persisted (only sound, theme and interval pool persist).
- Playing a sound is a command to the audio engine (an ordered pitch list as block or arpeggio), never React state. A single clicked note is a one-pitch list.
- Instruments are controlled views: they report `onNotePress` and `onNoteRelease` and own no musical state or sound; the parent wires lighting and sound.
- Lit notes are also what a later MIDI note-on should drive, so keep one click-to-sound path.
- Listen reveal draws from practice state, not from the workspace.

## UX & Interaction Patterns

- Marking: with one note lit it carries the root marker; with two, the lower note carries the root marker and the upper the no-role dot. Never by color alone.
- Action buttons: Block (`Enter`, primary, apricot) plays the pair together; Play (`Space`) plays it as an arpeggio, low to high. With one note lit both play that note alone; with none nothing plays and nothing errors. A focused button gets `Space` and `Enter` as activation, not the shortcut.
- `Esc` clears all lit notes and shows the Status note `Notes cleared. Undo` with an Undo button that restores them. It stays until the next note change; there is no `Ctrl+Z`. If the Setup panel or shortcuts list is open, `Esc` closes that first and leaves the notes.
- Focus order puts the Status note `Undo` button after the Action buttons and before the Setup opener.
- Note toggling is pointer-only in v1; no keyboard note building.

## Cross-Story Dependencies

- 2.1 depends on Epic 1: the instrument `onNotePress` / `onNoteRelease` seams, `core/spelling`, `core/instruments` position mapping, the audio engine, and the session workspace and practice split from Story 1.3.
- 2.2 builds on 2.1 (lit notes exist, readout shows the pair) and adds the Action buttons and Status note behavior.
- 2.3 verifies the workspace and practice separation across both modes; it should be checked against 2.1 and 2.2 behavior.
- Epic 3 lifts the two-note cap and replaces the interval readout with chord naming, so keep the lit-notes cap in one place.

## Patterns Built So Far

- Explore (2.1): the app opens in Explore. `Workspace` holds `pitches` (oldest first) and `positions` (guitar position remembered per pitch). `core/explore.ts` owns `MAX_LIT` (the one place the two-note cap lives), `toggleLit`, `pairInterval`, `exploreReadout` and `litPositions` (remembered position, else lowest fret, else the closest pair for two unknown pitches).
- `toggleNote` (session reducer) lights, unlights or moves a note. `pressNote` sounds a one-pitch block in Explore; `releaseNote` toggles. A lit pitch clicked at another guitar position moves there.
- `useLitNotes` returns the workspace with exact guitar positions and the root (lowest pitch) in Explore, and nothing but a revealed question or the Fixed root in Listen.
- `ui/explore/ExploreView` shows the prompt or the 84px interval, with the full name visually hidden and a polite live region debounced 400 ms. The prompt and the readout share one height so the instrument never jumps.
- Open: lit notes beyond the guitar range or wider than one piano window after a swap (see `deferred-work.md`).
- Play and Block (2.2): `ui/explore/ExploreControls` reuses the Listen `action-button` look; `play` and `revealOrNext` in `useSessionActions` are mode-aware (Explore sounds the lit pitches low to high as arpeggio or block). `Esc` (`dismiss`) closes the shortcuts list, then Setup, then clears the lit Explore notes into `Session.cleared`; `undoClear` restores them silently and refits the piano. `StatusNote` takes an optional `action` button; `App` picks the message in the order audio blocked, Fixed-root prompt, clear note with Undo, offscreen.

- Separation (2.3): the workspace and `cleared` are written only by `toggleNote`, `dismiss` and `undoClear`; practice only by `setQuestion`, `clearQuestion`, `setFixedRoot`, `reveal` and `guess`; a mode switch writes neither (reducer test checks every action by reference). `setDirection` and `setRootMode` only store the setting in Explore, so the waiting question, its marks and its reveal survive and the next question uses the new value; from Listen they still replace the question silently. `tests/ui/app/ModeSeparation.test.tsx` holds the pictured uses through `App`.
