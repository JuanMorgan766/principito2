import { Espada } from "../objects/Espada.js";
import { Nivel } from "./Nivel.js";

export class Nivel3 extends Nivel {
  constructor() {
    super(3, "Capítulo 3 — Planeta Final", "final", 2300);
    this.enemiesDefeated = 0;
    this.doubleJumpUnlockKills = 3;
    this.doubleJumpUnlocked = false;
    this.setZones([
      this.createZone({
        id: "sendero-del-umbral",
        title: "Capítulo 3 — Sendero del umbral",
        theme: "final",
        worldWidth: 2300,
        spawn: { x: 115, y: 492 },
        platforms: [[0, 640, 2300, 80, "#3d374f"], [250, 535, 160], [540, 440, 170], [860, 525, 150], [1150, 410, 160], [1480, 510, 170], [1800, 405, 170], [2050, 520, 180]],
        stars: [[300, 495], [585, 400], [910, 485], [1200, 370], [1530, 470], [1850, 365], [2110, 480]],
        enemies: [[760, 580, 650, 840, "serpiente"], [1060, 350, 1030, 1200, "baobab"], [1380, 450, 1330, 1510, "serpiente"], [1710, 340, 1670, 1840, "baobab"]],
        properties: { sword: new Espada(575, 570), zoneExit: { x: 2170, y: 505, width: 90, height: 135, targetZone: 1, label: "Portal de obsidiana" }, scenery: "umbral" },
      }),
      this.createZone({
        id: "ruinas-estelares",
        title: "Capítulo 3 — Ruinas estelares",
        theme: "final",
        worldWidth: 2100,
        spawn: { x: 105, y: 492 },
        platforms: [[0, 640, 2100, 80, "#3d374f"], [220, 535, 160], [520, 435, 180], [850, 520, 160], [1160, 395, 190], [1510, 500, 180], [1810, 420, 190]],
        stars: [[280, 495], [580, 390], [910, 480], [1220, 350], [1570, 460], [1870, 375]],
        enemies: [[440, 580, 390, 570, "serpiente"], [790, 460, 740, 940, "baobab"], [1080, 580, 1010, 1210, "serpiente"], [1450, 440, 1390, 1600, "baobab"], [1740, 580, 1680, 1900, "serpiente"]],
        properties: { zoneExit: { x: 1980, y: 495, width: 90, height: 145, targetZone: 2, label: "Arena" }, scenery: "ruinas" },
      }),
      this.createZone({
        id: "arena-del-guardian",
        title: "Capítulo 3 — Arena del guardián",
        theme: "arena",
        worldWidth: 1280,
        spawn: { x: 100, y: 492 },
        platforms: [[0, 640, 1280, 80, "#3d374f"], [250, 530, 150, 28, "#4f4964"], [880, 530, 150, 28, "#4f4964"]],
        stars: [],
        enemies: [],
        properties: { bossArena: true, bossSpawn: { x: 770, y: 470 }, scenery: "arena" },
      }),
    ]);
  }
}
