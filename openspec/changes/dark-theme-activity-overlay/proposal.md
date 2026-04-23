## Why

The light theme already has a differentiated activity overlay (animated pulse for confirmed active pumping, static dim tint for armed-but-idle) that was field-verified and appreciated. The dark theme should have parity: a user running a dark HA dashboard gets no visual indication that an AC is active other than the mode icon, while a user on a light dashboard gets the full glow/tint system. The same "which ACs are making noise?" at-a-glance value applies equally to both themes.

## What Changes

- Add CSS rules for `.dial--dark.is-active-heat::before`, `.dial--dark.is-active-cool::before`, `.dial--dark.is-idle-heat::before`, `.dial--dark.is-idle-cool::before` — the same radial-gradient overlay structure as the light variant, with alpha values calibrated for a dark background.
- Add `position: relative` to `.dial--dark` (currently absent, since the dark variant has no scoped CSS rules at all — it uses the global defaults). This is required for the absolute-positioned `::before` to be contained within the card.
- Extend the `prefers-reduced-motion` media query to also disable the animation on `.dial--dark.is-active-*::before`.
- The `@keyframes darklight-pulse` keyframe definition is reused unchanged.
- **No JS changes.** The four `is-active-heat / is-active-cool / is-idle-heat / is-idle-cool` classes are already toggled on the container unconditionally by `thermostat_card.lib.js` `updateState`, regardless of the active theme. Only CSS was gating the effect to the light variant.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `styling`: the "Differentiated activity overlay" requirement currently constrains the overlay to the light variant only. It is extended to cover both variants. Alpha values differ between variants (dark needs lower alphas — same RGB colors are much more vivid against a near-black fill than against near-white).

## Impact

- **Code**: `dist/styles.js` only — add ~30 lines of CSS. No JS changes. No config changes.
- **Release**: intended as `v0.1.5` (pure CSS addition, fully backward-compatible).
- **Risk**: very low. Adding CSS rules that scope to a class that was already being toggled; no existing rules are modified.
