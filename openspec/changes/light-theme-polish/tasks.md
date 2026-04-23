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
