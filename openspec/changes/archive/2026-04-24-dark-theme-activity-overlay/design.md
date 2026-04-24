## Context

The light-variant activity overlay was implemented in `v0.1.2`/`v0.1.3` using CSS `::before` pseudo-elements on the card container. The container (`ThermostatUI._container`) has four mutually-exclusive classes toggled by `updateState` in `thermostat_card.lib.js`:

```
is-active-heat  — hvac_action === 'heating'
is-active-cool  — hvac_action === 'cooling'
is-idle-heat    — mode = heat but action not confirmed
is-idle-cool    — mode = cool but action not confirmed
```

These classes are **already toggled regardless of the active theme** (lines 118–121 of `thermostat_card.lib.js`). The only reason the dark variant has no overlay is that CSS rules for `.dial--dark.is-active-*` simply don't exist. The dark variant has no scoped CSS at all — it uses the global default styles.

The `@keyframes darklight-pulse` animation is already declared in `styles.js` and can be referenced by the new dark rules without redeclaration.

The light variant currently uses:

| State        | Center alpha | Mid alpha | Outer |
|---|---|---|---|
| active-heat  | 0.22         | 0.08      | transparent |
| active-cool  | 0.22         | 0.08      | transparent |
| idle-heat    | 0.10         | 0.04      | transparent |
| idle-cool    | 0.10         | 0.04      | transparent |

Dark background fill is `#000000c2` ≈ rgba(0,0,0,0.76). Orange and blue glow on near-black backgrounds is inherently much more vivid than on near-white, so the same alpha would produce an overpowering neon-glow effect rather than a subtle tint. The dark variant values are scaled down to produce the same *perceived* subtlety.

## Goals / Non-Goals

**Goals:**

- Add activity overlay (pulse + static tint) to the dark variant — feature parity with light.
- Calibrate alpha values for dark backgrounds so the effect reads as "subtle glow" not "neon".
- Extend `prefers-reduced-motion` coverage to include dark variant active overlays.
- Zero JS changes.
- Ship as `v0.1.5`.

**Non-Goals:**

- Not changing the light variant's values or behaviour.
- Not changing the animation timing, keyframe shape, colors (orange / blue hue), or gradient geometry.
- Not changing the `is-*` class-toggling logic in JS.
- Not changing any HA integration surface.

## Decisions

### §1. Alpha scaling: dark = light × ~0.65

**Choice**: Dark active alphas `0.14 / 0.05`; dark idle alphas `0.07 / 0.025`. This is approximately 0.65× the light variant values.

**Rationale**: Perceptual brightness of a semi-transparent color on a background scales non-linearly with the background luminance. A rule-of-thumb for OLED/dark-background designs is to use 60–70% of the alpha you would use on a white background to achieve the same perceived intensity. `0.65 × 0.22 ≈ 0.14`, `0.65 × 0.08 ≈ 0.05`. The idle tint follows the same scaling. These values produce a warm glow / cool glow that is clearly visible at a glance on a dark card without feeling garish.

The exact values (0.14 / 0.05 / 0.07 / 0.025) should be treated as starting points; the QA tasks explicitly ask the implementer to verify perceptually against the light variant on the same dashboard and tune if needed. Because this is a patch release, a follow-up `v0.1.5.x` tweak is cheap if the community finds the values off.

**Alternative considered**: keep identical alphas as light. Rejected — at `0.22` center alpha, orange-on-black would be very vivid and attention-stealing; inconsistent with the design intent of "noticeable but not demanding".

**Alternative considered**: compute alpha from the `--heat_color` / `--cool_color` CSS custom properties so they track together automatically. Rejected — CSS doesn't support computing alpha from a custom property in a radial-gradient at the values we need; this would require `color-mix()` which has limited HA browser support.

### §2. `position: relative` on `.dial--dark`

**Choice**: Add `position: relative` to a new `.dial--dark { ... }` CSS block.

**Rationale**: The `::before` pseudo-element uses `position: absolute; inset: 0` to cover the container. This only works if the container establishes a containing block. The `.dial--light { position: relative; }` rule was added when the light overlay was implemented. The dark variant needs the same. Since no `.dial--dark { }` block currently exists in `styles.js`, this is the first scoped rule for the dark variant.

### §3. Shared `::before` base rule

**Choice**: Add a shared selector block:
```css
.dial--dark.is-active-heat::before,
.dial--dark.is-active-cool::before,
.dial--dark.is-idle-heat::before,
.dial--dark.is-idle-cool::before {
  content: ''; position: absolute; inset: 0;
  pointer-events: none; border-radius: inherit;
}
```

**Rationale**: Mirrors the existing light block exactly for maintainability. Keeps the base layout properties (content, position, inset, pointer-events, border-radius) separate from the per-state appearance (gradient, animation).

### §4. Gradient colors: same orange/blue hue, lower alpha

**Choice**: Use the same RGB base values as light — orange `rgba(255, 140, 0, ...)` and blue `rgba(0, 122, 241, ...)` — only the alpha differs.

**Rationale**: The colors are derived from the same palette as `--heat_color` / `--cool_color` in the dark variant. Keeping the hue identical means the overlay reinforces the same color vocabulary. The dark variant's `--heat_color` is `#ff8100` = rgb(255,129,0), close enough to 255,140,0 to be perceptually consistent.

### §5. Reuse `@keyframes darklight-pulse` — no redeclaration

**Choice**: Reference `animation: darklight-pulse 3s ease-in-out infinite;` in the new dark active rules directly; the keyframes block stays where it is (after the light rules).

**Rationale**: CSS `@keyframes` are globally scoped within a stylesheet; no selector scoping needed. Re-declaring them would be redundant and confusing.

### §6. Extend `prefers-reduced-motion` block in-place

**Choice**: Add `.dial--dark.is-active-heat::before, .dial--dark.is-active-cool::before` to the existing `@media (prefers-reduced-motion: reduce)` block.

**Rationale**: Keeps both theme variants' accessibility behaviour in one place. Simpler than a second `@media` block.

### §7. Version: `v0.1.5` patch

**Choice**: Patch bump. CSS-only addition, zero behaviour change, fully backward-compatible.

## Risks / Trade-offs

- **Alpha values too high or too low on specific hardware** → The 0.65× scaling is a heuristic. Different display profiles (OLED, IPS, high-brightness) will perceive the same alpha differently on a dark background. Mitigation: QA task explicitly asks for perceptual comparison against the light variant and to tune if off. Follow-up tweak is cheap.

- **Overlay on `no_card` dark** → The `no_card` dark card renders on the HA dashboard background (typically dark in dark mode). The overlay appears against the dashboard wallpaper/colour rather than the card circle fill. This is acceptable — same behaviour as `no_card` light — but means the glow appears against an arbitrary dark surface rather than a controlled near-black circle.

## Migration Plan

None. Pure CSS addition; HACS updates in-place; no config or entity changes.

## Open Questions

None.
