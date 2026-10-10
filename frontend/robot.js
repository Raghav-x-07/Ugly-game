// ============================================================================
// STEAMED HAMS: SIR CLANKSWORTH-v0.1 (Unhelpful Mechanical Assistant)
// Floats nearby, emits sarcastic Victorian engineering wisdom and terrible advice
// ============================================================================

class RobotAssistant {
  constructor() {
    this.x = 80;
    this.y = 300;
    this.targetX = 80;
    this.targetY = 300;
    this.rotorAngle = 0;
    this.bobOffset = 0;
    this.monocleGlint = 0;

    // Dialogue State
    this.currentMessage = "Greetings Engineer! I am Sir Clanksworth-v0.1. I was built to ensure your journey is thoroughly documented, though rarely assisted.";
    this.messageTimer = 8.0;
    this.opacity = 1.0;
    this.history = new Set();

    // Dialogue pools
    this.dialoguePools = {
      start: [
        "Welcome to Shift #4,812. The safety manual was lost in the Great Boiler Fire of 1887.",
        "Your mission is of paramount insignificance: deliver that singular brass cog to the Royal Office.",
        "Remember: any structural integrity failures will be deducted from your pension."
      ],
      move: [
        "Splendid progress! You are now 3 metres farther from the factory entrance.",
        "That movement was remarkably ungraceful. 10 points for mechanical audacity.",
        "Observe how the pistons screech! That is the natural sound of Victorian efficiency."
      ],
      reverse_warn: [
        "ENGINEERING UPDATE: Left now means Emotional Right. Adapt or rupture!",
        "The gearbox has experienced an existential crisis. Your directions have inverted.",
        "A feature, not a malfunction! The Royal Board considers straight lines uninspired."
      ],
      reverse_end: [
        "The gearbox has returned to standard mediocrity.",
        "Controls normalized. Do not get comfortable."
      ],
      steam_low: [
        "Jumping requires steam! Currently your boiler has the thermodynamic vigor of lukewarm tea.",
        "Insufficient bureaucratic pressure. Press [A/D] to build piston pressure!",
        "A magnificent wheeze! Truly, poetry in failed pneumatics."
      ],
      steam_high: [
        "Steam pressure critical! Please remain professionally composed while ticking like a bomb.",
        "The pressure needle is vibrating with unseemly enthusiasm. Press [W] to vent steam!",
        "Warning: The boiler is approaching what engineers euphemistically call 'rapid disassembly'."
      ],
      overheating: [
        "BOILER OVERHEAT! In 5 seconds you shall become a cloud of brass confetti! VENT WITH [W]!",
        "This is fine. Highly elevated temperatures are merely an intense form of warmth!",
        "I calculate a 99.8% probability of involuntary flight if steam is not vented instantly!"
      ],
      vent: [
        "Ah! A fine discharge of scalding industrial smog. The local pigeons will be thrilled.",
        "Pressure relieved! The machine is 4% less likely to detonate this minute."
      ],
      jump_success: [
        "Jumping is a premium mechanical feature. You are currently on the budget trial version.",
        "Look at you, defying gravity for a fleeting 0.8 seconds!",
        "That landing shook three rivets loose. Splendid form."
      ],
      door: [
        "Ah, the Bureaucratic Blast Door! It demands precisely three stamps of compliance.",
        "Government doors do not open for mortals without triplicate approval forms.",
        "Press [E] with conviction! Paperwork waits for no engineer."
      ],
      upgrade: [
        "Ah, the Patent Upgrade Terminal! None of these upgrades work, but they look magnificent.",
        "I strongly endorse the Gold-Plated Knees. Scrap merchants love heavy corpses.",
        "Upgrades installed! The machine feels morally superior, yet mechanically identical."
      ],
      pit_near: [
        "That pit appears bottomless. Let us collect empirical data by not jumping into it.",
        "The Royal Engineering Board recommends falling with greater Victorian poise."
      ],
      idle: [
        "Standing idle burns precious coal. The Ministry frowns upon static incompetence.",
        "Have you tried turning the entire contraption off and striking it with an iron mallet?",
        "Warning: the warning detection apparatus has detected a warning about a missing warning."
      ],
      win: [
        "ASTONISHING! You delivered one gear! The rail network has collapsed, but your contract is fulfilled!",
        "A monumental victory for questionable engineering! The Queen is mildly indifferent."
      ],
      death_steam: [
        "CATASTROPHE! You have transformed into a decorative brass cloud. Press [R] to reassemble.",
        "Boiler rupture confirmed. The incident report has already been forwarded to your widow."
      ],
      death_pit: [
        "Gravitational non-compliance detected. You are now part of the factory floor.",
        "A tragic miscalculation of altitude. Press [R] to resurrect the walking blunder."
      ]
    };
  }

  say(context, force = false) {
    if (!this.dialoguePools[context]) return;
    const pool = this.dialoguePools[context];
    // Find unsaid quote if possible
    const available = pool.filter(q => !this.history.has(q));
    const chosen = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : pool[Math.floor(Math.random() * pool.length)];

    if (force || this.messageTimer <= 1.0 || context.startsWith('death') || context.startsWith('win') || context.startsWith('overheating')) {
      this.currentMessage = chosen;
      this.messageTimer = 6.0;
      this.opacity = 1.0;
      this.history.add(chosen);
      if (this.history.size > 20) this.history.clear();
    }
  }

  update(dt, playerX, playerY) {
    // Hover lazily near player's shoulder with smooth damping
    this.targetX = playerX + 50;
    this.targetY = playerY - 45;

    this.x += (this.targetX - this.x) * 3.5 * dt;
    this.y += (this.targetY - this.y) * 3.5 * dt;

    // Animations
    this.rotorAngle += 22 * dt;
    this.bobOffset = Math.sin(Date.now() * 0.004) * 5;
    this.monocleGlint += dt;

    // Message timer
    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
      if (this.messageTimer < 1.0) {
        this.opacity = Math.max(0, this.messageTimer);
      }
    }
  }

  draw(ctx) {
    const drawX = this.x;
    const drawY = this.y + this.bobOffset;

    ctx.save();

    // 1. Rotor on top
    ctx.save();
    ctx.translate(drawX, drawY - 14);
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(-2, 0, 4, 6);
    // Rotating blade
    ctx.scale(Math.cos(this.rotorAngle), 1);
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3a2410';
    ctx.stroke();
    ctx.restore();

    // 2. Brass Sphere Body
    const grad = ctx.createRadialGradient(drawX - 3, drawY - 3, 2, drawX, drawY, 12);
    grad.addColorStop(0, '#f9e076');
    grad.addColorStop(0.5, '#c59b27');
    grad.addColorStop(1, '#5c4015');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(drawX, drawY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2b1d0c';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Rivets around rim
    ctx.fillStyle = '#ffeaa7';
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const rx = drawX + Math.cos(angle) * 9.5;
      const ry = drawY + Math.sin(angle) * 9.5;
      ctx.fillRect(rx - 1, ry - 1, 2, 2);
    }

    // 3. Monocle Eye
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(drawX + 3, drawY, 4.5, 0, Math.PI * 2);
    ctx.stroke();

    // Glowing cyan optical lens
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(drawX + 3, drawY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#003344';
    ctx.beginPath();
    ctx.arc(drawX + 4, drawY, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Monocle cord
    ctx.strokeStyle = '#daa520';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(drawX + 7, drawY + 2);
    ctx.quadraticCurveTo(drawX + 11, drawY + 10, drawX + 5, drawY + 12);
    ctx.stroke();

    ctx.restore();

    // 4. Speech Bubble in Victorian telegraph ticker style
    if (this.messageTimer > 0 && this.opacity > 0) {
      this.drawSpeechBubble(ctx, drawX, drawY - 25);
    }
  }

  drawSpeechBubble(ctx, bx, by) {
    ctx.save();
    ctx.globalAlpha = this.opacity;

    const maxWidth = 260;
    ctx.font = '11px "Courier New", monospace';
    const words = this.currentMessage.split(' ');
    const lines = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth - 24) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);

    const lineHeight = 14;
    const boxWidth = maxWidth;
    const boxHeight = lines.length * lineHeight + 26;
    const boxX = bx - boxWidth / 2;
    const boxY = by - boxHeight;

    // Vintage parchment bubble with ornate brass border
    ctx.fillStyle = 'rgba(253, 246, 227, 0.95)';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 6);
    ctx.fill();

    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = '#4a2f0f';
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX + 2, boxY + 2, boxWidth - 4, boxHeight - 4);

    // Pointer tail to robot
    ctx.fillStyle = 'rgba(253, 246, 227, 0.95)';
    ctx.beginPath();
    ctx.moveTo(bx - 6, boxY + boxHeight);
    ctx.lineTo(bx + 6, boxY + boxHeight);
    ctx.lineTo(bx, boxY + boxHeight + 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b8860b';
    ctx.stroke();

    // Assistant Name Header
    ctx.fillStyle = '#8b5a2b';
    ctx.font = 'bold 9px "Courier New", monospace';
    ctx.fillText("⚙ SIR CLANKSWORTH [DISPATCH] ⚙", boxX + 8, boxY + 12);

    // Message Text
    ctx.fillStyle = '#1a1005';
    ctx.font = '11px "Courier New", monospace';
    lines.forEach((line, index) => {
      ctx.fillText(line, boxX + 10, boxY + 26 + index * lineHeight);
    });

    ctx.restore();
  }
}

window.RobotAssistant = RobotAssistant;
