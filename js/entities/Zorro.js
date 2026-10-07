import { Entity } from "./Entity.js";

export class Zorro extends Entity {
  constructor(x, y) {
    super(x, y, 74, 48);
    this.speed = 180;
    this.warning = false;
    this.routeHint = "";
    this.animationTime = 0;
  }

  update(deltaTime, player, enemies) {
    const desiredDistance = 125;
    const distance = player.x - this.x;
    if (Math.abs(distance) > desiredDistance) {
      this.x += Math.sign(distance) * Math.min(Math.abs(distance) - desiredDistance, this.speed * deltaTime);
    }
    const targetY = player.y + player.height - this.height;
    this.y += (targetY - this.y) * Math.min(1, deltaTime * 5);
    this.warning = enemies.some((enemy) => enemy.active && Math.abs(enemy.x - player.x) < 250);
    this.animationTime += deltaTime;
  }

  draw(context) {
    context.save();
    context.translate(this.x, this.y + Math.sin(this.animationTime * 5) * 1.5);
    context.fillStyle = "rgb(21 24 32 / 26%)"; context.fillRect(3, 44, 66, 5);
    context.fillStyle = "#4d2c24"; context.fillRect(10, 18, 49, 27); context.fillRect(4, 30, 19, 13);
    context.fillStyle = "#d46a32"; context.fillRect(14, 20, 44, 22); context.fillRect(5, 32, 17, 8);
    context.fillStyle = "#ef9d4c"; context.fillRect(20, 21, 24, 8);
    context.fillStyle = "#d46a32"; context.fillRect(10, 3, 10, 20); context.fillRect(48, 5, 12, 18);
    context.fillStyle = "#fff1d6"; context.fillRect(51, 27, 15, 10); context.fillRect(25, 37, 18, 6);
    context.fillStyle = "#38251d"; context.fillRect(59, 25, 4, 4);
    context.fillStyle = "#1e2432"; context.fillRect(66, 28, 4, 4);
    context.fillStyle = "#8f3e2d"; context.fillRect(0, 40, 7, 4);
    context.restore();
    if (this.warning) {
      context.fillStyle = "#fde68a";
      context.font = "bold 24px Arial";
      context.fillText("!", this.x + 34, this.y - 8);
    }
    if (this.routeHint) {
      context.fillStyle = "#ffe48a";
      context.fillRect(this.x + 31, this.y - 24, 5, 14);
      context.fillRect(this.x + 25, this.y - 17, 17, 5);
    }
  }
}
