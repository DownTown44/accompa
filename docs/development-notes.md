# Development notes

Working notes for building accompa. The planning documents live in `_bmad-output/planning-artifacts`; story specs, the review logs and `sprint-status.yaml` live in `_bmad-output/implementation-artifacts`.

## How a story is built

1. Sync `main`, then branch `story/<n>-<m>-<name>`.
2. Draft the spec from the epic text and the merged code (`bmad-build`). The spec stops at `draft` until it is approved. Drafting the next story's spec in the background is fine; it must stay a `draft` and touch no other file.
3. One implementation agent builds the spec. Split a story across agents only when the pieces touch separate files.
4. Check the diff against the spec's tasks and I/O matrix, then run `npm run check` and `npm run build`.
5. Run three review layers (blind, edge case, verification gap), triage every finding into the spec's Review Triage Log, and send fixes to the same implementer.
6. Commit the code and, separately, the spec and sprint status. Push and open the pull request by hand.

## Checks

- `npm run check` runs tsc, the import-boundary check and all tests; `npm run build` must also pass.
- Layout is not covered by unit tests. The whole Listen screen must fit 1280 x 800 with no scrolling, on both instruments and in both themes. Look at it in a real browser after any layout change.

## Looking at the running app

`gh` is not installed on this machine, so pull requests are opened from the pushed branch on GitHub. Chrome is at `C:/Program Files/Google/Chrome/Application/chrome.exe`.

To see real states (revealed, wrong guess, guitar, light or dark):

1. `npm run build`, then `npx vite preview --port 4173` in the background.
2. Drive it with puppeteer-core, installed outside the repo (for example in a scratch folder): launch Chrome with `executablePath`, set the viewport to 1280 x 800, emulate `prefers-color-scheme`, wait about 800 ms after load before pressing keys (the app mounts late), then screenshot.
3. To catch overflow, read `getBoundingClientRect().bottom` of `.interval-row` and `.status-note`, and `document.body.scrollHeight`; all must be 800 or less.
4. Stop the preview server afterwards. In PowerShell: `Get-NetTCPConnection -LocalPort 4173 -State Listen | % { Stop-Process -Id $_.OwningProcess -Force }`.

A plain `chrome --headless --screenshot=<file> http://localhost:4173/` captures the initial state only.
