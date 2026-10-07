export class Entity {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocityY = 0;
  }

  moveHorizontally(direction, speed, deltaTime, minX, maxX) {
    const nextX = this.x + direction * speed * deltaTime;
    this.x = Math.max(minX, Math.min(nextX, maxX));
  }

  applyGravity(gravity, deltaTime) {
    this.velocityY += gravity * deltaTime;
  }

  moveVertically(deltaTime) {
    this.y += this.velocityY * deltaTime;
  }
}
