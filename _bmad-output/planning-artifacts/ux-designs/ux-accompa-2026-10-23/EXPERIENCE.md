---
name: accompa
status: final
updated: 2026-10-23
sources:
  - _bmad-output/planning-artifacts/prds/prd-accompa-2026-10-22/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-accompa-2026-10-23/ARCHITECTURE-SPINE.md
companion: DESIGN.md
---

# accompa — Experience Spine

> **PRD override (applied).** The user confirmed that Listen has an optional guess-by-click (correct answer advances, wrong answer stays marked). PRD FR-6 was rewritten to match on 2026-10-23. There is still no score counter, and guessing is optional.
>
> **Vocabulary.** PRD "Practice mode (listen and reveal)" is **Listen**; PRD "Free-play mode" plus the chord builder is **Explore**. Piano and Guitar are not modes; they are an always-visible instrument toggle.

## Foundation

Laptop browser (see Responsive & Platform for viewport scope), client-only static app, one user (Apor, a guitarist who also plays some piano). No mobile, no accounts. `DESIGN.md` is the visual reference (tokens, shapes, components); this spine is behavior. Light theme is primary, dark is the twin.

**Keyboard-first is scoped, not total.** It covers Listen, switching, transport and voicing stepping; note toggling is pointer-first (see Accessibility Floor).

**Precedence (stated once).** EXPERIENCE.md and DESIGN.md win over every mock and wireframe on every point, including color and type. The mocks' visual render is unchecked: the designer never viewed them in a browser.

References:
- [`wireframes/flow-build-chord-2026-10-23.excalidraw`](wireframes/flow-build-chord-2026-10-23.excalidraw): 4-frame Explore flow, piano to guitar. Illustrates IA, voicing stepper, role markers.
- [`mockups/key-explore-piano.html`](mockups/key-explore-piano.html), [`mockups/key-explore-guitar.html`](mockups/key-explore-guitar.html), [`mockups/key-listen-setup.html`](mockups/key-listen-setup.html): key screens (inline links at each section below).
- Mocks are illustrative, not production markup: they are span-built controls with inset box-shadow rings that forced-colors modes would strip. Build real buttons, groups and outlines.
- Exploration record, not normative: [`.working/directions-1.html`](.working/directions-1.html), [`.working/color-themes-1.html`](.working/color-themes-1.html) (also linked from DESIGN.md).

### Persisted settings

Persisted across sessions: sound choice, theme (including a manual override of the system setting), interval pool. Not persisted: chord, voicing, current question, direction and root mode. This matches the architecture spine (AD-6).

## Information Architecture

The instrument (piano or guitar) is always on screen. A mode layers over it.

| Surface | Reached from | Purpose |
|---|---|---|
| Explore (default on open) | App open; `M` | Build and name chords, free-play, voicings. |
| Listen | Mode strip; `M` | Hear an interval, optionally guess, reveal. |
| Setup panel | `P` or the Setup opener (gear icon), on demand | Listen setup, sound choice, theme. |
| Setup opener | Gear icon in the corner, beside the Help hint | Opens or closes the Setup panel (same as `P`). |
| Help hint | `?` in the corner, on hover or focus | Reveals the shortcuts list. |

Persistent chrome: a slim **Mode strip** (wordmark, Listen / Explore, Piano / Guitar toggle, Setup opener, Help hint) that does not compete with the instrument. Under it: **Readout**, instrument, controls. No navigation beyond this.

Listen layout ([mock](mockups/key-listen-setup.html)) is **accepted by the user** (behavior and arrangement): Readout shows the question, the instrument below, a control row (Play again, Reveal), and a row of 12 Interval buttons. Setup panel contents are decided (interval pool, direction, root, sound choice, theme); its **placement and size (560px floating overlay) are accepted by the user**.

The workspace (current chord, voicing) is shared across Piano and Guitar and survives a swap and swap-back (ARCHITECTURE-SPINE AD-5). Listen never overwrites it.

## Voice and Tone

Quiet, short, sentence case, italic in the UI. No exclamation marks, no scores, no praise.

| Do | Don't |
|---|---|
| `No voicing fits these notes.` | `Error: no voicing found` |
| `Press any key to wake the sound.` | `Audio is blocked! Click to enable.` |
| `Voicing 1 of N` | `Shape: Open C` (no shape labels) |
| `m3 is not it — try another.` | `Wrong!` |
| `P5. Next interval is playing.` | `Correct! Great job!` |
| `Which interval?` | `Question 4 of 10` |

Chord and interval names come from the one spelling module (AD-3); copy never spells notes itself. The 6-semitone interval is labelled **A4** (aligned with ARCHITECTURE-SPINE AD-3).

## Inspiration & Anti-patterns

No app references (user decision). Anti-patterns the user rejected: a realistic or skeuomorphic piano or fretboard; anything that reads as an instrument rather than a tool; a different selected-state look per control; green on the Explore or Listen mode buttons; scores, streaks and praise.

## Component Patterns

Visual specs live in `DESIGN.md` Components. Names are identical. Mock per component: [Explore piano](mockups/key-explore-piano.html) (strip, tabs, toggle, hint, Readout, legend, keyboard, markers, Action button); [Explore guitar](mockups/key-explore-guitar.html) (Fretboard, stepper, bar, Status note); [Listen and setup](mockups/key-listen-setup.html) (Interval button, Setup panel, Setup opener shown pressed).

| Component | Use | Behavioral rules |
|---|---|---|
| Mode strip | Top of every screen | Always present, never scrolls away. Houses Mode tabs, Instrument toggle, Setup opener, Help hint. |
| Mode tab | Listen / Explore | One selected at a time, styled `{components.mode-tab-selected}`. `M` switches. Switching keeps the instrument and workspace. |
| Instrument toggle | Piano / Guitar | One selected, styled `{components.instrument-toggle-selected}`. `I` swaps. Crossfade, see Motion. |
| Setup opener | Corner gear icon, just left of the Help hint | A real button, accessible name `Setup`, `aria-expanded` reflects the panel state, keyboard focusable. Click or `P` opens or closes the panel; `Esc` closes it and returns focus to the opener. Shown in every mode and both instruments. Visual: `{components.setup-opener}` (same circle as the Help hint, muted glyph, quiet). |
| Help hint | Corner `?` | Hover or keyboard focus reveals the shortcuts list; `?` toggles it; `Esc` dismisses it; the list stays open while hovered. |
| Readout | Explore: live chord name. Listen: `Which interval?`, then the interval name after Reveal. | Updates live on every note change. Multiple readings: the first is large, the others are small clickable italic alternatives. **Clicking an alternative changes both the name and the root**: the notes stay the same, the root marker moves to that reading's root, the Readout and Role legend update (for example `C6` vs `Am7/C`). Empty chord: prompt line (see States). |
| Role legend | Under Readout | Shows roles present with their note names (`root C`, `3rd E`, `5th G`). Updates with the chord. |
| Piano keyboard | Instrument | Three octaves. Click key: sounds on press, toggles lit on release. Root marked differently. `[` and `]` shift one octave. |
| Fretboard | Instrument | Click a fret position: sounds and toggles that note (one per string in a voicing). Shows open and muted markers; an open string is its role shape inside a ring at the nut. A chord shows as one voicing. |
| Role marker | On piano keys and frets | Root is ringed and filled; 3rd, 5th, 7th are distinct shapes, always shape plus color. A lit note with no role gets the no-role dot. |
| Action button | Play and reveal controls | Click or its key-hint key. One primary per row. Explore: Play (`Space`, an arpeggio low to high), Block (`Enter`, primary). Listen: Play again (`Space`), Reveal (`Enter`). After Reveal, a Next button takes the primary slot; `Enter` again = Next. |
| Interval button | Listen, 12 of them (m2 to P8) | Click or keys `1`-`9`, `0`, `-`, `=`. Correct: advances to the next question and auto-plays it. Wrong: the button is marked and disabled until the next question; the question stays. Disabled while revealed. Only intervals in the pool are enabled; [ASSUMPTION] pool-excluded buttons are shown disabled, not hidden. A wrong button keeps focusability for assistive tech (`aria-disabled`), and its accessible name carries the state (for example `m3, tried`). |
| Voicing stepper | Guitar view | `◀ Voicing 1 of N ▶`; `Left` / `Right` or the arrows step. [ASSUMPTION] No wrap: the arrow at either end is inert (`aria-disabled`, replaced visually by `·`). If a focused arrow goes inert, focus moves to the remaining stepper arrow; if the stepper hides, to the instrument if no stepper control is left. Best playable shape ranks first. Guitar only; piano voicings and inversions are Phase 2 (FR-21 withdrawn). |
| Setup panel | On demand | Non-modal. `P` toggles, `Esc` closes. Focus enters on open and returns to the opener on close. Holds the inner controls below. The opener is the gear icon (Setup opener). Width (560px) and floating overlap of the instrument are accepted by the user. |
| Pool chip | Setup panel | Checkbox chip per interval; on = selected treatment (accent fill, weight 600), no check glyph. [ASSUMPTION] At least one interval stays selected; the last ticked chip cannot be unticked: it gets `aria-disabled` (stays focusable), a non-colour cue, and a live-region hint `Keep at least one interval.` [ASSUMPTION]. On/off cue is fill, text color and weight, with no check glyph (user decision); dark unselected label contrast on the panel is 4.00 (muted on chip over surface; light 5.02), an accepted limit (see Accessibility Floor). |
| Setup segmented control | Setup panel | Direction (Ascending, Descending, Harmonic), Root (Random, Fixed), Sound (Synthesized; samples later), Theme (System, Light, Dark). One selected, same treatment as the Instrument toggle. Each has a Setup label. |
| Setup label | Setup panel | Names a control group; programmatically associated with it. |
| Status note | Near instrument | Quiet italic line for no-voicing, audio-blocked, offscreen-lit and clear-undo messages. Never modal. |
| Key hint | In buttons and the shortcuts list | Shows the shortcut; informational only. Hidden from assistive tech (the control exposes its key as `aria-keyshortcuts`). |
| Focus ring | Every focusable control | Spec in `DESIGN.md` Components. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| Empty chord (no notes lit) | Explore | Readout shows a quiet prompt, `Select notes to build a chord`. No role legend. Guitar view: fretboard empty, stepper hidden. |
| Single note lit | Explore | Readout shows the note name; the note carries the root marker. Guitar view: that note where it is placed, no stepper (a voicing needs two or more notes). |
| Chord name unresolved (notes form no known chord) | Explore Readout | No name for unknown note sets ([ASSUMPTION]); Readout shows the note names. The lowest note keeps the root marker; every other lit note gets the no-role dot, so nothing relies on color alone. Role legend lists only the root. |
| Multiple chord readings | Explore Readout | First reading large; others small clickable italic alternatives; clicking one changes name and root (see Readout). |
| No voicing fits | Guitar | Fretboard empty with only the Status note under it: `No voicing fits these notes.` Stepper hidden. Notes stay lit on piano. |
| Voicing after piano build | Guitar | Chord carries over, stepper opens on best shape; climax of Flow 1. |
| Lit notes offscreen | Piano | After `[` / `]` shifts the three-octave window, lit notes outside it are shown by a Status note at the matching edge (`◀ 2 notes lit` / `3 notes lit ▶`). [ASSUMPTION] |
| Audio blocked | Instrument | No enable-sound screen. First click or key wakes audio. If still blocked: Status note `Press any key to wake the sound.`; it disappears when audio starts. |
| Esc cleared the chord | Explore | Status note `Notes cleared. Undo` with an `Undo` button; it stays until the next note change. [ASSUMPTION] The undo gesture is this button only (no Ctrl+Z, because shortcuts ignore Ctrl combinations). |
| Listen: waiting for guess | Listen | Readout `Which interval?`; Interval buttons enabled. |
| Listen: wrong guess | Listen | That Interval button marked (`interval-button-wrong`) and disabled until the next question; Readout hint `m3 is not it — try another.`; question stays. |
| Listen: right guess | Listen | Quiet hint line `P5. Next interval is playing.` (interval name, no praise) and the next interval auto-plays. [ASSUMPTION] exact wording. |
| Listen: revealed | Listen | Notes light on the active instrument, name in Readout, Next button appears; no penalty. Root note carries the root marker, the other the no-role dot. On guitar [ASSUMPTION]: one position per note, the closest pair near the lowest frets. |
| Listen: mid-question changes | Listen, Setup panel | [ASSUMPTION] Switching to Explore and back keeps the same question and wrong marks (it does not replay). Changing pool, direction or root applies from the next question; the current one stays answerable. |

## Interaction Primitives

Click-to-sound: every note click sounds immediately (on press); the note toggles lit. Click a lit note to unlight it. No hover-only actions.

Root: the root is the chord's root, the lowest lit note of that pitch class (so the inversion C/E marks C, not E); when no chord is named it is the lowest lit note. `R` then click a lit note sets the root (built as `R` then click; no right-click); a note that roots no chord makes the set read as unknown; clicking an alternative reading in the Readout also sets the root and clears a chosen one.

Voicing browsing: `Left` / `Right` or the arrows step; a fret click moves a note (hand-edit, FR-19) and the name keeps updating.

Key map (approved; after review, `Tab` is native, mode switch is `M`, and `[` `]` were added):

| Key | Listen | Explore |
|---|---|---|
| `Space` | Play and replay (unlimited) | Play selected, as an arpeggio |
| `Enter` | Reveal; pressed again = Next | Play block |
| `1`-`9`, `0`, `-`, `=` | Pick interval m2 to P8 | n/a |
| `R` | n/a | Set root |
| `Left` / `Right` | n/a | Step voicings |
| `M` | Switch Listen / Explore | same |
| `I` | Swap Piano / Guitar | same |
| `P` | Open or close setup panel | same |
| `[` `]` | Piano octave down / up | same |
| `Esc` | Close panel or hint; nothing else | Close panel or hint, else clear notes (undoable) |
| `?` | Toggle the shortcuts list | same |
| `Space` / `Enter` on a focused button | Activate that button (not the shortcut above) | same |
| `Tab` | Native focus movement (not a shortcut) | same |

Shortcut rules:
- **Modifiers:** every shortcut, including the interval keys, ignores any event with Ctrl, Alt or Meta held (so browser zoom `Ctrl +`, `Ctrl -`, `Ctrl 0`, reload and print never fire a shortcut). Exception: AltGr (reported as Ctrl+Alt with `getModifierState('AltGraph')`) counts as no modifier.
- **Layouts:** `[` and `]` match on `event.key` (`[`, `]`, including when AltGr produces them) or on key position (`event.code` `BracketLeft` / `BracketRight`), so they work on layouts that need AltGr (for example Hungarian).
- **Repeat:** `Space` and `Enter` ignore auto-repeat (`event.repeat`); holding the key does one action.
- **Yield:** digit keys, `Left` / `Right` / `Up` / `Down` and `Space` / `Enter` all yield when focus is on a tab, radio segment, pool chip or text field (native behavior: arrows move selection, `Space` / `Enter` activate); `Space` and `Enter` also yield to any focused button. So in Listen a focused button gets `Space` / `Enter` as activation, not Play again or Reveal (the shortcuts list says so). Other shortcuts yield only to text fields (none in v1). After a **pointer** click on a control outside the Setup panel, focus returns to the instrument so shortcuts keep working; after a pointer click on a control inside the non-modal Setup panel, focus stays inside the panel (it returns to the opener only on close). **Keyboard** activation keeps focus where it is.
- **Focus after state changes:** Reveal and Next are one button whose label changes, so focus stays on it from Reveal to Next. When the Voicing stepper hides or an arrow goes inert, focus moves to the remaining stepper control, or to the instrument if none is left.
- **Focus order:** Mode strip (Mode tabs, then Instrument toggle) → Instrument (one stop) → Readout alternatives and Voicing stepper → Action buttons (and the Interval row in Listen) → Status note `Undo` button (when shown) → Setup opener and, when open, the panel → Help hint last (both sit in the strip; the opener is the slot just before the Help hint, and the Help hint is the final stop). The wordmark is not a stop.

Deferred: MIDI input is later; on-screen instruments only for now. Leave a seam so a note-on from MIDI can drive the same click-to-sound path.

### Motion

Soft short fade for note light-up. Quick crossfade on instrument swap. Everything instant under `prefers-reduced-motion`. No other animation. [ASSUMPTION] Durations about 120 to 200 ms (set at build).

## Responsive & Platform

Target: laptop browser. Landscape tablets at about the canvas width are acceptable but not designed or tested for; portrait and smaller viewports are unsupported. The design reference is the 1280 x 800 canvas in `DESIGN.md`. There is **no reflow and no small-screen optimization**; no minimum viewport number is set and behavior below the canvas is unsupported.

## Accessibility Floor

Behavioral. Visual contrast lives in `DESIGN.md` (Colors, Contrast).

- Keyboard-first for Listen, mode and instrument switching, transport and voicing stepping; every such action has a key or a Tab-reachable control; shortcuts are discoverable from the Help hint. Instrument note-toggling is pointer-first (limits below).
- Native `Tab` focus traversal in the order defined under Interaction Primitives.
- **Focus ring:** 2px ink outline with a 2px gap, drawn outside the control on `:focus-visible`, on every focusable control, in addition to selected state. Ink on the accent and action fills is under 2:1 in dark (1.63 and 1.46), so the ring must sit outside the control. Token and ratios in `DESIGN.md`.
- Roles are never conveyed by color alone: shape plus color (root ringed, 3rd diamond, 5th square, 7th triangle, no-role dot).
- Wrong guess is marked by ring and strike as well as fill, the Readout hint states it in words, and the button's accessible name carries the state (`m3, tried`).
- Selected states (mode, instrument) expose a selected role to assistive tech, not only fill.
- Honors `prefers-reduced-motion` (see Motion). Theme follows the system setting; a manual switch lives in the setup panel.
- **Live regions** (polite, never assertive): (1) the Readout chord name, debounced about 300 to 500 ms after the last change, name only (not alternatives or legend); (2) Voicing stepper changes (`Voicing 2 of 8`); (3) guess feedback: wrong (`m3 is not it — try another.`), right (`P5. Next interval is playing.`) and Reveal (the interval name); (4) the audio-blocked note, the no-voicing note and `Notes cleared` (polite); (5) the pool hint `Keep at least one interval.` [ASSUMPTION]. [ASSUMPTION] These are the minimum implied by keyboard-first; the user gave no screen-reader brief.

### Accepted limits (user decisions, v1)

- Note toggling on the piano and fretboard is **pointer-only**; there is no keyboard chord-building.
- **No small-screen or reflow support** (see Responsive & Platform).
- **Listen requires hearing**; it has no visual substitute by design. Explore, instruments, chord names and voicings work silently.
- **Screen-reader support is best-effort** (names and live regions above), and full parity for a spatial instrument is out of scope.
- **Setup panel overlap** (user decision): while open, the panel may cover part of the readout and Reveal; it is non-modal and closes with `Esc` or the gear (Setup opener).
- **Dark pool chip and setup segment labels** (user decision): unselected labels, muted on chip over the panel surface, are 4.00:1 in dark (5.02 light), under 4.5 for 22px text; on/off still relies on fill, text color step and weight 600.
- **Italics everywhere** is deliberate.
- **Sound on press is essential** to a musical instrument; notes sound on pointer-down and toggle lit on release.

## Key Flows

### Flow 1: Build on piano, find it on guitar (PRD core loop; Apor at his desk, guitar on his knee)

1. Apor opens accompa; it lands in Explore with the piano on screen.
2. He clicks C, E and G. Each click sounds and lights; the root is marked ringed and filled.
3. The Readout names the chord live: `C major`. The Role legend lists root, 3rd, 5th.
4. He presses `I` (or clicks Guitar). The instrument crossfades to the fretboard; the chord carries over.
5. **Climax:** the fretboard shows a shape he can play right now, with the best voicing first (`Voicing 1 of N`), root marked, open and muted strings shown.
6. He plays it on his own guitar, then steps `Right` through other voicings, or clicks a fret to move a note; the name keeps updating.

Failure: no voicing fits these notes, so the fretboard is empty and the Status note says `No voicing fits these notes.`; notes stay lit on piano. Failure: audio blocked, so `Press any key to wake the sound.` appears near the instrument.

### Flow 2: On-demand ear practice (PRD core loop; Apor, ten minutes before practice)

1. Apor presses `M` into Listen. A question starts; the interval plays.
2. He presses `Space` to hear it again, as often as he likes.
3. He clicks an interval (or presses its key). Wrong: the button is marked and disabled, the question stays, `m3 is not it — try another.`
4. He guesses again, or skips guessing and presses `Enter` for Reveal.
5. **Climax:** Reveal lights both notes on the active instrument and names the interval in the Readout, no score, no penalty. A right guess instead advances straight to the next interval, which plays.
6. `Enter` again (or Next) plays a new interval.
7. `P` opens the setup panel to change the pool, direction, root or sound; `Esc` closes it.

Failure: audio blocked, same note as Flow 1.

### Flow 3: Chord ear practice (PRD FR-22)

User-confirmed: it reuses the Listen pattern of Flow 2 with a chord-quality pool, answer buttons for chord qualities, and Reveal lighting the chord on the active instrument. Guess-by-click is optional, as in FR-22. Button layout and keys for chord qualities are set when slice 1B practice is built.

## Open items

- Only the inline [ASSUMPTION] tags remain open: build-time defaults, revisit when real code exists (search for the tag). The Listen layout, setup panel placement and size are accepted by the user.
- Defaults, not open: the Palatino stack is the v1 font stack (a later web-font swap sits behind the typography tokens; decided by the user); guitar-view type sizes are tuned at build against the 1280 x 800 canvas; prose stroke, opacity and state values may be extracted into tokens at build time (DESIGN.md).
- Piano voicings and inversions are Phase 2 (FR-21 withdrawn); no piano voicing UI in this spine.

## PRD sync

The PRD was updated on 2026-10-23 (`bmad-prd` Update):
- **FR-6** rewritten for optional guess-by-click.
- **FR-21** withdrawn: voicings are guitar-only in Phase 1; piano inversions are Phase 2.
- **FR-12** no longer includes choosing a chord by root and quality (a Phase 2 chord library); the builder is note-clicking.
- **Naming**: the PRD now uses Listen and Explore; Piano / Guitar is an instrument toggle, not a mode.
- **FR-17** span limit decided (4 frets); other voicing rules are `[ASSUMPTION]` defaults in the PRD and architecture AD-8.
- **FR-21** stays withdrawn: piano inversions are deferred to Phase 2.
- **FR-22** is user-confirmed as the Listen pattern with chord qualities (Flow 3).
- **Open Questions** are all closed: sound (synthesized v1, samples Phase 2), tech stack, swap UX, voicing rules, piano inversions, persisted settings (matches AD-6).
