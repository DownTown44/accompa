---
title: 'Story 1.5: Guitar fretboard and instrument swap'
type: 'feature'
created: '2026-10-23'
status: 'done'
baseline_commit: 'a6fe1b0eeb543335e9ac672a9cb69926ca714378'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Choosing Guitar shows an empty instrument area. There is no fretboard, no core mapping from a pitch to string and fret positions, and no check that a swap keeps the session.

**Approach:** Add a presentational 6-string, 22-fret `Fretboard` driven by lit positions and press/release callbacks, a pure tuning-parameterised pitch-to-position mapping in `core/instruments`, and a `GuitarStage` that mounts when Guitar is active. The existing Piano | Guitar toggle and `I` key do the swap; prove the session survives it and fade the incoming instrument in.

## Boundaries & Constraints

**Always:** Tuning and fret count are parameters of the `core/` functions (defaults `STANDARD_GUITAR_TUNING`, `GUITAR_FRETS`); the view takes tuning as a prop and holds no constant. The component owns no musical state or sound; its render is a pure function of `lit`. String index 0 is the low E and is drawn at the bottom. One focus stop with the standard focus ring; fret cells are not focusable. A lit position shows the no-role dot; a lit open string shows it in a ring at the nut. Colors come from existing tokens only. The swap changes `instrument` only: workspace, practice and `pianoStart` are untouched. Under `prefers-reduced-motion` the swap is instant.

**Never:** No sound or lighting on click in the app (handlers are optional props the app does not wire), no role shapes or tints, no muted marker, voicing stepper, fret-region bar or readout, no Explore actions. No tuning UI. No story or epic references in comments.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Default render | Guitar, standard tuning | 6 strings named E A D G B e (low to high), fret wires 1 to 22, numbers 1 to 22 below, thick nut | N/A |
| Pitch to positions | pitch 64 | every `{string, fret}` within 22 frets: e.g. open high e, B 5, G 9, D 14, A 19, E 24 excluded | Outside 40 to 86: empty list |
| Other tuning | tuning passed in | positions follow it; no `core/` constant is read | N/A |
| Lit fret | position `{string 2, fret 5}` | dot centred between wires 4 and 5 on that string | Out-of-range position: drawn nothing |
| Lit open string | fret 0 | dot in a ring at the nut | N/A |
| Press then release | pointer down, up or cancel on a cell | `onNotePress({string, fret, pitch})` then `onNoteRelease(...)` once | Missing handlers: nothing |
| Swap and back | `I` or segment click | session identical except `instrument`; question, lit notes, `pianoStart` survive | N/A |
| Reduced motion | media query on | no fade | N/A |

</frozen-after-approval>

## Code Map

- Verified on main after 1.4 merged: `PianoStage.tsx` (reads session, renders only when Piano is active; the pattern to copy), `PianoKeyboard.tsx` (SVG, `lit`, optional press/release, one focus stop), session `pianoStart` and `shiftPiano`, `core/piano.ts`, `core/spelling.ts` (`octaveLabel`; 1.5 adds string names there), `App.tsx` (`Shell` exported, `SessionProvider` takes an optional `initial` session for tests; Shell mount and the Status note slot).
- Verified at HEAD: `src/core/instruments.ts` -- `STANDARD_GUITAR_TUNING` (40 45 50 55 59 64), `GUITAR_FRETS` 22, `INSTRUMENT_RANGES`, `COMMON_RANGE`; extend with `pitchAt(tuning, string, fret)` and `positionsForPitch(pitch, tuning?, frets?)`. Keep ranges derived from the same constants.
- `src/ui/session.ts` -- `toggleInstrument` and `setInstrument` already exist and only touch `instrument`; `useShortcuts.ts` already maps `I`; `ModeStrip.tsx` already has the Guitar segment. Do not change them; test them.
- `src/core/model.ts` -- `Workspace.pitches` is the lit source; positions are derived, not stored.
- New `src/core/spelling.ts` function -- `stringNames(tuning)`: pitch-class letters, a string whose class repeats a lower string is lowercased (E A D G B e).
- New `src/ui/Fretboard.tsx` -- SVG per `mockups/key-explore-guitar.html`: surface slab, 2px keyline wires, 7px ink nut, ink strings at 70% with graded widths 1.0 to 3.25, names left, numbers below; props `tuning`, `frets`, `lit: {string, fret}[]`, `onNotePress?`, `onNoteRelease?`.
- New `src/ui/GuitarStage.tsx` -- renders `Fretboard` when Guitar is active; lit = every position of each `workspace.pitches` entry.
- `src/ui/App.tsx`, `shell.css` -- mount `GuitarStage` beside `PianoStage`; fade-in rule gated by `prefers-reduced-motion`. Do not edit the 1.4 piano rules.

## Tasks & Acceptance

**Execution:**
- [x] `src/core/instruments.ts`, `spelling.ts`, `tests/core/instruments.test.ts`, `spelling.test.ts` -- mapping, tuning parameter, string names, every pitch 40 to 86 returns at least one position and each round-trips through `pitchAt`
- [x] `src/ui/Fretboard.tsx`, `tests/ui/Fretboard.test.tsx` -- counts, names, numbers, lit dots, open ring, press/release payload, one focus stop, custom tuning prop
- [x] `src/ui/GuitarStage.tsx`, `App.tsx`, `shell.css`, `tests/ui/GuitarStage.test.tsx` -- shows only on Guitar, piano hides, fade class and reduced-motion rule
- [x] `tests/ui/session.test.ts`, `ModeStrip.test.tsx` -- swap and swap-back leave everything but `instrument` equal; click and `I` both swap

**Acceptance Criteria:**
- Given Guitar is selected, then six strings (E A D G B e), 22 frets, names left, numbers below, wires and a thick nut render.
- Given lit positions, then each shows the dot and open strings show it in a ring at the nut.
- Given pointer down and up on a cell, then the callbacks receive string, fret and pitch, and the component holds no state or sound.
- Given a pitch, then `core/instruments` returns every position within 22 frets, for any tuning passed.
- Given a click on Guitar or Piano or `I`, then the incoming instrument fades in (instantly under reduced motion) and the question and lit notes survive swap and swap-back.

## Implementation Notes

- `PianoStage` also carries `stage-fade`, so the piano fades in when swapping back.
- A press with a non-primary mouse button is ignored on the fretboard, as on the piano.
- `GuitarStage` dedupes workspace pitches before mapping them to positions (added after review).
- The fretboard is 1200 x 372 in viewBox units and scales with the stage; its fit at 1280 x 800 is unchecked in a browser.
- `stringNames` uses sharps and lowercases a repeated pitch class; no tuning UI exists yet.

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Evidence / route |
|---|---|---|
| Fretboard non-primary-button guard untested | low | Real gap, the piano has the test. **patch**: test added |
| Repeated workspace pitches give duplicate keys and stacked dots | low | Real once Explore can light notes. **patch**: dedupe in `GuitarStage`, test |
| No test that the piano fades in on swap back | low | AC covers both directions. **patch**: test added |
| Workspace pitches outside the guitar range (below E2, above D#6) vanish with no hint | medium | Real once Explore lights piano notes beyond 40 to 86; no pitch reaches the workspace yet and the spec leaves it open. **defer** |
| Multi-touch, lost capture and unmount leave `held` stale | low | No consumer wires release yet; laptop pointer only. Rejected |
| `frets` of 0, tunings over six strings, bad `pitchAt` or `positionsForPitch` arguments | low | No caller passes them; guards add branches. Rejected |
| Fretboard assumes 22 frets default and six-string geometry; `held` ref is state | low | Frets default is a prop default; `held` is pointer bookkeeping, not musical state. Rejected |
| Pointer-only access, no inlays, small phone targets, hit cells slightly above the board | low | Specified design, laptop only, cosmetic. Rejected |
| Sharps-only string names, no flat tunings | low | No tuning UI in v1. Rejected |
| CSS-source regex test is brittle; magic numbers in tests | low | Test hardening. Rejected |
| No test for held note mid-swap or workspace changes while on Guitar | low | Neither can happen yet. Rejected |

## Design Notes

Frets are equally spaced (as in the mock): wire `f` at x = nut + f * width / 22; a lit fret sits at the midpoint of wires `f - 1` and `f`; the open ring sits left of the nut. Only the incoming instrument is mounted, as for the piano in 1.4, so the fade is an opacity keyframe on mount rather than a two-sided crossfade; this keeps focus and tests simple.

## Verification

**Commands:**
- `npm run check` -- expected: tsc clean, boundary check passes, all specs green
- `npm run build` -- expected: succeeds

**Manual checks:**
- In a browser: click Guitar and press `I` back and forth, a fretboard fades in and the piano octave window is as left; dark theme wires and nut stay visible; Tab lands on the fretboard once with a ring.
