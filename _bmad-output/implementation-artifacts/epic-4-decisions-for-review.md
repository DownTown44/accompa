# Epic 4: decisions made without asking, for Apor's end-of-epic review

Apor asked for the whole epic to be built first and discussed afterwards. Each story's spec holds the full frozen text and its Review Triage Log; this page lists every decision that was made on Apor's behalf and the alternative not taken. Change any of them by editing the spec's frozen block or telling the dev agent.

## Scope changes (sprint change proposal 2026-10-26)

- Story 4.1 retired: delivered by Stories 3.8 and 3.9. A chord on the guitar is a playable voicing, never "every position of each note", never dimmed extra positions, never a single note at every position.
- Story 4.2 (fret-region bar) dropped. The generator still takes an optional fret range (pure, tested, not wired to the UI).
- The register ranking moved from 4.4 into 4.3; 4.4 is the stepper only. The no-voicing Status text is `No voicing fits these notes.`
- One PR for the whole epic, one feat commit and one record commit per story.

## 4.3 Generate and show the best voicing (core/voicings.ts)

- Rules: max span 4 (open strings excluded); the lowest sounding note is the bass of the reading, else the root (a C major must not show as C/E), else any note if none exists; no muted string between sounding strings; an open string only when every fretted note is at or below fret 5; root and 3rd required, the 7th required on seventh chords. Chord tones may double across strings.
- Ranking: register bucket (6 semitones; `x 3 5 5 5 3` and the 8th-fret barre count as one register), then more sounding strings, then smaller fret span, then fewer different fretted frets, then exact distance, then generator order. Source register = mean pitch of all lit notes, including any beyond the fretboard.
- One or two lit notes, or notes with no chord name, keep the Story 3.9 placement. A fret click while a voicing shows used to keep the 3.8 rule (Story 4.6 replaced it).
- Changed after Apor tried it (2026-10-26): at most four fingers (a fretted note is a finger; the notes at the lowest fretted fret share one finger as a barre unless an open string lies between the barre's outer strings), the 5th is required on triads and droppable only on seventh chords, and the `5th left out` Status line was removed. `8 7 5 5 8 8` and `3 2 3 0 3 3` are no longer voicings.
- Also changed after Apor tried it: no voicing uses a fret above 12 (`maxFret`), because the neck repeats and chords are not usually played there; a high chord shows the nearest voicings at or below fret 12, and the fretboard still draws 22 frets. Every quality has voicings for all twelve roots under that limit.
- Not taken: any note may be lowest; inner mutes allowed; open strings at any fret.

## 4.4 Stepper

1. The workspace stores the selected voicing as its frets; a stored value not in the list shows the best voicing. Not taken: an index.
2. `selectVoicing` is a reducer action; a changed note, reading or root drops the selection and the stepper reopens on voicing 1. Esc clears and Undo restores it.
3. The stepper row sits after the reading alternatives; the block-height token grew by 40 px plus a gap for Explore and Listen together, so a mode switch moves nothing. The instrument top is now at 366.2 px (it was 312.2) and the SVG is smaller. Not taken: grow Explore only.
4. Left and Right step on the guitar when focus is on the instrument, the stepper, or nothing; they yield to other focused controls and modifiers. Listed in the shortcut list.
5. The inert end arrow is a `·` span with `aria-disabled`; focus moves to the other arrow, or to the instrument when the stepper hides.
6. A step is announced after 400 ms; a new chord, swap or undo is not. Left at voicing 1 is a no-op.

## 4.5 Common shapes

- Template data (`core/shapes.ts`): movable E-shape and A-shape barres for major, minor, 7, m7 and maj7, a top triad on the G, B and high e strings (a reading of "the 3 note variant"), and the standard open C, A, G, E, D and Am, Em, Dm plus open sevenths. Dim, aug, m7b5 and dim7 have no templates and use generated voicings only.
- A match is equal frets to an instantiated template; the match key sits right after the register bucket; an open shape counts only in bucket 0. Movable shapes are instantiated at fret 1 to 12 and 12 higher while they fit. The open C7 leaves out its 5th.

## 4.6 Hand-edit

- `Workspace.edited` beside the voicing; `Workspace.pitches` follows the edit (unique, bass to treble), so the piano, readout, Play and Block follow. A fret click moves that string's note, a click on the string's current note (fretted or open) mutes it, a click on an open or muted string sets it.
- Edits may break the span and open-position rules. The first arrow press from `Voicing edited` (Left or Right) goes to the first entry of the generated list for the edited pitches. An edit that lands on a generated voicing still reads `Voicing edited`.
- Esc clears and Undo restores; there is no edit-level undo. Fewer than two notes drops the edit; a unison collapses to one pitch. Choosing a reading or root keeps the edit; a piano click drops it.

## 4.7 Hear it

- Engine mode `strum`, 40 ms between strings, peak gain scaled by note count. On the guitar with a voicing shown, Play sounds the fretted pitches one at a time (bass to treble, doubles kept) and Block strums them; otherwise as before. The buttons stay `Play` and `Block`. Not taken: strum on the piano, a setting for the spread.

## Known weak spots to try out

- A swapped C major shows the 8th-fret barre (49 voicings in all); the first shape for E, F and D in the register of octave 4 is also the E-shape barre high on the neck, because the register ranking comes first and open shapes count only within the source register.
- The voicing lists are long (96 for C major), and ranking by register means the first few are all barres near the register you built.
- Performance: the voicing list is computed in several hooks per change, and one stepper test's timeout was raised to 20 s. Not noticeable in Chrome, but worth a shared provider if it ever lags.
- Strum timing was checked only against a fake audio clock; nobody has listened to it yet.
- The `x` markers were checked in a real browser only for edge cases (voicing 96 of 96, edits).
