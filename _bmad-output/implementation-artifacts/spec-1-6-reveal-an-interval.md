---
title: 'Story 1.6: Reveal an interval'
type: 'feature'
created: '2026-10-23'
status: 'done'
baseline_commit: '0d469f6201119e96c5af65ecfea1cd79af032e9a'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Listen plays an interval but never answers. There is no Reveal, no way to see which notes were played, no interval name, and no root marker on either instrument.

**Approach:** Add a primary Reveal button that becomes Next in the same button, with `Enter` as its key. Reveal shows the interval name, lights both notes on the active instrument (root marker plus no-role dot) and announces the name. Next draws and plays a new interval. Move the control row below the instrument, as designed. Pure `core/` pieces supply note spelling, the piano window that fits two notes, and the guitar position pair.

## Boundaries & Constraints

**Always:** All note names come from `core/spelling` (letter stepping from the spelled root, root table per the architecture, 6 semitones always A4). Lit notes in Listen are derived from the practice question and never written to the workspace; Explore keeps showing the workspace. `revealed` lives in the practice part and is reset by every new question. Reveal and Next are one button, so focus stays on it. Piano lights the real keys and shifts the window to include both; Guitar lights one position per note (the closest pair, ranked by fret plus string distance, then lowest frets). The root marker is a ringed, filled circle with the ink outline; the other note keeps the existing dot. The revealed readout shows the interval abbreviation (`P5`), and no note names appear on screen (decided by the user). A reveal shows no score, counter or praise, and its text goes to a polite live region. `Enter` yields to any focused control and to text fields.

**Never:** No interval buttons, guessing or wrong marks, no pool, direction or root settings, no Setup panel, no chord roles beyond root, no sound on keyboard or fretboard clicks, no story or epic references in comments.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Reveal | question waiting, `Enter` or click Reveal | readout shows the abbreviation (`P5`), both notes lit (root marker, dot), button reads Next, focus unchanged, live region announces | N/A |
| Next | revealed, `Enter` or click Next | new question drawn and played, readout `Which interval?`, notes unlit, button reads Reveal | N/A |
| No question yet | app open, `Enter` | nothing happens | Reveal is `aria-disabled` |
| Piano window | revealed notes outside the window | window shifts by octaves until both are shown | Never leaves MIDI 36 to 96 |
| Guitar pair | revealed on Guitar | root and upper each on one position, closest pair; e.g. A2 to E3 gives A string open and D string fret 2 | N/A |
| Swap while revealed | `I` or toggle | same notes re-render on the other instrument, same question | N/A |
| Explore and back | revealed | revealed state and question kept, nothing replays; Explore shows the workspace, not the question | N/A |
| Spelling | all 12 intervals from all 12 roots | upper note's letter is root letter plus interval size minus one; pitch class round-trips; 6 is always A4 | N/A |
| `Enter` on a focused control | button, radio, text field | control's own behavior, no Reveal | N/A |
| Play again after reveal | `Space` | same pitches replay, stays revealed | N/A |

</frozen-after-approval>

## Code Map

- Extend: `src/ui/ListenView.tsx` (readout and controls split), `PianoStage.tsx`, `GuitarStage.tsx`, `PianoKeyboard.tsx` (optional `root?: Pitch`), `Fretboard.tsx` (optional `root?: FretPosition`), `session.ts` (`reveal`, window fit), `useSessionActions.ts`, `useShortcuts.ts` (`Enter`), `App.tsx`, `shell.css`, `StatusNote`-style live region for the announcement.
- Reuse: `core/model.ts` (`Practice.revealed`), `core/theory.ts` (`INTERVALS`), `core/instruments.ts` (`positionsForPitch`), `core/piano.ts` (`shiftWindow`, window bounds), `session.setQuestion` (already clears `revealed`).
- `src/core/spelling.ts` -- `spellInterval(root, interval)`: root table (C, C♯, D, E♭, E, F, F♯, G, A♭, A, B♭, B), upper note by letter stepping; built and tested in `core/`, not yet shown in the UI
- `src/core/piano.ts` -- `fitWindow(start, pitches)`: nearest octave start containing all pitches
- `src/core/instruments.ts` -- `closestPair(root, upper, tuning?, frets?)`: one `FretPosition` per note
- `src/ui/useLitNotes.ts` -- one hook: Listen and revealed gives question pitches with root, otherwise workspace; instruments read it
- `src/ui/ListenControls.tsx` -- Reveal/Next primary button with `Enter` key hint, next to Play again, below the stage
- `tests/ui/ListenView.test.tsx`, `session.test.ts`, `PianoKeyboard.test.tsx`, `Fretboard.test.tsx`, new core tests

## Tasks & Acceptance

**Execution:**
- [x] `src/core/spelling.ts`, `piano.ts`, `instruments.ts` and their tests -- table-driven spelling for all 12 intervals and 12 roots, window fit, closest pair
- [x] `src/ui/session.ts`, `useSessionActions.ts`, `tests/ui/session.test.ts` -- `reveal`, window fit on reveal and on swap to piano, Next
- [x] `src/ui/PianoKeyboard.tsx`, `Fretboard.tsx`, their tests -- root marker with tint on piano, optional `root`
- [x] `src/ui/useLitNotes.ts`, `PianoStage.tsx`, `GuitarStage.tsx`, `ListenView.tsx`, `App.tsx`, `useShortcuts.ts`, `shell.css`, tests -- readout, button, layout, live region, every matrix row

**Acceptance Criteria:**
- Given a waiting question, when I press `Enter` or click Reveal, then the readout names the interval, both notes light with root marker and dot, Reveal becomes Next and focus stays on the button.
- Given a reveal, then every note label comes from `core/spelling` and a test covers all 12 intervals.
- Given Piano, then the real keys light and the window shifts to include them; given Guitar, one position per note.
- Given a revealed question, when I press `Enter` or click Next, then a new interval plays and the notes unlight.
- Given a reveal, then no score or praise shows and the reveal text is in a polite live region.
- Given a revealed question, when I swap instruments, then the notes re-render without a new question.

## Implementation Notes

- `spellInterval` is built and tested in `core/` but nothing in the UI calls it, per the user's decision that no note names appear on screen.
- The reveal also announces the full interval name ("perfect fifth") in a visually hidden polite live region, while the readout shows `P5`.
- The root marker is a filled root-color ring with the ink outline behind the dot; the piano key itself is not tinted.
- The window is refit on reveal, on swap and on mode change while revealed (added behavior beyond the Reveal action).
- The control row now sits below the instrument in the shell, outside the Listen section; it is centered after review.

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Evidence / route |
|---|---|---|
| Play again and Reveal sit at the left edge instead of centered | medium | Seen in a 1280 x 800 screenshot; the design centers the row. **patch**: center `.controls` |
| Spelling tests re-declare the implementation's tables; wrong entries would pass | medium | Real: spelling is the point of the module. **patch**: hard-coded expectations |
| Window refit on `setMode` and `setInstrument` unpinned | low | Only `reveal` and `toggleInstrument` are tested. **patch**: reducer tests |
| `closestPair` ranking barely pinned | low | Core invariant tested, ranking not. **patch**: two tie-break cases |
| `spellInterval` unused by the UI | low | By the user's decision (no note names on screen). Rejected |
| `spellInterval` or `SIZES` fall through on impossible input | low | Inputs come only from the 12-entry table. Rejected |
| `fitWindow` leaves notes off-window when no window fits | low | Questions are drawn from 40 to 86, which always fits. Rejected |
| Window refit overwrites a manual `[` `]` position on swap or mode change | low | Showing the revealed notes is the intent; manual shifts on piano stay respected. Rejected |
| Guitar null-pair fallback lights every position with no root | low | Unreachable: questions sit inside the guitar range. Rejected |
| Double accidentals (E♯, F𝄪) and missing glyphs | low | Decided in Design Notes; names are not shown. Rejected |
| Root ring and open-string ring overlap | low | Concentric, ring inside ring. Rejected |
| Upper note found by position; `closestPair` unmemoised | low | `pitches` is always `[root, upper]`. Rejected |
| Controls outside the Listen landmark; focus order after the instrument | low | Matches the designed reading order. Rejected |
| `aria-disabled` Reveal, no hover style, opacity contrast | low | Disabled state only before the first question. Rejected |
| `preventDefault` on Enter in Explore; Enter on focused keyboard reveals | low | Enter has no other Explore action yet; the keyboard is not a control. Rejected |
| Next can redraw the same interval | low | Readout still resets and the interval replays. Rejected |
| Live region unmounted outside Listen | low | Announcements happen while Listen is mounted. Rejected |
| Missing unit tests for `ListenControls`, `useLitNotes`, repeat reveal | low | Covered through `ListenView` and reducer tests. Rejected |

## Design Notes

Root spelling follows the architecture's default table; where it lists both D♭ and C♯ (and G♭ and F♯) the table keeps C♯ and F♯. Letter stepping can give double accidentals (C♯ plus A4 is F𝄪); that is correct spelling and not guarded. The control row sits below the stage: readout, instrument, then controls, with the status note last.

## Verification

**Commands:**
- `npm run check` -- expected: tsc clean, boundary check passes, all specs green
- `npm run build` -- expected: succeeds

**Manual checks:**
- Press Space, then Enter: the name shows and two notes light on piano and guitar; Enter again plays a new interval; the Reveal button stays focused; controls sit under the instrument at 1280x800 without scrolling.
