- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-project-scaffold-and-quality-gates.md`
  summary: Add a CI workflow that runs `npm run check` on pull requests, so branch protection on main has a required check.
  evidence: Review found the quality gates are only enforced when run by hand; CI was outside Story 1.1's intent.
  status: done 2026-10-27: `.github/workflows/ci.yml` runs `npm run check` and `npm run build` on pull requests and on pushes to main; set `check` as a required status in the branch protection.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-5-guitar-fretboard-and-instrument-swap.md`
  summary: Decide what the user sees when lit workspace pitches fall outside the guitar range (below E2 or above D#6) after a swap from the piano.
  evidence: The fretboard draws only playable positions and the offscreen note is Piano-only, so those notes vanish silently; unreachable until Explore can light notes beyond 40 to 86 (medium, unverified in use).
  status: covered 2026-10-27: out-of-range pitches stay in the readout and Epic 4 voicing ranking counts them in the source register (Stories 3.8, 3.9, 4.3).

- source_spec: `_bmad-output/implementation-artifacts/spec-1-9-set-direction.md`
  summary: Root setting for Listen: a Root segmented control (Random, Fixed), choosing the fixed root by pressing a note on the active instrument, the root marker and `Click a note to set the root.` status note, fixed-root question generation (octave nearest the clicked note, kept across Random and back), and a random first fixed root.
  evidence: Split from story 1.9 at the user's choice; it needs the first pointer wiring on the instruments in Listen and is independent of Direction. The Root criteria moved to Story 1.12 in epics.md.
  status: done: delivered as Story 1.12.

- source_spec: `_bmad-output/implementation-artifacts/spec-2-1-name-an-interval-from-two-clicked-notes.md`
  summary: Decide what the user sees in Explore when a lit note is outside the guitar range (above E6) or the two lit notes span more than one piano window after a swap.
  evidence: The earlier guitar-range item is now reachable: piano keys 87 to 96 can be lit, then the swap draws no dot while the readout still names the note; two lit notes wider than 36 semitones cannot both show on the piano (medium, seen by reading the code, not in the browser).
  status: covered 2026-10-27: decided in Epic 3 and Epic 4 (readout keeps the note; Stories 3.8, 3.9, 4.3).

- source_spec: `_bmad-output/implementation-artifacts/spec-3-2-root-marker-role-shapes-and-legend.md`
  summary: `R` then a click on a lit note sets a chosen root (`Workspace.root`, armed Status note `Click a lit note to set the root.`, `R` in the shortcut list; a note that roots no reading makes the set read as unknown; the chosen root persists until unlit or changed). Needs a story slot after 3.2 (suggest key `3-6`); epics.md and sprint-status.yaml not yet updated.
  evidence: Split from Story 3.2 at the token gate; 3.2 keeps role markers, legend and intervals with the root always the reading's root. Apor's decisions for this goal: a note that is not any reading's root takes the marker and the set reads as unknown; Story 3.3 (reading choice) depends on it.

  status: done: delivered as Story 3.6.
- source_spec: `_bmad-output/implementation-artifacts/spec-6-1-the-engine-knows-the-instrument.md`
  summary: The synth never closes its AudioContext, so replacing an engine on a Sound change leaves the old one open.
  evidence: `src/audio/synth.ts` has no `close()`; only reachable once Story 6.2 lets the user switch between Samples and Synthesized; browsers cap open contexts.
- source_spec: `_bmad-output/implementation-artifacts/spec-6-1-the-engine-knows-the-instrument.md`
  summary: When the piano and guitar engines differ, a new play does not stop the other instrument's notes.
  evidence: `createEngine` calls only the selected instrument's engine; harmless while one shared synth cuts its own notes; revisit in Story 6.3.
- source_spec: `_bmad-output/implementation-artifacts/spec-6-1-the-engine-knows-the-instrument.md`
  summary: `unlock`, `status` and `subscribe` follow the piano engine only, so a guitar-first gesture would not unlock a separate guitar engine.
  evidence: `createEngine` in `src/audio/engines.ts`; decided for 6.1 by Apor (status API unchanged), to be settled by Stories 6.3 and 6.4 once the factories differ.
- source_spec: `_bmad-output/implementation-artifacts/spec-6-2-hear-a-sampled-piano.md`
  summary: A failed, partial or stalled sample fetch is silent and a chord can lose notes; there is no retry, timeout or synth fallback.
  evidence: `src/audio/sampler.ts` swallows every fetch and decode error; loading, failure, retry and the synth fallback are Story 6.4.
- source_spec: `_bmad-output/implementation-artifacts/spec-6-2-hear-a-sampled-piano.md`
  summary: Switching Sound rebuilds the router, re-fetching and re-decoding the 21 files and leaving the old AudioContext open.
  evidence: `createEngine` in `src/audio/engines.ts` runs on every Sound change; share decoded buffers and close contexts in the 6.4 engine lifecycle.
- source_spec: `_bmad-output/implementation-artifacts/spec-6-2-hear-a-sampled-piano.md`
  summary: The OfflineAudioContext decode path is verified only in Chrome.
  evidence: Chrome loaded 21 files and played a source; Firefox and Safari were not tried; try them to settle it.
- source_spec: `_bmad-output/implementation-artifacts/spec-6-2-hear-a-sampled-piano.md`
  summary: By-ear tuning of the sampler: stop click, 16 s sample tails, loudness against the synth (the sample gain, 0.8 for both sets).
  evidence: `src/audio/sampler.ts` stops sources without a release and plays each sample to its full length; settle by listening, then add a short gain release or cap the tails if needed.
