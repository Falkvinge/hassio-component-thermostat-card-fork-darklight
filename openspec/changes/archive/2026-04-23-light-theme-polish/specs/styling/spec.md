## ADDED Requirements

### Requirement: Near-white off-state fill for light variant

The light-variant dial's off-state background SHALL use a near-white color (between `#f5f5f5` and `#fafafa`) so that a thermostat in its off/idle state visually recedes into a light dashboard rather than reading as "a darker grey circle". This supersedes the `#e8e8e8` value introduced in the initial darklight-theme-switch change.

#### Scenario: Off state is near-white
- **WHEN** the dial container has class `dial--light` and the HVAC state resolves to the off-fill path (inactive/idle)
- **THEN** the SVG dial fill resolves the `--thermostat-off-fill` custom property to a value in the range `#f5f5f5`–`#fafafa`

#### Scenario: Dark variant unchanged
- **WHEN** the dial container has class `dial--dark` (or no theme class)
- **THEN** the SVG dial off-fill remains unchanged from prior behavior (`#000000c2`)

### Requirement: Differentiated activity overlay, light variant only

When the climate entity is in `heat` or `cool` mode and the light theme is in effect, the card container SHALL render a soft radial-gradient glow layer centered on the card, intense at the center and fading to transparent at the edges, in a warm-orange tone for heating or a cool-blue tone for cooling. The overlay SHALL NOT intercept pointer events, SHALL respect the container's rounded corners, and SHALL be suppressed outside the light variant.

The overlay has **two visual intensities**, keyed by a container class toggled from the derived `active_mode` state (see the `thermostat-card` delta spec):

- **Active pulse** (`is-active-heat` / `is-active-cool`): the entity reports `hvac_action: heating` / `cooling`. The overlay uses the full gradient alpha and animates opacity (see *Pulse opacity animation* requirement).
- **Idle tint** (`is-idle-heat` / `is-idle-cool`): the entity is in `heat` / `cool` mode but `hvac_action` is not active (idle, off, missing, etc.). The overlay uses roughly half the gradient alpha of the active pulse and does **not** animate (static tint).

At most one of these four classes is set at any time; they are mutually exclusive.

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

#### Scenario: No overlay when mode is off/auto/etc
- **WHEN** the container has class `dial--light` but none of the four overlay classes
- **THEN** no overlay is rendered; the container shows the card's normal background

#### Scenario: Overlay suppressed in dark variant
- **WHEN** the container has class `dial--dark` (regardless of overlay classes)
- **THEN** no overlay is rendered

#### Scenario: Overlay does not block interaction
- **WHEN** any overlay (active or idle) is rendered and the user clicks within the dial area
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

When the user agent reports `prefers-reduced-motion: reduce`, the active-pulse animation SHALL be disabled. The static radial-gradient overlay MAY remain visible at a fixed mid-level opacity so the active-state signal is preserved without movement. The idle tint is already static and is not affected.

#### Scenario: Reduced motion — animation off
- **WHEN** the user's browser reports `prefers-reduced-motion: reduce` AND an active overlay is rendered
- **THEN** the overlay opacity is fixed (no animation) and the radial gradient is still rendered

### Requirement: Overlay works in no_card mode

The activity overlay (active or idle) SHALL render whether or not the `no_card` config option is set, because the overlay is attached to the dial container, not to `ha-card`. In `no_card` mode the overlay appears directly on the dashboard background.

#### Scenario: Overlay in no_card mode
- **WHEN** `no_card: true` is set in the card config AND any of the four overlay classes is in effect under the light variant
- **THEN** the overlay still renders centered on the dial container
