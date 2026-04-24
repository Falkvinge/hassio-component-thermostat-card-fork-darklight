## ADDED Requirements

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

## MODIFIED Requirements

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
