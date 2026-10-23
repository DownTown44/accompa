---
title: 'Story 1.7: Guess an interval'
type: 'feature'
created: '2026-10-23'
status: 'done'
baseline_commit: 'ea75af4971f3daa5aa0693d1b285a1fcde6bd6e6'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Listen can only be answered by Reveal. There is no way to test the ear by guessing, no wrong mark, and no digit shortcuts.

**Approach:** Add a row of 12 interval buttons (m2 to P8, keys `1`-`9`, `0`, `-`, `=`) below the control row. A right guess names the interval and plays the next one; a wrong guess marks that button and keeps the question. Guessing is optional; no score or streak anywhere.

## Boundaries & Constraints

**Always:** Labels come from `INTERVALS` (`abbreviation`), keys by index. Guess state lives in the practice part (`wrongMarks`, already in the model; reset by every new question). Feedback text is derived from the interval abbreviation and shown in one visible polite live region under the readout; Reveal and Next clear it, except that a right guess sets it as the next question starts. Wording is exact: `P5. Next interval is playing.` and `m3 is not it — try another.`, no praise. A right guess plays the next question inside the same gesture. Wrong button: `wrong` fill, inset 2px muted ring, struck-through label, `aria-disabled` and still focusable, accessible name `m3, tried`; the key hint is ink on it. Buttons are `aria-disabled` before the first question and while revealed. A button whose interval is outside `practice.pool` is disabled at opacity 0.55 or more. Key hints are `aria-hidden`; each button carries `aria-keyshortcuts`. Digit keys match on `event.key` (so `=` works with Shift), ignore repeat and Ctrl/Alt/Meta (AltGr excepted), and yield to any focused button, tab, radio or text field. After a pointer click on any Listen button, focus is released so digit shortcuts keep working; keyboard activation keeps focus.

**Never:** No pool editing UI or persistence, no score, count, streak or praise, no sound on a wrong guess, no new settings, no note names, no story or epic references in comments.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Right guess | question P5, click `P5` or press `7` | hint `P5. Next interval is playing.`, new question drawn and played, marks cleared, readout `Which interval?` | N/A |
| Wrong guess | question P5, press `3` | `m3` marked and disabled, hint `m3 is not it — try another.`, question and notes unchanged, nothing plays | N/A |
| Tried again | click a marked button | no change, no hint | `aria-disabled` swallows it |
| Several wrong | `m3` then `M6` | both marked until the next question | N/A |
| Reveal after wrong | marks present, `Enter` | revealed; buttons disabled; hint cleared | N/A |
| Before first question | app open, press `7` | nothing happens | buttons `aria-disabled` |
| Out of pool | pool without `m2` | `m2` disabled, opacity 0.55 or more, key does nothing | N/A |
| Explore and back | marks present | marks and question kept, nothing replays | N/A |
| Yield | focus on button, radio, tab or text field, press digit | native behavior, no guess | N/A |
| Modifier | `Ctrl+0` | browser zoom, no guess | N/A |

</frozen-after-approval>

## Code Map

- `src/core/model.ts` -- `Practice.wrongMarks` and `pool` exist already; `src/core/theory.ts` -- `INTERVALS` supplies labels, names, keys order. Reuse, do not change.
- `src/ui/session/session.ts` -- reducer; `setQuestion` already clears `wrongMarks`; `reveal` and `fitRevealed` are from 1.6, re-verify after merge. Add a `guess` action (append to `wrongMarks` for a wrong answer) and a feedback field cleared by `reveal`.
- `src/ui/session/useSessionActions.ts` -- `startQuestion`, `next`, `revealOrNext` are from 1.6, re-verify after merge. Add `guess(interval)`: guard Listen, question present, not revealed, in pool, not already marked; right answer calls `engine.play(startQuestion().pitches, 'arpeggio')` and records the right-guess hint; wrong dispatches.
- `src/ui/shortcuts/useShortcuts.ts` -- single keydown handler; `isControl`, `hasModifier`, `Enter` branch are from 1.6, re-verify after merge. Add digit branch using `isControl` and the existing text-field guard.
- `src/ui/listen/ListenView.tsx` -- from 1.6: readout plus visually-hidden reveal live region. Add the visible hint line (polite) here; keep the reveal region.
- `src/ui/listen/ListenControls.tsx` -- from 1.6: Play again and Reveal/Next. Add pointer-click focus release; do not alter its behavior.
- `src/ui/listen/IntervalButtons.tsx` -- new: the 12-button row.
- `src/ui/app/App.tsx` -- mount the row after `ListenControls`, before `StatusNote`.
- `src/ui/listen/listen.css` -- from 1.6 `.controls`; add `.interval-row`, `.interval-button`, `.wrong` state. Tokens exist in `theme.css` (`--color-interval-tint`, `--color-wrong`, `--rounded-interval`, `--spacing-interval-gap`, `--spacing-interval-padding`, `--type-interval-label-*`, key-hint-small).
- `tests/ui/listen/ListenView.test.tsx`, `session.test.ts`, `useShortcuts.test.tsx`, new `IntervalButtons.test.tsx` (render under `SessionProvider initial=` to set a pool; the fake engine is in `tests/ui/support/fakeEngine.ts`).

## Tasks & Acceptance

**Execution:**
- [x] `src/ui/session/session.ts`, `tests/ui/session/session.test.ts` -- `guess` action, hint state, reset rules -- wrong marks and hint lifecycle
- [x] `src/ui/session/useSessionActions.ts` -- `guess` with guards and same-gesture play on right answer
- [x] `src/ui/listen/IntervalButtons.tsx`, `listen.css`, `App.tsx` -- row, states, names, key hints, layout below the controls
- [x] `src/ui/listen/ListenView.tsx`, `ListenControls.tsx` -- hint live region, pointer focus release
- [x] `src/ui/shortcuts/useShortcuts.ts`, tests -- digit keys with yield rules; tests for every matrix row

**Acceptance Criteria:**
- Given Listen with a question, then 12 buttons m2 to P8 show with hints `1`-`9`, `0`, `-`, `=`.
- Given a wrong guess, then the button has fill, ring, strike and `aria-disabled`, is still focusable and named `m3, tried`.
- Given a guess result, then the polite region announces it and no score or streak shows.
- Given a mouse click on an interval button, when I then press a digit, then it guesses.

## Implementation Notes

- `Session.feedback` holds the last guess (`right` or `wrong` plus the interval); wording is derived in `ListenView`. A right guess dispatches `rightGuess` after `setQuestion` (which clears the hint) in the same gesture.
- Digit keys match on `event.key`. Shift with `=` or `-` gives `+` or `_`, so Shift is not accepted, contrary to the wording in the spec; the click path and the unshifted key both work.
- The wrong ring is an `outline` (inset 2px, muted) shown when the button is not focus-visible, because a test forbids `box-shadow`.
- The pointer focus release is a shared helper in `src/ui/listen/focus.ts`, used by the interval buttons and both Listen controls.
- Shortcut and hint tests live in `IntervalButtons.test.tsx`; `useShortcuts.test.tsx` and `ListenView.test.tsx` are unchanged.

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Evidence / route |
|---|---|---|
| Interval row clipped at 1280 x 800: hints and status note off screen, instruments do not shrink | high | Seen in a headless Chrome screenshot. **patch**: scale instruments to the stage height, trim padding, re-screenshot |
| No test that interval keys do nothing in Explore | medium | Mode guard in `guess` is unpinned. **patch**: test |
| Odd indentation in the Play again handler | low | Direct cleanup. **patch** |
| Shift with `=` or `-` and non-US layouts do not match | low | `event.key` is `+` or `_`; the unshifted keys and clicks work, and matching `event.code` would misfire on other layouts. Rejected, recorded above |
| Consecutive identical right-guess hints are not re-announced | low | Same text in the live region; one in twelve questions. Rejected |
| Right guess reads a stale closure on a double press; non-atomic setQuestion then rightGuess | low | React re-renders between key events; order is relied on and commented. Rejected |
| Empty pool, missing feedback interval, `rightGuess` outside Listen | low | Unreachable: pool is never empty and the reducer is internal. Rejected |
| Disabled buttons stay in tab order; digits dead while a button is focused | low | Specified (still focusable, digits yield to focused buttons). Rejected |
| Click on a tried button drops focus; `detail` decides pointer versus keyboard | low | Same pattern as the mode strip, pointer clicks only. Rejected |
| Tried label after reveal; contrast of 0.55 opacity unmeasured; narrow screens | low | Cosmetic or out of scope (laptop only). Rejected |
| Duplicated guards, `INTERVAL_KEYS` slice, brittle `textContent` tests | low | Cleanups; fixes are refactors. Rejected |

## Design Notes

The interval row sits at the bottom of the body, as designed. The hint reuses the readout's quiet italic style. Check it fits 1280x800 without scrolling in both instruments.

## Verification

**Commands:**
- `npm run check` -- expected: tsc clean, boundary check passes, all specs green
- `npm run build` -- expected: succeeds

**Manual checks:**
- Guess wrong then right with mouse and keys on piano and guitar; the row fits at 1280x800 in light and dark; the wrong button reads clearly without color.
