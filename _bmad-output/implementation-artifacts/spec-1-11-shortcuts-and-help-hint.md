---
title: 'Story 1.11: Shortcuts and help hint'
type: 'feature'
created: '2026-10-24'
status: 'done'
baseline_commit: 'dbfec6023937d5dc207ec293e0105baa3039fc32'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The shortcuts have no discoverable list, `Esc` only closes the Setup panel, a pointer click drops focus to the page instead of the instrument, and the Setup opener sits before the instrument in the Tab order.

**Approach:** Add the Help hint (`?` circle) that reveals a shortcuts list, make `?` and `Esc` work with it, return focus to the instrument after a pointer click outside the Setup panel, and put the opener and hint last in the Tab order.

## Boundaries & Constraints

**Always:** The Help hint is a 38px circle button in the second strip slot, named `Shortcuts`, with `aria-expanded` and `aria-controls`, an italic `?` in the muted colour on the chip fill, in both modes and instruments. The list opens when the pointer enters the hint or the list, or when the hint takes focus, and `?` toggles it; it closes when the pointer leaves both and focus is not on the hint, on `Esc`, or when `?` is pressed again. The list is a surface-fill popover under the hint, right-aligned to the strip, above the Setup panel, never moving the layout. It lists only keys that work now: `Space` play and replay, `Enter` reveal then next, `1`-`9`, `0`, `-`, `=` pick m2 to P8, `M` Listen or Explore, `I` Piano or Guitar, `P` Setup, `[` and `]` piano octave, `Esc` close panel or list, `?` this list, plus the line that `Space` and `Enter` on a focused button activate that button. Each row shows the key as a cap and a text meaning, both readable by assistive tech. `Esc` closes the list first, else the Setup panel. Opener and hint move after `<main>` in the DOM and are placed over the strip by CSS, so the Tab order is Mode tabs, Instrument toggle, Instrument, Listen controls, interval row, Setup opener, the panel when open, Help hint; the wordmark is no stop. After a pointer click on a mode or instrument radio, a Listen button or an interval button, focus moves to the active instrument once the click's state change has rendered; pointer clicks inside the Setup panel, on the opener and on the hint keep focus where they put it; keyboard activation never moves focus. Modifier, repeat and yield rules stay as they are (Ctrl, Alt or Meta ignore the key except AltGr; `Space` and `Enter` ignore repeat; digits yield to buttons, radios and tabs; `Space` and `Enter` yield to any focused button). `?` matches on `event.key`.

**Never:** No Explore keys in the list, no new shortcuts beyond `?`, no change to key behavior, no focus trap, no new dependency, no story or epic references in comments.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Hover | pointer on `?`, then onto the list | list opens and stays; closes when the pointer leaves both | N/A |
| Focus | Tab to the hint | list opens; Tab away closes it | N/A |
| Key | press `?` twice | opens, then closes | N/A |
| Esc order | list and panel both open, `Esc` | list closes, panel stays; second `Esc` closes the panel | N/A |
| Content | open the list | the rows above, no Explore-only keys, with the focused-button line | N/A |
| Pointer outside panel | click Play again, an interval button, a radio | focus lands on the active instrument; a digit then guesses | N/A |
| Instrument toggle | click Guitar | focus lands on the fretboard, not the removed keyboard | N/A |
| Inside panel | click a chip or panel radio | focus stays on it | N/A |
| Keyboard | press `Enter` on a focused interval button | guess happens, focus stays | N/A |
| Tab order | Tab through with the panel closed, then open | order as above, hint last | N/A |
| Held key | `Space` held, repeat events | one play | N/A |
| Modifier | `Ctrl+0`, `AltGr` plus a key | no shortcut; AltGr counts as none | N/A |

</frozen-after-approval>

## Code Map

- `src/ui/shell/ModeStrip.tsx`, `shell.css` -- remove the opener from the strip; keep both `strip-slot` spacers (`aria-hidden`).
- `src/ui/shell/Corner.tsx`, `corner.css` -- new: opener, `SetupPanel` mount and Help hint, rendered after `<main>` in `src/ui/app/App.tsx`, positioned absolutely over the strip's right edge (height `--spacing-strip-height`, right `--spacing-strip-padding-x`). `.page` is already `position: relative`. Reuse `SETUP_OPENER_ID` and `SETUP_PANEL_ID` from `src/ui/setup/SetupPanel.tsx`.
- `src/ui/help/HelpHint.tsx`, `help.css` -- new: hint button plus list from one data array of `{ keys, meaning }` rows; key caps reuse `.key-hint`.
- `src/ui/session/session.ts`, `useSessionActions.ts` -- add `helpOpen`, actions `openHelp`, `closeHelp`, `toggleHelp`; `Esc` closes help first, else the panel.
- `src/ui/shortcuts/useShortcuts.ts` -- `?` toggles help, `Esc` calls the combined close.
- `src/ui/listen/focus.ts` -- replace the blur with `focusInstrument` (`.piano` or `.fretboard`, after the render); use it in `ListenControls.tsx`, `IntervalButtons.tsx` and the mode and instrument groups in `src/ui/shell/SegmentedGroup.tsx`; the `setup` variant keeps focus.
- `tests/ui/shell/ModeStrip.test.tsx` (Tab order, slots), new `tests/ui/help/HelpHint.test.tsx`, `tests/ui/shortcuts` or `IntervalButtons.test.tsx` for focus and `Esc`; `tests/ui/setup/SetupPanel.test.tsx` blur workarounds may now need `focus` on the instrument instead.

## Tasks & Acceptance

**Execution:**
- [ ] `src/ui/session/session.ts`, `useSessionActions.ts`, tests -- help state and the combined `Esc`
- [ ] `src/ui/help/HelpHint.tsx`, `help.css`, `src/ui/shell/Corner.tsx`, `ModeStrip.tsx`, `App.tsx` -- hint, list, DOM order, placement
- [ ] `src/ui/shortcuts/useShortcuts.ts`, tests -- `?` and `Esc`
- [ ] `src/ui/listen/focus.ts`, `ListenControls.tsx`, `IntervalButtons.tsx`, `SegmentedGroup.tsx` -- focus to the instrument after a pointer click
- [ ] tests -- every matrix row, including the modifier, repeat and yield rows against the current keyboard behavior

**Acceptance Criteria:**
- Given the corner, then the `?` circle sits last in the Tab order and reveals the list on hover, focus or `?`.
- Given a pointer click outside the Setup panel, then shortcuts keep working because focus is on the instrument.
- Given a control with a shortcut, then it shows a key cap hidden from assistive tech and exposes `aria-keyshortcuts`.
- Given 1280 x 800, then nothing scrolls with the list open, in light and dark.

## Implementation Notes

- Help state is `Session.helpOpen`; `dismiss` closes the list first, else the Setup panel. `?` matches on `event.key`.
- `Corner` renders after `<main>` and holds the opener, the Setup panel and the Help hint; the strip keeps two `aria-hidden` spacers. The panel is anchored to the corner (`top: 100%; right: 0`), which lands where it was.
- `focusInstrument` focuses `.piano` or `.fretboard` from a zero-delay timer after a pointer click; the instrument element is always mounted in both modes.
- The hint has no click handler: hover and focus already open the list, and a click toggle closed it under the pointer.
- The list's key caps are readable by assistive tech; the caps on buttons stay `aria-hidden`, and Play again and Reveal gained `aria-keyshortcuts`.

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Evidence / route |
|---|---|---|
| Clicking the hovered hint closes the list under the pointer | medium | Hover then focus then click toggled it shut. **patch**: removed the click handler; test pins the list open |
| Click behavior of the hint was never asserted | medium | Folded into the patch above |
| `focusInstrument` finds nothing in some mode | false | Both modes always mount one instrument; Explore shows it too |
| It may pick the wrong instrument | false | Only the active instrument is mounted |
| Opener and hint clicks skip `focusInstrument` | false | The spec keeps focus on the opener, the hint and the panel |
| `hovering` and `focused` flags go stale after `Esc` | low | `mouseleave` and `blur` still reset them and every close is idempotent. Rejected |
| Help list and Setup panel overlap when both open | low | Specified: the list sits above the panel. Rejected |
| `?` on other layouts, narrow windows, no `role` on the list, rows duplicated by hand, `setTimeout` timing | low | Laptop only; `event.key` is layout-aware; refactors or cosmetics. Rejected |
| Strip slots and the absolute corner could drift apart | low | Measured in a real browser at 1280 x 800 in both themes. Rejected |
| CSS placement not covered by a test | low | Covered by the browser check, as in earlier stories. Rejected |

## Design Notes

The list's key caps stay readable to assistive tech, unlike the caps on buttons, because the list is the only place those keys are named; the buttons already expose `aria-keyshortcuts`.

## Verification

**Commands:**
- `npm run check` -- expected: tsc clean, boundary check passes, all specs green
- `npm run build` -- expected: succeeds

**Manual checks:**
- Hover, Tab to and press `?` on the hint; check the list over the Setup panel in light and dark at 1280 x 800; click a button, then press a digit and see a guess; Tab order ends on the hint.
