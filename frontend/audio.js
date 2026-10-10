// ============================================================================
// STEAMED HAMS: SOUND ENGINE (Web Audio API)
// 100% Procedural Victorian Audio Synthesis - Zero external files required!
// ============================================================================

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.masterVolume = 0.7;
    this.sfxVolume = 0.8;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.muted = muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
  }

  getMasterGain() {
    if (!this.ctx || this.muted) return 0;
    return this.masterVolume * this.sfxVolume;
  }

  // Helper: Create filtered noise buffer for steam sounds
  createNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // 1. Steam Hiss (Regular or Artisanal)
  playSteamHiss(isArtisanal = false) {
    this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isArtisanal ? 2200 : 1400, now);
    filter.Q.setValueAtTime(isArtisanal ? 4 : 1.5, now);

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();

    const vol = this.getMasterGain() * (isArtisanal ? 0.9 : 0.5);
    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(vol, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + (isArtisanal ? 0.9 : 0.45));

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + (isArtisanal ? 0.9 : 0.5));

    // If artisanal, also play a comical royal trumpet squeak
    if (isArtisanal) {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
      oscGain.gain.setValueAtTime(0.01, now);
      oscGain.gain.linearRampToValueAtTime(this.getMasterGain() * 0.25, now + 0.05);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    }
  }

  // 2. Mechanical Clank / Footstep Stomp
  playClank(heavy = false) {
    this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    const baseFreq = heavy ? 95 : 170;
    osc.frequency.setValueAtTime(baseFreq * 2.2, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.12);

    const vol = this.getMasterGain() * (heavy ? 0.6 : 0.3);
    oscGain.gain.setValueAtTime(vol, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + (heavy ? 0.25 : 0.12));

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);

    // Add metallic click rattle
    const click = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    click.type = 'square';
    click.frequency.setValueAtTime(1200, now);
    click.frequency.exponentialRampToValueAtTime(300, now + 0.04);
    clickGain.gain.setValueAtTime(this.getMasterGain() * 0.2, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    click.connect(clickGain);
    clickGain.connect(this.ctx.destination);
    click.start(now);
    click.stop(now + 0.05);
  }

  // 3. Jump Launch Steam Piston
  playJump() {
    this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    // Rising steam pulse + metallic release
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.18);

    gain.gain.setValueAtTime(this.getMasterGain() * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);

    this.playSteamHiss(false);
  }

  // 4. Wheeze / Failed Jump
  playWheeze() {
    this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.3);

    gain.gain.setValueAtTime(this.getMasterGain() * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.31);
  }

  // 5. Gearbox Reverse Shift Warning Sound
  playGearboxShift() {
    this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    // Series of 3 ratcheting clicks
    [0, 0.08, 0.16].forEach((offset, idx) => {
      const click = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      click.type = 'sawtooth';
      click.frequency.setValueAtTime(600 + idx * 300, now + offset);
      click.frequency.exponentialRampToValueAtTime(150, now + offset + 0.06);

      gain.gain.setValueAtTime(this.getMasterGain() * 0.45, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.06);

      click.connect(gain);
      gain.connect(this.ctx.destination);
      click.start(now + offset);
      click.stop(now + offset + 0.07);
    });
  }

  // 6. Overheat Warning Steam Whistle / Klaxon
  playOverheatKlaxon() {
    this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.linearRampToValueAtTime(980, now + 0.15);
    osc.frequency.linearRampToValueAtTime(880, now + 0.3);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(this.getMasterGain() * 0.35, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  // 7. Bureaucratic Stamp Sound (Door Interaction)
  playStamp() {
    this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.09);

    gain.gain.setValueAtTime(this.getMasterGain() * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  // 8. Comedic Failure Trombone + Explosion
  playFailure() {
    this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    // Sad descending notes: D, C#, C, B (comically flat)
    const notes = [293.66, 277.18, 261.63, 233.08];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.22);
      if (i === 3) {
        osc.frequency.linearRampToValueAtTime(freq * 0.8, now + i * 0.22 + 0.5);
      }

      gain.gain.setValueAtTime(0.01, now + i * 0.22);
      gain.gain.linearRampToValueAtTime(this.getMasterGain() * 0.35, now + i * 0.22 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.22 + (i === 3 ? 0.55 : 0.2));

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.22);
      osc.stop(now + i * 0.22 + (i === 3 ? 0.6 : 0.22));
    });

    // Sub-explosion boom
    const boom = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boom.type = 'triangle';
    boom.frequency.setValueAtTime(120, now + 0.9);
    boom.frequency.exponentialRampToValueAtTime(30, now + 1.6);
    boomGain.gain.setValueAtTime(this.getMasterGain() * 0.6, now + 0.9);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.7);
    boom.connect(boomGain);
    boomGain.connect(this.ctx.destination);
    boom.start(now + 0.9);
    boom.stop(now + 1.7);
  }

  // 9. Exaggerated Victorian Royal Victory Fanfare
  playVictory() {
    this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    // Regal triumph fanfare chord progression
    const arpeggio = [
      { f: 392.00, t: 0.00 }, // G4
      { f: 523.25, t: 0.16 }, // C5
      { f: 659.25, t: 0.32 }, // E5
      { f: 783.99, t: 0.48 }, // G5
      { f: 659.25, t: 0.68 }, // E5
      { f: 783.99, t: 0.84 }, // G5
      { f: 1046.50, t: 1.05 } // High C6 (long hold)
    ];

    arpeggio.forEach(({ f, t }, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now + t);

      const isLast = idx === arpeggio.length - 1;
      const duration = isLast ? 1.4 : 0.18;

      gain.gain.setValueAtTime(0.01, now + t);
      gain.gain.linearRampToValueAtTime(this.getMasterGain() * 0.35, now + t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + duration + 0.05);
    });
  }

  // 10. UI Button Click
  playButtonClick() {
    this.init();
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
    gain.gain.setValueAtTime(this.getMasterGain() * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }
}

// Export singleton
window.soundEngine = new SoundEngine();
