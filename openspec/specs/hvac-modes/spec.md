## Purpose

The hvac-modes capability covers HVAC mode detection, icon mapping, the mode-switching dialog, tick arc coloring per state, and dual-mode state determination. Lives in `dist/thermostat_card.lib.js`, primarily `updateState`, `_updateDialog`, `_setMode`, `_load_icon`, and the mode-switching portions of `_updateTicks`.

## Requirements

### Requirement: Mode-to-icon mapping

The card SHALL display an MDI icon corresponding to the current HVAC mode.

#### Scenario: Heat mode
- **WHEN** hvac_state is `heat`
- **THEN** the mode icon is `mdi:fire`

#### Scenario: Cool mode
- **WHEN** hvac_state is `cool`
- **THEN** the mode icon is `mdi:snowflake`

#### Scenario: Heat-cool mode
- **WHEN** hvac_state is `heat_cool`
- **THEN** the mode icon is `mdi:sync`

#### Scenario: Auto mode
- **WHEN** hvac_state is `auto`
- **THEN** the mode icon is `mdi:atom`

#### Scenario: Dry mode
- **WHEN** hvac_state is `dry`
- **THEN** the mode icon is `mdi:water-percent`

#### Scenario: Fan-only mode
- **WHEN** hvac_state is `fan_only`
- **THEN** the mode icon is `mdi:fan`

#### Scenario: Off mode
- **WHEN** hvac_state is `off`
- **THEN** the mode icon is `mdi:power`

#### Scenario: Unknown mode
- **WHEN** hvac_state does not match any known mode (single-mode path default)
- **THEN** the mode icon is `mdi:dots-horizontal` with state class `more`

### Requirement: Tick arc coloring by state

The dial ticks SHALL highlight an arc range that reflects the relationship between ambient and target temperatures, colored by HVAC mode.

#### Scenario: Cool mode arc
- **WHEN** hvac_state is `cool` and target <= ambient
- **THEN** ticks from target_index to ambient_index are active with class `cool`

#### Scenario: Heat mode arc
- **WHEN** hvac_state is `heat` and target >= ambient
- **THEN** ticks from ambient_index to target_index are active with class `heat`

#### Scenario: Heat-cool single arc
- **WHEN** hvac_state is `heat_cool` in single mode and target >= ambient
- **THEN** ticks from ambient_index to target_index are active with class `heat_cool`

#### Scenario: Auto mode arc
- **WHEN** hvac_state is `auto` and target >= ambient
- **THEN** ticks from ambient_index to target_index are active with class `auto`

#### Scenario: Off and dry modes
- **WHEN** hvac_state is `off` or `dry` or `fan_only` in single mode
- **THEN** no tick range is highlighted (from/to remain undefined)

### Requirement: Dual mode state detection

The card SHALL determine whether to render dual setpoints based on the HVAC state, not just whether dual temperatures exist.

#### Scenario: Dual rendering states
- **WHEN** `this.dual` is true AND hvac_state is `heat_cool` or `off`
- **THEN** the dial renders in dual mode with separate low/high controls and three temperature slots

#### Scenario: Non-dual states with dual entity
- **WHEN** `this.dual` is true BUT hvac_state is `heat`, `cool`, `auto`, `dry`, or `fan_only`
- **THEN** the dial renders in single mode with one target control, ignoring the low/high values

### Requirement: Dual mode temperature slot layout

In dual mode, the three temperature slot labels SHALL be positioned based on the relative ordering of low, high, and ambient temperatures.

#### Scenario: Heat-cool with ambient above high
- **WHEN** in heat_cool mode and ambient > high
- **THEN** slot 3 shows ambient (offset +8), slot 2 shows high (offset -8), and ticks highlight from high_index to ambient_index

#### Scenario: Heat-cool with ambient below low
- **WHEN** in heat_cool mode and ambient < low
- **THEN** slot 1 shows ambient (offset -8), slot 2 shows low (offset +8), and ticks highlight from ambient_index to low_index

#### Scenario: Heat-cool with ambient between
- **WHEN** in heat_cool mode and low <= ambient <= high
- **THEN** slot 1 shows low (offset -8), slot 3 shows high (offset +8), no tick range highlighted

### Requirement: Single mode temperature slot layout

In single mode, the two temperature values (target and ambient) SHALL be displayed in sorted order on ring slots.

#### Scenario: Two values sorted
- **WHEN** the dial is in single mode
- **THEN** slot 1 shows the lower of target/ambient (offset -8) and slot 2 shows the higher (offset +8)

### Requirement: Mode dialog

The card SHALL provide a circular overlay dialog for switching between available HVAC modes.

#### Scenario: Dialog populated from entity
- **WHEN** `_updateDialog` is called with the entity's `hvac_modes` array
- **THEN** the dialog contains one icon span per available mode, each with the correct MDI icon and mode class

#### Scenario: Dialog open
- **WHEN** the user clicks the mode icon area
- **THEN** the dialog gets class `dialog modes` (visible)

#### Scenario: Dialog dismiss
- **WHEN** the user clicks the dialog overlay
- **THEN** the dialog gets class `dialog modes hide`

### Requirement: Mode switching via HA service

The card SHALL call `climate.set_hvac_mode` when the user selects a mode from the dialog.

#### Scenario: Service call on mode select
- **WHEN** the user clicks a mode icon in the dialog
- **THEN** `hass.callService('climate', 'set_hvac_mode', { entity_id, hvac_mode })` is called

#### Scenario: Pending feedback
- **WHEN** a mode is selected
- **THEN** the dialog gets class `dialog modes <mode> pending` and auto-hides after `config.pending` seconds

#### Scenario: Event propagation stopped
- **WHEN** a mode icon is clicked in the dialog
- **THEN** `stopPropagation` is called to prevent the click from dismissing the dialog
