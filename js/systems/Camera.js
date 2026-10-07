export class Camera {
  constructor(viewportWidth, worldWidth) {
    this.viewportWidth = viewportWidth;
    this.worldWidth = worldWidth;
    this.x = 0;
  }

  follow(entity) {
    const desiredX = entity.x + entity.width / 2 - this.viewportWidth / 2;
    const maxX = Math.max(0, this.worldWidth - this.viewportWidth);

    this.x = Math.max(0, Math.min(desiredX, maxX));
  }

  worldToScreenX(worldX) {
    return worldX - this.x;
  }

  screenToWorldX(screenX) {
    return screenX + this.x;
  }
}
