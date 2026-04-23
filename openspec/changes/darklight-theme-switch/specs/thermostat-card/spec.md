## MODIFIED Requirements

### Requirement: Entity state tracking with diff-based updates

The card SHALL extract state from the HA entity and theme data on every `hass` setter call and only push updates to the UI when relevant state has changed.

#### Scenario: State extraction from entity
- **WHEN** the `hass` setter is called with a valid entity
- **THEN** the card extracts: `min_value`, `max_value`, `ambient_temperature`, `target_temperature`, `target_temperature_low`, `target_temperature_high`, `hvac_state`, `hvac_modes`, `preset_mode`, `away`, and the resolved `theme_dark` boolean from the entity's state/attributes and `hass.themes`

#### Scenario: Ambient temperature override
- **WHEN** `config.ambient_temperature` is set to a valid sensor entity ID
- **THEN** the card uses that sensor's state as ambient_temperature instead of the climate entity's `current_temperature`

#### Scenario: Min/max override
- **WHEN** `config.min_value` or `config.max_value` are set
- **THEN** those values override the entity's `min_temp` / `max_temp` attributes

#### Scenario: No update on unchanged state
- **WHEN** the `hass` setter is called but all tracked state fields — including `theme_dark` — match the previously saved state
- **THEN** `updateState` is NOT called on the ThermostatUI instance

#### Scenario: Update on theme change only
- **WHEN** the `hass` setter is called and only `theme_dark` has changed (all other fields match)
- **THEN** `updateState` IS called on the ThermostatUI instance with the new state

#### Scenario: Missing entity
- **WHEN** the `hass` setter is called and `hass.states[config.entity]` is undefined
- **THEN** the card returns early without updating
