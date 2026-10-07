import { ExtraPersonaje } from "./ExtraPersonaje.js";

export class Eren extends ExtraPersonaje {
  constructor(x, y) {
    super(x, y, 84, 148, "Eren", { speed: 286, jumpForce: 625 });
  }

  drawCharacterPixels(context, pose) {
    const { x, y } = this;
    const sway = pose.legBack / 2;
    // Abrigo oscuro y faldones: la silueta larga distingue su aspecto de combate.
    this.pixelOutline(context, x + 16, y + 59, 53, 54, "#171b24");
    this.pixelRect(context, x + 21, y + 64, 43, 39, "#303641");
    this.pixelRect(context, x + 25, y + 66, 33, 34, "#e1ded4");
    this.pixelRect(context, x + 39, y + 65, 7, 40, "#b8b5ab");
    this.pixelRect(context, x + 17, y + 99, 16, 24 + sway, "#222630");
    this.pixelRect(context, x + 52, y + 99 - sway, 16, 24 + sway, "#222630");
    this.pixelRect(context, x + 22, y + 70, 6, 29, "#59606a");
    this.pixelRect(context, x + 58, y + 69, 7, 30, "#20242e");
    this.pixelOutline(context, x + 20, y + 110 + pose.legBack, 18, 27, "#242832");
    this.pixelOutline(context, x + 48, y + 110 + pose.legFront, 18, 27, "#242832");
    this.pixelRect(context, x + 23, y + 117 + pose.legBack, 11, 14, "#424650");
    this.pixelRect(context, x + 51, y + 117 + pose.legFront, 11, 14, "#424650");
    this.pixelOutline(context, x + 14, y + 132 + pose.legBack, 29, 12, "#171b23");
    this.pixelOutline(context, x + 42, y + 132 + pose.legFront, 29, 12, "#171b23");
    this.pixelRect(context, x + 19, y + 137 + pose.legBack, 18, 2, "#9da1a4");
    this.pixelRect(context, x + 47, y + 137 + pose.legFront, 18, 2, "#9da1a4");
    this.pixelOutline(context, x + 18, y + 15, 48, 48, "#d69e78");
    this.pixelRect(context, x + 23, y + 22, 38, 34, "#edbd98");
    this.pixelRect(context, x + 19, y + 13, 46, 17, "#30231f");
    this.pixelRect(context, x + 14, y + 21, 14, 31, "#3a2924");
    this.pixelRect(context, x + 25, y + 9, 13, 11, "#4b3228");
    this.pixelRect(context, x + 41, y + 10, 15, 11, "#4b3228");
    this.pixelRect(context, x + 57, y + 18, 10, 17, "#3a2924");
    this.pixelRect(context, x + 30, y + 34, 5, 6, "#222833");
    this.pixelRect(context, x + 50, y + 34, 5, 6, "#222833");
    this.pixelRect(context, x + 35, y + 47, 13, 3, "#89514c");
    this.pixelOutline(context, x + 63, y + 76 + pose.arm, pose.attack ? 19 : 13, 14, "#343a45");
    this.pixelRect(context, x + 74, y + 80 + pose.arm, 10, 8, "#edbd98");
    this.pixelOutline(context, x + 4, y + 77 - pose.arm, 18, 14, "#292e38");
  }

  drawAttackFlash(context) {
    this.pixelRect(context, this.x + 76, this.y + 68, 7, 8, "#d7efff");
    this.pixelRect(context, this.x + 83, this.y + 63, 4, 18, "#d7efff");
  }
}
