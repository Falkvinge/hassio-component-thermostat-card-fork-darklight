## 1. Worktree setup

- [x] 1.1 Create agent worktree: `./scripts/agent-worktree.sh create dark-theme-activity-overlay`
- [x] 1.2 Confirm branch is `agent/dark-theme-activity-overlay` from `master`

## 2. CSS: add dark-variant overlay rules to `dist/styles.js`

All edits below are inside the `var css = \`...\`` template literal. Insert the dark-variant block immediately after the closing `}` of the existing `@media (prefers-reduced-motion: reduce)` block (which ends the light overlay section), so the dark rules are co-located with the light rules for easy comparison.

- [x] 2.1 Add `position: relative` to a new `.dial--dark { }` block (first ever scoped CSS rule for the dark variant)
- [x] 2.2 Add the shared `::before` base block for all four dark overlay selectors
- [x] 2.3 Add active-heat dark rule (gradient + animation, lower alphas than light)
- [x] 2.4 Add active-cool dark rule
- [x] 2.5 Add idle-heat dark rule (reduced-alpha, no animation)
- [x] 2.6 Add idle-cool dark rule
- [x] 2.7 Extend `@media (prefers-reduced-motion: reduce)` to cover dark active overlays

## 3. Sanity checks

- [x] 3.1 Run a CSS brace-balance check: 89/89 balanced
- [x] 3.2 Confirm the light variant rules are completely unchanged (only comma addition to prefers-reduced-motion selector; rule content untouched)
- [x] 3.3 Confirm no JS files were modified
- [x] 3.4 Run `openspec validate dark-theme-activity-overlay` — valid

## 4. Version bump

- [x] 4.1 In `dist/main.js`, bump the `console.info` banner from `0.1.4` to `0.1.5`
- [x] 4.2 In `dist/main.js`, bump both `?v=0.1.4` cache-bust query strings to `?v=0.1.5`
- [x] 4.3 Update `README.md` with a `v0.1.5` changelog entry

## 5. Commit, merge, release

- [x] 5.1 Commit changes on `agent/dark-theme-activity-overlay`
- [x] 5.2 Fast-forward merge into `master`
- [x] 5.3 Tag `v0.1.5` and push
- [x] 5.4 Create GitHub release `v0.1.5`
- [x] 5.5 Upload `dist/main.js`, `dist/styles.js`, `dist/thermostat_card.lib.js` as release assets
- [x] 5.6 Remove worktree and agent branch

## 6. Manual QA (post-release, live HA instance)

- [x] 6.1 Dark dashboard, thermostat `cool`, `hvac_action: cooling` — confirm a cool-blue pulse/glow animates on the card
- [ ] 6.2 Dark dashboard, thermostat `cool`, `hvac_action: idle` — confirm a soft static cool-blue tint (no pulsing)
- [ ] 6.3 Dark dashboard, thermostat `heat`, `hvac_action: heating` — confirm warm-orange pulse
- [ ] 6.4 Dark dashboard, thermostat `heat`, `hvac_action: idle` — confirm soft static warm-orange tint
- [x] 6.5 Dark dashboard, thermostat `off` — confirm NO overlay
- [ ] 6.6 Perceptual comparison: dark-cooling pulse vs light-cooling pulse side by side — both should read as "similarly subtle" despite the different background. Neither should feel garish; neither invisible. Tune alphas in a follow-up if off.
- [ ] 6.7 Light dashboard with any active state — confirm light overlay is unchanged (not accidentally broken)
- [ ] 6.8 Dark dashboard, 2×2 grid of cards: idle-tint cards clearly distinguishable from fully-off cards at a glance; active-pulse cards clearly distinguishable from idle-tint at a glance
- [ ] 6.9 OS "Reduce motion" on, dark dashboard, `hvac_action: cooling` — confirm cool-blue glow visible but NOT animating
- [ ] 6.10 Click within the dial while a dark pulse is active — confirm setpoint adjustment still works

## 7. Digit glow reinforcement (follow-up tuning for dark-variant subtlety)

In-flight addition responding to QA feedback that the dark-variant cool overlay remained too subtle at the breath's minimum. Adds a colored `filter: drop-shadow` on the center temperature digits that tracks the same `is-active-*` / `is-idle-*` state classes but is static (not animated).

Initially shipped (v0.1.10) dark-variant-only. After dark-mode QA confirmed the reinforcement effect reads "MUCH clearer", the light variant gained the same treatment in v0.1.11 for theme parity.

- [x] 7.1 Add `.dial--dark.is-active-cool` glow rule: 10px blur, rgba(0,122,241,0.85) on `.dial__lbl--ambient`, `--target`, `--low`, `--high`
- [x] 7.2 Add `.dial--dark.is-idle-cool` glow rule: 6px blur, rgba(0,122,241,0.55) on same selectors
- [x] 7.3 Add `.dial--dark.is-active-heat` glow rule: 10px blur, rgba(255,140,0,0.85) on same selectors
- [x] 7.4 Add `.dial--dark.is-idle-heat` glow rule: 6px blur, rgba(255,140,0,0.55) on same selectors
- [x] 7.5 ~~Confirm no glow is applied in the light variant~~ (superseded by 7.16–7.19 below; parity is now the design)
- [x] 7.6 Bump `dist/main.js` banner + cache-busters from `0.1.9` to `0.1.10`
- [x] 7.7 Update `README.md` with a `v0.1.10` changelog entry
- [x] 7.8 Run `openspec validate dark-theme-activity-overlay --strict` — valid
- [x] 7.9 Manual QA: dark dashboard, active cooling — confirm cool-blue glow around the big digits is clearly visible and reads as "active + cool" at a glance (ACK v0.1.10)
- [ ] 7.10 Manual QA: dark dashboard, idle cool (mode=cool, action=idle) — confirm a softer cool-blue glow is present but clearly subtler than the active-cool glow
- [ ] 7.11 Manual QA: dark dashboard, active heating — confirm warm-orange glow around the big digits
- [ ] 7.12 Manual QA: dark dashboard, idle heat (mode=heat, action=idle) — confirm softer warm-orange glow
- [ ] 7.13 Manual QA: dark dashboard, thermostat off — confirm NO glow (digits render with no filter)
- [ ] 7.14 ~~Manual QA: light dashboard, any active state — confirm light-variant digits still render without glow~~ (inverted — see 7.20)
- [ ] 7.15 Manual QA: during the overlay pulse, confirm the glow does NOT pulse along (stays constant while the background overlay breathes)
- [x] 7.16 Extend `.dial--light.is-active-cool` into the existing active-cool glow rule (same 10px / rgba(0,122,241,0.85))
- [x] 7.17 Extend `.dial--light.is-idle-cool` into the idle-cool glow rule (same 6px / rgba(0,122,241,0.55))
- [x] 7.18 Extend `.dial--light.is-active-heat` and `.dial--light.is-idle-heat` into the heat glow rules
- [x] 7.19 Bump `dist/main.js` banner + cache-busters from `0.1.10` to `0.1.11`; update `README.md` changelog
- [ ] 7.20 Manual QA (post-sunrise): light dashboard, active cooling — confirm cool-blue glow around the big dark digits reads as a halo and reinforces active-cool state without looking muddy
- [ ] 7.21 Manual QA (post-sunrise): light dashboard, idle cool / active heat / idle heat — confirm parity with dark variant's behavior
- [ ] 7.22 Manual QA (post-sunrise): light dashboard, thermostat off — confirm NO glow
- [ ] 7.23 Tune-if-needed: if light-variant glow reads as muddy / overbearing / insufficient, split the combined selectors in `dist/styles.js` and adjust light values independently

## 8. Mode indicator ring on the HVAC icon

Third layered signal (after overlay gradient and digit glow): add a colored ring around the small bottom-center HVAC-mode icon (`.climate_info`). Solid static ring for idle states, spinning half-arc for active states. Same colors/classes as the other two signals; works in both theme variants.

- [x] 8.1 Add `.is-idle-cool .climate_info::before` + `.is-idle-heat .climate_info::before` shared base rule (content, position, inset −6px, border-radius 50%, 4px transparent border, box-sizing, pointer-events)
- [x] 8.2 Add `.is-active-cool .climate_info::before` + `.is-active-heat .climate_info::before` into the same shared base rule
- [x] 8.3 Idle cool: `border-color: rgba(0, 122, 241, 0.9)`
- [x] 8.4 Idle heat: `border-color: rgba(255, 140, 0, 0.9)`
- [x] 8.5 Active cool: `border-top-color` + `border-right-color` to `rgba(0, 122, 241, 0.95)`, animation `climate-spinner 1.2s linear infinite`
- [x] 8.6 Active heat: same structure with `rgba(255, 140, 0, 0.95)`
- [x] 8.7 Add `@keyframes climate-spinner { to { transform: rotate(360deg); } }`
- [x] 8.8 Add `@media (prefers-reduced-motion: reduce)` override: active ring gets full-circle `border-color`, `animation: none`
- [x] 8.9 Confirm no `.dial` / `.dial--dark` / `.dial--light` scoping is needed (the `is-*` classes alone are sufficient; ring is theme-variant-agnostic)
- [x] 8.10 Bump `dist/main.js` banner + cache-busters from `0.1.11` to `0.1.12`; update `README.md` changelog
- [x] 8.11 Run `openspec validate dark-theme-activity-overlay --strict` — valid
- [ ] 8.12 Manual QA: dark dashboard, thermostat `cool` + `hvac_action: cooling` — confirm a blue half-arc rotates clockwise around the snowflake icon at spinner pace
- [ ] 8.13 Manual QA: dark dashboard, thermostat `cool` + `hvac_action: idle` — confirm a solid full-circle blue ring around the snowflake, NOT rotating
- [ ] 8.14 Manual QA: dark dashboard, thermostat `heat` + `hvac_action: heating` — confirm a warm-orange half-arc rotates clockwise around the flame icon
- [ ] 8.15 Manual QA: dark dashboard, thermostat `heat` + `hvac_action: idle` — confirm a solid full-circle warm-orange ring around the flame
- [ ] 8.16 Manual QA: dark dashboard, thermostat `off` — confirm NO ring around the power icon
- [ ] 8.17 Manual QA: during active spin, confirm the snowflake/flame glyph itself does NOT rotate (only the ring)
- [ ] 8.18 Manual QA: OS "Reduce motion" enabled, active state — confirm the ring is a full static circle (not a half-arc) and does NOT rotate
- [ ] 8.19 Manual QA (post-sunrise): repeat 8.12–8.18 on light dashboard to confirm parity
