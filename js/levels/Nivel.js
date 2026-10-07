import { Enemigo } from "../entities/Enemigo.js";
import { Estrella } from "../objects/Estrella.js";
import { Plataforma } from "../objects/Plataforma.js";

export class Nivel {
  constructor(id, title, theme, worldWidth) {
    this.id = id;
    this.title = title;
    this.theme = theme;
    this.worldWidth = worldWidth;
    this.spawn = { x: 115, y: 492 };
    this.platforms = [];
    this.stars = [];
    this.enemies = [];
    this.goal = null;
    this.doubleJumpPower = null;
    this.sword = null;
    this.rescue = null;
    this.zoneExit = null;
    this.waterExit = null;
    this.bossArena = false;
    this.zones = [];
    this.currentZoneIndex = 0;
  }

  createZone({ id, title, theme, worldWidth, spawn, platforms = [], stars = [], enemies = [], goal = null, ...properties }) {
    return {
      id,
      title,
      theme,
      worldWidth,
      spawn: { ...spawn },
      platforms: platforms.map(([x, y, width, height = 28, color]) => new Plataforma(x, y, width, height, color)),
      stars: stars.map(([x, y], index) => {
        const star = new Estrella(x, y);
        star.id = `campaign:chapter-${this.id}:zone-${id}:star-${index + 1}`;
        return star;
      }),
      enemies: enemies.map(([x, y, patrolStart, patrolEnd, type]) => new Enemigo(x, y, patrolStart, patrolEnd, type)),
      goal,
      ...properties,
    };
  }

  setZones(zones) {
    this.zones = zones;
    this.activateZone(0);
  }

  activateZone(index) {
    const zone = this.zones[index];
    if (!zone) return false;
    this.currentZoneIndex = index;
    this.activeZone = zone;
    this.title = zone.title ?? this.title;
    this.theme = zone.theme ?? this.theme;
    this.worldWidth = zone.worldWidth;
    this.spawn = { ...zone.spawn };
    this.platforms = zone.platforms;
    this.stars = zone.stars;
    this.enemies = zone.enemies;
    this.goal = zone.goal;
    const properties = zone.properties ?? zone;
    this.doubleJumpPower = properties.doubleJumpPower ?? null;
    this.sword = properties.sword ?? null;
    this.sling = properties.sling ?? null;
    this.tuberia = properties.tuberia ?? null;
    this.zoneExit = properties.zoneExit ?? null;
    this.waterExit = properties.waterExit ?? null;
    this.bossArena = properties.bossArena ?? false;
    this.bossSpawn = properties.bossSpawn ?? null;
    this.scenery = properties.scenery ?? null;
    Object.assign(this, zone.properties ?? {});
    return true;
  }

  addPlatform(x, y, width, height = 28, color) {
    this.platforms.push(new Plataforma(x, y, width, height, color));
  }

  addStars(positions) {
    this.stars = positions.map(([x, y]) => new Estrella(x, y));
  }

  addEnemy(x, y, patrolStart, patrolEnd, type) {
    this.enemies.push(new Enemigo(x, y, patrolStart, patrolEnd, type));
  }
}
