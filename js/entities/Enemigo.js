import { Entity } from "./Entity.js";

export class Enemigo extends Entity {
  constructor(x, y, patrolStart, patrolEnd, type = "baobab") {
    super(x, y, 56, 60);
    this.baseSpeed = 95;
    this.speed = this.baseSpeed;
    this.direction = 1;
    this.patrolStart = patrolStart;
    this.patrolEnd = patrolEnd;
    this.isTouchingPlayer = false;
    this.active = true;
    this.type = type;
    this.animationTime = 0;
    this.evadeCooldown = 0;
    this.evadingTime = 0;
    this.baseY = y;
    this.phase = Math.random() * Math.PI * 2;
  }

  update(deltaTime, projectiles = []) {
    if (!this.active) {
      return;
    }

    this.animationTime += deltaTime;
    this.evadeCooldown = Math.max(0, this.evadeCooldown - deltaTime);
    this.evadingTime = Math.max(0, this.evadingTime - deltaTime);

    const threat = projectiles.find((projectile) => projectile.active
      && Math.sign(projectile.direction) === Math.sign(this.x + this.width / 2 - projectile.x)
      && Math.abs(this.x + this.width / 2 - projectile.x) < 190
      && Math.abs(this.y + this.height / 2 - projectile.y) < 58);
    if (threat && this.evadeCooldown === 0) {
      this.evadingTime = 0.42;
      this.evadeCooldown = 1.15;
      this.direction *= -1;
    }

    if (this.type === "aereo") {
      this.y = this.baseY + Math.sin(this.animationTime * 2.4 + this.phase) * 46;
      if (this.evadingTime > 0) this.y += Math.sin(this.evadingTime * 18) * 25;
      this.x += this.direction * this.speed * 1.25 * deltaTime;
      if (this.x <= this.patrolStart || this.x + this.width >= this.patrolEnd) this.direction *= -1;
      return;
    }

    if (this.type === "acuatico") this.y = this.baseY + Math.sin(this.animationTime * 2.8 + this.phase) * 19;

    if (this.evadingTime > 0) this.y = this.baseY - Math.sin((0.42 - this.evadingTime) / 0.42 * Math.PI) * 28;
    else this.y = this.baseY;

    this.x += this.direction * this.speed * deltaTime;

    if (this.x <= this.patrolStart) {
      this.x = this.patrolStart;
      this.direction = 1;
    } else if (this.x + this.width >= this.patrolEnd) {
      this.x = this.patrolEnd - this.width;
      this.direction = -1;
    }
  }

  draw(context) {
    if (!this.active) {
      return;
    }

    if (this.type === "serpiente") {
      this.drawSnake(context);
      return;
    }

    if (this.type === "aereo") {
      this.drawFlyingEnemy(context);
      return;
    }

    if (this.type === "acuatico") {
      this.drawAquaticEnemy(context);
      return;
    }

    this.drawBaobab(context);
  }

  drawFlyingEnemy(context) {
    context.save();
    context.translate(this.x, this.y + Math.sin(this.animationTime * 5 + this.phase) * 5);
    context.fillStyle = "rgb(8 14 32 / 28%)"; context.fillRect(8, 55, 43, 4);
    context.fillStyle = "#332a52"; context.fillRect(12, 23, 32, 24);
    context.fillStyle = "#8468b0"; context.fillRect(17, 26, 22, 16);
    context.fillStyle = "#c7b2f2"; context.fillRect(3, 16, 14, 11); context.fillRect(42, 16, 14, 11);
    context.fillStyle = "#fce9a8"; context.fillRect(34, 29, 5, 5);
    context.fillStyle = "#1a1930"; context.fillRect(36, 30, 2, 3);
    context.restore();
  }

  drawAquaticEnemy(context) {
    context.save(); context.translate(this.x, this.y);
    context.fillStyle = "rgb(7 22 38 / 30%)"; context.fillRect(5, 50, 48, 6);
    context.fillStyle = "#153c57"; context.fillRect(7, 22, 42, 25);
    context.fillStyle = this.isTouchingPlayer ? "#e27879" : "#37a2a0"; context.fillRect(12, 24, 34, 18);
    context.fillStyle = "#91e1cc"; context.fillRect(18, 26, 16, 5); context.fillRect(44, 28, 12, 6);
    context.fillStyle = "#c9f4dd"; context.fillRect(37, 28, 5, 5);
    context.fillStyle = "#17334a"; context.fillRect(39, 29, 2, 3);
    context.fillStyle = "#296b79"; context.fillRect(2, 20, 11, 8); context.fillRect(18, 44, 16, 6);
    context.restore();
  }

  drawSnake(context) {
    context.save();
    const sway = Math.sin(this.animationTime * 5) * 3;
    context.translate(this.x, this.y + Math.sin(this.animationTime * 4) * 1.5);
    const snakeColor = this.isTouchingPlayer ? "#ef4444" : "#5d8f61";
    context.fillStyle = "rgb(13 25 24 / 25%)"; context.fillRect(5, 52, 46, 5);
    context.fillStyle = "#203a35"; context.fillRect(6, 31, 43, 20);
    context.fillStyle = snakeColor; context.fillRect(10, 34, 38, 13);
    context.fillStyle = "#8fbc6d"; context.fillRect(16, 35, 6, 5); context.fillRect(29, 40, 6, 5); context.fillRect(40, 35, 4, 5);
    context.fillStyle = "#345244"; context.fillRect(8, 25 + sway, 8, 13); context.fillRect(16, 20 + sway, 8, 8); context.fillRect(24, 17 + sway, 8, 7); context.fillRect(32, 23 + sway, 8, 8);
    context.fillStyle = "#fef3c7"; context.fillRect(40, 31, 5, 5);
    context.fillStyle = "#1c2931"; context.fillRect(42, 32, 2, 3);
    context.fillStyle = "#e88c8d"; context.fillRect(48, 42, 8, 3);
    context.restore();
  }

  drawBaobab(context) {
    context.save();
    context.translate(this.x, this.y + Math.sin(this.animationTime * 2.5) * 1.2);
    context.fillStyle = "rgb(16 24 26 / 22%)"; context.fillRect(2, 56, 53, 5);
    context.fillStyle = "#352b2b"; context.fillRect(21, 27, 18, 31);
    context.fillStyle = this.isTouchingPlayer ? "#b94b4b" : "#74473b"; context.fillRect(25, 29, 10, 29);
    context.fillRect(12, 25, 17, 7); context.fillRect(35, 21, 13, 7);
    context.fillStyle = this.isTouchingPlayer ? "#d56e57" : "#58744d";
    for (const [x, y, width, height] of [[7, 18, 21, 17], [20, 9, 21, 22], [37, 15, 17, 21], [1, 30, 18, 13]]) context.fillRect(x, y, width, height);
    context.fillStyle = this.isTouchingPlayer ? "#ee9470" : "#a8b969"; context.fillRect(22, 13, 12, 7); context.fillRect(41, 20, 8, 6); context.fillRect(10, 24, 8, 5);
    context.fillStyle = "rgb(255 235 184 / 65%)"; context.fillRect(28, 19, 4, 4);
    context.restore();
  }
}
