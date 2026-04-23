## Context

Built on the `darklight-theme-switch` change (v0.1.0+): light-variant class `dial--light` lives on `ThermostatUI._container`; the SVG dial reads `--thermostat-off-fill` for the inactive state; HVAC mode is exposed on `this._root` as `dial--state--<hvac_state>`.

Two specific UX issues from real-world use of the light variant:

1. **Off-state fill reads too dark.** `#e8e8e8` was chosen for safety (clear circle visible on white) but overshoots — an "off" thermostat looks more present than it should on a light dashboard, competing with truly-active cards for attention.
2. **No active-state signal on overview dashboards.** With several climate cards visible, users can't tell which are actively heating/cooling without focusing on each card. The SVG ring already tints by mode, but that tint is subtle at dashboard-scan distance and shows mode, not action (a thermostat set to `heat` but currently idle tints the same as one actively heating).

Home Assistant exposes two climate-entity signals that matter here:
- `state` (a.k.a. `hvac_state`) — the selected mode: `off`, `heat`, `cool`, `auto`, `heat_cool`, `dry`, `fan_only`
- `attributes.hvac_action` — the *current action*: `off`, `idle`, `heating`, `cooling`, `drying`, `fan`. Optional; not every climate integration reports it.

## Goals / Non-Goals

**Goals:**
- Off state in light variant fades into a light dashboard; visually present but unobtrusive.
- Active heating/cooling is identifiable at a glance across a dashboard of several climate cards.
- Signal strength: noticeable at scan distance, not distracting when staring at the card.
- Zero new config knobs; works out of the box.
- Honors `prefers-reduced-motion`.
- Works in both `ha-card` chrome mode and `no_card` mode.

**Non-Goals:**
- Dark-theme pulse. User framed both asks as light-theme concerns; dark-theme users don't have the same "card disappears into light background" problem and pale orange/blue overlays would interact awkwardly with the dark dial palette. Defer to a follow-up if ever needed.
- Per-entity pulse-color override via config.
- Animating SVG internals (ring, ticks) — existing mode-tint already serves mode identity; pulse is a separate, complementary signal for action.
- Dedicated status icon or text badge. The pulse *is* the badge.
- Reactivity to non-heating/non-cooling actions (`drying`, `fan`). Out of scope per user request; can be added later.

## Decisions

### 1. Off-fill value: `#f7f7f7`

**Options considered:**
- `#fafafa` — extremely pale, blends almost perfectly with a `#ffffff` dashboard but disappears entirely on dashboards with default `--card-background-color` (which is `#ffffff` in Home Assistant's light theme).
- `#f5f5f5` — slightly more distinguishable from pure white; matches Material Design "grey 100".
- `#f7f7f7` — middle ground.

**Choice:** `#f7f7f7`. Distinguishable enough from `#ffffff` that the dial outline is discernible on a default light dashboard, but pale enough that it recedes when you're not looking at it. The old `#e8e8e8` reads as roughly 9% darker than white; `#f7f7f7` is ~3% darker — a clearly lighter value while still having an edge.

This is a one-line change: the `--thermostat-off-fill` value in the `.dial--light .dial { ... }` block.

### 2. Activity signal: differentiated active-vs-idle, two visual intensities

**Revised in v0.1.3 follow-up.** Original design (v0.1.2) trusted `hvac_action` as the sole gate: no pulse when `hvac_action: idle`. Field testing surfaced two problems:

1. **Idle ≠ off from the user's perspective.** An AC in `cool` mode at setpoint reports `hvac_action: idle` but the compressor may still be running (cycling on/off). The user's actual question — "where is the AC noise in the apartment coming from?" — requires a signal even when the integration says "idle".
2. **Data quality.** At least one climate integration observed in testing reports `hvac_action: idle` while the physical unit is audibly pumping. Binding the pulse strictly to `hvac_action` throws away the correct signal in those cases.

**Revised design — two overlay intensities, mutually exclusive:**

| Condition | Class | Visual |
|---|---|---|
| `hvac_action: heating` | `is-active-heat` | Pulsing warm-orange glow (animated) |
| `hvac_action: cooling` | `is-active-cool` | Pulsing cool-blue glow (animated) |
| Mode `heat`, `hvac_action` not active (idle / missing / off / etc.) | `is-idle-heat` | Static warm-orange tint (~½ alpha, no animation) |
| Mode `cool`, `hvac_action` not active | `is-idle-cool` | Static cool-blue tint (~½ alpha, no animation) |
| Mode `off`, `auto`, `heat_cool`, `dry`, `fan_only`, or unknown | *(no class)* | No overlay |

The pulsing overlay unambiguously signals **confirmed active pumping**; the static tint signals **this AC is switched on to heat/cool**. A glance at the dashboard answers both "which ACs are on?" (any tint or pulse) and "which are confirmed running right now?" (only pulsing ones).

**Why `auto` / `heat_cool` → no overlay:** direction is ambiguous without a current action signal, and painting both warm and cool tints simultaneously would be noisy. Acceptable loss; users with those modes can rely on the existing mode-icon dot for direction.

**Fallback rationale for missing `hvac_action`:** previously the fallback mapped `state: heat` → active pulse. That was too generous — we claimed confirmed pumping on pure mode information. The revised mapping sends `hvac_action`-less entities to the idle-tint bucket instead. They still get a visible signal; they just don't falsely claim to be actively pumping.

**`active_mode` return values:** `'active_heat' | 'active_cool' | 'idle_heat' | 'idle_cool' | null`.

**Decision table (implemented in `deriveActiveMode(entity)`):**

| `hvac_action` | `entity.state` | `active_mode` |
|---|---|---|
| `'heating'` | (any) | `'active_heat'` |
| `'cooling'` | (any) | `'active_cool'` |
| any other value | `'heat'` | `'idle_heat'` |
| any other value | `'cool'` | `'idle_cool'` |
| undefined | `'heat'` | `'idle_heat'` |
| undefined | `'cool'` | `'idle_cool'` |
| (any) | `'off'`, `'auto'`, `'heat_cool'`, `'dry'`, `'fan_only'`, unknown | `null` |

**Derivation lives in `main.js`, not in the view.** Same pattern as `theme_dark`: derived in the `hass` setter, added to `new_state`, included in the diff (via the `hvac_action` field, which covers all transitions since `active_mode` is derived from it plus `state`), passed to `updateState(options, hass)`. The view reads `options.active_mode` and toggles one of four classes.

### 3. Overlay implementation: `::before` pseudo-element with opacity animation (active) or static opacity (idle)

**Options considered:**
- **Animate `background-image` gradient keyframes directly** on the container. Rejected: gradient interpolation between keyframes is browser-specific and often not smooth; most engines snap between keyframes instead of interpolating stop positions.
- **Multiple layered backgrounds, animate `background-position`.** Works but is harder to reason about than a single opacity animation.
- **Real `<div>` child element inserted by JS.** Requires DOM changes in `thermostat_card.lib.js`, more code than necessary. The pseudo-element approach needs only CSS.
- **Pseudo-element with fixed radial gradient, animate `opacity`.** Cleanest: opacity animations are GPU-accelerated (transform/opacity are the two CSS properties browsers reliably composite off-main-thread), the gradient stays static, and the visual effect is exactly "breathing brightness."

**Choice:** the pseudo-element approach. The container gets `position: relative`; all four class selectors (`.dial--light.is-active-heat::before`, `-active-cool`, `-idle-heat`, `-idle-cool`) share the common `position: absolute; inset: 0; pointer-events: none; border-radius: inherit;` declarations. The active classes add an opacity animation and full-alpha gradient; the idle classes use a reduced-alpha gradient and omit the animation (static tint).

**Layering:** `::before` is behind normal-flow children by default, so the SVG dial, `.climate_info`, and the mode dialog render on top of the overlay naturally. No `z-index` juggling needed.

### 4. Gradient parameters

**Active (pulsing) overlay:**
```css
background: radial-gradient(
  circle at center,
  <color at 0.22 alpha> 0%,
  <color at 0.08 alpha> 45%,
  transparent 80%
);
```

**Idle (static) overlay:**
```css
background: radial-gradient(
  circle at center,
  <color at 0.10 alpha> 0%,
  <color at 0.04 alpha> 45%,
  transparent 80%
);
```

- "Circle at center" — the user asked for center-prominent.
- Stop positions identical across active and idle: peak hits the inner ~45%, tails off before the edge. Keeps rounded corners clean even if `border-radius: inherit` were ever bypassed.
- Idle alphas are ~45% of active alphas. Combined with the pulse cycling between 0.40 and 0.90 opacity, the idle static tint (at effective alpha ~0.10) sits visibly below the pulse's minimum (0.22 × 0.40 ≈ 0.088 effective) when averaged over the cycle, so active cards still read "more present" than idle-tinted ones.

**Warm orange:** `rgba(255, 140, 0, α)` — same hue family as the existing `--heat_color: #ff8100`.
**Cool blue:** `rgba(0, 122, 241, α)` — same hue family as `--cool_color`.

These match the mode accents users already associate with heating/cooling, so the overlay reinforces the mode tint rather than introducing a new color vocabulary.

### 5. Animation timing

```css
@keyframes darklight-pulse {
  0%, 100% { opacity: 0.40; }
  50%      { opacity: 0.90; }
}
/* 3s cycle, ease-in-out, infinite */
```

**Why 3s?** Human resting breathing rate is 3–5 seconds per cycle; this lands at the fast end of that range, which reads as "alert but calm". Faster (1–2s) feels anxious; slower (5s+) is too sluggish to read as a signal.

**Why 0.40 ↔ 0.90?** Non-zero at the dim end so the gradient is always visible (not blinking on/off — steady "presence with emphasis"). Caps under 1.0 to keep the brightest moment from washing out card text/icons rendered on top.

### 6. Reduced-motion handling

```css
@media (prefers-reduced-motion: reduce) {
  .dial--light.is-active-heat::before,
  .dial--light.is-active-cool::before {
    animation: none;
    opacity: 0.65;
  }
}
```

Animation off on the active overlays; static midpoint opacity so the color signal is still conveyed without movement. The idle-tint overlays are already static and unaffected by the media query. Non-negotiable: unbounded loops in peripheral vision are a known accessibility pain point.

### 7. Class toggle placement

In `ThermostatUI.updateState()`, after the existing `dial--dark`/`dial--light` toggle:

```js
const m = options.active_mode; // 'active_heat' | 'active_cool' | 'idle_heat' | 'idle_cool' | null
this._container.classList.toggle('is-active-heat', m === 'active_heat');
this._container.classList.toggle('is-active-cool', m === 'active_cool');
this._container.classList.toggle('is-idle-heat',   m === 'idle_heat');
this._container.classList.toggle('is-idle-cool',   m === 'idle_cool');
```

At most one class is set at a time because the five return values of `deriveActiveMode` are mutually exclusive. Same toggle pattern as the theme class from darklight-theme-switch.

### 8. `no_card` mode compatibility

`this._container` exists whether `no_card` is set or not — it's the top-level div that the custom element's Shadow DOM adopts. Attaching the pulse to the container means `no_card` instances (which skip the `ha-card` chrome) still get the pulse, rendered directly on the dashboard. This is actually more useful in `no_card` mode since that mode is typically picture-elements + dashboards where the at-a-glance signal matters most.

## Risks / Trade-offs

**[Color tuning is empirical]** → CSS values in this design are starting points. Final alpha levels, stop positions, and animation timing may need one round of adjustment after the change is installed on a real dashboard. All tunable from `styles.js` without touching JS.

**[`hvac_state` fallback lands in idle tint, never active pulse]** → In the revised (v0.1.3) design, an entity that doesn't expose `hvac_action` never reaches the pulsing state — it's capped at the idle tint. Trade-off accepted because the pulse is a *confirmed-pumping* signal; without `hvac_action` we cannot confirm pumping, and over-claiming via pulse defeats the purpose of the differentiation. Users with `hvac_action`-less entities still get a meaningful "this AC is switched on" signal via the tint.

**[Pulse on many cards may look busy]** → If a user has a dashboard with 10 climate cards all running, 10 pulsing glows could feel chaotic. Mitigation: animation is offset per-card naturally because each card's `animation-start` is its DOM load time; they won't phase-lock. If this proves distracting in practice, we can add an `animation-delay: calc(var(--card-index, 0) * 0.3s)` strategy in a follow-up. Not pre-optimizing here.

**[`prefers-reduced-motion` handling isn't tested for this card yet]** → First introduction of animation to this codebase. The media query is well-supported (>96% global browsers) but should be verified on the user's primary device.

**[Subtle CSS specificity]** → `.dial--light.is-active-heat::before` and `.dial--light .dial__editableIndicator` have different specificity; care needed to avoid unintended interactions. Kept simple here (pseudo-elements can't be overridden by the SVG internals that would otherwise collide).

## Open Questions

- **Should the pulse also react to `drying` and `fan` actions?** User specified "cooling, heating" explicitly, so deferred. Could add `--dry` and `--fan` variants later with different color families if requested.
- **Should the reduced-motion fallback use a lower static opacity (0.55?) to feel less "on"?** Current design uses 0.65 as a midpoint. First-pass choice; adjust after seeing.
