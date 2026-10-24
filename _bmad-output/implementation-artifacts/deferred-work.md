- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-project-scaffold-and-quality-gates.md`
  summary: Add a CI workflow that runs `npm run check` on pull requests, so branch protection on main has a required check.
  evidence: Review found the quality gates are only enforced when run by hand; CI was outside Story 1.1's intent.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-5-guitar-fretboard-and-instrument-swap.md`
  summary: Decide what the user sees when lit workspace pitches fall outside the guitar range (below E2 or above D#6) after a swap from the piano.
  evidence: The fretboard draws only playable positions and the offscreen note is Piano-only, so those notes vanish silently; unreachable until Explore can light notes beyond 40 to 86 (medium, unverified in use).

- source_spec: `_bmad-output/implementation-artifacts/spec-1-9-set-direction.md`
  summary: Root setting for Listen: a Root segmented control (Random, Fixed), choosing the fixed root by pressing a note on the active instrument, the root marker and `Click a note to set the root.` status note, fixed-root question generation (octave nearest the clicked note, kept across Random and back), and a random first fixed root.
  evidence: Split from story 1.9 at the user's choice; it needs the first pointer wiring on the instruments in Listen and is independent of Direction. The Root criteria moved to Story 1.12 in epics.md.

- source_spec: `_bmad-output/implementation-artifacts/spec-2-1-name-an-interval-from-two-clicked-notes.md`
  summary: Decide what the user sees in Explore when a lit note is outside the guitar range (above E6) or the two lit notes span more than one piano window after a swap.
  evidence: The earlier guitar-range item is now reachable: piano keys 87 to 96 can be lit, then the swap draws no dot while the readout still names the note; two lit notes wider than 36 semitones cannot both show on the piano (medium, seen by reading the code, not in the browser).
