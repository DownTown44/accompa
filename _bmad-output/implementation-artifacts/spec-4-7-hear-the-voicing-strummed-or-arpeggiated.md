---
title: 'Story 4.7: Hear the voicing strummed or arpeggiated'
type: 'feature'
created: '2026-10-26'
status: 'done'
baseline_commit: 'd8521c8cfcf6f5d7a2977b5a312bd3d9c70d8357'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Play and Block sound the lit pitches, which on the guitar are not the fretted voicing (it doubles notes across strings and may be hand-edited), so Apor cannot check a shape against his own guitar.

**Approach:** The engine gets a strum mode, and with a guitar voicing shown Play and Block sound exactly its fretted pitches: Play one at a time, Block strummed. Everything else sounds as today.

## Boundaries & Constraints

**Always:** Engine: `PlayMode` gains `'strum'` behind the same `play(pitches, mode)`; the list is sounded in the order given, each note `STRUM_SPREAD` after the last (an engine constant, 40 ms, beside `ARPEGGIO_STEP`); no timestamps or spread from callers. `block` and `arpeggio` are unchanged. A new `play` or `stop` replaces a sounding strum by the existing rule (`stopSounding`, generation bump), so a second press restarts it.

Explore on the guitar with a voicing shown (generated or edited): the pitches are the voicing's sounding pitches from its frets (a core helper `voicingPitches(frets)` in `core/voicings.ts`, reused by `useLitNotes`), one per sounding string, bass to treble, doubled pitches kept, muted strings silent. `Space` or Play sounds them with `arpeggio`; `Enter` or Block with `strum`. The edited frets are the base once edited. `useSessionActions` reads the shown frets from `LitNotes.voicingFrets`.

Without a voicing (piano, single note, interval, no voicing fits) Play and Block sound the lit pitches, low to high, as today, Block as `block`. Listen, `pressNote` and a fret press unchanged. The blocked-audio Status note and its wake rule are unchanged: a strum while blocked is the gesture that wakes, as for any play. Key hints stay `Space` and `Enter`; the labels stay `Play` and `Block`.

**Never:** No change to the generator, ranking, shapes, naming, the stepper or the edit rule; no spread setting or UI; no timestamps from callers; no `Math.random`; no new button, label or layout row; no touch, phone or narrow-viewport handling; `src/audio` imports core types only.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Strum | guitar, C major `x 3 2 0 1 0`, `Enter` or Block | `play` with 4 or 5 sounding pitches bass to treble, `strum` | N/A |
| One at a time | same, `Space` or Play | same list, `arpeggio` | N/A |
| Doubled notes | voicing with a pitch class on two strings | both strings sound, in pitch order | N/A |
| Muted string | `x` strings | no pitch for them | N/A |
| Edited | edit one string, play | the edited pitches, not the old ones | N/A |
| Lit differs | voicing shown | the played list equals the voicing, not `workspace.pitches` | N/A |
| Piano | any lit notes | `Space` arpeggio, `Enter` block, lit pitches low to high | N/A |
| No voicing | single note, interval, none fits | as today, block for Enter | nothing lit plays nothing |
| Second press | strum sounding, press again | previous notes stop, the new strum starts | N/A |
| Engine | `play(list, 'strum')` | note i starts `i x 40 ms` after the first; peak gain scaled as for block | N/A |
| Blocked audio | context suspended | `Press any key to wake the sound.` as today | N/A |
| Listen | any | Listen plays and reveals as before | N/A |
| Instrument does not move | play, strum, both instruments and themes | instrument top and Status note keep their place; no page scroll at 1280 x 800 | N/A |

</frozen-after-approval>

## Code Map

- `src/audio/engine.ts` -- `PlayMode` adds `'strum'`; update the `play` comment.
- `src/audio/synth.ts` -- `schedule` offset: arpeggio `index * ARPEGGIO_STEP`, strum `index * STRUM_SPREAD`, block 0; add `STRUM_SPREAD = 0.04`; `engines.ts` unchanged.
- `src/core/voicings.ts` -- `voicingPitches(frets, tuning = STANDARD_GUITAR_TUNING)` pure, sorted ascending; `moveFret` and `pitchAt` already here.
- `src/ui/session/useLitNotes.ts` -- `editedOf` uses `voicingPitches`; `LitNotes.voicingFrets` is already the shown frets (generated or edited).
- `src/ui/session/useSessionActions.ts` -- `playLit(mode)` takes the voicing frets (from `useLitNotes`): with frets, play `voicingPitches` with `arpeggio` for Play and `strum` for Block, else today's sorted lit pitches; `revealOrNext` and `play` pass it.
- `src/ui/explore/ExploreControls.tsx` -- unchanged unless the hook needs wiring; `disabled` rule unchanged.
- Tests: `tests/audio/synth.test.ts` strum offsets, restart; `tests/core/voicings.test.ts` `voicingPitches`; `tests/ui/explore/ExploreControls.test.tsx` and `ExploreEdit.test.tsx` with the fake engine from `tests/ui/support/`.

## Tasks & Acceptance

**Execution:**
- [ ] `engine.ts`, `synth.ts` -- `strum` mode and `STRUM_SPREAD`, tests
- [ ] `voicings.ts`, `useLitNotes.ts` -- `voicingPitches`, reuse in `editedOf`, tests
- [ ] `useSessionActions.ts` -- voicing-aware Play and Block
- [ ] UI tests per matrix row
- [ ] Headless Chrome 1280 x 800 -- play and strum on guitar, piano, Listen, both themes; compare instrument top and Status note

**Acceptance Criteria:**
- Given a shown or edited guitar voicing, when I press `Enter`, then its fretted pitches strum bass to treble with a 40 ms spread, and `Space` sounds them one at a time.

## Review Triage Log

| # | Layer | Finding | Verdict | Route | Evidence |
|---|-------|---------|---------|-------|----------|
| 1 | blind, edge, gap | A whitespace edit on the untouched `fret0` line in `voicings.ts` | low | patch | Fixed: the original spacing is restored and the line no longer shows in the diff. |
| 2 | blind | The strum tests do not check the last note's release; the peak-gain test compares one ramp per gain node | low | patch | Fixed: the last of six notes starts and stops 0.2 s after the first with the same duration, and every ramp on every node matches the block. |
| 3 | blind, edge, gap | `useSessionActions` calls `useLitNotes`, so the voicing ranking runs in every caller | low | rejected | Planned in this story's Code Map; the browser check showed no delay. Noted for the end-of-epic review as a follow-up (a shared provider). |
| 4 | edge | A voicing with every string muted plays nothing and wakes no audio | false | rejected | Unreachable: an edit leaving fewer than two notes drops the voicing (Story 4.6), and Play is disabled with no lit notes. |
| 5 | blind | Block silently becomes a strum with a voicing shown; no label says so | low | rejected | Planned decision: the buttons stay `Play` and `Block`. |
| 6 | blind | `voicingPitches` orders by pitch, not string order; no future-mode exhaustive check; `STRUM_SPREAD` rationale | low | rejected | The engine takes a pitch list bass to treble (AD-8); the constant is documented in the spec. |
| 7 | edge, blind | Claims about tests per matrix row; fallback and Listen not covered | false | rejected | `ExploreControls.test.tsx` and `ExploreView.test.tsx` assert the piano, no-voicing and Listen plays; `ExploreEdit.test.tsx` covers the guitar rows. |

## Verification

**Commands:**
- `npm run check` -- expected: tsc, boundaries and tests pass
- `npm run build` -- expected: success

**Manual checks (if no CLI):**
- Built app at 1280 x 800: instrument top and Status note stay put on piano, guitar and Listen; no page scroll.
