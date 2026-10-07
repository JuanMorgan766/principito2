import { Personaje } from "./Personaje.js";

export class Isabela extends Personaje {
  constructor(x, y) {
    super(x, y, 78, 142, "Isabela", { speed: 300, jumpForce: 640 });
  }

  draw(context) {
    const centerX = this.x + this.width / 2;
    const pose = this.getPixelPose();
    context.save();
    context.imageSmoothingEnabled = false;
    if (this.invulnerabilityTime > 0 && Math.floor(this.invulnerabilityTime * 12) % 2 === 0) context.globalAlpha = 0.45;
    this.drawPixelShadow(context, centerX, this.y + this.height - 4, 48);
    context.translate(centerX, this.y + pose.bob + pose.crouch);
    context.scale(this.facing, pose.hurt ? 0.96 : 1);
    context.translate(-centerX, -this.y);
    this.drawJetpackEffect(context);
    this.drawWaterEffect(context);
    this.drawHairBackPixels(context, pose);
    this.drawLegsPixels(context, pose);
    this.drawClothesPixels(context, pose);
    this.drawFacePixels(context);
    if (pose.attack) this.drawAttackFlash(context);
    this.drawSword(context);
    this.drawSling(context);
    context.restore();
  }

  drawHairBackPixels(context, pose) {
    const { x, y } = this;
    const sway = pose.legBack / 2;
    this.pixelOutline(context, x + 10, y + 23, 53, 77, "#43252c");
    this.pixelRect(context, x + 8, y + 47 + sway, 16, 48, "#2a1a23");
    this.pixelRect(context, x + 12, y + 58 + sway, 12, 36, "#6d3034");
    this.pixelRect(context, x + 17, y + 70 + sway, 8, 23, "#a74a40");
    this.pixelRect(context, x + 51, y + 46, 14, 42, "#3a2029");
    this.pixelRect(context, x + 54, y + 61, 9, 27, "#813a3a");
  }

  drawLegsPixels(context, pose) {
    const { x, y } = this;
    this.pixelOutline(context, x + 17, y + 103 + pose.legBack, 20, 33, "#383946");
    this.pixelOutline(context, x + 43, y + 103 + pose.legFront, 20, 33, "#383946");
    this.pixelRect(context, x + 21, y + 109 + pose.legBack, 11, 14, "#5b5d68");
    this.pixelRect(context, x + 47, y + 109 + pose.legFront, 11, 14, "#5b5d68");
    this.pixelRect(context, x + 22, y + 115 + pose.legBack, 9, 8, "#292b36");
    this.pixelRect(context, x + 48, y + 115 + pose.legFront, 9, 8, "#292b36");
    this.pixelOutline(context, x + 9, y + 129 + pose.legBack, 31, 12, "#e8e9e8");
    this.pixelOutline(context, x + 39, y + 129 + pose.legFront, 31, 12, "#e8e9e8");
    this.pixelRect(context, x + 14, y + 133 + pose.legBack, 20, 3, "#4d5060");
    this.pixelRect(context, x + 44, y + 133 + pose.legFront, 20, 3, "#4d5060");
  }

  drawClothesPixels(context, pose) {
    const { x, y } = this;
    this.pixelOutline(context, x + 14, y + 58, 52, 51, "#2d2f3a");
    this.pixelRect(context, x + 19, y + 63, 42, 39, "#444752");
    this.pixelRect(context, x + 22, y + 66, 13, 30, "#5c5e68");
    this.pixelRect(context, x + 37, y + 63, 4, 40, "#7b7d87");
    this.pixelRect(context, x + 18, y + 82, 45, 4, "#252733");
    this.pixelRect(context, x + 16, y + 69, 7, 29, "#20222e");
    this.pixelRect(context, x + 58, y + 69, 7, 29, "#20222e");
    this.pixelOutline(context, x + 62, y + 77 + pose.arm, pose.attack ? 18 : 12, 14, "#353743");
    this.pixelRect(context, x + 70, y + 82 + pose.arm, pose.attack ? 13 : 7, 8, "#edb79d");
    this.pixelRect(context, x + 18, y + 97, 13, 5, "#2d303b");
    this.pixelRect(context, x + 49, y + 97, 13, 5, "#2d303b");
  }

  drawFacePixels(context) {
    const { x, y } = this;
    this.pixelOutline(context, x + 16, y + 17, 47, 45, "#f0b99f");
    this.pixelRect(context, x + 21, y + 23, 37, 32, "#f4c4aa");
    this.pixelRect(context, x + 14, y + 12, 51, 18, "#291a22");
    this.pixelRect(context, x + 12, y + 20, 12, 34, "#341d25");
    this.pixelRect(context, x + 18, y + 13, 11, 10, "#4d2529");
    this.pixelRect(context, x + 29, y + 9, 15, 14, "#4a2529");
    this.pixelRect(context, x + 45, y + 11, 16, 14, "#4a2529");
    this.pixelRect(context, x + 19, y + 25, 9, 13, "#34202a");
    this.pixelRect(context, x + 30, y + 35, 5, 6, "#273044");
    this.pixelRect(context, x + 50, y + 35, 5, 6, "#273044");
    this.pixelRect(context, x + 31, y + 35, 2, 2, "#ffffff");
    this.pixelRect(context, x + 51, y + 35, 2, 2, "#ffffff");
    this.pixelRect(context, x + 38, y + 47, 11, 3, "#b65360");
    this.pixelRect(context, x + 41, y + 50, 5, 2, "#b65360");
    this.pixelRect(context, x + 17, y + 58, 9, 18, "#7e3637");
  }

  drawAttackFlash(context) {
    this.pixelRect(context, this.x + 69, this.y + 70, 7, 8, "#fff6b8");
    this.pixelRect(context, this.x + 76, this.y + 65, 5, 18, "#fff6b8");
  }
}
