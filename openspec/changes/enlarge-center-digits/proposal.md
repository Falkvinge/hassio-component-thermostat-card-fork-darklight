## Why

The center digits (ambient temperature when idle, target temperature when editing) are the primary at-a-glance readout of the card, but at 120px they are not comfortably readable from across a room on a typical wall-mounted dashboard. Field-tested sizing shows 150px is noticeably more legible without crowding the dial. Since the whole-degree digits grow, the decimal superscript needs a matching lateral shift so it doesn't overlap the last whole digit. In the same readability-polish pass, the room-name title above the digits is enlarged from 24px to 32px and moved down slightly so it visually groups with the enlarged readout as a single unit rather than floating awkwardly above it.

## What Changes

- Enlarge the `.dial__lbl--target` and `.dial__lbl--ambient` font size from **120px → 150px**.
- Shift the decimal superscript for `target` / `ambient` further to the right so it clears the wider whole-digit text. The per-name offset constant in `_buildText` (currently `+20` when `name == 'target' || name == 'ambient'`) grows proportionally (target `~+28`).
- Enlarge the `.dial__lbl--title` font size from **24px → 32px** for consistency with the larger center digits and to keep the room name legible at the same viewing distance.
- Move the title's vertical position down slightly: currently `y = radius - radius/2` (= 100 at the default 400-diameter SVG), becomes `y = radius - radius * 0.45` (= 110 at default, proportional for other diameters). This tightens the vertical gap between the title and the enlarged ambient/target digits so they read as one group.
- Dual-setpoint labels (`.dial__lbl--low`, `.dial__lbl--high`) and their superscripts are **unchanged** — those labels already fit their offset slots and are not the "center digits" this change is about.
- Ring ticks, chevrons, mode dialog, dot indicator, and overall dial geometry are **unchanged**.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `styling`: the Typography hierarchy requirement changes the center-label font size from 120px to 150px for ambient/target and the title font size from 24px to 32px.
- `dial-rendering`: (a) the `_buildText` superscript x-offset is tuned so the decimal clears the enlarged whole digits; (b) the title text's y-coordinate is moved down proportionally so the title sits closer to the ambient/target readout.

## Impact

- **Code**: `dist/styles.js` (two font-size edits: center labels 120→150, title 24→32), `dist/thermostat_card.lib.js` (`_buildText` superscript x-offset `+20 → +28` and title y-coord `radius/2 → radius*0.45`), `dist/main.js` (version bump + log line + cache-busting import query strings).
- **Specs**: delta files under `openspec/changes/enlarge-center-digits/specs/styling/` and `.../dial-rendering/`.
- **Release**: intended as `v0.1.4` (patch-level visual tweak, fully backward-compatible — no config keys, no entity behavior, no HA integration surface changes).
- **Risk**: the larger digits could cause 3-digit integer readouts (e.g. `100°F`) plus decimal superscript to collide with the ring ticks. Design doc addresses this with explicit visual-overflow analysis and a fallback path. Low-risk because all current deployments are 2-digit Celsius/Fahrenheit; 3-digit-Fahrenheit scenarios are rare and already constrained by the 300px dial max-width.
