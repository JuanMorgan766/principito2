import { Personaje } from "./Personaje.js";

export class ExtraPersonaje extends Personaje {
  constructor(x, y, width, height, name, options = {}) {
    super(x, y, width, height, name, options);
  }

  draw(context) {
    const centerX = this.x + this.width / 2;
    const pose = { ...this.getPixelPose() };
    if (this.state === "VICTORY") {
      pose.arm = -16;
      pose.bob = Math.round(Math.sin(this.animationTime * 8) * 3);
    } else if (this.state === "INTERACTION") {
      pose.arm = 9;
      pose.crouch = 7;
    }
    context.save();
    context.imageSmoothingEnabled = false;
    if (this.invulnerabilityTime > 0 && Math.floor(this.invulnerabilityTime * 12) % 2 === 0) context.globalAlpha = 0.45;
    this.drawPixelShadow(context, centerX, this.y + this.height - 4, this.width * 0.72);
    context.translate(centerX, this.y + pose.bob + pose.crouch);
    context.scale(this.facing, pose.hurt ? 0.96 : 1);
    context.translate(-centerX, -this.y);
    this.drawJetpackEffect(context);
    this.drawWaterEffect(context);
    this.drawCharacterPixels(context, pose);
    if (pose.attack) this.drawAttackFlash(context);
    this.drawSword(context);
    this.drawSling(context);
    context.restore();
  }

  drawCharacterPixels() {
    throw new Error(`${this.name} necesita su propio diseño pixel-art.`);
  }
}
