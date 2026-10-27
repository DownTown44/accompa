# Before Epic 5: what is left from Epic 4

Written 2026-10-26, after the Epic 4 retrospective. Pick this up in a new session by reading this page, then `epic-4-retro-2026-10-26.md` and `epic-4-decisions-for-review.md`.

## Where things stand

- Epic 4 is merged (PR #28) and `done`. Story 4.1 was retired and 4.2 dropped (`planning-artifacts/sprint-change-proposal-2026-10-26.md`).
- Retrospective written (`epic-4-retro-2026-10-26.md`), verdict accepted-with-open-items, six action items in `sprint-status.yaml`. Two older items (epic 2 item 11, epic 3 item 16) are closed.
- Local `main` may be ahead of `origin/main` by docs commits (check `git status`). Apor pushes `main`; never push it from the agent.
- Next epic: Epic 5, chord ear practice (5.1 choose chord practice and hear a chord, 5.2 guess a quality, 5.3 reveal the chord on the instrument).

## Two decisions needed before drafting Epic 5 (both decided 2026-10-27: the recommended option; written into `epics.md` Stories 5.1 and 5.3)

1. **Reveal on the guitar (Story 5.3).** `epics.md` says each chord note shows at one position near the lowest frets, with `[ASSUMPTION: Epic 5 does not depend on voicings from Epic 4]`. Epic 4 changed that.
   - Recommended: reveal the chord as the best-ranked playable voicing, as the Explore guitar does.
   - Alternative: keep the nearest-low-frets cluster.
2. **Playing the question chord on the guitar (Story 5.1).** It says the chord plays as a block. In Explore, Block now strums on the guitar when a voicing shows.
   - Recommended: Listen plays a plain block on both instruments.
   - Alternative: strum on the guitar, consistent with Explore.

## Housekeeping (docs)

| Item                | What                                                                                                                                                                                                                                                                                                       | Owner                      |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Stale epic text     | `epics.md` Story 4.3, PRD FR-17 and `epic-4-context.md` still say "only the 5th droppable" and lack the finger rule (at most four fingers, a barre counts as one unless an open string lies inside it), the fret 12 limit (`maxFret`) and register bucket width 6. Retro action item 1.                    | Apor approves, dev applies |
| Stale deferred work | In `deferred-work.md`: the Listen root setting shipped as Story 1.12, click-to-set-root as Story 3.6, and the two out-of-range-pitch entries are covered by the beyond-the-fretboard note and the pitch-class voicings. The CI workflow entry is still open (no `.github` folder). Annotate, never delete. | dev                        |
| AGENTS.md pitfall   | One line: the stepper row is part of the shared readout block height (`--spacing-readout-block-height`), so changing it moves Listen too. AGENTS.md is Apor's file; do not edit it without being asked.                                                                                                    | Apor                       |

## Code follow-ups (not blocking)

- **Shared voicing list.** `useShown` runs through `useVoicingList` and `useLitNotes` in about seven places (`App.tsx`, `ExploreView.tsx`, `VoicingStepper.tsx`, `GuitarStage.tsx`, `PianoStage.tsx`, `useSessionActions.ts`, `useShortcuts.ts`), and `useSessionActions` is used by many components, so one change recomputes generation and ranking in every instance. A shared provider fixes it. The `ExploreStepper.test.tsx` timeout was raised to 20 s in Story 4.6 and should go back to the default afterwards. Retro action item 2. Do this before Epic 5 adds more consumers.
- **Unreachable path.** `No voicing fits these notes.` cannot occur for a named chord (every quality has voicings for all twelve roots at or below fret 12), so it is tested only through a mocked generator (`tests/ui/explore/ExploreNoVoicing.test.tsx`).
- **Reading selection duplicated.** `bestVoicing` in `src/ui/session/useLitNotes.ts` picks the reading beside `exploreReading`. Revisit with the provider.

## Not verified

- The strum was never listened to; it was checked only against a fake audio clock. `STRUM_SPREAD` is 40 ms (`src/audio/synth.ts`). Retro action item 3.
- The first voicing for E, F and D after the fret 12 limit (`x 7 9 9 9 7`, `x 8 10 10 10 8`, `10 12 12 11 10 10`) was read from reports, not seen in the app.
- The muted `x` markers were seen in a real browser only at voicing 96 of 96 and after an edit.

## Behaviour worth trying

- With a chord pictured on the guitar, any fret click edits that voicing (Story 4.6). To start a different chord from scratch, press Esc first. Say so if this feels wrong.
- The instrument now sits at 366 px from the top (it was 312) because the stepper row is reserved in Explore and Listen, so the fretboard is a little smaller.
- E, F and D first shapes depend on register-first ranking (Story 4.5): an open E or D can lose to a barre. Changing that changes the ranking rule.

## Process lessons from the retro (action items 4 to 6)

- Put golden examples (the first result for named inputs) in the matrix of any story that generates or ranks results, and have Apor confirm them before build.
- Confirm planning `[ASSUMPTION]` lines that shape visible behaviour with a concrete picture before the epic list is written.
- Tell implementers up front to assert exact outcomes, never loosen a test to pass, and never leave an assertion that cannot fail.

## How to continue

1. Read this page and answer the two decisions above.
2. Ask the dev agent (or the PM, John) to do the housekeeping rows and the shared provider.
3. Draft Story 5.1 with `bmad-build`, stopping at `draft`, the same way as the earlier stories. Epic 5 context is not compiled yet; `bmad-build` compiles it on first use.
