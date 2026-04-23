## Why

The thermostat card is hardcoded to a dark visual theme (black dial, white text). Users running Home Assistant in light mode — or using explicit light themes like "Google Light Theme" — get a dark card that clashes with the rest of their dashboard. The fork name ("Darklight") exists precisely to fix this: detect the active theme and switch between dark and light card visuals automatically.

## What Changes

- Detect whether the user's HA instance is in light or dark mode by inspecting `hass.themes.darkMode` (boolean) and `hass.themes.selectedTheme` (string). Theme name detection ("Google Dark Theme" / "Google Light Theme") takes priority over the darkMode flag when either of those specific themes is active.
- Treat all current visual settings (dark dial fill, white text, existing mode colors) as the **dark** variant. No visual changes to the existing dark appearance.
- Introduce a **light** variant: light dial fill, dark text, adjusted mode colors with sufficient contrast on a light background.
- Automatically switch between variants when the `hass` setter fires with a changed theme state. No user configuration required — it just works.

## Non-goals

- Per-card manual light/dark override via config. May come later, but the first cut is automatic-only.
- Supporting arbitrary custom themes beyond the Google pair. We detect dark vs light, not theme-specific palettes.
- Changing the SVG structure or layout. This is a pure color/fill reskin.

## Capabilities

### New Capabilities
- `theme-detection`: Detect whether the HA dashboard is in dark or light mode from the hass object, with theme-name override logic for "Google Dark Theme" / "Google Light Theme".

### Modified Capabilities
- `thermostat-card`: The hass setter must track theme state changes and pass the resolved dark/light flag to the UI for re-rendering.
- `styling`: All hardcoded dark-theme colors become the dark variant; a parallel light variant is introduced with switched fills, text colors, and mode accent colors. CSS custom properties or class-based switching selects the active variant.

## Impact

- **dist/main.js**: `hass` setter gains theme state extraction and diff detection; passes light/dark flag to ThermostatUI.
- **dist/styles.js**: `cssData()` doubles in scope — every color property needs a light counterpart. Likely implemented via a `.dial--light` / `.dial--dark` class on the SVG root that toggles CSS custom property values.
- **dist/thermostat_card.lib.js**: `updateState` receives the theme flag and sets the appropriate class on the dial root. Minimal structural changes.
- No new files, no new dependencies, no breaking changes to existing config options.
