## Purpose

The temperature-control capability covers user interaction for adjusting thermostat setpoints — the click quadrants, single vs dual mode math, boundary clamping, pending timeout, and visual feedback. Lives in `dist/thermostat_card.lib.js`, primarily `_buildControls`, `_temperatureControlClicked`, and `_enableControls`.

## Requirements

### Requirement: Four click quadrants

The dial SHALL divide its area into four invisible pie-slice click regions for temperature adjustment.

#### Scenario: Quadrant construction
- **WHEN** `_buildControls` is called
- **THEN** four `<path>` elements with `class: "dial__temperatureControl"` are appended to the SVG, dividing the circle into 90° sectors starting at 270°

#### Scenario: Click triggers temperature change
- **WHEN** a quadrant is clicked and the dial is in control mode
- **THEN** `_temperatureControlClicked(index)` is called with the quadrant index (0-3)

#### Scenario: Click enables control mode
- **WHEN** a quadrant is clicked and the dial is NOT in control mode
- **THEN** the dial enters control mode via `_enableControls()` instead of adjusting temperature

### Requirement: Single setpoint adjustment

In single mode, the dial SHALL adjust one target temperature using top (increase) and bottom (decrease) halves.

#### Scenario: Top half increases target
- **WHEN** quadrant index 0 or 1 is clicked in single mode
- **THEN** `_target` increases by `config.step`

#### Scenario: Bottom half decreases target
- **WHEN** quadrant index 2 or 3 is clicked in single mode
- **THEN** `_target` decreases by `config.step`

#### Scenario: Target clamped to max
- **WHEN** `_target` would exceed `max_value` after increase
- **THEN** `_target` is set to `max_value`

#### Scenario: Target clamped to min
- **WHEN** `_target` would go below `min_value` after decrease
- **THEN** `_target` is set to `min_value`

### Requirement: Dual setpoint adjustment

In dual mode, the dial SHALL adjust low and high setpoints independently using four quadrants, maintaining an idle zone gap.

#### Scenario: Top-left increases low
- **WHEN** quadrant index 0 is clicked in dual mode
- **THEN** `_low` increases by `config.step`

#### Scenario: Low clamped by idle zone
- **WHEN** increasing `_low` would bring it within `idle_zone` of `_high`
- **THEN** `_low` is set to `_high - idle_zone`

#### Scenario: Top-right increases high
- **WHEN** quadrant index 1 is clicked in dual mode
- **THEN** `_high` increases by `config.step`

#### Scenario: High clamped to max
- **WHEN** `_high` would exceed `max_value` after increase
- **THEN** `_high` is set to `max_value`

#### Scenario: Bottom-right decreases high
- **WHEN** quadrant index 2 is clicked in dual mode
- **THEN** `_high` decreases by `config.step`

#### Scenario: High clamped by idle zone
- **WHEN** decreasing `_high` would bring it within `idle_zone` of `_low`
- **THEN** `_high` is set to `_low + idle_zone`

#### Scenario: Bottom-left decreases low
- **WHEN** quadrant index 3 is clicked in dual mode
- **THEN** `_low` decreases by `config.step`

#### Scenario: Low clamped to min
- **WHEN** `_low` would go below `min_value` after decrease
- **THEN** `_low` is set to `min_value`

### Requirement: Control mode with pending timeout

The dial SHALL enter a timed control mode when the user begins interaction, then commit changes after a configurable delay.

#### Scenario: Enter control mode
- **WHEN** the user clicks the dial or a quadrant
- **THEN** `_in_control` is set to true, the dial gets class `in_control`, and edit mode is enabled (showing editable indicator ring)

#### Scenario: Timeout resets and commits
- **WHEN** `config.pending` seconds elapse without further interaction
- **THEN** the dial exits control mode (`_in_control` = false), hides edit indicators, restores ambient display, and calls `config.control()` which triggers the HA service call

#### Scenario: Interaction resets timeout
- **WHEN** the user clicks again while already in control mode
- **THEN** the pending timeout is cleared and restarted from zero

#### Scenario: Text updates during control
- **WHEN** the dial enters control mode
- **THEN** the `target`, `low`, and `high` text labels are updated to show current setpoint values

### Requirement: Chevron press feedback

Chevrons SHALL provide brief visual feedback when the user adjusts temperature.

#### Scenario: Chevron highlight on press
- **WHEN** a temperature adjustment is made
- **THEN** the corresponding chevron gets class `pressed` for 200ms, then the class is removed

#### Scenario: All chevrons reset before feedback
- **WHEN** a temperature control is clicked
- **THEN** all chevron `pressed` classes are cleared before applying the new one

### Requirement: Tap area highlight

The dial SHALL optionally highlight the clicked quadrant area when `highlight_tap` is enabled.

#### Scenario: Highlight visible on tap
- **WHEN** `config.highlight_tap` is true and a quadrant is clicked
- **THEN** the clicked control path gets class `control-visible` for 200ms

#### Scenario: No highlight by default
- **WHEN** `config.highlight_tap` is false (default)
- **THEN** no control paths get the `control-visible` class on click
