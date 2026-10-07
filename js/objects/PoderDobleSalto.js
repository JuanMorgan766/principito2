export class PoderDobleSalto {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 36;
    this.height = 46;
    this.active = true;
  }

  collect() {
    this.active = false;
  }

  draw(context) {
    if (!this.active) {
      return;
    }

    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    context.save();
    context.shadowColor = "#fde68a";
    context.shadowBlur = 24;
    const orb = context.createRadialGradient(centerX - 5, centerY - 7, 2, centerX, centerY, 20);
    orb.addColorStop(0, "#ffffff");
    orb.addColorStop(0.5, "#fef3c7");
    orb.addColorStop(1, "#f5bc56");
    context.fillStyle = orb;
    context.beginPath();
    context.arc(centerX, centerY, 17, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = "#b96520";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(centerX - 8, centerY + 6);
    context.lineTo(centerX, centerY - 8);
    context.lineTo(centerX + 8, centerY + 6);
    context.stroke();
    context.restore();
  }
}
