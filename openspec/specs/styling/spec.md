## Purpose

The styling capability covers all CSS custom properties, mode color classes, dial visual states, layout sizing, and the styling infrastructure delivered via `cssData()`. Lives in `dist/styles.js`.

## Requirements

### Requirement: CSS custom properties for mode colors

The card SHALL define CSS custom properties on `ha-card` for each HVAC mode color, allowing theme override.

#### Scenario: Color properties defined
- **WHEN** the card is rendered
- **THEN** the following custom properties are set on `ha-card`: `--auto_color` (rgb 227,99,4), `--cool_color` (rgba 0,122,241,0.6), `--cool_colorc` (rgba 0,122,241,1), `--heat_color` (#ff8100), `--heat_colorc` (rgb 227,99,4), `--manual_color` (#44739e), `--off_color` (#8a8a8a), `--fan_only_color` (#D7DBDD), `--dry_color` (#efbd07), `--idle_color` (#808080), `--unknown_color` (#bac), `--text-color` (white)

#### Scenario: Rail border transparent
- **WHEN** the card is rendered
- **THEN** `--rail_border_color` is set to `transparent`

### Requirement: Mode color class mapping

Each HVAC mode class SHALL map to `--mode_color` using the corresponding custom property, so icons and ticks inherit the correct color.

#### Scenario: Mode classes
- **WHEN** an element has class `auto` or `heat_cool`
- **THEN** `--mode_color` resolves to `--auto_color`

#### Scenario: Individual mode colors
- **WHEN** an element has class `cool`, `heat`, `manual`, `off`, `more`, `fan_only`, `eco`, `dry`, or `idle`
- **THEN** `--mode_color` resolves to the corresponding `--*_color` custom property

### Requirement: Dial visual defaults

The dial SVG SHALL use a dark theme with configurable path colors.

#### Scenario: Dial custom properties
- **WHEN** the dial is rendered
- **THEN** it uses: `--thermostat-off-fill` (#000000c2), `--thermostat-path-color` (rgba 255,255,255,0.3), `--thermostat-path-active-color` (rgba 255,255,255,0.8), `--thermostat-path-active-color-large` (rgba 255,255,255,1), `--thermostat-text-color` (white)

#### Scenario: Dial shape fill transition
- **WHEN** the HVAC state changes
- **THEN** the `.dial__shape` fill transitions over 0.5s

### Requirement: Responsive dial sizing

The dial SHALL be responsively sized within defined bounds.

#### Scenario: Size constraints
- **WHEN** the dial is rendered
- **THEN** it has `max-width: 300px`, `min-width: 150px`, `display: block`, `margin: 0 auto`

### Requirement: No-card transparent mode

When `no_card` is enabled, the card SHALL render with no visible card chrome.

#### Scenario: Transparent background
- **WHEN** `ha-card` has class `no_card`
- **THEN** `background-color` is transparent, `border` is none, `box-shadow` is none

#### Scenario: Hidden prop icon
- **WHEN** `ha-card` has class `no_card`
- **THEN** the `.prop` element (more-info icon) is `display: none`

### Requirement: Edit mode visual indicators

The dial SHALL show visual feedback when the user is in temperature edit mode.

#### Scenario: Editable indicator ring
- **WHEN** the dial has class `dial--edit`
- **THEN** `.dial__editableIndicator` opacity transitions to 1

#### Scenario: Ring hidden by default
- **WHEN** the dial does not have class `dial--edit`
- **THEN** `.dial__editableIndicator` opacity is 0

### Requirement: Control mode visibility toggling

When in control mode, the dial SHALL show setpoint labels and chevrons while hiding the ambient display.

#### Scenario: Target visible in control
- **WHEN** the dial has class `in_control`
- **THEN** `.dial__lbl--target`, `.dial__lbl--low`, `.dial__lbl--high` have `visibility: visible`

#### Scenario: Ambient hidden in control
- **WHEN** the dial has class `in_control`
- **THEN** `.dial__lbl--ambient` has `visibility: hidden`

#### Scenario: Target chevrons in single mode
- **WHEN** the dial has class `in_control` but NOT `has_dual`
- **THEN** `.dial__chevron--target` is visible, `.dial__chevron--low` and `.dial__chevron--high` are hidden

#### Scenario: Dual chevrons in dual mode
- **WHEN** the dial has class `in_control` AND `has_dual`
- **THEN** `.dial__chevron--low` and `.dial__chevron--high` are visible, `.dial__chevron--target` is hidden

### Requirement: Temperature control tap highlight

Quadrant click areas SHALL provide optional visual feedback.

#### Scenario: Control visible on tap
- **WHEN** `.dial__temperatureControl` has class `control-visible`
- **THEN** it has opacity 0.2 (transition 0.2s)

#### Scenario: Control hidden by default
- **WHEN** `.dial__temperatureControl` does not have `control-visible`
- **THEN** it has opacity 0

### Requirement: Mode dialog styling

The HVAC mode dialog SHALL render as a circular frosted overlay.

#### Scenario: Dialog layout
- **WHEN** the dialog is visible
- **THEN** it has: border-radius 50%, backdrop-filter blur(6px) grayscale(50%), background #0000008c, max-width 300px, centered flex layout

#### Scenario: Pending animation
- **WHEN** the dialog has class `pending`
- **THEN** it shows a pulsing box-shadow animation (0.8s alternate) using `--mode_color`

#### Scenario: Dialog hidden
- **WHEN** the dialog has class `hide`
- **THEN** it has `display: none`

### Requirement: Typography hierarchy

The dial text labels SHALL follow a consistent size hierarchy.

#### Scenario: Font sizes
- **WHEN** the dial is rendered
- **THEN** `--target` and `--ambient` labels are 120px bold, `--low` and `--high` labels are 90px bold, `--ring` labels are 22px bold, `--title` labels are 24px, superscript for target/ambient is 40px, superscript for low/high is 30px

#### Scenario: Font family
- **WHEN** dial text is rendered
- **THEN** it uses `Helvetica, sans-serif` with `text-anchor: middle` and `alignment-baseline: central`

### Requirement: Tick coloring

Active ticks SHALL be colored by HVAC mode.

#### Scenario: Inactive ticks
- **WHEN** a tick path has no active class
- **THEN** it is filled with `--thermostat-path-color`

#### Scenario: Active ticks
- **WHEN** a tick path has class `active`
- **THEN** it is filled with `--mode_color`

### Requirement: Mode icon styling

The mode icon area SHALL be positioned at the bottom of the dial with appropriate sizing.

#### Scenario: Climate info position
- **WHEN** the mode icon area is rendered
- **THEN** `.climate_info` is positioned at `top: 82%, left: 50%`, translated to center, with `width: 14%` and `height: 14%`

#### Scenario: Mode icon sizing
- **WHEN** the mode icon is rendered within `.modes`
- **THEN** the `ha-icon` uses `--mdc-icon-size: 100%` colored by `--mode_color`, capped at `max-width: 50px`
