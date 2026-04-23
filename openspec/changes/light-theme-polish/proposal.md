## Why

Two usability issues surfaced once the `darklight-theme-switch` card was running on a real light-mode Home Assistant dashboard:

1. The light-variant dial's off-state background (`#e8e8e8`) reads as "dark grey" on a bright dashboard — it makes an off thermostat look broken. It should fade into the dashboard background, not stand out.
2. Active climate entities (heating or cooling right now) are visually indistinguishable from idle ones in an overview. Users scanning many climate cards can't tell which AC units are running without looking at each card individually.

Both are light-theme-first concerns because the user base driving this work is on light dashboards. Dark-theme pulsing is a possible follow-up but is not in scope here.

## What Changes

- **Softer off-state background for the light variant.** Replace the current `#e8e8e8` off-fill with a near-white value (`#f7f7f7` or lighter) so an off thermostat almost disappears into a light dashboard. Applies only when `dial--light` is active. Dark variant is unchanged.
- **Animated "active" state pulse, light variant only.** When the climate entity reports `hvac_action: heating` (or `hvac_action: cooling`), layer a soft radial-gradient glow on the card container — centered, fading to transparent at the edges — in a pale warm orange for heating or pale cool blue for cooling. A slow 3-second opacity pulse (~0.4 → 0.9 → 0.4) makes the glow noticeable at a glance across a dashboard without stealing attention. When `hvac_action` is not reported by the entity, fall back to `hvac_state` (`heat` → warm, `cool` → cool); other modes get no pulse. In `auto` / `heat_cool` modes the pulse follows whichever direction the action actually is — if the action is unknown, no pulse.
- **`hvac_action` added to state extraction.** The card's state diff gains one field so a transition in/out of active pumping triggers a re-render even when setpoints haven't moved.
- **No change to public API, YAML config format, or the `thermostat-card` custom element name.** This is a 0.1.x point release.

## Capabilities

### New Capabilities

*(none)*

### Modified Capabilities

- `styling`: adds light-variant off-fill refinement and the active-state pulse layer + keyframe animation. Scoped by the `dial--light` class introduced in the darklight-theme-switch change.
- `thermostat-card`: extends state extraction to include `hvac_action` and a derived `active_mode` (`'heat' | 'cool' | null`) that CSS targets via container classes.

## Impact

- **Code:** `dist/main.js` (state extraction + diff), `dist/thermostat_card.lib.js` (container class toggles), `dist/styles.js` (light-variant overrides + `::before` pulse layer + `@keyframes`).
- **Dependencies:** none. Standard CSS animations; no JS timers, no external libs.
- **Backwards compat:** fully preserved. Entities that don't report `hvac_action` silently fall back to `hvac_state`. Dark-variant rendering is untouched. Picture-elements `no_card` mode keeps working because the pulse layer targets `this._container`, which exists in both chrome modes.
- **Performance:** one extra pseudo-element with an opacity animation per active card. GPU-accelerated, negligible.
- **Assumes:** the `darklight-theme-switch` change lands first (or concurrently). This change references the `dial--light` class and the `_container` element that darklight introduces. If darklight is reverted, this change's light-variant rules become dead CSS but cause no runtime error.
