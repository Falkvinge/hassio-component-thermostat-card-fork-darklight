import {cssData} from './styles.js?v=0.1.8';
import ThermostatUI from './thermostat_card.lib.js?v=0.1.8';
console.info("%c Thermostat Card (darklight fork) \n%c  Version  0.1.8 ", "color: orange; font-weight: bold; background: black", "color: white; font-weight: bold; background: dimgray");

// Register with Home Assistant's card picker so this fork is identifiable
// at card-configuration time. Without this, the "Add card" dialog would
// show only the raw custom:thermostat-card type with no pretty name or
// documentation link.
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'thermostat-card',
  name: 'Thermostat Card (darklight fork)',
  description: 'Circular thermostat card with automatic dark/light theme switching.',
  preview: false,
  documentationURL: 'https://github.com/Falkvinge/hassio-component-thermostat-card-fork-darklight',
});
class ThermostatCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  set hass(hass) {
    const config = this._config;
    const entity = hass.states[config.entity];
    if(!entity)return;
    let min_value = entity.attributes.min_temp;
    if (config.min_value)
      min_value = config.min_value;
    let max_value = entity.attributes.max_temp;
    if (config.max_value)
      max_value = config.max_value;
    let ambient_temperature = entity.attributes.current_temperature || 0;
    if (config.ambient_temperature && hass.states[config.ambient_temperature])
      ambient_temperature = hass.states[config.ambient_temperature].state;
    let hvac_state = entity.state;
    
    const new_state = {
      entity: entity,
      min_value: min_value,
      max_value: max_value,
      ambient_temperature: ambient_temperature,
      target_temperature: entity.attributes.temperature,
      target_temperature_low: entity.attributes.target_temp_low,
      target_temperature_high: entity.attributes.target_temp_high,
      hvac_state: entity.state,
      hvac_modes:entity.attributes.hvac_modes,
      preset_mode: entity.attributes.preset_mode,
      away: (entity.attributes.away_mode == 'on' ? true : false),
      theme_dark: resolveThemeDark(hass),
      hvac_action: entity.attributes.hvac_action,
      active_mode: deriveActiveMode(entity)
    }

    if (!this._saved_state ||
      (this._saved_state.min_value != new_state.min_value ||
        this._saved_state.max_value != new_state.max_value ||
        this._saved_state.ambient_temperature != new_state.ambient_temperature ||
        this._saved_state.target_temperature != new_state.target_temperature ||
        this._saved_state.target_temperature_low != new_state.target_temperature_low ||
        this._saved_state.target_temperature_high != new_state.target_temperature_high ||
        this._saved_state.hvac_state != new_state.hvac_state ||
        this._saved_state.preset_mode != new_state.preset_mode ||
        this._saved_state.away != new_state.away ||
        this._saved_state.theme_dark != new_state.theme_dark ||
        this._saved_state.hvac_action != new_state.hvac_action)) {
      this._saved_state = new_state;
      this.thermostat.updateState(new_state,hass);
     }
    this._hass = hass;
  }
  
  openProp(entityId) {
    this.fire('hass-more-info', { entityId });
  }
  fire(type, detail, options) {
  
    options = options || {}
    detail = detail === null || detail === undefined ? {} : detail
    const e = new Event(type, {
      bubbles: options.bubbles === undefined ? true : options.bubbles,
      cancelable: Boolean(options.cancelable),
      composed: options.composed === undefined ? true : options.composed,
    })
    
    e.detail = detail
    this.dispatchEvent(e)
    return e
  }
  
  _controlSetPoints() {

    if (this.thermostat.dual) {
      if (this.thermostat.temperature.high != this._saved_state.target_temperature_high ||
        this.thermostat.temperature.low != this._saved_state.target_temperature_low)
        this._hass.callService('climate', 'set_temperature', {
          entity_id: this._config.entity,
          target_temp_high: this.thermostat.temperature.high,
          target_temp_low: this.thermostat.temperature.low,
        });
    } else {
      if (this.thermostat.temperature.target != this._saved_state.target_temperature)
        this._hass.callService('climate', 'set_temperature', {
          entity_id: this._config.entity,
          temperature: this.thermostat.temperature.target,
        });
    }
  }

  setConfig(config) {
    // Check config
    if (!config.entity && config.entity.split(".")[0] === 'climate') {
      throw new Error('Please define an entity');
    }

    // Cleanup DOM
    const root = this.shadowRoot;
    
    if (root.lastChild) root.removeChild(root.lastChild);

    // Prepare config defaults
    const cardConfig = deepClone(config);
    // cardConfig.hvac = Object.assign({}, config.hvac);
    
    if (!cardConfig.diameter) cardConfig.diameter = 400;
    if (!cardConfig.pending) cardConfig.pending = 3;
    if (!cardConfig.idle_zone) cardConfig.idle_zone = 2;
    if (!cardConfig.step) cardConfig.step = 0.5;
    if (!cardConfig.highlight_tap) cardConfig.highlight_tap = false;
    if (!cardConfig.no_card) cardConfig.no_card = false;
    if (!cardConfig.chevron_size) cardConfig.chevron_size = 50;
    if (!cardConfig.num_ticks) cardConfig.num_ticks = 150;
    if (!cardConfig.tick_degrees) cardConfig.tick_degrees = 300;

    // Extra config values generated for simplicity of updates
    cardConfig.radius = cardConfig.diameter / 2;
    cardConfig.ticks_outer_radius = cardConfig.diameter / 30;
    cardConfig.ticks_inner_radius = cardConfig.diameter / 8;
    cardConfig.offset_degrees = 180 - (360 - cardConfig.tick_degrees) / 2;
    cardConfig.control = this._controlSetPoints.bind(this);
    cardConfig.propWin = this.openProp.bind(this);
    this.thermostat = new ThermostatUI(cardConfig);
    
    if (cardConfig.no_card === true) {
      
      const card = document.createElement('ha-card');
      card.className = "no_card";
      const style = document.createElement('style');
      style.textContent = cssData();
      card.appendChild(style);
      card.appendChild(this.thermostat.container);
      root.appendChild(card);
      
    }
    else {

      const card = document.createElement('ha-card');
      const style = document.createElement('style');
      style.textContent = cssData();
      card.appendChild(style);
      card.appendChild(this.thermostat.container);
      root.appendChild(card);
    }
    this._config = cardConfig;
  }
}
customElements.define('thermostat-card', ThermostatCard);

// Derive a differentiated activity signal from the climate entity:
// 'active_heat' | 'active_cool' | 'idle_heat' | 'idle_cool' | null.
//
//   active_*  = hvac_action confirms the unit is pumping right now.
//               Drives the animated pulse overlay in CSS.
//   idle_*    = the mode is heat/cool but hvac_action is not
//               confirming active pumping (it's idle, off, missing,
//               or the attribute isn't exposed by this integration).
//               Drives a static dim tint overlay. Real-world AC
//               integrations regularly report hvac_action: idle while
//               the compressor is audibly running, so the idle tint
//               still answers "which AC is on?" on an overview.
//   null      = mode is off/auto/heat_cool/dry/fan_only/unknown, or
//               direction is otherwise ambiguous. No overlay.
function deriveActiveMode(entity) {
  const action = entity && entity.attributes && entity.attributes.hvac_action;
  if (action === 'heating') return 'active_heat';
  if (action === 'cooling') return 'active_cool';
  const state = entity && entity.state;
  if (state === 'heat') return 'idle_heat';
  if (state === 'cool') return 'idle_cool';
  return null;
}

// Resolve HA theme mode to a boolean: true = dark, false = light.
// hass.themes.selectedTheme is a ThemeSettings object { theme, dark?, ... },
// not a string; the theme *name* lives at selectedTheme.theme.
//
// Priority:
//   1. Named-theme overrides. "Google Dark Theme" / "Google Light Theme" are
//      authoritative: the name specifies the intended appearance and HA's
//      dark/light toggle can be set incoherently for these (e.g. a user can
//      apply "Google Dark Theme" while the toggle still says light mode).
//   2. selectedTheme.dark — HA's per-theme runtime flag, when present.
//   3. hass.themes.darkMode — the global dashboard toggle.
//   4. Default to dark for missing data (backward-compatible).
function resolveThemeDark(hass) {
  if (!hass || !hass.themes) return true;
  const sel = hass.themes.selectedTheme;
  const name = sel && sel.theme;
  if (name === 'Google Dark Theme') return true;
  if (name === 'Google Light Theme') return false;
  if (sel && typeof sel.dark === 'boolean') return sel.dark;
  const darkMode = hass.themes.darkMode;
  return darkMode === undefined ? true : !!darkMode;
}

function deepClone(value) {
  if (!(!!value && typeof value == 'object')) {
    return value;
  }
  if (Object.prototype.toString.call(value) == '[object Date]') {
    return new Date(value.getTime());
  }
  if (Array.isArray(value)) {
    return value.map(deepClone);
  }
  var result = {};
  Object.keys(value).forEach(
    function(key) { result[key] = deepClone(value[key]); });
  return result;
}