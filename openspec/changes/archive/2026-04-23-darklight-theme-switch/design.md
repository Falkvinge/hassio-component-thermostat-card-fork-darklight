## Context

The thermostat card renders a circular SVG dial with hardcoded dark visuals: black fill (`#000000c2`), white text, white tick paths. All color values live in `dist/styles.js` as CSS custom properties set once at render time. The `hass` setter in `dist/main.js` currently tracks entity state but ignores theme data entirely.

Home Assistant exposes theme state on every `hass` update:
- `hass.themes.darkMode` — boolean, reflects the resolved dark/light mode for the current user
- `hass.themes.selectedTheme` — string, the theme name chosen in the user profile (can be null for "default")

The "Google Dark Theme" and "Google Light Theme" are explicit theme selections that carry their own dark/light intent regardless of the darkMode toggle.

## Goals / Non-Goals

**Goals:**
- Detect dark vs light mode from the `hass` object on every state update
- Treat current visuals as the dark variant (zero visual change for existing dark-mode users)
- Introduce a light variant with inverted contrast (light fill, dark text, adjusted accents)
- Switch automatically and reactively when HA theme state changes
- Smooth CSS transition between variants

**Non-Goals:**
- Manual per-card override config option
- Arbitrary theme palette support (we detect binary dark/light, not full theme colors)
- Changing SVG structure, layout, or interaction behavior

## Decisions

### 1. Detection algorithm: hass.themes with Google theme name override

**Choice:** Read `hass.themes.darkMode` as the primary signal. Before using it, check `hass.themes.selectedTheme` against the two known Google theme names as an override.

```
function resolveThemeDark(hass):
  theme = hass?.themes?.selectedTheme
  if theme == "Google Dark Theme" → return true
  if theme == "Google Light Theme" → return false
  return hass?.themes?.darkMode ?? true   // default dark
```

**Why not CSS media query (`prefers-color-scheme`)?** The media query reflects the OS preference, not the HA-level theme choice. A user can set HA to light mode while their OS is dark. `hass.themes.darkMode` is the HA-resolved value, which is what we want.

**Why not only `darkMode` without the Google override?** The Google themes are explicit user intent — "I chose a light theme" — and some HA configurations have darkMode not perfectly in sync with the selected theme. The override is a safety net that matches the user's stated request.

### 2. Theme state as part of entity state diff

**Choice:** Add `theme_dark` (boolean) to the `new_state` object in the `hass` setter alongside the existing entity fields. Include it in the diff comparison. When it changes, call `updateState` with the new state including the theme flag.

**Why in the state object?** Reuses the existing diff mechanism. No new event system, no new lifecycle — it's just another field in the state snapshot. ThermostatUI's `updateState` already receives an options bag; adding `theme_dark` is a one-line expansion.

**Alternative considered:** A separate `updateTheme()` method on ThermostatUI. Rejected because it creates a second update path that can race with state updates. Keeping everything in one `updateState` call is simpler and avoids partial-render states.

### 3. CSS class toggle on dial container for variant switching

**Choice:** Apply `dial--dark` or `dial--light` class on the `ThermostatUI._container` div — the top-level wrapper that holds the more-info icon, mode icon, SVG dial, and mode dialog as siblings.

```css
.dial--light .dial { /* SVG variant */
  --thermostat-off-fill: #e8e8e8;
  --thermostat-text-color: #333;
}
.dial--light .dot_r { background-color: #333; }
.dial--light .dialog { background: rgba(255, 255, 255, 0.85); }
```

**Why on the container, not the SVG root?** The SVG dial, the mode icon's `.dot_r`, and the mode `.dialog` are **siblings inside the container**, not descendants of the SVG. A class on the SVG can only reach SVG descendants via CSS. Putting it on the container lets all four DOM subtrees respond to the same class.

**Why class toggle vs. generating two CSS strings?** A class toggle:
- Keeps `cssData()` as a single function call at `setConfig` time (no re-injection of `<style>` needed)
- Leverages CSS specificity naturally — `.dial--light .dial` overrides `.dial` defaults
- Enables smooth CSS transitions between variants
- Is the same pattern the card already uses for `in_control`, `has_dual`, `dial--edit`

### 4. Light variant color palette

**Choice:** Invert the contrast model while preserving mode color identity.

| Property | Dark | Light |
|----------|------|-------|
| `--thermostat-off-fill` | `#000000c2` | `#e8e8e8` |
| `--thermostat-text-color` | `white` | `#333333` |
| `--thermostat-path-color` | `rgba(255,255,255,0.3)` | `rgba(0,0,0,0.15)` |
| `--thermostat-path-active-color` | `rgba(255,255,255,0.8)` | `rgba(0,0,0,0.6)` |
| `--thermostat-path-active-color-large` | `rgba(255,255,255,1)` | `rgba(0,0,0,0.85)` |
| `--heat_color` | `#ff8100` | `#e06600` |
| `--cool_color` | `rgba(0,122,241,0.6)` | `rgba(0,100,200,0.7)` |
| `--off_color` | `#8a8a8a` | `#999999` |
| Dialog bg | `#0000008c` | `rgba(255,255,255,0.85)` |
| Dialog border | `#ffffff` | `#cccccc` |
| `.dot_r` bg | `white` | `#333333` |
| Editable indicator fill | `white` | `#333333` |

Light accent colors are slightly darkened/saturated to maintain contrast on light backgrounds. Exact values to be tuned during implementation.

### 5. Where the class gets toggled

**Choice:** `ThermostatUI.updateState()` receives `options.theme_dark` and toggles the class on `this._container` directly via `classList.toggle`. The existing `_updateClass` helper targets `this._root` (the SVG) and is not reused here, because the class needs to live on the container so sibling subtrees can respond. One extra line of direct `classList` manipulation is clearer than a helper parameterized on target element.

## Risks / Trade-offs

- **[Color tuning]** → Light accent colors may need iteration. The exact hex values in the table above are starting points. Mitigation: test against all HVAC modes visually; adjust before merge.
- **[Theme name brittleness]** → If Google renames their themes, the override stops working. Mitigation: falls back to `hass.themes.darkMode` which is robust. The override is additive safety, not the only path.
- **[Transition flash]** → On first load, the card renders dark (default) then may flip to light when the first `hass` call arrives. Mitigation: the CSS transition smooths this. The flash is at most one frame and the 0.5s fill transition covers it.
- **[No ha-card background adaptation]** → The `ha-card` element's background comes from HA's own theme, not from us. In `no_card` mode it's transparent. In standard mode, HA's theme already handles the card chrome. No action needed from us.

## Open Questions

- Should the light mode dialog use `backdrop-filter: blur()` with a different grayscale, or drop the filter entirely for a cleaner light look? Propose starting with `blur(6px) grayscale(20%)` and tuning.
