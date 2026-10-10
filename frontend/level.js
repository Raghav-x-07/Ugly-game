// ============================================================================
// STEAMED HAMS: LEVEL & FACTORY ENVIRONMENT
// Handcrafted Victorian Steampunk Level, Collision Detection & Parallax Background
// ============================================================================

class Level {
  constructor() {
    this.width = 3600; // Total level width
    this.height = 700; // Level height
    this.killY = 660;  // Death plane

    // Screen Shake
    this.shakeIntensity = 0;
    this.shakeDuration = 0;

    // Camera
    this.cameraX = 0;
    this.cameraY = 0;

    // Platforms (solid blocks: {x, y, w, h, type})
    this.platforms = [
      // 1. Starting Platform & Tutorial Area
      { x: 0, y: 480, w: 580, h: 220, type: 'floor' },

      // Small Gap (teach jumping: gap from 580 to 700)
      // 2. Steam Hazard & Gearbox Malfunction Area
      { x: 700, y: 480, w: 450, h: 220, type: 'floor' },

      // Step-up platform over steam geyser
      { x: 920, y: 390, w: 180, h: 25, type: 'girder' },

      // Pit from 1150 to 1290 with a moving piston elevator!
      // 3. Platform with Upgrade Terminal
      { x: 1290, y: 460, w: 550, h: 240, type: 'floor' },
      { x: 1450, y: 350, w: 200, h: 25, type: 'girder' }, // High bypass girder

      // Gap from 1840 to 1980
      // 4. Obstacle / Gear Pit Section
      { x: 1980, y: 480, w: 420, h: 220, type: 'floor' },
      { x: 2120, y: 360, w: 160, h: 25, type: 'girder' },

      // Gap from 2400 to 2520
      // 5. Bureaucratic Triplicate Door Area
      { x: 2520, y: 480, w: 460, h: 220, type: 'floor' },

      // 6. Royal Engineering Office Delivery Platform (Goal)
      { x: 3040, y: 440, w: 560, h: 260, type: 'royal_office' }
    ];

    // Moving Piston Platform
    this.pistonPlatform = {
      x: 1170,
      y: 490,
      w: 100,
      h: 22,
      baseY: 490,
      targetY: 380,
      progress: 0,
      speed: 1.2
    };

    // Hazard Cogs (spinning in pits)
    this.hazardCogs = [
      { x: 640, y: 560, r: 42, speed: 2.5, angle: 0 },
      { x: 1220, y: 570, r: 46, speed: -2.0, angle: 0 },
      { x: 1910, y: 560, r: 48, speed: 3.0, angle: 0 },
      { x: 2460, y: 570, r: 45, speed: -2.5, angle: 0 }
    ];

    // Steam Geysers (push player or build steam)
    this.steamGeysers = [
      { x: 840, y: 470, w: 30, h: 80, active: true, timer: 0 }
    ];

    // Gearbox Inversion Field / Trigger Zone
    this.gearboxZone = {
      x: 980,
      y: 320,
      w: 80,
      h: 170,
      triggered: false
    };

    // Interactive Objects
    this.upgradeTerminal = {
      x: 1620,
      y: 390,
      w: 70,
      h: 70,
      used: false
    };

    // Bureaucratic Triplicate Door
    this.door = {
      x: 2880,
      y: 320,
      w: 36,
      h: 160,
      stampsRequired: 3,
      stampsDone: 0,
      isOpen: false,
      openProgress: 0,
      formNames: [
        "FORM 104-A: Request for Doorway Traversal Without Immediate Boiler Explosion",
        "FORM 104-B: Environmental Impact of Excessive Victorian Piston Stomping",
        "FORM 104-C: Final Ministerial Stamp of Questionable Sanction"
      ]
    };

    // Royal Goal Pedestal
    this.goal = {
      x: 3380,
      y: 360,
      w: 90,
      h: 80,
      delivered: false
    };

    // Tutorial & World Signs
    this.signs = [
      {
        x: 180,
        y: 410,
        title: "TUTORIAL NOTICE #1",
        text: "Controls: [A / D] to Shuffle Clumsily. [W] to Vent Steam. [Space] to Jump (requires steam!). [R] to Restart."
      },
      {
        x: 480,
        y: 410,
        title: "SAFETY ADVISORY",
        text: "CAUTION: Jumping with 0% steam produces a pitiful wheeze. Build steam by walking!"
      },
      {
        x: 1040,
        y: 320,
        title: "PATENT GEARBOX WARNING",
        text: "WARNING: Experimental Gearbox Zone ahead. Left and right are subject to sudden parliamentary debate."
      },
      {
        x: 1400,
        y: 390,
        title: "INNOVATION STATION",
        text: "Press [E] to install useless patent upgrades designed by our most distracted engineers."
      },
      {
        x: 2200,
        y: 410,
        title: "ROYAL GEOGRAPHICAL SURVEY",
        text: "<-- SHORTCUT TO WIN (TRAP) | OFFICIAL ROYAL OFFICE (SAFE) -->"
      },
      {
        x: 2780,
        y: 410,
        title: "MINISTERIAL CHECKPOINT",
        text: "Bureaucratic Door ahead. Press [E] three times to file the triplicate compliance forms."
      }
    ];

    // Background gear decorations
    this.bgGears = [
      { x: 300, y: 180, r: 120, speed: 0.15, teeth: 16, angle: 0 },
      { x: 500, y: 150, r: 85, speed: -0.21, teeth: 12, angle: 0 },
      { x: 1100, y: 220, r: 140, speed: 0.12, teeth: 18, angle: 0 },
      { x: 1320, y: 190, r: 90, speed: -0.19, teeth: 12, angle: 0 },
      { x: 1900, y: 160, r: 130, speed: 0.14, teeth: 16, angle: 0 },
      { x: 2600, y: 200, r: 150, speed: -0.11, teeth: 20, angle: 0 },
      { x: 3200, y: 170, r: 110, speed: 0.18, teeth: 14, angle: 0 }
    ];
  }

  addScreenShake(intensity, duration) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
  }

  update(dt, player, particles, robot) {
    // 1. Screen Shake Decay
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      if (this.shakeDuration <= 0) {
        this.shakeIntensity = 0;
      }
    }

    // 2. Rotate background & hazard gears
    this.bgGears.forEach(g => {
      g.angle += g.speed * dt;
    });

    this.hazardCogs.forEach(c => {
      c.angle += c.speed * dt;

      // Check collision with player
      if (!player.isDead && !player.hasWon) {
        const dx = (player.x + player.width / 2) - c.x;
        const dy = (player.y + player.height / 2) - c.y;
        const dist = Math.hypot(dx, dy);
        if (dist < c.r + 14) {
          player.die("Mangled by Unregulated High-Torque Hazard Cog", particles, this, robot);
        }
      }
    });

    // 3. Moving Piston Platform
    this.pistonPlatform.progress += this.pistonPlatform.speed * dt;
    const sinFactor = (Math.sin(this.pistonPlatform.progress) + 1) / 2; // 0 to 1
    const oldY = this.pistonPlatform.y;
    this.pistonPlatform.y = this.pistonPlatform.baseY - sinFactor * (this.pistonPlatform.baseY - this.pistonPlatform.targetY);

    // If player is on moving platform, ride with it
    if (player.isGrounded &&
        player.x + player.width > this.pistonPlatform.x &&
        player.x < this.pistonPlatform.x + this.pistonPlatform.w &&
        Math.abs(player.y + player.height - oldY) < 6) {
      player.y = this.pistonPlatform.y - player.height;
    }

    // 4. Steam Geysers
    this.steamGeysers.forEach(g => {
      g.timer += dt;
      if (Math.random() < 0.7) {
        particles.spawnSteam(
          g.x + Math.random() * g.w,
          g.y,
          Math.random() * 20 - 10,
          -(Math.random() * 120 + 80),
          false
        );
      }
      // Push player upward and add heat if standing on it
      if (player.x + player.width > g.x && player.x < g.x + g.w &&
          player.y + player.height > g.y - g.h && player.y + player.height <= g.y + 10) {
        player.vy = -340;
        player.steamPressure = Math.min(100, player.steamPressure + 18 * dt);
      }
    });

    // 5. Gearbox Inversion Zone Trigger
    if (!this.gearboxZone.triggered &&
        player.x + player.width > this.gearboxZone.x &&
        player.x < this.gearboxZone.x + this.gearboxZone.w) {
      this.gearboxZone.triggered = true;
      player.triggerGearboxReversal(12);
      this.addScreenShake(6, 0.4);
      if (robot) robot.say('reverse_warn', true);
    }

    // 6. Bureaucratic Door Opening Animation
    if (this.door.isOpen && this.door.openProgress < 1.0) {
      this.door.openProgress += dt * 0.8;
      if (this.door.openProgress > 1.0) this.door.openProgress = 1.0;
    }

    // 7. Goal Pedestal Detection
    if (!this.goal.delivered && !player.isDead &&
        player.x + player.width > this.goal.x &&
        player.x < this.goal.x + this.goal.w &&
        player.y + player.height > this.goal.y) {
      this.goal.delivered = true;
      player.hasWon = true;
      player.holdingGear = false;
      this.addScreenShake(5, 0.5);

      if (window.soundEngine) {
        window.soundEngine.playVictory();
      }
      if (robot) {
        robot.say('win', true);
      }

      // Celebratory steam fireworks
      for (let i = 0; i < 40; i++) {
        particles.spawnSteam(
          this.goal.x + 45,
          this.goal.y - 10,
          (Math.random() - 0.5) * 220,
          -(Math.random() * 180 + 80),
          true
        );
      }
    }

    // 8. Smooth Camera Tracking
    const targetCamX = player.x - 380;
    this.cameraX += (targetCamX - this.cameraX) * 4.5 * dt;
    this.cameraX = Math.max(0, Math.min(this.width - 800, this.cameraX));

    // Vertical camera with gentle tracking
    const targetCamY = Math.max(0, Math.min(100, player.y - 320));
    this.cameraY += (targetCamY - this.cameraY) * 3.5 * dt;
  }

  // AABB Collision Resolution
  resolveHorizontalCollision(player) {
    const allPlatforms = [...this.platforms];
    // Add door if closed
    if (!this.door.isOpen) {
      allPlatforms.push({
        x: this.door.x,
        y: this.door.y,
        w: this.door.w,
        h: this.door.h,
        type: 'door'
      });
    }

    for (const p of allPlatforms) {
      if (player.x < p.x + p.w &&
          player.x + player.width > p.x &&
          player.y < p.y + p.h &&
          player.y + player.height > p.y) {
        if (player.vx > 0) {
          player.x = p.x - player.width;
          player.vx = 0;
        } else if (player.vx < 0) {
          player.x = p.x + p.w;
          player.vx = 0;
        }
      }
    }
  }

  resolveVerticalCollision(player) {
    const allPlatforms = [
      ...this.platforms,
      { x: this.pistonPlatform.x, y: this.pistonPlatform.y, w: this.pistonPlatform.w, h: this.pistonPlatform.h, type: 'piston' }
    ];

    for (const p of allPlatforms) {
      if (player.x + player.width > p.x + 4 &&
          player.x < p.x + p.w - 4 &&
          player.y < p.y + p.h &&
          player.y + player.height > p.y) {
        if (player.vy >= 0 && (player.y + player.height - player.vy * 0.1) <= p.y + 16) {
          player.y = p.y - player.height;
          player.vy = 0;
          player.isGrounded = true;
        } else if (player.vy < 0) {
          player.y = p.y + p.h;
          player.vy = 0;
        }
      }
    }
  }

  drawBackground(ctx, viewWidth, viewHeight) {
    // Parallax factor: 0.35
    const paraX = this.cameraX * 0.35;

    // Foundry Dark Amber Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, viewHeight);
    bgGrad.addColorStop(0, '#120d09');
    bgGrad.addColorStop(0.5, '#2b1b11');
    bgGrad.addColorStop(1, '#0d0805');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, viewWidth, viewHeight);

    // Arched Victorian Foundry Windows
    for (let x = -paraX % 400 - 100; x < viewWidth + 200; x += 380) {
      ctx.fillStyle = 'rgba(211, 84, 0, 0.08)';
      ctx.beginPath();
      ctx.arc(x + 80, 160, 60, Math.PI, 0);
      ctx.rect(x + 20, 160, 120, 180);
      ctx.fill();

      // Window panes
      ctx.strokeStyle = 'rgba(30, 20, 10, 0.6)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Giant Rotating Silhouette Gears
    ctx.save();
    this.bgGears.forEach(g => {
      const screenX = g.x - paraX;
      if (screenX > -g.r && screenX < viewWidth + g.r) {
        ctx.save();
        ctx.translate(screenX, g.y);
        ctx.rotate(g.angle);

        ctx.fillStyle = 'rgba(40, 25, 15, 0.45)';
        ctx.strokeStyle = 'rgba(20, 10, 5, 0.7)';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(0, 0, g.r * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        for (let i = 0; i < g.teeth; i++) {
          const a = (i / g.teeth) * Math.PI * 2;
          ctx.save();
          ctx.rotate(a);
          ctx.fillRect(-6, -g.r, 12, g.r * 0.4);
          ctx.restore();
        }

        // Spokes
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2;
          ctx.save();
          ctx.rotate(a);
          ctx.fillRect(-4, -g.r * 0.7, 8, g.r * 1.4);
          ctx.restore();
        }

        ctx.restore();
      }
    });
    ctx.restore();

    // Factory Iron Trusses & Girders
    ctx.fillStyle = 'rgba(25, 18, 12, 0.85)';
    ctx.fillRect(0, 40, viewWidth, 22);
    for (let x = -paraX % 200; x < viewWidth; x += 200) {
      ctx.fillRect(x, 40, 14, 260);
      // Diagonal cross-brace
      ctx.strokeStyle = 'rgba(25, 18, 12, 0.85)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(x, 40);
      ctx.lineTo(x + 200, 300);
      ctx.stroke();
    }
  }

  drawWorld(ctx) {
    ctx.save();
    // Apply camera and screen shake
    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeDuration > 0) {
      shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
    }

    ctx.translate(-Math.floor(this.cameraX) + shakeX, -Math.floor(this.cameraY) + shakeY);

    // 1. Draw Platforms
    this.platforms.forEach(p => {
      // Iron & Copper Riveted Platforms
      const grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
      if (p.type === 'royal_office') {
        grad.addColorStop(0, '#c59b27');
        grad.addColorStop(0.3, '#784e1b');
        grad.addColorStop(1, '#2c1e0e');
      } else {
        grad.addColorStop(0, '#534336');
        grad.addColorStop(0.15, '#35271e');
        grad.addColorStop(1, '#1b130e');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(p.x, p.y, p.w, p.h);

      // Brass top trim
      ctx.fillStyle = p.type === 'royal_office' ? '#ffd700' : '#b8860b';
      ctx.fillRect(p.x, p.y, p.w, 6);

      // Dark edge border
      ctx.strokeStyle = '#180f08';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x, p.y, p.w, p.h);

      // Rivets along top and bottom
      ctx.fillStyle = '#d4af37';
      for (let rx = p.x + 16; rx < p.x + p.w - 10; rx += 28) {
        ctx.fillRect(rx, p.y + 9, 3, 3);
      }

      // Hazard Stripes for girders or pit edges
      if (p.type === 'girder') {
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x + 2, p.y + 2, p.w - 4, p.h - 4);
      }
    });

    // 2. Draw Moving Piston Platform
    const pp = this.pistonPlatform;
    // Hydraulic cylinder underneath
    ctx.fillStyle = '#2f3542';
    ctx.fillRect(pp.x + pp.w / 2 - 8, pp.y + pp.h, 16, 600 - pp.y);
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(pp.x + pp.w / 2 - 12, pp.y + pp.h, 24, 8); // Brass packing collar

    // Platform body
    ctx.fillStyle = '#6b4f32';
    ctx.fillRect(pp.x, pp.y, pp.w, pp.h);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(pp.x, pp.y, pp.w, 4);
    ctx.strokeStyle = '#22150a';
    ctx.strokeRect(pp.x, pp.y, pp.w, pp.h);

    // 3. Draw Hazard Cogs
    this.hazardCogs.forEach(c => {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.angle);

      ctx.fillStyle = '#c0392b';
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.arc(0, 0, c.r * 0.75, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        ctx.save();
        ctx.rotate(a);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(-4, -c.r, 8, c.r * 0.4);
        ctx.restore();
      }

      // Center skull/hazard rivet
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(0, 0, c.r * 0.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // 4. Molten Slag in Pits
    const pitY = 620;
    const pitGrad = ctx.createLinearGradient(0, pitY, 0, 700);
    pitGrad.addColorStop(0, '#e67e22');
    pitGrad.addColorStop(0.3, '#d35400');
    pitGrad.addColorStop(1, '#962d00');
    ctx.fillStyle = pitGrad;
    ctx.fillRect(0, pitY, this.width, 80);

    // 5. Gearbox Reversal Trigger Zone (Visual Warning Gate)
    const gz = this.gearboxZone;
    ctx.save();
    ctx.strokeStyle = gz.triggered ? '#7f8c8d' : '#f39c12';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(gz.x, gz.y, gz.w, gz.h);
    ctx.setLineDash([]);

    // Warning sign atop gate
    ctx.fillStyle = '#d35400';
    ctx.fillRect(gz.x + 5, gz.y - 20, gz.w - 10, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px "Courier New", monospace';
    ctx.fillText("⇄ INVERT", gz.x + 12, gz.y - 8);
    ctx.restore();

    // 6. Upgrade Terminal
    const ut = this.upgradeTerminal;
    ctx.save();
    // Brass boiler casing
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(ut.x, ut.y, ut.w, ut.h);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.strokeRect(ut.x, ut.y, ut.w, ut.h);

    // Glowing CRT/Brass display
    ctx.fillStyle = '#112211';
    ctx.fillRect(ut.x + 8, ut.y + 8, ut.w - 16, 26);
    ctx.strokeStyle = '#2ecc71';
    ctx.strokeRect(ut.x + 8, ut.y + 8, ut.w - 16, 26);
    ctx.fillStyle = '#2ecc71';
    ctx.font = 'bold 8px monospace';
    ctx.fillText("UPGRADE", ut.x + 14, ut.y + 24);

    // Lever & Valves
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(ut.x + ut.w / 2, ut.y + 48, 6, 0, Math.PI * 2);
    ctx.fill();

    // Prompt
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.fillText("[E] PATENT UPGRADES", ut.x - 22, ut.y - 8);
    ctx.restore();

    // 7. Bureaucratic Triplicate Door
    const d = this.door;
    ctx.save();
    const doorSlideY = d.y - (d.openProgress * (d.h - 10));
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(d.x, doorSlideY, d.w, d.h);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.strokeRect(d.x, doorSlideY, d.w, d.h);

    // Door Stamps & Locks
    for (let i = 0; i < 3; i++) {
      const sy = doorSlideY + 25 + i * 40;
      ctx.fillStyle = i < d.stampsDone ? '#27ae60' : '#e74c3c';
      ctx.beginPath();
      ctx.arc(d.x + d.w / 2, sy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Stamp text / checkmark
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(i < d.stampsDone ? "✓" : (i + 1), d.x + d.w / 2 - 3, sy + 3);
    }

    if (!d.isOpen) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 10px "Courier New", monospace';
      ctx.fillText(`[E] STAMP FORM (${d.stampsDone}/3)`, d.x - 55, d.y - 12);
    }
    ctx.restore();

    // 8. Royal Office Goal Pedestal
    const g = this.goal;
    ctx.save();
    // Victorian Arch & Pedestal
    ctx.fillStyle = '#2c1e0e';
    ctx.fillRect(g.x, g.y, g.w, g.h);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;
    ctx.strokeRect(g.x, g.y, g.w, g.h);

    // Plaque
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(g.x + 8, g.y + 12, g.w - 16, 24);
    ctx.fillStyle = '#110b05';
    ctx.font = 'bold 9px "Cinzel", serif';
    ctx.fillText("ROYAL OFFICE", g.x + 12, g.y + 27);

    // Pedestal Socket
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(g.x + g.w / 2, g.y + 54, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.stroke();

    // If gear delivered, draw it proudly inside the socket!
    if (g.delivered) {
      ctx.save();
      ctx.translate(g.x + g.w / 2, g.y + 54);
      ctx.rotate(Date.now() * 0.002);
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b8860b';
      ctx.stroke();
      ctx.restore();
    } else {
      // Bouncing yellow arrow indicating deliver here
      const bounce = Math.sin(Date.now() * 0.006) * 6;
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(g.x + g.w / 2, g.y - 20 + bounce);
      ctx.lineTo(g.x + g.w / 2 - 10, g.y - 35 + bounce);
      ctx.lineTo(g.x + g.w / 2 + 10, g.y - 35 + bounce);
      ctx.closePath();
      ctx.fill();
      ctx.font = 'bold 10px monospace';
      ctx.fillText("INSERT GEAR", g.x + 10, g.y - 42 + bounce);
    }
    ctx.restore();

    // 9. Tutorial & Flavor Signs
    this.signs.forEach(s => {
      ctx.save();
      // Wooden/brass post
      ctx.fillStyle = '#4a2f0f';
      ctx.fillRect(s.x + 12, s.y + 22, 6, 45);

      // Signboard
      ctx.fillStyle = 'rgba(253, 246, 227, 0.95)';
      ctx.strokeStyle = '#b8860b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(s.x - 30, s.y - 15, 160, 42, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#8b5a2b';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(s.title, s.x - 22, s.y - 2);

      ctx.fillStyle = '#22150a';
      ctx.font = '8px monospace';
      // Simple wrap
      const words = s.text.split(' ');
      let line1 = words.slice(0, 5).join(' ');
      let line2 = words.slice(5).join(' ');
      ctx.fillText(line1, s.x - 24, s.y + 11);
      if (line2) ctx.fillText(line2.slice(0, 32), s.x - 24, s.y + 22);

      ctx.restore();
    });

    ctx.restore();
  }
}

window.Level = Level;
