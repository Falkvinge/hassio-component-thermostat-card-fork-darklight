## ADDED Requirements

### Requirement: HVAC action tracking and active_mode derivation

The card SHALL extract the climate entity's `hvac_action` attribute (if present) on every `hass` update, derive an `active_mode` value of `'heat'`, `'cool'`, or `null`, and include `hvac_action` in the state-diff comparison so that a transition in/out of active pumping triggers a re-render. The derivation SHALL prefer `hvac_action` when available and fall back to `hvac_state` when it is not.

#### Scenario: hvac_action = heating
- **WHEN** `entity.attributes.hvac_action === 'heating'`
- **THEN** `active_mode` resolves to `'heat'`

#### Scenario: hvac_action = cooling
- **WHEN** `entity.attributes.hvac_action === 'cooling'`
- **THEN** `active_mode` resolves to `'cool'`

#### Scenario: hvac_action = idle, off, fan, or drying
- **WHEN** `entity.attributes.hvac_action` is one of `'idle'`, `'off'`, `'fan'`, `'drying'`
- **THEN** `active_mode` resolves to `null`

#### Scenario: hvac_action unavailable, state = heat
- **WHEN** `entity.attributes.hvac_action` is undefined AND `entity.state === 'heat'`
- **THEN** `active_mode` resolves to `'heat'`

#### Scenario: hvac_action unavailable, state = cool
- **WHEN** `entity.attributes.hvac_action` is undefined AND `entity.state === 'cool'`
- **THEN** `active_mode` resolves to `'cool'`

#### Scenario: hvac_action unavailable, state = auto or heat_cool
- **WHEN** `entity.attributes.hvac_action` is undefined AND `entity.state` is `'auto'` or `'heat_cool'`
- **THEN** `active_mode` resolves to `null` (conservative — direction is unknown without an action signal)

#### Scenario: hvac_action unavailable, state = off, dry, fan_only, or unknown
- **WHEN** `entity.attributes.hvac_action` is undefined AND `entity.state` is `'off'`, `'dry'`, `'fan_only'`, or anything not covered above
- **THEN** `active_mode` resolves to `null`

#### Scenario: State diff reacts to hvac_action change
- **WHEN** `hvac_action` transitions between values (e.g. `idle` → `heating`) AND no other diffed state field changes
- **THEN** the card still calls `updateState` to re-render so the active-state pulse can appear or disappear
