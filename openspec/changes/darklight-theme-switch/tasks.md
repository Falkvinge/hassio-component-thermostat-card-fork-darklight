## 1. Theme Detection (main.js)

- [ ] 1.1 Add `resolveThemeDark(hass)` function that reads `hass.themes.selectedTheme` and `hass.themes.darkMode`, returns boolean. Google theme names override the darkMode flag; missing data defaults to `true` (dark).
- [ ] 1.2 In the `hass` setter, call `resolveThemeDark(hass)` and include the result as `theme_dark` in the `new_state` object.
- [ ] 1.3 Add `theme_dark` to the state diff comparison so a theme change triggers `updateState`.
- [ ] 1.4 Pass `theme_dark` through to `this.thermostat.updateState(new_state, hass)`.

## 2. Theme Class Toggle (thermostat_card.lib.js)

- [ ] 2.1 In `updateState`, read `options.theme_dark` and store it as `this.theme_dark`.
- [ ] 2.2 Call `this._updateClass('dial--dark', this.theme_dark)` and `this._updateClass('dial--light', !this.theme_dark)` to toggle the variant class on the SVG root.

## 3. Light Variant CSS (styles.js)

- [ ] 3.1 Under the existing `.dial { ... }` block, add a `.dial.dial--light { ... }` block that redefines `--thermostat-off-fill`, `--thermostat-text-color`, `--thermostat-path-color`, `--thermostat-path-active-color`, and `--thermostat-path-active-color-large` with light-appropriate values.
- [ ] 3.2 Add `.dial.dial--light .dial__editableIndicator` rule overriding fill to a dark color.
- [ ] 3.3 Add `.dial.dial--light .dial__chevron` rule overriding stroke to `var(--thermostat-text-color)`.
- [ ] 3.4 Add `.dial--light` scoped overrides for the HVAC mode color custom properties (`--heat_color`, `--cool_color`, `--auto_color`, `--off_color`, `--dry_color`, `--fan_only_color`, `--idle_color`, etc.) with values that have sufficient contrast on a light background.
- [ ] 3.5 Add `.dial--light` scoped override for `.dot_r` to use a dark background-color instead of white.
- [ ] 3.6 Add `.dial--light` scoped overrides for the mode dialog: light semi-transparent background, dark border color, adjusted backdrop-filter.

## 4. Verification

- [ ] 4.1 Load the card in an HA instance with default theme in dark mode. Confirm no visual change from current behavior.
- [ ] 4.2 Switch HA to light mode (user profile toggle). Confirm the dial transitions to light variant: light fill, dark text, adjusted accent colors.
- [ ] 4.3 Set theme to "Google Dark Theme". Confirm dark variant regardless of the dark/light toggle.
- [ ] 4.4 Set theme to "Google Light Theme". Confirm light variant regardless of the dark/light toggle.
- [ ] 4.5 Confirm all HVAC modes (heat, cool, auto, heat_cool, dry, fan_only, off) render with distinct, legible accent colors in light variant.
- [ ] 4.6 Confirm dual mode (heat_cool) renders correctly in light variant — both setpoint labels, chevrons, and ring slot labels visible.
- [ ] 4.7 Confirm no_card mode works in light variant (transparent background, no prop icon).
