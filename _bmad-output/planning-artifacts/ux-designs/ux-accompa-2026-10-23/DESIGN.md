---
name: accompa
description: A soft, italic, pastel music-theory practice tool for one guitarist at a laptop. Pebble direction, Rose Quartz theme, light primary with a dark twin.
status: final
updated: 2026-10-23
sources:
  - _bmad-output/planning-artifacts/prds/prd-accompa-2026-10-22/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-accompa-2026-10-23/ARCHITECTURE-SPINE.md
colors:
  bg: '#FDF1E8'
  surface: '#FFFAF5'
  ink: '#2C2A2B'
  muted: '#6F635D'
  keyline: '#EFD9CC'
  accent: '#F3B5B0'
  action: '#F6D0A8'
  interval-tint: '#F8E1DC'
  wrong: '#E6D6DD'
  role-root: '#F29D95'
  role-third: '#F5D08C'
  role-fifth: '#A9D8B8'
  role-seventh: '#C7B1E6'
  key-black: '#4A4547'
  key-edge: '#4A4547'
  focus: '#2C2A2B'
  on-fill: '#2C2A2B'
  chip: '#0000000D'
  bg-dark: '#272022'
  surface-dark: '#342A2D'
  ink-dark: '#F3E7E2'
  muted-dark: '#A89A9C'
  keyline-dark: '#46393D'
  accent-dark: '#E9A8A6'
  action-dark: '#E3BC8F'
  interval-tint-dark: '#3D2E32'
  wrong-dark: '#4A3A44'
  role-root-dark: '#EE9F98'
  role-third-dark: '#E5C58A'
  role-fifth-dark: '#8CC5A0'
  role-seventh-dark: '#B9A5DC'
  key-black-dark: '#170F11'
  key-edge-dark: '#A89A9C'
  focus-dark: '#F3E7E2'
  on-fill-dark: '#241E20'
  chip-dark: '#FFFFFF14'
typography:
  wordmark:
    fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif"
    fontSize: 30px
    fontWeight: 600
  readout:
    fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif"
    fontSize: 84px
    fontWeight: 600
    lineHeight: 1.05
  readout-question:
    fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif"
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.05
  hint:
    fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif"
    fontSize: 22px
    fontWeight: 400
  legend:
    fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif"
    fontSize: 20px
    fontWeight: 400
  mode:
    fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif"
    fontSize: 24px
    fontWeight: 400
  segment:
    fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif"
    fontSize: 22px
    fontWeight: 400
  button:
    fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif"
    fontSize: 26px
    fontWeight: 400
  interval-label:
    fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif"
    fontSize: 28px
    fontWeight: 600
  note-label:
    fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif"
    fontSize: 20px
    fontWeight: 400
  key-hint:
    fontFamily: "system-ui, 'Segoe UI', sans-serif"
    fontSize: 15px
    fontWeight: 600
    letterSpacing: 0.04em
  key-hint-small:
    fontFamily: "system-ui, 'Segoe UI', sans-serif"
    fontSize: 14px
    fontWeight: 600
    letterSpacing: 0.04em
rounded:
  key-black: 9px
  key: 12px
  interval: 22px
  full: 999px
spacing:
  mode-gap: 8px
  toggle-gap: 2px
  toggle-padding: 5px
  readout-gap: 14px
  interval-gap: 10px
  control-gap: 18px
  control-top: 26px
  strip-height: 84px
  strip-padding-x: 44px
  body-padding: 20px 56px 44px
  mode-padding: 10px 26px
  segment-padding: 8px 24px
  button-padding: 14px 38px
  interval-padding: 18px 0 12px
  help-size: 38px
  focus-ring-width: 2px
  focus-ring-offset: 2px
  key-edge-width: 1.5px
components:
  mode-strip:
    backgroundColor: '{colors.bg}'
    height: '{spacing.strip-height}'
    padding: '{spacing.strip-padding-x}'
  mode-tab:
    textColor: '{colors.muted}'
    typography: '{typography.mode}'
    rounded: '{rounded.full}'
    padding: '{spacing.mode-padding}'
  mode-tab-selected:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.on-fill}'
    typography: '{typography.mode}'
    rounded: '{rounded.full}'
    padding: '{spacing.mode-padding}'
  instrument-toggle:
    backgroundColor: '{colors.chip}'
    rounded: '{rounded.full}'
    padding: '{spacing.toggle-padding}'
  instrument-toggle-selected:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.on-fill}'
    typography: '{typography.segment}'
    rounded: '{rounded.full}'
    padding: '{spacing.segment-padding}'
  help-hint:
    backgroundColor: '{colors.chip}'
    textColor: '{colors.muted}'
    rounded: '{rounded.full}'
    size: '{spacing.help-size}'
  setup-opener:
    backgroundColor: '{colors.chip}'
    textColor: '{colors.muted}'
    rounded: '{rounded.full}'
    size: '{spacing.help-size}'
  readout:
    textColor: '{colors.ink}'
    typography: '{typography.readout}'
  role-legend:
    textColor: '{colors.muted}'
    typography: '{typography.legend}'
  piano-keyboard:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.muted}'
    rounded: '{rounded.key}'
  piano-key-black:
    backgroundColor: '{colors.key-black}'
    rounded: '{rounded.key-black}'
  fretboard:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.muted}'
    rounded: '{rounded.key}'
  role-marker:
    backgroundColor: '{colors.role-root}'
    textColor: '{colors.ink}'
  action-button:
    backgroundColor: '{colors.chip}'
    textColor: '{colors.ink}'
    typography: '{typography.button}'
    rounded: '{rounded.full}'
    padding: '{spacing.button-padding}'
  action-button-primary:
    backgroundColor: '{colors.action}'
    textColor: '{colors.on-fill}'
    typography: '{typography.button}'
    rounded: '{rounded.full}'
    padding: '{spacing.button-padding}'
  interval-button:
    backgroundColor: '{colors.interval-tint}'
    textColor: '{colors.ink}'
    typography: '{typography.interval-label}'
    rounded: '{rounded.interval}'
    padding: '{spacing.interval-padding}'
  interval-button-wrong:
    backgroundColor: '{colors.wrong}'
    textColor: '{colors.ink}'
    typography: '{typography.interval-label}'
    rounded: '{rounded.interval}'
  voicing-stepper:
    textColor: '{colors.ink}'
    typography: '{typography.hint}'
  fret-region-bar:
    backgroundColor: '{colors.chip}'
    textColor: '{colors.muted}'
    rounded: '{rounded.full}'
  setup-panel:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.interval}'
  pool-chip:
    backgroundColor: '{colors.chip}'
    textColor: '{colors.muted}'
    typography: '{typography.segment}'
    rounded: '{rounded.full}'
  pool-chip-selected:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.on-fill}'
    typography: '{typography.segment}'
    rounded: '{rounded.full}'
  setup-segmented:
    backgroundColor: '{colors.chip}'
    rounded: '{rounded.full}'
    padding: '{spacing.toggle-padding}'
  setup-label:
    textColor: '{colors.muted}'
    typography: '{typography.legend}'
  status-note:
    textColor: '{colors.muted}'
    typography: '{typography.hint}'
  key-hint:
    textColor: '{colors.muted}'
    typography: '{typography.key-hint}'
  focus-ring:
    outlineColor: '{colors.focus}'
    outlineWidth: '{spacing.focus-ring-width}'
    outlineOffset: '{spacing.focus-ring-offset}'
---

## Brand & Style

accompa is a tool, not an instrument: flat, graphic, no skeuomorphism, no realistic piano or fretboard. The chosen direction is **Pebble**: soft and rounded, pill-shaped controls filled with pastel tints, large radii, no hard borders. Italic serif type does the personality work and keeps the app approachable. The target feeling for Apor at his desk is in control, satisfied, relaxed. The instrument is the hero of every screen; everything else is a quiet strip, a readout, and a few pills around it.

Theme: **Rose Quartz**, light primary (cream background, very dark gray text) with a dark twin. Theme follows the system setting with a manual switch (EXPERIENCE.md).

Exploration record (kept, not normative): [`.working/directions-1.html`](.working/directions-1.html) (four directions; Pebble chosen) and [`.working/color-themes-1.html`](.working/color-themes-1.html) (five themes; Rose Quartz chosen). The tokens above supersede the values those files render, which still show the rejected blue 5th and the old tritone label `TT`.

Precedence between these spines, the mocks and the wireframe is stated once, in EXPERIENCE.md Foundation (spines win).

## Colors

Every color has a light token and a `-dark` twin of the same name; dark mode swaps the twin in. Values live in the frontmatter only.

- **bg** and **surface**: the page canvas and the "white" piano keys, fretboard slab and setup panel.
- **ink** and **muted**: primary text (and role outlines and rings), and secondary text (octave and string labels, unselected tabs, muted-string cross, wrong-guess ring).
- **keyline**: fret wires and white-key edges. Decorative only.
- **accent** (blush): the single selected-state fill, used identically on the selected mode tab, the selected Piano|Guitar segment, selected pool chips and every other segmented control. Nothing else uses it (plus the proposed fret-region fill, [ASSUMPTION]).
- **action** (apricot): the one emphasized action button in a row (Block in Explore, Reveal in Listen).
- **interval-tint** and **wrong**: resting fill of an interval answer button, and fill of a wrongly guessed one.
- **role-root, role-third, role-fifth, role-seventh**: chord-role fills on piano keys and fretboard markers. The 5th is green, which replaced the original blue 5th at the user's request; the exact green is Sally's pick under delegation.
- **key-black** and **key-edge**: black piano keys, and the 1.5px edge drawn around them. In light the edge equals the key; in dark it is a light edge that separates black keys from the dark "white" keys.
- **focus**: the focus ring color (ink, both themes). See Components, Focus ring.
- **on-fill**: text on accent and action fills.
- **chip**: a translucent overlay (5% black light, 8% white dark): resting fill of unselected toggles, buttons, pool chips, the help hint and the Setup opener.

Rules:

- Pastels are fill-only and never text; text is always ink, muted or on-fill.
- Muted text never sits on action or accent fills.
- Role is never color alone: see Shapes.
- Green is allowed for the 5th and may appear elsewhere, but not as the fill of mode tabs (user constraint).
- Root coral and blush accent are close; the user accepted this as is, because shape and position separate them (root marker sits on the instrument, accent fills sit on the strip, panel and controls).

### Contrast (computed with `python -I`, WCAG 2.x relative luminance; overlays alpha-composited)

| Pair | Light | Dark | Use |
|---|---|---|---|
| ink on bg | 12.85 | 13.18 | body and readout text (pass) |
| ink on surface | 13.74 | 11.44 | text and role outlines on instrument (pass) |
| muted on bg | 5.23 | 5.90 | secondary text (pass) |
| muted on surface | 5.59 | 5.13 | octave and string labels (pass) |
| muted on chip | 4.69 | 4.64 | unselected tab, segment, pool chip labels (pass) |
| on-fill on accent | 8.18 | 8.28 | selected tab, segment, chip text (pass) |
| on-fill on action | 9.85 | 9.25 | primary action text (pass) |
| ink on interval-tint | 11.40 | 10.60 | interval labels (pass) |
| ink on wrong | 10.20 | 8.76 | wrong-guess label (pass) |
| muted on wrong | 4.15 | 3.92 | ring only, not text (meets 3:1 non-text) |
| muted on action | 4.01 | 1.53 | forbidden: never muted on action or accent |
| **focus ring (ink) on bg** | 12.85 | 13.18 | focus ring (pass 3:1) |
| **focus ring (ink) on surface** | 13.74 | 11.44 | focus ring on instrument and panel (pass) |
| ink on accent | 8.18 | 1.63 | why the ring sits outside the control (dark inside-ring fails) |
| ink on action | 9.85 | 1.46 | same |
| key-black on surface | 9.06 | 1.36 | black vs white keys: fill alone fails 3:1 in dark |
| **key-edge on surface** | 9.06 | 5.13 | dark black-key edge vs white key (pass 3:1) |
| **key-edge on key-black** | n/a (same color) | 6.98 | dark black-key edge vs key fill (pass) |
| keyline on surface | 1.31 | 1.26 | decorative edge, intentionally low |
| role-root on surface | 2.02 | 6.63 | non-text |
| role-third on surface | 1.42 | 8.37 | non-text |
| role-fifth on surface | 1.53 | 7.00 | non-text |
| role-seventh on surface | 1.86 | 6.26 | non-text |
| role-root on accent | 1.20 | 1.06 | accepted (shape and position separate them) |
| **Setup opener glyph: muted on chip over bg (rest) / ink on chip over bg (open)** | 4.68 / 11.50 | 4.69 / 10.48 | non-text glyph, needs 3:1 (pass); muted on bg alone is 5.23 / 5.90 |
| **key-hint, new: muted solid on bg / chip / interval-tint / surface** | 5.23 / 4.69 / 4.64 / 5.59 | 5.90 / 4.64 / 4.75 / 5.13 | all pass 4.5 |
| **key-hint, new: on-fill solid on action** | 9.85 | 9.25 | pass |
| **key-hint on a wrong button: ink solid** | 10.20 | 8.76 | pass (muted fails there) |

Ink at 60% opacity for key hints failed 4.5 in light and was replaced by solid colors.

Honest failures: in **light** theme every role fill fails 3:1 against surface (1.42 to 2.02), and in **dark** the black key fill fails against the white keys (1.36). Role meaning is therefore carried by shape and outline: every role marker has a 1.8px ink outline (13.74 / 11.44 on surface). Black keys are separated by `key-edge` in dark (5.13 and 6.98). **Accepted limit (user decision):** the unselected pool chip and setup segment labels, muted on chip over the panel surface, are 4.00 in dark (5.02 light), under 4.5 for 22px text; on/off still relies on fill, text color step and weight 600. Selected pill vs unselected neighbours is carried by fill plus weight 600, not contrast alone (accent vs bg is 1.57 light).

## Typography

Face: the mocks rendered the **Palatino** stack (the `fontFamily` of every serif token) as a system fallback. No web font was rendered or confirmed. The Palatino stack is the v1 font stack (decided by the user). Fraunces vs Newsreader Italic is a later swap behind the typography tokens; if a web font is chosen, load its true italic.

Style: everything is **italic** (the user wanted "lots of italic styling"; deliberate, see Accessibility Floor in EXPERIENCE.md), with weight 600 for `wordmark`, `readout`, selected states and `interval-label`. Exception: `key-hint` (shortcut caps such as `Enter`, `Space`) is non-italic system sans, so a key reads as a key. Key hints are **solid color, no opacity** (see Contrast): `muted` on bg, chip, interval-tint and surface; `on-fill` on the action fill; `ink` on a wrong button. Inside interval buttons use `key-hint-small`.

Ramp: the typography tokens are the ramp; `readout-question` is the Listen question size. Guitar-snippet text sizes in the mock were drawn at a different frame scale and are not reproduced. Tune guitar-view type sizes at build against the full 1280 x 800 canvas.

## Layout & Spacing

Pixel values are from a **1280 x 800 design canvas** (the mocks render it 1:1). **Target: laptop.** Landscape tablets at about the canvas width are acceptable but not designed or tested for. No reflow and no small-screen optimization: the layout is not rearranged below the canvas, there is no mobile or portrait layout, and no minimum viewport number is set (behavior below the canvas is unspecified and unsupported). One screen, no scrolling, at the canvas size.

Top to bottom: a slim **mode strip** ({spacing.strip-height}, side padding {spacing.strip-padding-x}) holding the wordmark, the Listen / Explore modes (gap {spacing.mode-gap}), the Piano|Guitar toggle pushed right, then the Setup opener and the help hint at the far right (opener just left of the hint). Below, the body (padding {spacing.body-padding}): readout centered ({typography.readout}) with the role legend under it (gap {spacing.readout-gap}), the instrument filling the remaining height and horizontally centered, then a centered control row (gap {spacing.control-gap}, top {spacing.control-top}). In Listen, a row of 12 interval buttons sits at the bottom (gap {spacing.interval-gap}).

The guitar view adds a voicing stepper and a fret-region bar around the fretboard ([wireframe frame 3](wireframes/flow-build-chord-2026-10-23.excalidraw); [guitar mock](mockups/key-explore-guitar.html)); exact placement beyond what the wireframe shows is not specified. **Setup panel placement is accepted by the user:** the [Listen and setup mock](mockups/key-listen-setup.html) shows it anchored under the strip at the right, a 560px floating overlay on the instrument's right edge; it may cover part of the readout and Reveal while open (accepted limit). The Listen arrangement around it is accepted by the user. The panel uses existing tokens only (surface, {rounded.interval}).

The piano shows three octaves; `[` and `]` move by octave (EXPERIENCE.md).

## Elevation & Depth

Flat. No shadows, no gradients, no hard borders. Depth is tonal: surface on bg, chip overlays on both. The only "edge" treatments are keyline (white-key edge, fret wires, 1.5 to 2px), the dark-theme `key-edge` on black keys ({spacing.key-edge-width}) and the 7px ink nut. The wrong-guess button adds an inset 2px muted ring so state is not carried by fill alone. Rings and edges are drawn as outline or border, not box-shadow, so they survive forced-colors modes.

## Shapes

Pill ({rounded.full}) for modes, toggle segments, action buttons, pool chips, the help hint and Setup opener (circles) and the fret-region bar. {rounded.interval} for interval buttons. {rounded.key} for piano keys and the fretboard slab, {rounded.key-black} for black keys. Large radii everywhere; nothing sharp.

**Role markers** (the second channel, mandatory with the fill):

| Role | Shape |
|---|---|
| root | circle, ringed and filled (outer ring in ink, fill {colors.role-root}) |
| 3rd | diamond, fill {colors.role-third} |
| 5th | square, fill {colors.role-fifth} |
| 7th | triangle, fill {colors.role-seventh} |
| no role (unresolved set, extension, Listen reveal note) | small solid ink dot, no fill color |

All colored shapes use a 1.8px ink outline and stay at least 18px. On piano, keys additionally carry an 80%-opacity tint of the role fill with the marker on top. **Open string** = the role shape inside a ring at the nut (user-approved). Muted strings are a cross (`x`) in muted. The no-role dot is [ASSUMPTION] (added after the accessibility review so a lit note never relies on color alone).

Stroke widths, opacities and state treatments given as prose values (for example the 1.8px outline, 80% tint, 70% strings) are not tokenized; builders may extract them into tokens at build time.

## Components

Names are identical in EXPERIENCE.md Component Patterns. Illustrations: [Explore, piano](mockups/key-explore-piano.html) (C major 7 built; root ringed and filled, 3rd diamond, 5th square green, 7th triangle; light and dark); [Explore, guitar](mockups/key-explore-guitar.html) (same chord as a fretboard voicing, then the no-voicing state); [Listen with setup panel](mockups/key-listen-setup.html) (Listen layout accepted by the user; panel placement accepted; opener shown pressed). Where a mock differs from this file, this file wins. The mocks' visual render is unchecked: the designer never viewed them in a browser.

- **Mode strip** — {spacing.strip-height} tall (use as a minimum, not a fixed height), {colors.bg}, no border. Holds wordmark, Mode tabs, Instrument toggle, Setup opener, Help hint.
- **Mode tab** — pill, {typography.mode}, {colors.muted} text at rest. Selected: fill {colors.accent}, text {colors.on-fill}, weight 600 (`mode-tab-selected`).
- **Instrument toggle** — pill track filled {colors.chip}, segments {typography.segment}. Selected segment uses the same fill, text and weight as a selected Mode tab (`instrument-toggle-selected`). This is the single selected-state treatment for every segmented control.
- **Help hint** — circular {spacing.help-size} chip, italic `?` in {colors.muted}. On hover or focus it reveals the shortcuts list (the list is its content, not a separate component).
- **Setup opener** — circular {spacing.help-size} chip, same treatment as the Help hint (`setup-opener`: {colors.chip} fill, {colors.muted} glyph, {rounded.full}), holding a simple gear-like glyph (inline SVG, about 22px, 1.8px stroke). It sits in the corner just left of the Help hint, in every mode and both instruments. Quiet: no loud fill. Open state (`aria-expanded` true): glyph in {colors.ink} with a heavier 2.4px stroke, same chip fill (not the accent fill). Accessible name `Setup`; real button; standard focus ring. Contrast of the glyph is in the table (4.68 / 4.69 at rest; non-text, needs 3:1).
- **Readout** — chord name or interval name, {typography.readout}, centered. Alternative readings sit beneath as small italic text.
- **Role legend** — a line under the readout: marker shape plus italic label (`root C`, `3rd E`, `5th G`, `7th`), {typography.legend}.
- **Piano keyboard** — three octaves, white keys {colors.surface} with {colors.keyline} edge ({spacing.key-edge-width}), black keys (`piano-key-black`, {colors.key-black}; in dark with a {spacing.key-edge-width} {colors.key-edge-dark} edge), radii {rounded.key} / {rounded.key-black}. Octave labels (C3, C4, C5) in {typography.note-label}. Lit keys show the role tint and marker. Black keys win hit-testing inside their rectangle.
- **Fretboard** — {colors.surface} slab, {rounded.key}; fret wires {colors.keyline} 2px, 7px {colors.ink} nut, strings {colors.ink} at 70%, string names left, fret numbers below, open (role shape in a ring at the nut) and muted (`x`) markers.
- **Role marker** — the shapes above, filled with the role color.
- **Action button** — pill {typography.button} on {colors.chip} with a key-hint cap beside the label. The one primary action per row uses {colors.action} fill and weight 600 (`action-button-primary`). The Next button (after Reveal) is an Action button in the primary slot.
- **Interval button** — {rounded.interval}, {colors.interval-tint}, interval label {typography.interval-label} over a key-hint cap (`1` to `=`, {typography.key-hint-small}). Wrong state (`interval-button-wrong`): {colors.wrong} fill, inset 2px {colors.muted} ring, label struck through (no corner cross, by decision); it is disabled. Pool-excluded: shown disabled, dimmed to no less than 55% opacity [ASSUMPTION; the mock uses 40%, which reads too faint].
- **Voicing stepper** — `◀ Voicing 1 of N ▶`, {typography.hint}; arrows step. Arrow targets are at least 40 x 40px (pill chip style like the help hint). At the ends the arrow is replaced by `·` and is inert (no wrap). No shape label (user decision).
- **Fret-region bar** — a bar over the fret numbers; drag across frets to set the region; a small clear control restores the whole neck. It sits **outside the track, to the right of the bar, on the page background** (muted cross on bg is 5.23 light / 5.90 dark; it never sits over the region fill, where muted on accent fails). It is a quiet {colors.muted} cross, about 10px, with no fill and no label, so it does not compete with the bar (it was a loud 38px chip in the stepper row before). It is a real button (accessible name `Clear fret region`) with the standard focus ring drawn around its hit area, not the 10px glyph; the hit area stays at least 28px. When the region is already the whole neck it is disabled and looks the same. The region defaults to the whole neck. [ASSUMPTION] Visual treatment (pill track {colors.chip}, region fill {colors.accent}) is inferred; the wireframe shows it as an outline only. Text on the fret-region fill is {colors.on-fill}, not ink.
- **Setup panel** — on-demand panel, {colors.surface}, non-modal, 560px wide floating overlay at the right under the strip (placement accepted by the user). Opened and closed by the Setup opener (the gear icon) or `P`. Inner controls are components:
  - **Pool chip** — one per interval (m2 to P8); `pool-chip` at rest, `pool-chip-selected` when in the pool (accent fill, ink text and weight 600; no check glyph, by decision). On/off is carried by fill, text color and weight, not fill alone. The last ticked chip cannot be unticked [ASSUMPTION]; it carries `aria-disabled`, stays focusable, and shows a non-colour cue (see EXPERIENCE.md Pool chip). Accepted limit (user): dark unselected chip label, muted on chip over the panel surface, is 4.00 (light 5.02), under 4.5 for 22px text; on/off still relies on fill, text color step and weight.
  - **Setup segmented control** — `setup-segmented`, reuses the selected treatment of `instrument-toggle-selected`. Used for Direction (Ascending, Descending, Harmonic), Root (Random, Fixed), Sound (Synthesized, v1 only) and Theme (System, Light, Dark).
  - **Setup label** — {typography.legend} in {colors.muted} above each group, associated to its control.
- **Status note** — quiet italic line in {colors.muted}, {typography.hint}, for `No voicing fits here. Try widening the region.`, `Press any key to wake the sound.`, the offscreen-lit-notes indicator and the clear-undo line. Contains an inline button (`Undo`) in the last case.
- **Key hint** — {typography.key-hint} cap shown inside buttons and in the shortcuts list; solid colors per Typography.
- **Focus ring** — `focus-ring`: {spacing.focus-ring-width} {colors.focus} outline with a {spacing.focus-ring-offset} gap, drawn **outside** the control on `:focus-visible`. It sits outside because inside it fails on accent and action in dark (see Contrast). For SVG keys and frets draw it as an element, not a box-shadow. Selected state is a separate, additional cue.

## Do's and Don'ts

| Do | Don't |
|---|---|
| One selected-state treatment: accent fill, on-fill text, weight 600 | A different selected look per control (the rejected inconsistency) |
| Encode role by shape and color together | Rely on pastel fill alone; it fails 3:1 in light theme |
| Use pastels as fills only | Use any pastel as text color |
| Keep controls pill-shaped and borderless | Add hard borders, shadows or gradients |
| Keep the instrument the largest element | Let strip or panels compete with the instrument |
| Put the shortcut cap on every keyboard-reachable control, solid color | Hide shortcuts only in a menu, or fade caps with opacity |
| Draw the focus ring outside the control | Draw it inside; it vanishes on accent and action in dark |
| Use green for the 5th and non-mode accents | Fill Explore or Listen mode tabs with green |
| Mark a wrong guess with ring and strike as well as fill | Mark it by fill alone |
| Give dark black keys an edge | Rely on black vs dark-white fill (1.36) |
