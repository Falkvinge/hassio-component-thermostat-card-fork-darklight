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

### v0.1.7 — 2026-04-23

Fixed dark/light theme auto-detection not following HA's runtime theme switch.

- **Fixed:** `resolveThemeDark` was comparing `hass.themes.selectedTheme` to the strings `"Google Dark Theme"` / `"Google Light Theme"`, but `selectedTheme` is a **ThemeSettings object** (`{ theme, dark?, ... }`), not a string — so those comparisons always evaluated to `false` and the name-based overrides never fired.
- **Fixed (design):** Even if the string comparison had worked, a theme named "Google Dark Theme" can be used in both light and dark mode (HA's `darkMode` toggle controls the variant), so overriding based on name alone was architecturally wrong.
- **Changed:** Detection now reads `selectedTheme.dark` first (HA's per-theme dark preference, the most specific signal), then falls back to `hass.themes.darkMode` (the global toggle). Named-theme string overrides removed entirely.

### v0.1.6 — 2026-04-23

Raised activity overlay visibility for both themes — the pulse is now clearly distinguishable from "no activity" even when glanced at mid-cycle at its local minimum.

- **Changed:** `@keyframes darklight-pulse` floor `0.40 → 0.60`, ceiling `0.90 → 1.00`. The glow at minimum is now unambiguous.
- **Changed:** Dark active gradient alphas `0.14/0.05 → 0.24/0.09` — gradient itself more vivid on dark background.
- **Changed:** Dark idle gradient alphas `0.07/0.025 → 0.12/0.05` — proportional bump, stays at ~half the active intensity.
- **Changed:** Light active gradient alphas `0.22/0.08 → 0.32/0.12` — same proportional boost for light theme consistency.
- **Changed:** `prefers-reduced-motion` fallback opacity `0.65 → 0.80` to match the new keyframe floor.
- **Unchanged:** Light idle gradient values, all JS logic, HA integration surface.

### v0.1.5 — 2026-04-23

Dark theme now has full activity overlay parity with the light theme.

- **New (dark theme):** Warm-orange glow for heating, cool-blue glow for cooling — same two-tier system as light: animated pulse when `hvac_action` confirms active pumping, static dim tint when the mode is armed but idle.
- **Unchanged:** Light theme overlay, all JS logic, HA integration surface. The `is-active-*` / `is-idle-*` classes were already being toggled on the container for both themes; this change adds the corresponding dark-scoped CSS rules.
- **Alpha calibration:** Dark variant uses ~0.65× the alpha of the light variant (active: 0.14/0.05 vs 0.22/0.08; idle: 0.07/0.025 vs 0.10/0.04) because the same colors appear more vivid against the near-black dial fill.

### v0.1.4 — 2026-04-23

Readability improvements to the center-dial typography for better legibility on a wall-mounted dashboard viewed from across a room.

- **Changed:** Ambient/target temperature digits enlarged **120px → 150px**. These are the primary at-a-glance readout and the previous size was hard to read at 3–4m without squinting.
- **Changed:** Decimal superscript x-offset adjusted proportionally (`+20 → +28`) so the `.5` digit continues to sit cleanly to the right of the enlarged whole-digit text.
- **Changed:** Room name title enlarged **24px → 32px** to keep the label in visual balance with the larger digits (24/150 = 16% read as a caption; 32/150 ≈ 21% reads as a proper label).
- **Changed:** Title vertical position moved down slightly (`y = radius * 0.55` from `radius * 0.50`; 100 → 110 at the default 400-diameter SVG) so the title and temperature digits group as a single readout unit rather than floating apart.
- **Unchanged:** Dual-setpoint low/high labels (90px), superscript font sizes, ring ticks, chevrons, dial geometry, dark/light theme behavior, HVAC overlay, HA integration surface.

### v0.1.3 — 2026-04-23

Refinement of v0.1.2's active-state pulse, based on real-world observation that climate integrations often under-report activity (some report `hvac_action: idle` while the unit is audibly running; others never expose `hvac_action` at all).

- **New (light theme):** The overlay now has two tiers.
  - **Animated pulse** when `hvac_action` reports `heating` or `cooling` — confirmed active pumping. Same timing and colors as v0.1.2.
  - **Static dim tint** when the mode is `heat`/`cool` but `hvac_action` isn't confirming activity (including when the attribute is missing entirely). Roughly half the gradient alpha of the active pulse; no animation. Answers "which ACs are switched on?" at a glance on an overview dashboard, even when the integration's action reporting is unreliable.
- **Changed:** `deriveActiveMode` return shape widened from `'heat' | 'cool' | null` to `'active_heat' | 'active_cool' | 'idle_heat' | 'idle_cool' | null`. The view toggles one of four mutually-exclusive classes (`is-active-heat`, `is-active-cool`, `is-idle-heat`, `is-idle-cool`) on the container.
- **Changed:** Entities that don't expose `hvac_action` no longer land in the active-pulse bucket (they used to pulse on state alone, which over-claimed). They now land in the idle-tint bucket — honest about what we actually know.
- **Unchanged:** Dark variant, public API, dashboard YAML, `prefers-reduced-motion` behavior (still disables the pulse animation; idle tints were already static).

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
