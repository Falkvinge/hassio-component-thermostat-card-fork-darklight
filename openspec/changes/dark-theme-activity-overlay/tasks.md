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

- [x] 7.1 Add `.dial--dark.is-active-cool` glow rule: 10px blur, rgba(0,122,241,0.85) on `.dial__lbl--ambient`, `--target`, `--low`, `--high`
- [x] 7.2 Add `.dial--dark.is-idle-cool` glow rule: 6px blur, rgba(0,122,241,0.55) on same selectors
- [x] 7.3 Add `.dial--dark.is-active-heat` glow rule: 10px blur, rgba(255,140,0,0.85) on same selectors
- [x] 7.4 Add `.dial--dark.is-idle-heat` glow rule: 6px blur, rgba(255,140,0,0.55) on same selectors
- [x] 7.5 Confirm no glow is applied in the light variant (no `.dial--light` glow rule added)
- [x] 7.6 Bump `dist/main.js` banner + cache-busters from `0.1.9` to `0.1.10`
- [x] 7.7 Update `README.md` with a `v0.1.10` changelog entry
- [x] 7.8 Run `openspec validate dark-theme-activity-overlay --strict` — valid
- [ ] 7.9 Manual QA: dark dashboard, active cooling — confirm cool-blue glow around the big digits is clearly visible and reads as "active + cool" at a glance
- [ ] 7.10 Manual QA: dark dashboard, idle cool (mode=cool, action=idle) — confirm a softer cool-blue glow is present but clearly subtler than the active-cool glow
- [ ] 7.11 Manual QA: dark dashboard, active heating — confirm warm-orange glow around the big digits
- [ ] 7.12 Manual QA: dark dashboard, idle heat (mode=heat, action=idle) — confirm softer warm-orange glow
- [ ] 7.13 Manual QA: dark dashboard, thermostat off — confirm NO glow (digits render with no filter)
- [ ] 7.14 Manual QA: light dashboard, any active state — confirm light-variant digits still render without glow
- [ ] 7.15 Manual QA: during the overlay pulse, confirm the glow does NOT pulse along (stays constant while the background overlay breathes)
