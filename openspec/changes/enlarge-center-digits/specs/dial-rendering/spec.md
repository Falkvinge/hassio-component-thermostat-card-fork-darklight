## ADDED Requirements

### Requirement: Superscript offset for enlarged center labels

The `_buildText` function SHALL position the decimal-digit superscript (`.dial__lbl--super--<name>` tspan) far enough to the right of the whole-digit text to clear the main label's visual right edge for the `target` and `ambient` labels, which use an enlarged 150px font. The horizontal gap between the end of the main digits and the start of the superscript SHALL scale with the main-label font size so the two tspans never visually overlap.

Implementation note: in `dist/thermostat_card.lib.js` `_buildText`, the per-name offset hack for `name == 'target' || name == 'ambient'` adds a right-shift constant to the superscript's `x` attribute. When the main font size was 120px that constant was `+20`; with 150px it grows proportionally to approximately `+28` (≈ 20 × 150 / 120, rounded to the nearest whole pixel).

#### Scenario: Ambient superscript cleared from digits
- **WHEN** the dial is rendered and the ambient temperature has a decimal part (e.g. `21.5`)
- **THEN** the `.dial__lbl--super--ambient` tspan's `x` attribute places the decimal digit visually to the right of the `21` whole-digit text with no overlap at 150px font size

#### Scenario: Target superscript cleared from digits
- **WHEN** the dial is in control mode, is not in dual mode, and the target temperature has a decimal part (e.g. `21.5`)
- **THEN** the `.dial__lbl--super--target` tspan's `x` attribute places the decimal digit visually to the right of the `21` whole-digit text with no overlap at 150px font size

#### Scenario: Low/high superscripts unchanged
- **WHEN** the dial is in control mode AND in dual mode, and low/high temperatures have decimal parts
- **THEN** the `.dial__lbl--super--low` / `.dial__lbl--super--high` tspans retain their prior positioning behavior (no proportional shift is applied, because the `low`/`high` main labels remain at 90px and continue to fit their existing offset slots)

### Requirement: Title label vertical placement

The `_buildText` function SHALL place the `title` label's `y` attribute so the title sits below the dial's horizontal mid-line at a proportion of the radius that visually groups the title with the ambient/target readout rather than floating it. Specifically, the title's `y` SHALL be `radius - radius * 0.45` (equivalent to `radius * 0.55`), which resolves to `y = 110` at the default 400-diameter geometry and scales proportionally at other diameters. This supersedes the prior `y = radius - radius/2` placement (= 100 at default).

The proportional expression (not a literal pixel constant) is deliberate, because `config.diameter` is configurable and the rest of the dial's geometry scales from it; an absolute `y = 110` would break non-default diameters.

#### Scenario: Title sits at the proportional position
- **WHEN** the dial is built with the default diameter (400)
- **THEN** the title text element has `y` attribute equal to `110` (i.e. `radius - radius * 0.45` = `200 - 90`)

#### Scenario: Title scales with non-default diameter
- **WHEN** the dial is built with a non-default `config.diameter` (e.g. 300 → radius 150)
- **THEN** the title text element has `y` attribute equal to `radius * 0.55` (e.g. `82.5` at radius 150), preserving the same visual proportion

#### Scenario: Non-title labels unaffected
- **WHEN** `_buildText` is called with any `name` other than `'title'` (i.e. `ambient`, `target`, `low`, `high`)
- **THEN** the text element's `y` attribute is `radius` (the horizontal center of the dial), unchanged from prior behavior
