## Purpose

The theme-detection capability covers how the card discovers whether the Home Assistant dashboard is currently rendering in dark or light mode, and how changes to that mode propagate to the card's UI. Detection reads `hass.themes.selectedTheme.theme` (name), `hass.themes.selectedTheme.dark` (per-theme HA runtime flag), and `hass.themes.darkMode` (global toggle) on every `hass` setter call, in that priority order. Named-theme overrides (`"Google Dark Theme"` / `"Google Light Theme"`) are authoritative because their names specify the intended appearance; HA's dark/light toggle for those themes can be set incoherently and is not a reliable signal when a named override applies. Implementation lives in `dist/main.js` (the `resolveThemeDark` helper and its call site in the `hass` setter).

## Requirements

### Requirement: Dark/light mode resolution

The card SHALL resolve whether dark or light theme is active on every `hass` setter call by inspecting `hass.themes` in priority order. Implementation lives in `dist/main.js`.

Note: `hass.themes.selectedTheme` is a ThemeSettings object (`{ theme: string, dark?: boolean, ... }`), not a string. The theme *name* lives at `selectedTheme.theme`.

Priority order:
1. Named-theme override — `selectedTheme.theme` matches `"Google Dark Theme"` or `"Google Light Theme"` (case-sensitive). These named themes have a fixed intended appearance; HA's dark/light toggle for them can be set incoherently (e.g. `"Google Dark Theme"` applied while the global toggle reports light mode) and is unreliable when a named override is in force.
2. `selectedTheme.dark` — HA's per-theme runtime dark flag, if present.
3. `hass.themes.darkMode` — the global dashboard dark/light toggle.
4. Default to `dark` if none of the above are available (backward-compatible).

#### Scenario: Google Dark Theme override
- **WHEN** `hass.themes.selectedTheme.theme` equals `"Google Dark Theme"`
- **THEN** the resolved theme mode is `dark`, regardless of `selectedTheme.dark` or `hass.themes.darkMode`

#### Scenario: Google Light Theme override
- **WHEN** `hass.themes.selectedTheme.theme` equals `"Google Light Theme"`
- **THEN** the resolved theme mode is `light`, regardless of `selectedTheme.dark` or `hass.themes.darkMode`

#### Scenario: Per-theme dark flag present (non-Google theme)
- **WHEN** the theme is not a Google named override AND `hass.themes.selectedTheme.dark` is a boolean
- **THEN** the resolved theme mode is `dark` if `true`, `light` if `false`

#### Scenario: darkMode global toggle fallback
- **WHEN** no named override applies AND `hass.themes.selectedTheme.dark` is absent (undefined)
- **THEN** the resolved theme mode follows `hass.themes.darkMode` (`dark` if `true`, `light` if `false`)

#### Scenario: Missing theme data fallback
- **WHEN** `hass.themes` is undefined, or `selectedTheme` is absent AND `darkMode` is unavailable
- **THEN** the resolved theme mode defaults to `dark` (preserving backward-compatible behavior)

### Requirement: Theme change reactivity

The card SHALL detect theme changes and trigger a UI update when the resolved dark/light mode changes. Implementation lives in `dist/main.js` `hass` setter.

#### Scenario: Theme mode included in state diff
- **WHEN** the `hass` setter fires and the resolved theme mode differs from the previously saved theme mode
- **THEN** `updateState` is called on the ThermostatUI instance with the new theme mode

#### Scenario: No update on same theme mode
- **WHEN** the `hass` setter fires but the resolved theme mode is the same as previously saved
- **THEN** the theme mode alone does not trigger an `updateState` call (other state changes may still trigger it)
