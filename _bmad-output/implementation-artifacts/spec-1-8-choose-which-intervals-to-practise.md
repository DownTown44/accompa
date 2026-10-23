---
title: 'Story 1.8: Choose which intervals to practise'
type: 'feature'
created: '2026-10-24'
status: 'done'
baseline_commit: 'a219b6b1d0facea274cc8bd59aa37cf570bf1e11'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The pool is fixed to all 12 intervals. There is no Setup panel or opener, and nothing persists.

**Approach:** Add a Setup opener (gear) to the strip and a non-modal Setup panel with 12 pool chips (m2 to P8). Toggling a chip changes the pool from the next question and persists it to `localStorage`. Direction, root, sound and theme controls belong to later stories.

## Boundaries & Constraints

**Always:** Chip labels come from `INTERVALS` (`abbreviation`). The opener is a button named `Setup` with `aria-expanded` and `aria-controls`, in the first `strip-slot` position, shown in both modes and instruments. The panel is 560px wide, `surface` fill, absolutely positioned under the strip at the right, and does not shift the layout. `P` and the opener toggle it; `Esc` closes it. Focus enters the first chip on open and returns to the opener on close, also when closed with `P` or `Esc`. A pointer click on the opener keeps focus. `P` ignores repeat, modifiers and text fields. Chips are buttons with `aria-pressed`. A selected chip has accent fill, `on-fill` text and weight 600, and no check glyph. The panel has a visible Setup label tied to the chip group. The last selected chip does not untick: it carries `aria-disabled`, stays focusable, has a dashed outline as non-colour cue, and a polite live region in the panel says `Keep at least one interval.`; that note clears when the pool changes or the panel closes. A pool change keeps `question`, `revealed` and `wrongMarks`. The current question's interval stays guessable even if no longer in the pool; other out-of-pool buttons show disabled. The pool is saved on every change under one key, as a JSON array of semitones. On load, a missing, unparsable, empty or non-interval value falls back to all 12; a storage error never throws.

**Never:** No Direction, Root, Sound or Theme controls, no Help hint, no sound or theme persistence, no `Math.random` in `core/`, no note names, no story or epic references in comments.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Open | press `P` or click gear | panel shows, `aria-expanded=true`, focus on first chip | N/A |
| Close | `Esc`, `P` or gear while open | panel hidden, focus on opener | N/A |
| Untick | chip `m2` selected, others too | pool drops `m2` from the next question; the `m2` answer button disabled | N/A |
| Untick current answer | question P5, untick `P5` | question stays, `P5` button still guessable until the next question | N/A |
| Last chip | only `P8` selected, activate it | no change, `Keep at least one interval.` announced | `aria-disabled` swallows it |
| Reload | pool saved as `[7, 12]` | restored, other buttons disabled | N/A |
| Bad storage | `"x"`, `[]`, `[99]` or a throwing `localStorage` | all 12 selected | no error shown |
| Yield | focus in panel, press digit | native behavior, no guess | N/A |

</frozen-after-approval>

## Code Map

- `src/core/model.ts`, `src/core/theory.ts` -- `Practice.pool` and `INTERVALS`; reuse, do not change.
- `src/ui/session/session.ts` -- add `setupOpen` to `Session` (default false) and actions `toggleSetup`, `closeSetup`, `togglePool(interval)`. `togglePool` keeps pool order by `INTERVALS`, refuses to empty it, never touches the question. Loosen the `guess` reducer guard so `question.interval` passes the pool check.
- `src/ui/session/useSessionActions.ts` -- same guard in `guess`; expose `toggleSetup`, `closeSetup`, `togglePool`.
- `src/ui/session/poolStorage.ts` -- new: `loadPool()` and `savePool(pool)`, validated, try/catch around every storage call.
- `src/ui/app/App.tsx` -- initial session from `loadPool()`; effect in `Shell` saves `session.practice.pool`.
- `src/ui/shortcuts/useShortcuts.ts` -- `P` toggles setup (does not yield to focused controls); `Esc` closes it.
- `src/ui/shell/ModeStrip.tsx`, `shell.css` -- replace the first `strip-slot` with the opener; `strip-slot` sizing from `--spacing-help-size`.
- `src/ui/setup/SetupPanel.tsx`, `setup.css` -- new panel, chips, label, live note; mount in `App.tsx` `Shell`. Tokens exist in `theme.css` (`--color-surface`, `--color-chip`, `--color-accent`, `--color-on-fill`, `--type-segment-*`, `--type-legend-*`, `--rounded-full`, `--rounded-interval`).
- `src/ui/listen/IntervalButtons.tsx` -- enabled when in pool or the current answer.
- `tests/ui/setup/SetupPanel.test.tsx`, `tests/ui/session/poolStorage.test.ts`, `session.test.ts`, `IntervalButtons.test.tsx`. Clear `localStorage` after each test that toggles.

## Tasks & Acceptance

**Execution:**
- [ ] `src/ui/session/poolStorage.ts`, test -- load and save with validation and fallbacks -- persistence rows
- [ ] `src/ui/session/session.ts`, `useSessionActions.ts`, `session.test.ts` -- `setupOpen`, `togglePool`, guess guard -- pool rows
- [ ] `src/ui/setup/SetupPanel.tsx`, `setup.css`, `ModeStrip.tsx`, `shell.css`, `App.tsx` -- opener, panel, chips, focus handling, save effect
- [ ] `src/ui/shortcuts/useShortcuts.ts`, `IntervalButtons.tsx`, tests -- `P` and `Esc`, answer-button rule, every matrix row

**Acceptance Criteria:**
- Given the panel is open, then it shows a Setup label and 12 chips, selected ones with accent fill and weight 600, no check glyph.
- Given a chip is toggled, then the next question is drawn only from the pool and the current one stays answerable.
- Given the page reloads, then the saved pool is restored.
- Given the open panel at 1280 x 800, then nothing scrolls and the panel overlays without moving the layout.

## Implementation Notes

- The panel open state is `Session.setupOpen`; the reducer's `guess` guard already passes `question.interval` through, so only the hook and the buttons changed.
- The opener is a `Setup` button inside the first `strip-slot`; `P` and `Esc` are not gated by `isControl`, so they work while a chip has focus.
- Pool storage key is `accompa.pool`, a JSON array of semitones, written by an effect in `Shell`.
- The last-chip cue is a dashed outline plus a dashed underline, because the focus ring replaces the outline.

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Evidence / route |
|---|---|---|
| Right answer that left the pool is never guessed in a test | medium | Reverting the `guess` guard kept every test green. **patch**: click-and-key test added; fails when the guard is reverted |
| Nothing shows the pool drives question draws | medium | Ignoring the pool in `startQuestion` kept tests green. **patch**: test with pool `[12]` |
| Pointer-click focus test passes trivially | low | **patch**: asserts `aria-expanded` on each click |
| Repeat press on the last chip is not re-announced | low | Same text in the live region; same call as story 1.7. Rejected |
| `Esc` dispatches `closeSetup` when closed | false | Reducer returns the same state; nothing happens |
| Focus moves to the opener on close even if focus was elsewhere | false | Specified: focus returns to the opener on any close |
| Mount effect rewrites invalid or default storage | low | Harmless normalisation; fix adds a branch. Rejected |
| Other tabs overwrite the pool | low | Single-user local app, no sync required. Rejected |
| Chips lack full interval names | low | Same labels as the answer buttons. Rejected |
| Panel in Explore does nothing; no reset or select-all; no focus containment; opens focus by mouse | low | Specified (non-modal, focus enters on open, both modes); extras are outside the intent. Rejected |
| Reducer guard not loosened | false | Already passes `question.interval`; the change would be dead code |
| Note clears only on chip click or close | false | The pool only changes through the chips |
| Duplicated pool rule, hard-coded gear glyph in a test, missing minor reducer tests | low | Refactors and cosmetics. Rejected |

## Design Notes

Panel state lives in the session reducer so `P` and the opener share one path. Only the pool leaves the page; panel state does not persist.

## Verification

**Commands:**
- `npm run check` -- expected: tsc clean, boundary check passes, all specs green
- `npm run build` -- expected: succeeds

**Manual checks:**
- Open and close with `P`, `Esc` and the gear in both modes and both instruments, light and dark; focus ring visible on chips; panel fits at 1280 x 800.
