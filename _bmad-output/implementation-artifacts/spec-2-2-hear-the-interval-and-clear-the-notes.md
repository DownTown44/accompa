---
title: 'Story 2.2: Hear the interval and clear the notes'
type: 'feature'
created: '2026-10-24'
status: 'done'
baseline_commit: '9ed7fc03375e28378d25a8177a04f5cc2b7d6cec'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-2-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Explore names the lit notes but cannot replay them, and there is no way to clear them or take a clear back.

**Approach:** Add a control row to Explore with Play (`Space`, arpeggio, low to high) and Block (`Enter`, primary), and let `Esc` clear the lit notes with an undoable Status note.

## Boundaries & Constraints

**Always:** Play sounds the lit pitches sorted low to high as `arpeggio`; Block sounds them as `block`; one lit note plays alone through either; nothing lit plays nothing and raises no error. The two buttons use the existing `action-button` look with a key-hint cap, Block carries `action-primary`, and they stay `aria-disabled` while nothing is lit. `Space` and `Enter` yield to a focused control, as they already do. A pointer click on either button releases focus to the instrument like the Listen buttons. `Esc` closes the shortcuts list first, then the Setup panel; only with neither open, in Explore, with notes lit, does it clear the workspace (pitches and guitar positions) and keep what it cleared. The Status note then reads `Notes cleared.` with an `Undo` button after it; Undo restores the notes and positions without sounding them. The note stays until the next note change (any lit-note toggle), and it also goes once Undo has run. It shows only in Explore, and the audio-blocked message wins while it applies. `Ctrl+Z` is not a gesture. The `Undo` button comes after the control row and before the Setup opener in Tab order. The shortcuts list rows are updated to name the Explore meanings of `Enter` and `Esc`. The row fits 1280 x 800 and the instrument does not move when the note appears or goes.

**Never:** No `A` key or separate Arpeggio button, no chord naming, no role legend. No change to Listen behaviour, the practice state, or the two-note cap. No keyboard note building. No `Math.random` in `core/`. No story or epic references in comments.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Play pair | C4, G4 lit (lit in either order); `Space` or Play | engine gets `[C4, G4]` as `arpeggio` | N/A |
| Block pair | same; `Enter` or Block | engine gets `[C4, G4]` as `block` | N/A |
| One note | E4 lit; Space or Enter | engine gets `[E4]` | N/A |
| None lit | nothing lit; Space or Enter | nothing plays; buttons `aria-disabled` | N/A |
| Replay after change | Play, then click a third note, then Play | plays the current two notes | N/A |
| Clear | notes lit, nothing open; `Esc` | nothing lit, prompt shown, `Notes cleared.` with `Undo` | N/A |
| Undo | after clear; click `Undo` | same pitches and guitar positions lit, root marker as before, no sound, note gone | N/A |
| Note change | after clear; light a note | the note is gone and Undo no longer exists | N/A |
| Panel open | Setup or shortcuts open, notes lit; `Esc` | that closes, notes stay, no note shown; second `Esc` clears | N/A |
| Nothing lit | nothing lit; `Esc` | nothing happens | N/A |
| Listen | in Listen; `Esc` | workspace untouched, no clear note | N/A |
| Focused button | focus on Play or Block; `Space` or `Enter` | the button activates once, no second play | N/A |
| Swap | clear, switch instrument | note stays; Undo restores on the new instrument | N/A |
| Audio blocked | audio blocked and notes cleared | the wake message shows; the clear note returns when audio runs | N/A |
| Layout | note appears or goes | instrument top edge does not move | N/A |

</frozen-after-approval>

## Code Map

- `src/ui/listen/ListenControls.tsx`, `listen.css` -- the button markup and `action-button`, `action-primary`, `key-hint` classes to reuse; `focusInstrument` from `src/ui/listen/focus.ts`.
- `src/ui/explore/` -- add `ExploreControls.tsx`; mount it in `src/ui/app/App.tsx` beside `ListenControls` (DOM order sets the Tab order: instruments, row, Status note, Corner).
- `src/ui/session/session.ts` -- `Session` gets the cleared workspace (`null` when none); `dismiss` today closes help then Setup, so extend it for the Explore clear; add an `undoClear` action; `toggleNote` must drop the kept workspace. `src/core/model.ts` `Workspace` is plain data, so the kept copy is just a `Workspace`.
- `src/ui/session/useSessionActions.ts` -- `play` returns early outside Listen and `revealOrNext` is Listen-only; make both mode-aware (Explore: arpeggio and block of the sorted lit pitches) and expose `undoClear`.
- `src/ui/shortcuts/useShortcuts.ts` -- `Space` calls `play`, `Enter` calls `revealOrNext`, `Esc` calls `dismiss`; `isControl` already yields to focused buttons.
- `src/ui/shell/StatusNote.tsx` -- a polite region that takes a message; extend it so the message can carry the Undo button without hiding it from the live region. `src/ui/app/App.tsx` builds the message (audio-blocked first, then the Fixed-root prompt, then the clear note, then offscreen).
- `src/ui/help/HelpHint.tsx` -- `ROWS` meanings for `Enter` and `Esc`.
- `src/ui/shell/shell.css` -- `.status-note` has `min-height: 1.4em`; keep the instrument still when a button appears.
- Tests: `tests/ui/session/session.test.ts`, `tests/ui/explore/ExploreView.test.tsx` (or a new `ExploreControls.test.tsx`), `tests/ui/shortcuts/useShortcuts.test.tsx`, `tests/ui/help/HelpHint.test.tsx`; `tests/ui/support/fakeEngine.ts` records plays.

## Tasks & Acceptance

**Execution:**
- [x] `src/ui/session/session.ts` -- kept workspace, Explore clear in `dismiss`, `undoClear`, drop on note change; reducer tests for the matrix rows
- [x] `src/ui/session/useSessionActions.ts`, `src/ui/shortcuts/useShortcuts.ts` -- Explore Play and Block, `undoClear`
- [x] `src/ui/explore/ExploreControls.tsx`, `src/ui/app/App.tsx`, `listen.css` or `explore.css` -- control row, disabled state
- [x] `src/ui/shell/StatusNote.tsx`, `App.tsx`, `shell.css` -- clear note with Undo, message priority
- [x] `src/ui/help/HelpHint.tsx` -- row meanings, test update
- [ ] tests -- matrix rows, focus-yield, Tab order, then a headless Chrome check at 1280 x 800 that the instrument does not move

**Acceptance Criteria:**
- Given two notes are lit, when I press `Space` or click Play, then they arpeggiate low to high.
- Given two notes are lit, when I press `Enter` or click Block, then they play together and Block is the primary button.
- Given notes are lit with no panel open, when I press `Esc`, then they clear and `Notes cleared.` with Undo shows until the next note change.
- Given Undo is clicked, then the notes return silently.
- Given the Setup panel or shortcuts list is open, when I press `Esc`, then that closes first.
- Given a button is focused, when I press `Space` or `Enter`, then the button activates instead of the shortcut.

## Implementation Notes

## Verification

**Commands:**
- `npm run check` -- expected: pass
- `npm run build` -- expected: success

**Manual checks (if no CLI):**
- Headless Chrome at 1280 x 800: Explore piano and guitar with 0, 1 and 2 notes; Play, Block, `Esc`, Undo; measure the instrument top before and after the note appears.

## Review Triage Log

| Finding | Layer | Verdict | Evidence / route |
|---|---|---|---|
| Undo's piano-window refit unverified | verification-gap | medium, patch | Added a reducer test: clear, shift the window, undo, window shows the restored note. |
| Kept notes across a Listen round trip unpinned; stale Undo may reappear | edge, gap, blind | low, patch (test only) | The workspace is unchanged in between, so Undo is still correct; pinned with a reducer test. |
| Esc with the shortcuts list open untested | blind | low, patch (test only) | Added a reducer test. |
| Undo hidden while audio is blocked, though the clear happened | blind, edge | false | The matrix requires the wake message to win and the note to return when audio runs; tested. |
| Undo only by button, no keyboard shortcut | blind | false | The spec rules out Ctrl+Z; the button is the gesture. |
| Focus falls to body after Undo unmounts | blind, edge | low, rejected | Shortcuts listen on the document, so nothing breaks; the fix changes the StatusNote action contract. |
| `play`/`revealOrNext` naming and mode branching | blind | low, rejected | Listen's path is unchanged; a third mode does not exist. |
| Disabled buttons still focusable and move focus on click | blind, edge | false | Matches Listen's Reveal button. |
| Rapid triggering and `engine.play` failure | blind, edge | false | Same engine path as Listen; the engine owns timing and status. |
| Offscreen hint hidden while the clear note shows | edge | false | Nothing is lit while the clear note shows, so there is nothing offscreen. |
| `cleared` survives `shiftPiano` or other actions | edge | false | Only a note change replaces the workspace, and it drops `cleared`. |
| Help row wording crowded; no Undo row | blind | low, rejected | Cosmetic; Undo is a visible button. |
| Missing tests: Undo hidden under chooseRoot, StatusNote action without message, contrast of the Undo link | blind | low, rejected | chooseRoot is Listen-only; the others are negligible. |
