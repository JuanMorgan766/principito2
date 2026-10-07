import { Nivel } from "./Nivel.js";

export class Nivel2 extends Nivel {
  constructor() {
    super(2, "Capítulo 2 — Planeta del Zorro", "zorro", 3600);
    this.setZones([
      this.createZone({
        id: "sendero-del-zorro",
        title: "Capítulo 2 — Sendero del Zorro",
        theme: "zorro",
        worldWidth: 3600,
        spawn: { x: 115, y: 492 },
        platforms: [[0, 640, 3600, 80, "#795936"], [280, 535, 180], [620, 455, 170], [950, 520, 200], [1300, 425, 190], [1630, 500, 175], [1940, 410, 220], [2300, 515, 180], [2630, 440, 210], [3040, 510, 220]],
        stars: [[350, 495], [680, 415], [1010, 480], [1360, 385], [1690, 460], [2010, 370], [2370, 475], [2700, 400], [3110, 470]],
        enemies: [[850, 580, 790, 930, "serpiente"], [1510, 580, 1450, 1600, "serpiente"], [2210, 580, 2150, 2300, "serpiente"], [2920, 450, 2850, 3180, "serpiente"]],
        zoneExit: { x: 3375, y: 505, width: 90, height: 135, targetZone: 1, label: "Arco de marea" },
      }),
      this.createZone({
        id: "jardines-sumergidos",
        title: "Capítulo 2 — Jardines sumergidos",
        theme: "submarino",
        worldWidth: 3800,
        spawn: { x: 120, y: 365 },
        platforms: [[180, 525, 210, 22, "#3f6574"], [500, 405, 180, 24, "#456d79"], [840, 515, 230, 24, "#3b626f"], [1220, 375, 200, 24, "#456d79"], [1580, 495, 220, 24, "#3b626f"], [1960, 395, 230, 24, "#456d79"], [2350, 520, 210, 24, "#3b626f"], [2720, 430, 230, 24, "#456d79"], [3050, 540, 750, 90, "#92784f"]],
        stars: [[260, 465], [560, 345], [910, 455], [1280, 315], [1640, 435], [2020, 335], [2410, 460], [2780, 370], [3190, 475], [3530, 415]],
        enemies: [[740, 335, 650, 980, "acuatico"], [1450, 435, 1370, 1680, "acuatico"], [2110, 300, 2010, 2320, "acuatico"], [2630, 355, 2560, 2860, "acuatico"]],
        waterExit: { x: 3055, y: 340, width: 100, height: 195, label: "Superficie" },
        goal: { x: 3580, y: 405, width: 90, height: 135, label: "Sendero de estrellas" },
      }),
    ]);
  }
}
