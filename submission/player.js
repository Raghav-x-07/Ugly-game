// ============================================================================
// STEAMED HAMS: PLAYER STEAM CONTRAPTION
// Procedural Victorian Bipedal Machine carrying a single brass gear
// ============================================================================

class Player {
  constructor(x, y) {
    this.startX = x;
    this.startY = y;
    this.reset(x, y);

    // Upgrades
    this.upgrades = new Set();
  }

  reset(x = this.startX, y = this.startY) {
    this.x = x;
    this.y = y;
    this.width = 44;
    this.height = 62;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1; // 1 = right, -1 = left

    // Physics constants
    this.accel = 340;
    this.maxSpeed = 160;
    this.friction = 0.82;
    this.baseGravity = 720;
    this.isGrounded = false;

    // Steam & Pressure Management
    this.steamPressure = 35; // 0 to 100%
    this.maxPressure = 100;
    this.isOverheating = false;
    this.overheatTimer = 5.0; // 5 seconds to explosion if over 100%
    this.steamVentedTotal = 0;

    // Reversed Direction Gearbox Mechanic
    this.isReversed = false;
    this.reverseTimeLeft = 0;
    this.reverseWarningTime = 0;

    // Animation variables
    this.walkCycle = 0;
    this.gearRotation = 0;
    this.auxGearRotation = 0;
    this.wobble = 0;
    this.pistonCycle = 0;
    this.overheatShake = 0;
    this.smokestackTimer = 0;
    this.footstepTimer = 0;
    this.holdingGear = true;

    // State flags
    this.isDead = false;
    this.deathReason = "";
    this.hasWon = false;
  }

  applyUpgrade(id) {
    this.upgrades.add(id);
  }

  hasUpgrade(id) {
    return this.upgrades.has(id);
  }

  triggerGearboxReversal(duration = 10) {
    this.isReversed = true;
    this.reverseTimeLeft = duration;
    if (window.soundEngine) {
      window.soundEngine.playGearboxShift();
    }
  }

  update(dt, input, level, particles, robot) {
    if (this.isDead || this.hasWon) return;

    // Gravity (modified by Gold-Plated Knees upgrade)
    const gravity = this.hasUpgrade('knees') ? this.baseGravity * 1.55 : this.baseGravity;
    this.vy += gravity * dt;

    // 1. Gearbox Reversal Timer
    if (this.isReversed) {
      this.reverseTimeLeft -= dt;
      if (this.reverseTimeLeft <= 0) {
        this.isReversed = false;
        if (robot) robot.say('reverse_end');
      }
    }

    // 2. Horizontal Movement (with clumsy steam acceleration)
    let moveDir = 0;
    let inputLeft = input.keys['KeyA'] || input.keys['ArrowLeft'];
    let inputRight = input.keys['KeyD'] || input.keys['ArrowRight'];

    if (this.isReversed) {
      // Swapped controls!
      const temp = inputLeft;
      inputLeft = inputRight;
      inputRight = temp;
    }

    if (inputLeft) moveDir -= 1;
    if (inputRight) moveDir += 1;

    if (moveDir !== 0) {
      this.facing = moveDir;
      this.vx += moveDir * this.accel * dt;
      const speedCap = this.hasUpgrade('knees') ? this.maxSpeed * 0.85 : this.maxSpeed;
      this.vx = Math.max(-speedCap, Math.min(speedCap, this.vx));

      // Walking slowly builds steam pressure
      this.steamPressure = Math.min(this.maxPressure, this.steamPressure + 5.5 * dt);

      // Walk cycle animation
      this.walkCycle += dt * 7.5;
      this.pistonCycle += dt * 10;

      // Footstep sound & smoke
      this.footstepTimer -= dt;
      if (this.footstepTimer <= 0 && this.isGrounded) {
        this.footstepTimer = 0.32;
        if (window.soundEngine) {
          window.soundEngine.playClank(this.hasUpgrade('knees'));
        }
        if (this.hasUpgrade('knees')) {
          level.addScreenShake(3.5, 0.15);
        }
      }
    } else {
      this.vx *= Math.pow(this.friction, dt * 60);
      if (Math.abs(this.vx) < 5) this.vx = 0;
    }

    // 3. Steam Venting (Key W)
    if (input.keys['KeyW']) {
      const ventRate = 35 * dt;
      if (this.steamPressure > 5) {
        this.steamPressure = Math.max(0, this.steamPressure - ventRate);
        this.steamVentedTotal += ventRate;

        // Downward steam thrust puff
        const isArtisanal = this.hasUpgrade('premium_steam');
        if (Math.random() < 0.6) {
          particles.spawnSteam(
            this.x + this.width / 2 + (Math.random() * 12 - 6),
            this.y + this.height - 10,
            (Math.random() * 80 - 40) - this.facing * 30,
            Math.random() * 60 + 40,
            isArtisanal
          );
        }

        // Cool down overheat timer
        if (this.isOverheating) {
          this.overheatTimer = Math.min(5.0, this.overheatTimer + dt * 1.8);
          if (this.steamPressure < 90) {
            this.isOverheating = false;
          }
        }

        if (!this.lastVentSound || Date.now() - this.lastVentSound > 350) {
          this.lastVentSound = Date.now();
          if (window.soundEngine) {
            window.soundEngine.playSteamHiss(isArtisanal);
          }
          if (robot) robot.say('vent');
        }
      }
    }

    // 4. The Bureaucratic Jump (Space)
    if (input.justPressed('Space')) {
      if (this.isGrounded) {
        if (this.steamPressure >= 20) {
          // Sufficient steam pressure: Launch!
          const jumpPower = this.hasUpgrade('knees') ? -380 : -420;
          this.vy = jumpPower;
          this.isGrounded = false;
          this.steamPressure -= 20;

          if (window.soundEngine) {
            window.soundEngine.playJump();
          }
          if (robot) robot.say('jump_success');

          // Smoke blast from bottom pistons
          for (let i = 0; i < 8; i++) {
            particles.spawnSteam(
              this.x + this.width / 2 + (Math.random() * 20 - 10),
              this.y + this.height - 5,
              Math.random() * 140 - 70,
              Math.random() * 70 + 40,
              this.hasUpgrade('premium_steam')
            );
          }
        } else {
          // Insufficient pressure: Comical wheeze & stumble!
          this.vy = -70; // Pathetic little hop
          if (window.soundEngine) {
            window.soundEngine.playWheeze();
          }
          if (robot) robot.say('steam_low', true);

          // Tiny pathetic dust puff
          for (let i = 0; i < 3; i++) {
            particles.spawnSmoke(
              this.x + this.width / 2,
              this.y + this.height,
              Math.random() * 20 - 10,
              -10
            );
          }
        }
      }
    }

    // 5. Overheat State Check
    if (this.steamPressure >= 98) {
      if (!this.isOverheating) {
        this.isOverheating = true;
        this.overheatTimer = 5.0;
        if (robot) robot.say('overheating', true);
      }
      this.overheatTimer -= dt;

      // Screen shake and alarm whistles
      level.addScreenShake(2.0, 0.05);
      if (!this.lastKlaxon || Date.now() - this.lastKlaxon > 600) {
        this.lastKlaxon = Date.now();
        if (window.soundEngine) {
          window.soundEngine.playOverheatKlaxon();
        }
      }

      // Catastrophic Boiler Rupture!
      if (this.overheatTimer <= 0) {
        this.die("Catastrophic Boiler Detonation (Failed to vent steam with [W])", particles, level, robot);
        return;
      }
    } else if (this.steamPressure < 90 && this.isOverheating) {
      this.isOverheating = false;
      this.overheatTimer = 5.0;
    }

    // 6. Level Collisions & Movement
    this.x += this.vx * dt;
    level.resolveHorizontalCollision(this);

    this.y += this.vy * dt;
    this.isGrounded = false;
    level.resolveVerticalCollision(this);

    // Hazard checks (Molten pits & death planes)
    if (this.y > level.killY) {
      this.die("Uncontrolled Gravitational Descent into Foundry Slag Pit", particles, level, robot);
      return;
    }

    // 7. Ambient Smokestack & Idle Puffs
    this.smokestackTimer += dt;
    if (this.smokestackTimer > 0.08) {
      this.smokestackTimer = 0;
      const stackX = this.facing > 0 ? this.x + 12 : this.x + this.width - 12;
      const stackY = this.y - 12;
      particles.spawnSmoke(stackX, stackY, -this.vx * 0.2 + (Math.random() * 20 - 10), -50);
    }

    // Rotations & wobbles
    this.gearRotation += dt * 3.5;
    this.auxGearRotation += dt * (this.hasUpgrade('quantum_gear') ? 45 : 4);
    this.wobble = Math.sin(this.walkCycle) * 0.07;
    this.overheatShake = this.isOverheating ? (Math.random() * 4 - 2) : 0;
  }

  die(reason, particles, level, robot) {
    this.isDead = true;
    this.deathReason = reason;

    if (window.soundEngine) {
      window.soundEngine.playFailure();
    }
    level.addScreenShake(12, 0.6);

    // Explode into cogs, brass shrapnel, and giant smoke puff
    for (let i = 0; i < 25; i++) {
      particles.spawnDebris(
        this.x + this.width / 2,
        this.y + this.height / 2,
        (Math.random() - 0.5) * 320,
        (Math.random() - 0.7) * 350,
        ['#d4af37', '#b8860b', '#8b5a2b', '#2f3542'][Math.floor(Math.random() * 4)]
      );
    }
    for (let i = 0; i < 15; i++) {
      particles.spawnSteam(
        this.x + this.width / 2,
        this.y + this.height / 2,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        false
      );
    }

    if (robot) {
      robot.say(reason.includes('Boiler') ? 'death_steam' : 'death_pit', true);
    }
  }

  draw(ctx) {
    if (this.isDead) return;

    ctx.save();
    ctx.translate(this.x + this.width / 2 + this.overheatShake, this.y + this.height / 2);
    ctx.scale(this.facing, 1);
    ctx.rotate(this.wobble);

    // Center coordinates relative to machine
    const hw = this.width / 2;
    const hh = this.height / 2;

    // --- LEGS & PISTONS ---
    const legOffset1 = Math.sin(this.walkCycle) * 12;
    const legOffset2 = -Math.sin(this.walkCycle) * 12;

    // Left (Back) Leg
    ctx.strokeStyle = '#4a3728';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, 8);
    ctx.lineTo(-12 + legOffset1 * 0.4, 22);
    ctx.lineTo(-8 + legOffset1, hh - 2);
    ctx.stroke();

    // Right (Front) Leg with Brass Knee Joint
    ctx.strokeStyle = this.hasUpgrade('knees') ? '#ffd700' : '#8c6239';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(8, 8);
    ctx.lineTo(12 + legOffset2 * 0.4, 22);
    ctx.lineTo(8 + legOffset2, hh - 2);
    ctx.stroke();

    // Knee cap rivet / gold sheen
    ctx.fillStyle = this.hasUpgrade('knees') ? '#fff089' : '#d4af37';
    ctx.beginPath();
    ctx.arc(12 + legOffset2 * 0.4, 22, this.hasUpgrade('knees') ? 5 : 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Iron Feet Stompers
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(4 + legOffset2, hh - 5, 14, 5);
    ctx.fillRect(-14 + legOffset1, hh - 5, 14, 5);

    // --- MAIN BOILER CHASSIS ---
    // Overheat glow
    if (this.isOverheating) {
      ctx.shadowColor = '#ff3838';
      ctx.shadowBlur = 18;
    }

    const boilerGrad = ctx.createRadialGradient(-4, -6, 4, 0, 0, 22);
    if (this.isOverheating) {
      boilerGrad.addColorStop(0, '#ff7675');
      boilerGrad.addColorStop(0.5, '#d63031');
      boilerGrad.addColorStop(1, '#63171b');
    } else {
      boilerGrad.addColorStop(0, '#f39c12');
      boilerGrad.addColorStop(0.4, '#d35400');
      boilerGrad.addColorStop(1, '#5d2c02');
    }

    ctx.fillStyle = boilerGrad;
    ctx.beginPath();
    ctx.arc(0, 2, 21, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3d1e03';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset shadow

    // Rivets around boiler rim
    ctx.fillStyle = '#f1c40f';
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rx = Math.cos(angle) * 17.5;
      const ry = 2 + Math.sin(angle) * 17.5;
      ctx.fillRect(rx - 1, ry - 1, 2.5, 2.5);
    }

    // Mini Pressure Sight Glass on Belly
    ctx.fillStyle = '#111';
    ctx.fillRect(-6, 4, 12, 10);
    ctx.fillStyle = this.steamPressure > 80 ? '#e74c3c' : (this.steamPressure > 40 ? '#f1c40f' : '#2ecc71');
    const fillH = Math.min(8, (this.steamPressure / 100) * 8);
    ctx.fillRect(-5, 13 - fillH, 10, fillH);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1;
    ctx.strokeRect(-6, 4, 12, 10);

    // --- CYCLOPEAN VISOR / MECHANICAL EYE ---
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(8, -4, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Glowing pupil
    ctx.fillStyle = this.isOverheating ? '#ff0055' : '#00f2fe';
    ctx.beginPath();
    ctx.arc(9.5, -4, 3, 0, Math.PI * 2);
    ctx.fill();

    // --- SMOKESTACK ---
    ctx.fillStyle = '#4b4b4b';
    ctx.fillRect(-12, -26, 8, 16);
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(-14, -28, 12, 4); // Brass rim

    // --- INVERTED CUP HOLDER UPGRADE ---
    if (this.hasUpgrade('cup_holder')) {
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(-24, 6);
      ctx.stroke();
      // Upside down teacup
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-24, 10, 5, 0, Math.PI, true);
      ctx.fill();
      ctx.stroke();
      // Drips of tea
      if (Math.random() < 0.25) {
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(-24, 12, 2, 3);
      }
    }

    // --- QUANTUM AUXILIARY GEAR UPGRADE ---
    if (this.hasUpgrade('quantum_gear')) {
      ctx.save();
      ctx.translate(14, -18);
      ctx.rotate(this.auxGearRotation);
      this.drawGear(ctx, 0, 0, 9, 8, '#e67e22');
      ctx.restore();
    }

    // --- MECHANICAL ARM HOLDING THE PRECIOUS BRASS GEAR ---
    if (this.holdingGear) {
      // Jointed Brass Arm
      ctx.strokeStyle = '#b8860b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(2, -14);
      ctx.lineTo(8, -24);
      ctx.lineTo(4, -34);
      ctx.stroke();

      // Mechanical Claw
      ctx.strokeStyle = '#2f3542';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(4, -35, 4, 0, Math.PI, false);
      ctx.stroke();

      // THE SINGLE BRASS GEAR (Mission Objective!)
      ctx.save();
      ctx.translate(4, -36);
      ctx.rotate(this.gearRotation);
      this.drawGear(ctx, 0, 0, 11, 8, '#ffd700');
      ctx.restore();
    }

    // Warning beacon for reversed gearbox
    if (this.isReversed) {
      const flash = Math.sin(Date.now() * 0.015) > 0;
      ctx.fillStyle = flash ? '#ff4757' : '#747d8c';
      ctx.beginPath();
      ctx.arc(0, -22, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f1c40f';
      ctx.stroke();
    }

    ctx.restore();
  }

  drawGear(ctx, gx, gy, radius, teeth, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = '#5a3d1b';
    ctx.lineWidth = 1;

    // Center disc
    ctx.beginPath();
    ctx.arc(gx, gy, radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Teeth
    for (let i = 0; i < teeth; i++) {
      const angle = (i / teeth) * Math.PI * 2;
      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(angle);
      ctx.fillRect(-2, -radius, 4, radius * 0.45);
      ctx.restore();
    }

    // Axle hole
    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.arc(gx, gy, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

window.Player = Player;
