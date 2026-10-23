# Currency review: ARCHITECTURE-SPINE Stack (checked 2026-10-23, npm live)

Verdict: all named versions are confirmed as current `latest`; no wrong version. Gaps are in unstated constraints, one misleading Node note, and the lack of a stated Web Audio caveat.

## Verified
| Pkg | Spine | npm latest | engines / peers |
| --- | --- | --- | --- |
| typescript | 7.0.2 | 7.0.2 | node >=16.20 |
| react | 19.3.1 | 19.3.1 | - |
| react-dom | (not listed) | 19.3.1 | peer react ^19.3.1 |
| vite | 8.3.5 | 8.3.5 | node ^20.19 or >=22.12 |
| @vitejs/plugin-react | 6.1.2 | 6.1.2 | peer vite ^8.0.0; node ^20.19 or >=22.12 |
| vitest | 5.0.5 | 5.0.5 | peer vite ^6.4 / ^7 / ^8; node ^22.12 or ^24 or >=26 |
| node (local) | 22.13.1 | - | meets all above |

Combination vite 8.3.5 + plugin-react 6.1.2 + vitest 5.0.5 + React 19.3.1 is peer-compatible. TypeScript 7 has no peer link to these (Vite/Vitest transpile without tsc type-checking), so it is compatible, though type-checking is a separate `tsc` step.

## Findings
1. Node note is incomplete/misleading. Spine says "Vite needs ^20.19 or >=22.12", but Vitest 5.0.5 is stricter: ^22.12 || ^24 || >=26 (Node 20 is NOT supported). Local 22.13.1 passes, but the governing constraint is Vitest's. State it; add an `engines`/.nvmrc pin of >=22.12.
2. Unlisted dependencies the stack implies: react-dom 19.3.1 (peer-locked to react ^19.3.1), @types/react and @types/react-dom (@types/react latest is 19.3.0, lagging react 19.3.1; harmless), @types/node (Vitest peer ^22 or >=24; latest is 26.6.5, so pin to the 22.x line, e.g. 22.20.5, to match runtime). "Light component tests" need a DOM env plus @testing-library/react; none named.
3. jsdom trap: jsdom 30.1.3 requires node ^22.22.2 || ^24.15 || >=26, which the stated local Node 22.13.1 does NOT satisfy. If jsdom is chosen for component tests, either upgrade Node to >=22.22.2 or use happy-dom. Vitest peers also accept `*` for both.
4. Ecosystem lag risk with TypeScript 7: typescript-eslint latest peers `typescript >=4.8.4 <6.1.0`, so it does not support TS 7. If linting is added later, expect a conflict. The spine names no linter, so not a current error; flag as a constraint.
5. "Verified against npm" holds only for the 5 packages checked; no lockfile/exact-pin policy is stated (caret vs exact).

## Web Audio claims
Spine (AD audio section): "The audio context starts on the first user gesture, with no enable-sound screen." This is technically right but needs care. Chrome/Safari/Firefox autoplay policies create or leave AudioContext `suspended` until a user gesture; the engine must call `audioContext.resume()` (or create the context) inside the gesture handler, and Safari/iOS may need resume on each interaction after interruption, and the page's mute switch affects iOS. Risk: if the first gesture is something like a pointer-move or non-activating event, or if audio is triggered from a timer/async callback after a delay, playback can fail silently. Recommend wording: "create/resume the AudioContext synchronously inside the first activating gesture (click/keydown/touchend; not mousemove/scroll); handle state `suspended`/`interrupted`." Also, "Practice question plays automatically" flows (e.g. auto-play next interval after answer) are fine only after an earlier gesture. No factual error found; the claim is underspecified. I did not fetch MDN in this run (npm-only verification), so browser behavior is stated from established spec/MDN knowledge, not live-checked.

## Not confirmed
- Browser support matrix (none stated).
- No live check of MDN/spec performed.
