---
name: accompa
status: final
updated: 2026-10-28
sources:
  - _bmad-output/planning-artifacts/prds/prd-accompa-2026-10-22/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-accompa-2026-10-23/ARCHITECTURE-SPINE.md
companion: DESIGN.md
---

# accompa — Experience Spine

> **PRD override (applied).** The user confirmed that Listen has an optional guess-by-click (correct answer advances, wrong answer stays marked). PRD FR-6 was rewritten to match on 2026-10-23. There is still no score counter, and guessing is optional.
>
> **Vocabulary.** PRD "Practice mode (listen and reveal)" is **Listen**; PRD "Free-play mode" plus the chord builder is **Explore**. Piano and Guitar are not sections; they are an always-visible instrument toggle. Phase 2 adds two sections, **Chord drill** (PRD "chord flash drill") and **Circle of fifths** (PRD "circle of fifths and progressions page"), so the app has **four sections** reached from a side rail. "Mode" in the Phase 1 text means section.
>
> **Phase 2 (2026-10-28).** This spine now covers PRD FR-23 to FR-33: the side rail (FR-32), the chord builder (FR-28), inversions (FR-27), the chord drill (FR-29 to FR-31), the circle of fifths page (FR-33, discovered with the user: no progressions) and the sampled-sound setting (FR-23). **Changed rules:** the top Mode strip and the `M` shortcut are gone; the instrument's top edge no longer has to stay put between sections (only inside one).

## Foundation

Laptop browser (see Responsive & Platform for viewport scope), client-only static app, one user (Apor, a guitarist who also plays some piano). No mobile, no accounts. `DESIGN.md` is the visual reference (tokens, shapes, components); this spine is behavior. Light theme is primary, dark is the twin.

**Keyboard-first is scoped, not total.** It covers Listen, switching, transport and voicing stepping; note toggling is pointer-first (see Accessibility Floor).

**Precedence (stated once).** EXPERIENCE.md and DESIGN.md win over every mock and wireframe on every point, including color and type. The mocks' visual render is unchecked: the designer never viewed them in a browser.

References:
- [`wireframes/flow-build-chord-2026-10-23.excalidraw`](wireframes/flow-build-chord-2026-10-23.excalidraw): 4-frame Explore flow, piano to guitar. Illustrates IA, voicing stepper, role markers.
- [`mockups/key-explore-piano.html`](mockups/key-explore-piano.html), [`mockups/key-explore-guitar.html`](mockups/key-explore-guitar.html), [`mockups/key-listen-setup.html`](mockups/key-listen-setup.html): key screens (inline links at each section below).
- Phase 2 mocks (1216 x 800 frames with the collapsed rail): [`mockups/rail-icons.html`](mockups/rail-icons.html), [`mockups/chord-builder-explore.html`](mockups/chord-builder-explore.html), [`mockups/chord-drill.html`](mockups/chord-drill.html), [`mockups/circle-page.html`](mockups/circle-page.html). The three Phase 1 key screens above still show the old top strip; the side rail supersedes it. Same precedence: the spines win.
- Mocks are illustrative, not production markup: they are span-built controls with inset box-shadow rings that forced-colors modes would strip. Build real buttons, groups and outlines.
- Exploration record, not normative: [`.working/directions-1.html`](.working/directions-1.html), [`.working/color-themes-1.html`](.working/color-themes-1.html) (also linked from DESIGN.md).

### Persisted settings

Persisted across sessions: sound choice, theme (including a manual override of the system setting), interval pool, the Mark misses option (Phase 2) and whether the side rail is collapsed or open (Phase 2, saved in `localStorage`). Not persisted: chord, voicing, inversion, current question or drill chord, direction and root mode. The Phase 1 list matches the architecture spine (AD-6); **the two Phase 2 additions are not in AD-6 yet and need an architecture update.**

## Information Architecture

Four sections sit side by side, reached from a side rail: Listen, Explore, Chord drill and Circle of fifths. The instrument (piano or guitar) is on screen in every section except the Circle of fifths.

| Surface | Reached from | Purpose |
|---|---|---|
| Explore (default on open) | App open; the rail | Build and name chords by clicking notes or with the chord builder, voicings, inversions, free-play. |
| Listen | The rail | Hear an interval or a chord, optionally guess, reveal. |
| Chord drill | The rail | The app names a chord; the user builds it on the instrument; Try checks it, Reveal shows it. No score. |
| Circle of fifths | The rail | A visual reference: pick a key on the circle and see its seven chords. No instrument, no ear training. |
| Side rail | Always on screen | Section navigation, Piano / Guitar toggle, Setup opener, Help hint. Collapsed by default. |
| Setup panel | `P` or the Setup opener (cog icon), on demand, from any section | Listen setup, Mark misses (drill), sound choice, theme. |
| Setup opener | Cog icon at the bottom of the rail, beside the Help hint | Opens or closes the Setup panel (same as `P`). |
| Help hint | `?` at the bottom of the rail, on hover or focus | Reveals the shortcuts list. |

Persistent chrome: a **Side rail** on the left (wordmark and a chevron toggle, the four section items, Piano / Guitar toggle, Setup opener, Help hint). It opens **collapsed** (icons only, the wordmark shown as the italic `a`); a click on the chevron opens it (icon plus label) and a click again collapses it; the state is saved. No hover expansion, so the instrument never shifts under the pointer. There is no top bar. Beside the rail: Readout, instrument, controls. Switching sections keeps the instrument choice and the Explore workspace. [Mock: rail and icons](mockups/rail-icons.html). The Piano / Guitar toggle is hidden on the Circle of fifths (that page has no instrument), and `I` does nothing there.

Listen layout ([mock](mockups/key-listen-setup.html)) is **accepted by the user** (behavior and arrangement): Readout shows the question, the instrument below, a control row (Play again, Reveal), and a row of 12 Interval buttons. Setup panel contents are decided (interval pool, direction, root, Mark misses, sound choice, theme); its **size (560px floating overlay) is accepted by the user**; its anchor moved with the rail (see DESIGN.md Layout & Spacing). The Listen readout block is shorter than the Explore one (changed rule above), so the Listen instrument is larger than it was.

The workspace (current chord, voicing, inversion) is shared across Piano and Guitar and survives a swap and swap-back (ARCHITECTURE-SPINE AD-5). Listen never overwrites it. [ASSUMPTION] The Chord drill, like Listen, keeps its own lit notes and question and never overwrites the workspace; entering the drill starts a fresh board.

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
| `Not quite, try again.` | `Wrong!` |
| `Not quite. The crossed note is not in this chord.` | `Incorrect notes highlighted in red` |
| `Loading the guitar sound.` | `Please wait, loading audio...` |

Chord and interval names come from the one spelling module (AD-3); copy never spells notes itself. The 6-semitone interval is labelled **A4** (aligned with ARCHITECTURE-SPINE AD-3).

## Inspiration & Anti-patterns

No app references (user decision). Anti-patterns the user rejected: a realistic or skeuomorphic piano or fretboard; anything that reads as an instrument rather than a tool; a different selected-state look per control; green on the Explore or Listen mode buttons; scores, streaks and praise.

## Component Patterns

Visual specs live in `DESIGN.md` Components. Names are identical. Mock per component: [Explore piano](mockups/key-explore-piano.html) (tabs, toggle, hint and strip are superseded by the rail; Readout, legend, keyboard, markers, Action button still apply); [Explore guitar](mockups/key-explore-guitar.html) (Fretboard, stepper, bar, Status note); [Listen and setup](mockups/key-listen-setup.html) (Interval button, Setup panel, Setup opener shown pressed); Phase 2: [rail and icons](mockups/rail-icons.html), [Explore with the builder](mockups/chord-builder-explore.html) (Root cell, Quality chip, inversion stepper, new role shapes), [Chord drill](mockups/chord-drill.html), [Circle of fifths](mockups/circle-page.html).

| Component | Use | Behavioral rules |
|---|---|---|
| Side rail | Left of every section | Always present, never scrolls away. Houses the wordmark and chevron toggle, the four Rail items, the Instrument toggle, the Setup opener and the Help hint. Collapsed by default (icons only); the chevron button (accessible name `Expand navigation` / `Collapse navigation`, `aria-expanded`) toggles it by click or keyboard activation; the state is saved. No hover expansion. |
| Rail item | Listen / Explore / Chord drill / Circle of fifths | A real button (or link) per section, one selected at a time, styled `{components.rail-item-selected}`, `aria-current="page"` on the selected one. Clicking switches section and keeps the instrument and workspace. Collapsed, the label is hidden visually but remains the accessible name,. No keyboard shortcut for switching (the `M` shortcut is removed, user decision); `Tab` and `Enter` or `Space` are the ordinary route. |
| Instrument toggle | Piano / Guitar, bottom of the rail | One selected, styled `{components.instrument-toggle-selected}`, smaller with icons (labels when the rail is open). `I` swaps. Crossfade, see Motion. Hidden on the Circle of fifths. |
| Setup opener | Cog icon at the bottom of the rail, beside the Help hint | A real button, accessible name `Setup`, `aria-expanded` reflects the panel state, keyboard focusable. Click or `P` opens or closes the panel; `Esc` closes it and returns focus to the opener. Shown in every section. Visual: `{components.setup-opener}` (small circle, muted cog glyph, quiet). The cog is a toothed gear, not rays, so it does not read as a theme switch. |
| Help hint | `?` at the bottom of the rail, beside the Setup opener | Hover or keyboard focus reveals the shortcuts list; `?` toggles it; `Esc` dismisses it; the list stays open while hovered. The list opens away from the rail edge so it stays on screen. |
| Readout | Explore: live chord name. Listen: `Which interval?`, then the interval name after Reveal. Chord drill: the asked chord name. | Updates live on every note change in Explore. Multiple readings: the first is large, the others are small clickable italic alternatives. **Clicking an alternative changes both the name and the root**: the notes stay the same, the root marker moves to that reading's root, the Readout and Role legend update (for example `C6` vs `Am7/C`). With an inversion the name is a slash chord (`C major / E`); the long name steps its type size down. Empty chord: prompt line (see States). Chord names come only from the namer. |
| Role legend | Under Readout | Shows roles present with their note names (`root C`, `3rd E`, `5th G`, `7th B`, `9th D`). Updates with the chord. In the drill it appears only after the answer shows. |
| Piano keyboard | Instrument | Three octaves. Click key: sounds on press, toggles lit on release. Root marked differently. `[` and `]` shift one octave. |
| Fretboard | Instrument | Click a fret position: sounds and toggles that note (one per string in a voicing). Shows open and muted markers; an open string is its role shape inside a ring at the nut. A chord shows as one voicing. Carries decorative position dots at frets 3, 5, 7, 9 and a double dot at 12 (not interactive, not announced). |
| Role marker | On piano keys and frets | Root is ringed and filled; 3rd, 5th, 7th, 2nd or 9th, 4th and 6th are distinct shapes (diamond, square, triangle, pentagon, hexagon, star), always shape plus color. A lit note with no role gets the no-role dot. In the drill, notes are no-role dots until the answer shows. |
| Action button | Play and reveal controls | Click or its key-hint key. One primary per row. Explore: Play (`Space`, an arpeggio low to high), Block (`Enter`, primary), on one line with the builder's root cells. Listen: Play again (`Space`), Reveal (`Enter`). After Reveal, a Next button takes the primary slot; `Enter` again = Next. Chord drill: Play (`Space`, plays what is lit), Try (`Enter`, primary; plays what is lit and checks it; `aria-disabled` until at least three notes are lit), Reveal (`R`). After a right answer or Reveal, Try and Reveal give way to Next (`Enter`) and Play stays. |
| Interval button | Listen, 12 of them (m2 to P8) | Click or keys `1`-`9`, `0`, `-`, `=`. Correct: advances to the next question and auto-plays it. Wrong: the button is marked and disabled until the next question; the question stays. Disabled while revealed. Only intervals in the pool are enabled; [ASSUMPTION] pool-excluded buttons are shown disabled, not hidden. A wrong button keeps focusability for assistive tech (`aria-disabled`), and its accessible name carries the state (for example `m3, tried`). |
| Voicing stepper | Explore, guitar view | `◀ Voicing 1 of N ▶`; `Left` / `Right` or the arrows step. [ASSUMPTION] No wrap: the arrow at either end is inert (`aria-disabled`, replaced visually by `·`). If a focused arrow goes inert, focus moves to the remaining stepper arrow; if the stepper hides, to the instrument if no stepper control is left. Best playable shape ranks first. Guitar only. |
| Inversion stepper | Explore, both instruments, same row as the Voicing stepper | Same component and same arrows: `◀ Root position ▶`, then `1st inversion`, `2nd inversion`, `3rd inversion`. Chords of four or more tones reach the 3rd inversion; triads stop at the 2nd; a chord with fewer than three tones shows no stepper. No wrap, same inert-end rule. **Piano:** the bass note becomes the chosen chord tone and the notes below it rotate up an octave; no piano voicing generator. **Guitar:** both steppers sit on one line (voicing first, inversion second) and the voicing list is filtered to voicings whose lowest note is the chosen bass; the count updates. The readout becomes a slash chord. Keys: `Up` / `Down` step the inversion (`Left` / `Right` keep stepping voicings). Choosing a new chord resets the inversion to root position. |
| Root cell | Explore, builder row | One of 12, pointer-only. Natural roots are one button. The five two-spelling roots are one square cut by a diagonal into two buttons, sharp upper-left and flat lower-right, each clickable on its own and each with its own accessible name (`C sharp`, `D flat`). Clicking picks the root and keeps the quality; the clicked half stays highlighted. The 12 cells and the quality chips are **not** a keyboard tool in v1 (builder is pointer-only, like note toggling). |
| Quality chip | Explore, builder row (under the root cells) | 17 chips in four labelled groups, all visible, no submenu: Triads (maj, min, dim, aug, sus2, sus4), Sixths (6, m6), Sevenths (maj7, 7, m7, m7♭5, dim7), Ninths (add9, 9, maj9, m9). Clicking picks the quality and keeps the root; the chip stays highlighted. With a root and a quality chosen, **the chord replaces whatever was lit** (no confirmation; Esc-clear undo logic is unchanged) and behaves like any chord: named, playable as block or arpeggio, carried to the guitar as the best-fit voicing with the stepper cycling others. The piano lands the chord at a fixed octave. Clicking a note by hand afterwards clears the root and quality highlights, because they no longer describe the notes. Choosing a quality before a root is allowed and does nothing until both are set. |
| Setup panel | On demand | Non-modal. `P` toggles, `Esc` closes. Focus enters on open and returns to the opener on close. Holds the inner controls below, top to bottom: Listen setup (pool, Direction, Root), `Chord drill` with Mark misses, Sound, Theme. Opened from any section. Width (560px) and floating overlap of the instrument are accepted by the user; its anchor is an assumption now that the strip is gone (DESIGN.md). |
| Pool chip | Setup panel | Checkbox chip per interval; on = selected treatment (accent fill, weight 600), no check glyph. [ASSUMPTION] At least one interval stays selected; the last ticked chip cannot be unticked: it gets `aria-disabled` (stays focusable), a non-colour cue, and a live-region hint `Keep at least one interval.` [ASSUMPTION]. On/off cue is fill, text color and weight, with no check glyph (user decision); dark unselected label contrast on the panel is 4.00 (muted on chip over surface; light 5.02), an accepted limit (see Accessibility Floor). |
| Setup segmented control | Setup panel | Direction (Ascending, Descending, Harmonic), Root (Random, Fixed), Sound (Samples, Synthesized), Theme (System, Light, Dark), Mark misses (On, Off). One selected, same treatment as the Instrument toggle. Each has a Setup label. **Sound** is one setting that follows the instrument: Samples plays the piano samples on the piano and the guitar samples on the guitar, in Explore, Listen and the drill; default Samples; a hint line under it says so. Synthesized stays as a choice. **Mark misses** (default On) has the hint `Crosses notes that are not in the chord after two tries.` |
| Setup label | Setup panel | Names a control group; programmatically associated with it. |
| Status note | Near instrument | Quiet italic line for no-voicing, audio-blocked, sound-loading, offscreen-lit and clear-undo messages. Never modal. `Loading the guitar sound.` (or piano) shows in the audio-blocked spot while the samples load; notes play as soon as the sound is ready; it disappears when loaded. |
| Circle wedge | Circle of fifths | 24 wedges: 12 major keys outside, their relative minors inside. A real button each, accessible name `G major` or `E minor`, selected exposed (`aria-pressed` or equivalent). Click selects that key; the circle highlights the key one step either side on both rings and the relative on the other ring; the centre shows the short key name (`G`, `Gm`). [ASSUMPTION] The page opens with C major selected. Selecting a minor wedge selects that minor key. |
| Chord chip | Circle of fifths, bottom row | Seven chips for the selected key: Roman numeral, chord name, a role word. Click or Enter plays the chord (the active sound); no selected state is kept. The home chip is tinted as a fixed marker, not a selection. Major key: I ii iii IV V vi vii°. Minor key follows the scale picker (below). Triads only. Names come from the namer. |
| Minor-scale picker | Circle of fifths, right of the circle | Natural / Harmonic / Melodic, shown only when a minor key is selected, one selected at a time. Natural: i ii° III iv v VI VII. Harmonic: i ii° III+ iv V VI vii°. Melodic (ascending): i ii III+ IV V vi° vii°. Switching changes the chord row; the circle and the key do not change. |
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
| Rail collapsed or open | Side rail | Opens collapsed on first run; a chevron click toggles and the choice is saved. Collapsed, items show icon only; open, icon plus label. Never changes on hover. |
| Samples loading | Any section | Status note `Loading the guitar sound.` (or piano) until the samples are ready; notes sound when ready; the synthesized sound is unaffected. |
| Builder: both picked | Explore | Root cell and quality chip both highlighted; the chord replaces the lit notes. Clicking a note by hand clears both highlights. |
| Inversion available | Explore | Stepper shows `Root position`; stepping reads `1st inversion` and so on; readout becomes `C major / E`. Guitar with no voicing for the chosen bass: same no-voicing state (`No voicing fits these notes.`), the inversion stepper stays so the user can step back. |
| Drill: building | Chord drill | Readout shows the asked chord; empty hint row; no legend; lit notes are plain dots; Try is `aria-disabled` under three notes; Play and Reveal live. |
| Drill: wrong, first try | Chord drill | Hint `Not quite, try again.`; notes stay lit; nothing is marked. |
| Drill: wrong, second try or more | Chord drill | If Mark misses is on: hint `Not quite. The crossed note is not in this chord.` and each lit note that is not in the chord shows the cross shape; if off, the first-try hint repeats. Missing notes are never shown (that is Reveal's job). |
| Drill: right or revealed | Chord drill | Notes light with role shapes, legend appears, the chord is played, Try and Reveal give way to Next. No praise, no score. A right answer has every required tone of the asked chord lit and no tone outside the chord, in any octave, voicing or inversion; an omitted 5th counts (AD-13: a separate core check, not the namer). Nothing advances automatically. |
| Circle: selection | Circle of fifths | Selected wedge accent, related wedges tinted, centre shows the key, chord row updates; minor selection reveals the scale picker; a major selection hides it. |

## Interaction Primitives

Click-to-sound: every note click sounds immediately (on press); the note toggles lit. Click a lit note to unlight it. No hover-only actions.

Root: the root is the chord's root, the lowest lit note of that pitch class (so the inversion C/E marks C, not E); when no chord is named it is the lowest lit note. `R` then click a lit note sets the root (built as `R` then click; no right-click); a note that roots no chord makes the set read as unknown; clicking an alternative reading in the Readout also sets the root and clears a chosen one.

Voicing browsing: `Left` / `Right` or the arrows step; a fret click moves a note (hand-edit, FR-19) and the name keeps updating. Inversion browsing: `Up` / `Down` or the arrows step the inversion.

Builder and circle: the root cells, quality chips and circle wedges are pointer-first controls (clicking is the route; they are also reachable by `Tab` as buttons). Clicking a circle chord chip plays it and selects nothing.

Key map (approved; after review `Tab` is native and `[` `]` were added; Phase 2 removes the mode-switch key `M`, since the rail is clicked or reached with the ordinary `Tab` and `Enter`):

| Key | Listen | Explore | Chord drill | Circle |
|---|---|---|---|---|
| `Space` | Play and replay (unlimited) | Play selected, as an arpeggio | Play what is lit | n/a |
| `Enter` | Reveal; pressed again = Next | Play block | Try; after the answer, Next | n/a |
| `1`-`9`, `0`, `-`, `=` | Pick interval m2 to P8 | n/a | n/a | n/a |
| `R` | n/a | Set root | Reveal | n/a |
| `Left` / `Right` | n/a | Step voicings | n/a | n/a |
| `Up` / `Down` | n/a | Step the inversion | n/a | n/a |
| `I` | Swap Piano / Guitar | same | same | does nothing (no instrument) |
| `P` | Open or close setup panel | same | same | same |
| `[` `]` | Piano octave down / up | same | same | n/a |
| `Esc` | Close panel or hint; nothing else | Close panel or hint, else clear notes (undoable) | Close panel or hint, else clear the notes you lit | Close panel or hint |
| `?` | Toggle the shortcuts list | same | same | same |
| `Space` / `Enter` on a focused button | Activate that button (not the shortcut above) | same | same | same |
| `Tab` | Native focus movement (not a shortcut) | same | same | same |

Shortcut rules:
- **Modifiers:** every shortcut, including the interval keys, ignores any event with Ctrl, Alt or Meta held (so browser zoom `Ctrl +`, `Ctrl -`, `Ctrl 0`, reload and print never fire a shortcut). Exception: AltGr (reported as Ctrl+Alt with `getModifierState('AltGraph')`) counts as no modifier.
- **Layouts:** `[` and `]` match on `event.key` (`[`, `]`, including when AltGr produces them) or on key position (`event.code` `BracketLeft` / `BracketRight`), so they work on layouts that need AltGr (for example Hungarian).
- **Repeat:** `Space` and `Enter` ignore auto-repeat (`event.repeat`); holding the key does one action.
- **Yield:** digit keys, `Left` / `Right` / `Up` / `Down` and `Space` / `Enter` all yield when focus is on a tab, radio segment, pool chip or text field (native behavior: arrows move selection, `Space` / `Enter` activate); `Space` and `Enter` also yield to any focused button. So in Listen a focused button gets `Space` / `Enter` as activation, not Play again or Reveal, and in the drill a focused button gets them as activation, not Play or Try (the shortcuts list says so). Rail items, the rail toggle, root cells, quality chips, circle wedges, chord chips and scale pills are all buttons, so they always take `Space` / `Enter` as activation. Other shortcuts yield only to text fields (none in v1). After a **pointer** click on a control outside the Setup panel, focus returns to the instrument so shortcuts keep working; after a pointer click on a control inside the non-modal Setup panel, focus stays inside the panel (it returns to the opener only on close). `Up` / `Down` act on the inversion stepper only when focus is on the instrument or on a stepper arrow. **Keyboard** activation keeps focus where it is.
- **Focus after state changes:** Reveal and Next are one button whose label changes in Listen, so focus stays on it from Reveal to Next. In the drill, Try becomes Next in the same slot, so focus stays put; if Reveal was focused it moves to Next. After a pointer click in the rail, focus stays on that rail item (it does not jump to the instrument, because the section content is replaced). When the Voicing stepper hides or an arrow goes inert, focus moves to the remaining stepper control, or to the instrument if none is left.
- **Focus order:** Side rail (chevron toggle, then the four Rail items, then the Instrument toggle, then the Setup opener, then the Help hint) → section content: in Explore the Readout alternatives, the Voicing and Inversion steppers, the Instrument (one stop), Play and Block, the root cells, the quality chips, the Status note `Undo` button (when shown); in Listen the Instrument, Action buttons and the Interval row; in the drill the Instrument, then Play, Try, Reveal; on the Circle the wedges (major ring then minor ring, clockwise from the top), the scale picker (minor only), then the chord chips → the Setup panel when open (it is entered on open and returns to the opener on close). The wordmark is not a stop. [ASSUMPTION] The rail comes first because it is first in reading order; a skip link to the content is not specified.

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
- Roles are never conveyed by color alone: shape plus color (root ringed, 3rd diamond, 5th square, 7th triangle, 2nd or 9th pentagon, 4th hexagon, 6th star, no-role dot). The lilac 9th is within 1.10:1 of the violet 7th, so only the pentagon-versus-triangle shape separates them.
- **Drill wrong notes:** a note that is not in the chord is marked by a cross shape, not by color, and the hint states it in words (`The crossed note is not in this chord.`); the hint is a polite live region. The cross appears only on the second miss and later, and only when Mark misses is on.
- **Builder and root cells:** each root button has a full accessible name, and the two halves of a split cell are separate named buttons (`C sharp` and `D flat`), so the diagonal is never the only cue. Quality chips are named with their group (`Sevenths, maj7`), and the selected root and quality expose a pressed state.
- **Rail:** collapsed icons carry no text, so each Rail item, the Instrument toggle segments, the cog and the `?` have a visible-or-accessible name (`Listen`, `Chord drill`, `Piano`, `Setup`, `Help`); the selected item exposes `aria-current`. Icons are decorative (`aria-hidden`).
- **Circle of fifths:** each wedge is a named button (`G major, selected`, `E minor`); the centre key is read as live text; chord chips are buttons named with numeral and chord (`IV, C`); the home chip is named `I, G, home`. No information is carried by the wedge tint alone: selection and relation are also in the names.
- Wrong guess is marked by ring and strike as well as fill, the Readout hint states it in words, and the button's accessible name carries the state (`m3, tried`).
- Selected states (mode, instrument) expose a selected role to assistive tech, not only fill.
- Honors `prefers-reduced-motion` (see Motion). Theme follows the system setting; a manual switch lives in the setup panel.
- **Live regions** (polite, never assertive): (1) the Readout chord name, debounced about 300 to 500 ms after the last change, name only (not alternatives or legend); (2) Voicing stepper changes (`Voicing 2 of 8`); (3) guess feedback: wrong (`m3 is not it — try another.`), right (`P5. Next interval is playing.`) and Reveal (the interval name); (4) the audio-blocked note, the no-voicing note and `Notes cleared` (polite); (5) the pool hint `Keep at least one interval.` [ASSUMPTION]; (6) the drill hint (`Not quite, try again.`, `Not quite. The crossed note is not in this chord.`) and the Inversion stepper (`1st inversion`); (7) the sound-loading note. [ASSUMPTION] These are the minimum implied by keyboard-first; the user gave no screen-reader brief.

### Accepted limits (user decisions, v1)

- Note toggling on the piano and fretboard is **pointer-only**; there is no keyboard chord-building.
- **No small-screen or reflow support** (see Responsive & Platform).
- **Listen requires hearing**; it has no visual substitute by design. Explore, instruments, chord names and voicings work silently.
- **Screen-reader support is best-effort** (names and live regions above), and full parity for a spatial instrument is out of scope.
- **Setup panel overlap** (user decision): while open, the panel may cover part of the readout and Reveal; it is non-modal and closes with `Esc` or the gear (Setup opener).
- **Dark pool chip and setup segment labels** (user decision): unselected labels, muted on chip over the panel surface, are 4.00:1 in dark (5.02 light), under 4.5 for 22px text; on/off still relies on fill, text color step and weight 600.
- **Italics everywhere** is deliberate.
- **Collapsed rail icons** (user decision) are small and rely on accessible names; the rail opens to labels on a click, and its state is remembered.
- **Drill and circle sound** require hearing to be complete (the drill still works silently: the name is the question and Try only checks pitch classes; the circle page works silently as a reference).
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

1. Apor clicks Listen in the rail. A question starts; the interval plays.
2. He presses `Space` to hear it again, as often as he likes.
3. He clicks an interval (or presses its key). Wrong: the button is marked and disabled, the question stays, `m3 is not it — try another.`
4. He guesses again, or skips guessing and presses `Enter` for Reveal.
5. **Climax:** Reveal lights both notes on the active instrument and names the interval in the Readout, no score, no penalty. A right guess instead advances straight to the next interval, which plays.
6. `Enter` again (or Next) plays a new interval.
7. `P` opens the setup panel to change the pool, direction, root or sound; `Esc` closes it.

Failure: audio blocked, same note as Flow 1.

### Flow 3: Chord ear practice (PRD FR-22)

User-confirmed: it reuses the Listen pattern of Flow 2 with a chord-quality pool, answer buttons for chord qualities, and Reveal lighting the chord on the active instrument. Guess-by-click is optional, as in FR-22. Button layout and keys for chord qualities are set when slice 1B practice is built.

### Flow 4: Pick a chord, see it, find it on guitar (Apor, mid-song, needs F♯m7 now)

1. Apor is in Explore on the piano. He clicks the F♯/G♭ cell, on its sharp half, in the root row at the bottom.
2. He clicks `m7` in the Sevenths group. The chord lights on the piano with its role shapes, the Readout says `F♯m7`, and the legend lists root, 3rd, 5th, 7th. Both his root cell and the `m7` chip stay highlighted.
3. He plays it (`Enter` for the block, `Space` for the arpeggio) and hears it.
4. He clicks Guitar in the rail. The chord arrives as the best-fitting voicing.
5. **Climax:** he sees a voicing he can play right now, and steps `Right` through others up the neck; the same chord appears in other places on the fretboard. He tries `2nd inversion` next to it and the voicing list narrows to shapes with that bass note.
6. He changes his mind and clicks `m9`: the new chord replaces the old and the root cell stays lit.

Failure: no voicing fits the chosen bass, so the fretboard is empty and the Status note says `No voicing fits these notes.`; the Inversion stepper stays so he can step back.

### Flow 5: Chord drill (Apor, five minutes before dinner, guitar on his knee)

1. Apor clicks Chord drill in the rail. The Readout shows a chord name, say `B♭maj7`. The board is empty.
2. He builds it on the guitar, one note at a time; the notes are plain dots, and each sounds.
3. He presses `Enter` for Try. It plays what he lit and the hint says `Not quite, try again.` The notes stay.
4. He adjusts and tries again; one note is still not in the chord, so now it shows a cross and the hint says `Not quite. The crossed note is not in this chord.`
5. He moves that note and presses `Enter` again.
6. **Climax:** the chord is right. The notes take their role shapes, the legend appears, the chord plays, and Try and Reveal become Next. Nothing says well done and nothing counts it. If he had given up, `R` would have revealed the same state.
7. `Enter` starts the next chord, whenever he chooses.

Failure: audio blocked or samples still loading, same notes as Flow 1.

### Flow 6: Look up a key (Apor, writing a song in G)

1. Apor clicks Circle of fifths in the rail. The page opens on a circle with a key selected and its seven chords along the bottom.
2. He clicks the G wedge. The circle highlights the keys either side and the relative minor, and the centre reads `G`.
3. He reads the chord row: `I G`, `ii Am`, `iii Bm`, `IV C`, `V D`, `vi Em`, `vii° F♯°`.
4. He clicks `Em` on the minor ring to check the relative minor. The centre reads `Em` and a Natural / Harmonic / Melodic picker appears to the right of the circle.
5. He switches to Harmonic; the row changes (V becomes a major chord, vii° changes).
6. **Climax:** he clicks the `D` chip and hears it, then `Em`; the movement he had in his head is in the chord row with its numerals.

Failure: audio blocked, same note as Flow 1.

## Open items

- Only the inline [ASSUMPTION] tags remain open: build-time defaults, revisit when real code exists (search for the tag). The Listen layout, setup panel placement and size are accepted by the user.
- Defaults, not open: the Palatino stack is the v1 font stack (a later web-font swap sits behind the typography tokens; decided by the user); guitar-view type sizes are tuned at build against the 1280 x 800 canvas; prose stroke, opacity and state values may be extracted into tokens at build time (DESIGN.md).
- Inversions on both instruments are specified in this spine (FR-27): a stepper in the Voicing row, no piano voicing generator.
- **Phase 2 open items for downstream (not decided here):**
  - A guitar voicing that omits the 5th counts as a right answer in the drill; architecture to confirm against the voicing rules.
  - Chord and note spelling and slash names come only from `nameChord` (the drill's answer check is the separate AD-13 function, which names nothing); the mocks' spellings are approximate (for example raised notes in minor-scale chords, `C 9` spacing).
  - The dark-mode contrast of the three new role colours was computed but not viewed; the lilac 2nd or 9th is near the violet 7th (shape separates them). Confirm or retune at build.
  - Rail label names (`Listen`, `Explore`, `Chord drill`, `Circle of fifths`) and the icon glyph shapes are proposals to confirm.
  - Circle-page chip labels are built from a spelled root and a quality (AD-12), with a small chip-label function giving `+` and `°`; the minor-scale forms shown are triads only, fixed by AD-12.
  - Persisted settings: Mark misses and the rail state are added here, and AD-6 now lists them (2026-10-28).
  - The Setup panel anchor now that the top strip is gone. The circle page opens on C major (AD-12).
  - Sample source, size and loading time (FR-23) belong to architecture.

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

Phase 2 sync (2026-10-28), for a `bmad-prd` Update:
- **FR-32** is decided here: a side rail with four sections, collapsed by default, state saved. The PRD (updated 2026-10-28) names the same four sections: Listen, Explore, Chord drill and Circle of fifths.
- **FR-33** is discovered: the circle of fifths page with a chord row per key, major and minor (natural, harmonic, melodic), no key signature, no progressions, no ear training.
- **FR-28** controls are decided: a root row and a 17-chip quality row in Explore. **FR-27** control is decided: an inversion stepper in the Voicing row. **FR-29 to FR-31** are decided as Flow 5. **FR-23** setting is decided: Samples or Synthesized, following the instrument.
