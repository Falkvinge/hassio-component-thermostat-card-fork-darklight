## Purpose

The thermostat-card capability covers the custom element lifecycle, Home Assistant integration, configuration handling, and entity state management. This is the outer shell that registers `<thermostat-card>` with the browser, wires it to HA's entity system, and dispatches service calls. Lives in `dist/main.js`.

## Requirements

### Requirement: Custom element registration

The card SHALL register itself as a custom element named `thermostat-card` using `customElements.define`, so that Lovelace can instantiate it via `type: custom:thermostat-card`.

#### Scenario: Element available in DOM
- **WHEN** the main.js module is loaded by Home Assistant
- **THEN** `customElements.get('thermostat-card')` returns the ThermostatCard class

### Requirement: Shadow DOM isolation

The card SHALL use Shadow DOM (`mode: 'open'`) to encapsulate its markup and styles, preventing style leakage to/from the HA dashboard.

#### Scenario: Shadow root created on construction
- **WHEN** a `<thermostat-card>` element is created
- **THEN** `this.shadowRoot` is an open ShadowRoot

### Requirement: Configuration with defaults

The card SHALL accept a configuration object via `setConfig()` and apply default values for all optional parameters.

#### Scenario: Required entity validation
- **WHEN** `setConfig` is called without an `entity` property or with a non-climate entity
- **THEN** the card throws an Error with message "Please define an entity"

#### Scenario: Default values applied
- **WHEN** `setConfig` is called with only `entity` specified
- **THEN** the following defaults are applied: `diameter: 400`, `pending: 3`, `idle_zone: 2`, `step: 0.5`, `highlight_tap: false`, `no_card: false`, `chevron_size: 50`, `num_ticks: 150`, `tick_degrees: 300`

#### Scenario: Derived geometry values
- **WHEN** `setConfig` processes the config
- **THEN** it calculates `radius` (diameter/2), `ticks_outer_radius` (diameter/30), `ticks_inner_radius` (diameter/8), and `offset_degrees` (180 - (360 - tick_degrees) / 2) from the base config

#### Scenario: Config deep-cloned
- **WHEN** `setConfig` is called
- **THEN** the config object is deep-cloned so mutations do not affect the caller's original object

### Requirement: Entity state tracking with diff-based updates

The card SHALL extract state from the HA entity on every `hass` setter call and only push updates to the UI when relevant state has changed.

#### Scenario: State extraction from entity
- **WHEN** the `hass` setter is called with a valid entity
- **THEN** the card extracts: `min_value`, `max_value`, `ambient_temperature`, `target_temperature`, `target_temperature_low`, `target_temperature_high`, `hvac_state`, `hvac_modes`, `preset_mode`, and `away` from the entity's state and attributes

#### Scenario: Ambient temperature override
- **WHEN** `config.ambient_temperature` is set to a valid sensor entity ID
- **THEN** the card uses that sensor's state as ambient_temperature instead of the climate entity's `current_temperature`

#### Scenario: Min/max override
- **WHEN** `config.min_value` or `config.max_value` are set
- **THEN** those values override the entity's `min_temp` / `max_temp` attributes

#### Scenario: No update on unchanged state
- **WHEN** the `hass` setter is called but all tracked state fields match the previously saved state
- **THEN** `updateState` is NOT called on the ThermostatUI instance

#### Scenario: Missing entity
- **WHEN** the `hass` setter is called and `hass.states[config.entity]` is undefined
- **THEN** the card returns early without updating

### Requirement: Temperature service calls

The card SHALL call `climate.set_temperature` via `hass.callService` when the user finishes adjusting setpoints.

#### Scenario: Single setpoint mode
- **WHEN** the thermostat is not in dual mode and the target temperature has changed
- **THEN** the card calls `climate.set_temperature` with `entity_id` and `temperature`

#### Scenario: Dual setpoint mode
- **WHEN** the thermostat is in dual mode and either high or low temperature has changed
- **THEN** the card calls `climate.set_temperature` with `entity_id`, `target_temp_high`, and `target_temp_low`

### Requirement: More-info event dispatch

The card SHALL open the HA entity detail dialog when the more-info icon is clicked.

#### Scenario: Fire hass-more-info
- **WHEN** the user clicks the more-info icon
- **THEN** the card dispatches a `hass-more-info` CustomEvent with `detail: { entityId }`, `bubbles: true`, `composed: true`

### Requirement: Card container modes

The card SHALL render inside an `ha-card` element, with an optional transparent mode for use in picture-elements.

#### Scenario: Standard card
- **WHEN** `no_card` is false (default)
- **THEN** the card renders inside an `ha-card` with default HA card styling

#### Scenario: Transparent card
- **WHEN** `no_card` is true
- **THEN** the card renders inside an `ha-card` with class `no_card`, which removes background, border, and shadow

### Requirement: HACS compatibility

The card SHALL be installable via HACS (Home Assistant Community Store).

#### Scenario: HACS metadata
- **WHEN** HACS scans the repository
- **THEN** it finds `hacs.json` with `name: "Climate thermostat card"`, `render_readme: true`, and `filename: "main.js"`
