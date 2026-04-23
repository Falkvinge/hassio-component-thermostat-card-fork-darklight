## 1. Worktree setup

- [x] 1.1 Create agent worktree: `./scripts/agent-worktree.sh create enlarge-center-digits`
- [x] 1.2 Move into the worktree and confirm branch is `agent/enlarge-center-digits` from `master`

## 2. CSS: bump center-label + title font sizes

- [x] 2.1 In `dist/styles.js`, change `.dial__lbl--target { font-size: 120px; ... }` to `font-size: 150px`
- [x] 2.2 In `dist/styles.js`, change `.dial__lbl--ambient { font-size: 120px; ... }` to `font-size: 150px`
- [x] 2.3 In `dist/styles.js`, change `.dial__lbl--title { font-size: 24px; }` to `font-size: 32px`
- [x] 2.4 Confirm `.dial__lbl--low, .dial__lbl--high { font-size: 90px; ... }` is unchanged
- [x] 2.5 Confirm `.dial__lbl--super--ambient, .dial__lbl--super--target { font-size: 40px; ... }` is unchanged
- [x] 2.6 Confirm `.dial__lbl--super--high, .dial__lbl--super--low { font-size: 30px; ... }` is unchanged
- [x] 2.7 Confirm `.dial__lbl--ring { font-size: 22px; ... }` is unchanged

## 3. JS: adjust superscript lateral shift + title y-position

- [x] 3.1 In `dist/thermostat_card.lib.js` `_buildText`, change the `if (name == 'target' || name == 'ambient') offset += 20;` hack to `offset += 28;`
- [x] 3.2 In `dist/thermostat_card.lib.js` `_buildText`, change `y: radius - (name == 'title' ? radius / 2 : 0)` to `y: radius - (name == 'title' ? radius * 0.45 : 0)` (proportional, not a literal — see design §5)
- [x] 3.3 Confirm no other `_buildText` logic is touched (x-position for non-title labels, class names, tspan structure all unchanged)

## 4. Version bump + cache-bust

- [x] 4.1 In `dist/main.js`, bump the version string in the `console.info` banner from `0.1.3` to `0.1.4`
- [x] 4.2 In `dist/main.js`, bump the `?v=0.1.3` query string on both `import` statements (for `styles.js` and `thermostat_card.lib.js`) to `?v=0.1.4`
- [x] 4.3 Update `README.md` with a `v0.1.4` changelog entry: "Center temperature digits enlarged 120px → 150px for readability from across a room. Decimal superscript shifted to match. Room title enlarged 24px → 32px and moved down slightly to group with the readout."

## 5. Pre-release sanity checks

- [x] 5.1 Run `openspec validate enlarge-center-digits` and confirm it passes
- [x] 5.2 Run a quick brace-balance check on `dist/styles.js` (no syntax drift from the edit)
- [x] 5.3 Confirm the three touched files (`dist/main.js`, `dist/styles.js`, `dist/thermostat_card.lib.js`) have no other unintended diffs: `git diff master -- dist/`

## 6. Commit, merge, release

- [x] 6.1 Commit implementation changes on `agent/enlarge-center-digits` with a descriptive message
- [x] 6.2 Fast-forward / merge `agent/enlarge-center-digits` into `master`
- [x] 6.3 Tag `v0.1.4` on master and push: `git tag v0.1.4 && git push origin master v0.1.4`
- [x] 6.4 Create GitHub release `v0.1.4` via the REST API with the same body style as v0.1.3 (summary + changelog excerpt)
- [x] 6.5 Upload `dist/main.js`, `dist/styles.js`, `dist/thermostat_card.lib.js` as release assets
- [x] 6.6 Remove the worktree and delete the agent branch

## 7. Manual QA (post-release, against a live HA instance)

- [ ] 7.1 Dark-mode dashboard, idle thermostat: ambient digits visibly larger than before; no overlap with tick ring
- [ ] 7.2 Dark-mode dashboard, actively cooling: digits still fit; pulse overlay still renders correctly behind them (dark variant has no overlay, so just confirm digits render fine)
- [ ] 7.3 Light-mode dashboard, idle thermostat: ambient digits legible against near-white background
- [ ] 7.4 Light-mode dashboard, actively cooling: pulse overlay + enlarged digits render together cleanly
- [ ] 7.5 Tap to enter control mode, single-setpoint entity: target digits appear at 150px, chevrons still clickable above and below
- [ ] 7.6 Tap to enter control mode, dual-setpoint entity (heat_cool): low/high digits remain at their prior 90px size, unchanged. Middle dot `·` in target position unchanged.
- [ ] 7.7 Decimal value (e.g. `21.5°`): decimal superscript is clearly separated from the whole-digit text with a visible gap, not touching or overlapping
- [ ] 7.8 Three-digit Fahrenheit value (if test entity available) e.g. `100°F`: whole digits still fit inside the tick ring; decimal superscript still clears the `0` right edge
- [ ] 7.9 Minimum dial width (150px CSS): scaled-down rendering still readable and proportional, no clipping
- [ ] 7.10 `no_card: true` inside a picture-elements card: digits render correctly without the card chrome
- [ ] 7.11 Room title visible at 32px bold-feel (non-bold font-weight preserved), no clipping at the top of the SVG, visible gap to the digits (not overlapping, not kerned into them)
- [ ] 7.12 Title + digit grouping reads as a single readout unit (no awkward floating gap between them). Verify by looking at a 2×2 grid of cards at dashboard viewing distance.
- [ ] 7.13 Configured with a non-default `diameter` (e.g. 300 via `type: custom:thermostat-card` config): title is at `radius * 0.55` (= 82.5 for radius 150) not a fixed pixel value — verify by inspecting the rendered SVG `<text id="title" y="...">` attribute in DevTools
