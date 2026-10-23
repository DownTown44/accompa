---
title: 'Story 1.1: Project scaffold and quality gates'
type: 'feature'
created: '2026-10-23'
status: 'done'
baseline_commit: 'fdd852fe2b659b70c6f3e0398f56ac1ad7c6dcd9'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The repo has no application code. Every later story needs the pinned stack, the `core/` / `audio/` / `ui/` structure, a test runner and an enforced dependency direction before it can start.

**Approach:** Hand-set-up a Vite + React + TypeScript project at the architecture's pinned versions, with Vitest on happy-dom, one `core/` unit spec, one component spec, and a dependency-free Node import-boundary check wired into `npm run check`.

## Boundaries & Constraints

**Always:** Pin every dependency to an exact version (no `^` or `~`), including the two required peers not in the Stack table (`@testing-library/dom`, `@types/node`). Stay on Node 22.13.1 (declare `engines` as `^22.12.0 || ^24.0.0 || >=26.0.0`). `core/` imports nothing from `ui/` or `audio/`; `audio/` imports nothing from `ui/`. Strict TypeScript. Plain-text, quiet UI copy.

**Never:** Add a linter, a CSS framework, a state library, a router or any dependency beyond the pinned list. No theming, shell or audio work (Stories 1.2+). No `Math.random`, browser APIs or React in `core/`. No story or epic references in code comments.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Clean tree | `src/` as committed | Boundary check exits 0 | N/A |
| core imports ui or audio | `core/x.ts` imports `../ui/...` or `../audio/...` | Exit 1, message names file and offending import | Message printed to stderr |
| audio imports ui | `audio/x.ts` imports `../ui/...` | Exit 1, same message form | Same |
| Allowed direction | `ui/` imports `core/` or `audio/`; `audio/` imports `core/` | Exit 0 | N/A |
| Import forms | static `import`/`export from`, side-effect `import 'x'`, dynamic `import('x')`, `import type` | All are checked | Same |
| Test file | `tests/` importing from any layer | Not checked | N/A |

</frozen-after-approval>

## Code Map

- Repo is greenfield: only `_bmad/`, `_bmad-output/`, `.claude/`, gitignored `roadmap.md` and `.gitignore` exist. Nothing to reuse.
- `package.json`, `package-lock.json` -- exact pins (versions verified on npm), scripts, engines
- `tsconfig.json` -- strict, `moduleResolution: bundler`, `noEmit`, `jsx: react-jsx`, includes `src`, `tests`, `vite.config.ts`
- `vite.config.ts` -- react plugin; Vitest `test` block with `environment: 'happy-dom'`
- `index.html`, `src/main.tsx`, `src/ui/App.tsx` -- blank page rendering the `accompa` name
- `src/core/pitch.ts` -- minimal branded `Pitch` / `PitchClass` types and `pitchClass()` (AD-2) so a real `core/` spec exists
- `src/audio/` -- directory kept by a `.gitkeep` until Story 1.x adds the engine interface
- `scripts/check-boundaries.mjs` -- exports `findViolations(srcDir)`, runs as CLI
- `tests/core/pitch.test.ts`, `tests/ui/App.test.tsx`, `tests/scripts/check-boundaries.test.ts` -- specs

## Tasks & Acceptance

**Execution:**
- [x] `package.json`, `package-lock.json`, `tsconfig.json`, `.gitignore`, `.nvmrc` -- pinned toolchain; `.gitignore` adds `node_modules`, `dist` -- reproducible install
- [x] `index.html`, `vite.config.ts`, `src/main.tsx`, `src/ui/App.tsx` -- dev server renders a blank accompa page
- [x] `src/core/pitch.ts`, `src/audio/.gitkeep` -- structure from the Structural Seed
- [x] `tests/core/pitch.test.ts`, `tests/ui/App.test.tsx` -- one core spec and one component spec, happy-dom
- [x] `scripts/check-boundaries.mjs`, `tests/scripts/check-boundaries.test.ts` -- boundary check plus a spec using temp fixture trees covering the matrix
- [x] `package.json` scripts -- `dev`, `build`, `test` (vitest run), `check` (tsc --noEmit, boundary check, vitest run)

**Acceptance Criteria:**
- Given a fresh checkout on Node 22.13.1, when `npm ci` and `npm run dev` run, then a page with the accompa name renders.
- Given `package.json`, then every dependency is an exact version matching the Stack table, with no range operators.
- Given `src/`, when listed, then `core/`, `audio/`, `ui/` exist, and `tests/` exists.
- Given `npm test`, then the core spec and the component spec pass.
- Given a violating import in `core/` or `audio/`, when `npm run check` runs, then it fails naming the file and import; on the clean project it passes.
- Given the repo, then no linter dependency or config exists.

## Implementation Notes

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Evidence / route |
|---|---|---|
| CLI guard compares argv[1] to import.meta.url; a mismatch silently skips the scan | medium | Real: a skipped scan exits 0 and passes the gate. **patch**: guard removed, script always runs |
| Testing Library auto-cleanup not registered without Vitest globals; renders leak between tests | medium | Verified: a second-render test failed with globals off. **patch**: `globals: true` plus a leak test |
| No CI workflow or pre-commit hook; gates unenforced | low | Real but outside this story's intent. **defer** (deferred-work.md) |
| Files directly in src/ (e.g. main.tsx) are unlayered, so core importing them is unchecked | low | Real, contrived; fix adds branches. Rejected |
| Comment or string text matches the import regex | low | Fails loudly with a false violation; fix needs a parser. Rejected |
| require(), backtick dynamic imports, path aliases, absolute specifiers bypass the check | low | No such usage or alias exists; ESM only. Rejected |
| Layer-name case mismatch on case-insensitive FS; symlinked dirs not scanned | low | Unlikely, none exist. Rejected |
| Missing src dir gives ENOENT trace | false | Exits non-zero loudly; nothing passes silently |
| pitch() accepts NaN or fractions | low | Plain cast constructor by design; validation adds surface. Rejected |
| main.tsx non-null assertion on #root | low | Fails visibly in dev. Rejected |
| main.tsx / index.html wiring untested | low | `npm run build` and the dev-server check cover it; fix adds a test harness. Rejected |
| No engine-strict .npmrc; scripts/ not type-checked; stricter tsconfig flags | low | Advisory hardening, not defects. Rejected |
| .nvmrc 22.13.1 vs engines range disagree | false | Pin is local Node per architecture; range is Vitest's requirement |
| No lint or format scripts | false | Spec forbids a linter |
| package-lock.json absent from diff | false | Excluded from the staged diff only; tracked since d4f197f |
| .gitignore extras, README, favicon, noscript, test.include, cwd-dependent test | low | Housekeeping. Rejected |

## Design Notes

The boundary check is a script, not a lint rule, because no linter supports TypeScript 7 yet. It resolves each import specifier relative to the importing file, maps it to a layer by the `src/<layer>/` segment, and compares against a table `{ core: [], audio: ['core'], ui: ['core', 'audio'] }`. Bare package specifiers are ignored.

## Verification

**Commands:**
- `npm ci` -- expected: installs with no peer-dependency errors
- `npm run check` -- expected: tsc clean, boundary check passes, all specs green
- `npm run build` -- expected: Vite build succeeds
- `npm run dev` then fetch the dev URL -- expected: HTML served and `src/main.tsx` transforms without error

**Manual checks:**
- Open the dev server in a browser: blank page with the accompa name, no console errors.
