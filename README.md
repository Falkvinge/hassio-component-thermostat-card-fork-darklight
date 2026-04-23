# Lovelace Thermostat Card — Darklight Fork

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)

A circular thermostat card for Home Assistant Lovelace, rendered in SVG + CSS. This is the **darklight** fork of [`fineemb/lovelace-thermostat-card`](https://github.com/fineemb/lovelace-thermostat-card), which in turn builds on [Dal Hundal's CodePen](https://codepen.io/dalhundal/pen/KpabZB/) thermostat control.

Maintained at [`Falkvinge/hassio-component-thermostat-card-fork-darklight`](https://github.com/Falkvinge/hassio-component-thermostat-card-fork-darklight).

## What this fork adds

- **Automatic dark/light theme switching.** The card watches `hass.themes.darkMode` and the selected Home Assistant theme. When the dashboard is in light mode (or the selected theme is "Google Light Theme"), the dial re-colors itself: light fill, dark text, light-appropriate HVAC accent colors, light mode dialog. When dark, the original visuals are used unchanged. No per-card configuration required.
- Everything else the upstream card does: click-quadrant setpoint control, dual-setpoint (`heat_cool`) mode, HVAC mode selector overlay, ambient temperature display, `no_card` mode for use inside picture-elements, custom CSS variables for theming.

## Install via HACS (custom repository)

1. Open HACS in your Home Assistant UI.
2. Frontend → three-dot menu → **Custom repositories**.
3. Add `https://github.com/Falkvinge/hassio-component-thermostat-card-fork-darklight` with category **Lovelace**.
4. Install "Climate thermostat card (darklight fork)" from the list.
5. HACS will place the files under `/hacsfiles/hassio-component-thermostat-card-fork-darklight/`.
6. Add the resource (HACS usually does this automatically, but verify):
   ```yaml
   resources:
     - url: /hacsfiles/hassio-component-thermostat-card-fork-darklight/main.js
       type: module
   ```
7. Hard-refresh the browser (Ctrl+F5) so the new module loads.

## Manual install

1. Download `main.js`, `thermostat_card.lib.js`, and `styles.js` from the [latest release](https://github.com/Falkvinge/hassio-component-thermostat-card-fork-darklight/releases/latest).
2. Copy all three files to `www/community/hassio-component-thermostat-card-fork-darklight/` inside your HA config directory.
3. Add the resource to your Lovelace config:
   ```yaml
   resources:
     - url: /hacsfiles/hassio-component-thermostat-card-fork-darklight/main.js
       type: module
   ```
4. Hard-refresh.

## Usage

```yaml
- type: custom:thermostat-card
  entity: climate.living_room
  title: Living Room
```

The custom element name `thermostat-card` is unchanged from upstream — any existing dashboard YAML written for `fineemb/lovelace-thermostat-card` works as-is.

## Options

| Name                  | Type    | Default      | Description                                                                                        |
| --------------------- | ------- | ------------ | -------------------------------------------------------------------------------------------------- |
| `type`                | string  | **Required** | `custom:thermostat-card`                                                                           |
| `entity`              | string  | **Required** | Entity id of the climate entity. Example: `climate.hvac`                                           |
| `title`               | string  | optional     | Card title                                                                                         |
| `no_card`             | boolean | `false`      | When `true`, omit the `ha-card` chrome — for use inside `picture-elements`                          |
| `step`                | number  | `0.5`        | Degrees per click when adjusting the setpoint                                                      |
| `highlight_tap`       | boolean | `false`      | Briefly highlight the tap quadrant on interaction                                                  |
| `chevron_size`        | number  | `50`         | Pixel size of the setpoint-adjust chevrons                                                         |
| `pending`             | number  | `3`          | Seconds to wait in "control" state before committing a setpoint change to the backend              |
| `idle_zone`           | number  | `2`          | Minimum degrees between low and high setpoints in dual (`heat_cool`) mode                           |
| `ambient_temperature` | string  | optional     | Entity id of a sensor to use as the ambient reading, overriding the climate entity's own value     |

## Changelog

### v0.1.2 — 2026-04-23

- **Changed (light theme):** The off-state dial fill is now near-white (`#f7f7f7`) instead of the previous mid-grey, so an idle thermostat blends into a light dashboard instead of reading as a dark disc.
- **New (light theme):** When a climate entity is actively heating or cooling (via `hvac_action`, with `hvac_state` as a fallback for entities that don't expose the attribute), the card displays a soft radial-gradient glow that pulses slowly — warm orange for heating, cool blue for cooling. The effect is peripheral-vision friendly by design: noticeable on an overview dashboard, not attention-stealing. Respects the OS `prefers-reduced-motion` setting (glow stays, pulse stops). Dark variant is unchanged.
- **Unchanged:** Public API, dashboard YAML, all existing behavior from v0.1.1.

### v0.1.1 — 2026-04-23

- **New:** Card self-registers with Home Assistant's `window.customCards` registry. The HA "Add card" dialog now lists this card as "Thermostat Card (darklight fork)" with a description and a direct link to this repo. Fork identity is now visible at dashboard-configuration time, not just in the devtools console.
- **Unchanged:** Runtime rendering, feature set, public API. Dashboard YAML written against v0.1.0 continues to work.

### v0.1.0 — 2026-04-23

Initial release under the `Falkvinge/hassio-component-thermostat-card-fork-darklight` name. Based on upstream `fineemb/lovelace-thermostat-card` v1.3.0.

- **New:** Automatic dark/light theme switching that follows `hass.themes.darkMode` and honors "Google Dark Theme" / "Google Light Theme" selected-theme overrides. The card's former visuals become the `dark` variant; a parallel `light` variant covers dial fill, text, ticks, chevrons, editable indicator, HVAC accent colors, mode-icon dot, and the HVAC mode dialog.
- **Changed:** Card banner on the JS console now reads "Thermostat Card (darklight fork) / Version 0.1.0".
- **Unchanged:** All pre-existing behavior from upstream v1.3.0 — user API, entity wiring, setpoint math, dual-mode logic, `no_card` mode.

For the design and specification of the theme-switch feature, see `openspec/changes/darklight-theme-switch/` in the repo (pre-archive) or `openspec/specs/` (post-archive, future).

## Credits

- [@dalhundal](https://codepen.io/dalhundal) — original CodePen thermostat control
- [Marius-Stefan Ciotlos & Silas Baronda](https://github.com/CM6/lovelace-thermostat-dark-card) — first Lovelace port
- [@fineemb](https://github.com/fineemb) — `lovelace-thermostat-card` v1.3.0, the direct parent of this fork
- [@Falkvinge](https://github.com/Falkvinge) — this fork

## License

MIT. See `LICENSE` for the full chain of copyright holders.
