- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-project-scaffold-and-quality-gates.md`
  summary: Add a CI workflow that runs `npm run check` on pull requests, so branch protection on main has a required check.
  evidence: Review found the quality gates are only enforced when run by hand; CI was outside Story 1.1's intent.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-5-guitar-fretboard-and-instrument-swap.md`
  summary: Decide what the user sees when lit workspace pitches fall outside the guitar range (below E2 or above D#6) after a swap from the piano.
  evidence: The fretboard draws only playable positions and the offscreen note is Piano-only, so those notes vanish silently; unreachable until Explore can light notes beyond 40 to 86 (medium, unverified in use).
