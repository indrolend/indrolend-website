// Settings management for the Asymptote game
import { audioManager } from './audio.js';

// Settings keys for localStorage
const SETTINGS_KEY = 'asymptote_settings';

// Default settings
const DEFAULT_SETTINGS = {
  musicEnabled: true,
  colorTheme: 'default', // default, red, green, purple
  largeNumbers: false, // If true, show full numbers instead of abbreviated (1000K vs 1,000,000)
  fragmentsEnabled: true, // Show/hide fragment notifications
  showConcepts: true, // Show generator concepts
  autoSave: true,
  clickAnimation: true
};

class SettingsManager {
  constructor() {
    this.settings = this.loadSettings();
    this.callbacks = []; // Callbacks to notify when settings change
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      this.notifyCallbacks();
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  get(key) {
    return this.settings[key];
  }

  set(key, value) {
    this.settings[key] = value;
    this.saveSettings();
    this.applySettings();
  }

  getAll() {
    return { ...this.settings };
  }

  reset() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
    this.applySettings();
  }

  // Register callback for settings changes
  onChange(callback) {
    this.callbacks.push(callback);
  }

  notifyCallbacks() {
    this.callbacks.forEach(cb => cb(this.settings));
  }

  // Apply settings to the game
  applySettings() {
    // Apply music setting
    if (this.settings.musicEnabled) {
      if (audioManager.getMuted()) {
        audioManager.toggleMute();
      }
    } else {
      if (!audioManager.getMuted()) {
        audioManager.toggleMute();
      }
    }

    // Apply color theme
    this.applyColorTheme(this.settings.colorTheme);

    // Notify all callbacks
    this.notifyCallbacks();
  }

  applyColorTheme(theme) {
    const root = document.documentElement;
    
    switch (theme) {
      case 'red':
        root.style.setProperty('--primary-color', '#ff6b6b');
        root.style.setProperty('--secondary-color', '#c92a2a');
        root.style.setProperty('--bg-color', '#1a0000');
        root.style.setProperty('--bg-secondary', '#330000');
        break;
      case 'green':
        root.style.setProperty('--primary-color', '#51cf66');
        root.style.setProperty('--secondary-color', '#2b8a3e');
        root.style.setProperty('--bg-color', '#001a00');
        root.style.setProperty('--bg-secondary', '#003300');
        break;
      case 'purple':
        root.style.setProperty('--primary-color', '#cc5de8');
        root.style.setProperty('--secondary-color', '#9c36b5');
        root.style.setProperty('--bg-color', '#1a001a');
        root.style.setProperty('--bg-secondary', '#330033');
        break;
      case 'default':
      default:
        root.style.setProperty('--primary-color', '#6dd9e8');
        root.style.setProperty('--secondary-color', '#3bb8cc');
        root.style.setProperty('--bg-color', '#000');
        root.style.setProperty('--bg-secondary', '#001a33');
        break;
    }
  }
}

// Create singleton instance
export const settingsManager = new SettingsManager();

// Settings UI
export function showSettingsPopup() {
  // Remove existing popup if any
  const existing = document.getElementById('settings-popup');
  if (existing) {
    existing.remove();
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'settings-popup';
  overlay.className = 'settings-overlay';

  const popup = document.createElement('div');
  popup.className = 'settings-popup';

  const title = document.createElement('h2');
  title.textContent = 'SETTINGS';
  title.className = 'settings-title';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'settings-close';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => {
    overlay.classList.add('fade-out');
    setTimeout(() => overlay.remove(), 300);
  });

  popup.appendChild(closeBtn);
  popup.appendChild(title);

  // Settings options
  const settingsContainer = document.createElement('div');
  settingsContainer.className = 'settings-container';

  // Music toggle
  const musicSetting = createToggleSetting(
    'Music',
    'Enable/disable background music',
    settingsManager.get('musicEnabled'),
    (value) => {
      settingsManager.set('musicEnabled', value);
      if (value) {
        audioManager.play();
      } else {
        audioManager.pause();
      }
    }
  );
  settingsContainer.appendChild(musicSetting);

  // Color theme selector
  const themeSetting = createSelectSetting(
    'Color Theme',
    'Change the game\'s color scheme',
    settingsManager.get('colorTheme'),
    [
      { value: 'default', label: 'Cyan (Default)' },
      { value: 'red', label: 'Red' },
      { value: 'green', label: 'Green' },
      { value: 'purple', label: 'Purple' }
    ],
    (value) => settingsManager.set('colorTheme', value)
  );
  settingsContainer.appendChild(themeSetting);

  // Large numbers toggle
  const largeNumbersSetting = createToggleSetting(
    'Large Numbers',
    'Show full numbers instead of abbreviated (e.g., 1,000,000 vs 1M)',
    settingsManager.get('largeNumbers'),
    (value) => settingsManager.set('largeNumbers', value)
  );
  settingsContainer.appendChild(largeNumbersSetting);

  // Fragments toggle
  const fragmentsSetting = createToggleSetting(
    'Fragment Notifications',
    'Enable/disable fragment discovery popups',
    settingsManager.get('fragmentsEnabled'),
    (value) => settingsManager.set('fragmentsEnabled', value)
  );
  settingsContainer.appendChild(fragmentsSetting);

  // Concepts toggle
  const conceptsSetting = createToggleSetting(
    'Show Concepts',
    'Display philosophical concepts on generators',
    settingsManager.get('showConcepts'),
    (value) => settingsManager.set('showConcepts', value)
  );
  settingsContainer.appendChild(conceptsSetting);

  // Click animation toggle
  const clickAnimationSetting = createToggleSetting(
    'Click Animation',
    'Enable/disable click feedback animations',
    settingsManager.get('clickAnimation'),
    (value) => settingsManager.set('clickAnimation', value)
  );
  settingsContainer.appendChild(clickAnimationSetting);

  // Auto-save toggle
  const autoSaveSetting = createToggleSetting(
    'Auto-Save',
    'Automatically save game progress',
    settingsManager.get('autoSave'),
    (value) => settingsManager.set('autoSave', value)
  );
  settingsContainer.appendChild(autoSaveSetting);

  popup.appendChild(settingsContainer);

  // Reset button
  const resetBtn = document.createElement('button');
  resetBtn.className = 'settings-reset-btn';
  resetBtn.textContent = 'Reset to Defaults';
  resetBtn.addEventListener('click', () => {
    if (confirm('Reset all settings to default values?')) {
      settingsManager.reset();
      overlay.remove();
      // Reopen to show updated values
      setTimeout(() => showSettingsPopup(), 100);
    }
  });
  popup.appendChild(resetBtn);

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.add('fade-out');
      setTimeout(() => overlay.remove(), 300);
    }
  });
}

function createToggleSetting(label, description, initialValue, onChange) {
  const container = document.createElement('div');
  container.className = 'setting-item';

  const labelContainer = document.createElement('div');
  labelContainer.className = 'setting-label-container';

  const labelEl = document.createElement('div');
  labelEl.className = 'setting-label';
  labelEl.textContent = label;

  const descEl = document.createElement('div');
  descEl.className = 'setting-description';
  descEl.textContent = description;

  labelContainer.appendChild(labelEl);
  labelContainer.appendChild(descEl);

  const toggle = document.createElement('label');
  toggle.className = 'toggle-switch';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = initialValue;
  checkbox.addEventListener('change', (e) => onChange(e.target.checked));

  const slider = document.createElement('span');
  slider.className = 'toggle-slider';

  toggle.appendChild(checkbox);
  toggle.appendChild(slider);

  container.appendChild(labelContainer);
  container.appendChild(toggle);

  return container;
}

function createSelectSetting(label, description, initialValue, options, onChange) {
  const container = document.createElement('div');
  container.className = 'setting-item';

  const labelContainer = document.createElement('div');
  labelContainer.className = 'setting-label-container';

  const labelEl = document.createElement('div');
  labelEl.className = 'setting-label';
  labelEl.textContent = label;

  const descEl = document.createElement('div');
  descEl.className = 'setting-description';
  descEl.textContent = description;

  labelContainer.appendChild(labelEl);
  labelContainer.appendChild(descEl);

  const select = document.createElement('select');
  select.className = 'setting-select';
  select.value = initialValue;

  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    if (opt.value === initialValue) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  select.addEventListener('change', (e) => onChange(e.target.value));

  container.appendChild(labelContainer);
  container.appendChild(select);

  return container;
}

// Initialize settings on load
export function initSettings() {
  settingsManager.applySettings();
}
