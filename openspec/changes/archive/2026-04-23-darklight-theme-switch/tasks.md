## 1. Theme Detection (main.js)

- [x] 1.1 Add `resolveThemeDark(hass)` function that reads `hass.themes.selectedTheme` and `hass.themes.darkMode`, returns boolean. Google theme names override the darkMode flag; missing data defaults to `true` (dark).
- [x] 1.2 In the `hass` setter, call `resolveThemeDark(hass)` and include the result as `theme_dark` in the `new_state` object.
- [x] 1.3 Add `theme_dark` to the state diff comparison so a theme change triggers `updateState`.
- [x] 1.4 Pass `theme_dark` through to `this.thermostat.updateState(new_state, hass)`.

## 2. Theme Class Toggle (thermostat_card.lib.js)

- [x] 2.1 In `updateState`, read `options.theme_dark` and store it as `this.theme_dark`.
- [x] 2.2 Toggle `dial--dark` / `dial--light` on `this._container` (not `this._root`) via `classList.toggle`, so the class reaches SVG, mode icon dot, and dialog simultaneously.

## 3. Light Variant CSS (styles.js)

- [x] 3.1 Add a `.dial--light .dial { ... }` block that redefines `--thermostat-off-fill`, `--thermostat-text-color`, `--thermostat-path-color`, `--thermostat-path-active-color`, and `--thermostat-path-active-color-large` with light-appropriate values.
- [x] 3.2 Add `.dial--light .dial__editableIndicator` rule overriding fill to a dark color.
- [x] 3.3 Add `.dial--light .dial__chevron` rule overriding stroke to `var(--thermostat-text-color)`.
- [x] 3.4 Add `.dial--light` scoped overrides for the HVAC mode color custom properties (`--heat_color`, `--cool_color`, `--auto_color`, `--off_color`, `--dry_color`, `--fan_only_color`, `--idle_color`, etc.) with values that have sufficient contrast on a light background.
- [x] 3.5 Add `.dial--light .dot_r` override to use a dark background-color instead of white.
- [x] 3.6 Add `.dial--light .dialog` overrides: light semi-transparent background, dark border color, adjusted backdrop-filter.

## 4. Verification

- [ ] 4.1 Load the card in an HA instance with default theme in dark mode. Confirm no visual change from current behavior.
- [ ] 4.2 Switch HA to light mode (user profile toggle). Confirm the dial transitions to light variant: light fill, dark text, adjusted accent colors.
- [ ] 4.3 Set theme to "Google Dark Theme". Confirm dark variant regardless of the dark/light toggle.
- [ ] 4.4 Set theme to "Google Light Theme". Confirm light variant regardless of the dark/light toggle.
- [ ] 4.5 Confirm all HVAC modes (heat, cool, auto, heat_cool, dry, fan_only, off) render with distinct, legible accent colors in light variant.
- [ ] 4.6 Confirm dual mode (heat_cool) renders correctly in light variant — both setpoint labels, chevrons, and ring slot labels visible.
- [ ] 4.7 Confirm no_card mode works in light variant (transparent background, no prop icon).
