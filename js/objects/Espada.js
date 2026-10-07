export class Espada {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 44;
    this.height = 54;
    this.active = true;
  }

  collect() { this.active = false; }

  draw(context) {
    if (!this.active) return;
    context.save();
    context.translate(this.x + 22, this.y + 27);
    context.shadowColor = "#dbeafe"; context.shadowBlur = 22;
    context.strokeStyle = "#9aaacd"; context.lineWidth = 9;
    context.beginPath(); context.moveTo(-12, 16); context.lineTo(14, -18); context.stroke();
    context.strokeStyle = "#f7fbff"; context.lineWidth = 4;
    context.beginPath(); context.moveTo(-12, 16); context.lineTo(14, -18); context.stroke();
    context.strokeStyle = "#e7b83e"; context.lineWidth = 7;
    context.beginPath(); context.moveTo(-14, -2); context.lineTo(1, 11); context.stroke();
    context.restore();
  }
}
