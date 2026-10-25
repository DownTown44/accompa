---
title: 'Story 3.6: Choose the root by clicking a note'
type: 'feature'
created: '2026-10-25'
status: 'done'
baseline_commit: '5ea068c7681050f5aed162994f6a3a35f1e03d02'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Explore root is always the reading's root, so Apor cannot ask what the same notes sound like built from another lit note, including a note no chord is rooted on.

**Approach:** `R` arms a one-shot gesture; the next click on a lit note makes it the root. The chosen root lives in `Workspace` and wins over the reading choice; a note that roots no reading makes the set read as unknown.

## Boundaries & Constraints

**Always:** `Workspace.root?: Pitch` (one exact pitch), written only by a new `chooseRoot` action, not persisted. `exploreReading(lit, chosen?, root?)` stays the one reading. With a root set, the reading is the one `nameChord` gives for that pitch class (at most one exists per root); none means unknown: note names, root marker on that pitch only, no-role dots elsewhere, legend with the root only. `chooseRoot` also stores that reading as `Workspace.reading` (removed when none), so unlighting the root falls back to it. Choosing an alternative reading (3.3) clears `root`. `toggleNote` removes `root` when that pitch is unlit; a guitar position move keeps it. Root and reading otherwise persist as notes change; if the root's pitch class stops rooting a reading the set turns unknown with the root kept. Esc and Undo carry the whole workspace.
`rootArmed` lives in `Session`, not `Workspace`, and is never undone. `R` toggles it, only in Explore with a lit note; ignored while a button, radio or tab has focus and with Ctrl, Alt or Meta. Esc disarms first (after the shortcuts list and Setup, before clearing notes); a second `R`, a mode switch, or lighting no notes disarms. While armed, pointer-down still sounds the note; on release a lit note becomes the root, stays lit and disarms; the clicked note is not unlit and a guitar click does not move its position. Status note `Click a lit note to set the root.` ranks after audio blocked and before the others. `R`, `Set root`, joins the `HelpHint.tsx` list. Decisions: while a chosen root leaves the set unknown, the alternatives row lists every `nameChord` reading as buttons (the large slot shows note names), and clicking one clears the root and shows it; the row is reserved, so nothing moves. While armed, a click on an unlit note lights it as usual and stays armed. The instrument does not move.

**Never:** No change to `nameChord`, qualities, spelling, playback or Listen. No keyboard note building, no persistence, no `Math.random` or `ui/` import in `core/`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Root a reading | C4 E4 G4 C5, `R`, click E4 | E4 root; no `Em` reading, set unknown: note names, ringed E, dots elsewhere, legend `root E` | N/A |
| Pictured: root has a reading | dim7 C4 E♭4 G♭4 A4, `R`, click G♭4 | `G♭dim7`-style reading of G♭ (as choosing it in 3.3), root marker on G♭4, legend and spelling follow | N/A |
| Unknown set readings | root G on C4 E4 G4 B4 | note names large; the namer's readings (`Cmaj7`) as buttons; clicking one clears the root | N/A |
| Armed, unlit click | `R`, click an unlit note | note lights and sounds, still armed, Status note stays | N/A |
| Aug set | C4 E4 A♭4, `R`, click E4 | the E reading; alternatives list the others | N/A |
| Root rooting nothing | C4 E4 G4 B4, `R`, click G4 | unknown set, ringed G4, dots, legend `root G` | N/A |
| Notes added | root E4 above, add D5 | root stays E4; reading re-derived for E | N/A |
| Root unlit | unlight the root note | root cleared; stored reading shows if still named, else first | N/A |
| Choose alternative | root set, click an alternative | root cleared, that reading shows | N/A |
| Armed | `R` | Status note shows; second `R`, Esc, mode switch disarm | N/A |
| Armed, nothing lit | `R` | nothing armed | N/A |
| Focused button | `R` on a focused button | ignored | N/A |
| Undo, Esc | Esc then Undo | notes, reading and root restored; armed not restored | N/A |
| Listen | `R` | ignored | N/A |
| Instrument does not move | armed, unarmed, root set, unknown, 0 to 4 notes, both instruments, both themes | instrument top and the Status note area keep their place; readout block height equal | N/A |

</frozen-after-approval>

## Code Map

- `src/core/model.ts` -- `Workspace`, `ReadingChoice`; add `root?`.
- `src/core/explore.ts` -- `exploreReading`, `orderedReadings`, `readingChoice`; add root precedence. Reuse `nameChord`, `spellNotes`.
- `src/ui/session/session.ts` -- `Session`, `pruneReading`, `toggleNote`, `chooseReading`, `dismiss`, `setMode`; add `rootArmed`, `chooseRoot`, `armRoot`.
- `src/ui/session/useLitNotes.ts`, `useSessionActions.ts` -- pass root; `releaseNote` branches on armed; `pressNote` unchanged.
- `src/ui/shortcuts/useShortcuts.ts` -- `R` with the `isControl` check. `src/ui/help/HelpHint.tsx` -- list entry.
- `src/ui/app/App.tsx` -- Status note priority. `ExploreView.tsx` -- alternatives from all readings when the root makes the set unknown (`exploreReading` returns them then).
- Tests: `tests/core/explore.test.ts`, `tests/ui/session/*` (reference checks), `tests/ui/explore`, `tests/ui/app/ModeSeparation.test.tsx`; helpers `press`, `click`, `lit`, `rooted`. Do not change `RoleMarker`, `PianoKeyboard`, `Fretboard`.

## Tasks & Acceptance

**Execution:**
- [x] `core/model.ts`, `core/explore.ts` -- root precedence, unknown case -- one source
- [x] `ui/session/*`, `useShortcuts.ts`, `HelpHint.tsx`, `App.tsx` -- state, action, key, note
- [x] Tests per Code Map -- every matrix row, reducer reference checks
- [x] Headless Chrome 1280 x 800 -- picture dim7 and aug before, armed, after, and unknown, both instruments, light and dark; compare instrument top and Status area

**Acceptance Criteria:**
- Given a lit note, when I press `R` then click it, then it is the root, stays lit, and the readout, markers and legend follow.
- Given a root that roots no reading, when chosen, then the set reads as unknown with that note ringed.
- Given a chosen root, when notes are added, then it stays until unlit or changed.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Review Triage Log

| # | Layer | Finding | Verdict | Route | Evidence |
|---|-------|---------|---------|-------|----------|
| 1 | blind | Formatting-only hunks bury the logic changes | low | patch | Fixed: the four source files were restored from the baseline and only the logic edits reapplied; `session.ts` diff fell from 104 to 44 lines. |
| 2 | gap | Re-clicking the current root while armed is untested | medium | patch | Fixed: reducer test arms a rooted state, re-chooses the same pitch, asserts `rootArmed` false and the same `workspace` reference. |
| 3 | edge, blind | A chosen root with one or two lit notes is untested | low | patch | Fixed: core test pins the readout (`C`, `P5`) and the root, roles and legend following the chosen note. |
| 4 | blind | `rooted()` assertion too weak; guitar armed click untested | low | patch | Fixed: exact `['60']` assertion and a guitar case that keeps the shown position and roots the clicked pitch. |
| 5 | blind | Arming is keyboard-only; no `aria-pressed` | false | rejected | The frozen block and UX docs specify `R` then click; the Status note shows the armed state. |
| 6 | blind | Root stored beside the reading and can drift | false | rejected | The frozen block decides that a chosen root also stores its reading; `exploreReading` gives a lit root precedence and the tests pin it. |
| 7 | blind | A leftover root can turn a chord into an unknown set | false | rejected | Apor's decision: a root that roots no reading makes the set read as unknown, and it persists until its note is unlit. |
| 8 | blind | Root-to-reading lookup duplicated; `nameChord` imported into the session layer | low | rejected | The reducer needs the reading for storage; no divergence shown. |
| 9 | blind | Armed prompt precedence and wording | false | rejected | The armed prompt is Explore-only and the Fixed-root prompt is Listen-only; they cannot show together. |
| 10 | edge | `R` arms behind the Setup or Help panel | low | rejected | The Status note shows the armed state and Esc closes the panel first by spec; the fix adds a guard branch. |
| 11 | edge | Guitar click at another fret keeps the old position | false | rejected | The spec says a guitar click does not move the shown position. |
| 12 | edge | Two readings with the same root pitch class | false | rejected | `nameChord` gives at most one reading per root pitch class. |
| 13 | edge | Armed state survives an instrument swap or an alternative-reading click | low | rejected | A deliberate gesture sequence; the spec lists the disarm paths (second `R`, `Esc`, mode switch, no notes). |
| 14 | edge | `press()` helper signature | false | rejected | `press(init, target)` accepts a key string or an event init, so the Ctrl and focused-button tests are real. |
