import { PoderDobleSalto } from "../objects/PoderDobleSalto.js";
import { Honda } from "../objects/Honda.js";
import { Nivel } from "./Nivel.js";

export class Nivel1 extends Nivel {
  constructor() {
    super(1, "Capítulo 1 — Jardín de los planetas", "jardin", 5000);
    const ground = [[0, 640, 5000, 80, "#315f53"]];
    this.setZones([
      this.createZone({
        id: "jardin",
        title: "Capítulo 1 — Jardín de los planetas",
        theme: "jardin",
        worldWidth: 5000,
        spawn: { x: 115, y: 492 },
        platforms: [...ground, [250, 540, 190], [570, 455, 200], [900, 530, 220], [1260, 470, 250], [1660, 540, 180], [1990, 435, 230], [2380, 515, 240], [2800, 445, 210], [3180, 520, 210], [3540, 440, 220], [3900, 520, 220], [4250, 455, 250], [4620, 520, 210]],
        stars: [[320, 500], [645, 415], [980, 490], [1360, 430], [1730, 500], [2070, 395], [2460, 475], [2860, 405], [3240, 480], [3620, 400], [3980, 480], [4340, 415], [4690, 480]],
        enemies: [[1080, 580, 980, 1180, "baobab"], [1320, 395, 1280, 1470, "baobab"], [2700, 580, 2640, 2820, "baobab"], [3975, 460, 3930, 4100, "baobab"]],
        properties: {
          doubleJumpPower: new PoderDobleSalto(735, 397),
          sling: new Honda(1540, 474),
          tuberia: { x: 4750, y: 492, width: 110, height: 148 },
          scenery: "jardin-templos",
        },
      }),
      this.createZone({
        id: "aerea",
        title: "Capítulo 1 — Cielos del jardín",
        theme: "cielo-estelar",
        worldWidth: 3600,
        spawn: { x: 120, y: 350 },
        platforms: [[300, 510, 190, 30, "#607b85"], [670, 420, 170, 30, "#687e8b"], [1040, 535, 190, 30, "#55727f"], [1430, 400, 190, 30, "#687e8b"], [1840, 500, 210, 30, "#55727f"], [2260, 410, 190, 30, "#687e8b"], [2660, 525, 190, 30, "#55727f"], [3080, 420, 210, 30, "#687e8b"]],
        stars: [[370, 465], [735, 375], [1105, 485], [1490, 355], [1910, 445], [2320, 365], [2720, 475], [3150, 375], [3450, 290]],
        enemies: [[910, 445, 820, 1120, "aereo"], [1700, 350, 1580, 1940, "aereo"], [2520, 390, 2400, 2780, "aereo"], [3160, 300, 3020, 3370, "aereo"]],
        goal: { x: 3440, y: 460, width: 90, height: 135, label: "Salida estelar" },
        properties: { scenery: "cielo-estelar", jetpack: true },
      }),
    ]);
  }
}
