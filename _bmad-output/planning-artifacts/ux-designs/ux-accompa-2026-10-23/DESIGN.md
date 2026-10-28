---
name: accompa
description: A soft, italic, pastel music-theory practice tool for one guitarist at a laptop. Pebble direction, Rose Quartz theme, light primary with a dark twin.
status: final
updated: 2026-10-28
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
  role-ninth: '#D6B9EA'
  role-fourth: '#9ED6D8'
  role-sixth: '#D3DE9A'
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
  role-ninth-dark: '#B896D0'
  role-fourth-dark: '#7FBFC2'
  role-sixth-dark: '#B5C27A'
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
  rail-label:
    fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif"
    fontSize: 17px
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
  chip-label:
    fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif"
    fontSize: 17px
    fontWeight: 400
  chord-chip:
    fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif"
    fontSize: 26px
    fontWeight: 600
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
  cell: 11px
  rail-item: 14px
spacing:
  toggle-gap: 2px
  toggle-padding: 5px
  rail-width: 64px
  rail-width-open: 200px
  rail-item-size: 44px
  rail-toggle-size: 36px
  rail-pair-size: 30px
  rail-gap: 6px
  cell-size: 50px
  cell-gap: 4px
  chip-width: 58px
  chip-gap: 5px
  chip-group-gap: 16px
  circle-size: 560px
  chord-chip-gap: 10px
  readout-gap: 14px
  interval-gap: 10px
  control-gap: 18px
  control-top: 26px
  body-padding: 20px 56px 44px
  segment-padding: 8px 24px
  button-padding: 14px 38px
  interval-padding: 18px 0 12px
  focus-ring-width: 2px
  focus-ring-offset: 2px
  key-edge-width: 1.5px
components:
  side-rail:
    backgroundColor: '{colors.surface}'
    width: '{spacing.rail-width}'
    rounded: '{rounded.rail-item}'
  side-rail-open:
    backgroundColor: '{colors.surface}'
    width: '{spacing.rail-width-open}'
    rounded: '{rounded.rail-item}'
  rail-item:
    textColor: '{colors.muted}'
    typography: '{typography.rail-label}'
    rounded: '{rounded.rail-item}'
    size: '{spacing.rail-item-size}'
  rail-item-selected:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.on-fill}'
    typography: '{typography.rail-label}'
    rounded: '{rounded.rail-item}'
    size: '{spacing.rail-item-size}'
  instrument-toggle:
    backgroundColor: '{colors.chip}'
    rounded: '{rounded.full}'
    padding: '{spacing.toggle-padding}'
  instrument-toggle-selected:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.on-fill}'
    typography: '{typography.rail-label}'
    rounded: '{rounded.rail-item}'
    size: '{spacing.rail-toggle-size}'
  help-hint:
    backgroundColor: '{colors.chip}'
    textColor: '{colors.muted}'
    rounded: '{rounded.full}'
    size: '{spacing.rail-pair-size}'
  setup-opener:
    backgroundColor: '{colors.chip}'
    textColor: '{colors.muted}'
    rounded: '{rounded.full}'
    size: '{spacing.rail-pair-size}'
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
  root-cell:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    typography: '{typography.button}'
    rounded: '{rounded.cell}'
    size: '{spacing.cell-size}'
  root-cell-selected:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.on-fill}'
    typography: '{typography.button}'
    rounded: '{rounded.cell}'
    size: '{spacing.cell-size}'
  quality-chip:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    typography: '{typography.chip-label}'
    rounded: '{rounded.cell}'
    width: '{spacing.chip-width}'
  quality-chip-selected:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.on-fill}'
    typography: '{typography.chip-label}'
    rounded: '{rounded.cell}'
    width: '{spacing.chip-width}'
  circle-wedge:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
  circle-wedge-related:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.ink}'
  circle-wedge-selected:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.on-fill}'
  chord-chip:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    typography: '{typography.chord-chip}'
    rounded: '{rounded.interval}'
  chord-chip-home:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.on-fill}'
    typography: '{typography.chord-chip}'
    rounded: '{rounded.interval}'
  scale-picker-selected:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.on-fill}'
    typography: '{typography.chip-label}'
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

accompa is a tool, not an instrument: flat, graphic, no skeuomorphism, no realistic piano or fretboard. The chosen direction is **Pebble**: soft and rounded, pill-shaped controls filled with pastel tints, large radii, no hard borders. Italic serif type does the personality work and keeps the app approachable. The target feeling for Apor at his desk is in control, satisfied, relaxed. The instrument is the hero of every screen; everything else is a quiet side rail, a readout, and a few pills around it.

Theme: **Rose Quartz**, light primary (cream background, very dark gray text) with a dark twin. Theme follows the system setting with a manual switch (EXPERIENCE.md).

Exploration record (kept, not normative): [`.working/directions-1.html`](.working/directions-1.html) (four directions; Pebble chosen) and [`.working/color-themes-1.html`](.working/color-themes-1.html) (five themes; Rose Quartz chosen). The tokens above supersede the values those files render, which still show the rejected blue 5th and the old tritone label `TT`.

Precedence between these spines, the mocks and the wireframe is stated once, in EXPERIENCE.md Foundation (spines win).

## Colors

Every color has a light token and a `-dark` twin of the same name; dark mode swaps the twin in. Values live in the frontmatter only.

- **bg** and **surface**: the page canvas and the "white" piano keys, fretboard slab and setup panel.
- **ink** and **muted**: primary text (and role outlines and rings), and secondary text (octave and string labels, unselected tabs, muted-string cross, wrong-guess ring).
- **keyline**: fret wires and white-key edges. Decorative only.
- **accent** (blush): the single selected-state fill, used identically on the selected rail item, the selected Piano|Guitar segment, selected pool chips and every other segmented control. It also marks the selected and related wedges of the circle, the home chord chip, the selected root cell and quality chip, and the selected minor-scale pill. Nothing else uses it.
- **action** (apricot): the one emphasized action button in a row (Block in Explore, Reveal in Listen, Try in the drill).
- **interval-tint** and **wrong**: resting fill of an interval answer button, and fill of a wrongly guessed one.
- **role-root, role-third, role-fifth, role-seventh, role-ninth, role-fourth, role-sixth**: chord-role fills on piano keys and fretboard markers. The 5th is green, which replaced the original blue 5th at the user's request; the exact green is Sally's pick under delegation.
- **role-ninth, role-fourth, role-sixth** (Phase 2): lilac for the 2nd or 9th, teal for the 4th, straw green for the 6th. Same use as the other role fills. Contrast and the lilac-versus-violet closeness are in Contrast.
- **key-black** and **key-edge**: black piano keys, and the 1.5px edge drawn around them. In light the edge equals the key; in dark it is a light edge that separates black keys from the dark "white" keys.
- **focus**: the focus ring color (ink, both themes). See Components, Focus ring.
- **on-fill**: text on accent and action fills.
- **chip**: a translucent overlay (5% black light, 8% white dark): resting fill of unselected toggles, buttons, pool chips, the help hint, the Setup opener and the minor-scale pills.

Rules:

- Pastels are fill-only and never text; text is always ink, muted or on-fill.
- Muted text never sits on action or accent fills.
- Role is never color alone: see Shapes.
- Green is allowed for the 5th and may appear elsewhere, but not as the fill of rail items (user constraint, carried over from the mode tabs).
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
| role-ninth on surface | 1.69 | 5.49 | non-text (new) |
| role-fourth on surface | 1.55 | 6.69 | non-text (new) |
| role-sixth on surface | 1.38 | 7.24 | non-text (new) |
| role-ninth vs role-seventh | 1.10 | 1.14 | near-identical hue; only the shape separates them (open item) |
| role-root on accent | 1.20 | 1.06 | accepted (shape and position separate them) |
| **Setup opener glyph: muted on chip over bg (rest) / ink on chip over bg (open)** | 4.68 / 11.50 | 4.69 / 10.48 | non-text glyph, needs 3:1 (pass); muted on bg alone is 5.23 / 5.90 |
| **key-hint, new: muted solid on bg / chip / interval-tint / surface** | 5.23 / 4.69 / 4.64 / 5.59 | 5.90 / 4.64 / 4.75 / 5.13 | all pass 4.5 |
| **key-hint, new: on-fill solid on action** | 9.85 | 9.25 | pass |
| **key-hint on a wrong button: ink solid** | 10.20 | 8.76 | pass (muted fails there) |

Ink at 60% opacity for key hints failed 4.5 in light and was replaced by solid colors.

Honest failures: in **light** theme every role fill fails 3:1 against surface (1.42 to 2.02), and in **dark** the black key fill fails against the white keys (1.36). Role meaning is therefore carried by shape and outline: every role marker has a 1.8px ink outline (13.74 / 11.44 on surface). Black keys are separated by `key-edge` in dark (5.13 and 6.98). **Accepted limit (user decision):** the unselected pool chip and setup segment labels, muted on chip over the panel surface, are 4.00 in dark (5.02 light), under 4.5 for 22px text; on/off still relies on fill, text color step and weight 600. Selected pill vs unselected neighbours is carried by fill plus weight 600, not contrast alone (accent vs bg is 1.57 light). Phase 2 adds three role fills that fail 3:1 in light as well (1.69, 1.55, 1.38) and pass in dark (5.49, 6.69, 7.24, computed 2026-10-28 against surface); they carry meaning through shape and the 1.8px outline, like the other roles. The lilac 2nd or 9th is within 1.10:1 of the violet 7th in light and 1.14:1 in dark, so only the pentagon-versus-triangle shape separates them; the dark values are computed but the colours were not looked at in a dark browser render.

## Typography

Face: the mocks rendered the **Palatino** stack (the `fontFamily` of every serif token) as a system fallback. No web font was rendered or confirmed. The Palatino stack is the v1 font stack (decided by the user). Fraunces vs Newsreader Italic is a later swap behind the typography tokens; if a web font is chosen, load its true italic.

Style: everything is **italic** (the user wanted "lots of italic styling"; deliberate, see Accessibility Floor in EXPERIENCE.md), with weight 600 for `wordmark`, `readout`, selected states and `interval-label`. Exception: `key-hint` (shortcut caps such as `Enter`, `Space`) is non-italic system sans, so a key reads as a key. Key hints are **solid color, no opacity** (see Contrast): `muted` on bg, chip, interval-tint and surface; `on-fill` on the action fill; `ink` on a wrong button. Inside interval buttons use `key-hint-small`.

Ramp: the typography tokens are the ramp; `readout-question` is the Listen question size. Guitar-snippet text sizes in the mock were drawn at a different frame scale and are not reproduced. Tune guitar-view type sizes at build against the full 1280 x 800 canvas.

## Layout & Spacing

Pixel values are from a **1280 x 800 design canvas** (the mocks render it 1:1). **Target: laptop.** Landscape tablets at about the canvas width are acceptable but not designed or tested for. No reflow and no small-screen optimization: the layout is not rearranged below the canvas, there is no mobile or portrait layout, and no minimum viewport number is set (behavior below the canvas is unspecified and unsupported). One screen, no scrolling, at the canvas size.

Left to right: a **side rail** ({spacing.rail-width} collapsed, {spacing.rail-width-open} open) and the body beside it. The rail replaces the old top strip, so there is no top bar and the body starts at the top of the canvas; the strip's 84px went back to the instrument. The rail holds, top to bottom: the wordmark (the italic `a` when collapsed) with a chevron toggle beside it, the four section items (Listen, Explore, Chord drill, Circle of fifths; icon only when collapsed, icon plus {typography.rail-label} label when open), then at the bottom the small Piano|Guitar toggle, a divider, and the gear and `?` side by side. The rail opens collapsed and its state is remembered (EXPERIENCE.md Persisted settings). Beside it the body (padding {spacing.body-padding}), per section:

- **Listen**: readout (the question, then the interval name) and a reserved hint row, instrument, control row (gap {spacing.control-gap}, top {spacing.control-top}), then the row of 12 interval buttons (gap {spacing.interval-gap}). The Listen readout block is its own, shorter height (question line, hint row and legend row, about 176px) instead of sharing Explore's 238px block, so the instrument is about 250px tall at 1280 x 800 (was 162px). **Changed rule:** the instrument's top edge no longer has to stay put between sections; it only has to stay put inside a section as notes and states change.
- **Explore**: readout ({typography.readout}) with other readings, voicing and inversion stepper row, role legend, the instrument (about 300px tall at 1280 x 800), then **one control line** holding Play, Block and the 12 root cells, with the 17 quality chips on the line under it, then the Status note. Play and Block shrink to 20px type and a 12px by 24px pad on that line so it fits 1152px.
- **Chord drill**: the chord name as the readout, a one-line hint, the role legend (only after the answer shows), the instrument, then Play with Try and Reveal (or Next). No builder; the instrument is the answer area.
- **Circle of fifths**: no instrument and no Piano|Guitar toggle. A {spacing.circle-size} circle centred in the body, the seven-chord row along the bottom, the minor-scale picker to the right of the circle for minor keys only.

The guitar view adds a voicing stepper around the fretboard ([wireframe frame 3](wireframes/flow-build-chord-2026-10-23.excalidraw); [guitar mock](mockups/key-explore-guitar.html)); exact placement beyond what the wireframe shows is not specified. **Setup panel placement:** the panel opens from the gear in the rail as a 560px floating overlay at the right edge of the body, on top of the instrument; it may cover part of the readout and Reveal while open (accepted limit). [ASSUMPTION] The earlier accepted anchor was under the top strip, which no longer exists; the right-edge overlay keeps the accepted size and floating behavior, and the exact anchor is a build-time choice. The Listen arrangement around it is accepted by the user. The panel uses existing tokens only (surface, {rounded.interval}). Full-page references for the Phase 2 sections: [Explore with the builder](mockups/chord-builder-explore.html), [Chord drill](mockups/chord-drill.html), [Circle of fifths](mockups/circle-page.html). The mocks are 1216 x 800 frames with the collapsed rail.

The piano shows three octaves; `[` and `]` move by octave (EXPERIENCE.md).

## Elevation & Depth

Flat. No shadows, no gradients, no hard borders. Depth is tonal: surface on bg, chip overlays on both. The only "edge" treatments are keyline (white-key edge, fret wires, 1.5 to 2px), the dark-theme `key-edge` on black keys ({spacing.key-edge-width}) and the 7px ink nut. The wrong-guess button adds an inset 2px muted ring so state is not carried by fill alone. Rings and edges are drawn as outline or border, not box-shadow, so they survive forced-colors modes.

## Shapes

Pill ({rounded.full}) for toggle segments, action buttons, pool chips, the minor-scale pills, the help hint and Setup opener (circles). {rounded.rail-item} for rail items and the rail itself, {rounded.cell} for root cells and quality chips, {rounded.interval} for interval buttons and the circle's chord chips. {rounded.key} for piano keys and the fretboard slab, {rounded.key-black} for black keys. Large radii everywhere; nothing sharp.

**Role markers** (the second channel, mandatory with the fill):

| Role | Shape |
|---|---|
| root | circle, ringed and filled (outer ring in ink, fill {colors.role-root}) |
| 3rd | diamond, fill {colors.role-third} |
| 5th | square, fill {colors.role-fifth} |
| 7th | triangle, fill {colors.role-seventh} |
| 2nd or 9th | regular pentagon, fill {colors.role-ninth} |
| 4th | hexagon (flat top), fill {colors.role-fourth} |
| 6th | five-point star (inner radius about 48% of outer), fill {colors.role-sixth} |
| no role (unresolved set, drill note while building) | small solid ink dot, no fill color; on a black key the dot and outline use {colors.surface} |

All colored shapes use a 1.8px ink outline and stay at least 18px (the star is drawn slightly larger, about 15px radius against 13px, so its points read). On piano, keys additionally carry an 80%-opacity tint of the role fill with the marker on top. **Open string** = the role shape inside a ring at the nut (user-approved). Muted strings are a cross (`x`) in muted. The no-role dot is [ASSUMPTION] (added after the accessibility review so a lit note never relies on color alone).

**Wrong-note cross (drill):** a note that is not in the asked chord is drawn as the no-role ring (surface fill, 1.8px outline) with a 2.6px ink cross through it, rounded caps, about 18px across. Shape, not color, carries it. On a black key the cross and ring use {colors.surface}.

**Fret position markers:** the fretboard carries standard inlay dots: one at frets 3, 5, 7 and 9, two at fret 12 (and the same pattern again if more frets are shown). Dots are about 18px across, filled {colors.muted} at about 35% opacity, centred between the wires, drawn under the strings and role markers. Decorative only.

Stroke widths, opacities and state treatments given as prose values (for example the 1.8px outline, 80% tint, 70% strings) are not tokenized; builders may extract them into tokens at build time.

## Components

Names are identical in EXPERIENCE.md Component Patterns. Illustrations: [Explore, piano](mockups/key-explore-piano.html) (C major 7 built; root ringed and filled, 3rd diamond, 5th square green, 7th triangle; light and dark; **top strip is superseded by the side rail**); [Explore, guitar](mockups/key-explore-guitar.html) (same chord as a fretboard voicing, then the no-voicing state; top strip superseded); [Listen with setup panel](mockups/key-listen-setup.html) (Listen layout accepted by the user; panel placement accepted; opener shown pressed; top strip superseded). Phase 2: [rail and icons](mockups/rail-icons.html) (collapsed and open, soft-fill icons), [Explore with the chord builder](mockups/chord-builder-explore.html) (builder, inversion stepper, new role shapes, both instruments), [Chord drill](mockups/chord-drill.html) (four states, both instruments), [Circle of fifths](mockups/circle-page.html). Where a mock differs from this file, this file wins. The mocks' visual render was checked in headless Chrome for layout only; the dark theme of the Phase 2 mocks was not reviewed by the designer.

- **Side rail** (`side-rail`, `side-rail-open`) — full-height panel on the left, {colors.surface}, {spacing.rail-width} collapsed and {spacing.rail-width-open} open, {rounded.rail-item} corners, no border. Collapsed by default. A chevron beside the wordmark toggles it (click only, no hover expansion). Collapsed it shows the italic `a` and icons only; open it shows the word `accompa` and icon plus label. Never scrolls away.
- **Rail item** (`rail-item`, `rail-item-selected`) — {spacing.rail-item-size} square when collapsed, full rail width and {spacing.rail-item-size} tall when open, {rounded.rail-item}, icon 24px, label {typography.rail-label} in {colors.muted} at rest. Selected: fill {colors.accent}, text and icon {colors.on-fill}, weight 600 on the label. Icons use the soft-fill style: 1.5px round-cap outline in the current colour with a fill of about 18% of that colour. Glyphs: headphones (Listen), compass (Explore), stacked notes (Chord drill, note heads left and three staff lines right), circle of fifths (outer ring, inner ring and four dots), piano (keys with two black keys), guitar (fretboard with a dot), cog (Setup), `?` (Help). The cog is an eight-tooth gear with a small centre hole and no rays, so it does not read as a light or dark switch. Glyph shapes are placeholders to refine at build.
- **Instrument toggle** — in the rail, above the gear and `?`: a vertical pill track filled {colors.chip}, two {spacing.rail-toggle-size} square segments with the piano and guitar icons (labels `Piano` and `Guitar` when the rail is open). Selected segment uses the same fill and text as a selected rail item (`instrument-toggle-selected`); this stays the single selected-state treatment for every segmented control. Hidden on the Circle of fifths section (that page has no instrument); the choice is kept for the other sections.
- **Help hint** — circular {spacing.rail-pair-size} chip, italic `?` in {colors.muted}, at the bottom of the rail beside the Setup opener. On hover or focus it reveals the shortcuts list (the list is its content, not a separate component).
- **Setup opener** — circular {spacing.rail-pair-size} chip, same treatment as the Help hint (`setup-opener`: {colors.chip} fill, {colors.muted} glyph, {rounded.full}), holding the cog glyph (inline SVG, 20px, 1.5px stroke). It sits at the bottom of the rail, beside the Help hint, in every section. Quiet: no loud fill. Open state (`aria-expanded` true): glyph in {colors.ink} with a heavier 2.4px stroke, same chip fill (not the accent fill). Accessible name `Setup`; real button; standard focus ring. Contrast of the glyph is in the table (4.68 / 4.69 at rest; non-text, needs 3:1).
- **Readout** — chord name or interval name, {typography.readout}, centered; the type steps down for long names. With an inversion it reads as a slash chord (`C major / E`). Alternative readings sit beneath as small italic text. In the drill it is the question: the asked chord name.
- **Role legend** — a line under the readout: marker shape plus italic label (`root C`, `3rd E`, `5th G`, `7th B`, `9th D`, `4th`, `6th`), {typography.legend}. One entry per role present. In the drill it appears only after the answer shows.
- **Piano keyboard** — three octaves, white keys {colors.surface} with {colors.keyline} edge ({spacing.key-edge-width}), black keys (`piano-key-black`, {colors.key-black}; in dark with a {spacing.key-edge-width} {colors.key-edge-dark} edge), radii {rounded.key} / {rounded.key-black}. Octave labels (C3, C4, C5) in {typography.note-label}. Lit keys show the role tint and marker. Black keys win hit-testing inside their rectangle.
- **Fretboard** — {colors.surface} slab, {rounded.key}; fret wires {colors.keyline} 2px, 7px {colors.ink} nut, strings {colors.ink} at 70%, string names left, fret numbers below, fret position markers (Shapes), open (role shape in a ring at the nut) and muted (`x`) markers.
- **Role marker** — the shapes above (seven roles plus the no-role dot), filled with the role color.
- **Action button** — pill {typography.button} on {colors.chip} with a key-hint cap beside the label. The one primary action per row uses {colors.action} fill and weight 600 (`action-button-primary`). The Next button (after Reveal) is an Action button in the primary slot. In Explore, Play and Block share a line with the root cells and use a compact size (20px type, 12px 24px padding). Drill: Play, then Try as the primary with Reveal; after a right answer or Reveal, Try and Reveal give way to Next in the primary slot. Try stays disabled (`aria-disabled`) until at least three notes are lit.
- **Interval button** — {rounded.interval}, {colors.interval-tint}, interval label {typography.interval-label} over a key-hint cap (`1` to `=`, {typography.key-hint-small}). Wrong state (`interval-button-wrong`): {colors.wrong} fill, inset 2px {colors.muted} ring, label struck through (no corner cross, by decision); it is disabled. Pool-excluded: shown disabled, dimmed to no less than 55% opacity [ASSUMPTION; the mock uses 40%, which reads too faint].
- **Voicing stepper** — `◀ Voicing 1 of N ▶`, {typography.hint}; arrows step. Arrow targets are at least 40 x 40px (pill chip style). At the ends the arrow is replaced by `·` and is inert (no wrap). No shape label (user decision). The **inversion stepper** is the same component in the same row: `◀ Root position ▶`, `1st inversion`, `2nd inversion`, `3rd inversion`. On the piano it is the only stepper; on the guitar both steppers share the line, voicing first, a 40px gap between them. Keys: `Up` / `Down` step the inversion (`Left` / `Right` keep stepping voicings).
- **Root cell** (`root-cell`, `root-cell-selected`) — one of 12 in the builder row, {spacing.cell-size} square, {rounded.cell}, gap {spacing.cell-gap}, {colors.surface}. Natural roots (C D E F G A B) are one cell with the name centred at 21px. The five roots with two spellings (C♯/D♭, D♯/E♭, F♯/G♭, G♯/A♭, A♯/B♭) are one cell cut by a diagonal hairline ({colors.keyline}) from top-right to bottom-left: the sharp name sits in the upper-left triangle and the flat name in the lower-right one, each at 15px and centred inside its own triangle so neither touches the line. Each half is its own button, clickable on its own. Selected: the clicked half (or the whole natural cell) takes the accent fill and weight 700. The builder is pointer-only.
- **Quality chip** (`quality-chip`, `quality-chip-selected`) — {spacing.chip-width} wide, {rounded.cell}, {typography.chip-label}, gap {spacing.chip-gap}. 17 chips in four labelled groups on one line, no submenu: Triads (maj, min, dim, aug, sus2, sus4), Sixths (6, m6), Sevenths (maj7, 7, m7, m7♭5, dim7), Ninths (add9, 9, maj9, m9). Group labels are 12px italic {colors.muted} above each group; groups are {spacing.chip-group-gap} apart. Selected: accent fill, weight 700. The root cell and the quality chip both stay highlighted after a pick. Chip labels are short forms; the readout name always comes from the namer.
- **Circle wedge** (`circle-wedge`, `circle-wedge-related`, `circle-wedge-selected`) — 24 wedges on a {spacing.circle-size} circle: 12 major keys on the outer ring, their relative minors on the inner ring, wedge gap 2px in {colors.bg}. Resting {colors.surface}. Selected wedge: accent fill, weight 700. Related wedges (the key one step either side on both rings, and the relative on the other ring) take a 33% tint of {colors.accent}. Major labels at one fifteenth of the circle size, minor at one twenty-first. The centre shows the selected key by its short name only (`G`, `Gm`) at one seventh of the circle size, weight 700; no key signature, no relative or related-keys text lines. Hover: {colors.chip} overlay.
- **Chord chip** (`chord-chip`, `chord-chip-home`) — seven in a row along the bottom of the circle page, equal width, gap {spacing.chord-chip-gap}, {rounded.interval}. Each stacks Roman numeral (14px {colors.muted}), chord name ({typography.chord-chip}) and a role word (13px {colors.muted}, empty on most chips). The home chip (I or i) is tinted {colors.accent}; that tint is fixed, not a selected state. Chips are clickable to hear the chord, hover {colors.chip}, and keep no selected state.
- **Minor-scale picker** (`scale-picker-selected`) — stacked pills Natural, Harmonic, Melodic, {typography.chip-label}, to the right of the circle, with a 14px {colors.muted} label `Minor scale`. Shown only when a minor wedge is selected; hidden for major keys, and nothing else moves. Selected pill: accent fill. Unselected: {colors.chip}.
- **Setup panel** — on-demand panel, {colors.surface}, non-modal, 560px wide floating overlay at the right edge of the body (see Layout & Spacing for the anchor assumption). Opened and closed by the Setup opener (the cog in the rail) or `P`, from every section. Content, top to bottom: Listen setup (interval pool, Direction, Root), `Chord drill` with Mark misses, Sound, Theme. Inner controls are components:
  - **Pool chip** — one per interval (m2 to P8); `pool-chip` at rest, `pool-chip-selected` when in the pool (accent fill, ink text and weight 600; no check glyph, by decision). On/off is carried by fill, text color and weight, not fill alone. The last ticked chip cannot be unticked [ASSUMPTION]; it carries `aria-disabled`, stays focusable, and shows a non-colour cue (see EXPERIENCE.md Pool chip). Accepted limit (user): dark unselected chip label, muted on chip over the panel surface, is 4.00 (light 5.02), under 4.5 for 22px text; on/off still relies on fill, text color step and weight.
  - **Setup segmented control** — `setup-segmented`, reuses the selected treatment of `instrument-toggle-selected`. Used for Direction (Ascending, Descending, Harmonic), Root (Random, Fixed), Sound (Samples, Synthesized), and Theme (System, Light, Dark). The Sound control has a one-line hint under it in {colors.muted}: `Samples follow the instrument: piano sound on the piano, guitar sound on the guitar.`
  - **Mark misses toggle** — an on and off control for the drill, under its own small heading `Chord drill`, in the same segmented style (On, Off), on by default. Label `Mark misses`, hint in {colors.muted}: `Crosses notes that are not in the chord after two tries.`
  - **Setup label** — {typography.legend} in {colors.muted} above each group, associated to its control.
- **Status note** — quiet italic line in {colors.muted}, {typography.hint}, for `No voicing fits these notes.`, `Press any key to wake the sound.`, `Loading the guitar sound.` (and the piano equivalent), the offscreen-lit-notes indicator and the clear-undo line. Contains an inline button (`Undo`) in the last case. The loading note sits in the same spot as the audio-blocked note.
- **Key hint** — {typography.key-hint} cap shown inside buttons and in the shortcuts list; solid colors per Typography.
- **Focus ring** — `focus-ring`: {spacing.focus-ring-width} {colors.focus} outline with a {spacing.focus-ring-offset} gap, drawn **outside** the control on `:focus-visible`. It sits outside because inside it fails on accent and action in dark (see Contrast). For SVG keys and frets draw it as an element, not a box-shadow. Selected state is a separate, additional cue.

## Do's and Don'ts

| Do | Don't |
|---|---|
| One selected-state treatment: accent fill, on-fill text, weight 600 | A different selected look per control (the rejected inconsistency) |
| Encode role by shape and color together | Rely on pastel fill alone; it fails 3:1 in light theme |
| Use pastels as fills only | Use any pastel as text color |
| Keep controls pill-shaped and borderless | Add hard borders, shadows or gradients |
| Keep the instrument the largest element | Let the rail or panels compete with the instrument |
| Put the shortcut cap on every keyboard-reachable control, solid color | Hide shortcuts only in a menu, or fade caps with opacity |
| Draw the focus ring outside the control | Draw it inside; it vanishes on accent and action in dark |
| Use green for the 5th and non-section accents | Fill the Listen or Explore rail items with green |
| Mark a wrong guess with ring and strike as well as fill | Mark it by fill alone |
| Give dark black keys an edge | Rely on black vs dark-white fill (1.36) |
| Carry a new role by shape (pentagon, hexagon, star) as well as color | Add a role that is separated from its neighbour by color alone (lilac 9th sits next to violet 7th) |
| Keep the rail collapsed by default and expand only on click | Expand the rail on hover; it would shift the instrument |
| Mark a wrong drill note with a cross shape | Mark it by color or fill alone |
| Keep drill notes as plain dots until the answer shows | Show role shapes while the user is still building the chord |
| Use soft-fill icons: 1.5px outline plus an 18% tint | Mix filled and outline icon styles in the rail |
| Keep a chord chip free of a selected state | Highlight the last chip played |
