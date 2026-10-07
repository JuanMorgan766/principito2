export class Plataforma {
  constructor(x, y, width, height, color = "#496b58") {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  getStyle() {
    if (this.color === "#795936") {
      return { top: "#d6a75f", body: "#7c5538", shadow: "#4c302b", detail: "#e7c77d" };
    }

    if (this.color === "#3d374f" || this.color === "#4f4964") {
      return { top: "#9a91ba", body: "#4c4665", shadow: "#28253d", detail: "#c6bcdf" };
    }

    return { top: "#91bb75", body: "#376759", shadow: "#1f4040", detail: "#c8df99" };
  }

  draw(context) {
    const style = this.getStyle();
    const bodyGradient = context.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    bodyGradient.addColorStop(0, style.body);
    bodyGradient.addColorStop(1, style.shadow);

    context.save();
    context.fillStyle = "rgb(0 0 0 / 20%)";
    context.fillRect(this.x + 5, this.y + this.height + 5, this.width, 8);
    context.fillStyle = bodyGradient;
    context.fillRect(this.x, this.y, this.width, this.height);
    context.fillStyle = style.top;
    context.fillRect(this.x, this.y, this.width, 8);
    context.fillStyle = style.detail;
    context.globalAlpha = 0.6;
    context.fillRect(this.x + 4, this.y + 2, this.width - 8, 2);
    context.globalAlpha = 1;

    const detailCount = Math.max(2, Math.floor(this.width / 46));
    for (let index = 0; index < detailCount; index += 1) {
      const detailX = this.x + 18 + index * (this.width - 30) / detailCount;
      const detailY = this.y + 16 + ((index * 19 + this.x) % Math.max(12, this.height - 17));
      context.strokeStyle = "rgb(18 30 36 / 42%)";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(detailX, detailY);
      context.lineTo(detailX - 4, detailY + 7);
      context.lineTo(detailX + 2, detailY + 12);
      context.stroke();
    }

    if (style.top === "#91bb75") {
      context.strokeStyle = "#6eaa68";
      context.lineWidth = 2;
      for (let x = this.x + 10; x < this.x + this.width; x += 18) {
        context.beginPath();
        context.moveTo(x, this.y + 7);
        context.lineTo(x - 3, this.y - 3 - ((x + this.y) % 5));
        context.moveTo(x + 2, this.y + 7);
        context.lineTo(x + 5, this.y - 2);
        context.stroke();
      }
    }

    context.strokeStyle = "rgb(19 29 42 / 58%)";
    context.lineWidth = 2;
    context.strokeRect(this.x, this.y, this.width, this.height);
    context.restore();
  }
}
