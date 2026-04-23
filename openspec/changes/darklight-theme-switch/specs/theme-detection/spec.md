## ADDED Requirements

### Requirement: Dark/light mode resolution

The card SHALL resolve whether dark or light theme is active by reading `hass.themes.darkMode` and `hass.themes.selectedTheme` on every `hass` setter call. Implementation lives in `dist/main.js`.

#### Scenario: Default detection via darkMode flag
- **WHEN** `hass.themes.darkMode` is `true` and the selected theme is not a Google theme override
- **THEN** the resolved theme mode is `dark`

#### Scenario: Light mode via darkMode flag
- **WHEN** `hass.themes.darkMode` is `false` and the selected theme is not a Google theme override
- **THEN** the resolved theme mode is `light`

#### Scenario: Google Dark Theme override
- **WHEN** `hass.themes.selectedTheme` is `"Google Dark Theme"` (case-sensitive match)
- **THEN** the resolved theme mode is `dark`, regardless of the `darkMode` flag value

#### Scenario: Google Light Theme override
- **WHEN** `hass.themes.selectedTheme` is `"Google Light Theme"` (case-sensitive match)
- **THEN** the resolved theme mode is `light`, regardless of the `darkMode` flag value

#### Scenario: Missing theme data fallback
- **WHEN** `hass.themes` is undefined or `hass.themes.darkMode` is undefined
- **THEN** the resolved theme mode defaults to `dark` (preserving current behavior)

### Requirement: Theme change reactivity

The card SHALL detect theme changes and trigger a UI update when the resolved dark/light mode changes. Implementation lives in `dist/main.js` `hass` setter.

#### Scenario: Theme mode included in state diff
- **WHEN** the `hass` setter fires and the resolved theme mode differs from the previously saved theme mode
- **THEN** `updateState` is called on the ThermostatUI instance with the new theme mode

#### Scenario: No update on same theme mode
- **WHEN** the `hass` setter fires but the resolved theme mode is the same as previously saved
- **THEN** the theme mode alone does not trigger an `updateState` call (other state changes may still trigger it)
