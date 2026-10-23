# Accessibility review: accompa UX (DESIGN.md, EXPERIENCE.md, three key mocks)

Reviewer lens: WCAG 2.2 AA applied to a single-user, desktop, keyboard-first music-theory tool. Sources read: DESIGN.md, EXPERIENCE.md, .memlog.md, `.working/key-explore-piano.html`, `key-explore-guitar.html`, `key-listen-setup.html` (HTML/CSS read, not rendered). Contrast recomputed with `python -I` (WCAG relative luminance; overlays alpha-composited).

Tags: **(a)** real gap in the spine text a builder would get wrong; **(b)** mock issue; **(c)** accepted limit that should be stated explicitly.

## Verdict

**Conditional: not ready to hand to a builder as the accessibility contract.** The visual encoding is sound: role shape plus colour, a multi-cue wrong-guess state, and contrast figures that reproduce exactly. But the spine claims "keyboard-first, every action has a key" and then leaves the product's core interaction (toggling notes on the instrument) and the fret-region selection mouse-only. It also leaves Tab, focus order, focus ring, live-region behaviour, and zoom/reflow undefined. Fixing the 1 critical and 9 high items is mostly text in EXPERIENCE.md plus two or three token additions in DESIGN.md.

Counts: **1 critical, 9 high, 18 medium, 16 low** (44 total).

Verification: all 28 contrast figures in the DESIGN.md table reproduce to two decimals (light and dark). The numbers are right. Several conclusions drawn from them are incomplete (see Contrast).

---

## 1. Contrast and non-text contrast

- **[medium]** (a) Dark theme: black keys vs white keys is 1.36 and the spine says "see below" but nothing below mitigates it. In dark the "white" keys are `surface-dark` (#342A2D) and black keys #170F11. Even pure black cannot reach 3:1 against that surface (max about 1.5), so the fill can never be fixed by darkening (DESIGN.md Contrast, Piano keyboard). *Fix:* in dark, outline black keys 1.5px in `ink-dark` (ink vs key-black 15.58, ink vs surface 11.44), or lighten the white keys (e.g. #CFC3C0 gives 10.98 vs black keys, 9.29 vs bg). Record the choice as a token.
- **[medium]** (a) `keyline` (1.31 light / 1.26 dark) is called "decorative only", but it is the only boundary between adjacent white keys and between frets. A low-vision user cannot see where one white key ends. White key vs bg is 1.07. SC 1.4.11 applies to the visual information needed to identify a control (DESIGN.md Colors, Fretboard). *Fix:* white-key edges and fret wires use `muted` (5.59 / 5.13 on surface), or ink at about 40%. Keep keyline for truly decorative things.
- **[medium]** (a)/(b) Key-hint caps use 60% opacity at 13 to 15px. Recomputed: 3.67 on chip, 3.47 on action, 3.67 on interval-tint, 3.51 on wrong (light); 3.53 on action (dark). All fail 4.5 for small text, and they are the shortcut-discovery mechanism (DESIGN.md Typography key-hint; mocks `kbd{opacity:.6}`). *Fix:* no opacity; solid `muted` on chip/interval/bg (4.64 to 5.23) and solid `on-fill` on the action fill. Differentiate by non-italic sans and size, not transparency. Raise the 13px interval-button hint to at least 14px.
- **[medium]** (b) Dark mock: fret numbers inside the region bar are `ink-dark` on `accent-dark`: 1.63. Light is 8.18. The spec never says what colour text takes inside the region fill (guitar mock `.fn.fnn`; DESIGN.md Fret-region bar). *Fix:* spec: text on the region fill is `on-fill` (8.28 dark); change the mock.
- **[medium]** (a) Dark piano: the claim "every role marker has a 1.8px ink outline so shape reads at full contrast" holds in light (ink vs 80% key tint 7.9 to 10.4) but not on dark piano keys. There `ink-dark` is light and the 80% role tint is light, so outline vs tint is 2.36 (root), 1.92 (3rd), 2.27 (5th), 2.51 (7th). The marker's boundary against the tinted key fails 3:1, and the tint is nearly the same colour as the marker fill. Fretboard markers on `surface-dark` are fine (6.3 to 8.4). *Fix:* in dark, lower the key tint to about 25% or drop it, and/or outline markers with `on-fill-dark`.
- **[low]** (a) The contrast table omits pairs the UI actually uses. `muted` on chip (unselected segment and tab labels) is 4.68 / 4.64: pass. `muted` on action is 4.01 light and 1.53 dark, and `muted` on accent is 3.33 / 1.37: fail. *Fix:* add the passing rows and add a rule "muted never sits on action or accent".
- **[low]** (a) Selected vs unselected tab/segment: accent vs bg is 1.57 in light, so the selected state is fill plus weight 600 plus a text-colour step (ink vs muted). Weight at 22 to 24px italic is a weak cue. The spine already notes this. *Fix:* optionally add one non-fill cue (small underline or leading dot) to the shared selected rule; at minimum guarantee `aria-selected`/`aria-pressed`.
- **[low]** (b) Pool-excluded intervals at `opacity:.4`: label 2.19 light / 3.04 dark. Disabled controls are exempt, but the user cannot read which intervals are out of the pool, and the key digits vanish. *Fix:* if "shown disabled" stays, dim to about 55%, or add a dotted outline plus an accessible name that says "not in pool".

## 2. Colour independence

- **[high]** (a) Lit notes with no defined role have no second channel. Cases: extensions beyond the 7th ("not designed"), unresolved chord names ("show notes only"), the first one or two notes clicked, and above all **Listen Reveal**, which lights two notes with no 3rd/5th/7th (EXPERIENCE.md State Patterns, DESIGN.md Shapes). A builder will fall back to a colour-only fill or reuse an arbitrary role shape, which fails SC 1.4.1. *Fix:* define a fifth neutral marker (e.g. small solid ink dot) for "lit, no role"; define Reveal as root marker plus neutral marker on the upper note.
- **[low]** (a) Interval-pool chips and setup toggles express on/off by fill plus weight only (guitar/listen mock `.pool span.on`). *Fix:* add a check glyph to ticked chips, and `aria-checked`.
- **[low]** (a) Role fills differ from each other by only 1.06 to 1.42, so shape is the sole discriminator everywhere (verified). That is acceptable and the spec says so. Shapes must stay at least about 18px (open-string markers are 18px inside a 19px-radius ring; fine). Treat the shape-size floor as a rule.
- **[low]** (a) Voicing stepper end states are undefined (no wrap, so ◀ at 1 of N is dead). The mock only shows arrows in `muted`; if disabled state is colour alone it fails. *Fix:* hide or `aria-disabled` plus a visible change other than colour (e.g. ◀ becomes "·").
- Pass: the wrong-guess state (inset ring + strike + cross + fill + text hint + disabled) is the best-covered state in the product.

## 3. Focus order and visible focus

- **[high]** (a) The focus indicator has no token, width, colour or offset. "Visible focus ring on every control" is all the spec says. All resting fills are pastel and near the background (chip 1.12, action 1.30, accent 1.57 light), so the ring must be a solid ink outline outside the control with an offset. A ring drawn inside the control vanishes in dark: `ink-dark` vs `action-dark` is 1.46 and vs `accent-dark` 1.63 (DESIGN.md Components; EXPERIENCE.md Accessibility Floor). *Fix:* add to DESIGN.md: `focus-ring` = 2px `ink` outline, 2px offset, on `:focus-visible` (ink vs bg 12.85 / 13.18); for SVG keys and frets, draw it as an element, not box-shadow.
- **[high]** (a) No focus order is defined. A builder will produce DOM order by accident. *Fix:* specify: Mode tabs, Instrument toggle, `?`, Readout alternatives, Instrument (one composite stop, see section 4), Voicing stepper, Fret-region bar, Action buttons, Interval row (one group, arrows move within), then the Setup panel when open. Wordmark is not a stop.
- **[medium]** (a) Setup panel focus management is missing. Define: does `P` move focus in, does `Esc` or `P` return focus to the opener, is it modal or non-modal, and do the global shortcuts (1 to 9, Space) fire while it is open? The shortcuts-hint popover on hover or focus has the same need under SC 1.4.13: it must be dismissible with `Esc`, hoverable and persistent (EXPERIENCE.md Component Patterns "Setup panel", "Help hint"). *Fix:* panel is a non-modal `role="dialog"` named "Setup"; focus enters on open and returns on close; shortcuts are suspended while focus is inside it; the opener carries `aria-expanded` and `aria-controls`.
- **[medium]** (a) Focus loss when focused elements disappear or get disabled. A wrong interval button becomes `disabled` and focus drops to body in Chrome. The stepper is hidden in the no-voicing state. Reveal becomes Next. *Fix:* the wrong state uses `aria-disabled="true"` and stays focusable (so it can also be read, see section 5); define where focus lands after Reveal/Next; hide the stepper without orphaning focus.
- **[low]** (b) The setup panel overlay (`top:96px; right:44px; width:470px`) covers the right of the instrument and slightly overlaps the large readout text, which can obscure a focused key (SC 2.4.11). *Fix:* focus stays in the panel while open, or the panel docks and pushes layout.

## 4. Keyboard operability and the shortcut map

- **[critical]** (a) The core interaction has no keyboard route. Click-to-sound and toggle on piano keys and fret positions, set root (`R` then **click**), hand-edit a note by fret click, and the fret region (section 7) are all pointer-only. The key map has no way to move a cursor over the instrument or toggle a note. This contradicts the spine's own floor ("every action has a key or tab-reachable control") and SC 2.1.1 (A). Explore, the product's main mode, can be built only with a mouse (EXPERIENCE.md Interaction Primitives, Key map, Accessibility Floor). *Fix:* make each instrument one composite widget (roving tabindex, single Tab stop). Piano: Left/Right moves by key, Up/Down by octave or fine step; fretboard: arrows move over string/fret. A toggle key selects/deselects the focused note (it must also sound). `R` becomes "make focused note the root". Resolve conflicts this creates: Left/Right is currently the voicing stepper and Space/Enter are global Play/Block. Suggested split: inside the instrument arrows navigate and Space toggles; the stepper moves to `,` / `.` (or PageUp/PageDown) when focus is in the instrument and to Left/Right only when the stepper itself is focused; Block and Play keep Enter/Space when focus is outside the instrument. State the rule in one table.
- **[high]** (a) `Tab` is both the browser focus key and "switch Listen/Explore". The memlog rule ("shortcuts yield when a button or field has focus") makes it worse: from `body`, Tab switches mode, so keyboard focus can never enter the strip, instrument or buttons without a mouse click first. This breaks 2.1.1/2.4.3 and creates a keyboard trap in practice. The spine still shows this as an unresolved `[NOTE FOR UX]` (EXPERIENCE.md Interaction Primitives). *Fix:* keep Tab native and move mode switching to a letter (`M` toggles, or `L` / `E`). If the user insists on Tab, the document needs an alternative focus entry key and the yield rule written out; strongly prefer reassigning.
- **[high]** (a) No modifier, repeat or layout handling. (1) `Ctrl+=`, `Ctrl+-`, `Ctrl+0` are browser zoom, but `=`, `-`, `0` pick intervals m7/M7/P8: a user zooming to 200% will register wrong guesses. Also `Ctrl+R`/`P`/`I`/`A`/`[` collide with reload, print, select-all. (2) On Windows AltGr = Ctrl+Alt, and on several non-US layouts (Hungarian among them) `[`, `]` and sometimes `?` need AltGr, so a naive "ignore Ctrl/Alt" breaks the octave keys. (3) Holding Space or Enter auto-repeats: machine-gun replay or Reveal then instant Next. *Fix:* handlers read `event.key`; ignore events with Ctrl/Meta/Alt unless `getModifierState('AltGraph')`; ignore `event.repeat` for Space/Enter; offer a non-bracket alternative for octave shift (PageUp/PageDown).
- **[medium]** (a) SC 2.1.4 Character Key Shortcuts: single-character shortcuts (I, P, A, R, ?, [, ], digits, - and =) exist with no turn-off, remap, or focus-scope. For one non-voice user the impact is small, but it is trivial to meet. *Fix:* a "Shortcuts" on/off toggle in the Setup panel, or scope shortcuts to focus inside the app area.
- **[medium]** (a) The yield rule is only in `.memlog.md` (entry 42); EXPERIENCE.md still carries the old unresolved note, and says `[`/`]` were "not in the approved list" although they were confirmed. Also unspecified: after a mouse click on a button, focus stays on it, so Space/Enter would re-activate that button (e.g. the Piano|Guitar segment) instead of Reveal/Play. *Fix:* update the spine; define yield as "only when the focused button has `:focus-visible`" (keyboard-focused), or clear focus to the instrument widget after mouse activation.
- **[medium]** (a) `Esc` = "close panel, else clear notes" is destructive, has no undo, and shares the key with dismissing the hint popover. Pressing Esc twice (panel, then habit) wipes the chord. In Listen, "clear notes" is ambiguous (workspace is preserved). *Fix:* Esc closes transient UI only; clearing moves to a dedicated key (`C`/Backspace) with an announced "Notes cleared" and a one-step undo.
- **[medium]** (a) Screen readers in browse mode swallow letters, digits, Space, Enter and arrows, so document-level shortcuts will not fire. Either scope the app region as `role="application"` (with its costs) or state screen-reader use as out of scope (see section 11).
- Pass: Space/Enter/Left/Right/`[`/`]` have no conflict with browser chrome themselves (only through the modifier cases above). The page is one screen, so Space needs `preventDefault` only to stop scroll.

## 5. Canvas/SVG instrument semantics and accessible names

- **[high]** (a) Nothing says how the instruments expose structure, names or state. "Canvas/SVG" is undecided: a canvas has zero semantics. The mocks are inline SVG `<rect>` and `<polygon>` with no roles, names or titles. Needed: piano of 21 white and 15 black keys (36 targets), guitar of 6 strings by about 12 frets plus open positions (about 78 targets). Making each a Tab stop is unusable. *Fix:* require DOM/SVG, not canvas (architecture decision). One composite per instrument with roving tabindex. Each key or position gets a name like "C4" or "G string, fret 2, E" with state in the name ("lit, 3rd"). Group labels: "Piano, C3 to B5" and "Guitar fretboard, frets 1 to 12". Lit state is `aria-pressed`.
- **[medium]** (a) The fretboard is unreadable to AT even if every node is labelled; the voicing is a pattern. *Fix:* provide a text equivalent of the current voicing (e.g. "low E muted, A fret 3 root C, D fret 2 3rd E, G open 5th G, B open 7th B, e open 3rd E") in a visually hidden element and in the stepper announcement.
- **[medium]** (a) No ARIA pattern table for the controls. The spec says only "expose a selected role". Specify: Mode tabs `tablist`/`tab` with `aria-selected`; Instrument toggle `radiogroup` or toggle buttons with `aria-pressed`; `?` is a `button` with `aria-expanded`; Interval row is a labelled `group`; setup chips are checkboxes; Direction, Root, Sound, Theme are `radiogroup`s with real labels (the mock `.lab` divs are not associated). Key-hint caps inside buttons must be `aria-hidden` with `aria-keyshortcuts` on the button; the mock puts them inside the label so the name would be "Block Enter".
- **[low]** (a) Abbreviations read badly: `m3`, `P4`, `A4`, `M7` are spoken as letters. The spelling module (AD-3) should also supply long names ("minor third") for `aria-label` and live messages; `♭6` must be a real ♭ glyph, not `b`.
- **[low]** (a) Landmarks and title: use `header`, `main`, labelled instrument region, and a `<title>` reflecting the mode. The readout is a status region, not a heading; the wordmark is not an `h1` that competes.
- **[low]** (b) Mocks are `<span>`-built visual references only (`?` has no name, ◀ ▶ are `<s>` elements which some screen readers announce as strikethrough, ✕ is CSS `::after` content). Add a comment: "not markup; do not copy structure".

## 6. Screen-reader announcements (live regions)

- **[high]** (a) A correct guess has no feedback at all: the next question simply plays and the readout stays "Which interval?". A screen-reader user, and any sighted user who looked away, gets nothing (SC 4.1.3 status messages). The voice rules ban praise but not information. *Fix:* a quiet status line and announcement, e.g. `P5. Next interval playing.`; likewise announce Reveal as "Major third, C4 up to E4. Next available."
- **[medium]** (a) "Announced politely" is far too vague to build from. The chord name changes on every click, so a naive live region chatters. *Fix:* one `role="status"` (polite, atomic) for Readout main name only, debounced about 300 to 500 ms after the last change, excluding the alternatives and legend; separate polite messages for "Voicing 2 of 8" plus the voicing text, wrong guess (`minor third is not it, try another`), "No voicing fits here", audio-blocked note, region change ("Fret region 8 to 9") and "Notes cleared". Never `assertive`.
- **[medium]** (a) The wrong-guess button needs state in its name (`minor third, tried, not it`), since strike-through and the ✕ are invisible to AT (see section 3: use `aria-disabled`, keep focus).
- **[low]** (a) The empty-prompt copy `Click notes to build a chord` is pointer-specific; use "Select notes to build a chord".
- **[low]** (a) `Press any key to wake the sound.` should be a status message and removed once audio starts; on a successful wake, do not announce.

## 7. Drag-only fret-region selection

- **[high]** (a) The region is set only by dragging across fret numbers. SC 2.5.7 Dragging Movements (new in 2.2, AA) requires a single-pointer alternative, and SC 2.1.1 a keyboard one. The only other control is the clear button. The mock bar is an unfocusable `<rect>` (EXPERIENCE.md Fret-region bar and Interaction Primitives; DESIGN.md Fret-region bar). *Fix:* (1) pointer: click a fret number to set the start, click another to set the end (drag remains as a shortcut); (2) keyboard: the bar is two `role="slider"` handles ("Region start fret", "Region end fret", `aria-valuetext="fret 8"`), arrows move, Shift extends, and Home/End or the clear control restores the whole neck; (3) announce the resulting region; (4) `Esc` during a drag cancels it.

## 8. Target sizes (SC 2.5.8, 24px minimum)

- **[medium]** (b) The voicing-stepper arrows are 22px text glyphs in `<s>` with no padding and a 16px gap (mock `.stepper`): roughly 20 to 22px wide and tight. *Fix:* spec them as 40 by 40px minimum buttons (pill chip style, same as the 38px help and clear controls).
- **[medium]** (a) Instrument targets are only safe at the 1280 by 800 canvas. Pieces scale with `max-height:100%`. Estimate: Listen's fixed chrome (strip, readout, controls, interval row, padding) is about 440px, so on a 1080p laptop at 125 to 150% scaling (about 630px of viewport height) the stage drops to about 190px, the SVG scales to about 0.57, and black keys shrink from 35px to about 20px (under 24). *Fix:* set a minimum instrument scale (black key at least 28px, fret cell at least 40px) and let the page scroll below it; define that black keys win hit-testing in their rect.
- Pass at design size: interval buttons about 88px wide and about 80px tall, action pills about 60px tall, mode tabs about 52px, segments about 40px, help and clear 38px, pool chips about 34px.

## 9. Reduced motion, colour scheme

- Pass: the reduced-motion rule is stated (instant fades and crossfade); no flashing content; no autoplaying animation. Theme follows `prefers-color-scheme` with a manual override.
- **[low]** (a) Add `color-scheme` to the document and apply the persisted manual theme before first paint so a dark-override user does not see a light flash.
- **[low]** (b) Forced-colors (Windows high contrast): the wrong ring (`inset box-shadow`) and panel edge are box-shadows, which forced-colors removes, and pastel fills collapse. *Fix:* implement rings and edges as `outline` or transparent 2px borders and add a short `@media (forced-colors: active)` rule. Cheap; confirm whether the user ever uses it, otherwise state as unsupported.

## 10. Text resizing, zoom and reflow

- **[high]** (a) "One screen, no scrolling" plus px tokens defined on a 1280 by 800 canvas, no responsive rules ("laptop-only"), and mocks with `overflow:hidden`. At browser zoom 200% a 1920 by 1080 viewport is about 960 by 470 CSS px: Listen's fixed content needs roughly 440px vertical, leaving about 30px for the instrument, and the strip alone needs roughly 780px of width against 640 at 1280-wide 200%. SC 1.4.4 (resize text) and 1.4.10 (reflow) are not met, and the spec makes it a contract (DESIGN.md Layout & Spacing; EXPERIENCE.md Foundation). *Fix:* state a minimum design viewport and below it let the page scroll vertically (`overflow:auto`, instrument keeps its minimum scale), let the strip wrap, and say explicitly that 200% zoom is supported by reflow to a scrolling column. Never clip.
- **[medium]** (a) Typography tokens are all px, so the user's browser default font size is ignored. *Fix:* express text tokens in rem (keep the ratios).
- **[low]** (a) Fixed heights (`strip-height: 84px`) will clip under SC 1.4.12 text spacing; use `min-height`.

## 11. Audio-only question in Listen (deaf and hard-of-hearing users)

- **[medium]** (c) Listen's question is audio-only with no visual alternative. That is inherent (an ear-training exercise is exempt from a text alternative as a test that would be invalid otherwise), but it is **not stated anywhere**. A hearing-impaired user would hit it with no explanation. *Fix:* add one line to EXPERIENCE.md Foundation: "Listen requires hearing and has no visual substitute by design; Explore, instruments, chord names and voicings are fully usable silently." Verify that statement is true (it is if note feedback is visual, which it is).
- **[low]** (a) The Setup panel has sound choice but no volume or mute; the app relies entirely on OS volume. A hard-of-hearing user may want a level control (and everyone wants Listen not to blast). Consider a master volume.

## 12. Italic-heavy typography

- **[low]** (c) Everything is italic, including 20px labels and note names, a deliberate user choice (Pebble direction). Italic reduces legibility for dyslexic and low-vision readers; WCAG has no italic requirement, so it is not a failure. State it as an accepted aesthetic limit. Optionally add a Setup toggle "Upright text" (a one-line `font-style` override) as a cheap escape hatch.
- **[low]** (a) The face is unconfirmed (Palatino stack, Fraunces or Newsreader open). If a web font is chosen, load the true italic axis; faux oblique at 20px degrades. Weight 600 maps to bold in Palatino/Georgia fallbacks; fine. Name which characters rely on case (`m3` vs `M3`, `m7` vs `M7`): keep at least 20px with true italics, and the long accessible names above remove the ambiguity for AT.

---

## Classification summary

**(a) Spine gaps a builder would get wrong (highest value):** instrument keyboard operability, Tab conflict, modifiers/zoom/AltGr/repeat, focus ring and order, instrument semantics and names, fret-region alternative, right-guess feedback, live-region design, no-role markers, reflow/min viewport, dark-mode key and marker contrast, key-hint opacity.

**(b) Mock issues:** dark fret numbers on region (1.63), stepper arrows too small and `<s>`, panel overlay covers instrument and slightly the readout, span-built controls with no names, kbd in labels, box-shadow-only rings, 40% disabled chips.

**(c) Accepted limits to state explicitly:**
1. Listen requires hearing; no visual substitute.
2. Screen-reader use: best-effort (names and live regions), full parity for a spatial instrument not promised, or declare out of scope.
3. Desktop only: no touch targets beyond 24px, no mobile reflow below the stated minimum viewport.
4. Italic everywhere is a deliberate aesthetic.
5. Light-theme role fills deliberately fail 3:1; shape and outline carry meaning (already stated; keep, and fix dark).
6. MIDI is later, so on-screen instruments are the only input.
7. Sound on pointer-down is essential to a musical instrument (SC 2.5.2 exception): toggle on release, sound on press, document it.
8. Single-key shortcuts: either remappable or documented as not.

Not found wrong: reduced-motion text, role-shape set, wrong-guess multi-cue, `prefers-color-scheme`, the contrast table arithmetic.
