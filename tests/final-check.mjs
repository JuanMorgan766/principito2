import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const noop = () => {};
const storage = new Map();
const renderedText = [];
const documentListeners = new Map();
let fullscreenRequests = 0;
const developerFormListeners = new Map();
const developerButtonListeners = new Map();
const developerInputListeners = new Map();
const developerCodeInput = {
  value: "",
  addEventListener: (name, callback) => developerInputListeners.set(name, callback),
  focus: noop,
  blur: noop,
};
const developerCodeStatus = { textContent: "" };
const developerSubmitButton = { addEventListener: (name, callback) => developerButtonListeners.set(name, callback) };
const developerCodeForm = {
  hidden: true,
  addEventListener: (name, callback) => developerFormListeners.set(name, callback),
  querySelector: () => developerSubmitButton,
  requestSubmit() { developerFormListeners.get("submit")?.({ preventDefault: noop }); },
};
const gradient = { addColorStop: noop };
const context = new Proxy({}, {
  get: (target, key) => {
    if (key === "createLinearGradient" || key === "createRadialGradient") return () => gradient;
    if (key === "measureText") return () => ({ width: 0 });
    if (key === "fillText") return (text) => renderedText.push(String(text));
    return noop;
  },
  set: () => true,
});

globalThis.window = {
  addEventListener: noop,
  matchMedia: (query) => ({ matches: query === "(pointer: coarse)" }),
  AudioContext: class {
    constructor() { this.state = "running"; this.currentTime = 0; this.destination = {}; }
    resume() { return Promise.resolve(); }
    createOscillator() {
      return {
        frequency: { setValueAtTime: noop, exponentialRampToValueAtTime: noop },
        connect: () => ({ connect: noop }), start: noop, stop: noop,
      };
    }
    createGain() {
      return { gain: { setValueAtTime: noop, exponentialRampToValueAtTime: noop }, connect: noop };
    }
  },
};
globalThis.document = {
  addEventListener: (name, callback) => documentListeners.set(name, callback),
  documentElement: { requestFullscreen() { fullscreenRequests += 1; return Promise.resolve(); } },
  fullscreenElement: null,
  querySelector: (selector) => {
    if (selector === ".mobile-controls") return { classList: { toggle: noop } };
    if (selector === ".developer-code" || selector === "#developerCodeForm") return developerCodeForm;
    if (selector === "#developerCodeInput") return developerCodeInput;
    if (selector === "#developerCodeStatus") return developerCodeStatus;
    return null;
  },
  querySelectorAll: () => [],
};
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
};
globalThis.Audio = class {
  constructor() { this.currentTime = 0; }
  play() { return Promise.resolve(); }
  pause() {}
};
globalThis.fetch = async () => ({ ok: false });
globalThis.requestAnimationFrame = noop;
globalThis.Image = class {
  constructor() { this.complete = true; this.naturalWidth = 800; this.naturalHeight = 1200; }
};

const { Game } = await import("../js/Game.js");
const { GameState } = await import("../js/GameState.js");
const { Isabela } = await import("../js/entities/Isabela.js");
const { Principito } = await import("../js/entities/Principito.js");
const { Personaje } = await import("../js/entities/Personaje.js");
const { Eren } = await import("../js/entities/Eren.js");
const { Mikasa } = await import("../js/entities/Mikasa.js");
const { KanyeWest } = await import("../js/entities/KanyeWest.js");
const { ErenTitan } = await import("../js/entities/ErenTitan.js");
const { ProgressionManager } = await import("../js/systems/ProgressionManager.js");
const { AudioManager, EFFECT_FILES, MUSIC_TRACKS } = await import("../js/systems/AudioManager.js");
const { InputManager } = await import("../js/systems/InputManager.js");
const { giftImages } = await import("../js/data/extraContent.js");
const { Nivel1 } = await import("../js/levels/Nivel1.js");
const { Nivel2 } = await import("../js/levels/Nivel2.js");
const { Nivel3 } = await import("../js/levels/Nivel3.js");
const { Nivel4, ZONE_LENGTH } = await import("../js/levels/Nivel4.js");

assert.equal(giftImages.length, 6);
for (const gift of giftImages) {
  const file = await readFile(new URL(`../${gift.src}`, import.meta.url));
  assert.ok(file.length > 0, `${gift.src} should exist and be readable`);
}

// Estructura responsive y rutas de los recursos de audio para la publicación.
const css = await readFile(new URL("../css/style.css", import.meta.url), "utf8");
const gameSource = await readFile(new URL("../js/Game.js", import.meta.url), "utf8");
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
assert.match(css, /@media \(pointer: coarse\) and \(orientation: landscape\)/);
assert.match(css, /@media \(orientation: portrait\)/);
assert.match(css, /html,\s*body\s*\{\s*touch-action: none;/);
assert.match(css, /touch-action: none/);
assert.match(css, /-webkit-user-select: none/);
assert.match(css, /-webkit-touch-callout: none/);
assert.match(css, /data-control="crouch"/);
assert.match(html, /maximum-scale=1\.0, user-scalable=no/);
assert.match(html, /data-control="crouch"/);
assert.match(gameSource, /La aventura para llegar a Neiva/);
assert.doesNotMatch(gameSource, /Una aventura entre planetas/);
assert.equal(Object.keys(MUSIC_TRACKS).length, 5);
assert.ok(MUSIC_TRACKS[4].endsWith("assets/audio/music/nivel-4/nivel-4.mp3"));
assert.equal(Object.keys(EFFECT_FILES).length, 6);
const crouchInput = new InputManager();
crouchInput.handleKeyDown({ key: "ArrowDown", preventDefault: noop });
assert.equal(crouchInput.isCrouching(), true, "ArrowDown activates the arcade crouch input");
crouchInput.handleKeyUp({ key: "ArrowDown" });
assert.equal(crouchInput.isCrouching(), false);
crouchInput.activateTouchControl("crouch");
assert.equal(crouchInput.isCrouching(), true, "The mobile crouch control is supported");
crouchInput.releaseTouchControl("crouch");
assert.equal(crouchInput.isCrouching(), false);
const audioCheck = new AudioManager();
await audioCheck.unlock();
audioCheck.playEffect("jump");
await audioCheck.playMusic(1);
assert.equal(audioCheck.currentTrack, null, "A missing music file must not block the game");

// La progresión adicional cuenta estrellas únicas y persiste cada condición por separado.
const expansionStorage = new Map();
const expansionProgress = new ProgressionManager({
  getItem: (key) => expansionStorage.get(key) ?? null,
  setItem: (key, value) => expansionStorage.set(key, String(value)),
});
expansionProgress.setTotalStars(10);
for (let index = 1; index <= 6; index += 1) expansionProgress.collectStar(`star-${index}`);
assert.equal(expansionProgress.isUnlocked("eren"), false, "Six of ten stars must not unlock Eren");
expansionProgress.collectStar("star-6");
assert.equal(expansionProgress.getStarProgress().obtained, 6, "Repeating a star must not increase global progress");
assert.equal(expansionProgress.isUnlocked("eren"), false);
expansionProgress.collectStar("star-7");
assert.equal(expansionProgress.isUnlocked("eren"), true, "70 percent of unique stars unlocks Eren");
assert.equal(expansionProgress.isUnlocked("erenTitan"), false, "Eren Titan remains locked below 100 percent");
for (let index = 8; index <= 10; index += 1) expansionProgress.collectStar(`star-${index}`);
assert.equal(expansionProgress.isUnlocked("erenTitan"), true, "All unique stars unlock Eren Titan");
assert.deepEqual(expansionProgress.recordChapterComplete(1, "normal"), []);
assert.deepEqual(expansionProgress.recordChapterComplete(2, "normal"), []);
assert.equal(expansionProgress.isUnlocked("mikasa"), false);
assert.deepEqual(expansionProgress.recordChapterComplete(3, "normal"), ["mikasa"]);
assert.deepEqual(expansionProgress.recordChapterComplete(1, "dificil"), []);
assert.deepEqual(expansionProgress.recordChapterComplete(2, "dificil"), []);
assert.equal(expansionProgress.isUnlocked("kanye"), false);
assert.deepEqual(expansionProgress.recordChapterComplete(3, "dificil"), ["kanye"]);
assert.deepEqual(expansionProgress.completeCampaign(), ["extras", "level4"]);
const restoredExpansionProgress = new ProgressionManager({
  getItem: (key) => expansionStorage.get(key) ?? null,
  setItem: (key, value) => expansionStorage.set(key, String(value)),
});
for (const key of ["eren", "erenTitan", "mikasa", "kanye", "extras", "level4"]) {
  assert.equal(restoredExpansionProgress.isUnlocked(key), true, `${key} must persist`);
}

function createCanvas() {
  return {
    width: 1280,
    height: 720,
    getContext: () => context,
    addEventListener: noop,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }),
  };
}

function createGame() {
  const game = new Game(createCanvas());
  const events = [];
  game.audio = {
    playMusic: (name) => events.push(`music:${name}`),
    playEffect: (name) => events.push(name),
    stopMusic: () => events.push("stop"),
    pauseMusic: () => events.push("pause"),
    resumeMusic: () => events.push("resume"),
    unlock: noop,
  };
  return { game, events };
}

function click(game, x, y) {
  game.handleCanvasClick({ clientX: x, clientY: y });
}

// Menú, selección bloqueada/desbloqueada y persistencia.
const { game: menuGame } = createGame();
documentListeners.get("pointerdown")();
assert.equal(fullscreenRequests, 1, "The first phone tap should request fullscreen");
let doubleTapPrevented = false;
const preventSecondTapZoom = documentListeners.get("touchend");
preventSecondTapZoom({ timeStamp: 1000, cancelable: true, preventDefault: noop });
preventSecondTapZoom({ timeStamp: 1200, cancelable: true, preventDefault: () => { doubleTapPrevented = true; } });
assert.equal(doubleTapPrevented, true, "A quick second touch must be prevented from triggering zoom");
let pinchPrevented = false;
const preventTouchZoom = documentListeners.get("touchstart");
preventTouchZoom({ touches: [{}], cancelable: true, preventDefault: () => { pinchPrevented = true; } });
assert.equal(pinchPrevented, true, "A single touch must cancel the browser's default double-tap zoom behavior");
pinchPrevented = false;
preventTouchZoom({ touches: [{}, {}], cancelable: true, preventDefault: () => { pinchPrevented = true; } });
assert.equal(pinchPrevented, true, "Multi-touch gestures must be prevented from zooming the page");
let safariGesturePrevented = false;
documentListeners.get("gesturestart")({ preventDefault: () => { safariGesturePrevented = true; } });
assert.equal(safariGesturePrevented, true, "Safari gesture zoom must be prevented");
click(menuGame, 640, 400);
assert.equal(menuGame.selectedCharacter, "Principito");
click(menuGame, 1060, 214);
assert.equal(menuGame.selectedCharacter, "Principito", "A locked Isabela cannot be selected");
menuGame.render();
assert.ok(renderedText.includes("ISABELA  🔒"), "The initial menu should retain Isabela as the only other character option");
assert.ok(!renderedText.includes("EREN TITAN"), "Extra characters should not be listed in the initial menu");
const { game: extrasLockedGame } = createGame();
extrasLockedGame.progression.completeCampaign();
extrasLockedGame.refreshProgressionUnlocks();
click(extrasLockedGame, 1100, 615);
click(extrasLockedGame, 640, 220);
extrasLockedGame.render();
assert.ok(renderedText.includes("Desbloqueo: 70% de estrellas únicas"));
assert.ok(renderedText.includes("Desbloqueo: 100% de estrellas únicas"));
assert.ok(renderedText.includes("Desbloqueo: campaña completa en NORMAL"));
assert.ok(renderedText.includes("Desbloqueo: campaña completa en DIFÍCIL"));

// Código de desarrollador: el botón activa inmortalidad sin gastar vidas ni reiniciar el capítulo.
const { game: developerGame } = createGame();
assert.equal(developerCodeForm.hidden, false, "The code panel should appear in the menu");
developerCodeInput.value = "incorrecto";
developerFormListeners.get("submit")({ preventDefault: noop });
assert.equal(developerGame.developerMode, false);
assert.equal(developerCodeStatus.textContent, "Código incorrecto");
developerCodeInput.value = " amor ";
let developerButtonDefaultPrevented = false;
developerButtonListeners.get("pointerdown")({ pointerType: "touch", preventDefault: () => { developerButtonDefaultPrevented = true; } });
assert.equal(developerButtonDefaultPrevented, true);
assert.equal(developerGame.developerMode, true);
assert.equal(developerCodeStatus.textContent, "Inmortal · todo desbloqueado");
assert.equal(developerGame.isCharacterUnlocked("Isabela"), true, "The developer code unlocks Isabela immediately");
assert.equal(developerGame.isCharacterUnlocked("Eren"), true, "The developer code unlocks current extra characters");
assert.equal(developerGame.isExtrasUnlocked, true);
assert.equal(developerGame.isLevel4Unlocked, true);
assert.deepEqual(developerGame.progression.getStarProgress(), { obtained: 54, total: 54, percentage: 100 });
developerGame.startLevel(2);
assert.equal(developerCodeForm.hidden, true, "The code panel should be hidden during gameplay");
developerGame.level.enemies = [{ active: true, x: developerGame.personajeActual.x, y: developerGame.personajeActual.y, width: 40, height: 40, draw: noop }];
developerGame.checkEnemyCollisions();
assert.equal(developerGame.lives, 3);
assert.equal(developerGame.levelNumber, 2);
assert.equal(developerGame.handleBossHit(), false);
assert.equal(developerGame.lives, 3);
developerGame.render();
assert.ok(renderedText.includes("MODO DESARROLLADOR · INMORTAL"));
developerGame.returnToMenu();
assert.equal(developerCodeForm.hidden, false);
click(developerGame, 1100, 615);
assert.equal(developerGame.menuView, "extras", "The unlocked extras section opens from the menu");
assert.equal(developerCodeForm.hidden, true, "The compact code panel stays out of submenus");
click(developerGame, 640, 220);
assert.equal(developerGame.menuView, "characters");
click(developerGame, 1060, 320);
assert.equal(developerGame.selectedCharacter, "Eren Titan", "EXTRAS can select an unlocked playable character");
click(developerGame, 640, 610);
assert.equal(developerGame.menuView, "extras");
click(developerGame, 640, 302);
assert.equal(developerGame.menuView, "book");
developerGame.render();
assert.ok(renderedText.includes("El contenido del libro aún no está en el proyecto."));
click(developerGame, 320, 600);
assert.equal(developerGame.menuView, "extras");
click(developerGame, 640, 410);
assert.equal(developerGame.menuView, "gifts");
assert.equal(giftImages.length, 6, "All six supplied gift images are registered");
developerGame.render();
assert.ok(renderedText.includes("Recuerdo 1 de 6 · toca la imagen para ampliar"));
click(developerGame, 640, 300);
assert.equal(developerGame.giftViewerOpen, true, "The selected gift opens in the larger viewer");
developerGame.handleMenuNavigation({ key: "ArrowRight", preventDefault: noop });
assert.equal(developerGame.giftIndex, 1, "Keyboard navigation changes gifts while the viewer is enlarged");
developerGame.handleMenuNavigation({ key: "ArrowLeft", preventDefault: noop });
assert.equal(developerGame.giftIndex, 0);
developerGame.handleMenuNavigation({ key: "ArrowLeft", preventDefault: noop });
assert.equal(developerGame.giftIndex, 5, "Previous navigation wraps from the first gift to the last");
developerGame.handleMenuNavigation({ key: "ArrowRight", preventDefault: noop });
assert.equal(developerGame.giftIndex, 0, "Next navigation wraps from the last gift to the first");
click(developerGame, 760, 600);
assert.equal(developerGame.giftIndex, 1, "The enlarged viewer's next button changes the current image");
click(developerGame, 550, 600);
assert.equal(developerGame.giftIndex, 0, "The enlarged viewer's previous button changes the current image");
click(developerGame, 980, 600);
assert.equal(developerGame.giftViewerOpen, false, "The enlarged viewer can be closed with its button");
click(developerGame, 320, 600);
assert.equal(developerGame.menuView, "extras");
click(developerGame, 640, 545);
assert.equal(developerGame.menuView, "main");

const futureUnlockKey = "future-character";
developerGame.progression.registerUnlock(futureUnlockKey);
developerGame.progression.registerCollection("future-collectibles", ["future-star", "future-item"]);
assert.equal(developerGame.progression.isUnlocked(futureUnlockKey), true, "Future registered unlocks inherit the developer unlock-all mode");
assert.equal(developerGame.progression.isCollected("future-collectibles", "future-item"), true, "Future registered collectibles are unlocked too");
const restoredDeveloperProgress = new ProgressionManager({
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
});
assert.equal(restoredDeveloperProgress.isUnlocked(futureUnlockKey), true, "The unlock-all mode persists");
storage.delete("principito-expansion-progreso-v1");
storage.delete("principito-isabela-desbloqueada");

// Nivel 4 mantiene una escala local, corre continuamente y conserva el récord.
const arcadeStorage = new Map();
const arcadeProgress = new Nivel4({ random: () => 0.4, storage: {
  getItem: (key) => arcadeStorage.get(key) ?? null,
  setItem: (key, value) => arcadeStorage.set(key, String(value)),
} });
const arcadeRunner = new Principito(0, 0);
const normalRunnerSize = { width: arcadeRunner.width, height: arcadeRunner.height };
arcadeProgress.start(arcadeRunner);
assert.equal(arcadeRunner.width, Math.round(normalRunnerSize.width * 0.52));
assert.equal(arcadeRunner.height, Math.round(normalRunnerSize.height * 0.52));
assert.equal(new Principito(0, 0).width, 84, "The campaign character dimensions must stay unchanged");
const arcadeInput = { getHorizontalDirection: () => 0, consumeJump: () => false };
let arcadeZoneChanged = false;
for (let frame = 0; frame < 900; frame += 1) {
  const result = arcadeProgress.update(0.1, arcadeRunner, arcadeInput, true);
  arcadeZoneChanged ||= result.zoneChanged;
}
assert.ok(arcadeProgress.distance > ZONE_LENGTH * 2, "The generated run should continue through multiple zones");
assert.ok(arcadeProgress.score > 0);
assert.ok(arcadeProgress.difficultyTier >= 2, "Run speed and difficulty should rise with distance");
assert.ok(arcadeZoneChanged);
assert.ok(arcadeProgress.segments.length > 0 && arcadeProgress.hazards.length > 0, "Segments and hazards continue generating ahead");
assert.ok(arcadeProgress.segments.some((segment) => segment.safe), "The run periodically creates safe segments");
assert.ok(arcadeProgress.segmentIndex > 40, "Procedural segment generation continues well beyond the initial map");
assert.ok(arcadeProgress.segments.length < 12, "Old segments are pruned so the endless run keeps memory bounded");
assert.ok(arcadeProgress.hazards.length < 20, "Old hazards are pruned during a long run");
assert.ok(arcadeProgress.pickups.length < 8, "Old pickups are pruned during a long run");
assert.equal(arcadeStorage.get("principito-nivel4-record"), String(arcadeProgress.bestScore));
const restoredArcade = new Nivel4({ random: () => 0.4, storage: {
  getItem: (key) => arcadeStorage.get(key) ?? null,
  setItem: (key, value) => arcadeStorage.set(key, String(value)),
} });
assert.equal(restoredArcade.bestScore, arcadeProgress.bestScore, "The arcade record should persist across runs");
const transitionRun = new Nivel4({ random: () => 0.4, storage: { getItem: () => null, setItem: noop } });
const transitionRunner = new Principito(0, 0);
transitionRun.start(transitionRunner);
transitionRun.distance = ZONE_LENGTH - 1;
const transitionInput = { getHorizontalDirection: () => 0, getVerticalDirection: () => 0, consumeJump: () => false };
assert.equal(transitionRun.update(1 / 60, transitionRunner, transitionInput).zoneChanged, true);
transitionRun.update(0.4, transitionRunner, transitionInput);
assert.notEqual(transitionRun.getVisualZone().ground, transitionRun.zone.ground, "Zone palettes should crossfade instead of switching abruptly");
const duckRun = new Nivel4({ random: () => 0.4, storage: { getItem: () => null, setItem: noop } });
const duckRunner = new Principito(0, 0);
duckRun.start(duckRunner);
duckRun.hazards = [{ kind: "aerial", x: duckRunner.x + 100, y: 462, width: 54, height: 42, active: true, phase: 0 }];
for (let frame = 0; frame < 35; frame += 1) duckRun.update(1 / 60, duckRunner, { ...arcadeInput, isCrouching: () => true });
assert.equal(duckRunner.arcadeCrouching, true, "Holding crouch lowers the player's collision profile under flying enemies");
assert.equal(duckRunner.y + duckRunner.height, 570, "Crouching keeps the player grounded");
assert.ok(!duckRun.isOver, "Crouching safely passes the low flying enemy");
duckRun.update(1 / 60, duckRunner, { ...arcadeInput, isCrouching: () => false });
assert.equal(duckRunner.height, duckRunner.arcadeStandingHeight, "Releasing crouch restores the normal arcade hitbox");
const chaseRun = new Nivel4({ random: () => 0.4, storage: { getItem: () => null, setItem: noop } });
const chaseRunner = new Principito(0, 0);
chaseRun.start(chaseRunner);
const chargingEnemy = { kind: "enemy", x: chaseRunner.x + 650, y: 508, width: 46, height: 62, speed: 48, active: true, approaching: false };
chaseRun.hazards = [chargingEnemy];
chaseRun.update(1 / 60, chaseRunner, { ...arcadeInput, isCrouching: () => false });
assert.equal(chargingEnemy.approaching, true, "Ground enemies start chasing when they enter the warning range");
assert.ok(chargingEnemy.x < chaseRunner.x + 650);
assert.ok(chargingEnemy.speed <= chaseRun.speed * 0.36, "A pursuing enemy remains slower than the runner and leaves a reaction window");
const earlyEnemySpeed = chargingEnemy.speed;
chaseRun.distance = 20_000;
chaseRun.update(1 / 60, chaseRunner, { ...arcadeInput, isCrouching: () => false }, true);
assert.ok(chargingEnemy.speed > earlyEnemySpeed, "Charging enemies accelerate as the run gets longer");
const nycRun = new Nivel4({ random: () => 0.4, storage: { getItem: () => null, setItem: noop } });
const nycRunner = new Principito(0, 0);
nycRun.start(nycRunner);
const valleyRun = new Nivel4({ random: () => 0.4, storage: { getItem: () => null, setItem: noop } });
const valleyRunner = new Principito(0, 0);
valleyRun.start(valleyRunner);
valleyRun.distance = 4_999;
valleyRun.update(1 / 60, valleyRunner, arcadeInput);
assert.equal(valleyRun.zone.name, "VALLE DEL VIENTO", "The 5,000 m milestone changes to a new environment");
nycRun.distance = 9_999;
nycRun.update(1 / 60, nycRunner, arcadeInput);
assert.equal(nycRun.zone.name, "NUEVA YORK DE NOCHE", "The 10,000 m milestone introduces the night-time New York scene");
nycRun.update(0.4, nycRunner, arcadeInput);
nycRun.drawBackground(context, { width: 1280, height: 720 }, 0, 0);
assert.ok(renderedText.includes("NUEVA YORK DE NOCHE"), "The New York skyline zone renders its own transition label");
for (const randomValue of [0.05, 0.15, 0.4, 0.66, 0.88]) {
  const skillRun = new Nivel4({ random: () => randomValue, storage: { getItem: () => null, setItem: noop } });
  const skillRunner = new Principito(0, 0);
  skillRun.start(skillRunner);
  let jumpRequested = false;
  let crouchRequested = false;
  let skillRunDied = false;
  for (let frame = 0; frame < 3600 && !skillRunDied; frame += 1) {
    const nextHazard = skillRun.hazards.filter((hazard) => hazard.active && hazard.x + hazard.width >= skillRunner.x).sort((a, b) => a.x - b.x)[0];
    const hazardGap = nextHazard ? nextHazard.x - skillRunner.x - skillRunner.width : Infinity;
    const closingSpeed = skillRun.speed + (nextHazard?.kind === "enemy" ? nextHazard.speed : 0);
    crouchRequested = Boolean(nextHazard?.kind === "aerial" && hazardGap <= Math.max(150, skillRun.speed * 0.28) && skillRunner.isOnGround);
    jumpRequested = Boolean(nextHazard && nextHazard.kind !== "aerial" && hazardGap <= Math.max(120, closingSpeed * 0.24) && skillRunner.isOnGround);
    const result = skillRun.update(1 / 60, skillRunner, {
      getHorizontalDirection: () => 0,
      getVerticalDirection: () => 0,
      isCrouching: () => crouchRequested,
      consumeJump: () => { const requested = jumpRequested; jumpRequested = false; return requested; },
    });
    skillRunDied = result.died;
  }
  assert.equal(skillRunDied, false, `A well-timed jump strategy should survive a prolonged procedural run (random seed ${randomValue})`);
  assert.ok(skillRun.distance > 10_000);
  assert.ok(skillRun.difficultyTier >= 5, "The prolonged playable run must include advanced obstacle combinations");
}
const lethalRun = new Nivel4({ random: () => 0.4, storage: {
  getItem: (key) => arcadeStorage.get(key) ?? null,
  setItem: (key, value) => arcadeStorage.set(key, String(value)),
} });
const lethalRunner = new Isabela(0, 0);
lethalRun.start(lethalRunner);
lethalRun.hazards = [];
for (let frame = 0; frame < 25; frame += 1) lethalRun.update(0.1, lethalRunner, arcadeInput);
lethalRun.hazards = [{ x: lethalRunner.x, y: lethalRunner.y, width: 12, height: 12, active: true }];
assert.equal(lethalRun.update(0.016, lethalRunner, arcadeInput).died, true, "A hazard ends a normal arcade run");
assert.equal(lethalRun.isOver, true);
assert.ok(lethalRun.bestScore > 0, "The final run score is saved before Game Over");

// La integración del Nivel 4 usa el personaje seleccionado y el Game Over permite reiniciar.
const { game: arcadeGame, events: arcadeEvents } = createGame();
arcadeGame.progression.unlockEverything({ campaignStarIds: arcadeGame.getCampaignStarIds() });
arcadeGame.refreshProgressionUnlocks();
arcadeGame.selectedCharacter = "Isabela";
assert.equal(arcadeGame.startLevel(4), undefined, "The unlocked arcade mode starts without changing the normal campaign route");
assert.ok(arcadeGame.personajeActual instanceof Isabela);
assert.equal(arcadeGame.levelNumber, 4);
assert.ok(arcadeGame.personajeActual.width < 84, "The arcade scale is local to the selected character");
assert.ok(arcadeEvents.includes("music:4"), "Starting a run requests the developer-provided Level 4 track");
arcadeGame.input.pressedKeys.add(" ");
arcadeGame.update(1 / 60);
assert.equal(arcadeGame.personajeActual.jumpsUsed, 1, "The normal jump input is reused by the arcade mode");
assert.ok(arcadeEvents.includes("jump"));
arcadeGame.level.hazards = [{ x: arcadeGame.personajeActual.x, y: arcadeGame.personajeActual.y, width: 16, height: 16, active: true }];
arcadeGame.update(1 / 60);
assert.equal(arcadeGame.state, GameState.GAME_OVER);
assert.ok(arcadeEvents.includes("stop"), "Game Over stops the current music");
const arcadeScoreBeforeRetry = arcadeGame.level.score;
assert.ok(arcadeScoreBeforeRetry > 0);
click(arcadeGame, 640, 430);
assert.equal(arcadeGame.state, GameState.JUGANDO, "The Game Over action begins a new endless run");
assert.equal(arcadeGame.level.score, 0);
assert.ok(arcadeGame.level.bestScore >= arcadeScoreBeforeRetry, "The best score survives a retry");
assert.ok(arcadeGame.personajeActual instanceof Isabela, "A retry preserves the selected character");
storage.delete("principito-expansion-progreso-v1");

menuGame.unlockIsabela();
assert.equal(storage.get("principito-isabela-desbloqueada"), "true");
const { game: unlockedGame } = createGame();
assert.equal(unlockedGame.isIsabelaUnlocked, true);
click(unlockedGame, 640, 214);
assert.equal(unlockedGame.selectedCharacter, "Isabela");
for (const [x, expectedLevel] of [[320, 1], [640, 2], [960, 3]]) {
  unlockedGame.returnToMenu();
  unlockedGame.lives = 1;
  click(unlockedGame, x, 545);
  assert.equal(unlockedGame.levelNumber, expectedLevel);
  assert.equal(unlockedGame.state, GameState.JUGANDO);
  assert.equal(unlockedGame.lives, 3, "Replaying a chapter starts with three lives");
  assert.equal(unlockedGame.personajeActual.lives, 3);
}

// Cada extra seleccionado instancia un personaje propio y conserva la compatibilidad con los tres capítulos.
const { game: extraCharacterGame } = createGame();
assert.equal(extraCharacterGame.campaignStarTotal, 54, "The global star percentage must include all three campaign levels and zones");
const allCampaignStarIds = [new Nivel1(), new Nivel2(), new Nivel3()]
  .flatMap((level) => level.zones.flatMap((zone) => zone.stars.map((star) => star.id)));
assert.equal(new Set(allCampaignStarIds).size, 54, "Every campaign star must have a distinct persistent identity");
const extraUnlockKeys = { Eren: "eren", Mikasa: "mikasa", "Kanye West": "kanye", "Eren Titan": "erenTitan" };
for (const unlockKey of Object.values(extraUnlockKeys)) extraCharacterGame.progression.data.unlocked[unlockKey] = true;
extraCharacterGame.progression.completeCampaign();
extraCharacterGame.progression.save();
extraCharacterGame.refreshProgressionUnlocks();
const extraCharacterTypes = { Eren, Mikasa, "Kanye West": KanyeWest, "Eren Titan": ErenTitan };
const extraCharacterCells = { Eren: [1060, 220], Mikasa: [220, 320], "Kanye West": [640, 320], "Eren Titan": [1060, 320] };
for (const [name, CharacterType] of Object.entries(extraCharacterTypes)) {
  extraCharacterGame.returnToMenu();
  click(extraCharacterGame, 1100, 615);
  assert.equal(extraCharacterGame.menuView, "extras");
  click(extraCharacterGame, 640, 220);
  assert.equal(extraCharacterGame.menuView, "characters");
  click(extraCharacterGame, ...extraCharacterCells[name]);
  assert.equal(extraCharacterGame.selectedCharacter, name, `${name} should be selectable after unlock`);
  for (const levelNumber of [1, 2, 3]) {
    extraCharacterGame.startLevel(levelNumber);
    assert.ok(extraCharacterGame.personajeActual instanceof CharacterType, `${name} should be playable in chapter ${levelNumber}`);
    assert.ok(extraCharacterGame.personajeActual instanceof Personaje, `${name} must reuse the shared movement and combat systems`);
    if (name === "Eren Titan") {
      assert.ok(extraCharacterGame.personajeActual.y + extraCharacterGame.personajeActual.height <= 640, "Eren Titan must spawn above, not inside, the ground platform");
      for (let frame = 0; frame < 120; frame += 1) extraCharacterGame.update(1 / 60);
      assert.ok(extraCharacterGame.personajeActual.y < 600, `Eren Titan should settle onto a platform and stay in the world in chapter ${levelNumber}`);
    }
    const startX = extraCharacterGame.personajeActual.x;
    extraCharacterGame.input.handleKeyDown({ key: "d", preventDefault: noop });
    extraCharacterGame.update(1 / 60);
    extraCharacterGame.input.handleKeyUp({ key: "d" });
    assert.ok(extraCharacterGame.personajeActual.x > startX, `${name} should move through the shared controls in chapter ${levelNumber}`);
    extraCharacterGame.personajeActual.enableDoubleJump();
    assert.equal(extraCharacterGame.personajeActual.maxJumps, 2);
    extraCharacterGame.personajeActual.hasSword = true;
    extraCharacterGame.personajeActual.hasSling = true;
    for (const state of ["IDLE", "RUN", "JUMP", "FALL", "ATTACK", "HURT", "VICTORY", "INTERACTION"]) {
      extraCharacterGame.personajeActual.state = state;
      extraCharacterGame.personajeActual.draw(context);
    }
    extraCharacterGame.render();
  }
  extraCharacterGame.startLevel(4);
  assert.ok(extraCharacterGame.personajeActual instanceof CharacterType, `${name} should also be selectable in the endless arcade`);
  assert.ok(extraCharacterGame.personajeActual.width < 84, "Arcade character scaling must stay local to Level 4");
  extraCharacterGame.update(1 / 60);
}

const { game: uniqueStarGame } = createGame();
uniqueStarGame.startLevel(1);
const firstCampaignStar = uniqueStarGame.level.stars[0];
uniqueStarGame.personajeActual.x = firstCampaignStar.x;
uniqueStarGame.personajeActual.y = firstCampaignStar.y;
uniqueStarGame.checkStarCollisions();
assert.equal(uniqueStarGame.progression.getStarProgress().obtained, 1);
uniqueStarGame.restartCurrentLevel();
const sameCampaignStar = uniqueStarGame.level.stars[0];
assert.equal(sameCampaignStar.id, firstCampaignStar.id, "A star keeps the same identity after restarting the level");
uniqueStarGame.personajeActual.x = sameCampaignStar.x;
uniqueStarGame.personajeActual.y = sameCampaignStar.y;
uniqueStarGame.checkStarCollisions();
assert.equal(uniqueStarGame.progression.getStarProgress().obtained, 1, "Collecting the respawned star cannot count twice globally");

// En celular se puede pasar de capítulo tocando el lienzo o el control táctil, sin Enter.
const { game: tapContinueGame } = createGame();
tapContinueGame.startLevel(1);
tapContinueGame.lives = 1;
tapContinueGame.personajeActual.lives = 1;
tapContinueGame.state = GameState.NIVEL_COMPLETADO;
tapContinueGame.handleCanvasClick({ clientX: 640, clientY: 360 });
assert.equal(tapContinueGame.levelNumber, 2);
assert.equal(tapContinueGame.lives, 3, "Touching to continue starts the next chapter with three lives");
assert.equal(tapContinueGame.personajeActual.lives, 3);
tapContinueGame.lives = 2;
tapContinueGame.personajeActual.lives = 2;
tapContinueGame.state = GameState.NIVEL_COMPLETADO;
tapContinueGame.input.activateTouchControl("enter");
tapContinueGame.update(1 / 60);
assert.equal(tapContinueGame.levelNumber, 3);
assert.equal(tapContinueGame.lives, 3, "Touch control progression resets lives for the next chapter");
assert.equal(tapContinueGame.personajeActual.lives, 3);

// Los tres capítulos reutilizan el personaje seleccionado y la cámara.
for (const levelNumber of [1, 2, 3]) {
  unlockedGame.startLevel(levelNumber);
  assert.equal(unlockedGame.state, GameState.JUGANDO);
  assert.ok(unlockedGame.personajeActual instanceof Isabela);
  assert.equal(unlockedGame.level.id, levelNumber);
  unlockedGame.personajeActual.x = 1100;
  unlockedGame.camera.follow(unlockedGame.personajeActual);
  assert.ok(unlockedGame.camera.x > 0);
  unlockedGame.render();
}

const { game, events } = createGame();
game.startLevel(1);
assert.ok(game.personajeActual instanceof Principito);
assert.ok(events.includes("music:1"));

// Movimiento, salto, plataforma, cámara, estrella y daño.
const player = game.personajeActual;
const initialX = player.x;
game.input.keys.add("d");
game.update(0.1);
game.input.keys.clear();
assert.ok(player.x > initialX);
player.isOnGround = true;
player.jumpsUsed = 0;
game.input.pressedKeys.add(" ");
game.update(1 / 60);
assert.ok(player.velocityY < 0);
assert.ok(events.includes("jump"));
player.y = 510;
player.velocityY = 400;
player.x = 250;
player.resolvePlatformCollisions(game.level.platforms, player.x, 480);
assert.equal(player.y, 492);
assert.equal(player.isOnGround, true);
game.level.stars = [{ active: true, x: player.x, y: player.y, width: 20, height: 20, collect() { this.active = false; } }];
game.checkStarCollisions();
assert.equal(game.starsCollected, 1);
assert.ok(events.includes("star"));
game.level.enemies = [{ active: true, x: player.x, y: player.y, width: 40, height: 40 }];
player.invulnerabilityTime = 0;
const livesBeforeDamage = game.lives;
game.checkEnemyCollisions();
assert.equal(game.lives, livesBeforeDamage - 1);
assert.equal(game.personajeActual.lives, game.lives);
assert.equal(game.starsCollected, 0);
assert.ok(events.includes("damage"));

// Doble salto y ataque con espada en el Nivel 3; las tres derrotas son reales.
game.startLevel(3);
const finalPlayer = game.personajeActual;
finalPlayer.equipSword();
for (let defeated = 0; defeated < 3; defeated += 1) {
  finalPlayer.attackTime = 0.2;
  const hitbox = finalPlayer.getAttackHitbox();
  game.level.enemies = [{ active: true, ...hitbox, update: noop }];
  game.checkAttackCollisions();
}
assert.equal(game.level.enemiesDefeated, 3);
assert.equal(game.level.doubleJumpUnlocked, true);
assert.equal(finalPlayer.hasDoubleJump, true);
finalPlayer.isOnGround = false;
finalPlayer.jumpsUsed = 1;
game.input.pressedKeys.add(" ");
finalPlayer.update(1 / 60, game.input, game.level.worldWidth, game.level.platforms);
assert.equal(finalPlayer.jumpsUsed, 2);
game.input.pressedKeys.add("j");
finalPlayer.attackTime = 0;
game.update(1 / 60);
assert.ok(events.includes("attack"));

// El rescate antiguo queda eliminado; pausa y controles táctiles se mantienen.
assert.equal(game.level.rescue, null);
game.startLevel(2);
game.input.pressedKeys.add("escape");
game.update(1 / 60);
assert.equal(game.state, GameState.PAUSA);
game.input.pressedKeys.add("escape");
game.update(1 / 60);
assert.equal(game.state, GameState.JUGANDO);
game.input.activateTouchControl("left");
assert.equal(game.input.getHorizontalDirection(), -1);
game.input.releaseTouchControl("left");
game.input.activateTouchControl("jump");
assert.equal(game.input.consumeJump(), true);

function forceEnemyDeath(targetGame) {
  targetGame.personajeActual.invulnerabilityTime = 0;
  targetGame.level.enemies = [{ active: true, x: targetGame.personajeActual.x, y: targetGame.personajeActual.y, width: 40, height: 40 }];
  targetGame.checkEnemyCollisions();
}

// Fase 2 E2: las vidas siguen siendo globales y Game Over reinicia campaña.
game.startNewGame();
assert.equal(game.lives, 3);
forceEnemyDeath(game);
assert.equal(game.lives, 2);
assert.equal(game.state, GameState.JUGANDO);
forceEnemyDeath(game);
assert.equal(game.lives, 1);
forceEnemyDeath(game);
assert.equal(game.lives, 0);
assert.equal(game.state, GameState.GAME_OVER);
game.startNewGame();
assert.equal(game.levelNumber, 1);
assert.equal(game.lives, 3);
assert.equal(game.personajeActual.lives, 3);

// Perder una vida reinicia el capítulo activo (no la campaña) con las vidas restantes.
for (const chapter of [1, 2, 3]) {
  const { game: respawnGame } = createGame();
  respawnGame.startLevel(chapter);
  respawnGame.lives = 3;
  respawnGame.personajeActual.lives = 3;
  forceEnemyDeath(respawnGame);
  assert.equal(respawnGame.lives, 2);
  assert.equal(respawnGame.levelNumber, chapter);
  assert.equal(respawnGame.level.id, chapter);
  assert.equal(respawnGame.state, GameState.JUGANDO);
  assert.equal(respawnGame.personajeActual.lives, 2);
  forceEnemyDeath(respawnGame);
  assert.equal(respawnGame.lives, 1);
  assert.equal(respawnGame.levelNumber, chapter, "A second lost life must still stay in the active chapter");
  forceEnemyDeath(respawnGame);
  assert.equal(respawnGame.lives, 0);
  assert.equal(respawnGame.state, GameState.GAME_OVER);
  assert.equal(respawnGame.levelNumber, chapter, "Game Over retains the chapter until the player chooses retry");
  respawnGame.startNewGame();
  assert.equal(respawnGame.levelNumber, 1, "Retrying after Game Over starts a fresh campaign");
}

game.setDifficulty("dificil");
assert.equal(storage.get("principito-dificultad"), "dificil");
assert.equal(game.difficulty, "dificil");
assert.equal(game.level.enemies[0].speed, game.level.enemies[0].baseSpeed * 1.15);

// Bloque F: modo difícil añade encuentros de plataforma sin alterar Normal/Fácil.
for (const chapter of [1, 2, 3]) {
  const { game: difficultyGame } = createGame();
  difficultyGame.setDifficulty("normal");
  difficultyGame.startLevel(chapter);
  const normalCount = difficultyGame.level.enemies.length;
  difficultyGame.setDifficulty("dificil");
  assert.equal(difficultyGame.level.enemies.length, normalCount + 1, `Chapter ${chapter} adds one hard-only platform enemy`);
  const extra = difficultyGame.level.enemies.find((enemy) => enemy.isHardModeExtra);
  assert.ok(extra, `Chapter ${chapter} has an additional hard-mode enemy`);
  assert.ok(difficultyGame.level.platforms.some((platform) => extra.x >= platform.x
    && extra.x + extra.width <= platform.x + platform.width
    && Math.abs(extra.y + extra.height - platform.y) < 0.001), `Chapter ${chapter} extra enemy stands on a reachable existing platform`);
  difficultyGame.applyDifficultyToActiveZone();
  assert.equal(difficultyGame.level.enemies.filter((enemy) => enemy.isHardModeExtra).length, 1, "Reapplying hard difficulty does not duplicate encounters");
  difficultyGame.setDifficulty("normal");
  assert.equal(difficultyGame.level.enemies.length, normalCount, "Returning to normal removes hard-only enemies");
  difficultyGame.setDifficulty("facil");
  assert.equal(difficultyGame.level.enemies.length, normalCount, "Easy remains unchanged");
  assert.equal(difficultyGame.level.enemies[0].speed, difficultyGame.level.enemies[0].baseSpeed * 0.9);

  for (let zoneIndex = 0; zoneIndex < difficultyGame.level.zones.length; zoneIndex += 1) {
    difficultyGame.level.activateZone(zoneIndex);
    difficultyGame.applyDifficultyToActiveZone();
    const zone = difficultyGame.level.activeZone;
    assert.ok(difficultyGame.level.goal || zone.goal || zone.tuberia || zone.zoneExit || zone.waterExit || zone.bossArena
      || zone.properties?.tuberia || zone.properties?.zoneExit || zone.properties?.waterExit || zone.properties?.bossArena,
      `Chapter ${chapter}, zone ${zoneIndex + 1} retains its progression/exit objective`);
    if (zoneIndex < difficultyGame.level.zones.length - 1) {
      assert.ok(difficultyGame.level.platforms.length > 1, `Chapter ${chapter}, zone ${zoneIndex + 1} retains its platform route`);
    }
  }
}
const { game: hardChapterOne } = createGame();
hardChapterOne.setDifficulty("dificil");
hardChapterOne.startLevel(1);
assert.ok(hardChapterOne.level.doubleJumpPower?.active, "The Chapter 1 double-jump power remains available in hard mode");
hardChapterOne.level.activateZone(1);
hardChapterOne.personajeActual.activateJetpack();
hardChapterOne.applyDifficultyToActiveZone();
assert.equal(hardChapterOne.personajeActual.jetpackFuelLimited, true, "Hard mode keeps its limited jetpack mechanic");
assert.ok(hardChapterOne.personajeActual.jetpackFuel > 0);
const { game: hardChapterThree } = createGame();
hardChapterThree.setDifficulty("dificil");
hardChapterThree.startLevel(3);
assert.ok(hardChapterThree.level.sword?.active, "The Chapter 3 sword remains available in hard mode");
assert.ok(hardChapterThree.level.enemies.length >= hardChapterThree.level.doubleJumpUnlockKills,
  "The first Chapter 3 zone has enough enemies to unlock the required double jump");

// Fase 2 E1: las zonas del Nivel 1 y la Tubería se activan explícitamente.
const { game: episodeGame, events: episodeEvents } = createGame();
episodeGame.startLevel(1);
const episodePlayer = episodeGame.personajeActual;
assert.equal(episodeGame.level.zones.length, 2);
assert.equal(episodeGame.level.currentZoneIndex, 0);
episodePlayer.x = episodeGame.level.tuberia.x;
episodePlayer.y = episodeGame.level.tuberia.y;
episodeGame.input.pressedKeys.add("enter");
episodeGame.update(1 / 60);
assert.ok(episodeGame.zoneTransition);
assert.ok(episodeEvents.includes("interaction"));
episodeGame.update(1);
assert.equal(episodeGame.level.currentZoneIndex, 1);
assert.equal(episodeGame.camera.worldWidth, episodeGame.level.worldWidth);
assert.equal(episodeGame.zoneTransition, null);
assert.equal(episodeGame.personajeActual.movementMode, "JETPACK");
assert.equal(episodeGame.level.platforms.some((platform) => platform.x === 0 && platform.width >= episodeGame.level.worldWidth), false);
episodeGame.setDifficulty("dificil");
assert.equal(episodeGame.personajeActual.jetpackFuelLimited, true);
assert.equal(episodeGame.level.enemies.some((enemy) => enemy.type === "aereo"), true);

// Fase 2 E3: recoger la honda, disparar y devolverla al reiniciar tras daño.
const { game: slingGame } = createGame();
slingGame.startLevel(1);
const slingshot = slingGame.level.sling;
slingGame.personajeActual.x = slingshot.x;
slingGame.personajeActual.y = slingshot.y;
slingGame.checkPowerCollisions();
assert.equal(slingshot.active, false);
assert.equal(slingGame.personajeActual.hasSling, true);
slingGame.level.enemies = [];
slingGame.input.pressedKeys.add("j");
slingGame.update(1 / 60);
assert.equal(slingGame.projectiles.length, 1);
slingGame.personajeActual.invulnerabilityTime = 0;
slingGame.handlePlayerDeath();
assert.equal(slingGame.level.sling.active, true);

// Enemigos aéreos cambian su trayectoria al aproximarse un proyectil.
const { Enemigo } = await import("../js/entities/Enemigo.js");
const flyer = new Enemigo(180, 160, 100, 320, "aereo");
flyer.update(1 / 60, [{ active: true, x: 80, y: 185, direction: 1 }]);
assert.equal(flyer.direction, -1);

// E4/E7b: Zorro acompaña al nivel 3 y la bonificación se entrega al entrar en arena, una vez.
const { game: foxGame } = createGame();
foxGame.startLevel(3);
assert.ok(foxGame.zorro);
assert.equal(foxGame.lives, 3);
foxGame.level.enemies = [{ active: true, x: foxGame.personajeActual.x + 30, y: foxGame.personajeActual.y, width: 50, height: 50 }];
foxGame.zorro.update(1 / 60, foxGame.personajeActual, foxGame.level.enemies);
assert.equal(foxGame.zorro.warning, true);
foxGame.level.activateZone(2);
foxGame.personajeActual.respawn(foxGame.level.spawn.x, foxGame.level.spawn.y);
foxGame.enterBossArena();
assert.equal(foxGame.lives, 4);

// E6: dos zonas del Nivel 2; el agua usa brazadas y vuelve a física normal en la superficie.
const { game: waterGame } = createGame();
waterGame.startLevel(2);
assert.equal(waterGame.level.zones.length, 2);
assert.equal(waterGame.personajeActual.hasDoubleJump, false);
assert.equal(waterGame.personajeActual.hasSword, false);
assert.equal(waterGame.personajeActual.hasSling, false);
waterGame.personajeActual.x = waterGame.level.zoneExit.x;
waterGame.personajeActual.y = waterGame.level.zoneExit.y;
waterGame.input.pressedKeys.add("enter");
waterGame.update(1 / 60);
waterGame.zoneTransition.time = 0;
waterGame.update(1 / 60);
assert.equal(waterGame.level.currentZoneIndex, 1);
assert.equal(waterGame.personajeActual.movementMode, "SWIMMING");
assert.ok(waterGame.level.enemies.some((enemy) => enemy.type === "acuatico"));
waterGame.input.activateTouchControl("jump");
waterGame.update(1 / 60);
assert.ok(waterGame.personajeActual.velocityY < 0, "A swim stroke should propel the player upward");
assert.equal(waterGame.personajeActual.jumpsUsed, 0, "Swimming must not consume normal jumps");
waterGame.input.releaseTouchControl("jump");
waterGame.personajeActual.x = waterGame.level.waterExit.x;
waterGame.personajeActual.y = waterGame.level.waterExit.y;
waterGame.checkObjective();
assert.equal(waterGame.personajeActual.movementMode, "NORMAL");
assert.equal(waterGame.level.waterExit.active, false);
waterGame.render();

// E7a/b: zonas progresivas, puerta ligada a tres derrotas y jefe con dificultad/patrones.
const { JefeFinal } = await import("../js/entities/JefeFinal.js");
assert.equal(new JefeFinal(770, 640, 1280, "facil").maxHealth, 3);
assert.equal(new JefeFinal(770, 640, 1280, "normal").maxHealth, 5);
assert.equal(new JefeFinal(770, 640, 1280, "dificil").maxHealth, 10);
const patternBoss = new JefeFinal(770, 640, 1280, "normal");
for (const [pattern, expected] of [[0, "dash"], [1, "leap"], [2, "blast"]]) {
  patternBoss.state = "windup"; patternBoss.stateTime = 0.01; patternBoss.currentPattern = pattern;
  patternBoss.update(0.02, { x: 200, width: 80 });
  assert.equal(patternBoss.state, expected);
}
storage.delete("principito-isabela-desbloqueada");
const { game: bossGame, events: bossEvents } = createGame();
bossGame.startLevel(3);
bossGame.setDifficulty("normal");
assert.equal(bossGame.isIsabelaUnlocked, false);
assert.equal(bossGame.level.zones.length, 3);
assert.equal(bossGame.level.rescue, null);
bossGame.level.activateZone(1);
bossGame.personajeActual.respawn(bossGame.level.spawn.x, bossGame.level.spawn.y);
bossGame.beginZoneTransition(2);
assert.equal(bossGame.zoneTransition, null, "The arena portal must require three enemy defeats");
for (let defeated = 0; defeated < 3; defeated += 1) bossGame.registerEnemyDefeat();
assert.equal(bossGame.personajeActual.hasDoubleJump, true);
bossGame.beginZoneTransition(2);
bossGame.finishZoneTransition();
assert.equal(bossGame.level.currentZoneIndex, 2);
assert.ok(bossGame.boss);
assert.equal(bossGame.boss.health, 5);
assert.equal(bossGame.lives, 4, "The Fox arena bonus should be granted on entry");
const healthBeforeSword = bossGame.boss.health;
bossGame.personajeActual.equipSword();
bossGame.personajeActual.x = bossGame.boss.x - bossGame.personajeActual.width + 10;
bossGame.personajeActual.y = bossGame.boss.y + 50;
bossGame.personajeActual.facing = 1;
bossGame.personajeActual.attackTime = 0.2;
bossGame.checkBossCombat();
assert.equal(bossGame.boss.health, healthBeforeSword, "Sword may stun but may not damage the boss");
assert.ok(bossGame.boss.stunTime > 0);
bossGame.boss.stunTime = 0; bossGame.boss.stunImmunity = 0;
bossGame.boss.health = 1; bossGame.boss.vulnerableTime = 1; bossGame.boss.lastWindowHit = false;
bossGame.personajeActual.x = bossGame.boss.x + 50;
bossGame.personajeActual.y = bossGame.boss.y - bossGame.personajeActual.height + 5;
bossGame.personajeActual.previousY = bossGame.boss.y - bossGame.personajeActual.height - 25;
bossGame.personajeActual.velocityY = 120;
bossGame.personajeActual.attackTime = 0;
bossGame.checkBossCombat();
assert.equal(bossGame.state, GameState.FINAL);
assert.equal(bossGame.finalSequence, "transition");
assert.ok(bossEvents.includes("music:final"));
bossGame.render();
bossGame.updateFinalSequence(14.9);
assert.equal(bossGame.finalSequence, "transition", "The final opening scene should remain for 15 seconds");
bossGame.updateFinalSequence(0.2);
assert.equal(bossGame.finalSequence, "juan");
for (let line = 0; line < 3; line += 1) bossGame.advanceFinalSequence();
assert.equal(bossGame.finalSequence, "poem");
const { finalPoem } = await import("../js/data/finalPoem.js");
assert.equal(finalPoem.length, 19);
assert.equal(finalPoem[0], "Gracias por existir,");
assert.equal(finalPoem.at(-1), "del pedazo Bosa, jejeje.");
assert.equal(bossGame.isIsabelaUnlocked, false);
renderedText.length = 0;
bossGame.render();
assert.ok(renderedText.includes("Gracias por existir,"));
assert.ok(renderedText.includes("del pedazo Bosa, jejeje."));
bossGame.updateFinalSequence(14.9);
assert.equal(bossGame.finalSequence, "poem", "The poem should remain for 15 seconds");
bossGame.updateFinalSequence(0.2);
assert.equal(bossGame.finalSequence, "credits");
assert.equal(bossGame.isIsabelaUnlocked, false, "Isabela remains locked during credits");
const { credits } = await import("../js/data/credits.js");
assert.equal(credits[0].role, "Créditos");
assert.equal(credits[0].value.split("\n")[4], "");
assert.equal(credits[0].value.split("\n").at(-1), "Palestina");
renderedText.length = 0;
bossGame.render();
assert.ok(renderedText.includes("Créditos"));
assert.ok(renderedText.includes("Creado por: Juan David"));
assert.ok(renderedText.includes("Kanye West"));
assert.ok(renderedText.includes("Mac DeMarco"));
assert.ok(renderedText.includes("Palestina"));
bossGame.updateFinalSequence(14.9);
assert.equal(bossGame.finalSequence, "credits", "Credits should remain for 15 seconds");
bossGame.updateFinalSequence(0.2);
assert.equal(bossGame.finalSequence, "victory");
assert.equal(bossGame.isIsabelaUnlocked, true, "Isabela unlocks after final credits");
bossGame.render();
bossGame.advanceFinalSequence();
assert.equal(bossGame.state, GameState.MENU);
foxGame.enterBossArena();
assert.equal(foxGame.lives, 4);

// E5b: Isabela usa el mismo jetpack al cruzar la tubería.
unlockedGame.startLevel(1);
unlockedGame.personajeActual.x = unlockedGame.level.tuberia.x;
unlockedGame.personajeActual.y = unlockedGame.level.tuberia.y;
unlockedGame.beginZoneTransition(1);
unlockedGame.zoneTransition.time = 0;
unlockedGame.finishZoneTransition();
assert.ok(unlockedGame.personajeActual instanceof Isabela);
assert.equal(unlockedGame.personajeActual.movementMode, "JETPACK");
unlockedGame.render();
episodeGame.render();

// E10: en fácil/normal, dos impactos del jefe no quitan vidas; el tercero reinicia el nivel y resta una.
function enterArena(game, difficulty) {
  game.startLevel(3);
  game.setDifficulty(difficulty);
  game.level.activateZone(1);
  for (let defeated = 0; defeated < 3; defeated += 1) game.registerEnemyDefeat();
  game.beginZoneTransition(2);
  game.finishZoneTransition();
  assert.ok(game.boss, `Arena should spawn for ${difficulty}`);
}

for (const difficulty of ["facil", "normal"]) {
  const { game: hitGame } = createGame();
  enterArena(hitGame, difficulty);
  const startingLives = hitGame.lives;
  const hitPlayer = hitGame.personajeActual;
  const addBossHit = () => {
    hitGame.boss.hazards = [{ x: hitPlayer.x, y: hitPlayer.y, width: hitPlayer.width, height: hitPlayer.height, active: true }];
    hitGame.checkBossCombat();
  };
  addBossHit();
  assert.equal(hitGame.bossHitsTaken, 1);
  assert.equal(hitGame.lives, startingLives);
  addBossHit();
  assert.equal(hitGame.bossHitsTaken, 1, "Invulnerability must not count repeated collision frames as extra hits");
  hitPlayer.invulnerabilityTime = 0;
  addBossHit();
  assert.equal(hitGame.bossHitsTaken, 2);
  assert.equal(hitGame.lives, startingLives, "The second boss hit must not remove a life");
  hitPlayer.invulnerabilityTime = 0;
  addBossHit();
  assert.equal(hitGame.lives, startingLives - 1, "The third boss hit removes exactly one life");
  assert.equal(hitGame.level.currentZoneIndex, 0, "The third boss hit restarts the level at its beginning");
  assert.equal(hitGame.boss, null);
  assert.equal(hitGame.bossHitsTaken, 0);
}

// Difícil mantiene el daño inmediato por impacto y no usa el contador de tres golpes.
const { game: hardBossGame } = createGame();
enterArena(hardBossGame, "dificil");
const hardStartingLives = hardBossGame.lives;
hardBossGame.boss.hazards = [{ x: hardBossGame.personajeActual.x, y: hardBossGame.personajeActual.y, width: hardBossGame.personajeActual.width, height: hardBossGame.personajeActual.height, active: true }];
hardBossGame.checkBossCombat();
assert.equal(hardBossGame.lives, hardStartingLives - 1);
assert.equal(hardBossGame.level.currentZoneIndex, 0);
assert.equal(hardBossGame.bossHitsTaken, 0);

console.log("Gameplay verification passed: campaign, mobile input, extras, endless Level 4, progressive zones/difficulty, records, Game Over, audio routes, and publication checks.");
