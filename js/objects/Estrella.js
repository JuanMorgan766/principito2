export class Estrella {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
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
    const glow = context.createRadialGradient(centerX, centerY, 2, centerX, centerY, 28);
    glow.addColorStop(0, "rgb(255 248 167 / 68%)");
    glow.addColorStop(1, "rgb(255 248 167 / 0%)");
    context.fillStyle = glow;
    context.beginPath();
    context.arc(centerX, centerY, 28, 0, Math.PI * 2);
    context.fill();
    const starGradient = context.createLinearGradient(centerX, this.y, centerX, this.y + this.height);
    starGradient.addColorStop(0, "#fffbd0");
    starGradient.addColorStop(0.55, "#f9dc61");
    starGradient.addColorStop(1, "#e6a72e");
    context.fillStyle = starGradient;
    context.strokeStyle = "#b87520";
    context.lineWidth = 2;
    context.beginPath();

    for (let point = 0; point < 10; point += 1) {
      const angle = -Math.PI / 2 + (Math.PI * point) / 5;
      const radius = point % 2 === 0 ? 15 : 6.5;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      if (point === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }

    context.closePath();
    context.fill();
    context.stroke();
    context.fillStyle = "rgb(255 255 255 / 72%)";
    context.beginPath();
    context.arc(centerX - 4, centerY - 5, 3, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
}
