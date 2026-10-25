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

- source_spec: `_bmad-output/implementation-artifacts/spec-3-2-root-marker-role-shapes-and-legend.md`
  summary: `R` then a click on a lit note sets a chosen root (`Workspace.root`, armed Status note `Click a lit note to set the root.`, `R` in the shortcut list; a note that roots no reading makes the set read as unknown; the chosen root persists until unlit or changed). Needs a story slot after 3.2 (suggest key `3-6`); epics.md and sprint-status.yaml not yet updated.
  evidence: Split from Story 3.2 at the token gate; 3.2 keeps role markers, legend and intervals with the root always the reading's root. Apor's decisions for this goal: a note that is not any reading's root takes the marker and the set reads as unknown; Story 3.3 (reading choice) depends on it.
