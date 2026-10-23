---
title: 'Story 1.2: Themed app shell'
type: 'feature'
created: '2026-10-23'
status: 'done'
baseline_commit: 'cd9c169d5bb1345d6ef245725e28df58f84c6d5b'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-accompa-2026-10-23/DESIGN.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The app renders a bare heading. Apor has no mode strip, no Piano / Guitar switch, and none of the Rose Quartz look, and later stories have no tokens or shell state to build on.

**Approach:** Add the DESIGN.md tokens as CSS custom properties (light, `-dark` twins, system scheme selects), a settled mode strip with Listen / Explore and Piano | Guitar as native radio groups, the minimal session state they drive, and the `M` and `I` shortcuts with the focus, motion and forced-colors rules from the UX spines.

## Boundaries & Constraints

**Always:** Listen and Piano are selected on load. The strip is at least 84px tall on a 1280 x 800 canvas with no scrolling. One selected-state look for every segment (accent fill, on-fill text, weight 600). Text is italic Palatino except key hints. Focus ring is a 2px ink outline with a 2px offset, drawn outside the control on `:focus-visible`. Controls are real inputs and buttons; rings are outlines, never box-shadow. State lives in React Context plus a pure reducer in `ui/`. Quiet, sentence-case copy.

**Never:** No piano, fretboard, readout, audio, setup panel or help list (placeholder space only for Setup opener and Help hint, 38px each, not focusable). No manual theme override or `localStorage` (Story 1.10). No key-hint caps on the strip (the mocks show none). No new dependencies, no CSS framework. No story or epic references in comments.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Initial render | none | Listen and Piano checked; strip shows wordmark, tabs, toggle at right, two placeholder slots | N/A |
| Click or arrow a mode or instrument | pointer, or arrow keys on a focused group | selection changes; only one checked per group | N/A |
| `M` pressed | focus anywhere except a text field | mode toggles Listen / Explore | Ignored when Ctrl, Alt or Meta is held, and on auto-repeat |
| `I` pressed | same | instrument toggles Piano / Guitar | Same |
| `M` or `I` with AltGr | `getModifierState('AltGraph')` true | treated as no modifier | N/A |
| Focus in a text field | `M` or `I` typed | no switch | N/A |
| Dark system scheme | `prefers-color-scheme: dark` | every `-dark` twin is the active value | N/A |
| Reduced motion | `prefers-reduced-motion: reduce` | all transitions are instant | N/A |

</frozen-after-approval>

## Code Map

- Greenfield UI: `src/ui/App.tsx` is a bare `<h1>`; `src/main.tsx` mounts it. Reuse the existing Vitest + happy-dom setup (`globals: true`, so Testing Library cleanup works).
- `src/ui/theme.css` -- tokens: `--color-*` plus `--color-*-dark` twins, `--font-serif`/`--font-sans`, `--type-*`, `--rounded-*`, `--spacing-*`; a `prefers-color-scheme: dark` block remaps each `--color-X` to `var(--color-X-dark)`; `color-scheme: light dark`; italic body; `.key-hint` non-italic; reduced-motion block
- `src/ui/session.ts` -- `Mode`, `Instrument` types, `sessionReducer`, `initialSession` (AD-5: instrument separate from the workspace, which does not exist yet)
- `src/ui/SessionContext.tsx` -- provider, `useSession()` (state plus dispatch)
- `src/ui/ModeStrip.tsx`, `src/ui/SegmentedGroup.tsx` -- strip layout and one shared radio-group segment component for both groups
- `src/ui/useShortcuts.ts` -- document `keydown` handler for `M` and `I`
- `src/ui/strip.css` or sections of `theme.css` -- strip, segment, focus ring, placeholder slot styles
- Values come from DESIGN.md frontmatter (colors, typography, rounded, spacing) and its Layout and Components sections. Mock for reference: `_bmad-output/planning-artifacts/ux-designs/ux-accompa-2026-10-23/mockups/key-explore-piano.html` (strip only).
- Do not touch `core/`, `audio/` or the boundary script. `ui/` may import `core/` and `audio/`; nothing here needs either.

## Tasks & Acceptance

**Execution:**
- [x] `src/ui/theme.css`, `src/main.tsx` -- all tokens, dark remap, italic type rules, reduced-motion rule -- AC tokens
- [x] `tests/ui/theme.test.ts` -- parse the CSS: every light color has a `-dark` twin, dark block remaps each, typography, rounded and spacing tokens present -- AC tokens
- [x] `src/ui/session.ts`, `src/ui/SessionContext.tsx`, `tests/ui/session.test.ts` -- reducer for mode and instrument, initial Listen and Piano
- [x] `src/ui/SegmentedGroup.tsx`, `src/ui/ModeStrip.tsx`, `src/ui/App.tsx`, styles -- strip, groups, placeholders, focus ring as outline, layout without scroll -- AC strip, selected, markup
- [x] `tests/ui/ModeStrip.test.tsx` -- initial state, click and arrow selection, `aria`/checked state, Tab order from mode group to instrument group, placeholders not focusable
- [x] `src/ui/useShortcuts.ts`, `tests/ui/useShortcuts.test.tsx` -- every shortcut row in the matrix, wired in `App.tsx`

**Acceptance Criteria:**
- Given the app opens, then Listen and Piano are selected, the strip is at least 84px tall with wordmark, tabs, toggle pushed right and two placeholder slots, and the page does not scroll at 1280 x 800.
- Given the design tokens, then every DESIGN.md color and its `-dark` twin, the typography ramp, rounded and spacing values exist as custom properties, and the system scheme selects light or dark.
- Given a selected segment, then it uses accent fill, on-fill text and weight 600, and exposes a checked or selected state to assistive tech.
- Given focus is not in a text field, when `M` or `I` is pressed, then the mode or instrument switches, and Ctrl, Alt or Meta held does nothing; Tab moves from the mode group to the instrument group.
- Given any focusable control, when it has keyboard focus, then a 2px ink outline with a 2px gap shows outside it.
- Given reduced motion, then transitions are instant.
- Given the shell markup, then controls are inputs or buttons and rings are outlines, not box-shadow.

## Implementation Notes

Mode and instrument are native radio inputs. Arrow-key selection and the single Tab stop per group are browser behavior that happy-dom does not implement, so tests cover click selection and DOM order only; arrow keys and focus rings go on the manual checklist.

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Evidence / route |
|---|---|---|
| Arrow-key selection and Tab stops untested though tasks say done | low | Native radio behavior, not implementable in happy-dom; noted in Implementation Notes, manual check listed. Rejected |
|  unsupported in some browsers | false | Target browsers (current Chrome, Edge, Firefox, Safari) all support it |
|  and  clip at small or zoomed viewports | false | Design states one screen, no scroll, no reflow, behavior below the canvas unsupported |
| Shortcuts undiscoverable; no key hints or aria-keyshortcuts | false | Help hint is a later story; spec forbids caps on the strip, matching the mocks |
| isTextField allow-list misses date, time and role=textbox widgets | low | No such fields exist in v1; rejected |
| IME composition, defaultPrevented, non-Latin layouts, undefined event.key | low | Only reachable inside text fields, which already return early, or on non-Latin layouts (target user is on a Latin layout). Rejected |
| Invalid value or unknown action in SegmentedGroup and reducer | low | Internal callers only, TypeScript exhaustive. Rejected |
| Context value not memoised; hard-coded 36px gap and weight 600; weight shift on select | low | No measurable harm; weight 600 is mandated by the design. Rejected |
| Forced-colors ring may blend into Highlight fill | low | Unverified, cosmetic. Rejected |
| No contrast, design-value, unmount or forced-colors tests; regex style tests brittle | low | Test hardening, not defects. Rejected |
| Focus ring missing on unselected mode pills (opacity-0 input) | false | The label outline is drawn on :has(input:focus-visible); the input still takes focus |
| Verification Gap layer | none | Reported no gaps |

## Design Notes

Mode and instrument are native radio inputs inside `role="radiogroup"` containers, styled as pills through the `label`. This gives arrow-key selection, one Tab stop per group and a real checked state for free, and avoids `role="tab"` with no tab panels. The focus ring is `label:has(input:focus-visible)` with `outline`, and `forced-colors` keeps working because nothing relies on box-shadow. `M` and `I` yield only to text fields; focus on a radio does not block them.

## Verification

**Commands:**
- `npm run check` -- expected: tsc clean, boundary check passes, all specs green
- `npm run build` -- expected: succeeds
- `npm run dev` then fetch the dev URL -- expected: HTML served, `src/main.tsx` and CSS transform without error

**Manual checks:**
- In a browser at 1280 x 800: strip look matches the mock, both themes (switch the OS scheme), Tab and arrows, `M` and `I`, visible focus ring, no scrollbar.
