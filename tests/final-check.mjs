import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const noop = () => {};
const storage = new Map();
const renderedText = [];
const documentListeners = new Map();
let fullscreenRequests = 0;
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
  querySelector: () => ({ classList: { toggle: noop } }),
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

const { Game } = await import("../js/Game.js");
const { GameState } = await import("../js/GameState.js");
const { Isabela } = await import("../js/entities/Isabela.js");
const { Principito } = await import("../js/entities/Principito.js");
const { AudioManager, EFFECT_FILES, MUSIC_TRACKS } = await import("../js/systems/AudioManager.js");

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
assert.match(html, /maximum-scale=1\.0, user-scalable=no/);
assert.match(gameSource, /La aventura para llegar a Neiva/);
assert.doesNotMatch(gameSource, /Una aventura entre planetas/);
assert.equal(Object.keys(MUSIC_TRACKS).length, 4);
assert.equal(Object.keys(EFFECT_FILES).length, 6);
const audioCheck = new AudioManager();
await audioCheck.unlock();
audioCheck.playEffect("jump");
await audioCheck.playMusic(1);
assert.equal(audioCheck.currentTrack, null, "A missing music file must not block the game");

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
menuGame.unlockIsabela();
assert.equal(storage.get("principito-isabela-desbloqueada"), "true");
const { game: unlockedGame } = createGame();
assert.equal(unlockedGame.isIsabelaUnlocked, true);
click(unlockedGame, 640, 400);
assert.equal(unlockedGame.selectedCharacter, "Isabela");
for (const [x, expectedLevel] of [[320, 1], [640, 2], [960, 3]]) {
  unlockedGame.returnToMenu();
  click(unlockedGame, x, 635);
  assert.equal(unlockedGame.levelNumber, expectedLevel);
  assert.equal(unlockedGame.state, GameState.JUGANDO);
}

// En celular se puede pasar de capítulo tocando el lienzo o el control táctil, sin Enter.
const { game: tapContinueGame } = createGame();
tapContinueGame.startLevel(1);
tapContinueGame.state = GameState.NIVEL_COMPLETADO;
tapContinueGame.handleCanvasClick({ clientX: 640, clientY: 360 });
assert.equal(tapContinueGame.levelNumber, 2);
tapContinueGame.state = GameState.NIVEL_COMPLETADO;
tapContinueGame.input.activateTouchControl("enter");
tapContinueGame.update(1 / 60);
assert.equal(tapContinueGame.levelNumber, 3);

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

console.log("E10 verification passed: gameplay, mobile touch progression/fullscreen, three difficulties, boss, finale, rendering, audio, and publication checks.");
