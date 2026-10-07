import { ExtraPersonaje } from "./ExtraPersonaje.js";

export class ErenTitan extends ExtraPersonaje {
  constructor(x, y) {
    super(x, y, 102, 158, "Eren Titan", { speed: 260, jumpForce: 600 });
  }

  drawCharacterPixels(context, pose) {
    const { x, y } = this;
    const armShift = pose.arm;
    // Silueta original de titán: hombros amplios, melena larga y ojos verde brillante.
    this.pixelOutline(context, x + 8, y + 54, 86, 58, "#55443a", 5);
    this.pixelRect(context, x + 14, y + 60, 74, 43, "#b28d68");
    this.pixelRect(context, x + 18, y + 63, 17, 34, "#d5b18a");
    this.pixelRect(context, x + 63, y + 62, 19, 35, "#8d6d53");
    this.pixelRect(context, x + 38, y + 62, 24, 38, "#c09b76");
    this.pixelRect(context, x + 31, y + 85, 40, 18, "#a77e60");
    this.pixelRect(context, x + 39, y + 96, 23, 13, "#775846");
    this.pixelRect(context, x + 18, y + 104, 29, 12, "#a78060");
    this.pixelRect(context, x + 56, y + 104, 29, 12, "#a78060");
    this.pixelRect(context, x + 11, y + 64 + armShift, 16, 48, "#b28d68");
    this.pixelRect(context, x + 4, y + 97 + armShift, 21, 18, "#987354");
    this.pixelRect(context, x + 75, y + 64 - armShift, 16, 48, "#9a7557");
    this.pixelRect(context, x + 77, y + 97 - armShift, 21, 18, "#80614b");
    this.pixelRect(context, x + 28, y + 112 + pose.legBack, 19, 32, "#a27e5e");
    this.pixelRect(context, x + 56, y + 112 + pose.legFront, 19, 32, "#bb9873");
    this.pixelRect(context, x + 23, y + 137 + pose.legBack, 25, 12, "#8b6c52");
    this.pixelRect(context, x + 54, y + 137 + pose.legFront, 25, 12, "#9b795b");
    this.pixelRect(context, x + 19, y + 147 + pose.legBack, 32, 9, "#624b3a");
    this.pixelRect(context, x + 51, y + 147 + pose.legFront, 32, 9, "#624b3a");
    this.pixelOutline(context, x + 29, y + 14, 46, 50, "#745643", 4);
    this.pixelRect(context, x + 34, y + 21, 36, 35, "#c39c77");
    this.pixelRect(context, x + 25, y + 22, 14, 29, "#46332e");
    this.pixelRect(context, x + 67, y + 22, 14, 28, "#3a2b29");
    this.pixelRect(context, x + 24, y + 39, 12, 29, "#30252a");
    this.pixelRect(context, x + 71, y + 39, 12, 30, "#30252a");
    this.pixelRect(context, x + 30, y + 10, 14, 18, "#392b2a");
    this.pixelRect(context, x + 48, y + 7, 15, 19, "#392b2a");
    this.pixelRect(context, x + 66, y + 11, 14, 19, "#392b2a");
    this.pixelRect(context, x + 38, y + 33, 12, 5, "#49dc72");
    this.pixelRect(context, x + 59, y + 33, 12, 5, "#49dc72");
    this.pixelRect(context, x + 42, y + 34, 4, 3, "#c4ffd1");
    this.pixelRect(context, x + 63, y + 34, 4, 3, "#c4ffd1");
    this.pixelRect(context, x + 43, y + 45, 22, 4, "#5e392f");
    this.pixelRect(context, x + 43, y + 49, 22, 7, "#ede0c7");
    this.pixelRect(context, x + 47, y + 49, 3, 5, "#4e3832");
    this.pixelRect(context, x + 57, y + 49, 3, 5, "#4e3832");
  }

  drawAttackFlash(context) {
    this.pixelRect(context, this.x + 88, this.y + 66, 8, 10, "#8aff9b");
    this.pixelRect(context, this.x + 96, this.y + 59, 5, 22, "#8aff9b");
  }
}
