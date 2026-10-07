import { ExtraPersonaje } from "./ExtraPersonaje.js";

export class KanyeWest extends ExtraPersonaje {
  constructor(x, y) {
    super(x, y, 86, 146, "Kanye West", { speed: 288, jumpForce: 625 });
  }

  drawCharacterPixels(context, pose) {
    const { x, y } = this;
    this.pixelOutline(context, x + 16, y + 61, 55, 49, "#192943");
    this.pixelRect(context, x + 21, y + 66, 45, 36, "#f17527");
    this.pixelRect(context, x + 21, y + 70, 45, 7, "#244f84");
    this.pixelRect(context, x + 21, y + 83, 45, 7, "#244f84");
    this.pixelRect(context, x + 21, y + 96, 45, 6, "#244f84");
    this.pixelRect(context, x + 22, y + 64, 43, 5, "#e6e1d3");
    this.pixelRect(context, x + 39, y + 62, 8, 12, "#ede8d8");
    this.pixelRect(context, x + 41, y + 72, 3, 18, "#e3ba43");
    this.pixelRect(context, x + 37, y + 88, 11, 8, "#f7d45d");
    this.pixelRect(context, x + 24, y + 108, 40, 7, "#d5b88e");
    this.pixelOutline(context, x + 21, y + 111 + pose.legBack, 19, 28, "#263a5b");
    this.pixelOutline(context, x + 49, y + 111 + pose.legFront, 19, 28, "#263a5b");
    this.pixelRect(context, x + 25, y + 117 + pose.legBack, 11, 15, "#3b5274");
    this.pixelRect(context, x + 53, y + 117 + pose.legFront, 11, 15, "#3b5274");
    this.pixelOutline(context, x + 14, y + 134 + pose.legBack, 31, 12, "#e6e5dd");
    this.pixelOutline(context, x + 43, y + 134 + pose.legFront, 31, 12, "#e6e5dd");
    this.pixelRect(context, x + 20, y + 139 + pose.legBack, 20, 2, "#64738b");
    this.pixelRect(context, x + 49, y + 139 + pose.legFront, 20, 2, "#64738b");
    this.pixelOutline(context, x + 18, y + 16, 49, 47, "#774832");
    this.pixelRect(context, x + 23, y + 23, 39, 33, "#9c6040");
    this.pixelRect(context, x + 17, y + 13, 49, 20, "#201d20");
    this.pixelRect(context, x + 22, y + 10, 37, 10, "#302323");
    this.pixelRect(context, x + 20, y + 30, 8, 7, "#392924");
    this.pixelRect(context, x + 30, y + 35, 5, 6, "#171c29");
    this.pixelRect(context, x + 51, y + 35, 5, 6, "#171c29");
    this.pixelRect(context, x + 40, y + 46, 11, 4, "#693a36");
    this.pixelOutline(context, x + 65, y + 78 + pose.arm, pose.attack ? 20 : 13, 14, "#f17527");
    this.pixelRect(context, x + 77, y + 82 + pose.arm, 9, 8, "#9c6040");
    this.pixelOutline(context, x + 3, y + 78 - pose.arm, 19, 14, "#f17527");
  }

  drawAttackFlash(context) {
    this.pixelRect(context, this.x + 78, this.y + 69, 7, 8, "#ffe56e");
    this.pixelRect(context, this.x + 84, this.y + 64, 4, 18, "#ffe56e");
  }
}
