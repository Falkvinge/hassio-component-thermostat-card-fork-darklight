## ADDED Requirements

### Requirement: Theme variant class on dial root

The dial SVG root SHALL carry a class indicating the active theme variant, used by CSS to select the correct color set. Implementation: `dist/thermostat_card.lib.js` `updateState` applies the class; `dist/styles.js` defines the rules.

#### Scenario: Dark variant class
- **WHEN** the resolved theme mode is dark
- **THEN** the dial SVG root element has class `dial--dark` and does NOT have class `dial--light`

#### Scenario: Light variant class
- **WHEN** the resolved theme mode is light
- **THEN** the dial SVG root element has class `dial--light` and does NOT have class `dial--dark`

#### Scenario: Default without theme data
- **WHEN** no theme data has been received yet (initial render before first `hass` call)
- **THEN** the dial uses dark variant styling (backward-compatible default)

### Requirement: Light theme dial colors

The dial SHALL define a light variant color scheme that inverts the dark theme's contrast model: light fill, dark text, and adjusted mode accent colors with sufficient contrast on a light background.

#### Scenario: Light dial fill
- **WHEN** the dial has class `dial--light`
- **THEN** `--thermostat-off-fill` resolves to a light color (e.g. `#e8e8e8` or similar light grey)

#### Scenario: Light text color
- **WHEN** the dial has class `dial--light`
- **THEN** `--thermostat-text-color` resolves to a dark color (e.g. `#333333` or similar dark grey)

#### Scenario: Light tick colors
- **WHEN** the dial has class `dial--light`
- **THEN** `--thermostat-path-color` resolves to a medium-contrast color on light background (e.g. `rgba(0, 0, 0, 0.15)`), and `--thermostat-path-active-color` resolves to a higher-contrast variant (e.g. `rgba(0, 0, 0, 0.6)`)

#### Scenario: Light editable indicator
- **WHEN** the dial has class `dial--light` and edit mode is active
- **THEN** the `.dial__editableIndicator` fill uses a dark color instead of white

#### Scenario: Light chevron strokes
- **WHEN** the dial has class `dial--light`
- **THEN** chevron strokes use `--thermostat-text-color` (dark) instead of white

### Requirement: Light theme mode accent colors

HVAC mode accent colors SHALL be adjusted in light variant to maintain visual distinction and contrast against the light dial background.

#### Scenario: Light mode accent properties
- **WHEN** the dial has class `dial--light`
- **THEN** the mode color custom properties (`--heat_color`, `--cool_color`, `--auto_color`, `--off_color`, `--dry_color`, `--fan_only_color`, `--idle_color`) are redefined with values that have sufficient contrast on a light background

#### Scenario: Mode colors still distinct
- **WHEN** the dial is in light variant
- **THEN** each HVAC mode retains a visually distinct color from every other mode (heat is warm-toned, cool is blue-toned, off is grey, etc.)

### Requirement: Light theme dialog styling

The HVAC mode dialog SHALL adapt its appearance for light theme.

#### Scenario: Light dialog background
- **WHEN** the dial has class `dial--light` and the mode dialog is visible
- **THEN** the dialog background uses a light semi-transparent overlay (e.g. `rgba(255, 255, 255, 0.85)`) with appropriate backdrop filter instead of the dark `#0000008c`

#### Scenario: Light dialog border
- **WHEN** the dial has class `dial--light` and the mode dialog is visible
- **THEN** the dialog border uses a dark or medium color instead of `#ffffff`

### Requirement: Light theme dot indicator

The mode icon dot indicator SHALL adapt to light theme.

#### Scenario: Light dot color
- **WHEN** the dial has class `dial--light`
- **THEN** `.dot_r` background-color uses a dark color instead of white, maintaining the same subtle opacity indicator

## MODIFIED Requirements

### Requirement: CSS custom properties for mode colors

The card SHALL define CSS custom properties on `ha-card` for each HVAC mode color, with values appropriate to the active theme variant.

#### Scenario: Dark variant color properties
- **WHEN** the card is rendered and the dial has class `dial--dark` (or no theme class yet)
- **THEN** the following custom properties are set on `ha-card`: `--auto_color` (rgb 227,99,4), `--cool_color` (rgba 0,122,241,0.6), `--cool_colorc` (rgba 0,122,241,1), `--heat_color` (#ff8100), `--heat_colorc` (rgb 227,99,4), `--manual_color` (#44739e), `--off_color` (#8a8a8a), `--fan_only_color` (#D7DBDD), `--dry_color` (#efbd07), `--idle_color` (#808080), `--unknown_color` (#bac), `--text-color` (white)

#### Scenario: Light variant color properties
- **WHEN** the card is rendered and the dial has class `dial--light`
- **THEN** the custom properties are redefined with light-appropriate values that maintain mode distinction and contrast on a light background

#### Scenario: Rail border transparent
- **WHEN** the card is rendered in either theme variant
- **THEN** `--rail_border_color` is set to `transparent`

### Requirement: Dial visual defaults

The dial SVG SHALL use theme-variant-appropriate colors via CSS custom properties.

#### Scenario: Dark dial custom properties
- **WHEN** the dial has class `dial--dark` or no theme class
- **THEN** it uses: `--thermostat-off-fill` (#000000c2), `--thermostat-path-color` (rgba 255,255,255,0.3), `--thermostat-path-active-color` (rgba 255,255,255,0.8), `--thermostat-path-active-color-large` (rgba 255,255,255,1), `--thermostat-text-color` (white)

#### Scenario: Light dial custom properties
- **WHEN** the dial has class `dial--light`
- **THEN** it uses light-appropriate values for `--thermostat-off-fill`, `--thermostat-path-color`, `--thermostat-path-active-color`, `--thermostat-path-active-color-large`, `--thermostat-text-color`

#### Scenario: Dial shape fill transition
- **WHEN** the HVAC state or theme variant changes
- **THEN** the `.dial__shape` fill transitions over 0.5s
