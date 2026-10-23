# Accessibility review, second pass: accompa UX (final DESIGN.md, EXPERIENCE.md, refreshed mocks)

Sources read: DESIGN.md, EXPERIENCE.md, `.memlog.md` (later entries override), `review-accessibility.md` (first pass, kept untouched), `mockups/*.html` (HTML/CSS read, not rendered). Contrast recomputed with `python -I` (WCAG 2.x, overlays alpha-composited).

Tags: **(a)** real spine gap, **(b)** mock issue, **(c)** accepted limit that is stated.

## Verdict

**Ready to hand to a builder as the accessibility contract, with a short list of spine edits.** Every high item from the first pass is either fixed in the spec (focus ring token, focus order, Tab/M, modifiers/AltGr/repeat, no-role dot, right-guess feedback) or is an explicit, stated user decision (pointer-only note toggling, drag-only fret region, no reflow, screen reader best-effort). The last changes (no pool check glyph, wrong-guess without corner cross, quiet clear cross, Tab native) are acceptable on the cues they keep. Nothing new is high or critical. The new problems are about the edges of those changes: one dark-theme contrast row that was never computed for the setup panel, an ambiguous clear-control position, an unfocusable and unnamed clear control in the spec, a focus-return rule that points at a stop with no function, arrow-key shortcut conflicts, and a setup panel with no visible opener.

New findings: **0 critical, 0 high, 7 medium, 8 low** (15). Still-open carry-overs from pass one: 1 medium, 8 low-to-medium (listed in section 4).

---

## 1. First-pass classification (47 bullets; the first pass's own tally said 44, the bullet count is 47)

| Class | Count | Items |
|---|---|---|
| Resolved | 27 | no-role dot; focus ring token; focus order; Tab native + `M`; modifiers/AltGr/repeat; right-guess feedback; dark black-key edge; solid key hints; fret numbers on region (`on-fill`); setup panel focus management; yield rule in spine; Esc undo; ARIA/selected role, key hints `aria-hidden` + `aria-keyshortcuts`; live-region design; wrong-button `aria-disabled`; stepper 40px and end states; hearing statement; contrast-table gaps and "muted never on action/accent"; selected-state cue (aria stated); pool-excluded 55%; role shape floor 18px; empty prompt copy; audio note lifecycle; forced-colors rule (spec); `min-height` strip; face/true-italic note |
| Accepted limit (user, stated) | 10 | keyboard chord-building (was critical); instrument semantics/names (SR best-effort); drag-only fret region (was high); reflow/zoom (was high); SR browse-mode shortcuts; fretboard text equivalent; instrument target size below canvas; abbreviation spoken forms; landmarks/title; italics |
| Still open | 9 | dark piano marker outline vs 80% tint (section 4); `keyline` as only key/fret edge; focus loss on Reveal to Next and stepper hide; SC 2.1.4 single-key shortcuts; px (not rem) type tokens; setup panel overlap (now wider); `color-scheme` first paint; volume/mute; mocks are span-built with no "not markup" note |
| Regressed | 1 | pool chip check glyph removed (deliberate user decision; acceptable, see cue checks in section 2) |

---

## 2. New findings: (a) spine gaps

- **[medium]** (a) Setup panel has no visible opener. The Information Architecture says "`P` or its control", and Focus order lists a "Setup panel opener", but no component in DESIGN.md Components and no control in any mock's strip provides it (strip = wordmark, tabs, toggle, `?`). A pointer-only moment has no way to open Setup, and the focus-order and `aria-expanded` text points at nothing (EXPERIENCE.md Information Architecture, Interaction Primitives Focus order). *Fix:* add one quiet strip control (gear or "Setup" pill, 38px like the help hint) with `aria-expanded`/`aria-controls`, a key-hint `P`, and place it in the focus order before the Help hint.
- **[medium]** (a) Unselected setup labels fail 4.5 in dark on the panel. The contrast table row "muted on chip" is chip over `bg` (4.69 / 4.64). Pool chips and setup segmented controls sit on the panel (`surface`): muted on chip-over-surface is 5.02 light and **4.00 dark** (22px italic, not large text). The instrument toggle on `bg` is fine (DESIGN.md Contrast; Pool chip, Setup segmented control). *Fix:* add the row "muted on chip over surface" and either use `ink` for unselected labels inside the panel in dark, or lower the dark chip overlay to about 5% white (check it reaches 4.5).
- **[medium]** (a) Clear-control position is ambiguous and one reading violates the spec's own rule. "At the right end of the bar" does not say inside or outside the track. The region defaults to the whole neck, so the accent region fill covers the entire track; a muted cross inside it is muted on accent: 3.33 light, **1.37 dark**, directly against "muted never on accent". The mock puts it outside the track on `bg` (5.23 / 5.90, passes), which is the safe reading (DESIGN.md Fret-region bar, Colors rules). *Fix:* state "placed just outside the track's right end, on `bg`"; if it ever sits over the fill, it takes `on-fill`.
- **[medium]** (a) The clear control's operability is unspecified. It is a 10px muted cross with no label: the spec gives no accessible name, no element type, no focus ring treatment, no place in the focus order (the list omits it), and no inert state when the region is already the whole neck. The accepted limit says only that the region is drag-only; it does not say the clear button is mouse-only, and a button is trivially focusable. Target size passes: hit area at least 28px against the 24px minimum of SC 2.5.8. Cross contrast on `bg` passes 3:1 (5.23 / 5.90). The mock has `role=button` and `aria-label="Clear fret region"` on an SVG `<g>`, with no tabindex (DESIGN.md Fret-region bar; EXPERIENCE.md Fret-region bar, Focus order). *Fix:* spec it as a real `<button>` named "Clear fret region", in the tab order right after the stepper, focus ring drawn around the 28px hit area (not the 10px glyph), hidden or `aria-disabled` when the region is the whole neck. State "mouse-set region, keyboard-clearable" so the limit is stated precisely.
- **[medium]** (a) Arrow-key shortcuts collide with native arrow behavior. The yield rule lets only Space/Enter yield to focused buttons; `Left`/`Right` yield only to text fields. With focus on a Mode tab, Instrument toggle or setup segment (all `tablist`/`radiogroup` patterns where arrows move selection), `Left`/`Right` in Explore will step voicings instead. Likewise the digit interval keys fire while focus is on a setup chip. Not a trap, but it makes the segmented controls keyboard-inconsistent (EXPERIENCE.md Shortcut rules, Yield). *Fix:* arrows and digits also yield when focus is inside a tablist, radiogroup or the Setup panel; or use roving arrows in segments and keep the shortcut only when focus is on the stepper, instrument or body.
- **[medium]** (a) Pointer focus-return targets a stop that has no function. "After a pointer click on a control, focus returns to the instrument" and the focus order lists "Instrument (one stop)", but note toggling is pointer-only by decision, so the stop has no keyboard behavior, no defined focus-ring look (ring around an entire SVG?), and no name. It also pulls focus out of the non-modal Setup panel on every pool-chip click, contradicting "focus enters on open and returns to the opener on close" (EXPERIENCE.md Yield, Focus order, Setup panel). *Fix:* return focus to a non-tabbable app container (`tabindex=-1`), drop the Instrument from the tab order (or give it a purposeful name such as "Piano, pointer only" and a ring), and exempt clicks inside the panel from the return.
- **[low]** (a) The Status note's `Undo` button is not in the focus order, and "Notes cleared" and the offscreen-lit notes are not in the live-region list (which names only audio-blocked and no-voicing). The Esc-clear undo is therefore unreachable by keyboard and unannounced (EXPERIENCE.md Focus order, Accessibility Floor live regions). *Fix:* put the Status note's button right after the Instrument in the order; add "Notes cleared" and the offscreen count to live region 4.
- **[low]** (a) Focus after state changes is still undefined: Reveal to Next (same element or a swapped one?), stepper hidden in the no-voicing state, and the focused stepper arrow becoming an inert `·` at the end of the list. Keyboard activation keeps focus in place by rule, so a focused element that is replaced drops focus to `body`. *Fix:* Reveal and Next are one button whose label changes; the end-state arrow stays focusable with `aria-disabled`; when the stepper hides, focus moves to the Fretboard container or the Status note.
- **[low]** (a) Pool chips: the last ticked chip "cannot be unticked" has no stated cue (the click silently does nothing). *Fix:* `aria-disabled` on the last chip plus a one-line Status note ("Keep at least one interval.").
- **[low]** (a) Space/Enter yield means that in Listen a keyboard user who tabbed onto any button gets Space = activate that button, not "Play again" (and Enter on a focused interval button re-guesses rather than Reveals). That is standard but surprising next to the key map. *Fix:* one line in the Help hint list: "Space and Enter act on the focused button."
- **[low]** (a) The clear control's visual (a muted cross) is the same glyph as the muted-string `x` on the fretboard. Different place and size, so little confusion in practice. *Fix:* none required; keep the clear one thinner and outside the neck, as in the mock.

### Cue checks requested

- **Wrong-guess interval without colour: sufficient.** Cues: inset 2px muted ring (muted vs wrong 4.15 / 3.92, meets 3:1; ring vs `bg` 5.23 / 5.90), label strikethrough, disabled state (`aria-disabled`, still focusable), the Readout hint in words (`m3 is not it — try another.`), and a live-region message. Four independent non-colour cues remain after dropping the corner cross; the cross was redundant. Residual: give the button an accessible name with state (`minor third, tried`), which the spec only implies. The mock's `opacity:.75` on the struck label is undocumented but still passes (5.23 light / 5.75 dark).
- **Pool chip on/off without the check glyph: sufficient for this user, weakest of the controls.** Cues: fill (accent vs chip 1.51 light, 5.47 dark), text step (`on-fill` on accent 8.18 / 8.28 vs `muted` on chip 5.02 / 4.00), weight 400 to 600. In light theme the fill step is small (1.51), so weight and text darkness carry it; 2.46 / 2.23 separation between ink and muted text is real but not strong. The deliberate decision stands; mark `aria-checked`. This is why the 4.00 dark contrast in the medium finding above matters: that unselected label is the "off" state.
- **Tab native + `M`: fine.** `M` has no conflict with browser chrome; Tab traversal order is defined; the old trap is gone.
- **Shortcut-yield rule:** correct in intent; see the arrow-key and focus-return findings above for the gaps.

## 3. New findings: (b) mock issues

- **[medium]** (b) The Setup panel is now 560px wide at `right:44px; top:96px`, covering x 676 to 1236 over the instrument, the right half of the Readout question and, by CSS arithmetic (about 560px tall panel), probably the Reveal button in the centered control row. A focused Reveal or Play again under the panel is hidden by author content (SC 2.4.11 Focus Not Obscured). Placement is PROPOSED in the spine. *Fix:* when the panel is open, scroll or dock it so the control row stays visible; or note the placement as unresolved for a11y until the user views it (listen mock `.pn`).
- **[low]** (b) The wrong ring and the panel edge are `inset box-shadow` in the mocks (3 shadows per file), while DESIGN.md Elevation says rings and edges are outline or border so they survive forced-colors. Mock only; the spine is correct. *Fix:* leave, but note it in the mock header or switch to `outline:2px solid; outline-offset:-2px`.
- **[low]** (b) The clear control in the guitar mock is a `<circle fill="none">` inside a `<g>`: an unfilled circle is not hit-testable, so the 28px hit area is not real, and the `<g>` has no tabindex. *Fix:* `fill:transparent` or `pointer-events:all`, and a real button in the build.
- **[low]** (b) Mocks remain `<span>`-built visual references (no `<button>`s, no groups); the headers say "spines win" but not "do not copy structure". *Fix:* one comment line.

## 4. Still-open carry-overs from pass one (not new)

- **[medium]** (a) Dark piano markers: ink outline vs the 80% role tint is 2.36 root, 1.92 3rd, 2.27 5th, 2.51 7th, so the marker boundary fails 3:1 against its own tinted key (DESIGN.md Shapes, Contrast; mock `.tint{opacity:.8}` unchanged). *Fix:* lower the tint to about 25% in dark, or outline markers with `on-fill-dark`.
- **[low]** (a) `keyline` is the only white-key and fret-wire boundary (1.31 / 1.26) yet "decorative only". *Fix:* `muted` for edges, keyline for the rest.
- **[low]** (a) SC 2.1.4 single-key shortcuts have no off switch; cheap to meet with a Setup toggle, or scope to app focus. Impact for one user is small.
- **[low]** (a) Type tokens in px ignore the browser default font size; use rem, keep ratios.
- **[low]** (a) `color-scheme` and manual theme applied before first paint to avoid a light flash in dark.
- **[low]** (a) No volume or mute control in Setup.

## 5. (c) Accepted limits that are stated (no action)

Stated in EXPERIENCE.md Accessibility Floor, "Accepted limits": pointer-only note toggling, drag-only fret region, no reflow or small-screen support, Listen requires hearing, screen reader best-effort, italics deliberate, sound on press. One cheap note worth keeping in mind: "unsupported below 1280x800" matters because a 1080p laptop at 150% scaling gives roughly 1280x590 of usable viewport; stating "the page scrolls rather than clips" would cost one line and avoids hidden controls. This is the user's call; it is recorded, not a finding.

---

## Top items to fix, in order

1. Add a visible Setup opener.
2. Spec the clear control as a focusable, named button outside the track, with an inert state.
3. Add the "muted on chip over surface" row and fix dark unselected labels in the panel.
4. Resolve arrow/digit shortcut yield inside tablists, radiogroups and the panel, and fix the focus-return target.
5. Dark piano marker outline vs tint (carry-over, medium).
