## ADDED Requirements

### Requirement: Near-white off-state fill for light variant

The light-variant dial's off-state background SHALL use a near-white color (between `#f5f5f5` and `#fafafa`) so that a thermostat in its off/idle state visually recedes into a light dashboard rather than reading as "a darker grey circle". This supersedes the `#e8e8e8` value introduced in the initial darklight-theme-switch change.

#### Scenario: Off state is near-white
- **WHEN** the dial container has class `dial--light` and the HVAC state resolves to the off-fill path (inactive/idle)
- **THEN** the SVG dial fill resolves the `--thermostat-off-fill` custom property to a value in the range `#f5f5f5`–`#fafafa`

#### Scenario: Dark variant unchanged
- **WHEN** the dial container has class `dial--dark` (or no theme class)
- **THEN** the SVG dial off-fill remains unchanged from prior behavior (`#000000c2`)

### Requirement: Active-state pulse layer, light variant only

When the climate entity is actively heating or cooling and the light theme is in effect, the card container SHALL render a soft radial-gradient glow layer centered on the card, intense at the center and fading to transparent at the edges, in a warm-orange tone for heating or a cool-blue tone for cooling. The layer SHALL NOT intercept pointer events, SHALL respect the container's rounded corners, and SHALL be suppressed outside the light variant.

The pulse rules are scoped by a container class (`is-active-heat` or `is-active-cool`) toggled based on the derived `active_mode` state (see the `thermostat-card` delta spec for how that state is derived).

#### Scenario: Heating active in light variant
- **WHEN** the container has classes `dial--light` and `is-active-heat`
- **THEN** a warm-orange radial-gradient overlay is rendered behind the SVG dial, peaking at the center and fading to transparent near the card edges

#### Scenario: Cooling active in light variant
- **WHEN** the container has classes `dial--light` and `is-active-cool`
- **THEN** a cool-blue radial-gradient overlay is rendered behind the SVG dial, peaking at the center and fading to transparent near the card edges

#### Scenario: Not active in light variant
- **WHEN** the container has class `dial--light` but neither `is-active-heat` nor `is-active-cool`
- **THEN** no pulse overlay is rendered; the container shows the card's normal background

#### Scenario: Pulse suppressed in dark variant
- **WHEN** the container has class `dial--dark` (regardless of `is-active-heat` / `is-active-cool`)
- **THEN** no pulse overlay is rendered

#### Scenario: Pulse does not block interaction
- **WHEN** a pulse overlay is active and the user clicks within the dial area
- **THEN** the click reaches the underlying SVG dial (the overlay has `pointer-events: none`)

### Requirement: Pulse opacity animation

The pulse overlay SHALL animate its opacity continuously between a lower bound (dim) and an upper bound (bright) on a ~3-second cycle with ease-in-out timing, producing a slow "breathing" effect visible at a glance without demanding attention.

#### Scenario: Opacity cycles smoothly
- **WHEN** a pulse overlay is active
- **THEN** the overlay's opacity eases between approximately 0.4 and 0.9 on a ~3s infinite cycle

### Requirement: Honor prefers-reduced-motion

When the user agent reports `prefers-reduced-motion: reduce`, the pulse animation SHALL be disabled. The static radial-gradient overlay MAY remain visible at a fixed mid-level opacity so the active-state signal is preserved without movement.

#### Scenario: Reduced motion — animation off
- **WHEN** the user's browser reports `prefers-reduced-motion: reduce` AND the pulse overlay is active
- **THEN** the overlay opacity is fixed (no animation) and the radial gradient is still rendered

### Requirement: Pulse works in no_card mode

The pulse overlay SHALL render whether or not the `no_card` config option is set, because the overlay is attached to the dial container, not to `ha-card`. In `no_card` mode the pulse appears directly on the dashboard background.

#### Scenario: Pulse in no_card mode
- **WHEN** `no_card: true` is set in the card config AND an active state is in effect under the light variant
- **THEN** the pulse overlay still renders centered on the dial container
