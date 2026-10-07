export class JefeFinal {
  constructor(x, floorY, arenaWidth, difficulty = "normal") {
    this.x = x;
    this.floorY = floorY;
    this.y = floorY - 170;
    this.baseY = this.y;
    this.width = 184;
    this.height = 170;
    this.minX = 340;
    this.maxX = arenaWidth - 260;
    this.direction = -1;
    this.speed = 74;
    this.maxHealth = { facil: 3, normal: 5, dificil: 10 }[difficulty] ?? 5;
    this.health = this.maxHealth;
    this.state = "patrol";
    this.patternIndex = 0;
    this.stateTime = 1.15;
    this.vulnerableTime = 0;
    this.stunTime = 0;
    this.stunImmunity = 0;
    this.leapVelocity = 0;
    this.animationTime = 0;
    this.hazards = [];
    this.lastWindowHit = false;
    this.isDefeated = false;
  }

  update(deltaTime, player) {
    this.animationTime += deltaTime;
    this.vulnerableTime = Math.max(0, this.vulnerableTime - deltaTime);
    this.stunImmunity = Math.max(0, this.stunImmunity - deltaTime);
    this.hazards = this.hazards.filter((hazard) => hazard.active);
    this.hazards.forEach((hazard) => {
      hazard.x += hazard.direction * hazard.speed * deltaTime;
      hazard.life -= deltaTime;
      if (hazard.life <= 0 || hazard.x < 0 || hazard.x > this.maxX + this.width) hazard.active = false;
    });
    if (this.isDefeated) return;
    if (this.stunTime > 0) {
      this.stunTime = Math.max(0, this.stunTime - deltaTime);
      if (this.stunTime === 0) this.state = "recover";
      return;
    }

    if (this.state === "patrol") {
      const towardPlayer = Math.sign(player.x + player.width / 2 - (this.x + this.width / 2));
      if (towardPlayer) this.direction = towardPlayer;
      const phase = this.phase;
      this.x += this.direction * this.speed * (phase === 2 ? 1.18 : 1) * deltaTime;
      if (this.x < this.minX || this.x > this.maxX) this.direction *= -1;
      this.stateTime -= deltaTime;
      if (this.stateTime <= 0) {
        this.state = "windup";
        this.stateTime = 0.72;
        this.currentPattern = this.patternIndex % 3;
        this.patternIndex += 1;
      }
      return;
    }

    if (this.state === "windup") {
      this.stateTime -= deltaTime;
      if (this.stateTime <= 0) this.startPattern(player);
      return;
    }

    if (this.state === "dash") {
      this.x += this.direction * 410 * deltaTime;
      this.x = Math.max(this.minX, Math.min(this.x, this.maxX));
      this.stateTime -= deltaTime;
      if (this.stateTime <= 0) this.openVulnerability();
      return;
    }

    if (this.state === "leap") {
      this.y += this.leapVelocity * deltaTime;
      this.leapVelocity += 1380 * deltaTime;
      if (this.y >= this.baseY) {
        this.y = this.baseY;
        this.leapVelocity = 0;
        this.spawnShockwaves();
        this.openVulnerability();
      }
      return;
    }

    if (this.state === "blast") {
      this.stateTime -= deltaTime;
      if (this.stateTime <= 0) this.openVulnerability();
      return;
    }

    if (this.state === "recover") {
      if (this.vulnerableTime <= 0) {
        this.state = "patrol";
        this.stateTime = Math.max(0.65, 1.5 - this.phase * 0.2);
      }
    }
  }

  get phase() {
    const healthRatio = this.health / this.maxHealth;
    return healthRatio > 0.66 ? 0 : healthRatio > 0.33 ? 1 : 2;
  }

  startPattern(player) {
    if (this.currentPattern === 0) {
      this.direction = Math.sign(player.x + player.width / 2 - (this.x + this.width / 2)) || this.direction;
      this.state = "dash";
      this.stateTime = 0.78;
    } else if (this.currentPattern === 1) {
      this.state = "leap";
      this.leapVelocity = -560 - this.phase * 65;
    } else {
      this.state = "blast";
      this.stateTime = 0.62;
    }
  }

  openVulnerability() {
    this.state = "recover";
    this.vulnerableTime = Math.max(1.3, 2.1 - this.phase * 0.25);
    this.lastWindowHit = false;
  }

  spawnShockwaves() {
    for (const direction of [-1, 1]) {
      this.hazards.push({ x: this.x + this.width / 2, y: this.floorY - 30, width: 42, height: 30, direction, speed: 220 + this.phase * 35, life: 2.3, active: true });
    }
  }

  getWeakPoint() {
    return { x: this.x + 64, y: this.y + 8, width: 56, height: 26 };
  }

  getAttackBoxes() {
    const boxes = [...this.hazards];
    if (this.state === "dash") boxes.push({ x: this.x + 18, y: this.y + 32, width: this.width - 36, height: this.height - 34 });
    if (this.state === "blast" && this.stateTime < 0.32) boxes.push({ x: this.x - 118, y: this.floorY - 142, width: this.width + 236, height: 142 });
    return boxes;
  }

  stun(duration, immunity) {
    if (this.isDefeated || this.stunImmunity > 0 || this.stunTime > 0) return false;
    this.stunTime = duration;
    this.stunImmunity = immunity;
    this.state = "stunned";
    return true;
  }

  takeStompHit() {
    if (!this.vulnerableTime || this.lastWindowHit || this.isDefeated) return false;
    this.health = Math.max(0, this.health - 1);
    this.lastWindowHit = true;
    this.vulnerableTime = 0;
    if (this.health === 0) {
      this.isDefeated = true;
      this.state = "defeated";
    } else {
      this.state = "recover";
      this.stateTime = Math.max(0.9, 1.3 - this.phase * 0.1);
    }
    return true;
  }

  draw(context) {
    if (this.isDefeated) return;
    context.save();
    context.translate(this.x, Math.round(this.y));
    if (this.stunTime > 0 && Math.floor(this.animationTime * 14) % 2 === 0) context.globalAlpha = 0.58;
    const body = this.phase === 2 ? "#63394f" : this.phase === 1 ? "#51436e" : "#3e496f";
    context.fillStyle = "rgb(9 13 30 / 35%)"; context.fillRect(13, this.height - 2, this.width - 26, 10);
    context.fillStyle = "#222944"; context.fillRect(18, 56, this.width - 36, 98);
    context.fillStyle = body; context.fillRect(26, 52, this.width - 52, 88);
    context.fillStyle = "#8c7895"; context.fillRect(37, 66, 22, 48); context.fillRect(this.width - 59, 66, 22, 48);
    context.fillStyle = "#c2a5a0"; context.fillRect(52, 36, this.width - 104, 24);
    context.fillStyle = "#34314d"; context.fillRect(45, 8, this.width - 90, 52);
    context.fillStyle = "#937b92"; context.fillRect(55, 16, this.width - 110, 34);
    context.fillStyle = "#211e36"; context.fillRect(62, 30, 12, 9); context.fillRect(this.width - 74, 30, 12, 9);
    context.fillStyle = this.vulnerableTime > 0 ? "#fff2a4" : "#dd8e77";
    context.fillRect(83, 37, 18, 7); context.fillRect(this.width - 101, 37, 18, 7);
    context.fillStyle = this.vulnerableTime > 0 ? "#fff29a" : "#675776";
    context.fillRect(this.width / 2 - 15, 61, 30, 18);
    context.fillStyle = this.vulnerableTime > 0 ? "#fff7cf" : "#9e8391";
    context.fillRect(this.width / 2 - 7, 65, 14, 10);
    context.fillStyle = "#2d3049"; context.fillRect(36, 136, 45, 27); context.fillRect(this.width - 81, 136, 45, 27);
    context.fillStyle = "#baa078"; context.fillRect(23, 157, 63, 11); context.fillRect(this.width - 86, 157, 63, 11);
    if (this.state === "windup" || this.state === "blast") {
      context.fillStyle = "rgb(255 227 148 / 40%)"; context.fillRect(-18, this.height - 10, this.width + 36, 10);
    }
    context.restore();
    this.hazards.forEach((hazard) => {
      context.fillStyle = "#ecb86d"; context.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
      context.fillStyle = "#fff0a3"; context.fillRect(hazard.x + 7, hazard.y + 5, hazard.width - 14, 5);
      context.fillStyle = "#563d55"; context.fillRect(hazard.x + 5, hazard.y + 23, hazard.width - 10, 7);
    });
  }
}
