# Epic 1 Context: Interval ear practice

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Apor opens the app, hears an interval, replays it, optionally guesses, and reveals the answer on a piano or guitar view. He can tune the interval pool, direction, root note, sound and theme. This is the first half of slice 1A and establishes the project foundation, audio engine, theory core and themed shell that later epics reuse.

## Stories

- Done: 1.1 scaffold and quality gates, 1.2 themed shell, 1.3 hear a random interval, 1.4 piano keyboard, 1.5 guitar fretboard and instrument swap, 1.6 reveal an interval, 1.7 guess an interval, 1.8 choose which intervals to practise, 1.9 set direction (Root half deferred)
- Next: 1.10 sound and theme, 1.11 shortcuts and help hint (see epics.md)

## Requirements & Constraints

- Client-only static app: no backend, no accounts, no network calls. Laptop browsers only (current Chrome, Edge, Firefox, Safari); no mobile or small-screen reflow.
- Audio is browser-native Web Audio synthesis with no audio library; starts on first user gesture; audio failures never break theory features.
- Only sound, theme (with manual override) and interval pool persist to localStorage; read failures fall back to defaults.
- Accessibility floor: keyboard-first, visible focus ring on every control, roles never by color alone, reduced-motion respected, polite live regions.
- Quality gate: Vitest unit tests on `core/` plus light component tests; no end-to-end suite.
- Exact dependency versions are pinned in `package.json`.

## Technical Decisions

- Ports-and-adapters: `core/` (pure TypeScript, no browser APIs, no React) <- `audio/` (imports `core/` types only) <- `ui/` (may import both). An import-boundary check enforces it.
- Pitch is an integer (MIDI number) with branded `Pitch`, `PitchClass`, `Interval` types; no note-name strings in `core/`; one `core/spelling` module produces all labels.
- One table per music concept in `core/theory`; UI lists and pools derive from it.
- State: React Context plus pure reducers (settings context and session context); playing sound is a command to the audio engine, never React state.
- `core/` never calls `Math.random`; randomness is an injected function so tests are seeded.
- Stack pinned exactly: TypeScript 7.0.2, React and react-dom 19.3.1, @types/react and @types/react-dom 19.3.0, Vite 8.3.5, @vitejs/plugin-react 6.1.2, Vitest 5.0.5, @testing-library/react 16.3.3, happy-dom 21.0.4 (jsdom 30 needs Node 22.22+; local Node is 22.13.1). No linter unless verified to support TypeScript 7 (typescript-eslint supports TypeScript below 6.1).
- Structure: `src/core/` and `src/audio/` are flat; `src/ui/` is grouped by feature (`app`, `theme`, `shell`, `engine`, `session`, `shortcuts`, `listen`, `instruments/piano`, `instruments/guitar`), each component importing its own stylesheet. `tests/` mirrors `src/`, with shared test helpers in `tests/ui/support`.

## UX & Interaction Patterns

- Rose Quartz theme via CSS custom property tokens (light plus dark twin), Palatino type stack, theme follows system with System / Light / Dark override.
- One-screen 1280 x 800 layout with no scrolling; mode strip with Listen / Explore tabs and Piano | Guitar toggle.
- Quiet tone: short sentence-case messages, no scores, no praise.

## Cross-Story Dependencies

- Story 1.1 is the foundation for every later story: pinned stack, folder structure, test setup and the import-boundary check.

## Patterns Built So Far

- Session (`ui/session`): one reducer holds `mode`, `instrument`, `workspace`, `practice`, `pianoStart` and `feedback`. Playing sound is a command from `useSessionActions`, run inside the user's gesture.
- What is lit comes from `useLitNotes`: a revealed question in Listen, otherwise the workspace. Both instruments take `lit` plus an optional `root` and report pointer press and release through optional callbacks; the app does not wire sound or lighting on click until Explore (Story 2.1).
- Note names come only from `core/spelling` (`spellInterval` exists and is tested but not shown on screen yet); guitar positions come from `core/instruments` (`positionsForPitch`, `closestPair`); the piano window from `core/piano`.
- Setup (1.8): `Session.setupOpen` drives `ui/setup/SetupPanel` (pool chips) and the gear opener in `ModeStrip`; `P` and `Esc` live in `useShortcuts`. The pool saves to `localStorage` key `accompa.pool` via `ui/session/poolStorage.ts`, loaded in `App`. The current question's interval stays guessable after it leaves the pool. Direction (1.9) is `Session.direction`; each `Question` records its `direction` and `playQuestion` picks `block` for Harmonic. Descending's root is the higher, first-heard note. The Direction group is a `SegmentedGroup` with the `setup` variant; sound and theme go under it. Story 1.10 moves pool and direction into a settings context.
- Keyboard: digit keys, `Space`, `Enter`, `M`, `I`, `[` and `]` are handled in `shortcuts/useShortcuts.ts`; shortcuts yield to focused controls, and a pointer click on a Listen button releases focus (`listen/focus.ts`).
- Layout: instruments fill the `.stage` box (absolute svg), so the whole Listen screen fits 1280 x 800. Check any new row or control in a real browser at that size.
