// Audio management for background music

// Configuration
const MUSIC_FILE = 'asymptote music loop.mp3';
const DEFAULT_VOLUME = 0.5; // 50%

class AudioManager {
  constructor() {
    this.audio = null;
    this.isMuted = false;
    this.volume = DEFAULT_VOLUME;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;

    // Create audio element
    this.audio = new Audio(MUSIC_FILE);
    this.audio.loop = true;
    this.audio.volume = this.volume;
    
    this.isInitialized = true;

    // Set up UI controls
    this.setupControls();
  }

  setupControls() {
    const muteBtn = document.getElementById('mute-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.getElementById('volume-value');
    const muteIcon = document.getElementById('mute-icon');

    if (!muteBtn || !volumeSlider || !volumeValue || !muteIcon) {
      const missing = [];
      if (!muteBtn) missing.push('mute-btn');
      if (!volumeSlider) missing.push('volume-slider');
      if (!volumeValue) missing.push('volume-value');
      if (!muteIcon) missing.push('mute-icon');
      console.error(`Audio controls not found in DOM. Missing elements: ${missing.join(', ')}`);
      return;
    }

    // Mute button handler
    muteBtn.addEventListener('click', () => {
      this.toggleMute();
      this.updateUI();
    });

    // Volume slider handler
    volumeSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      this.setVolume(value / 100);
      this.updateUI();
    });

    // Initialize UI
    this.updateUI();
  }

  play() {
    if (!this.isInitialized) {
      this.init();
    }

    if (this.audio) {
      this.audio.play().catch(err => {
        console.error('Failed to play audio:', err);
      });
    }
  }

  pause() {
    if (this.audio) {
      this.audio.pause();
    }
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.audio) {
      this.audio.volume = this.isMuted ? 0 : this.volume;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.audio) {
      this.audio.volume = this.isMuted ? 0 : this.volume;
    }
  }

  updateUI() {
    const muteIcon = document.getElementById('mute-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.getElementById('volume-value');

    if (muteIcon) {
      muteIcon.textContent = this.isMuted ? '🔇' : '🔊';
    }

    if (volumeSlider) {
      volumeSlider.value = Math.round(this.volume * 100);
    }

    if (volumeValue) {
      volumeValue.textContent = this.isMuted ? '0%' : Math.round(this.volume * 100) + '%';
    }
  }
}

// Create singleton instance
export const audioManager = new AudioManager();
