## Purpose

The theme-detection capability covers how the card discovers whether the Home Assistant dashboard is currently rendering in dark or light mode, and how changes to that mode propagate to the card's UI. Detection resolves the *effective* theme name across HA's three possible sources (dashboard/user selectedTheme, `default_dark_theme` when darkMode is on, otherwise `default_theme`), then applies named-theme overrides (`"Google Dark Theme"` / `"Google Light Theme"`) which are authoritative because their names specify a fixed intended appearance and HA's dark/light toggle for them can be set incoherently. If no named override applies, the card falls through to `selectedTheme.dark` and finally `hass.themes.darkMode`. This handles the common deployment where HA switches default theme automatically at sunset/sunrise. Implementation lives in `dist/main.js` (the `resolveThemeDark` helper and its call site in the `hass` setter).

## Requirements

### Requirement: Dark/light mode resolution

The card SHALL resolve whether dark or light theme is active on every `hass` setter call by inspecting `hass.themes` and the effective theme name in priority order. Implementation lives in `dist/main.js`.

Note: `selectedTheme` (on either `hass.selectedTheme` or `hass.themes.selectedTheme`) is a ThemeSettings object (`{ theme: string, dark?: boolean, ... }`), not a string. The theme *name* lives at `selectedTheme.theme`. When a dashboard inherits HA's default, `selectedTheme` is absent, null, or has `.theme === "default"`, and the currently-effective name lives on `hass.themes.default_theme` (or `hass.themes.default_dark_theme` when `hass.themes.darkMode` is `true`).

Effective-name resolution (evaluated first):
- If `selectedTheme.theme` is present and is not the string `"default"`, it is the effective name.
- Else, if `hass.themes.darkMode` is `true` AND `hass.themes.default_dark_theme` is set, the effective name is `default_dark_theme`.
- Else, the effective name is `hass.themes.default_theme` (may be undefined).

Mode-resolution priority (evaluated on the effective name and the theme data):
1. Named-theme override — effective name equals `"Google Dark Theme"` (→ dark) or `"Google Light Theme"` (→ light), case-sensitive. These named themes have a fixed intended appearance; HA's dark/light toggle for them can be set incoherently and is unreliable when a named override applies.
2. `selectedTheme.dark` — HA's per-theme runtime dark flag on the user/dashboard override, if present.
3. `hass.themes.darkMode` — the global dashboard dark/light toggle.
4. Default to `dark` if none of the above are available (backward-compatible).

#### Scenario: Google Dark Theme selected explicitly
- **WHEN** `selectedTheme.theme` equals `"Google Dark Theme"`
- **THEN** the resolved theme mode is `dark`, regardless of `selectedTheme.dark` or `hass.themes.darkMode`

#### Scenario: Google Light Theme selected explicitly
- **WHEN** `selectedTheme.theme` equals `"Google Light Theme"`
- **THEN** the resolved theme mode is `light`, regardless of `selectedTheme.dark` or `hass.themes.darkMode`

#### Scenario: Dashboard inherits default, default_theme is a Google override
- **WHEN** `selectedTheme` is absent, null, or has `.theme === "default"` AND (`hass.themes.darkMode` is false or `default_dark_theme` is unset) AND `hass.themes.default_theme` equals `"Google Dark Theme"` or `"Google Light Theme"`
- **THEN** the resolved theme mode matches that name (`dark` or `light`), regardless of `hass.themes.darkMode`

#### Scenario: Dashboard inherits default, default_dark_theme is a Google override
- **WHEN** `selectedTheme` is absent, null, or has `.theme === "default"` AND `hass.themes.darkMode` is `true` AND `hass.themes.default_dark_theme` equals `"Google Dark Theme"` or `"Google Light Theme"`
- **THEN** the resolved theme mode matches that name (`dark` or `light`)

#### Scenario: Sunset default-theme switch
- **WHEN** HA changes `hass.themes.default_theme` from `"Google Light Theme"` to `"Google Dark Theme"` (e.g. at sunset) and the dashboard inherits the default
- **THEN** the next `hass` setter call resolves the theme mode to `dark`, and the card re-renders with the dark variant

#### Scenario: Per-theme dark flag present (no named override)
- **WHEN** no effective-name named override applies AND `selectedTheme.dark` is a boolean
- **THEN** the resolved theme mode is `dark` if `true`, `light` if `false`

#### Scenario: darkMode global toggle fallback
- **WHEN** no named override applies AND `selectedTheme.dark` is absent (undefined)
- **THEN** the resolved theme mode follows `hass.themes.darkMode` (`dark` if `true`, `light` if `false`)

#### Scenario: Missing theme data fallback
- **WHEN** `hass.themes` is undefined, or all of `selectedTheme`, `default_theme`, `default_dark_theme`, and `darkMode` are unavailable
- **THEN** the resolved theme mode defaults to `dark` (preserving backward-compatible behavior)

### Requirement: Theme change reactivity

The card SHALL detect theme changes and trigger a UI update when the resolved dark/light mode changes. Implementation lives in `dist/main.js` `hass` setter.

#### Scenario: Theme mode included in state diff
- **WHEN** the `hass` setter fires and the resolved theme mode differs from the previously saved theme mode
- **THEN** `updateState` is called on the ThermostatUI instance with the new theme mode

#### Scenario: No update on same theme mode
- **WHEN** the `hass` setter fires but the resolved theme mode is the same as previously saved
- **THEN** the theme mode alone does not trigger an `updateState` call (other state changes may still trigger it)
