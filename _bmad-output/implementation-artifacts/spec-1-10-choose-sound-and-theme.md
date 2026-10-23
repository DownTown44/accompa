---
title: 'Story 1.10: Choose sound and theme'
type: 'feature'
created: '2026-10-24'
status: 'ready-for-dev'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The theme only follows the OS, there is no Sound control, and settings (pool, direction) live inside the session state next to the current question.

**Approach:** Add a settings context with its own pure reducer holding pool, direction, sound and theme, apart from the session context. Add Sound and Theme segmented controls to the Setup panel. Sound, theme and pool persist to `localStorage`; direction does not.

## Boundaries & Constraints

**Always:** Settings are plain serializable data: `pool`, `direction`, `sound` (`'synthesized'`), `theme` (`'system' | 'light' | 'dark'`). Defaults are all 12 intervals, Ascending, Synthesized, System. The session reducer and `Practice` no longer hold the pool or direction; the question draw and the answer buttons read them from settings. Persistence is three keys, each JSON and each falling back to its default on a missing, unparsable, invalid or throwing value: `accompa.pool` (as now), `accompa.sound`, `accompa.theme`. Nothing else is written, and no write error shows. The Sound control is a labelled radiogroup with `Synthesized` as its only option, selected. The app creates its engine from the saved sound through a map of sound name to engine factory; replacing the sound replaces the engine, and a play already started is stopped. Theme applies at once: System sets no `data-theme` on `<html>` and follows `prefers-color-scheme`; Light and Dark set `data-theme="light"` or `"dark"`, and both use the full token sets. The saved theme is applied before the first paint, with no flash of the other theme. Both controls sit in the Setup panel under Direction, labelled with the shared Setup label style and the shared selected treatment, and the panel still fits 1280 x 800 without scrolling. Digit keys and `P` keep yielding as before while a radio has focus.

**Never:** No Root control, no second sound, no samples, no persisting direction, root, question or panel state, no `Math.random` in `core/`, no new dependency, no story or epic references in comments.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Choose Dark | OS is light, pick Dark | `data-theme="dark"` on `<html>`, dark tokens apply, saved as `"dark"` | N/A |
| Choose System | Dark chosen earlier, OS is light, pick System | attribute removed, light tokens apply, saved as `"system"` | N/A |
| Follow OS | System and the OS switches to dark | dark tokens apply with no reload | N/A |
| Reload | theme `dark`, pool `[7, 12]`, direction Descending, reload | theme and pool restored, direction Ascending | N/A |
| Sound | open Setup | Sound group shows only `Synthesized`, selected; Space still plays through the engine | N/A |
| Bad storage | `"x"`, `[]`, `"purple"` or a throwing `localStorage` | defaults, no error, app works | no message |
| Mid-question | change theme, pool or direction | question, marks and replay unchanged | N/A |
| Reducers | any settings action | pure, return the same state when nothing changes, state passes `JSON.stringify` | N/A |
| Yield | focus on a Sound or Theme radio, press a digit | native behavior, no guess | N/A |

</frozen-after-approval>

## Code Map

- `src/core/model.ts` -- add `Theme` and `Sound` types and a `Settings` type with its defaults; drop `pool` from `Practice` and `initialPractice`.
- `src/ui/settings/settings.ts` -- new: `settingsReducer` and actions `togglePool`, `setDirection`, `setSound`, `setTheme`; move the `togglePool` and `setDirection` logic from `src/ui/session/session.ts`, then remove it there.
- `src/ui/settings/SettingsContext.tsx` -- new: provider with `initial=` for tests, `useSettings`; a layout effect applies `data-theme`; effects save pool, sound and theme.
- `src/ui/settings/settingsStorage.ts` -- new, replacing `src/ui/session/poolStorage.ts`: `loadSettings`, `saveSetting`, validated, every storage call in try/catch.
- `src/ui/app/App.tsx` -- `SettingsProvider` outside `SessionProvider`; engine from the sound map in `src/audio/engines.ts` (new, sound name to `createSynthEngine`); remove the pool save effect.
- `src/ui/session/useSessionActions.ts`, `IntervalButtons.tsx` -- read pool and direction from settings; `src/ui/setup/SetupPanel.tsx`, `setup.css` -- chips and Direction use settings actions, add Sound and Theme groups via `SegmentedGroup` (`setup` variant), each labelled by its visible heading.
- `src/ui/theme/theme.css` -- keep the `@media (prefers-color-scheme: dark)` block guarded by `:root:not([data-theme='light'])`, and add `:root[data-theme='dark']` with the same overrides; `tests/ui/theme/theme.test.ts` asserts the token twins and must cover both selectors.
- Tests: `tests/ui/settings/*.test.ts(x)` (reducer, storage, provider), `tests/ui/setup/SetupPanel.test.tsx`, `tests/ui/session/session.test.ts`, `tests/ui/listen/IntervalButtons.test.tsx`. `tests/ui/session/poolStorage.test.ts` moves with the storage module. Clear `localStorage` and `data-theme` after each test.

## Tasks & Acceptance

**Execution:**
- [ ] `src/core/model.ts`, `src/ui/settings/settings.ts`, `settingsStorage.ts`, tests -- settings model, pure reducer, validated storage
- [ ] `src/ui/settings/SettingsContext.tsx`, `src/ui/app/App.tsx`, `src/audio/engines.ts` -- provider, theme attribute before paint, saves, engine from sound
- [ ] `src/ui/session/session.ts`, `useSessionActions.ts`, `IntervalButtons.tsx`, tests -- move pool and direction out of the session
- [ ] `src/ui/theme/theme.css`, `theme.test.ts` -- manual Dark with the full token set
- [ ] `src/ui/setup/SetupPanel.tsx`, `setup.css`, tests -- Sound and Theme controls; every matrix row tested

**Acceptance Criteria:**
- Given the Setup panel, then Sound shows `Synthesized` only and Theme shows System, Light and Dark, each with a label and the shared selected treatment.
- Given a theme choice, then the app switches at once and the choice survives a reload.
- Given settings in storage, when the app loads, then sound, theme and pool are restored and direction is Ascending.
- Given the settings reducer, then every action is pure and serializable, and the session reducer holds no setting.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Design Notes

The three storage keys keep the saved pool from Story 1.8 valid, so nothing resets. The sound map is the seam where a samples engine will plug in later.

## Verification

**Commands:**
- `npm run check` -- expected: tsc clean, boundary check passes, all specs green
- `npm run build` -- expected: succeeds

**Manual checks:**
- Pick each theme with the OS in both schemes, reload, and look for a flash; the panel fits 1280 x 800 in light and dark; focus rings and the selected treatment read in both themes.
