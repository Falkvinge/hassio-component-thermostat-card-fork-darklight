## Purpose

The dial-rendering capability covers construction of the circular SVG thermostat dial, all its visual sub-elements, and the geometry utility functions that support them. This is the visual structure layer — what gets built in the DOM, not how it looks (that's styling) or how it responds to input (that's temperature-control). Lives in `dist/thermostat_card.lib.js`, primarily the `_build*` methods of ThermostatUI and the SvgUtil class.

## Requirements

### Requirement: SVG core container

The dial SHALL be rendered as an SVG element with a viewBox matching the configured diameter and responsive width/height.

#### Scenario: SVG created with correct viewBox
- **WHEN** ThermostatUI is constructed with a diameter config
- **THEN** it creates an `<svg>` element with `width: 100%`, `height: 100%`, `viewBox: "0 0 <diameter> <diameter>"`, and `class: "dial"`

### Requirement: Dial circle background

The dial SHALL render a filled circle as the main background shape.

#### Scenario: Circle matches radius
- **WHEN** the dial is built
- **THEN** it contains a `<circle>` with `cx`, `cy`, and `r` all equal to the configured radius, and `class: "dial__shape"`

### Requirement: Tick marks around the dial perimeter

The dial SHALL render a configurable number of tick marks arranged in an arc, with active ticks highlighted to show the temperature range.

#### Scenario: Tick count matches config
- **WHEN** the dial is built with `num_ticks: 150`
- **THEN** it creates exactly 150 `<path>` elements inside a `<g class="dial__ticks">` group

#### Scenario: Active tick range
- **WHEN** `_updateTicks` is called with a `from` and `to` index and an hvac_state
- **THEN** ticks with index >= from and <= to get class `"active <hvac_state>"`

#### Scenario: Large tick markers
- **WHEN** `_updateTicks` is called with a `large_ticks` array of indices
- **THEN** those ticks get the additional class `"large"` and use a wider/taller tick path

#### Scenario: Tick rotation
- **WHEN** ticks are rendered
- **THEN** each tick path is rotated by `(tick_degrees / num_ticks) * index - offset_degrees` around the center point

### Requirement: Editable indicator ring

The dial SHALL contain a donut-shaped ring that becomes visible when the user enters edit mode.

#### Scenario: Ring path
- **WHEN** the dial is built
- **THEN** it contains a `<path>` with `class: "dial__editableIndicator"` using a donut path with outer radius `radius - 4` and inner radius `radius - 8`

### Requirement: Text labels

The dial SHALL render SVG text elements for title, ambient temperature, target temperature, and dual-mode low/high temperatures.

#### Scenario: Five text labels created
- **WHEN** the dial is built
- **THEN** it contains text elements with ids: `title`, `ambient`, `target`, `low`, `high`

#### Scenario: Text value formatting
- **WHEN** `_updateText` is called with a numeric value
- **THEN** it renders the integer part in the main tspan and the decimal digit (if any) in a superscript tspan

#### Scenario: Title text
- **WHEN** `_updateText` is called with id `title`
- **THEN** it renders the full string value in the main tspan with empty superscript

#### Scenario: Dual mode target display
- **WHEN** the dial is in control mode AND dual mode, and `_updateText` is called for `target`
- **THEN** the main tspan shows `·` (middle dot) instead of a number

### Requirement: Temperature slot labels on ring

The dial SHALL render up to three positioned text labels on the tick ring to show sorted temperature values.

#### Scenario: Three slots created
- **WHEN** the dial is built
- **THEN** it contains text elements with ids: `temperature_slot_1`, `temperature_slot_2`, `temperature_slot_3`

#### Scenario: Slot positioning
- **WHEN** `_updateTemperatureSlot` is called with a value and offset
- **THEN** the label is positioned on the tick ring at the angle corresponding to that temperature value plus the offset

#### Scenario: Null slot clearing
- **WHEN** `_updateTemperatureSlot` is called with null
- **THEN** the label text is cleared

### Requirement: Chevron arrows

The dial SHALL render up/down chevron arrows for adjusting target, low, and high temperatures.

#### Scenario: Six chevrons created
- **WHEN** the dial is built
- **THEN** it contains chevron paths: 2 for `target` (0° and 180°), 2 for `low` (0° and 180°), 2 for `high` (0° and 180°)

#### Scenario: Chevron sizing and position
- **WHEN** chevrons are built
- **THEN** each chevron path is scaled by its scale factor (1.0 for target, 0.7 for low/high) and translated by its offset (-radius/2.5 for low, radius/3 for high, 0 for target)

### Requirement: Thermometer icon

The dial SHALL render an SVG thermometer icon below the center of the dial.

#### Scenario: Thermometer path
- **WHEN** the dial is built
- **THEN** it contains a `<path>` with `class: "dial__ico__thermo"` translated to position `(radius - scale*100*0.3, radius*1.65)` where scale is `radius/3/100`

### Requirement: More-info icon button

The dial container SHALL include a clickable icon button for opening the HA entity detail panel.

#### Scenario: Icon button rendered
- **WHEN** ThermostatUI is constructed
- **THEN** the container includes a div with `class: "prop"` containing an `<ha-icon-button>` with `icon: "mdi:dots-vertical"`

### Requirement: Mode icon display

The dial container SHALL display the current HVAC mode as a colored icon with a dot indicator.

#### Scenario: Icon structure
- **WHEN** `_load_icon` is called with a state and icon name
- **THEN** it renders a `div.climate_info` containing a `div.mode_color` with a dot span and a `div.modes` with an `<ha-icon>` using `mdi:<icon_name>` and class matching the state

#### Scenario: Hidden icon on init
- **WHEN** `_load_icon` is called with empty strings (initial state)
- **THEN** the dot span has class `dot_h` (hidden) instead of `dot_r` (round)

### Requirement: SvgUtil geometry helpers

The SvgUtil class SHALL provide static methods for SVG geometry calculations used throughout dial construction.

#### Scenario: SVG element creation
- **WHEN** `SvgUtil.createSVGElement(tag, attributes)` is called
- **THEN** it creates an SVG-namespaced element with the given attributes

#### Scenario: Point rotation
- **WHEN** `SvgUtil.rotatePoint(point, angle, origin)` is called
- **THEN** it returns the point rotated by `angle` degrees around `origin`

#### Scenario: Points to path
- **WHEN** `SvgUtil.pointsToPath(points)` is called
- **THEN** it returns an SVG path string with M for the first point, L for subsequent points, and Z to close

#### Scenario: Donut path
- **WHEN** `SvgUtil.donutPath(cx, cy, rOuter, rInner)` is called
- **THEN** it returns two concentric circle paths forming a donut shape

#### Scenario: Value restriction
- **WHEN** `SvgUtil.restrictToRange(val, min, max)` is called
- **THEN** it clamps val to the [min, max] range

#### Scenario: Superscript formatting
- **WHEN** `SvgUtil.superscript(n)` is called with a non-integer
- **THEN** it returns the number formatted to one decimal place as a string

#### Scenario: Angle to sector
- **WHEN** `SvgUtil.anglesToSectors(radius, startAngle, angle)` is called
- **THEN** it returns an object with `L` (radius), `X`, `Y` (arc endpoint), and `R` (rotation angle) for constructing a pie-slice path

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
