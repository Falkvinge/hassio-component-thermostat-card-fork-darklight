## Context

The card renders the ambient / target temperature as SVG `<text>` with two `<tspan>` children:

- main tspan: whole-degree digits, 120px bold, centered (`text-anchor: middle`) at `x = radius + offset` (offset is `-8` or `+8` for dual mode, `0` otherwise; see `_buildText` callers)
- superscript tspan: decimal digit, 40px bold, positioned at `x = radius + radius/3.1 + offset` with a `+20` hack added to `offset` when the label is `target` or `ambient`, to push the decimal clear of the whole-digit text

Relevant code (`dist/thermostat_card.lib.js` `_buildText`):

```javascript
const target = SvgUtil.createSVGElement('text', {
  x: radius + offset,
  y: radius - (name == 'title' ? radius / 2 : 0),
  class: `dial__lbl dial__lbl--${name}`,
  id: name
});
const text = SvgUtil.createSVGElement('tspan', {});
// hack
if (name == 'target' || name == 'ambient') offset += 20;
const superscript = SvgUtil.createSVGElement('tspan', {
  x: radius + radius / 3.1 + offset,
  y: radius - radius / 6,
  class: `dial__lbl--super--${name}`
});
```

Relevant CSS (`dist/styles.js`):

```css
.dial__lbl--target { font-size: 120px; font-weight: bold; visibility: hidden; }
.dial__lbl--ambient { font-size: 120px; font-weight: bold; visibility: visible; }
.dial__lbl--super--ambient, .dial__lbl--super--target { font-size: 40px; font-weight: bold; }
.dial__lbl--title { font-size: 24px; }
```

The title label is positioned by the same `_buildText` function with a special-case in the `y` expression: `y: radius - (name == 'title' ? radius / 2 : 0)`. For the default `config.diameter = 400` → `radius = 200`, the title renders at `y = 100` (one quarter of the way down the SVG viewBox, halfway between the top and the horizontal center). Other labels get `y = radius` (the horizontal center).

Field testing showed 120px is comfortably readable up close (tablet in hand, user holding their phone) but reads as "small" across a 3–4m room on a dashboard wall tablet. 150px is comfortably readable in both cases without encroaching on the ring ticks. The same field testing revealed two adjacent issues: (a) the 24px title looks undersized next to 150px digits — a 24/150 ratio of ~16 % reads as a caption rather than a label; 32/150 ≈ 21 % restores balance. (b) With the digits larger, the 10-SVG-pixel gap between the title baseline (`y=100`) and the digit top edge (~`y=200-75=125`) feels visually disconnected. Sliding the title down 10 SVG pixels to `y=110` brings it into a natural "label + value" grouping without overlapping the digits.

The dial is responsively sized (`max-width: 300px`, `min-width: 150px`, `display: block`) and the SVG uses a fixed internal coordinate system keyed on `config.diameter` (default 400) with `preserveAspectRatio` scaling. Font sizes are expressed in the SVG's internal coordinate pixels, so a 150px label scales down proportionally at 300px max-width → roughly 112 CSS pixels visible, which is well within the dial's interior radius.

## Goals / Non-Goals

**Goals:**

- Raise the ambient/target center-label font size from 120px to 150px.
- Proportionally increase the decimal-superscript lateral shift so it still clears the wider whole-digit text.
- Raise the room-title font size from 24px to 32px to restore visual balance with the larger digits.
- Move the title's y-position from `radius - radius/2` to `radius - radius*0.45` (default: 100 → 110) so the title groups visually with the digits.
- Zero impact on dual-mode low/high labels, tick labels, or any non-center text.
- Zero impact on any HA integration surface (entity/service/config).
- Ship as `v0.1.4` HACS release.

**Non-Goals:**

- Not changing the font family, weight, or alignment.
- Not changing the superscript's font size (still 40px for target/ambient).
- Not changing the ambient/target vertical position (`y = radius`, unchanged).
- Not changing dual-mode label sizing (`--low` / `--high` stay at 90px and 30px superscript).
- Not changing the title's x-position, text-anchor, or font-weight (still centered, non-bold).
- Not changing dial diameter, tick layout, or any geometry constants.
- Not adding a user-facing config knob for "center font size" or "title font size"; both are design constants per decisions §1 and §5.

## Decisions

### §1. Main-label size: 120px → 150px

**Choice**: bump `.dial__lbl--target` and `.dial__lbl--ambient` to `font-size: 150px` in `dist/styles.js`.

**Rationale**: 150px is the field-tested value. Linear scale-up of 25% from 120px. Does not approach the ring's inner radius at default geometry (diameter=400, `ticks_inner_radius = diameter/8 = 50`, so the ticks sit at radius 150 from center; a 150px character height still sits comfortably inside that). `text-anchor: middle` + `alignment-baseline: central` keep the text centered despite the growth.

**Alternative considered**: 140px — slightly more conservative. Rejected because field testing found 140 still reads as small at 3m. 160px was also rejected as starting to crowd the ring.

**Alternative considered**: make this configurable (`config.target_font_size`). Rejected to keep the change minimal and to avoid adding a knob with no clear use case beyond this one value.

### §2. Superscript lateral shift: `+20` → `+28`

**Choice**: the `+20` hack in `_buildText` becomes `+28` when `name == 'target' || name == 'ambient'`.

**Rationale**: the decimal must clear the right edge of the whole-digit text. The whole-digit text grows by exactly 25% (150/120), so the natural scale is `20 × 150 / 120 = 25`. However, the main tspan is `text-anchor: middle`, so as its content gets wider, its *right edge* moves right by half the width delta. Empirically `+25` leaves a visible gap for single-digit cases (`9.5`) but feels cramped for two-digit cases (`21.5`) where the right edge now extends further. `+28` gives a consistently clean gap across the 2–2 and 3–1 digit cases without pushing the decimal past the tick ring.

**Alternative considered**: compute the shift from the SVG `getBBox()` of the main tspan at render time. Rejected as over-engineering for a one-time constant; would also pull rendering into a layout round-trip the rest of the card doesn't need.

**Alternative considered**: express as `radius / 14.3` instead of `+28`. Rejected — the existing code style uses literal pixel hacks (`+20`, `radius/3.1`, `radius/6`) and matching that pattern is easier to read.

### §3. Dual-mode labels unchanged

**Choice**: `.dial__lbl--low`, `.dial__lbl--high`, and their 30px superscripts keep existing values. No change to the `_buildText` path for those names.

**Rationale**: the user's request says "center digits", and only target/ambient occupy the geometric center. Low/high sit at lateral offsets (`-8` / `+8`) in dual mode and are already sized to fit side-by-side. Scaling them would break their layout.

### §4. Title font size: 24px → 32px

**Choice**: `.dial__lbl--title` in `dist/styles.js` becomes `font-size: 32px` (font-weight still unset — the title is not bold, matching current behavior).

**Rationale**: 24/150 = 16 % reads as a small caption rather than an equally-deliberate label; 32/150 ≈ 21 % sits in the "obvious subtitle to a large headline" sweet spot used in most typography scales (e.g. Material's Headline 6 vs Headline 2). 32px still leaves plenty of clearance above the 150px digits at the default geometry (title bottom edge at y ~ 126, digit top edge at y ~ 125 — so they just meet, which is exactly the visual grouping we want, see §5).

**Alternative considered**: 28px. Rejected because it still reads as disproportionate at 150px; field tested and the title still felt "small".

**Alternative considered**: bold the title. Rejected to preserve the existing weight hierarchy — bold is reserved for the numeric readout; labels are regular.

### §5. Title y-position: `radius - radius/2` → `radius - radius * 0.45`

**Choice**: in `_buildText`, the title branch of the ternary changes from `radius / 2` to `radius * 0.45`, so `y: radius - (name == 'title' ? radius * 0.45 : 0)`. For the default `diameter=400 / radius=200` this moves the title from `y=100` to `y=110`.

**Rationale**:
- The current gap between the title baseline and the digit top edge grew from "comfortable" to "disconnected" when digits went from 120→150px: with 120px digits the digit top was around y=140, so the 40-unit gap felt intentional. With 150px digits the digit top is around y=125, so the old 40-unit gap becomes a 25-unit gap — still disconnected, but now mid-range.
- Sliding the title down 10 units (`y=100 → y=110`) closes that gap to ~15 units, which reads as a tight "label over value" pairing while still leaving the title visually distinct (not overlapping, not kerned into the digits).
- Expressing this as a proportion of radius (`radius * 0.45`) rather than an absolute pixel value (`radius - 110`) preserves the scaling contract the rest of the dial obeys. A user who configures `diameter: 300` gets a proportional shift (y=82.5) rather than a broken layout.

**Alternative considered**: keep the y-expression as `radius / 2` but move the title's x-position or add vertical padding via CSS. Rejected — the SVG y attribute is the only knob that actually affects positioning inside the SVG coordinate space; CSS margins don't apply to SVG text elements.

**Alternative considered**: express as `radius / 2.22` to get 90 at default. Rejected — unreadable magic number.

**Alternative considered**: `radius - 110` literal. Rejected as noted above — breaks non-default diameters.

### §6. Version and release

**Choice**: `v0.1.4` patch release. Same release workflow as v0.1.3 (bump `console.info` version, bump `?v=` query strings on the two `import` statements in `main.js`, tag + push, create GH release with `dist/*.js` assets).

**Rationale**: visually-only tweak, fully backward-compatible, no behavior changes. Qualifies as a patch.

## Risks / Trade-offs

- **3-digit Fahrenheit overflow** → at 150px, a value like `100°F` + `.5` decimal is notably wider than `21°C.5`. Mitigation: `text-anchor: middle` automatically centers the wider text; `+28` shift keeps decimal outside the right edge of `100`. The `300px` dial max-width is the real constraint — at that size, 150px internal coord renders as ~112 CSS px, so three whole digits fit within the ~210 CSS px inner-dial diameter. Verified in the QA tasks (see tasks.md §4).

- **Users on custom themes with larger `ha-card` padding** → unchanged, because the font size is internal to the SVG viewBox, not to the outer `ha-card` container.

- **Title collision with digits at large font sizes** → at 150px digits + 32px title + y=110, the bottom of the title's descender box sits at approximately y=126 and the top of the digit cap-height sits at approximately y=125 (150px char at y=200 center, with `alignment-baseline: central`, cap-height extends ~48 % above center = ~72 units, so top edge ~y=128). So they come very close but do not overlap. Mitigation: the manual QA tasks (§7.11–7.12) explicitly check this at default geometry and at the minimum dial width.

- **Screenshots & docs drift** → the README includes no current screenshot that would be invalidated. No doc update needed beyond a changelog entry.

- **Field-test sample size is small** → 150px was chosen from the author's environment only. Mitigation: the change is purely CSS + one JS constant, trivially reversible in a follow-up if someone on a different screen profile disagrees. This is why `v0.1.4` is a patch: low cost to iterate.

## Migration Plan

None required. Runtime behavior is identical; only rendered font sizes, superscript `x` attribute, and title `y` attribute change. HACS picks up the new release and overwrites `dist/main.js`, `dist/styles.js`, `dist/thermostat_card.lib.js` in-place. No config migration, no persisted state.

Rollback: revert the three file changes and re-tag, or users can pin to `v0.1.3` in HACS. Both paths are supported.

## Open Questions

None.
