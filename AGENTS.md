<!-- bmad:context -->
<!-- Verified 2026-10-25 against 0b99e87. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## accompa

Ear-training web app for intervals and chords on a piano and a guitar fretboard. TypeScript, React 19, Vite, Vitest with happy-dom. Planning documents live in `_bmad-output/planning-artifacts/` (PRD, architecture, UX, `epics.md`); story specs, review logs and `sprint-status.yaml` in `_bmad-output/implementation-artifacts/`.

## Policy

- Never push `main`: work on `story/<epic>-<n>-<name>` branches and open the PR by hand (no `gh` here); docs commits go on `main` locally and the maintainer pushes.
- Never delete files under `_bmad-output/`; it is the record of the BMad build.
- Never read `roadmap.md`: private and gitignored.
- Laptop-only (keyboard and mouse): add no touch, phone or narrow-viewport handling, and reject review findings that ask for it.

## Where things are

- Story workflow, the real-browser check and stopping the preview server on Windows: `docs/development-notes.md`; read it before any layout or CSS change.
- Layers: `src/core` (pure), `src/audio`, `src/ui`; UI features share code only through `src/ui/shared`. `npm run check` enforces it.
- Shared test helpers: `tests/ui/support/`.
- Where each file group lives, the state model and the main data flows: `docs/codebase-map.md`; spec and review conventions (golden examples, exact assertions, findings already rejected): `docs/development-notes.md`.

## Running and verifying

- Run `npm run check` (tsc, import boundaries, tests) and `npm run build` before declaring done; `yarn check` is yarn's own lockfile command, not this script, so use `npm run check` or `yarn run check`.
- After any layout or CSS change, load the built app in headless Chrome at 1280 x 800 and confirm the instrument's top edge and the Status note stay put and the page does not scroll; unit tests do not cover layout.
- Tests use happy-dom, not jsdom: `.nvmrc` pins Node 22.13.1, below jsdom 30's floor.

## Conventions that differ from defaults

- Pin dependencies to exact versions, no `^` or `~`.
- Chord names come only from `nameChord` (`src/core/chords.ts`); no surface picks its own reading.
- `src/core` takes randomness as a `random` parameter; never call `Math.random` there.
- `Workspace` and `practice` change only through reducer actions in `src/ui/session/session.ts`; the reducer tests assert the other half is untouched by reference.
- The guitar holds one lit note per string: place notes with `placeLit` and `pitchesOnString` (`src/core/explore.ts`), never by choosing frets in the UI.

## Known pitfalls

- Never reflow or change line endings of lines you did not change: working copies are CRLF (`autocrlf`), the index is LF, and formatter runs reflowed untouched files in two stories. Prettier is not installed; `.prettierrc` records the style, so run `npx prettier` only on files you created.
- `PianoKeyboard`, `Fretboard` and the readout block height serve Listen and Explore; check Listen after changing them, since a default-prop change altered Listen in Story 3.2.

<!-- /bmad:context -->
