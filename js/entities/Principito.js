import { Personaje } from "./Personaje.js";

export class Principito extends Personaje {
  constructor(x, y) {
    super(x, y, 84, 148, "Principito");
  }

  draw(context) {
    const centerX = this.x + this.width / 2;
    const pose = this.getPixelPose();
    context.save();
    context.imageSmoothingEnabled = false;
    if (this.invulnerabilityTime > 0 && Math.floor(this.invulnerabilityTime * 12) % 2 === 0) context.globalAlpha = 0.45;
    this.drawPixelShadow(context, centerX, this.y + this.height - 4, 52);
    context.translate(centerX, this.y + pose.bob + pose.crouch);
    context.scale(this.facing, pose.hurt ? 0.96 : 1);
    context.translate(-centerX, -this.y);
    this.drawJetpackEffect(context);
    this.drawWaterEffect(context);
    this.drawCapePixels(context, pose);
    this.drawLegsPixels(context, pose);
    this.drawCoatPixels(context, pose);
    this.drawHeadPixels(context);
    if (pose.attack) this.drawAttackFlash(context);
    this.drawSword(context);
    this.drawSling(context);
    context.restore();
  }

  drawCapePixels(context, pose) {
    const { x, y } = this;
    const sway = pose.legBack / 2;
    this.pixelRect(context, x + 8, y + 61, 16, 50, "#20253a");
    this.pixelRect(context, x + 4, y + 68 + sway, 12, 34, "#6a2039");
    this.pixelRect(context, x, y + 77 + sway, 12, 24, "#9d354b");
    this.pixelRect(context, x + 4, y + 73 + sway, 8, 19, "#df6370");
    this.pixelRect(context, x + 12, y + 61, 8, 42, "#b63850");
  }

  drawLegsPixels(context, pose) {
    const { x, y } = this;
    this.pixelOutline(context, x + 20, y + 103 + pose.legBack, 19, 34, "#3d5573");
    this.pixelOutline(context, x + 47, y + 103 + pose.legFront, 19, 34, "#3d5573");
    this.pixelRect(context, x + 24, y + 109 + pose.legBack, 11, 17, "#6e91aa");
    this.pixelRect(context, x + 51, y + 109 + pose.legFront, 11, 17, "#6e91aa");
    this.pixelOutline(context, x + 12, y + 130 + pose.legBack, 31, 13, "#273247");
    this.pixelOutline(context, x + 42, y + 130 + pose.legFront, 31, 13, "#273247");
    this.pixelRect(context, x + 18, y + 135 + pose.legBack, 17, 3, "#d6e7e6");
    this.pixelRect(context, x + 48, y + 135 + pose.legFront, 17, 3, "#d6e7e6");
  }

  drawCoatPixels(context, pose) {
    const { x, y } = this;
    this.pixelOutline(context, x + 15, y + 59, 55, 52, "#3b6f96");
    this.pixelRect(context, x + 20, y + 64, 45, 38, "#5d94bd");
    this.pixelRect(context, x + 24, y + 68, 12, 31, "#78acd0");
    this.pixelRect(context, x + 39, y + 64, 5, 41, "#d5e8e5");
    this.pixelRect(context, x + 15, y + 62, 14, 9, "#e1bb4e");
    this.pixelRect(context, x + 56, y + 62, 14, 9, "#e1bb4e");
    this.pixelRect(context, x + 17, y + 64, 8, 4, "#ffe38a");
    this.pixelRect(context, x + 60, y + 64, 7, 4, "#ffe38a");
    this.pixelRect(context, x + 52, y + 76, 5, 5, "#f4cf58");
    this.pixelRect(context, x + 52, y + 90, 5, 5, "#f4cf58");
    const armY = y + 76 + pose.arm;
    this.pixelOutline(context, x + 67, armY, pose.attack ? 21 : 13, 15, "#527ea2");
    this.pixelRect(context, x + 76, armY + 5, pose.attack ? 14 : 7, 8, "#f3c29e");
  }

  drawHeadPixels(context) {
    const { x, y } = this;
    this.pixelOutline(context, x + 17, y + 16, 49, 45, "#f1bf9b");
    this.pixelRect(context, x + 22, y + 23, 39, 31, "#f8d0ad");
    this.pixelRect(context, x + 18, y + 12, 49, 17, "#e5b94d");
    this.pixelRect(context, x + 14, y + 19, 12, 22, "#f0c756");
    this.pixelRect(context, x + 58, y + 16, 12, 22, "#f0c756");
    this.pixelRect(context, x + 24, y + 9, 12, 12, "#f8d166");
    this.pixelRect(context, x + 38, y + 7, 13, 14, "#f8d166");
    this.pixelRect(context, x + 52, y + 10, 12, 13, "#f8d166");
    this.pixelRect(context, x + 30, y + 35, 5, 6, "#26364a");
    this.pixelRect(context, x + 51, y + 35, 5, 6, "#26364a");
    this.pixelRect(context, x + 31, y + 35, 2, 2, "#ffffff");
    this.pixelRect(context, x + 52, y + 35, 2, 2, "#ffffff");
    this.pixelRect(context, x + 38, y + 47, 12, 3, "#bb6462");
    this.pixelRect(context, x + 42, y + 50, 5, 2, "#bb6462");
  }

  drawAttackFlash(context) {
    this.pixelRect(context, this.x + 74, this.y + 70, 8, 8, "#fff6b8");
    this.pixelRect(context, this.x + 82, this.y + 65, 5, 18, "#fff6b8");
  }
}
