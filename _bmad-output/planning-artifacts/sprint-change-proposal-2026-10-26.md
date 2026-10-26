# Sprint Change Proposal: Epic 4 shows a playable voicing, not every position

Date: 2026-10-26. Status: proposed (revised after Apor's answers), awaiting approval. No other planning document has been edited.

## 1. Issue summary

While drafting the Story 4.1 spec, Apor said what a swap to the guitar should show: a C major built on the piano becomes a C major he can play on the guitar, in the register he built it in, not a three-note chord. Later, voicing stepping lets him pick the 3-note, barre or open version.

Story 4.1 as written says "every position of each chord note across the 22 frets shows". That wording comes from PRD FR-15 and is repeated in `epics.md`, `EXPERIENCE.md` and the Epic 4 goal. Apor also did not want a single note shown at every position (an `[ASSUMPTION]` in `EXPERIENCE.md:105`), nor dimmed "other positions" next to a voicing (Story 4.3). A string plays one note at a time, and a voicing is an exact chord.

Evidence: Apor's messages in this session; `epics.md:1067-1101, 1157-1160`; `prd.md:90`; `EXPERIENCE.md:86, 105`.

## 2. Impact analysis

**Epic impact.** Only Epic 4. Epics 1 to 3 are done and untouched; Stories 3.8 and 3.9 (one lit note per string) stay as built. Epic 5 reuses the fretboard to reveal chords and is not affected.

**Story impact.**

| Story | Today | Change |
|-------|-------|--------|
| 4.1 | Every chord-note position shows | Retired. What is left of it (the chord carries to the guitar and back, the empty prompt, pitches outside the range stay in the readout) is already built by Stories 3.8 and 3.9. |
| 4.2 | Region limits chord positions | Region limits the voicings. |
| 4.3 | Generator; first generated voicing shown; other positions dimmed | Also takes the register-distance ranking from 4.4 and shows the best-ranked voicing. Dimming is removed. |
| 4.4 | Ranking function and stepper | Stepper only, over the ranked list. |
| 4.5, 4.6, 4.7 | | No change. |

No renumbering. Build order is 4.2, 4.3, 4.4, 4.5, 4.6, 4.7.

**Artifact conflicts.**

- `prd.md:90` FR-15 says "All positions of the chord's notes show across the neck".
- `epics.md`: Epic List and Epic 4 intro (lines 237, 1065), Story 4.1 (1067-1101), 4.2 (1115), 4.3 (1157-1160), 4.4 (1180-1183).
- `EXPERIENCE.md:86` ("Chord shapes show every chord-note position") and `:105` (single note at every position).
- `sprint-status.yaml`: key `4-1-...` and the sequence note.
- Architecture: none. AD-8 already separates generation from ranking.
- `epic-4-context.md` is regenerated afterwards.

**Technical impact.** No code changes now. `placeLit` stays for the interim; 4.3 replaces the chord display on the guitar with a voicing.

## 3. Recommended approach

Direct adjustment: edit planning documents, retire one story and move the ranking work between two others. Effort and risk are low. Until 4.3 lands, a chord on the guitar looks as it does today (Story 3.9). Scope: moderate (backlog reorganization, one PRD wording change), no rollback.

## 4. Detailed change proposals

**P1. PRD FR-15 (`prd.md:90`)**

OLD: Swapping to the fretboard keeps the chord. All positions of the chord's notes show across the neck, with the root highlighted and other notes marked by role (3rd, 5th, 7th). User can limit the view to a fret region.

NEW: Swapping to the fretboard keeps the chord and shows it as a playable voicing in the register of the source chord (FR-16, FR-18), with the root highlighted and other notes marked by role (3rd, 5th, 7th). Swapping back keeps the chord. User can limit the view to a fret region.

**P2. `epics.md` Epic List and Epic 4 intro (lines 237, 1065)**

OLD: "...with the chord carried over, sees every chord position, and steps through ranked, register-matched voicings."

NEW: "...with the chord carried over, sees a playable voicing in the register he built, and steps through ranked, register-matched voicings."

**P3. Story 4.1**: replace its text with a short retirement note ("Retired: carry-over, swap back and the empty prompt were delivered by Stories 3.8 and 3.9; the voicing shown on the fretboard is Story 4.3") and keep the heading so numbering and links stay stable. Its `FR15; AD-5` coverage moves to 4.3.

**P4. Story 4.2 (line 1115)**

OLD: "only chord positions inside the region show". NEW: "only voicings inside the region are generated and shown".

**P5. Story 4.3**

Add an AC: the pure ranking function (register distance with a bucket-width parameter) and tests proving a high source chord returns high voicings first and a low one low voicings first. Replace lines 1157-1160: the first generated voicing becomes "the best-ranked voicing", and delete "And other chord positions are dimmed." Add that a chord of one note keeps the 3.9 placement and shows no stepper.

**P6. Story 4.4**: remove the first AC (ranking function, now in 4.3); the story opens on the best-ranked voicing and adds the stepper, keys, announcements and kept selection.

**P7. `EXPERIENCE.md`**

Line 86, OLD: "Chord shapes show every chord-note position, filtered by fret region." NEW: "A chord shows as one voicing, filtered by fret region."

Line 105, OLD: "Guitar view: that note at every position inside the region, no stepper (a voicing needs two or more notes). [ASSUMPTION]". NEW: "Guitar view: that note where it is placed, no stepper (a voicing needs two or more notes)."

**P8. `sprint-status.yaml`**: set `4-1-carry-the-chord-to-the-fretboard` to `done` with a comment "retired, delivered by 3-8 and 3-9; replaced by 4-3". Keep the other epic-4 keys. Regenerate `epic-4-context.md` after P1 to P7.

## 5. Implementation handoff

Scope: moderate. PM (John) applies P1 to P7 after approval; the dev agent regenerates the Epic 4 context and the sprint-status edit (P8) is made on `main` with the other docs; the next story to spec is 4.2 or 4.3, Apor's choice. Success: no planning document describes every-position display, 4.3 shows the best-ranked voicing, and Epic 4's build order matches this document.
