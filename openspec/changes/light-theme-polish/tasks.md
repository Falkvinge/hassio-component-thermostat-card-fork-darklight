## 1. State Extraction (main.js)

- [x] 1.1 Add a module-level `deriveActiveMode(entity)` function that returns `'heat'`, `'cool'`, or `null` per the precedence in `specs/thermostat-card/spec.md` (prefer `entity.attributes.hvac_action`, fall back to `entity.state`).
- [x] 1.2 In the `hass` setter, extract `entity.attributes.hvac_action` and compute `active_mode` via the new helper. Add both fields to the `new_state` object.
- [x] 1.3 Add `hvac_action` to the state-diff comparison so a pure action transition (e.g. `idle` → `heating`) still triggers `updateState`. (`active_mode` is derived from `hvac_action` so it will move in lockstep; `hvac_action` is the canonical diff key.)

## 2. View Update (thermostat_card.lib.js)

- [x] 2.1 In `updateState(options, hass)`, read `options.active_mode` and store as `this.active_mode`.
- [x] 2.2 Toggle `is-active-heat` / `is-active-cool` on `this._container` via `classList.toggle`, mirroring the existing `dial--dark` / `dial--light` toggle pattern.

## 3. Light Variant CSS — Off-Fill Softening (styles.js)

- [x] 3.1 In the `.dial--light .dial { ... }` block, change `--thermostat-off-fill` from `#e8e8e8` to `#f7f7f7`.

## 4. Light Variant CSS — Pulse Layer (styles.js)

- [x] 4.1 Add `position: relative` to the dial container scope under `.dial--light` so the `::before` overlay has a positioning context. Verify no existing rule is broken.
- [x] 4.2 Add the `.dial--light.is-active-heat::before` rule: `content: ''`, `position: absolute`, `inset: 0`, `pointer-events: none`, `border-radius: inherit`, a warm-orange radial gradient (`rgba(255, 140, 0, 0.22) 0%` → `rgba(255, 140, 0, 0.08) 45%` → `transparent 80%`), and `animation: darklight-pulse 3s ease-in-out infinite`.
- [x] 4.3 Add the `.dial--light.is-active-cool::before` rule: same as above but with cool-blue gradient stops (`rgba(0, 122, 241, 0.22) 0%` → `rgba(0, 122, 241, 0.08) 45%` → `transparent 80%`).
- [x] 4.4 Add the `@keyframes darklight-pulse { 0%, 100% { opacity: 0.40 } 50% { opacity: 0.90 } }` rule.
- [x] 4.5 Add a `@media (prefers-reduced-motion: reduce)` block that sets `animation: none; opacity: 0.65;` on both `.dial--light.is-active-heat::before` and `.dial--light.is-active-cool::before`.

## 5. Sanity Checks

- [x] 5.1 `node --check` passes on `dist/main.js`, `dist/thermostat_card.lib.js`, `dist/styles.js`.
- [x] 5.2 CSS brace balance check on the `cssData` template literal in `styles.js` still balances (opens == closes).

## 6. Release

- [x] 6.1 Bump version strings in `dist/main.js` (import cache-busters + console banner) from `0.1.1` to `0.1.2`.
- [x] 6.2 Add a v0.1.2 changelog entry to `README.md`.
- [x] 6.3 Commit on `agent/light-theme-polish` worktree branch, merge `--no-ff` into master, tag `v0.1.2`, push master + tag, create the GitHub release with the three `dist/*.js` files as assets (same flow as v0.1.1).

## 7. Verification (manual, live HA)

- [ ] 7.1 Light dashboard, thermostat in `off` state: confirm the dial fill reads as nearly-white, visibly lighter than before.
- [ ] 7.2 Light dashboard, thermostat set to `heat` and actively heating (entity reports `hvac_action: heating`): confirm a warm-orange glow pulses on the card.
- [ ] 7.3 Light dashboard, thermostat set to `heat` but at target (entity reports `hvac_action: idle`): confirm NO pulse.
- [ ] 7.4 Light dashboard, thermostat set to `cool` and actively cooling: confirm a cool-blue glow pulses.
- [ ] 7.5 Light dashboard, climate entity that doesn't expose `hvac_action` with state = `heat`: confirm warm-orange pulse appears (fallback path).
- [ ] 7.6 Dark dashboard with any HVAC action: confirm NO pulse (dark variant is unaffected).
- [ ] 7.7 `no_card: true` instance inside picture-elements, actively heating on a light dashboard: confirm the pulse renders directly on the dashboard background.
- [ ] 7.8 Enable OS "Reduce motion" setting, reload: confirm the glow still shows (static) but no longer pulses.
- [ ] 7.9 Click within the dial while a pulse is active: confirm setpoint adjustment still works (overlay is not blocking clicks).

## 8. Follow-up: Differentiated active/idle overlay (v0.1.3)

Implementation revealed that tying the overlay strictly to `hvac_action: heating|cooling` drops the signal in two real-world cases: (a) entities that never expose `hvac_action`, (b) entities that report `hvac_action: idle` while the physical unit is audibly pumping. The user confirmed the "differentiated" option (full pulse for confirmed pumping, static tint for mode-on-but-idle). Specs and design have been updated in place; tasks below implement the revision.

- [x] 8.1 Refactor `deriveActiveMode(entity)` in `dist/main.js` to return `'active_heat' | 'active_cool' | 'idle_heat' | 'idle_cool' | null` per the decision table in `design.md` §2.
- [x] 8.2 In `ThermostatUI.updateState()` (`dist/thermostat_card.lib.js`), replace the two `is-active-*` toggles with four mutually-exclusive toggles: `is-active-heat`, `is-active-cool`, `is-idle-heat`, `is-idle-cool`.
- [x] 8.3 In `dist/styles.js`, extend the `::before` common-declarations selector list to include the two new idle classes. The shared rules (`content`, `position`, `inset`, `pointer-events`, `border-radius`) apply to all four.
- [x] 8.4 Move the `animation: darklight-pulse ...` declaration off the common rule and into the two `is-active-*` rules only, so the idle classes don't animate.
- [x] 8.5 Add `.dial--light.is-idle-heat::before` and `.dial--light.is-idle-cool::before` rules with reduced-alpha radial gradients (warm `rgba(255, 140, 0, 0.10)` → `0.04` → transparent, cool `rgba(0, 122, 241, 0.10)` → `0.04` → transparent).
- [x] 8.6 Confirm the `prefers-reduced-motion` media query still targets only the active rules (idle tint is already static, not affected).
- [x] 8.7 Sanity: `node --check` passes on the three `dist/*.js` files; CSS brace balance holds.
- [x] 8.8 Bump version strings in `dist/main.js` from `0.1.2` to `0.1.3`.
- [x] 8.9 Add a v0.1.3 changelog entry to `README.md`.
- [x] 8.10 Commit on a fresh `agent/light-theme-polish-diff` worktree, merge `--no-ff` into master, tag `v0.1.3`, push master + tag, create the GitHub release with the three `dist/*.js` assets. *(Release: https://github.com/Falkvinge/hassio-component-thermostat-card-fork-darklight/releases/tag/v0.1.3)*

### 8.11 Manual verification on live HA (retest + extend)

- [ ] 8.11.1 Light dashboard, mode `cool`, `hvac_action: idle` (AC at setpoint): confirm a soft static cool-blue tint appears around the dial. No pulsing.
- [ ] 8.11.2 Light dashboard, mode `cool`, `hvac_action: cooling`: confirm the tint intensifies and begins pulsing.
- [ ] 8.11.3 Light dashboard, mode `heat`, `hvac_action: idle`: confirm a soft static warm-orange tint. No pulsing.
- [ ] 8.11.4 Light dashboard, mode `heat`, `hvac_action: heating`: confirm warm-orange pulse.
- [ ] 8.11.5 Light dashboard, mode `off`: confirm no overlay at all.
- [ ] 8.11.6 Light dashboard, mode `auto` or `heat_cool`, any action: confirm no overlay (direction is ambiguous).
- [ ] 8.11.7 Light dashboard, entity without `hvac_action` attribute, mode `heat`: confirm warm-orange idle tint (not pulse). Same for `cool`.
- [ ] 8.11.8 Dark dashboard, any mode / any action: confirm no overlay (dark variant unaffected).
- [ ] 8.11.9 OS "Reduce motion" on, mode `cool`, `hvac_action: cooling`: confirm cool-blue glow is visible but not animating. Idle-tint cases already pass since they don't animate.
- [ ] 8.11.10 Overview dashboard with several climate cards in mixed active/idle states: confirm at a glance you can tell "which are on" (any tint/pulse) from "which are confirmed pumping" (only pulsing ones).
