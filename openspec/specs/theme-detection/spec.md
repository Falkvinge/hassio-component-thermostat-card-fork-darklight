## Purpose

The theme-detection capability covers how the card discovers whether the Home Assistant dashboard is currently rendering in dark or light mode, and how changes to that mode propagate to the card's UI. Detection reads `hass.themes.selectedTheme.dark` (the per-theme dark flag set by HA at runtime) and falls back to `hass.themes.darkMode` (the global toggle) on every `hass` setter call. Implementation lives in `dist/main.js` (the `resolveThemeDark` helper and its call site in the `hass` setter).

## Requirements

### Requirement: Dark/light mode resolution

The card SHALL resolve whether dark or light theme is active on every `hass` setter call by inspecting `hass.themes` in priority order. Implementation lives in `dist/main.js`.

Note: `hass.themes.selectedTheme` is a ThemeSettings object (`{ theme: string, dark?: boolean, ... }`), not a string. Theme name string comparisons are not a reliable signal because a single named theme (e.g. "Google Dark Theme") can be applied in both light and dark mode by HA's runtime toggle.

#### Scenario: Per-theme dark flag present
- **WHEN** `hass.themes.selectedTheme.dark` is a boolean
- **THEN** the resolved theme mode is `dark` if `true`, `light` if `false` — this field is the most specific signal and takes priority

#### Scenario: Per-theme dark flag absent, darkMode true
- **WHEN** `hass.themes.selectedTheme.dark` is absent (undefined) AND `hass.themes.darkMode` is `true`
- **THEN** the resolved theme mode is `dark`

#### Scenario: Per-theme dark flag absent, darkMode false
- **WHEN** `hass.themes.selectedTheme.dark` is absent (undefined) AND `hass.themes.darkMode` is `false`
- **THEN** the resolved theme mode is `light`

#### Scenario: Missing theme data fallback
- **WHEN** `hass.themes` is undefined, or both `selectedTheme.dark` and `darkMode` are unavailable
- **THEN** the resolved theme mode defaults to `dark` (preserving backward-compatible behavior)

### Requirement: Theme change reactivity

The card SHALL detect theme changes and trigger a UI update when the resolved dark/light mode changes. Implementation lives in `dist/main.js` `hass` setter.

#### Scenario: Theme mode included in state diff
- **WHEN** the `hass` setter fires and the resolved theme mode differs from the previously saved theme mode
- **THEN** `updateState` is called on the ThermostatUI instance with the new theme mode

#### Scenario: No update on same theme mode
- **WHEN** the `hass` setter fires but the resolved theme mode is the same as previously saved
- **THEN** the theme mode alone does not trigger an `updateState` call (other state changes may still trigger it)
