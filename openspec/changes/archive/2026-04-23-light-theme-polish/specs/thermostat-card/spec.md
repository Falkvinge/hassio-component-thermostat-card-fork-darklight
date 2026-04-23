## ADDED Requirements

### Requirement: HVAC action tracking and active_mode derivation

The card SHALL extract the climate entity's `hvac_action` attribute (if present) on every `hass` update, derive an `active_mode` value of `'active_heat'`, `'active_cool'`, `'idle_heat'`, `'idle_cool'`, or `null`, and include `hvac_action` in the state-diff comparison so that a transition in/out of active pumping triggers a re-render.

The derivation distinguishes **active** (the compressor is confirmed pumping) from **idle** (the mode is armed but no active-pumping signal). Because climate integrations are known to under-report active pumping (some never expose `hvac_action`; others report `idle` while the unit is audibly running), the idle signal is still a useful "this AC is switched on" indicator for dashboard-scanning.

#### Scenario: hvac_action = heating
- **WHEN** `entity.attributes.hvac_action === 'heating'`
- **THEN** `active_mode` resolves to `'active_heat'`

#### Scenario: hvac_action = cooling
- **WHEN** `entity.attributes.hvac_action === 'cooling'`
- **THEN** `active_mode` resolves to `'active_cool'`

#### Scenario: hvac_action = idle (or any non-active value), state = heat
- **WHEN** `entity.attributes.hvac_action` is present and not `'heating'`/`'cooling'` AND `entity.state === 'heat'`
- **THEN** `active_mode` resolves to `'idle_heat'`

#### Scenario: hvac_action = idle (or any non-active value), state = cool
- **WHEN** `entity.attributes.hvac_action` is present and not `'heating'`/`'cooling'` AND `entity.state === 'cool'`
- **THEN** `active_mode` resolves to `'idle_cool'`

#### Scenario: hvac_action unavailable, state = heat
- **WHEN** `entity.attributes.hvac_action` is undefined AND `entity.state === 'heat'`
- **THEN** `active_mode` resolves to `'idle_heat'` (conservative: we know the mode, we don't know whether it's actively pumping)

#### Scenario: hvac_action unavailable, state = cool
- **WHEN** `entity.attributes.hvac_action` is undefined AND `entity.state === 'cool'`
- **THEN** `active_mode` resolves to `'idle_cool'`

#### Scenario: state = off, auto, heat_cool, dry, fan_only, or unknown
- **WHEN** `entity.state` is `'off'`, `'auto'`, `'heat_cool'`, `'dry'`, `'fan_only'`, or anything outside `'heat'`/`'cool'` (regardless of `hvac_action`)
- **THEN** `active_mode` resolves to `null`

#### Scenario: State diff reacts to hvac_action change
- **WHEN** `hvac_action` transitions between values (e.g. `idle` → `heating`) AND no other diffed state field changes
- **THEN** the card still calls `updateState` so the overlay can transition from idle-tint to active-pulse (or vice versa)
