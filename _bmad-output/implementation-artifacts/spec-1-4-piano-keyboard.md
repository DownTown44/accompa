---
title: 'Story 1.4: Piano keyboard'
type: 'feature'
created: '2026-10-23'
status: 'done'
baseline_commit: 'dbb85e59bd7a81321536a86810d7d641cd50e323'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The instrument area is empty. There is no piano to look at, so later stories (reveal, free play, chords) have nothing to draw on.

**Approach:** Add a presentational three-octave `PianoKeyboard` driven by a lit-note set and press/release callbacks, a pure `core/piano` window model, `[` and `]` octave shifting through the session, and the offscreen-lit Status note. Shown whenever Piano is the active instrument, in both modes.

## Boundaries & Constraints

**Always:** The component owns no musical state or sound; its state is a pure render of `lit`. Window start is a MIDI pitch (default 48 = C3; allowed 36, 48, 60), so the window never leaves MIDI 36 to 96. Black keys are drawn after white keys and win hit-testing. The keyboard is one focus stop with the standard focus ring; keys themselves are not focusable. A lit note shows the no-role dot on white and black keys alike. Colors come from existing tokens only.

**Never:** No sound or lighting on click in the app (press and release handlers are optional props the app does not wire yet), no role markers or tints, no fretboard (Guitar renders nothing yet), no Explore readout. No story or epic references in comments.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Default render | Piano, window 48 | 21 white and 15 black keys, labels C3 C4 C5 | N/A |
| Shift | `]` / `[` | window moves one octave, labels become C4 C5 C6 / C2 C3 C4 | At 36 or 60 the key does nothing |
| Shift keys | `event.key` `[` `]`, or `event.code` BracketLeft/Right; AltGr allowed | shifts | Ctrl, Alt or Meta held (not AltGr), repeat, text field: ignored |
| Pointer on overlapping area | press inside a black key's rectangle | black key's pitch | N/A |
| Press then release | pointer down, pointer up (or cancel) on a key | `onNotePress(pitch)` then `onNoteRelease(pitch)` | Missing handlers: nothing happens |
| Lit set | pitches passed in `lit` | each lit key in the window shows the dot; others none | Pitches outside the window draw nothing |
| Lit outside window | 2 lit below, 3 above | Status note `◀ 2 notes lit` / `3 notes lit ▶`; both sides: `◀ 2 notes lit · 3 notes lit ▶`; one lit: `1 note lit` | Audio-blocked note takes precedence |
| Guitar selected | instrument Guitar | no keyboard | N/A |

</frozen-after-approval>

## Code Map

- Extend, not replace: `src/ui/App.tsx` (Shell), `session.ts`, `useShortcuts.ts`, `useSessionActions.ts`, `StatusNote.tsx`, `shell.css`; reuse `core/pitch.ts`, `INSTRUMENT_RANGES`.
- `src/core/piano.ts` -- `WINDOW_SEMITONES`, `DEFAULT_WINDOW_START`, `isBlackKey`, `windowPitches`, `shiftWindow(start, ±1)`, `offscreenLit(lit, start)`, `offscreenNote`
- `src/core/spelling.ts` -- `octaveLabel(pitch)` (C3 = 48), the first label function
- `src/ui/session.ts` -- `pianoStart` plus `shiftPiano` action
- `src/ui/PianoKeyboard.tsx` -- SVG keyboard per `mockups/key-explore-piano.html` geometry (57 x 300 white, 36 x 185 black, viewBox 1199 x 330); props `start`, `lit`, `onNotePress?`, `onNoteRelease?`
- `src/ui/PianoStage.tsx` -- reads the session, renders the keyboard when Piano is active; lit is `workspace.pitches`
- `src/ui/App.tsx` -- Shell mounts the stage, feeds the offscreen note to `StatusNote`

## Tasks & Acceptance

**Execution:**
- [x] `src/core/piano.ts`, `spelling.ts`, `tests/core/piano.test.ts`, `spelling.test.ts` -- window model, labels, clamping, offscreen counts and text
- [x] `src/ui/session.ts`, `tests/ui/session.test.ts` -- `pianoStart`, clamped `shiftPiano`, rest untouched
- [x] `src/ui/PianoKeyboard.tsx`, `tests/ui/PianoKeyboard.test.tsx` -- key counts, labels, black wins, press/release, lit dots, one focus stop
- [x] `src/ui/PianoStage.tsx`, `App.tsx`, `useShortcuts.ts`, `useSessionActions.ts`, `shell.css`, `tests/ui/PianoStage.test.tsx`, `useShortcuts.test.tsx` -- shift keys, guitar hides it, status note, every matrix row

**Acceptance Criteria:**
- Given Piano is selected, then three octaves show with surface-colored white keys with keyline edge, black keys on top (dark theme key edge), and octave labels C3, C4, C5.
- Given keys overlap, when I click inside a black key's rectangle, then the black key receives the click.
- Given a parent renders the keyboard, then pointer down and up call `onNotePress(pitch)` and `onNoteRelease(pitch)` and the component holds no musical state or sound.
- Given lit notes passed as data, then each lit key shows a small solid ink dot and nothing else changes.
- Given `[` or `]`, then the window shifts one octave within MIDI 36 to 96 and modifiers other than AltGr suppress it.
- Given lit notes outside the window, then the Status note shows the offscreen text at the matching edge.
- Given Tab, then the keyboard is one focus stop with the standard focus ring.

## Implementation Notes

- `Shell` is exported and `SessionProvider` takes an optional `initial` session so tests can seed lit pitches.
- Shift-key tests live in `tests/ui/PianoStage.test.tsx`, not `useShortcuts.test.tsx`; the focus-order test in `ModeStrip.test.tsx` now includes the keyboard stop.
- `lit` is `readonly Pitch[]`; one lit note reads `1 note lit`, with its arrow.
- `[` and `]` shift only while Piano is active (added after review).
- A pointer press with a non-primary mouse button is ignored (added after review).

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Evidence / route |
|---|---|---|
| Release guard in `PianoKeyboard` not pinned by a test | low | Real gap. **patch**: test added |
| `[` `]` change the hidden window while Guitar is active | low | Real: keyboard reappears at another octave. **patch**: reducer guard, test |
| Right or middle button triggers a press | low | Real, one-line guard. **patch**: ignore `button !== 0`, test |
| No test that dots and offscreen note follow a shift | low | **patch**: test added |
| `event.code` BracketLeft/Right fires on other layouts (ú, ő, ü) | low | By design: the story AC names the key at BracketLeft/Right. Rejected |
| Audio-blocked note hides the offscreen note | low | Matrix row states the precedence. Rejected |
| Multi-touch overwrites `held`; unmount or window shift mid-press; lost capture | low | No consumer wires release yet; laptop pointer only. Rejected |
| `shiftWindow` or `layout` with a non-octave start | false | Start only comes from clamped octave steps. Rejected |
| Window clamp off by one | false | 36 to 60 starts give B at most 95 per spec; tests assert 36 and 60. Rejected |
| No keyboard or screen-reader access to keys; no on-screen shift control | low | Pointer-only notes and `[` `]` are the specified design. Rejected |
| Small targets on phones | false | Laptop browsers only. Rejected |
| Hard-coded geometry, 3px stroke, inline offscreen logic in `Shell`, no memo, brittle `C3C4C5` text, empty-handler test, spelling range tests | low | Cosmetic or test hardening; fixes are refactors. Rejected |
| Task row names `useShortcuts.test.tsx`, which is unchanged | low | Doc mismatch only; recorded in Implementation Notes. Rejected |

## Design Notes

White key `i` of the window is at x = 1 + 57 i; a black key sits on the boundary after its left white key, x = boundary - 18. The dot on a black key carries a surface-colored halo so ink reads on the dark key.

## Verification

**Commands:**
- `npm run check` -- expected: tsc clean, boundary check passes, all specs green
- `npm run build` -- expected: succeeds

**Manual checks:**
- In a browser: the piano shows below the Listen readout and in Explore, `[` and `]` change the octave labels, Guitar hides it, dark theme shows an edge on black keys, Tab lands on the keyboard once with a visible ring.
