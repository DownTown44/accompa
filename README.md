# accompa

accompa is an ear-training web app for intervals and chords. You hear an interval or a chord, say what it is if you want to, and see it on a piano or a guitar fretboard. It is built for a laptop, with a keyboard and a mouse; there is no touch or phone layout. It keeps no score and no streak, and it never praises or scolds.

The app has two modes, **Listen** and **Explore**, and two instruments, **Piano** and **Guitar**. Everything works on both.

## What you can do

### Listen

Listen plays a random question and waits for you.

- **Intervals.** Hear a random interval from the twelve between a minor second and a perfect octave. Replay it as often as you like.
- **Guess if you want to.** Pick the interval from the row of buttons or by key. A right guess reveals the two notes on the instrument with the interval named, and Next draws a new question. A wrong guess stays marked and you can try again. Guessing is optional.
- **Reveal.** Press Reveal and the two notes light up on the instrument, with the interval named. Then Next draws a new one.
- **Direction.** Ascending, descending or harmonic (both notes together).
- **Root.** The first note is random, or fixed to a root you set with the R key.
- **Interval pool.** Choose which of the twelve intervals can come up. At least one always stays on, and the pool is remembered between visits.
- **Chords.** Switch practice from Intervals to Chords in Setup. The pool is the nine qualities, shown as Maj, Min, Dim, Aug, Maj7, Dom7, Min7, m7♭5 and Dim7. Guess the quality, or just Reveal; a right guess reveals the chord too, lit on the piano or the guitar; Next plays a new chord. On the guitar the chord shows as one playable voicing near the register you heard.

### Explore

Explore is a workbench. Click notes on either instrument and the app tells you what you built.

- **Intervals.** Click two notes and the interval is named and can be played.
- **Chords.** Click more notes and the readout names the chord as you go. Chord names come from one place in the code, so every part of the app agrees. When a set of notes can be read more than one way, the root reading is shown and the alternatives can be chosen.
- **Roles.** The root and each chord tone have their own marker shape, so roles are never shown by colour alone. A legend sits beside the instrument.
- **Carry a chord across.** Build a chord on the piano, swap to the guitar, and the chord comes with you (and back).
- **A playable voicing.** On the guitar, accompa generates the playable voicings of the chord within the first twelve frets, with a limited finger span and at most four fingers, and shows the one nearest the register you built. The guitar holds one lit note per string.
- **Stepping.** Step through the voicings with the arrow buttons or Left and Right. Voicings are ranked by register, then common shapes first (open shapes and movable E-shape, A-shape and top-triad shapes for the common qualities), then fewer strings muted and a smaller span.
- **Hand editing.** Move a note along its string to tune a voicing to a shape you like. The chord is still named, and the readout says the voicing was edited.
- **Playback.** Play sounds the notes one at a time, Block plays them together (strummed, when a guitar voicing is shown).
- **No double accidentals.** Notes and chord names are spelled without double sharps or flats; an enharmonic spelling takes over where one would appear.
- **Clear and undo.** Escape clears the notes, and the status note offers Undo.

### Instruments and sound

The piano is a keyboard you can shift an octave at a time with `[` and `]`. The guitar is a standard-tuned fretboard with 22 frets. Both are plain, schematic drawings, not photographs of instruments. The piano plays a bundled sampled piano (Salamander Grand Piano V3, see `CREDITS.md`) through the Web Audio API; the guitar and the Synthesized choice in Setup use a synthesizer. Every sound file is served by the app itself, with no third-party requests. If the browser holds the audio back until a key press, the status note says so.

### Themes

System, light or dark, chosen in Setup. System follows the operating system. The theme, the sound and the interval pool are saved in the browser.

## Keyboard shortcuts

Hover over or focus the help hint, or press `?`, to see this list in the app.

| Key | Action |
| --- | --- |
| Space | Play, or replay |
| Enter | Reveal, then Next (Listen); Block (Explore) |
| 1-9, 0, -, = | Pick the interval from m2 to P8; in chord practice, the first nine pick a quality |
| M | Switch between Listen and Explore |
| I | Switch between Piano and Guitar |
| R | Set the root |
| P | Open or close Setup |
| [ and ] | Piano octave down, up |
| Left and Right | Previous, next voicing (Explore, guitar) |
| Esc | Close a panel or list; clear notes in Explore |
| ? | Show the shortcut list |

## Design principles

- No score, no streak, no praise. The status text is quiet, short and plain.
- Nothing moves. The instrument and the status note stay where they are, and the page does not scroll at 1280 x 800.
- Keyboard first, with a visible focus ring, and roles never shown by colour alone.
- Laptop only: no touch, phone or narrow-screen handling.

## Getting started

You need the Node version in `.nvmrc`.

```
npm install
npm run dev       # start the Vite dev server
npm test          # run the tests once
npm run build     # type-check and build to dist/
npm run check     # type-check, import boundaries and tests
```

`yarn run check` works too; plain `yarn check` is yarn's own lockfile command, not this script.

## Project structure

- `src/core` holds the pure music theory: intervals, chord qualities and naming, spelling, guitar voicings and shapes. It takes randomness as a parameter and has no side effects.
- `src/audio` holds the sound engine.
- `src/ui` holds the React features (Listen, Explore, instruments, setup, shortcuts, help, themes). Features share code only through `src/ui/shared`, and `npm run check` enforces the layering.
- `tests` holds the Vitest suites, with shared helpers in `tests/ui/support`.
- `docs/development-notes.md` describes the working process.

## How it was built

accompa was built with the BMad Method as a trial of it. The product requirements, UX and architecture documents, the epics and every story spec, review log and retrospective are kept in `_bmad-output`, and that record is deliberately preserved.

## Testing

Tests run with Vitest on happy-dom. Unit tests do not cover layout, so layout changes are also checked by hand in a real browser.

## Status

Epics 1 to 5 are done: interval practice, Explore, chord building and naming on the piano, finding the chord on the guitar, and chord ear practice.
