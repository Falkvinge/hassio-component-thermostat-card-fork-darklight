export function cssData(user) {
  var css =`
  
  ha-card {
    overflow: hidden;
    --rail_border_color: transparent;
    --auto_color: rgb(227, 99, 4, 1);
    --cool_color: rgba(0, 122, 241, 0.6);
    --cool_colorc: rgba(0, 122, 241, 1);
    --heat_color: #ff8100;
    --heat_colorc: rgb(227, 99, 4, 1);
    --manual_color: #44739e;
    --off_color: #8a8a8a;
    --fan_only_color: #D7DBDD;
    --dry_color: #efbd07;
    --idle_color: #808080;
    --unknown_color: #bac;
    --text-color: white;
  }
  ha-card.no_card{
    background-color: transparent;
    border: none;
    box-shadow: none;
  }
  ha-card.no_card .prop{
    display: none;
  }
  .auto, .heat_cool {
    --mode_color: var(--auto_color);
  }
  
  .cool {
    --mode_color: var(--cool_color);
  }
  
  .heat {
    --mode_color: var(--heat_color);
  }
  
  .manual {
    --mode_color: var(--manual_color);
  }
  
  .off {
    --mode_color: var(--off_color);
  }
  .more {
    --mode_color: var(--off_color);
  }
  .fan_only {
    --mode_color: var(--fan_only_color);
  }
  
  .eco {
    --mode_color: var(--auto_color);
  }
  
  .dry {
    --mode_color: var(--dry_color);
  }
  
  .idle {
    --mode_color: var(--idle_color);
  }
  
  .unknown-mode {
    --mode_color: var(--unknown_color);
  }
  .c_body {
    padding: 5% 5% 5% 5%;
  }
  .c_icon{
    position: absolute;
    cursor: pointer;
    top: 0;
    right: 0;
    z-index: 25;
  }
  .climate_info {
    position: absolute;
    top: 82%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 14%;
    height: 14%;
    --background-color: white;
  }
  .modes, .mode_color{
    position: absolute;
    max-width: 50px;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%);
  }
  .modes ha-icon {
    color: var(--mode_color);
    --mdc-icon-size: 100%;
  }
  .dialog{
    background-color:#0000008c;
    width: 90%;
    height: 90%;
    max-width: 300px;
    min-width: 150px;
    margin: 5%;
    border-radius: 50%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    align-content: center;
    top: 45%;
    left: 45%;
    backdrop-filter: blur(6px) grayscale(50%);
    box-shadow: 0px 0px 10px 0px #696969;
    border: 1px solid #ffffff;
  }
  .dialog span {
    width:33%;
    margin: 3% 0;
  }
  .dialog ha-icon {
    color: var(--mode_color);
    --mdc-icon-size: 70%;
    margin: 15%;
  }
  .dialog.hide{
    display: none;
  }
  .dialog.pending{
    border: 1px solid var(--mode_color);
    box-shadow: 0px 0px 10px 0px var(--mode_color);
    animation: dialog-pending .8s infinite alternate;
  }
  
  @keyframes dialog-pending
  {
      from {box-shadow: 0px 0px 10px 0px var(--mode_color);}
      to {box-shadow: 0px 0px 0px 0px var(--mode_color);}
  }
  
  .dot_r{
    height: 100%;
    width: 100%;
    background-color: white;
    border-radius: 50%;
    display: inline-block;
    opacity: 0.1;
  }
  .dot_h{
    visibility: hidden;
  }
  
  
  
  .dial {
    user-select: none;
    max-width: 300px;
    min-width: 150px;
    display: block;
    margin: 0 auto;
    --thermostat-off-fill: #000000c2;
    --thermostat-path-color: rgba(255, 255, 255, 0.3);
    --thermostat-path-active-color: rgba(255, 255, 255, 0.8);
    --thermostat-path-active-color-large: rgba(255, 255, 255, 1);
    --thermostat-text-color: white;
  }

  /* Light variant. The dial--light class lives on the card container
     (set in ThermostatUI.updateState based on hass.themes.darkMode +
     Google theme name override from main.js::resolveThemeDark). All
     light-variant rules are scoped by .dial--light as a descendant
     selector so they reach the SVG, the mode-icon dot, and the
     dialog — which are siblings inside the container, not descendants
     of the SVG. */
  .dial--light .dial {
    /* Near-white off-fill so an idle thermostat fades into a light
       dashboard instead of reading as a dark-grey disc. Discernible
       from pure #ffffff but only just. */
    --thermostat-off-fill: #f7f7f7;
    --thermostat-path-color: rgba(0, 0, 0, 0.15);
    --thermostat-path-active-color: rgba(0, 0, 0, 0.6);
    --thermostat-path-active-color-large: rgba(0, 0, 0, 0.85);
    --thermostat-text-color: #333333;
  }

  /* Differentiated activity overlay, light variant only.
     Two visual intensities on a single ::before pseudo-element:
       is-active-*  = hvac_action confirms pumping -> animated pulse,
                      full-alpha gradient.
       is-idle-*    = mode is heat/cool but action isn't active (or
                      isn't exposed) -> static dim tint, reduced alpha,
                      no animation.
     At most one of the four classes is set at a time (main.js
     derives a single mutually-exclusive active_mode value). Colors
     match --heat_color / --cool_color so the overlay reinforces the
     existing mode palette rather than introducing a new vocabulary. */
  .dial--light {
    position: relative;
  }
  .dial--light.is-active-heat::before,
  .dial--light.is-active-cool::before,
  .dial--light.is-idle-heat::before,
  .dial--light.is-idle-cool::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
  }
  /* Active (confirmed pumping): full-alpha gradient, animated. */
  .dial--light.is-active-heat::before {
    background: radial-gradient(
      circle at center,
      rgba(255, 140, 0, 0.32) 0%,
      rgba(255, 140, 0, 0.12) 45%,
      transparent 80%
    );
    animation: darklight-pulse 3s ease-in-out infinite;
  }
  .dial--light.is-active-cool::before {
    background: radial-gradient(
      circle at center,
      rgba(0, 122, 241, 0.32) 0%,
      rgba(0, 122, 241, 0.12) 45%,
      transparent 80%
    );
    animation: darklight-pulse 3s ease-in-out infinite;
  }
  /* Idle (mode armed but not pumping): ~half-alpha gradient, static. */
  .dial--light.is-idle-heat::before {
    background: radial-gradient(
      circle at center,
      rgba(255, 140, 0, 0.10) 0%,
      rgba(255, 140, 0, 0.04) 45%,
      transparent 80%
    );
  }
  .dial--light.is-idle-cool::before {
    background: radial-gradient(
      circle at center,
      rgba(0, 122, 241, 0.10) 0%,
      rgba(0, 122, 241, 0.04) 45%,
      transparent 80%
    );
  }
  @keyframes darklight-pulse {
    0%, 100% { opacity: 0.60; }
    50%      { opacity: 1.00; }
  }
  @media (prefers-reduced-motion: reduce) {
    /* Only the active overlays animate; the idle tints are already
       static and don't need overriding. */
    .dial--light.is-active-heat::before,
    .dial--light.is-active-cool::before,
    .dial--dark.is-active-heat::before,
    .dial--dark.is-active-cool::before {
      animation: none;
      opacity: 0.80;
    }
  }
  /* Differentiated activity overlay, dark variant.
     Mirrors the light overlay structure with alpha values scaled to
     ~0.65× of the light values. The same RGB hues (orange / blue)
     appear much more vivid against the near-black dial fill, so
     lower alphas are needed to achieve a similarly subtle glow.
     The @keyframes darklight-pulse and the is-* class toggling in
     thermostat_card.lib.js are shared and need no changes. */
  .dial--dark {
    position: relative;
  }
  .dial--dark.is-active-heat::before,
  .dial--dark.is-active-cool::before,
  .dial--dark.is-idle-heat::before,
  .dial--dark.is-idle-cool::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
  }
  /* Active (confirmed pumping): gradient alpha raised for dark bg, animated. */
  .dial--dark.is-active-heat::before {
    background: radial-gradient(
      circle at center,
      rgba(255, 140, 0, 0.24) 0%,
      rgba(255, 140, 0, 0.09) 45%,
      transparent 80%
    );
    animation: darklight-pulse 3s ease-in-out infinite;
  }
  .dial--dark.is-active-cool::before {
    background: radial-gradient(
      circle at center,
      rgba(0, 122, 241, 0.24) 0%,
      rgba(0, 122, 241, 0.09) 45%,
      transparent 80%
    );
    animation: darklight-pulse 3s ease-in-out infinite;
  }
  /* Idle (mode armed but not pumping): ~half-alpha of active, static. */
  .dial--dark.is-idle-heat::before {
    background: radial-gradient(
      circle at center,
      rgba(255, 140, 0, 0.12) 0%,
      rgba(255, 140, 0, 0.05) 45%,
      transparent 80%
    );
  }
  .dial--dark.is-idle-cool::before {
    background: radial-gradient(
      circle at center,
      rgba(0, 122, 241, 0.12) 0%,
      rgba(0, 122, 241, 0.05) 45%,
      transparent 80%
    );
  }
  /* Glow on center temperature digits in non-off states.
     SVG <text> ignores text-shadow, so we use filter: drop-shadow which
     traces each glyph's silhouette (the "0,0 offset blurred outline"
     effect the request describes). Static (not animated) so the
     reinforcement is always visible, including at the breath's local
     minimum. Active states use a brighter/wider glow than idle states.
     Applied to all center temperature labels: --ambient (displayed
     normally), --target (displayed during in_control), and --low/--high
     (displayed during in_control with dual setpoints). Same values for
     both variants; if a variant needs asymmetric tuning later, split the
     selectors and adjust. */
  .dial--dark.is-active-cool .dial__lbl--ambient,
  .dial--dark.is-active-cool .dial__lbl--target,
  .dial--dark.is-active-cool .dial__lbl--low,
  .dial--dark.is-active-cool .dial__lbl--high,
  .dial--light.is-active-cool .dial__lbl--ambient,
  .dial--light.is-active-cool .dial__lbl--target,
  .dial--light.is-active-cool .dial__lbl--low,
  .dial--light.is-active-cool .dial__lbl--high {
    filter: drop-shadow(0 0 10px rgba(0, 122, 241, 0.85));
  }
  .dial--dark.is-idle-cool .dial__lbl--ambient,
  .dial--dark.is-idle-cool .dial__lbl--target,
  .dial--dark.is-idle-cool .dial__lbl--low,
  .dial--dark.is-idle-cool .dial__lbl--high,
  .dial--light.is-idle-cool .dial__lbl--ambient,
  .dial--light.is-idle-cool .dial__lbl--target,
  .dial--light.is-idle-cool .dial__lbl--low,
  .dial--light.is-idle-cool .dial__lbl--high {
    filter: drop-shadow(0 0 6px rgba(0, 122, 241, 0.55));
  }
  .dial--dark.is-active-heat .dial__lbl--ambient,
  .dial--dark.is-active-heat .dial__lbl--target,
  .dial--dark.is-active-heat .dial__lbl--low,
  .dial--dark.is-active-heat .dial__lbl--high,
  .dial--light.is-active-heat .dial__lbl--ambient,
  .dial--light.is-active-heat .dial__lbl--target,
  .dial--light.is-active-heat .dial__lbl--low,
  .dial--light.is-active-heat .dial__lbl--high {
    filter: drop-shadow(0 0 10px rgba(255, 140, 0, 0.85));
  }
  .dial--dark.is-idle-heat .dial__lbl--ambient,
  .dial--dark.is-idle-heat .dial__lbl--target,
  .dial--dark.is-idle-heat .dial__lbl--low,
  .dial--dark.is-idle-heat .dial__lbl--high,
  .dial--light.is-idle-heat .dial__lbl--ambient,
  .dial--light.is-idle-heat .dial__lbl--target,
  .dial--light.is-idle-heat .dial__lbl--low,
  .dial--light.is-idle-heat .dial__lbl--high {
    filter: drop-shadow(0 0 6px rgba(255, 140, 0, 0.55));
  }
  /* HVAC accent colors tuned for contrast on light backgrounds. Each
     mode keeps its identity from the dark variant; saturation and
     lightness are adjusted so ticks and mode icons stay legible. */
  .dial--light {
    --heat_color: #e06600;
    --heat_colorc: #c05400;
    --cool_color: rgba(0, 100, 200, 0.7);
    --cool_colorc: rgba(0, 90, 190, 1);
    --auto_color: #c65400;
    --off_color: #999999;
    --fan_only_color: #8a8a8a;
    --dry_color: #c99400;
    --idle_color: #9e9e9e;
    --manual_color: #355875;
    --unknown_color: #8a8a9a;
  }
  .dial--light .dial__editableIndicator {
    fill: #333333;
  }
  .dial--light .dial__chevron {
    stroke: var(--thermostat-text-color);
  }
  .dial--light .dot_r {
    background-color: #333333;
  }
  .dial--light .dialog {
    background-color: rgba(255, 255, 255, 0.85);
    border: 1px solid #cccccc;
    box-shadow: 0px 0px 10px 0px #bdbdbd;
    backdrop-filter: blur(6px) grayscale(20%);
  }
  .dial--light .dialog.pending {
    border: 1px solid var(--mode_color);
    box-shadow: 0px 0px 10px 0px var(--mode_color);
  }

  .dial.has-thermo .dial__ico__leaf {
    visibility: hidden;
  }
  .dial .dial__shape {
    transition: fill 0.5s;
    fill: var(--thermostat-off-fill);
  }
  
  .dial__ico__thermo {
    fill: var(--thermostat-path-active-color);
    opacity: 0;
    transition: opacity 0.5s;
    pointer-events: none;
  }
  .dial.has-thermo .dial__ico__thermo {
    display: block;
    opacity: 1;
    pointer-events: initial;
  }
  .dial__editableIndicator {
    fill: white;
    fill-rule: evenodd;
    opacity: 0;
    transition: opacity 0.5s;
  }
  .dial__temperatureControl {
    fill: white;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .dial__temperatureControl.control-visible {
    opacity: 0.2;
  }
  .dial--edit .dial__editableIndicator {
    opacity: 1;
  }
  .dial--state--off .dial__shape {
    fill: var(--thermostat-off-fill);
  }
  .dial--state--heat .dial__shape {
    fill: var(--heat_colorc);
  }
  .dial--state--cool .dial__shape {
    fill: var(--cool_colorc);
  }
  .dial--state--auto .dial__shape {
    fill: var(--auto_color);
  }
  .dial--state--fan_only .dial__shape {
    fill: var(--fan_only_color);
  }
  .dial--state--dry .dial__shape {
    fill: var(--dry_color);
  }
  .dial--state--idle .dial__shape {
    fill: var(--idle_color);
  }
  .dial__ticks path {
    fill: var(--thermostat-path-color);
  }
  .dial__ticks path.active {
    fill: var(--mode_color);
  }
  .dial__ticks path.active.large {
    fill: var(--mode_color);
  }
  .dial text, .dial text tspan {
    fill: var(--thermostat-text-color);
    text-anchor: middle;
    font-family: Helvetica, sans-serif;
    alignment-baseline: central;
    dominant-baseline: central;
  }
  .dial__lbl--target {
    font-size: 150px;
    font-weight: bold;
    visibility: hidden;
  }
  .dial__lbl--low, .dial__lbl--high {
    font-size: 90px;
    font-weight: bold;
    visibility: hidden;
  }
  .dial.in_control .dial__lbl--target {
    visibility: visible;
  }
  .dial.in_control .dial__lbl--low {
    visibility: visible;
  }
  .dial.in_control .dial__lbl--high {
    visibility: visible;
  }
  .dial__lbl--ambient {
    font-size: 150px;
    font-weight: bold;
    visibility: visible;
  }
  .dial.in_control.has_dual .dial__chevron--low,
  .dial.in_control.has_dual .dial__chevron--high {
    visibility: visible;
  }
  .dial.in_control .dial__chevron--target {
    visibility: visible;
  }
  .dial.in_control.has_dual .dial__chevron--target {
    visibility: hidden;
  }
  .dial .dial__chevron {
    visibility: hidden;
    fill: none;
    stroke: var(--thermostat-text-color);
    stroke-width: 4px;
    opacity: 0.3;
  }
  .dial .dial__chevron.pressed {
    opacity: 1;
  }
  .dial.in_control .dial__lbl--ambient {
    visibility: hidden;
  }
  .dial__lbl--super--ambient, .dial__lbl--super--target {
    font-size: 40px;
    font-weight: bold;
  }
  .dial__lbl--super--high, .dial__lbl--super--low {
    font-size: 30px;
    font-weight: bold;
  }
  .dial__lbl--ring {
    font-size: 22px;
    font-weight: bold;
  }
  .dial__lbl--title {
    font-size: 32px;
  }
  `
  return css;
  }
  