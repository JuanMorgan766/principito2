import { ExtraPersonaje } from "./ExtraPersonaje.js";

export class Mikasa extends ExtraPersonaje {
  constructor(x, y) {
    super(x, y, 82, 146, "Mikasa", { speed: 300, jumpForce: 635 });
  }

  drawCharacterPixels(context, pose) {
    const { x, y } = this;
    const sway = pose.legBack / 2;
    // Chaqueta corta, bufanda roja y correajes claros del equipo de maniobras.
    this.pixelOutline(context, x + 17, y + 60, 49, 49, "#815538");
    this.pixelRect(context, x + 22, y + 65, 39, 36, "#a66c45");
    this.pixelRect(context, x + 23, y + 70, 12, 25, "#c1875b");
    this.pixelRect(context, x + 47, y + 67, 6, 34, "#744a37");
    this.pixelRect(context, x + 20, y + 64, 11, 7, "#476b55");
    this.pixelRect(context, x + 51, y + 64, 10, 7, "#476b55");
    this.pixelRect(context, x + 23, y + 81, 38, 5, "#dfd4c2");
    this.pixelRect(context, x + 30, y + 84, 5, 23, "#e8dfcf");
    this.pixelRect(context, x + 49, y + 84, 5, 23, "#e8dfcf");
    this.pixelRect(context, x + 17, y + 103, 50, 8, "#cfc7b8");
    this.pixelOutline(context, x + 20, y + 109 + pose.legBack, 18, 29, "#e1ddd2");
    this.pixelOutline(context, x + 45, y + 109 + pose.legFront, 18, 29, "#e1ddd2");
    this.pixelRect(context, x + 24, y + 117 + pose.legBack, 10, 14, "#b9b8b4");
    this.pixelRect(context, x + 49, y + 117 + pose.legFront, 10, 14, "#b9b8b4");
    this.pixelOutline(context, x + 15, y + 133 + pose.legBack, 28, 12, "#452c2c");
    this.pixelOutline(context, x + 42, y + 133 + pose.legFront, 28, 12, "#452c2c");
    this.pixelRect(context, x + 20, y + 138 + pose.legBack, 18, 2, "#8d6255");
    this.pixelRect(context, x + 47, y + 138 + pose.legFront, 18, 2, "#8d6255");
    this.pixelOutline(context, x + 17, y + 16, 47, 46, "#d39173");
    this.pixelRect(context, x + 22, y + 22, 37, 32, "#f0c2a3");
    this.pixelRect(context, x + 14, y + 11, 53, 24, "#20232c");
    this.pixelRect(context, x + 12, y + 22, 15, 35, "#292a34");
    this.pixelRect(context, x + 17, y + 35, 10, 24, "#3a2530");
    this.pixelRect(context, x + 53, y + 25, 12, 31, "#282832");
    this.pixelRect(context, x + 28, y + 33, 9, 9, "#f0dfcf");
    this.pixelRect(context, x + 47, y + 33, 9, 9, "#f0dfcf");
    this.pixelRect(context, x + 31, y + 35, 4, 6, "#263044");
    this.pixelRect(context, x + 50, y + 35, 4, 6, "#263044");
    this.pixelRect(context, x + 32, y + 35, 2, 2, "#ffffff");
    this.pixelRect(context, x + 51, y + 35, 2, 2, "#ffffff");
    this.pixelRect(context, x + 26, y + 45, 28, 12, "#a43749");
    this.pixelRect(context, x + 30, y + 47, 21, 6, "#d4545c");
    this.pixelRect(context, x + 31, y + 55, 7, 9, "#9d3343");
    this.pixelOutline(context, x + 61, y + 76 + pose.arm, pose.attack ? 19 : 13, 14, "#a66c45");
    this.pixelRect(context, x + 73, y + 80 + pose.arm, 10, 8, "#edbba0");
    this.pixelOutline(context, x + 4, y + 78 - pose.arm, 18, 14, "#a66c45");
  }

  drawAttackFlash(context) {
    this.pixelRect(context, this.x + 76, this.y + 67, 7, 8, "#d7efff");
    this.pixelRect(context, this.x + 83, this.y + 62, 4, 18, "#d7efff");
  }
}
