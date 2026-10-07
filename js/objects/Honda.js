export class Honda {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.initialX = x;
    this.initialY = y;
    this.width = 40;
    this.height = 44;
    this.active = true;
  }

  collect() { this.active = false; }

  reset() { this.x = this.initialX; this.y = this.initialY; this.active = true; }

  draw(context) {
    if (!this.active) return;
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    context.save();
    context.translate(centerX, centerY);
    context.shadowColor = "#f6cb7a";
    context.shadowBlur = 16;
    context.strokeStyle = "#6b3e2e";
    context.lineWidth = 7;
    context.beginPath();
    context.moveTo(-12, 13);
    context.quadraticCurveTo(0, -18, 12, 13);
    context.stroke();
    context.strokeStyle = "#e2a35d";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(-12, 13);
    context.quadraticCurveTo(0, -18, 12, 13);
    context.stroke();
    context.fillStyle = "#fff1bd";
    context.font = "bold 15px Arial";
    context.textAlign = "center";
    context.fillText("HONDA", 0, 31);
    context.restore();
  }
}
