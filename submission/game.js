// ============================================================================
// STEAMED HAMS: THE WORST ENGINEER - MAIN GAME ENGINE
// Game Vita 5.0 Competition Entry
// State Machine, Input, Particles, HUD, and Backend Integration
// ============================================================================

const API_BASE = 'http://localhost:3001/api';

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += (p.gravity || 0) * dt;
      p.life -= dt;
      p.size += (p.growth || 0) * dt;
      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  spawnSteam(x, y, vx, vy, isArtisanal = false) {
    this.particles.push({
      x, y, vx, vy,
      gravity: -40,
      size: Math.random() * 8 + 6,
      growth: 16,
      life: Math.random() * 0.6 + 0.4,
      maxLife: 0.8,
      color: isArtisanal ? '255, 215, 0' : '236, 240, 241',
      alpha: 0.7,
      type: 'steam'
    });
  }

  spawnSmoke(x, y, vx, vy) {
    this.particles.push({
      x, y, vx, vy,
      gravity: -30,
      size: Math.random() * 6 + 4,
      growth: 18,
      life: Math.random() * 0.8 + 0.5,
      maxLife: 1.0,
      color: '80, 75, 70',
      alpha: 0.6,
      type: 'smoke'
    });
  }

  spawnDebris(x, y, vx, vy, hexColor) {
    this.particles.push({
      x, y, vx, vy,
      gravity: 600,
      size: Math.random() * 6 + 4,
      growth: 0,
      life: Math.random() * 1.5 + 1.0,
      maxLife: 2.0,
      hexColor: hexColor,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 15,
      type: 'debris'
    });
  }

  draw(ctx, cameraX, cameraY) {
    ctx.save();
    ctx.translate(-Math.floor(cameraX), -Math.floor(cameraY));

    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      if (p.type === 'debris') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation += (p.vRot || 0) * 0.016);
        ctx.fillStyle = p.hexColor;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      } else {
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  clear() {
    this.particles = [];
  }
}

class InputHandler {
  constructor() {
    this.keys = {};
    this.pressedThisFrame = {};

    window.addEventListener('keydown', e => {
      // Prevent browser scroll on space/arrows
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      if (!this.keys[e.code]) {
        this.pressedThisFrame[e.code] = true;
      }
      this.keys[e.code] = true;

      // Global hotkeys
      if (e.code === 'KeyR') {
        window.game.restart();
      }
      if (e.code === 'Escape') {
        window.game.togglePause();
      }
    });

    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });
  }

  justPressed(code) {
    return !!this.pressedThisFrame[code];
  }

  endFrame() {
    this.pressedThisFrame = {};
  }
}

class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.input = new InputHandler();
    this.particles = new ParticleSystem();
    this.robot = new RobotAssistant();
    this.level = new Level();
    this.player = new Player(60, 410);

    // Game States: 'MENU', 'PLAYING', 'PAUSED', 'UPGRADE', 'WIN', 'LOSE'
    this.state = 'MENU';

    // Game stats
    this.startTime = 0;
    this.elapsedTime = 0;
    this.deathsCount = 0;
    this.backendAvailable = false;

    // Last frame time
    this.lastTime = 0;

    this.initCanvasSize();
    window.addEventListener('resize', () => this.initCanvasSize());

    // Check backend status
    this.checkBackendHealth();
  }

  initCanvasSize() {
    this.canvas.width = 960;
    this.canvas.height = 540;
  }

  async checkBackendHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        this.backendAvailable = true;
        console.log('[CLIENT] Connected to Royal Engineering Backend!');
        const el = document.getElementById('backendStatusIndicator');
        if (el) el.innerHTML = '⚙ Ministry Archives: CONNECTED';
      }
    } catch (e) {
      this.backendAvailable = false;
      const el = document.getElementById('backendStatusIndicator');
      if (el) el.innerHTML = '⚙ Ministry Archives: LOCAL STANDALONE';
    }
  }

  start() {
    this.state = 'PLAYING';
    this.startTime = Date.now();
    this.elapsedTime = 0;
    this.deathsCount = 0;
    this.player.reset(60, 410);
    this.level = new Level();
    this.particles.clear();
    this.robot.say('start', true);

    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('pauseMenu').classList.add('hidden');
    document.getElementById('winScreen').classList.add('hidden');
    document.getElementById('loseScreen').classList.add('hidden');
    document.getElementById('upgradeModal').classList.add('hidden');

    if (window.soundEngine) {
      window.soundEngine.init();
      window.soundEngine.playButtonClick();
    }
  }

  restart() {
    if (this.state === 'MENU') return;
    this.state = 'PLAYING';
    this.deathsCount += (this.player.isDead ? 1 : 0);
    this.player.reset(60, 410);
    this.particles.clear();

    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('pauseMenu').classList.add('hidden');
    document.getElementById('winScreen').classList.add('hidden');
    document.getElementById('loseScreen').classList.add('hidden');
    document.getElementById('upgradeModal').classList.add('hidden');

    this.robot.say('start');
    if (window.soundEngine) {
      window.soundEngine.playButtonClick();
    }
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      document.getElementById('pauseMenu').classList.remove('hidden');
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      document.getElementById('pauseMenu').classList.add('hidden');
    }
    if (window.soundEngine) {
      window.soundEngine.playButtonClick();
    }
  }

  showMenu() {
    this.state = 'MENU';
    document.getElementById('mainMenu').classList.remove('hidden');
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('pauseMenu').classList.add('hidden');
    document.getElementById('winScreen').classList.add('hidden');
    document.getElementById('loseScreen').classList.add('hidden');
    document.getElementById('upgradeModal').classList.add('hidden');
    document.getElementById('settingsModal').classList.add('hidden');
    document.getElementById('howToPlayModal').classList.add('hidden');
    document.getElementById('leaderboardModal').classList.add('hidden');
  }

  openUpgradeTerminal() {
    this.state = 'UPGRADE';
    document.getElementById('upgradeModal').classList.remove('hidden');
    if (window.soundEngine) window.soundEngine.playButtonClick();
    this.robot.say('upgrade', true);
  }

  chooseUpgrade(id) {
    this.player.applyUpgrade(id);
    document.getElementById('upgradeModal').classList.add('hidden');
    this.state = 'PLAYING';
    if (window.soundEngine) {
      window.soundEngine.playStamp();
    }
    this.level.addScreenShake(6, 0.3);
  }

  handleInteractions() {
    if (this.input.justPressed('KeyE')) {
      const p = this.player;

      // 1. Upgrade Terminal
      const ut = this.level.upgradeTerminal;
      if (Math.abs((p.x + p.width / 2) - (ut.x + ut.w / 2)) < 60 &&
          Math.abs((p.y + p.height / 2) - (ut.y + ut.h / 2)) < 60) {
        this.openUpgradeTerminal();
        return;
      }

      // 2. Bureaucratic Triplicate Door
      const d = this.level.door;
      if (!d.isOpen &&
          Math.abs((p.x + p.width / 2) - d.x) < 70 &&
          Math.abs((p.y + p.height / 2) - (d.y + d.h / 2)) < 90) {
        d.stampsDone++;
        if (window.soundEngine) window.soundEngine.playStamp();
        this.level.addScreenShake(3, 0.15);

        if (d.stampsDone >= d.stampsRequired) {
          d.isOpen = true;
          this.robot.say('door', true);
          this.level.addScreenShake(7, 0.4);
        } else {
          const formMsg = d.formNames[d.stampsDone - 1] || "Form Approved!";
          this.robot.currentMessage = `STAMPED (${d.stampsDone}/3): ${formMsg}`;
          this.robot.messageTimer = 4.0;
        }
      }
    }
  }

  onPlayerWin() {
    this.state = 'WIN';
    const totalSec = Math.floor((Date.now() - this.startTime) / 1000);

    document.getElementById('winTime').innerText = `${totalSec} seconds`;
    document.getElementById('winDeaths').innerText = `${this.deathsCount}`;
    document.getElementById('winSteam').innerText = `${Math.floor(this.player.steamVentedTotal)} Liters`;
    document.getElementById('winScreen').classList.remove('hidden');

    // Submit to backend
    this.submitRecord({
      name: localStorage.getItem('steamed_engineer_name') || "Chief Boiler Operator",
      time: totalSec,
      deaths: this.deathsCount,
      steamVented: Math.floor(this.player.steamVentedTotal),
      upgrades: Array.from(this.player.upgrades),
      rank: this.deathsCount === 0 ? "Grand High Disaster Architect" : "Senior Incompetence Inspector"
    });
  }

  onPlayerLose() {
    this.state = 'LOSE';
    document.getElementById('loseReason').innerText = this.player.deathReason;
    document.getElementById('loseScreen').classList.remove('hidden');

    // Report incident to backend
    if (this.backendAvailable) {
      fetch(`${API_BASE}/incident`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: this.player.deathReason,
          steamVented: Math.floor(this.player.steamVentedTotal)
        })
      }).catch(() => {});
    }
  }

  async submitRecord(record) {
    if (this.backendAvailable) {
      try {
        await fetch(`${API_BASE}/records`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        });
        console.log('[CLIENT] Record archived with the Royal Ministry!');
      } catch (err) {
        console.warn('[CLIENT] Failed to submit record to backend:', err);
      }
    }

    // Save locally as well
    const localRecords = JSON.parse(localStorage.getItem('steamed_records') || '[]');
    localRecords.push(record);
    localStorage.setItem('steamed_records', JSON.stringify(localRecords));
  }

  updateHUD() {
    // 1. Steam Pressure Needle & Value
    const pressure = Math.floor(this.player.steamPressure);
    const needle = document.getElementById('pressureNeedle');
    if (needle) {
      // Rotation from -90deg (0%) to 90deg (100%)
      const deg = (pressure / 100) * 180 - 90;
      needle.style.transform = `rotate(${deg}deg)`;
    }
    const valEl = document.getElementById('pressureValue');
    if (valEl) valEl.innerText = `${pressure}%`;

    // 2. Overheat Alert Indicator
    const alertEl = document.getElementById('overheatAlert');
    if (alertEl) {
      if (this.player.isOverheating) {
        alertEl.classList.remove('hidden');
        alertEl.innerText = `CRITICAL OVERHEAT: DETONATION IN ${this.player.overheatTimer.toFixed(1)}s! PRESS [W] TO VENT!`;
      } else {
        alertEl.classList.add('hidden');
      }
    }

    // 3. Gearbox Status
    const gearEl = document.getElementById('gearboxStatus');
    if (gearEl) {
      if (this.player.isReversed) {
        gearEl.innerHTML = `<span style="color:#ff4757; font-weight:bold;">⇄ EMOTIONAL REVERSE (${this.player.reverseTimeLeft.toFixed(0)}s)</span>`;
      } else {
        gearEl.innerHTML = `<span style="color:#2ecc71;">⚙ STANDARD FORWARD</span>`;
      }
    }

    // 4. Timer & Deaths
    if (this.state === 'PLAYING') {
      const sec = Math.floor((Date.now() - this.startTime) / 1000);
      const timerEl = document.getElementById('hudTimer');
      if (timerEl) timerEl.innerText = `${sec}s`;
    }
    const deathEl = document.getElementById('hudDeaths');
    if (deathEl) deathEl.innerText = `${this.deathsCount}`;
  }

  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    let dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    if (dt > 0.1) dt = 0.1; // Clamp large delta time lag spikes

    // Gameplay update
    if (this.state === 'PLAYING') {
      this.handleInteractions();
      this.player.update(dt, this.input, this.level, this.particles, this.robot);
      this.level.update(dt, this.player, this.particles, this.robot);
      this.robot.update(dt, this.player.x, this.player.y);
      this.particles.update(dt);
      this.updateHUD();

      if (this.player.hasWon && this.state !== 'WIN') {
        this.onPlayerWin();
      } else if (this.player.isDead && this.state !== 'LOSE') {
        this.onPlayerLose();
      }
    }

    // Render Canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Parallax Victorian Foundry Background
    this.level.drawBackground(this.ctx, this.canvas.width, this.canvas.height);

    // 2. World Elements (Platforms, Cogs, Hazards, Pedestals)
    this.level.drawWorld(this.ctx);

    // 3. Particles (Under or around entities)
    this.particles.draw(this.ctx, this.level.cameraX, this.level.cameraY);

    // 4. Player Contraption
    if (this.state === 'PLAYING' || this.state === 'PAUSED' || this.state === 'WIN' || this.state === 'UPGRADE') {
      this.ctx.save();
      this.ctx.translate(-Math.floor(this.level.cameraX), -Math.floor(this.level.cameraY));
      this.player.draw(this.ctx);
      this.ctx.restore();
    }

    // 5. Robot Assistant (Sir Clanksworth)
    if (this.state === 'PLAYING' || this.state === 'PAUSED' || this.state === 'WIN') {
      this.ctx.save();
      this.ctx.translate(-Math.floor(this.level.cameraX), -Math.floor(this.level.cameraY));
      this.robot.draw(this.ctx);
      this.ctx.restore();
    }

    this.input.endFrame();
    requestAnimationFrame(t => this.loop(t));
  }
}

// Global bootstrap
window.addEventListener('DOMContentLoaded', () => {
  window.game = new GameEngine();
  requestAnimationFrame(t => window.game.loop(t));
});
