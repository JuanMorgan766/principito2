export class Juan {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 92;
    this.height = 176;
  }

  draw(context) {
    const x = this.x; const y = this.y;
    context.save();
    context.fillStyle = "rgb(7 10 23 / 40%)"; context.fillRect(x + 12, y + 169, 70, 8);
    context.fillStyle = "#121520"; context.fillRect(x + 18, y + 92, 25, 64); context.fillRect(x + 48, y + 92, 25, 64);
    context.fillStyle = "#292d39"; context.fillRect(x + 23, y + 98, 14, 47); context.fillRect(x + 53, y + 98, 14, 47);
    context.fillStyle = "#080b13"; context.fillRect(x + 11, y + 148, 39, 22); context.fillRect(x + 43, y + 148, 39, 22);
    context.fillStyle = "#141822"; context.fillRect(x + 9, y + 57, 75, 55); context.fillRect(x, y + 63, 23, 58); context.fillRect(x + 72, y + 64, 20, 56);
    context.fillStyle = "#303541"; context.fillRect(x + 18, y + 63, 56, 39); context.fillRect(x + 7, y + 70, 13, 38); context.fillRect(x + 74, y + 71, 11, 37);
    context.fillStyle = "#d3a58d"; context.fillRect(x + 27, y + 19, 41, 48); context.fillRect(x + 20, y + 34, 9, 18); context.fillRect(x + 66, y + 34, 9, 18);
    context.fillStyle = "#11131c"; context.fillRect(x + 22, y + 8, 47, 14); context.fillRect(x + 17, y + 15, 13, 29); context.fillRect(x + 63, y + 13, 12, 51); context.fillRect(x + 12, y + 42, 13, 47);
    context.fillStyle = "#292d39"; context.fillRect(x + 31, y + 28, 16, 11); context.fillRect(x + 50, y + 28, 15, 11);
    context.fillStyle = "#d2d7e3"; context.fillRect(x + 30, y + 29, 17, 3); context.fillRect(x + 49, y + 29, 17, 3); context.fillRect(x + 46, y + 31, 5, 3);
    context.fillStyle = "#171923"; context.fillRect(x + 36, y + 32, 6, 7); context.fillRect(x + 55, y + 32, 6, 7);
    context.fillStyle = "#a96865"; context.fillRect(x + 43, y + 51, 12, 3);
    context.restore();
  }
}
