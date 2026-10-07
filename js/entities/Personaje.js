import { Entity } from "./Entity.js";

export class Personaje extends Entity {
  constructor(x, y, width, height, name, options = {}) {
    super(x, y, width, height);
    this.name = name;
    this.speed = options.speed ?? 280;
    this.gravity = options.gravity ?? 1600;
    this.jumpForce = options.jumpForce ?? 620;
    this.isOnGround = false;
    this.maxJumps = 1;
    this.jumpsUsed = 0;
    this.hasDoubleJump = false;
    this.maxLives = 3;
    this.lives = this.maxLives;
    this.invulnerabilityTime = 0;
    this.facing = 1;
    this.hasSword = false;
    this.hasSling = false;
    this.isJetpackActive = false;
    this.movementMode = "NORMAL";
    this.jetpackFuel = 100;
    this.jetpackFuelMax = 100;
    this.jetpackFuelLimited = false;
    this.attackCooldown = 0;
    this.attackTime = 0;
    this.previousX = x;
    this.previousY = y;
    this.state = "IDLE";
    this.animationTime = 0;
  }

  update(deltaTime, input, worldWidth, platforms) {
    const direction = input.getHorizontalDirection();
    const previousX = this.x;
    const previousY = this.y;
    this.previousX = previousX;
    this.previousY = previousY;
    this.invulnerabilityTime = Math.max(0, this.invulnerabilityTime - deltaTime);
    this.attackTime = Math.max(0, this.attackTime - deltaTime);
    this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
    this.animationTime += deltaTime;

    if (direction !== 0) {
      this.facing = direction;
    }

    const swimming = this.movementMode === "SWIMMING";
    this.moveHorizontally(direction, this.speed * (swimming ? 0.7 : 1), deltaTime, 0, worldWidth - this.width);
    const jumped = swimming ? this.trySwimStroke(input) : this.movementMode === "JETPACK" ? (input.consumeJump(), false) : this.tryJump(input);
    const attacked = this.tryAttack(input);
    if (this.movementMode === "JETPACK") this.updateJetpackFlight(deltaTime, input);
    else if (swimming) this.updateSwimming(deltaTime, input);
    else this.applyGravity(this.gravity, deltaTime);
    this.moveVertically(deltaTime);
    this.resolvePlatformCollisions(platforms, previousX, previousY);
    if (this.movementMode === "JETPACK") {
      this.y = Math.max(72, this.y);
      if (this.isOnGround && this.jetpackFuelLimited) this.jetpackFuel = Math.min(this.jetpackFuelMax, this.jetpackFuel + 45 * deltaTime);
    } else if (swimming) {
      this.y = Math.max(72, Math.min(this.y, 720 - this.height));
    }
    this.updateState(direction);
    return { jumped, attacked };
  }

  updateState(direction) {
    if (this.movementMode === "JETPACK") this.state = "JETPACK";
    else if (this.movementMode === "SWIMMING") this.state = "SWIM";
    else if (this.attackTime > 0) this.state = "ATTACK";
    else if (!this.isOnGround) this.state = this.velocityY < 0 ? "JUMP" : "FALL";
    else this.state = direction === 0 ? "IDLE" : "RUN";
  }

  tryJump(input) {
    if (input.consumeJump() && this.jumpsUsed < this.maxJumps) {
      this.velocityY = -this.jumpForce;
      this.isOnGround = false;
      this.jumpsUsed += 1;
      return true;
    }
    return false;
  }

  tryAttack(input) {
    if ((this.hasSword || this.hasSling) && input.consumeAttack() && this.attackCooldown === 0) {
      this.attackTime = 0.24;
      this.attackCooldown = this.hasSling ? 0.38 : 0.24;
      return this.hasSword ? "sword" : "sling";
    }
    return null;
  }

  updateJetpackFlight(deltaTime, input) {
    const verticalDirection = input.getVerticalDirection();
    const canBoost = verticalDirection < 0 && (!this.jetpackFuelLimited || this.jetpackFuel > 0);
    const lift = canBoost ? -1550 : verticalDirection > 0 ? 700 : 0;
    if (canBoost && this.jetpackFuelLimited) this.jetpackFuel = Math.max(0, this.jetpackFuel - 34 * deltaTime);
    this.velocityY += (this.gravity * 0.22 + lift) * deltaTime;
    this.velocityY = Math.max(-470, Math.min(this.velocityY, 390));
  }

  trySwimStroke(input) {
    if (!input.consumeJump()) return false;
    this.velocityY = Math.min(this.velocityY, -330);
    this.isOnGround = false;
    return true;
  }

  updateSwimming(deltaTime, input) {
    const verticalDirection = input.getVerticalDirection() > 0 ? 1 : 0;
    this.velocityY += (this.gravity * 0.35 + verticalDirection * 260) * deltaTime;
    this.velocityY = Math.max(-360, Math.min(this.velocityY, 250));
  }

  getAttackHitbox() {
    if (this.attackTime <= 0) return null;
    return {
      x: this.facing > 0 ? this.x + this.width - 2 : this.x - 62,
      y: this.y + 42,
      width: 64,
      height: 58,
    };
  }

  takeDamage() {
    if (this.invulnerabilityTime > 0 || this.lives <= 0) return false;
    this.lives -= 1;
    this.invulnerabilityTime = 1.2;
    this.velocityY = 0;
    this.state = "HURT";
    return true;
  }

  enableDoubleJump() {
    this.hasDoubleJump = true;
    this.maxJumps = 2;
  }

  resetDoubleJump() {
    this.hasDoubleJump = false;
    this.maxJumps = 1;
    this.jumpsUsed = 0;
  }

  equipSword() {
    this.hasSword = true;
  }

  equipSling() { this.hasSling = true; }

  removeSling() { this.hasSling = false; }

  activateJetpack() {
    this.isJetpackActive = true;
    this.movementMode = "JETPACK";
    this.velocityY = -120;
    this.jumpsUsed = 0;
  }

  deactivateJetpack() {
    this.isJetpackActive = false;
    this.movementMode = "NORMAL";
    this.jetpackFuel = this.jetpackFuelMax;
  }

  activateSwimming() {
    this.isJetpackActive = false;
    this.movementMode = "SWIMMING";
    this.isOnGround = false;
  }

  deactivateSwimming() {
    if (this.movementMode !== "SWIMMING") return;
    this.movementMode = "NORMAL";
    this.velocityY = Math.min(this.velocityY, 100);
    this.jumpsUsed = 0;
    this.isOnGround = false;
  }

  respawn(x, y) {
    this.x = x;
    this.y = y;
    this.velocityY = 0;
    this.isOnGround = false;
    this.jumpsUsed = 0;
    this.previousX = x;
    this.previousY = y;
  }

  resolvePlatformCollisions(platforms, previousX, previousY) {
    this.isOnGround = false;
    for (const platform of platforms) {
      const overlapsHorizontally = this.x < platform.x + platform.width && this.x + this.width > platform.x;
      const previousBottom = previousY + this.height;
      const currentBottom = this.y + this.height;
      const platformBottom = platform.y + platform.height;
      if (overlapsHorizontally && this.velocityY >= 0 && previousBottom <= platform.y && currentBottom >= platform.y) {
        this.y = platform.y - this.height;
        this.velocityY = 0;
        this.isOnGround = true;
        this.jumpsUsed = 0;
        continue;
      }
      if (overlapsHorizontally && this.velocityY < 0 && previousY >= platformBottom && this.y <= platformBottom) {
        this.y = platformBottom;
        this.velocityY = 0;
        continue;
      }
      const overlapsVertically = this.y < platformBottom && currentBottom > platform.y;
      const previousRight = previousX + this.width;
      const currentRight = this.x + this.width;
      if (overlapsVertically && previousRight <= platform.x && currentRight >= platform.x) this.x = platform.x - this.width;
      else if (overlapsVertically && previousX >= platform.x + platform.width && this.x <= platform.x + platform.width) this.x = platform.x + platform.width;
    }
  }

  drawSword(context) {
    if (!this.hasSword) return;
    const handX = this.facing > 0 ? this.x + this.width - 6 : this.x + 6;
    const direction = this.facing;
    context.save();
    context.strokeStyle = this.attackTime > 0 ? "#fff7bf" : "#d7e7ff";
    context.lineWidth = this.attackTime > 0 ? 6 : 4;
    context.beginPath();
    context.moveTo(handX, this.y + 82);
    context.lineTo(handX + direction * 48, this.y + 47);
    context.stroke();
    context.strokeStyle = "#d4a72c";
    context.lineWidth = 6;
    context.beginPath();
    context.moveTo(handX - direction * 8, this.y + 78);
    context.lineTo(handX + direction * 8, this.y + 94);
    context.stroke();
    context.restore();
  }

  drawSling(context) {
    if (!this.hasSling) return;
    const handX = this.facing > 0 ? this.x + this.width - 8 : this.x + 8;
    const direction = this.facing;
    context.save();
    context.strokeStyle = "#b87743";
    context.lineWidth = 4;
    context.beginPath();
    context.arc(handX + direction * 9, this.y + 79, 10, 0, Math.PI * 2);
    context.moveTo(handX + direction * 2, this.y + 72);
    context.lineTo(handX + direction * 15, this.y + 91);
    context.stroke();
    context.restore();
  }

  getPixelPose() {
    const runFrame = Math.floor(this.animationTime * 11) % 2;
    const running = this.state === "RUN";
    const swimming = this.state === "SWIM";
    return {
      bob: running ? (runFrame ? -2 : 2) : swimming ? Math.round(Math.sin(this.animationTime * 7) * 2) : Math.sin(this.animationTime * 2),
      legFront: running ? (runFrame ? 7 : -4) : swimming ? (runFrame ? 3 : -2) : 0,
      legBack: running ? (runFrame ? -4 : 7) : swimming ? (runFrame ? -2 : 3) : 0,
      arm: swimming ? Math.round(Math.sin(this.animationTime * 7) * 8) : this.state === "JUMP" ? -8 : this.state === "FALL" ? 7 : running ? (runFrame ? 5 : -3) : 0,
      crouch: this.state === "JUMP" ? -5 : this.state === "FALL" ? 3 : 0,
      attack: this.state === "ATTACK",
      hurt: this.state === "HURT",
    };
  }

  pixelRect(context, x, y, width, height, color) {
    context.fillStyle = color;
    context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
  }

  pixelOutline(context, x, y, width, height, fill, outline = "#182034", border = 4) {
    this.pixelRect(context, x, y, width, height, outline);
    this.pixelRect(context, x + border, y + border, width - border * 2, height - border * 2, fill);
  }

  drawPixelShadow(context, centerX, y, width = 48) {
    this.pixelRect(context, centerX - width / 2, y, width, 5, "rgb(12 17 31 / 35%)");
    this.pixelRect(context, centerX - width / 2 + 7, y - 3, width - 14, 3, "rgb(12 17 31 / 22%)");
  }

  drawJetpackEffect(context) {
    if (this.movementMode !== "JETPACK") return;
    const flicker = Math.floor(this.animationTime * 18) % 2;
    this.pixelRect(context, this.x + 4, this.y + 76, 15, 31, "#27384c");
    this.pixelRect(context, this.x + 7, this.y + 80, 9, 21, "#8ea7b2");
    this.pixelRect(context, this.x + 7, this.y + 103, 9, 8, "#f7b65d");
    this.pixelRect(context, this.x + 9, this.y + 111, 5, flicker ? 11 : 7, "#fff0a6");
    this.pixelRect(context, this.x + 10, this.y + 118 + flicker * 4, 3, 5, "#f07d59");
  }

  drawWaterEffect(context) {
    if (this.movementMode !== "SWIMMING") return;
    const offset = Math.floor(this.animationTime * 7) % 4;
    this.pixelRect(context, this.x - 4, this.y + 82 - offset, 4, 4, "#c5f7e8");
    if (offset % 2 === 0) this.pixelRect(context, this.x + this.width + 2, this.y + 96 - offset, 3, 3, "#8be2d8");
  }
}
