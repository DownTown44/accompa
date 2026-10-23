# Spine Pair Review — accompa

## Overall verdict
The pair is a usable contract. Every color token has light and dark hex, all 16 components appear by identical name in both files, section order and required defaults are correct, and the two Key Flows are complete. The gaps that matter downstream are a missing focus-ring spec, an under-specified shortcut-yield rule on a keyboard-first product, and several decisions the memlog already resolved that the spines still present as open. None of these is a blocker.

## 1. Flow coverage — adequate
Checked: PRD has no formal UJ names (only FRs and "core loop" prose). Flow 1 (build on piano, find on guitar; FR-12 to FR-15, FR-19) and Flow 2 (interval ear practice; FR-3 to FR-9 plus the guess override) each have a named protagonist, numbered steps, a bold climax and failure paths. Flow 3 is a stub.
### Findings
- **[low]** Flow 3 (chord ear practice, FR-22) has no steps, climax or protagonist; it is an assumption paragraph (EXPERIENCE § Key Flows). Known and slice 1B, so only low. *Fix:* leave until 1B is designed; do not let it be read as specified.
- **[low]** FR-21 (piano voicings, inversions and spread) appears in no flow or component rule; the stepper is guitar-only (EXPERIENCE § Component Patterns, Open items). *Fix:* keep the open item; add a one-line scope note to the stepper row.

## 2. Token completeness — adequate
Checked: all 16 light colors have a `-dark` twin with hex; every `{path}` reference in both files resolves (typography, rounded, spacing, colors, components); frontmatter component references resolve. No critical (missing hex). Contrast is stated for the load-bearing pairs, with honest failures disclosed.
### Findings
- **[high]** No focus-ring token or spec (color, width, offset, contrast), yet EXPERIENCE requires a visible focus ring on every control and the product is keyboard-first (DESIGN § Colors / Components; EXPERIENCE § State Patterns "Focus", Accessibility Floor). *Fix:* add `colors.focus` (light and dark), a ring width and offset, and a contrast row against bg and surface.
- **[medium]** Dark theme: black keys vs white keys is 1.36 (fails 3:1) and the stated mitigation (shape and outline) covers role markers only, not key discrimination (DESIGN § Contrast). *Fix:* lighten `key-black-dark`, or add a keyline/outline for black keys in dark, and re-state the ratio.
- **[medium]** Load-bearing values live only in prose or are untokenized: stroke widths (1.8px marker outline, 1.5px and 2px keyline, 7px nut, 2px wrong ring), opacities (80% key tint, 70% strings, 60% key-hint, 75% strike), key-hint 13px variant, and interactive states (hover, disabled/pool-excluded interval, lit piano key, pressed). Downstream code mirrors the tokens (DESIGN § Shapes, Elevation, Typography, Components). *Fix:* add `stroke`/`opacity` tokens and component state entries for the lit key, disabled interval button, hover.
- **[medium]** `key-hint` is 15px (13px in buttons) at 60% opacity of muted; the contrast of that combination is not computed and is likely below 4.5 (DESIGN § Typography, Contrast table). *Fix:* compute it, or mark the cap as decorative with the label carrying the meaning.

## 3. Component coverage — adequate
Checked: 16 names (Mode strip, Mode tab, Instrument toggle, Help hint, Readout, Role legend, Piano keyboard, Fretboard, Role marker, Action button, Interval button, Voicing stepper, Fret-region bar, Setup panel, Status note, Key hint) have a row in both DESIGN.md Components and EXPERIENCE.md Component Patterns, with real rules.
### Findings
- **[medium]** The Setup panel's contents (interval-pool checkboxes, direction, root random/fixed, sound choice, theme switch) are not components in either file: no control type, no visual or behavioral spec beyond "last interval cannot be unticked" (DESIGN § Components; EXPERIENCE § Component Patterns). The panel's layout is a declared assumption, but the controls inside it are a build dependency. *Fix:* name the control types (checkbox chip, segmented control reusing `instrument-toggle-selected`, select) and map each to existing tokens.

## 4. State coverage — thin
Checked: Explore piano and guitar, Listen, Setup panel, Shortcuts hint against empty, error, focus, audio-blocked, reduced-motion and wrong-guess states. Offline and permission-denied do not apply to a client-only synthesized-sound app.
### Findings
- **[high]** The shortcut-yield rule is not specified. Memlog 42 decided that Space, Enter and Tab yield when a button or field has focus, but EXPERIENCE still says "implementation needs a rule", and nearly every control is a button, so after any mouse click the shortcuts would be dead. Load-bearing for a keyboard-first product (EXPERIENCE § Interaction Primitives, key-map note). *Fix:* state the rule (for example, mouse-clicked buttons release focus; shortcuts yield only on keyboard-focused controls or text fields) and the alternate focus route for Tab.
- **[medium]** Listen gaps: a right guess advances immediately with no stated confirmation or readout of the answer; Reveal "lights both notes on the active instrument" but on guitar the two notes have many positions and the choice is undefined; behavior of switching to Explore mid-question and of changing the pool mid-question is unstated (EXPERIENCE § State Patterns, Flow 2). *Fix:* add rows for right-guess feedback, guitar reveal placement and mid-question changes.
- **[medium]** Explore gaps: unresolved note set shows "notes only" but role markers/legend for it are undefined; lit notes that fall outside the three visible octaves after `[` / `]` have no indicator; guitar view with an empty or single-note workspace (stepper state) is unspecified (EXPERIENCE § State Patterns). *Fix:* add rows for each.

## 5. Visual reference coverage — adequate (pending promotion)
Checked: `.working/` holds the excalidraw wireframe, `directions-1.html`, `color-themes-1.html` (all linked inline in both spines with what they illustrate) and three key mocks `key-explore-guitar`, `key-explore-piano`, `key-listen-setup` (pending promotion and inline linking, not orphans). `mockups/`, `wireframes/` and `imports/` do not yet exist.
### Findings
- **[medium]** Precedence is contradictory: EXPERIENCE says spines win on conflict; DESIGN says "DESIGN.md and the HTML mocks win on color and type" and treats `color-themes-1.html` as the "source of the values" while that mock still renders the rejected blue 5th and `TT` (DESIGN § Brand & Style, Layout; EXPERIENCE § Foundation). *Fix:* state spines-win once in each file and mark the mock as superseded where it differs (blue 5th, TT, `G guitar`).
- **[low]** Paths are inconsistent: EXPERIENCE links the wireframe at `wireframes/…` (with a promoted note), DESIGN at `.working/…`, and the HTML mocks stay at `.working/`. *Fix:* rewrite all links to final paths at promotion; add the three key mocks with one-line "illustrates" notes and flag Listen/setup as proposed, not approved.

## 6. Bloat & overspecification — adequate
Checked: restated sources, pixel specs, prose that duplicates tokens. Contrast table, Do's and Don'ts and Voice table are load-bearing. EXPERIENCE prose is lean; Motion and Persisted settings are invented sections that earn their place.
### Findings
- **[low]** Colors prose re-lists every hex already in the frontmatter, which invites drift (DESIGN § Colors). *Fix:* keep role and usage text, drop the hex duplicates.
- **[low]** The Typography ramp paragraph repeats the px values of the typography tokens (DESIGN § Typography). *Fix:* reference tokens by name.

## 7. Inheritance discipline — adequate
Checked: both `sources` paths resolve; PRD mode names are mapped to Listen/Explore in the Vocabulary note; the glossary and component names match across both files; `{components.*}` references from EXPERIENCE resolve; the 12 interval names match AD-3.
### Findings
- **[medium]** Items the memlog resolved (entry 42) are still tagged open or assumed: Explore as the default mode, auto-play after a right guess, `TT` vs `A4`, the yield rule, `[`/`]` added to the approved map, and the root-vs-accent check (EXPERIENCE § Information Architecture, State Patterns, key-map note, Open items; DESIGN § Contrast). Consumers will treat them as undecided. *Fix:* promote them to plain statements and drop the stale tags; the open item `TT` should become "A4".
- **[low]** One concept has three names: "Help hint" (component), "Shortcuts hint" (IA row) and "shortcuts list" (DESIGN). *Fix:* use "Help hint" for the control and "shortcuts list" for its content.
- **[low]** EXPERIENCE says direction and root mode do not persist; the architecture spine places them in the settings context that may persist (AD-5 area). The assumption is flagged, but the architecture conflict is not. *Fix:* note the divergence or align.

## 8. Shape fit — adequate
Checked: DESIGN sections are in canonical order and all eight are present. EXPERIENCE has Foundation, IA, Voice and Tone, Component Patterns, State Patterns, Interaction Primitives, Accessibility Floor, Key Flows, plus Motion, Persisted settings and Open items. Responsive and Inspiration are absent.
### Findings
- **[medium]** DESIGN says "one screen, no scrolling" on a fixed 1280 x 800 canvas, with px tokens and no rule for other laptop viewports or window resize (e.g. 1366 x 768): no minimum size, scaling or overflow behavior. That is a Responsive/Platform trigger even for laptop-only (DESIGN § Brand & Style note, Layout; EXPERIENCE § Foundation). *Fix:* add a short Responsive & Platform section: supported browsers, minimum viewport, whether the layout scales or clamps.
- **[low]** No Inspiration & Anti-patterns section; the memlog has no app references but does hold rejects (realistic instruments, inconsistent selected state, green mode buttons), which DESIGN's Do's and Don'ts partly cover. Defensible. *Fix:* optional one-line anti-pattern list in EXPERIENCE.

## Mechanical notes
- No Mermaid in either file. Frontmatter complete in both (name, status, updated, sources; DESIGN has description, EXPERIENCE has companion).
- All `{token}` references resolve; no orphan tokens except `typography.wordmark` and `typography.note-label`, used only in prose or components by description (fine).
- EXPERIENCE refers to a "Next button" that is not a named component (it is an Action button instance); worth one clause.
- `.working/` mock links are relative-path inconsistent with the wireframe link (see category 5).
