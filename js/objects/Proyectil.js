export class Proyectil {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.width = 16;
    this.height = 16;
    this.direction = direction;
    this.speed = 720;
    this.life = 1.2;
    this.active = true;
  }

  update(deltaTime) {
    this.x += this.direction * this.speed * deltaTime;
    this.life -= deltaTime;
    if (this.life <= 0) this.active = false;
  }

  draw(context) {
    if (!this.active) return;
    context.save();
    context.fillStyle = "#3d2d2d";
    context.fillRect(this.x, this.y, this.width, this.height);
    context.fillStyle = "#b8b1a4";
    context.fillRect(this.x + 3, this.y + 3, 10, 10);
    context.fillStyle = "#f5e5c3";
    context.fillRect(this.x + 5, this.y + 4, 4, 4);
    context.restore();
  }
}
