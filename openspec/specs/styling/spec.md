## Purpose

The styling capability covers all CSS custom properties, mode color classes, dial visual states, layout sizing, and the styling infrastructure delivered via `cssData()`. Lives in `dist/styles.js`.
## Requirements
### Requirement: CSS custom properties for mode colors

The card SHALL define CSS custom properties on `ha-card` for each HVAC mode color, with values appropriate to the active theme variant.

#### Scenario: Dark variant color properties
- **WHEN** the card is rendered and the container has class `dial--dark` (or no theme class yet)
- **THEN** the following custom properties are set on `ha-card`: `--auto_color` (rgb 227,99,4), `--cool_color` (rgba 0,122,241,0.6), `--cool_colorc` (rgba 0,122,241,1), `--heat_color` (#ff8100), `--heat_colorc` (rgb 227,99,4), `--manual_color` (#44739e), `--off_color` (#8a8a8a), `--fan_only_color` (#D7DBDD), `--dry_color` (#efbd07), `--idle_color` (#808080), `--unknown_color` (#bac), `--text-color` (white)

#### Scenario: Light variant color properties
- **WHEN** the card is rendered and the container has class `dial--light`
- **THEN** the custom properties are redefined with light-appropriate values that maintain mode distinction and contrast on a light background

#### Scenario: Rail border transparent
- **WHEN** the card is rendered in either theme variant
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

The dial SVG SHALL use theme-variant-appropriate colors via CSS custom properties.

#### Scenario: Dark dial custom properties
- **WHEN** the container has class `dial--dark` or no theme class
- **THEN** the SVG dial uses: `--thermostat-off-fill` (#000000c2), `--thermostat-path-color` (rgba 255,255,255,0.3), `--thermostat-path-active-color` (rgba 255,255,255,0.8), `--thermostat-path-active-color-large` (rgba 255,255,255,1), `--thermostat-text-color` (white)

#### Scenario: Light dial custom properties
- **WHEN** the container has class `dial--light`
- **THEN** the SVG dial uses light-appropriate values for `--thermostat-off-fill`, `--thermostat-path-color`, `--thermostat-path-active-color`, `--thermostat-path-active-color-large`, `--thermostat-text-color`

#### Scenario: Dial shape fill transition
- **WHEN** the HVAC state or theme variant changes
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

The dial text labels SHALL follow a consistent size hierarchy. The ambient/target center labels — the primary at-a-glance readout — SHALL be large enough to read from across a room.

#### Scenario: Font sizes
- **WHEN** the dial is rendered
- **THEN** `--target` and `--ambient` labels are **150px bold**, `--low` and `--high` labels are 90px bold, `--ring` labels are 22px bold, `--title` labels are **32px**, superscript for target/ambient is 40px, superscript for low/high is 30px

#### Scenario: Font family
- **WHEN** dial text is rendered
- **THEN** it uses `Helvetica, sans-serif` with `text-anchor: middle` and `alignment-baseline: central`

#### Scenario: Center digits legible at distance
- **WHEN** the card is rendered on a typical wall-mounted dashboard at the default 300px max-width
- **THEN** the ambient/target digits remain within the ring-ticks interior and do not visually collide with the tick ring

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

### Requirement: Theme variant class on dial container

The top-level card container (the `ThermostatUI._container` div that holds the more-info icon, mode icon, SVG dial, and mode dialog) SHALL carry a class indicating the active theme variant, used by CSS to select the correct color set for both the SVG internals and the sibling DOM elements (mode icon dot, dialog). Implementation: `dist/thermostat_card.lib.js` `updateState` applies the class to the container; `dist/styles.js` defines the rules.

#### Scenario: Dark variant class
- **WHEN** the resolved theme mode is dark
- **THEN** the dial container has class `dial--dark` and does NOT have class `dial--light`

#### Scenario: Light variant class
- **WHEN** the resolved theme mode is light
- **THEN** the dial container has class `dial--light` and does NOT have class `dial--dark`

#### Scenario: Default without theme data
- **WHEN** no theme data has been received yet (initial render before first `hass` call)
- **THEN** the dial uses dark variant styling (backward-compatible default)

### Requirement: Light theme dial colors

The dial SHALL define a light variant color scheme that inverts the dark theme's contrast model: light fill, dark text, and adjusted mode accent colors with sufficient contrast on a light background.

#### Scenario: Light dial fill
- **WHEN** the container has class `dial--light`
- **THEN** the SVG dial resolves `--thermostat-off-fill` to a near-white color in the `#f5f5f5`–`#fafafa` range (see *Near-white off-state fill for light variant* requirement for the tight constraint; current implementation uses `#f7f7f7`)

#### Scenario: Light text color
- **WHEN** the container has class `dial--light`
- **THEN** the SVG dial resolves `--thermostat-text-color` to a dark color (e.g. `#333333` or similar dark grey)

#### Scenario: Light tick colors
- **WHEN** the container has class `dial--light`
- **THEN** `--thermostat-path-color` resolves to a medium-contrast color on light background (e.g. `rgba(0, 0, 0, 0.15)`), and `--thermostat-path-active-color` resolves to a higher-contrast variant (e.g. `rgba(0, 0, 0, 0.6)`)

#### Scenario: Light editable indicator
- **WHEN** the container has class `dial--light` and edit mode is active
- **THEN** the `.dial__editableIndicator` fill uses a dark color instead of white

#### Scenario: Light chevron strokes
- **WHEN** the container has class `dial--light`
- **THEN** chevron strokes use `--thermostat-text-color` (dark) instead of white

### Requirement: Light theme mode accent colors

HVAC mode accent colors SHALL be adjusted in light variant to maintain visual distinction and contrast against the light dial background.

#### Scenario: Light mode accent properties
- **WHEN** the container has class `dial--light`
- **THEN** the mode color custom properties (`--heat_color`, `--cool_color`, `--auto_color`, `--off_color`, `--dry_color`, `--fan_only_color`, `--idle_color`) are redefined with values that have sufficient contrast on a light background

#### Scenario: Mode colors still distinct
- **WHEN** the container has class `dial--light`
- **THEN** each HVAC mode retains a visually distinct color from every other mode (heat is warm-toned, cool is blue-toned, off is grey, etc.)

### Requirement: Light theme dialog styling

The HVAC mode dialog SHALL adapt its appearance for light theme.

#### Scenario: Light dialog background
- **WHEN** the container has class `dial--light` and the mode dialog is visible
- **THEN** the dialog background uses a light semi-transparent overlay (e.g. `rgba(255, 255, 255, 0.85)`) with appropriate backdrop filter instead of the dark `#0000008c`

#### Scenario: Light dialog border
- **WHEN** the container has class `dial--light` and the mode dialog is visible
- **THEN** the dialog border uses a dark or medium color instead of `#ffffff`

### Requirement: Light theme dot indicator

The mode icon dot indicator SHALL adapt to light theme.

#### Scenario: Light dot color
- **WHEN** the container has class `dial--light`
- **THEN** `.dot_r` background-color uses a dark color instead of white, maintaining the same subtle opacity indicator

### Requirement: Near-white off-state fill for light variant

The light-variant dial's off-state background SHALL use a near-white color (between `#f5f5f5` and `#fafafa`) so that a thermostat in its off/idle state visually recedes into a light dashboard rather than reading as "a darker grey circle". This supersedes the `#e8e8e8` value introduced in the initial darklight-theme-switch change.

#### Scenario: Off state is near-white
- **WHEN** the dial container has class `dial--light` and the HVAC state resolves to the off-fill path (inactive/idle)
- **THEN** the SVG dial fill resolves the `--thermostat-off-fill` custom property to a value in the range `#f5f5f5`–`#fafafa`

#### Scenario: Dark variant unchanged
- **WHEN** the dial container has class `dial--dark` (or no theme class)
- **THEN** the SVG dial off-fill remains unchanged from prior behavior (`#000000c2`)

### Requirement: Differentiated activity overlay, both theme variants

When the climate entity is in `heat` or `cool` mode, the card container SHALL render a soft radial-gradient glow layer centered on the card, intense at the center and fading to transparent at the edges, in a warm-orange tone for heating or a cool-blue tone for cooling. The overlay SHALL NOT intercept pointer events, SHALL respect the container's rounded corners, and SHALL be rendered in both the light (`dial--light`) and dark (`dial--dark`) variants.

The overlay has **two visual intensities**, keyed by a container class toggled from the derived `active_mode` state (see the `thermostat-card` capability for how that state is derived):

- **Active pulse** (`is-active-heat` / `is-active-cool`): the entity reports `hvac_action: heating` / `cooling`. The overlay uses the full gradient alpha and animates opacity (see *Pulse opacity animation* requirement).
- **Idle tint** (`is-idle-heat` / `is-idle-cool`): the entity is in `heat` / `cool` mode but `hvac_action` is not active (idle, off, missing, etc.). The overlay uses roughly half the gradient alpha of the active pulse and does **not** animate (static tint).

At most one of the four classes is set at any time; they are mutually exclusive.

Alpha values differ between variants because identical RGB values appear more vivid against a dark background than against a light one. The dark variant uses lower gradient alphas to achieve the same perceived subtlety.

#### Scenario: Heating actively pumping in light variant
- **WHEN** the container has classes `dial--light` and `is-active-heat`
- **THEN** a warm-orange radial-gradient overlay is rendered at full alpha, animated

#### Scenario: Cooling actively pumping in light variant
- **WHEN** the container has classes `dial--light` and `is-active-cool`
- **THEN** a cool-blue radial-gradient overlay is rendered at full alpha, animated

#### Scenario: Heat mode idle in light variant
- **WHEN** the container has classes `dial--light` and `is-idle-heat`
- **THEN** a warm-orange radial-gradient overlay is rendered at reduced alpha, static (no animation)

#### Scenario: Cool mode idle in light variant
- **WHEN** the container has classes `dial--light` and `is-idle-cool`
- **THEN** a cool-blue radial-gradient overlay is rendered at reduced alpha, static (no animation)

#### Scenario: Heating actively pumping in dark variant
- **WHEN** the container has classes `dial--dark` and `is-active-heat`
- **THEN** a warm-orange radial-gradient overlay is rendered, animated, with alpha values lower than the light variant to account for the dark background's higher perceived vividness

#### Scenario: Cooling actively pumping in dark variant
- **WHEN** the container has classes `dial--dark` and `is-active-cool`
- **THEN** a cool-blue radial-gradient overlay is rendered, animated, with alpha values lower than the light variant

#### Scenario: Heat mode idle in dark variant
- **WHEN** the container has classes `dial--dark` and `is-idle-heat`
- **THEN** a warm-orange radial-gradient overlay is rendered at reduced alpha, static (no animation)

#### Scenario: Cool mode idle in dark variant
- **WHEN** the container has classes `dial--dark` and `is-idle-cool`
- **THEN** a cool-blue radial-gradient overlay is rendered at reduced alpha, static (no animation)

#### Scenario: No overlay when mode is off/auto/etc
- **WHEN** the container has either `dial--light` or `dial--dark` but none of the four overlay classes
- **THEN** no overlay is rendered; the container shows the card's normal background

#### Scenario: Overlay does not block interaction
- **WHEN** any overlay (active or idle) is rendered in either theme variant and the user clicks within the dial area
- **THEN** the click reaches the underlying SVG dial (the overlay has `pointer-events: none`)

### Requirement: Pulse opacity animation

The active-pulse overlay (not the idle tint) SHALL animate its opacity continuously between a lower bound (dim) and an upper bound (bright) on a ~3-second cycle with ease-in-out timing, producing a slow "breathing" effect visible at a glance without demanding attention. The idle tint is deliberately static so that a pulsing card unambiguously signals confirmed active pumping.

#### Scenario: Opacity cycles smoothly
- **WHEN** an `is-active-heat` or `is-active-cool` overlay is rendered
- **THEN** the overlay's opacity eases between approximately 0.4 and 0.9 on a ~3s infinite cycle

#### Scenario: Idle tint does not animate
- **WHEN** an `is-idle-heat` or `is-idle-cool` overlay is rendered
- **THEN** the overlay opacity is fixed (no CSS animation)

### Requirement: Honor prefers-reduced-motion

When the user agent reports `prefers-reduced-motion: reduce`, the active-pulse animation SHALL be disabled in both theme variants. The static radial-gradient overlay MAY remain visible at a fixed mid-level opacity so the active-state signal is preserved without movement. The idle tint is already static and is not affected.

#### Scenario: Reduced motion — animation off, light variant
- **WHEN** the user's browser reports `prefers-reduced-motion: reduce` AND an active overlay is rendered in the light variant
- **THEN** the overlay opacity is fixed (no animation) and the radial gradient is still rendered

#### Scenario: Reduced motion — animation off, dark variant
- **WHEN** the user's browser reports `prefers-reduced-motion: reduce` AND an active overlay is rendered in the dark variant
- **THEN** the overlay opacity is fixed (no animation) and the radial gradient is still rendered

### Requirement: Overlay works in no_card mode

The activity overlay (active or idle) SHALL render whether or not the `no_card` config option is set, because the overlay is attached to the dial container, not to `ha-card`. In `no_card` mode the overlay appears directly on the dashboard background. This applies to both theme variants.

#### Scenario: Overlay in no_card mode, light variant
- **WHEN** `no_card: true` is set in the card config AND any of the four overlay classes is in effect under the light variant
- **THEN** the overlay still renders centered on the dial container

#### Scenario: Overlay in no_card mode, dark variant
- **WHEN** `no_card: true` is set in the card config AND any of the four overlay classes is in effect under the dark variant
- **THEN** the overlay still renders centered on the dial container

### Requirement: Digit glow reinforcement (both variants)

When the climate entity is in any non-off `heat` / `cool` state (active or idle) in either theme variant, the center temperature labels SHALL render a colored blurred glow matching the activity-overlay color (warm-orange for heat, cool-blue for cool). The glow provides an always-on visual reinforcement that remains visible at the overlay pulse's minimum opacity — addressing the observation that the overlay alone can read as too subtle at its local minimum.

The glow is implemented via `filter: drop-shadow(0 0 Npx rgba(...))` on the SVG `<text>` elements (SVG text ignores `text-shadow`). It applies to all center temperature labels: `.dial__lbl--ambient` (shown normally), `.dial__lbl--target` (shown during `in_control`), and `.dial__lbl--low` / `.dial__lbl--high` (shown during `in_control` with dual setpoints).

The glow has two intensities keyed by the same `is-active-*` / `is-idle-*` classes as the overlay:

- **Active glow**: wider and brighter (approximately 10px blur, alpha ~0.85). Matches the pulsing overlay's "actively pumping" meaning.
- **Idle glow**: narrower and dimmer (approximately 6px blur, alpha ~0.55). Matches the static-tint overlay's "armed but not pumping" meaning.

The glow is **static** (no animation) regardless of state. It does not follow the overlay's pulse. This is deliberate: the overlay provides the breathing motion that signals "active pumping", while the glow provides always-visible color reinforcement that doesn't fade during the pulse's minimum. The two effects layer rather than compete.

Both variants currently use the **same blur radius and alpha values**. A colored glow on light-variant dark text against a near-white background produces a colored halo around each glyph, visually analogous to the same glow on dark-variant bright text against a dark background. If a variant turns out to need asymmetric tuning, the selector groups can be split and the values adjusted independently.

#### Scenario: Cool glow on active cooling in dark variant
- **WHEN** the container has classes `dial--dark` and `is-active-cool`
- **THEN** the center temperature labels render with a cool-blue `drop-shadow` filter at approximately 10px blur and alpha ~0.85

#### Scenario: Cool glow on idle cooling in dark variant
- **WHEN** the container has classes `dial--dark` and `is-idle-cool`
- **THEN** the center temperature labels render with a cool-blue `drop-shadow` filter at approximately 6px blur and alpha ~0.55

#### Scenario: Warm glow on active heating in dark variant
- **WHEN** the container has classes `dial--dark` and `is-active-heat`
- **THEN** the center temperature labels render with a warm-orange `drop-shadow` filter at approximately 10px blur and alpha ~0.85

#### Scenario: Warm glow on idle heating in dark variant
- **WHEN** the container has classes `dial--dark` and `is-idle-heat`
- **THEN** the center temperature labels render with a warm-orange `drop-shadow` filter at approximately 6px blur and alpha ~0.55

#### Scenario: Cool glow on active cooling in light variant
- **WHEN** the container has classes `dial--light` and `is-active-cool`
- **THEN** the center temperature labels render with a cool-blue `drop-shadow` filter at approximately 10px blur and alpha ~0.85

#### Scenario: Cool glow on idle cooling in light variant
- **WHEN** the container has classes `dial--light` and `is-idle-cool`
- **THEN** the center temperature labels render with a cool-blue `drop-shadow` filter at approximately 6px blur and alpha ~0.55

#### Scenario: Warm glow on active heating in light variant
- **WHEN** the container has classes `dial--light` and `is-active-heat`
- **THEN** the center temperature labels render with a warm-orange `drop-shadow` filter at approximately 10px blur and alpha ~0.85

#### Scenario: Warm glow on idle heating in light variant
- **WHEN** the container has classes `dial--light` and `is-idle-heat`
- **THEN** the center temperature labels render with a warm-orange `drop-shadow` filter at approximately 6px blur and alpha ~0.55

#### Scenario: No glow in off/auto/etc states
- **WHEN** the container has either `dial--dark` or `dial--light` but none of the four `is-active-*` / `is-idle-*` classes
- **THEN** the center temperature labels render without any `drop-shadow` filter (backward-compatible)

#### Scenario: Glow is static during pulse
- **WHEN** the overlay is actively pulsing (`is-active-cool` or `is-active-heat` in either variant) AND the overlay is at any point in its opacity cycle
- **THEN** the digit glow's blur radius and alpha remain constant (the glow does not animate)

### Requirement: Mode indicator ring on HVAC icon

The small HVAC-mode icon at the bottom-center of the card (snowflake for cool, flame for heat, etc., rendered inside `.climate_info > .modes > ha-icon` at approximately `top: 82%` of the card) SHALL carry a colored ring in any non-off `heat` / `cool` state. The ring provides a focused at-a-glance mode signal independent of — and complementary to — the card-wide activity overlay and the center-digit glow; the three layered signals together make the state unambiguously readable.

The ring is implemented as a `::before` pseudo-element on `.climate_info` (not as a CSS `border` on the element itself), so the spinning variant can rotate without also rotating the icon glyph inside. It extends approximately 6px beyond the icon box (inset −6px) with a roughly 4px stroke.

The ring has two visual modes keyed by the same `is-active-*` / `is-idle-*` classes used by the activity overlay:

- **Idle ring**: a solid full-circle ring in the mode color at ~0.9 alpha. Static. Signals "mode armed; not pumping".
- **Active ring**: a half-arc in the mode color at ~0.95 alpha, covering approximately 180° of the circle (the top and right CSS border sides), rotating clockwise at please-wait-spinner pace (approximately 1.2s per revolution, linear timing). Signals "mode actively pumping"; the rotation is the cue that differentiates active from idle.

Colors match the existing cool-blue (`rgba(0, 122, 241, ...)`) / warm-orange (`rgba(255, 140, 0, ...)`) palette used by the activity overlay and the digit glow.

The ring behavior is identical in both theme variants (`dial--dark` and `dial--light`).

#### Scenario: Idle ring on cool mode
- **WHEN** the container has class `is-idle-cool`
- **THEN** `.climate_info::before` renders as a full-circle cool-blue ring (all four border sides colored) with no animation

#### Scenario: Idle ring on heat mode
- **WHEN** the container has class `is-idle-heat`
- **THEN** `.climate_info::before` renders as a full-circle warm-orange ring with no animation

#### Scenario: Active spinner on cool mode
- **WHEN** the container has class `is-active-cool`
- **THEN** `.climate_info::before` renders as a half-arc (two border sides colored, two transparent) in cool-blue, rotating clockwise at approximately 1.2s per revolution

#### Scenario: Active spinner on heat mode
- **WHEN** the container has class `is-active-heat`
- **THEN** `.climate_info::before` renders as a half-arc in warm-orange, rotating clockwise at approximately 1.2s per revolution

#### Scenario: No ring in off/auto/etc states
- **WHEN** the container has neither an `is-active-*` nor an `is-idle-*` class
- **THEN** `.climate_info::before` does not render a visible ring (the pseudo-element's `content` and border only activate under the four state classes)

#### Scenario: Ring identical in both variants
- **WHEN** any of the four state classes is active
- **THEN** the ring renders with the same geometry, color, and animation regardless of whether the container has `dial--dark` or `dial--light`

#### Scenario: Ring does not rotate the icon glyph
- **WHEN** an active spinner is rendered (`is-active-cool` or `is-active-heat`)
- **THEN** only the `::before` pseudo-element rotates; the `<ha-icon>` snowflake/flame inside `.modes` remains visually upright and unrotated

#### Scenario: Reduced-motion fallback
- **WHEN** the user agent reports `prefers-reduced-motion: reduce` AND the container has `is-active-cool` or `is-active-heat`
- **THEN** the ring renders as a static full-circle ring (not a half-arc) in the mode color; the rotation animation is disabled

