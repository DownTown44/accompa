# Spine Pair Review — accompa (second pass)

Second-pass rubric walk of the final `DESIGN.md` and `EXPERIENCE.md`. The first-pass `review-rubric.md` is left untouched. The memlog is canonical, with later entries overriding earlier ones (entries 45 to 52 govern the post-final changes).

## Overall verdict
The pair is a clean, source-extractable contract. Every `{path.token}` reference in both files (51 distinct, grepped mechanically) resolve against the frontmatter, and every color has a light and a dark hex. Component names are identical across both spines. The three mocks agree with the spines on every point you asked me to verify. Of the 21 first-pass items, 18 are resolved, 3 are still open and none has regressed. What is left is small: untokenized stroke, opacity and state values, a handful of low-severity mock-to-spine drifts, and an Open items list that does not carry every deliberate tag.

## 1. Flow coverage — strong
The PRD has no formal UJ names, so I extracted the FRs and "core loop" prose instead. Flow 1 (FR-12 to FR-15, FR-19) and Flow 2 (FR-3 to FR-9 plus the guess override) each have a named protagonist, numbered steps, a bold climax and a failure path. Flow 3 (FR-22) is deliberately a stub, tagged [ASSUMPTION] and marked "Do not read this as specified". FR-21 is carried as an open item and in the stepper row.
### Findings
- **[low]** Flow 3 has no steps, protagonist or climax (EXPERIENCE § Key Flows). It is acknowledged and slice 1B, so it is not a defect. *Fix:* none until 1B is designed.

## 2. Token completeness — adequate
- **Reference check, run mechanically.** Every `{colors|typography|rounded|spacing|components.*}` reference in both files resolves. That is 51 distinct tokens, including `{colors.key-edge-dark}` and `{colors.focus}`. Unresolved list: **none**.
- **Dark twins.** Every light color has a `-dark` twin with hex. No color is missing hex.
- **Contrast.** Contrast is stated for the load-bearing pairs, including the focus ring, key-edge and key-hint. Honest failures are disclosed.
- **Orphans.** Four frontmatter tokens are never referenced as `{...}`: `colors.key-edge`, `spacing.toggle-gap`, `typography.readout-question` and `typography.wordmark`. The last two are used by name in prose only.
### Findings
- **[medium]** Several load-bearing values remain prose-only, with no token or component state (carried from first pass). The values are the 1.8px marker outline, the 7px nut, the 2px wrong ring, the 80% key tint, the 70% string opacity and the 55% excluded-button opacity (DESIGN § Shapes, Elevation, Components). The states are the lit piano key, hover, pressed, and the pool-excluded interval button. The key-hint and focus gaps from the first pass are closed. *Fix:* add `stroke`/`opacity` tokens and `piano-key-lit` / `interval-button-disabled` component entries.
- **[low]** `spacing.toggle-gap` is defined but nothing uses it. `instrument-toggle` carries no gap, so the token is orphaned. *Fix:* reference it from `instrument-toggle` or delete it.

## 3. Component coverage — strong
All components used anywhere have a row in DESIGN.md Components and in EXPERIENCE.md Component Patterns, with identical names. The Setup panel inner controls (Pool chip, Setup segmented control, Setup label) are now named components in both. The Next button is stated as an Action button in the primary slot, which is adequate. No findings.

## 4. State coverage — strong
Empty chord, single note, unresolved set, multiple readings, no voicing, audio blocked, Esc-cleared with Undo, offscreen lit notes, and all the Listen states (waiting, wrong, right, revealed, mid-question) are present. Focus is covered by the Focus ring component and the Accessibility Floor. Offline and permission-denied do not apply to a client-only, synthesized-sound app.
### Findings
- **[low]** The Fret-region bar's clear control has no stated state for "region is already the whole neck" (hidden, inert or shown). The mock only shows it with a region set (EXPERIENCE § Component Patterns). *Fix:* one clause.
- **[low]** The proposed Setup panel overlays the instrument's right edge. During Listen Reveal, lit notes can sit under the panel, and no rule says what to do (EXPERIENCE § IA, State Patterns). It is already PROPOSED, so the placement is the natural place to settle this. *Fix:* note it with the placement decision.

## 5. Visual reference coverage — strong
Files:
- `mockups/key-explore-piano.html`
- `mockups/key-explore-guitar.html`
- `mockups/key-listen-setup.html`
- `wireframes/flow-build-chord-2026-10-23.excalidraw`
- `.working/directions-1.html`
- `.working/color-themes-1.html`
- `imports/` does not exist (fine).

**Link resolution.** All 8 inline links resolve to existing files. They are in DESIGN.md Brand & Style, Layout & Spacing and Components, and in EXPERIENCE.md Foundation, IA and Component Patterns. Each link names what it illustrates. Spines-win is stated in EXPERIENCE Foundation, DESIGN points to it, and each mock header repeats it. The `.working/` originals of the three key mocks are unlinked history, kept deliberately.

**Mock vs spine check** (each of the three mocks was opened and its body parsed):

| Check | Result |
|---|---|
| No check glyph on pool chips | Pass. No `✓` or similar in any mock. The only non-ASCII glyphs are `· ▶ ♭ —`. |
| No corner cross on the wrong-guess interval | Pass. `.iv.wrong` is fill, inset 2px muted ring and strike-through only. No cross element. |
| Fret-region clear is a small quiet cross at the right end of the bar | Pass. It is a 10px muted cross (2px stroke) on a no-fill circle with a 28px hit area, placed just right of the bar's end. |
| No "Fret region" label chip in the stepper row | Pass. The stepper row holds only the stepper. The label string appears only in the clear control's `aria-label`. |
| Tab not shown as mode switch | Pass. "Tab" appears nowhere in the mocks. |
| A4, not TT | Pass. `A4` is on key 6 and in the pool. `TT` appears nowhere. |
| 5th green | Pass. Light `#A9D8B8` and dark `#8CC5A0` in all three mocks. The 5th is a square. |
| Key hints solid | Pass. `kbd` is solid muted, on-fill on action and ink on wrong. No opacity on `kbd`. |

### Findings
- **[low]** The mocks draw the wrong-state ring and the panel edge with inset `box-shadow`. DESIGN § Elevation says rings are outline or border, not box-shadow, so they survive forced-colors modes (mock CSS `.iv.wrong`, `.pn`). The spine wins, so this is only a build trap. *Fix:* one line in each mock header or accept it as known.
- **[low]** In the mock, `.iv.wrong em` is struck through at 75% opacity. The DESIGN contrast table states ink on wrong as 10.20 and 8.76. By my estimate the 75% label is about 5 or more in light, which still passes, but it is not the number in the table. *Fix:* drop the opacity in the mock, or state the effective ratio.
- **[low]** The mock panel adds a 1.5px keyline inset edge and a 560px width. DESIGN says the panel uses "existing tokens only (surface, rounded.interval)" and does not mention the edge. The panel placement is already PROPOSED. *Fix:* mention the edge as proposed, or remove it from the mock.
- **[low]** Spines-win is stated three times: EXPERIENCE Foundation, a DESIGN Components sentence ("this file wins") and each mock header. The request was "once". *Fix:* optionally delete the DESIGN Components duplicate.
- **[low]** Key Flows 1 and 2 do not link the mocks. The mocks' headers cite the flow steps, but the flows do not point back. *Fix:* optional one link per flow.

## 6. Bloat & overspecification — adequate
The contrast table (31 rows) is long but every row is load-bearing, including the "why the ring sits outside" and honest-failure rows. The first-pass bloat items are closed: hex lists are gone from the Colors prose, and the Typography ramp now references tokens.
### Findings
- **[low]** Reference lines are repeated: EXPERIENCE Foundation References, Component Patterns "Mock per component", and DESIGN Components Illustrations all list the same three mocks. Roughly 3 lines of duplication. *Fix:* keep one list per file.

## 7. Inheritance discipline — adequate
Both `sources` paths resolve (PRD and ARCHITECTURE-SPINE exist). PRD "Practice" and "Free-play" are mapped to Listen and Explore, and the FR-6 override and FR-21 / naming PRD updates are listed. Interval names (12, with A4) are consistent with AD-3. The terms Help hint, shortcuts list, Readout, Setup panel and Next are consistent across both spines. The stale open-tags from the first pass are cleared. `TT` is now "A4" everywhere except in the intentional exploration-record caveat.
### Findings
- **[low]** EXPERIENCE says direction and root mode are not persisted. ARCHITECTURE-SPINE places direction and root mode in a settings context that "may persist" (line 71 and line 109). It is flagged [ASSUMPTION] (reconcile), but it remains open. *Fix:* decide, or record the divergence in the architecture spine.

## 8. Shape fit — strong
DESIGN sections are present and in canonical order, with all 8 sections. EXPERIENCE has all required defaults (Foundation, IA, Voice and Tone, Component Patterns, State Patterns, Interaction Primitives, Accessibility Floor, Key Flows). Inspiration & Anti-patterns and Responsive & Platform are now present. The extras (Persisted settings, Motion, Accepted limits, Open items, PRD updates needed) earn their place.

### Tag audit
- **[low]** Every `[ASSUMPTION]`, `[NOTE FOR UX]` and `PROPOSED` tag is deliberate. I found no stale tag that a memlog entry has since decided. EXPERIENCE Open items covers the web font, PROPOSED layout and panel, Flow 3 and FR-21/naming, and says every [ASSUMPTION] is open for search. However, the two `[NOTE FOR UX]` tags exist only in DESIGN (guitar-view type sizes, line 313; pool-chip on/off cue, line 363) and neither is listed in Open items. DESIGN has no open list of its own. *Fix:* add one Open items line for the guitar type-size note, and either drop the pool-chip note (the check glyph decision is final) or list it.
- Tag locations (DESIGN lines): ASSUMPTION at 254, 309, 343, 359, 361 and 363. NOTE FOR UX at 313 and 363. PROPOSED at 321 and 347. EXPERIENCE: ASSUMPTION at 32, 86, 87, 90, 102, 103, 107, 109, 112 to 114, 120, 153, 170 and 208. PROPOSED at 47 (twice) and 215.

### Viewport wording
Consistent in all four places: EXPERIENCE Foundation, EXPERIENCE Responsive & Platform, EXPERIENCE Accepted limits, and DESIGN Layout & Spacing. The wording is: laptop is the target; landscape tablets at about the canvas width are acceptable but not designed or tested; portrait and smaller are unsupported; no reflow and no minimum number. The superseded memlog entry 46 ("laptop/tablet-size ... target") is correctly overridden by entry 49. No findings.

## First-pass follow-up
Tally: **18 resolved, 3 still open, 0 regressed** (19 findings plus 2 mechanical notes, 21 items).

| # | First-pass finding | Status |
|---|---|---|
| 1.1 | Flow 3 stub (low) | Still open, deliberate (tagged [ASSUMPTION]) |
| 1.2 | FR-21 not in any flow or rule (low) | Resolved (stepper row and Open items) |
| 2.1 | No focus-ring token (high) | Resolved (`colors.focus`, ring tokens, contrast rows) |
| 2.2 | Dark black keys vs white keys 1.36 (medium) | Resolved (`key-edge-dark`, 5.13 and 6.98) |
| 2.3 | Untokenized strokes, opacities and states (medium) | Still open, partly reduced (key-hint 60% and 13px gone; others remain) |
| 2.4 | Key-hint contrast not computed (medium) | Resolved (solid colors, table rows) |
| 3.1 | Setup panel controls not components (medium) | Resolved (Pool chip, Setup segmented control, Setup label) |
| 4.1 | Shortcut-yield rule missing (high) | Resolved (Yield and focus-return rules) |
| 4.2 | Listen gaps (medium) | Resolved (right guess, guitar reveal, mid-question rows) |
| 4.3 | Explore gaps (medium) | Resolved (unresolved set, offscreen, single and empty rows) |
| 5.1 | Precedence contradiction (medium) | Resolved (spines win; see the low note on repetition) |
| 5.2 | Inconsistent link paths (low) | Resolved (all final paths) |
| 6.1 | Hex duplicates in Colors prose (low) | Resolved |
| 6.2 | Typography ramp px repeats (low) | Resolved |
| 7.1 | Resolved items still tagged open (medium) | Resolved |
| 7.2 | Help hint / Shortcuts hint naming (low) | Resolved |
| 7.3 | Persistence vs architecture (low) | Still open (flagged, not reconciled) |
| 8.1 | No Responsive section (medium) | Resolved (Responsive & Platform) |
| 8.2 | No Inspiration & Anti-patterns (low) | Resolved |
| M1 | Next button not a named component | Resolved (named as an Action button in the primary slot) |
| M2 | Link paths inconsistent | Resolved |

## Mechanical notes
- No Mermaid in either file. Frontmatter is complete in both.
- Unresolved `{path.token}` references: none. Orphan tokens: `colors.key-edge`, `spacing.toggle-gap`, `typography.readout-question`, `typography.wordmark`.
- All 8 inline links resolve to existing files. `imports/` does not exist and nothing refers to it.
- The `.working/key-*.html` originals are unlinked history and deliberately untouched.
- Unused CSS in the Explore mocks (`.pn`, `.iv`, `.ivrow`) is harmless.
