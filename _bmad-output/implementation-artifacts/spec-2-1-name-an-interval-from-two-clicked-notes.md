---
title: 'Story 2.1: Name an interval from two clicked notes'
type: 'feature'
created: '2026-10-24'
status: 'done'
baseline_commit: 'e11e67478d64a5417e6e33042ffd1b2003f68733'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-2-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Explore does nothing yet: the app opens in Listen, clicking a note in Explore does not sound or light it, and no interval is named.

**Approach:** Make Explore the default mode. A click sounds the note at once and toggles it lit on release; at most two stay lit, and the readout names the note or the interval between the two. Lit notes live in the workspace and carry over when the instrument is swapped.

## Boundaries & Constraints

**Always:** Pointer-down sounds one pitch via `engine.play([pitch], 'block')`; release toggles lit (`onNotePress` and `onNoteRelease` from the instruments). Explore keeps the workspace only; Listen still reads practice state and its behaviour is unchanged. The lit set is ordered oldest first, and a third note unlights the oldest, with the cap kept in one place in `core/` so Epic 3 can lift it. The lower lit note carries the root marker and the upper the no-role dot; one lit note carries the root marker. The single-note readout is the name only, such as `E♭`, with no octave. The pair's name is the lower note first: 6 semitones is A4, 12 is the octave, wider intervals show their simple interval (a multiple of 12 shows the octave), all in `core/` and tested. Guitar lights the exact string and fret clicked; several lit positions may share a string. Clicking a lit pitch at another position moves that note there and sounds it, so a pitch is lit at most once. Swapping instrument keeps the same pitches lit: a piano pitch with no remembered guitar position lights its lowest-fret position (the closest pair for two). The readout is an 84px interval abbreviation with the full name visually hidden, and a polite live region announces it debounced 300 to 500 ms. With nothing lit the readout shows `Select notes to build a chord` and no role legend. The app opens in Explore with Piano selected; `M` still switches. The workspace is not persisted.

**Never:** No Play or Block buttons, Space or Enter behaviour, `Esc` clear or Undo (Story 2.2). No chord naming, role legend or chord readings. No change to Listen state, questions or reveal. No `Math.random` in `core/`. No story or epic references in comments.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Open | app loads | Explore selected, prompt shown, nothing lit | N/A |
| One note | click C4 | sounds C4; on release lit with root marker; readout shows its name | N/A |
| Two notes | C4 then G4 | readout `P5`; C4 root marker, G4 no-role dot; click order does not matter | N/A |
| Tritone | C4 and F♯4 | `A4` | N/A |
| Wide | C4 and E5 / C4 and C6 | `M3` / `P8` | N/A |
| Third note | C4, G4 lit; click E4 | C4 unlights; E4 and G4 lit, readout `m3` | N/A |
| Unlight | click a lit note | sounds, then unlights | N/A |
| Move | E4 lit at string 5 fret 0; click string 4 fret 5 | sounds; E4 lit only at string 4 fret 5 | N/A |
| Guitar | click string 2 fret 5 | exactly that position lit | N/A |
| Swap | notes lit on piano, switch to guitar and back | same pitches lit on each | N/A |
| Hover then click | pointer moves over keys, then presses one | only the pressed note sounds and toggles | N/A |
| Listen | switch to Listen | question starts as before; Explore notes untouched | N/A |

</frozen-after-approval>

## Code Map

- `src/core/model.ts` -- `Workspace` holds `pitches`; add the remembered guitar positions as plain data. `src/core/theory.ts` -- `INTERVALS`; reuse for names. `src/core/spelling.ts` -- note names; add the pair-naming and simple-interval rule beside `spellInterval` or in a new `core/explore.ts`.
- `src/core/instruments.ts` -- `positionsForPitch`, `closestPair` for the swap rule. `src/core/piano.ts` -- `fitWindow`, `offscreenLit` for lit notes outside the window.
- `src/ui/session/session.ts` -- `initialSession.mode` becomes `explore`; add a workspace action that toggles a note (with position) and applies the cap; `fitRevealed` only covers Listen, so lit Explore notes need the piano window to show them after a swap.
- `src/ui/session/useSessionActions.ts` -- `pressNote` today does Fixed-root work in Listen only; make it mode-aware for the sound and add a release handler for the toggle. Keep one click-to-sound path.
- `src/ui/session/useLitNotes.ts` -- today returns revealed question, Fixed root, else `workspace.pitches`; give it the root and the guitar positions for Explore.
- `src/ui/instruments/piano/PianoStage.tsx`, `guitar/GuitarStage.tsx` -- wire `onNoteRelease`; `GuitarStage` lights every position of a pitch and pairs by `closestPair`, which must not apply to Explore's exact positions.
- `src/ui/listen/ListenView.tsx` -- renders only in Listen; add `src/ui/explore/ExploreView.tsx` and `explore.css` for the readout, reusing `--type-readout-size` in `src/ui/theme/theme.css`, and mount it in `src/ui/app/App.tsx`. `src/ui/shell/StatusNote.tsx` shows the polite-region pattern.
- Tests: `tests/core/` (naming rule), `tests/ui/session/session.test.ts`, `tests/ui/app/App.test.tsx` (default mode), `tests/ui/instruments/*Stage.test.tsx`, a new `tests/ui/explore/ExploreView.test.tsx`; `tests/ui/support/fakeEngine.ts` records plays. Existing tests that assume Listen on open need `M`.

## Tasks & Acceptance

**Execution:**
- [x] `src/core/*` -- pair name, simple interval, two-note cap, single-note name; unit tests for the matrix rows
- [x] `src/core/model.ts`, `src/ui/session/session.ts` -- workspace toggle with position, default mode Explore, tests for the cap and the practice/workspace split
- [x] `src/ui/session/useSessionActions.ts`, `useLitNotes.ts`, both Stages -- press sounds, release toggles, exact guitar positions, swap rule, piano window fit
- [x] `src/ui/explore/ExploreView.tsx`, `explore.css`, `src/ui/app/App.tsx` -- readout, prompt, debounced live region
- [ ] existing tests -- update for the new default mode

**Acceptance Criteria:**
- Given the app opens, then Explore is selected and the prompt shows with no legend.
- Given a note is pressed in Explore, then it sounds on pointer-down and toggles on release.
- Given two notes are lit, then the readout names the interval, lower first, and markers follow the root and no-role rules.
- Given a third note is clicked, then the oldest unlights.
- Given notes are lit, when the instrument is swapped, then the same pitches are lit.
- Given the interval changes, then the live region announces it after the debounce.

## Verification

**Commands:**
- `npm run check` -- expected: pass
- `npm run build` -- expected: success

**Manual checks (if no CLI):**
- Headless Chrome at 1280 x 800: Explore opens with the prompt; click two keys and two frets; readout and markers match; swap instrument both ways.

## Review Triage Log

| Finding | Layer | Verdict | Evidence / route |
|---|---|---|---|
| Guitar root ring in Explore never asserted | verification-gap | medium, patch | Added a two-note guitar test asserting `data-root` follows the lower position. |
| Click on a derived (unremembered) guitar position unpinned | verification-gap | medium, patch | Added a reducer test: shown position unlights, another position moves. |
| `litPositions` mixed remembered/unknown pair falls to lowest fret | all three | low, patch (test only) | Matches the spec rule (closest pair only when both are unknown); pinned with a core test. |
| Move does not refresh the note's age | blind | low, rejected | Spec is silent; rarely met and the fix adds ordering rules. |
| No keyboard way to light notes; drag-off release | blind, edge | false | Note toggling is pointer-only in v1; `held` in both instruments ignores a release on another note. |
| `fitWindow(start, [])` refits when nothing is lit | blind | false | An empty list fits the current start at distance 0, so the window does not move. |
| `GuitarStage` computes unused `upper`/`pair`/`all` in Explore; nested ternaries | blind | low, rejected | Cosmetic; fix is a restructure. |
| Compound intervals fold to the simple interval | blind | false | Required by the story and the spec. |
| Readout and live region repeat the name; stale or identical announcements | blind, edge | low, rejected | The visible text is `aria-hidden`; re-announcement edge cases are negligible. |
| `.visually-hidden` lives in `listen.css`; hard-coded padding | blind | low, rejected | `listen.css` is always bundled; cosmetic. |
| Default mode change: tests moved to `listenSession`, Listen-only Setup options show in Explore | blind | false | Intended by the story; Setup panel behaviour is unchanged and not in scope. |
| `toggleNote` has no mode guard in the reducer | edge | low, rejected | `releaseNote` guards it; no other dispatcher exists. |
| Reducer logic sits in `session.ts` rather than `core/` | blind | low, rejected | Design preference with no named harm. |
| Wide-span notes or notes beyond E6 are not visible after a swap | edge, blind | medium, defer | Same gap as the existing deferred item, now reachable from the piano (87 to 96); needs a decision on what to show. |
| `toggleNote` does not refit the window | edge | false | Clicks land on visible keys; the Status note covers shifts. |
| Rapid presses overlap sounds | edge | false | Same engine path as Listen's Fixed-root press. |
| Alias pitch cannot toggle off by another position | edge | false | The spec makes it a move. |
| Removed repeated-pitch/key-warning test | blind, gap | low, rejected | A repeated pitch can no longer be lit. |
