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

### 2. Active signal: `hvac_action` first, `hvac_state` fallback

**Why `hvac_action`?** It answers "is this climate actively pumping heat/cool right now?" — which is exactly the question "is this AC running?". A climate set to `heat` but at target reports `hvac_action: idle`; the pulse should NOT show then, or the signal is meaningless.

**Why fall back to `hvac_state`?** Not every climate integration populates `hvac_action`. Older integrations, generic_thermostat without explicit heater_entity, some cloud-based climates. Without a fallback, those entities get no pulse ever — worse than a slightly lower-fidelity pulse.

**Fallback mapping:**
- `hvac_state === 'heat'` → active_mode = `'heat'` (may over-report when target reached; acceptable trade-off)
- `hvac_state === 'cool'` → active_mode = `'cool'` (same)
- `hvac_state === 'auto'` or `'heat_cool'` → active_mode = `null` (direction unknown without action signal; conservative)
- Anything else (`off`, `dry`, `fan_only`, unknown) → `null`

**Derivation lives in `main.js`, not in the view.** Same pattern as `theme_dark`: derived in the `hass` setter, added to `new_state`, included in the diff, passed to `updateState(options, hass)`. The view reads `options.active_mode` and toggles classes.

### 3. Pulse implementation: `::before` pseudo-element with opacity animation

**Options considered:**
- **Animate `background-image` gradient keyframes directly** on the container. Rejected: gradient interpolation between keyframes is browser-specific and often not smooth; most engines snap between keyframes instead of interpolating stop positions.
- **Multiple layered backgrounds, animate `background-position`.** Works but is harder to reason about than a single opacity animation.
- **Real `<div>` child element inserted by JS.** Requires DOM changes in `thermostat_card.lib.js`, more code than necessary. The pseudo-element approach needs only CSS.
- **Pseudo-element with fixed radial gradient, animate `opacity`.** Cleanest: opacity animations are GPU-accelerated (transform/opacity are the two CSS properties browsers reliably composite off-main-thread), the gradient stays static, and the visual effect is exactly "breathing brightness."

**Choice:** the pseudo-element approach. The container gets `position: relative`; `.dial--light.is-active-heat::before` (and `-cool`) sets `position: absolute; inset: 0; pointer-events: none; border-radius: inherit;` plus a radial gradient and an `animation` targeting opacity.

**Layering:** `::before` is behind normal-flow children by default, so the SVG dial, `.climate_info`, and the mode dialog render on top of the overlay naturally. No `z-index` juggling needed.

### 4. Gradient parameters

```css
background: radial-gradient(
  circle at center,
  <color at 0.22 alpha> 0%,
  <color at 0.08 alpha> 45%,
  transparent 80%
);
```

- "Circle at center" — the user asked for center-prominent.
- Stop positions: peak hits the inner ~45% of the card at meaningful alpha, tails off to invisible before the edge. This keeps rounded corners clean even if `border-radius: inherit` were ever bypassed.
- Alpha values: tuned empirically. 0.22 at the center is roughly 22% tint — noticeable on white, not overwhelming. Final values may need adjustment after seeing on real dashboards; they're CSS-tunable without code changes.

**Warm orange:** `rgba(255, 140, 0, α)` — same hue family as the existing `--heat_color: #ff8100`.
**Cool blue:** `rgba(0, 122, 241, α)` — same hue family as `--cool_color`.

These match the mode accents users already associate with heating/cooling, so the pulse reinforces the mode tint rather than introducing a new color vocabulary.

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

Animation off; static midpoint opacity so the color signal is still conveyed without movement. Non-negotiable: unbounded loops in peripheral vision are a known accessibility pain point.

### 7. Class toggle placement

In `ThermostatUI.updateState()`, after the existing `dial--dark`/`dial--light` toggle:

```js
const active = options.active_mode; // 'heat' | 'cool' | null
this._container.classList.toggle('is-active-heat', active === 'heat');
this._container.classList.toggle('is-active-cool', active === 'cool');
```

Same pattern as the theme toggle from darklight-theme-switch. No new helper needed.

### 8. `no_card` mode compatibility

`this._container` exists whether `no_card` is set or not — it's the top-level div that the custom element's Shadow DOM adopts. Attaching the pulse to the container means `no_card` instances (which skip the `ha-card` chrome) still get the pulse, rendered directly on the dashboard. This is actually more useful in `no_card` mode since that mode is typically picture-elements + dashboards where the at-a-glance signal matters most.

## Risks / Trade-offs

**[Color tuning is empirical]** → CSS values in this design are starting points. Final alpha levels, stop positions, and animation timing may need one round of adjustment after the change is installed on a real dashboard. All tunable from `styles.js` without touching JS.

**[`hvac_state` fallback over-reports]** → A climate set to `heat` but currently at target (idle in reality) will still pulse under the fallback path. Acceptable because the fallback only triggers for entities that don't report `hvac_action` at all, and the user likely prefers "pulse when set to heat" over "never pulse". Documented in the spec as a known limitation.

**[Pulse on many cards may look busy]** → If a user has a dashboard with 10 climate cards all running, 10 pulsing glows could feel chaotic. Mitigation: animation is offset per-card naturally because each card's `animation-start` is its DOM load time; they won't phase-lock. If this proves distracting in practice, we can add an `animation-delay: calc(var(--card-index, 0) * 0.3s)` strategy in a follow-up. Not pre-optimizing here.

**[`prefers-reduced-motion` handling isn't tested for this card yet]** → First introduction of animation to this codebase. The media query is well-supported (>96% global browsers) but should be verified on the user's primary device.

**[Subtle CSS specificity]** → `.dial--light.is-active-heat::before` and `.dial--light .dial__editableIndicator` have different specificity; care needed to avoid unintended interactions. Kept simple here (pseudo-elements can't be overridden by the SVG internals that would otherwise collide).

## Open Questions

- **Should the pulse also react to `drying` and `fan` actions?** User specified "cooling, heating" explicitly, so deferred. Could add `--dry` and `--fan` variants later with different color families if requested.
- **Should the reduced-motion fallback use a lower static opacity (0.55?) to feel less "on"?** Current design uses 0.65 as a midpoint. First-pass choice; adjust after seeing.
