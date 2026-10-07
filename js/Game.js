import { GameState } from "./GameState.js";
import { Isabela } from "./entities/Isabela.js";
import { Principito } from "./entities/Principito.js";
import { Zorro } from "./entities/Zorro.js";
import { Nivel1 } from "./levels/Nivel1.js";
import { Nivel2 } from "./levels/Nivel2.js";
import { Nivel3 } from "./levels/Nivel3.js";
import { Nivel4 } from "./levels/Nivel4.js";
import { Camera } from "./systems/Camera.js";
import { CollisionSystem } from "./systems/CollisionSystem.js";
import { InputManager } from "./systems/InputManager.js";
import { AudioManager } from "./systems/AudioManager.js";
import { Proyectil } from "./objects/Proyectil.js";
import { Nivel1Renderer } from "./renderers/Nivel1Renderer.js";
import { JefeFinal } from "./entities/JefeFinal.js";
import { Juan } from "./entities/Juan.js";
import { finalPoem } from "./data/finalPoem.js";
import { credits } from "./data/credits.js";
import { Eren } from "./entities/Eren.js";
import { Mikasa } from "./entities/Mikasa.js";
import { KanyeWest } from "./entities/KanyeWest.js";
import { ErenTitan } from "./entities/ErenTitan.js";
import { ProgressionManager } from "./systems/ProgressionManager.js";
import { bookPages, giftImages } from "./data/extraContent.js";

const UNLOCK_KEY = "principito-isabela-desbloqueada";
const DIFFICULTY_KEY = "principito-dificultad";
const FINAL_CARD_DURATION = 15;
const CHARACTER_TYPES = {
  Principito,
  Isabela,
  Eren,
  Mikasa,
  "Kanye West": KanyeWest,
  "Eren Titan": ErenTitan,
};
const CHARACTER_UNLOCK_KEYS = {
  Eren: "eren",
  Mikasa: "mikasa",
  "Kanye West": "kanye",
  "Eren Titan": "erenTitan",
};
const CHARACTER_LABELS = {
  Principito: "EL PRINCIPITO",
  Isabela: "ISABELA",
  Eren: "EREN",
  Mikasa: "MIKASA",
  "Kanye West": "KANYE WEST",
  "Eren Titan": "EREN TITAN",
};
const DIFFICULTIES = {
  facil: { label: "FÁCIL", enemySpeed: 0.9 },
  normal: { label: "NORMAL", enemySpeed: 1 },
  dificil: { label: "DIFÍCIL", enemySpeed: 1.15 },
};

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    if (!this.context) throw new Error("No fue posible crear el contexto 2D del canvas.");
    this.state = GameState.MENU;
    this.developerMode = false;
    this.lastFrameTime = 0;
    this.input = new InputManager();
    this.input.bindTouchControls(document);
    this.bindDeveloperCodePanel();
    this.audio = new AudioManager();
    this.selectedCharacter = "Principito";
    this.progression = new ProgressionManager();
    this.developerMode = this.progression.data.developerUnlockAll;
    this.isIsabelaUnlocked = this.readIsabelaUnlock();
    if (this.isIsabelaUnlocked) this.progression.completeCampaign();
    this.refreshProgressionUnlocks();
    this.campaignStarTotal = this.getCampaignStarTotal();
    this.progression.setTotalStars(this.campaignStarTotal);
    this.progression.registerCollection("campaignStars", this.getCampaignStarIds());
    this.progression.registerCollection("gifts", giftImages.map((gift) => gift.src));
    this.progression.registerCollection("bookPages", bookPages.map((page, index) => page.id ?? `page-${index + 1}`));
    this.refreshProgressionUnlocks();
    this.difficulty = this.readDifficulty();
    this.lives = 3;
    this.levelNumber = 1;
    this.level = null;
    this.personajeActual = null;
    this.camera = null;
    this.zorro = null;
    this.projectiles = [];
    this.level1Renderer = new Nivel1Renderer();
    this.level3BonusGranted = false;
    this.bossHitsTaken = 0;
    this.boss = null;
    this.finalSequence = null;
    this.finalTimer = 0;
    this.finalDialogueIndex = 0;
    this.finalScroll = 0;
    this.juan = new Juan(990, 438);
    this.finalDialogue = [
      "Has llegado muy lejos para proteger lo que amas.",
      "El viaje termina, pero lo aprendido permanece.",
      "Mira las estrellas: siempre encuentran el camino a casa.",
    ];
    this.starsCollected = 0;
    this.message = "";
    this.messageTime = 0;
    this.menuView = "main";
    this.menuCursor = 0;
    this.bookPageIndex = 0;
    this.giftIndex = 0;
    this.giftViewerOpen = false;
    this.giftImageCache = new Map();
    this.visualTime = 0;
    this.zoneTransition = null;
    this.fullscreenRequestPending = false;
    this.canvas.addEventListener("pointerdown", (event) => this.handleCanvasClick(event));
    document.addEventListener("keydown", (event) => this.handleMenuNavigation(event));
    document.addEventListener("pointerdown", () => {
      this.audio.unlock();
      this.requestMobileFullscreen();
    }, { passive: true });
    document.addEventListener("keydown", () => this.audio.unlock());
    this.updateMobileControlsVisibility();
  }

  readIsabelaUnlock() {
    try { return localStorage.getItem(UNLOCK_KEY) === "true"; } catch { return false; }
  }

  unlockIsabela() {
    this.isIsabelaUnlocked = true;
    try { localStorage.setItem(UNLOCK_KEY, "true"); } catch { /* Sigue sin persistencia. */ }
  }

  readDifficulty() {
    try {
      const savedDifficulty = localStorage.getItem(DIFFICULTY_KEY);
      return DIFFICULTIES[savedDifficulty] ? savedDifficulty : "normal";
    } catch {
      return "normal";
    }
  }

  setDifficulty(difficulty) {
    if (!DIFFICULTIES[difficulty]) return;
    this.difficulty = difficulty;
    try { localStorage.setItem(DIFFICULTY_KEY, difficulty); } catch { /* Sigue durante la sesión. */ }
    if (this.level) this.applyDifficultyToActiveZone();
  }

  start() { requestAnimationFrame((time) => this.gameLoop(time)); }

  gameLoop(currentTime) {
    const deltaTime = Math.min((currentTime - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = currentTime;
    this.visualTime = currentTime / 1000;
    this.update(deltaTime);
    this.render();
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  createLevel(number) {
    if (number === 1) return new Nivel1();
    if (number === 2) return new Nivel2();
    if (number === 3) return new Nivel3();
    return new Nivel4();
  }

  createCharacter(spawn) {
    if (!this.isCharacterUnlocked(this.selectedCharacter)) this.selectedCharacter = "Principito";
    const CharacterType = CHARACTER_TYPES[this.selectedCharacter] ?? Principito;
    const character = new CharacterType(spawn.x, spawn.y);
    character.y = this.getCharacterSpawnY(spawn.y, character);
    character.previousY = character.y;
    return character;
  }

  getCharacterSpawnY(spawnY, character = this.personajeActual) {
    // Los puntos del mapa se diseñaron para un personaje de 148 px. Alinear
    // los pies evita que personajes más altos nazcan atravesando plataformas.
    return spawnY - Math.max(0, (character?.height ?? 148) - 148);
  }

  respawnCharacter(spawn) {
    if (!this.personajeActual) return;
    this.personajeActual.respawn(spawn.x, this.getCharacterSpawnY(spawn.y, this.personajeActual));
  }

  getCampaignStarTotal() {
    return [new Nivel1(), new Nivel2(), new Nivel3()]
      .reduce((total, level) => total + level.zones.reduce((zoneTotal, zone) => zoneTotal + zone.stars.length, 0), 0);
  }

  getCampaignStarIds() {
    return [new Nivel1(), new Nivel2(), new Nivel3()]
      .flatMap((level) => level.zones.flatMap((zone) => zone.stars.map((star) => star.id)));
  }

  refreshProgressionUnlocks() {
    this.isExtrasUnlocked = this.progression.isUnlocked("extras");
    this.isLevel4Unlocked = this.progression.isUnlocked("level4");
  }

  isCharacterUnlocked(character) {
    if (this.progression.isUnlocked(CHARACTER_UNLOCK_KEYS[character] ?? `character:${character.toLowerCase().replaceAll(" ", "-")}`)) return true;
    if (character === "Principito") return true;
    if (character === "Isabela") return this.isIsabelaUnlocked;
    const key = CHARACTER_UNLOCK_KEYS[character];
    return Boolean(key && this.progression.isUnlocked(key));
  }

  selectCharacter(character) {
    if (!CHARACTER_TYPES[character] || !this.isCharacterUnlocked(character)) return false;
    this.selectedCharacter = character;
    return true;
  }

  notifyProgressionUnlocks(unlocked, { finalScene = false } = {}) {
    if (!unlocked.length) return;
    this.refreshProgressionUnlocks();
    const labels = {
      eren: "¡EREN DESBLOQUEADO!",
      erenTitan: "¡EREN TITAN DESBLOQUEADO!",
      mikasa: "¡MIKASA DESBLOQUEADA!",
      kanye: "¡KANYE WEST DESBLOQUEADO!",
    };
    const characterUnlock = [...unlocked].reverse().find((key) => labels[key]);
    if (characterUnlock) {
      this.latestCharacterUnlock = labels[characterUnlock];
      if (!finalScene) this.showMessage(this.latestCharacterUnlock, 4);
    }
  }

  recordCampaignChapter(chapter) {
    const unlocked = this.progression.recordChapterComplete(chapter, this.difficulty);
    this.notifyProgressionUnlocks(unlocked);
  }

  startLevel(number) {
    if (number === 4 && !this.progression.isUnlocked("level4")) return false;
    this.levelNumber = number;
    this.level = this.createLevel(number);
    this.bossHitsTaken = 0;
    this.boss = null;
    this.finalSequence = null;
    this.spawnPoint = { ...this.level.spawn };
    this.personajeActual = this.createCharacter(this.spawnPoint);
    if (number === 4) this.level.start(this.personajeActual);
    this.personajeActual.lives = this.lives;
    this.camera = new Camera(this.canvas.width, this.level.worldWidth);
    if (number === 4) this.camera.x = this.level.cameraX;
    else this.camera.follow(this.personajeActual);
    this.zorro = number === 4 ? null : new Zorro(Math.max(0, this.personajeActual.x - 110), this.personajeActual.y + this.personajeActual.height - 48);
    this.personajeActual.lives = this.lives;
    this.projectiles = [];
    this.zoneTransition = null;
    this.starsCollected = 0;
    this.clearMessage();
    this.state = GameState.JUGANDO;
    if (number === 4) this.audio.stopMusic();
    this.audio.playMusic(number);
    this.applyDifficultyToActiveZone();
    this.updateMobileControlsVisibility();
    this.refreshTouchControlLabels();
  }

  startChapter(number) {
    this.lives = 3;
    this.startLevel(number);
  }

  startNewGame() {
    this.lives = 3;
    this.level3BonusGranted = false;
    this.startLevel(1);
  }

  bindDeveloperCodePanel() {
    const form = document.querySelector("#developerCodeForm");
    const input = document.querySelector("#developerCodeInput");
    const status = document.querySelector("#developerCodeStatus");
    if (!form?.addEventListener || !input?.addEventListener) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const activated = this.activateDeveloperMode(input.value);
      if (status) status.textContent = activated ? "Inmortal · todo desbloqueado" : "Código incorrecto";
      if (activated) {
        input.value = "";
        input.blur?.();
      }
    });
    input.addEventListener("pointerdown", () => {
      try { input.focus({ preventScroll: true }); } catch { input.focus(); }
    });

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton?.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "touch") return;
      event.preventDefault();
      form.requestSubmit?.();
    });
  }

  activateDeveloperMode(code) {
    if (String(code).trim().toLowerCase() !== "amor") return false;
    this.developerMode = true;
    this.progression.unlockEverything({ campaignStarIds: this.getCampaignStarIds() });
    this.progression.registerCollection("gifts", giftImages.map((gift) => gift.src));
    this.progression.registerCollection("bookPages", bookPages.map((page, index) => page.id ?? `page-${index + 1}`));
    this.isIsabelaUnlocked = true;
    try { localStorage.setItem(UNLOCK_KEY, "true"); } catch { /* El modo sigue activo en esta sesión. */ }
    this.refreshProgressionUnlocks();
    this.showMessage("MODO DESARROLLADOR · INMORTAL · TODO DESBLOQUEADO", 4);
    return true;
  }

  applyDifficultyToActiveZone() {
    const multiplier = DIFFICULTIES[this.difficulty].enemySpeed;
    this.level.enemies.forEach((enemy) => {
      enemy.speed = enemy.baseSpeed * multiplier;
    });
    if (this.personajeActual?.movementMode === "JETPACK") {
      this.personajeActual.jetpackFuelLimited = this.difficulty === "dificil";
      if (!this.personajeActual.jetpackFuelLimited) this.personajeActual.jetpackFuel = this.personajeActual.jetpackFuelMax;
    }
  }

  returnToMenu() {
    this.state = GameState.MENU;
    this.menuView = "main";
    this.level = null;
    this.personajeActual = null;
    this.zorro = null;
    this.projectiles = [];
    this.zoneTransition = null;
    this.finalSequence = null;
    this.boss = null;
    this.audio.stopMusic();
    this.updateMobileControlsVisibility();
  }

  togglePause() {
    if (this.state === GameState.JUGANDO) {
      this.state = GameState.PAUSA;
      this.input.clearTouchMovement();
      this.audio.pauseMusic();
    } else if (this.state === GameState.PAUSA) {
      this.state = GameState.JUGANDO;
      this.audio.resumeMusic();
    }
    this.updateMobileControlsVisibility();
  }

  requestMobileFullscreen() {
    if (!window.matchMedia?.("(pointer: coarse)").matches || document.fullscreenElement || this.fullscreenRequestPending) return;
    const root = document.documentElement;
    const request = root?.requestFullscreen ?? root?.webkitRequestFullscreen;
    if (!request) return;
    this.fullscreenRequestPending = true;
    Promise.resolve(request.call(root)).catch(() => {}).finally(() => {
      this.fullscreenRequestPending = false;
    });
  }

  restartCurrentLevel() {
    // El nivel activo es la fuente de verdad al reiniciar tras recibir daño.
    this.startLevel(this.level?.id ?? this.levelNumber);
  }

  updateMobileControlsVisibility() {
    const controls = document.querySelector(".mobile-controls");
    if (controls) controls.classList.toggle("is-visible", this.state === GameState.JUGANDO);
    const developerPanel = document.querySelector(".developer-code");
    if (developerPanel) developerPanel.hidden = this.state !== GameState.MENU || this.menuView !== "main";
    this.updateTubeEntryControl();
  }

  refreshTouchControlLabels() {
    if (!this.personajeActual) return;
    const jumpButton = document.querySelector('[data-control="jump"]');
    const attackButton = document.querySelector('[data-control="attack"]');
    const crouchButton = document.querySelector('[data-control="crouch"]');
    if (jumpButton) jumpButton.textContent = this.personajeActual.movementMode === "SWIMMING" ? "BRAZADA" : this.personajeActual.movementMode === "JETPACK" ? "IMPULSO" : "SALTO";
    if (attackButton) attackButton.hidden = !this.personajeActual.hasSword && !this.personajeActual.hasSling;
    if (crouchButton) crouchButton.hidden = this.levelNumber !== 4 || this.state !== GameState.JUGANDO;
  }

  updateTubeEntryControl() {
    const enterButton = document.querySelector('[data-control="enter"]');
    if (!enterButton) return;
    const canEnter = this.state === GameState.JUGANDO && this.isNearTuberia();
    enterButton.classList.toggle("is-available", canEnter);
  }

  isNearTuberia() {
    const entrance = this.level?.tuberia ?? this.level?.zoneExit;
    if (!entrance || this.zoneTransition || this.level.currentZoneIndex >= this.level.zones.length - 1) return false;
    return CollisionSystem.intersects(this.personajeActual, entrance);
  }

  update(deltaTime) {
    if (this.input.consumePause()) {
      this.togglePause();
      return;
    }
    if (this.state === GameState.NIVEL_COMPLETADO && this.input.consumeContinue()) return this.startChapter(this.levelNumber + 1);
    if (this.state === GameState.FINAL) {
      if (this.input.consumeContinue()) this.advanceFinalSequence();
      this.updateFinalSequence(deltaTime);
      return;
    }
    if (this.state === GameState.GAME_OVER && this.input.consumeContinue()) {
      if (this.levelNumber === 4) this.startLevel(4);
      else this.startNewGame();
      return;
    }
    if (this.state !== GameState.JUGANDO) return;

    this.updateMessage(deltaTime);

    if (this.levelNumber === 4) {
      this.updateArcadeLevel(deltaTime);
      return;
    }

    if (this.zoneTransition) {
      this.zoneTransition.time = Math.max(0, this.zoneTransition.time - deltaTime);
      if (this.zoneTransition.time === 0) this.finishZoneTransition();
      return;
    }

    if (this.isNearTuberia() && this.input.consumeEnter()) {
      const entrance = this.level.tuberia ?? this.level.zoneExit;
      this.beginZoneTransition(entrance.targetZone ?? this.level.currentZoneIndex + 1);
      return;
    }

    const actions = this.personajeActual.update(deltaTime, this.input, this.level.worldWidth, this.level.platforms);
    if (actions.jumped) this.audio.playEffect(this.personajeActual.movementMode === "SWIMMING" ? "interaction" : "jump");
    if (actions.attacked) this.audio.playEffect("attack");
    if (actions.attacked === "sling") this.launchSlingShot();
    this.level.enemies.forEach((enemy) => enemy.update(deltaTime, this.projectiles));
    this.projectiles.forEach((projectile) => projectile.update(deltaTime));
    this.projectiles = this.projectiles.filter((projectile) => projectile.active);
    if (this.zorro) {
      this.zorro.update(deltaTime, this.personajeActual, this.level.enemies);
      this.updateFoxGuidance();
    }
    if (this.boss && this.level.bossArena) {
      this.boss.update(deltaTime, this.personajeActual);
      this.checkBossCombat();
      if (this.state !== GameState.JUGANDO) return;
    }
    this.checkAttackCollisions();
    this.checkProjectileCollisions();
    this.checkEnemyCollisions();
    this.checkStarCollisions();
    this.checkPowerCollisions();
    this.refreshTouchControlLabels();
    this.checkObjective();
    if (this.level.id === 1 && this.level.currentZoneIndex === 1 && this.personajeActual.y > this.canvas.height + 35) {
      if (this.developerMode) {
        this.respawnCharacter(this.level.spawn);
        this.camera.follow(this.personajeActual);
      } else this.handlePlayerDeath();
      return;
    }
    this.camera.follow(this.personajeActual);
    this.updateTubeEntryControl();
  }

  updateArcadeLevel(deltaTime) {
    const result = this.level.update(deltaTime, this.personajeActual, this.input, this.developerMode);
    this.camera.x = this.level.cameraX;
    if (result.jumped) this.audio.playEffect("jump");
    if (result.collected) this.audio.playEffect("star");
    if (result.zoneChanged) this.audio.playEffect("interaction");
    if (result.died) {
      this.state = GameState.GAME_OVER;
      this.audio.stopMusic();
      this.updateMobileControlsVisibility();
      return;
    }
    this.refreshTouchControlLabels();
  }

  checkAttackCollisions() {
    const hitbox = this.personajeActual.getAttackHitbox();
    if (!hitbox) return;
    this.level.enemies.forEach((enemy) => {
      if (enemy.active && CollisionSystem.intersects(hitbox, enemy)) {
        enemy.active = false;
        this.registerEnemyDefeat();
      }
    });
  }

  checkBossCombat() {
    if (!this.boss || this.boss.isDefeated || !this.level.bossArena) return;
    const player = this.personajeActual;
    const boss = this.boss;
    const overlap = CollisionSystem.intersects(player, boss);
    const landedOnWeakPoint = overlap && player.velocityY > 0 && player.previousY + player.height <= boss.y + 35;
    if (landedOnWeakPoint && boss.vulnerableTime > 0 && !boss.lastWindowHit && boss.takeStompHit()) {
      player.y = boss.y - player.height;
      player.velocityY = -520;
      player.isOnGround = false;
      this.audio.playEffect(boss.health === 0 ? "victory" : "attack");
      this.showMessage(boss.health === 0 ? "¡El guardián ha caído!" : `Punto débil alcanzado · ${boss.health}/${boss.maxHealth}`, 1.8);
      if (boss.health === 0) this.startFinalSequence();
      return;
    }

    const sword = player.getAttackHitbox();
    if (sword && player.hasSword && CollisionSystem.intersects(sword, boss)
      && boss.stun(this.bossStunDuration(), this.bossStunDuration() + 2.2)) {
      this.audio.playEffect("attack");
      this.showMessage("El guardián queda aturdido; busca su punto débil", 1.8);
    }

    const hitByAttack = boss.getAttackBoxes().some((hitbox) => CollisionSystem.intersects(player, hitbox));
    const bossBodyCollision = overlap && !landedOnWeakPoint && boss.stunTime <= 0;
    if (hitByAttack || bossBodyCollision) this.handleBossHit();
  }

  handleBossHit() {
    const player = this.personajeActual;
    if (this.developerMode) return false;
    if (player.invulnerabilityTime > 0) return false;
    if (this.difficulty === "facil" || this.difficulty === "normal") {
      this.bossHitsTaken += 1;
      if (this.bossHitsTaken < 3) {
        player.invulnerabilityTime = 1.2;
        player.velocityY = -180;
        player.isOnGround = false;
        player.state = "HURT";
        this.audio.playEffect("damage");
        this.showMessage(`Golpe del guardián · ${this.bossHitsTaken}/3`, 1.6);
        return true;
      }
      // El tercer impacto siempre consume una vida aunque aún hubiera invulnerabilidad.
      player.invulnerabilityTime = 0;
    }
    return this.handlePlayerDeath();
  }

  bossStunDuration() {
    return { facil: 4, normal: 3, dificil: 2 }[this.difficulty] ?? 3;
  }

  launchSlingShot() {
    const player = this.personajeActual;
    const x = player.facing > 0 ? player.x + player.width : player.x - 16;
    this.projectiles.push(new Proyectil(x, player.y + 72, player.facing));
  }

  checkProjectileCollisions() {
    this.projectiles.forEach((projectile) => {
      this.level.enemies.forEach((enemy) => {
        if (projectile.active && enemy.active && CollisionSystem.intersects(projectile, enemy)) {
          projectile.active = false;
          enemy.active = false;
          this.registerEnemyDefeat();
        }
      });
      if (!projectile.active) return;
      const hitPlatform = this.level.platforms.some((platform) => CollisionSystem.intersects(projectile, platform));
      if (hitPlatform || projectile.x < 0 || projectile.x > this.level.worldWidth) projectile.active = false;
    });
  }

  registerEnemyDefeat() {
    if (this.level.id !== 3 || this.level.doubleJumpUnlocked) return;

    this.level.enemiesDefeated += 1;
    if (this.level.enemiesDefeated < this.level.doubleJumpUnlockKills) {
      this.showMessage(`Enemigos: ${this.level.enemiesDefeated}/${this.level.doubleJumpUnlockKills}`, 2.2);
      return;
    }

    this.level.doubleJumpUnlocked = true;
    this.personajeActual.enableDoubleJump();
    this.showMessage("✨ DOBLE SALTO DESBLOQUEADO", 3.4);
  }

  showMessage(message, duration = 0) {
    this.message = message;
    this.messageTime = duration;
  }

  clearMessage() {
    this.message = "";
    this.messageTime = 0;
  }

  updateMessage(deltaTime) {
    if (this.messageTime <= 0) return;
    this.messageTime = Math.max(0, this.messageTime - deltaTime);
    if (this.messageTime === 0) this.message = "";
  }

  checkEnemyCollisions() {
    for (const enemy of this.level.enemies) {
      enemy.isTouchingPlayer = enemy.active && CollisionSystem.intersects(this.personajeActual, enemy);
      if (enemy.isTouchingPlayer && this.handlePlayerDeath()) break;
    }
  }

  handlePlayerDeath() {
    if (this.developerMode) return false;
    if (this.personajeActual.invulnerabilityTime > 0 || this.lives <= 0) return false;
    this.personajeActual.takeDamage();
    this.lives = Math.max(0, this.lives - 1);
    this.audio.playEffect("damage");

    if (this.lives === 0) {
      this.personajeActual.lives = 0;
      this.state = GameState.GAME_OVER;
      this.updateMobileControlsVisibility();
      return true;
    }

    this.restartCurrentLevel();
    return true;
  }

  checkStarCollisions() {
    this.level.stars.forEach((star) => {
      if (star.active && CollisionSystem.intersects(this.personajeActual, star)) {
        star.collect();
        this.starsCollected += 1;
        this.notifyProgressionUnlocks(this.progression.collectStar(star.id));
        this.audio.playEffect("star");
      }
    });
  }

  checkPowerCollisions() {
    if (this.level.doubleJumpPower?.active && CollisionSystem.intersects(this.personajeActual, this.level.doubleJumpPower)) {
      this.level.doubleJumpPower.collect();
      this.personajeActual.enableDoubleJump();
      this.showMessage("Doble salto obtenido", 3);
    }
    if (this.level.sword?.active && CollisionSystem.intersects(this.personajeActual, this.level.sword)) {
      this.level.sword.collect();
      this.personajeActual.equipSword();
      this.showMessage("Espada obtenida — pulsa J para atacar", 3);
    }
    if (this.level.sling?.active && CollisionSystem.intersects(this.personajeActual, this.level.sling)) {
      this.level.sling.collect();
      this.personajeActual.equipSling();
      this.showMessage("Honda obtenida — pulsa J para lanzar", 3);
    }
  }

  checkObjective() {
    if (this.level.waterExit?.active !== false && this.level.waterExit && CollisionSystem.intersects(this.personajeActual, this.level.waterExit)) {
      this.level.waterExit.active = false;
      this.personajeActual.deactivateSwimming();
      this.audio.playEffect("interaction");
      this.showMessage("Has alcanzado la superficie", 2.2);
      this.refreshTouchControlLabels();
    }
    if (this.level.bossArena) {
      if (this.boss?.isDefeated && this.state !== GameState.FINAL) this.startFinalSequence();
      return;
    }
    if (this.level.goal && CollisionSystem.intersects(this.personajeActual, this.level.goal)) {
      this.audio.playEffect("victory");
      this.recordCampaignChapter(this.level.id);
      this.state = GameState.NIVEL_COMPLETADO;
    }
  }

  beginZoneTransition(targetZone) {
    if (this.level.id === 3 && targetZone === 2 && !this.level.doubleJumpUnlocked) {
      this.showMessage(`El portal responde a tres enemigos: ${this.level.enemiesDefeated}/3`, 2.4);
      return;
    }
    const exit = this.level.tuberia ?? this.level.zoneExit;
    this.zoneTransition = { targetZone, title: exit?.label ?? "NUEVA ZONA", time: 0.7, duration: 0.7 };
    this.input.clearTouchMovement();
    this.showMessage(exit?.label ? `Atravesando: ${exit.label}` : "Un nuevo camino se abre…", 0.7);
    this.audio.playEffect("interaction");
    this.updateTubeEntryControl();
  }

  finishZoneTransition() {
    const targetZone = this.zoneTransition.targetZone;
    if (!this.level.activateZone(targetZone)) {
      this.zoneTransition = null;
      return;
    }
    this.respawnCharacter(this.level.spawn);
    this.personajeActual.deactivateJetpack();
    this.personajeActual.deactivateSwimming();
    if (this.level.currentZoneIndex === 1 && this.level.id === 1) {
      this.personajeActual.activateJetpack();
      this.personajeActual.jetpackFuelLimited = this.difficulty === "dificil";
      this.personajeActual.jetpackFuel = this.personajeActual.jetpackFuelMax;
      this.showMessage("✦ JETPACK — mantén Espacio para impulsarte", 3);
    } else if (this.level.currentZoneIndex === 1 && this.level.id === 2) {
      this.personajeActual.activateSwimming();
      this.showMessage("Zona sumergida · pulsa SALTO para dar una brazada", 3);
    }
    if (this.level.bossArena) this.enterBossArena();
    this.camera.worldWidth = this.level.worldWidth;
    this.camera.follow(this.personajeActual);
    this.applyDifficultyToActiveZone();
    if (this.zorro) {
      this.zorro.x = Math.max(0, this.personajeActual.x - 110);
      this.zorro.y = this.personajeActual.y + this.personajeActual.height - this.zorro.height;
    }
    this.zoneTransition = null;
    if (this.level.id === 1 && this.level.currentZoneIndex === 1) this.showMessage("JETPACK ACTIVO · Mantén Espacio para impulsarte", 3);
    else if (this.level.id === 2 && this.personajeActual.movementMode === "SWIMMING") this.showMessage("Zona sumergida · pulsa SALTO para dar una brazada", 3);
    else if (this.level.bossArena) this.showMessage("El guardián protege el último sendero", 3);
    else this.showMessage("Nueva zona descubierta", 1.8);
    this.updateTubeEntryControl();
    this.refreshTouchControlLabels();
  }

  enterBossArena() {
    this.boss = new JefeFinal(this.level.bossSpawn?.x ?? 770, 640, this.level.worldWidth, this.difficulty);
    if (!this.level3BonusGranted) {
      this.lives = Math.min(4, this.lives + 1);
      this.personajeActual.lives = this.lives;
      this.level3BonusGranted = true;
      this.showMessage("El Zorro comparte una vida para la arena", 3);
    }
  }

  startFinalSequence() {
    if (this.state === GameState.FINAL) return;
    this.state = GameState.FINAL;
    this.finalSequence = "transition";
    this.finalTimer = 0;
    this.finalDialogueIndex = 0;
    this.finalScroll = 0;
    this.audio.playEffect("victory");
    this.audio.playMusic("final");
    this.updateMobileControlsVisibility();
  }

  advanceFinalSequence() {
    if (this.finalSequence === "transition") this.finalSequence = "juan";
    else if (this.finalSequence === "juan") {
      this.finalDialogueIndex += 1;
      if (this.finalDialogueIndex >= this.finalDialogue.length) this.finalSequence = "poem";
    } else if (this.finalSequence === "poem") this.finalSequence = "credits";
    else if (this.finalSequence === "credits") this.completeFinalCredits();
    else if (this.finalSequence === "victory") this.returnToMenu();
    this.finalTimer = 0;
  }

  updateFinalSequence(deltaTime) {
    if (this.finalSequence === "transition") {
      this.finalTimer += deltaTime;
      if (this.finalTimer >= FINAL_CARD_DURATION) this.advanceFinalSequence();
    } else if (this.finalSequence === "poem") {
      this.finalTimer += deltaTime;
      if (this.finalTimer >= FINAL_CARD_DURATION) this.advanceFinalSequence();
    } else if (this.finalSequence === "credits") {
      this.finalTimer += deltaTime;
      this.finalScroll += deltaTime * 42;
      if (this.finalTimer >= FINAL_CARD_DURATION) this.completeFinalCredits();
    }
  }

  completeFinalCredits() {
    if (this.selectedCharacter === "Principito") this.unlockIsabela();
    const difficultyUnlocks = this.progression.recordChapterComplete(3, this.difficulty);
    const campaignUnlocks = this.progression.completeCampaign();
    this.notifyProgressionUnlocks([...difficultyUnlocks, ...campaignUnlocks], { finalScene: true });
    this.finalSequence = "victory";
    this.finalTimer = 0;
  }

  startJetpackSection() {
    this.level.jetpackStarted = true;
    this.respawnCharacter(this.level.spawn);
    this.personajeActual.activateJetpack();
    this.personajeActual.jetpackFuelLimited = this.difficulty === "dificil";
    this.personajeActual.jetpackFuel = this.personajeActual.jetpackFuelMax;
    this.spawnPoint = { ...this.level.spawn };
    this.camera.follow(this.personajeActual);
    this.showMessage("✦ JETPACK ACTIVADO — mantén Espacio para subir", 3.2);
  }

  updateFoxGuidance() {
    if (this.level.id !== 1) {
      this.zorro.routeHint = this.level.id === 3 ? "El Zorro te acompaña hasta la meta" : "El Zorro marca el camino seguro";
      return;
    }
    const x = this.personajeActual.x;
    if (x < 700) this.zorro.routeHint = "El Zorro señala el brillo del doble salto";
    else if (x < 2500) this.zorro.routeHint = "El Zorro vigila las rutas altas y la Honda";
    else if (x < 3400) this.zorro.routeHint = "El Zorro apunta hacia la tubería estelar";
    else this.zorro.routeHint = "El Zorro celebra el vuelo";
  }

  handleCanvasClick(event) {
    this.audio.unlock();
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (this.canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (this.canvas.height / rect.height);
    if (this.state === GameState.PAUSA) {
      if (y >= 350 && y <= 405) this.togglePause();
      else if (y >= 420 && y <= 475) this.restartCurrentLevel();
      else if (y >= 490 && y <= 545) this.returnToMenu();
      return;
    }
    if (this.state === GameState.GAME_OVER) {
      if (y >= 400 && y <= 455) {
        if (this.levelNumber === 4) this.startLevel(4);
        else this.startNewGame();
      }
      else if (y >= 470 && y <= 525) this.returnToMenu();
      return;
    }
    if (this.state === GameState.NIVEL_COMPLETADO) {
      this.startChapter(this.levelNumber + 1);
      return;
    }
    if (this.state === GameState.FINAL) {
      this.advanceFinalSequence();
      return;
    }
    if (this.state !== GameState.MENU) return;
    if (this.menuView !== "main") {
      this.handleExtrasClick(x, y);
      return;
    }
    if (y >= 194 && y <= 252) {
      const option = this.getMainCharacterOptions()[x < this.canvas.width / 2 ? 0 : 1];
      if (option) this.selectCharacter(option.id);
    } else if (y >= 350 && y <= 392) this.setDifficulty(x < 426 ? "facil" : x < 853 ? "normal" : "dificil");
    else if (y >= 419 && y <= 474) this.startNewGame();
    else if (this.isIsabelaUnlocked && y >= 526 && y <= 570) {
      if (x >= 205 && x <= 435) this.startChapter(1);
      else if (x >= 525 && x <= 755) this.startChapter(2);
      else if (x >= 845 && x <= 1075) this.startChapter(3);
    } else if (y >= 590 && y <= 642 && x >= 1000 && x <= 1230 && this.isExtrasUnlocked) this.openMenuView("extras");
  }

  openMenuView(view) {
    this.menuView = view;
    this.menuCursor = 0;
    this.giftViewerOpen = false;
    this.updateMobileControlsVisibility();
  }

  returnFromExtrasView() {
    if (this.giftViewerOpen) {
      this.giftViewerOpen = false;
      return;
    }
    if (this.menuView === "characters" || this.menuView === "book" || this.menuView === "gifts") {
      this.menuView = "extras";
      this.menuCursor = 0;
    } else {
      this.menuView = "main";
      this.menuCursor = 0;
    }
    this.updateMobileControlsVisibility();
  }

  handleMenuNavigation(event) {
    if (this.state !== GameState.MENU || this.menuView === "main") return;
    if (event.key === "Escape" || event.key === "Backspace") {
      event.preventDefault();
      this.returnFromExtrasView();
      return;
    }
    if (this.menuView === "book" && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      if (!bookPages.length) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      this.bookPageIndex = (this.bookPageIndex + direction + bookPages.length) % bookPages.length;
      return;
    }
    if (this.menuView === "gifts" && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      if (!giftImages.length) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      this.giftIndex = (this.giftIndex + direction + giftImages.length) % giftImages.length;
      return;
    }
    const itemCount = this.menuView === "extras" ? 5 : this.menuView === "characters" ? this.getCharacterOptions().length + 1 : 1;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      this.menuCursor = (this.menuCursor + 1) % itemCount;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      this.menuCursor = (this.menuCursor - 1 + itemCount) % itemCount;
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (this.menuView === "extras") {
        if (this.menuCursor === 0) this.openMenuView("characters");
        else if (this.menuCursor === 1) this.openMenuView("book");
        else if (this.menuCursor === 2) this.openMenuView("gifts");
        else if (this.menuCursor === 3 && this.isLevel4Unlocked) this.startLevel(4);
        else if (this.menuCursor === 4) this.returnFromExtrasView();
      } else if (this.menuView === "characters") {
        const option = this.getCharacterOptions()[this.menuCursor];
        if (option) this.selectCharacter(option.id);
        else this.returnFromExtrasView();
      }
    }
  }

  handleExtrasClick(x, y) {
    if (this.menuView === "extras") {
      if (x < 440 || x > 840) return;
      if (y >= 186 && y <= 254) this.openMenuView("characters");
      else if (y >= 268 && y <= 336) this.openMenuView("book");
      else if (y >= 350 && y <= 418) this.openMenuView("gifts");
      else if (y >= 432 && y <= 500 && this.isLevel4Unlocked) this.startLevel(4);
      else if (y >= 514 && y <= 582) this.returnFromExtrasView();
      return;
    }
    if (this.menuView === "characters") {
      if (y >= 150 && y <= 375) {
        const row = y < 270 ? 0 : 1;
        const column = Math.min(2, Math.max(0, Math.floor(x / (this.canvas.width / 3))));
        const option = this.getCharacterOptions()[row * 3 + column];
        if (option) this.selectCharacter(option.id);
      } else if (y >= 570 && y <= 640 && x >= 440 && x <= 840) this.returnFromExtrasView();
      return;
    }
    if (this.menuView === "book") {
      if (y >= 570 && y <= 640) {
        if (x < 450) this.returnFromExtrasView();
        else if (bookPages.length && x < 640) this.bookPageIndex = Math.max(0, this.bookPageIndex - 1);
        else if (bookPages.length && x < 830) this.bookPageIndex = Math.min(bookPages.length - 1, this.bookPageIndex + 1);
      }
      return;
    }
    if (this.menuView === "gifts") {
      if (y >= 570 && y <= 640) {
        if (x < 450) this.returnFromExtrasView();
        else if (giftImages.length && x < 640) this.giftIndex = (this.giftIndex - 1 + giftImages.length) % giftImages.length;
        else if (giftImages.length && x < 830) this.giftIndex = (this.giftIndex + 1) % giftImages.length;
        else if (this.giftViewerOpen && x <= 1070) this.returnFromExtrasView();
        return;
      }
      if (giftImages.length && x >= 160 && x <= 1120 && y >= 145 && y <= 540) {
        if (this.giftViewerOpen) this.giftViewerOpen = false;
        else this.giftViewerOpen = true;
      }
    }
  }

  getGiftImage(gift) {
    if (!gift?.src || typeof Image !== "function") return null;
    if (!this.giftImageCache.has(gift.src)) {
      const image = new Image();
      image.src = gift.src;
      this.giftImageCache.set(gift.src, image);
    }
    const image = this.giftImageCache.get(gift.src);
    return image.complete && image.naturalWidth > 0 ? image : null;
  }

  getCharacterOptions() {
    return ["Principito", "Isabela", "Eren", "Mikasa", "Kanye West", "Eren Titan"]
      .map((id) => ({ id, label: CHARACTER_LABELS[id], unlocked: this.isCharacterUnlocked(id) }));
  }

  getMainCharacterOptions() {
    return this.getCharacterOptions().slice(0, 2);
  }

  getCharacterRequirement(character) {
    if (this.isCharacterUnlocked(character)) return "DISPONIBLE";
    return {
      Isabela: "Completa la campaña para desbloquearla",
      Eren: "Desbloqueo: 70% de estrellas únicas",
      "Eren Titan": "Desbloqueo: 100% de estrellas únicas",
      Mikasa: "Desbloqueo: campaña completa en NORMAL",
      "Kanye West": "Desbloqueo: campaña completa en DIFÍCIL",
    }[character] ?? "Bloqueado";
  }

  render() {
    const { context, canvas } = this;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = false;
    if (this.state === GameState.MENU) return this.drawMenu();
    if (this.state === GameState.FINAL) return this.drawFinalScene();
    this.drawBackground();
    if (this.level.id === 4) this.level.drawWorld(context, canvas, this.camera.x, this.personajeActual, this.visualTime);
    else { context.save(); context.translate(-this.camera.x, 0); this.drawWorld(); context.restore(); }
    this.drawInterface();
  }

  drawWorld() {
    this.drawLevelDecorations();
    this.level.platforms.forEach((platform) => {
      if (this.isVisibleInCamera(platform)) platform.draw(this.context);
    });
    this.level.stars.forEach((star) => {
      if (this.isVisibleInCamera(star)) star.draw(this.context);
    });
    if (this.level.doubleJumpPower && this.isVisibleInCamera(this.level.doubleJumpPower)) this.level.doubleJumpPower.draw(this.context);
    if (this.level.sword && this.isVisibleInCamera(this.level.sword)) this.level.sword.draw(this.context);
    if (this.level.sling && this.isVisibleInCamera(this.level.sling)) this.level.sling.draw(this.context);
    this.level.enemies.forEach((enemy) => {
      if (this.isVisibleInCamera(enemy)) enemy.draw(this.context);
    });
    this.projectiles.forEach((projectile) => {
      if (this.isVisibleInCamera(projectile)) projectile.draw(this.context);
    });
    this.drawForegroundDetails();
    this.drawGoal(); this.drawWorldExits(); this.boss?.draw(this.context); this.zorro?.draw(this.context);
    // El personaje se dibuja al final del mundo: así se mantiene visible frente
    // a niebla, cristales u otros detalles decorativos de cualquier capítulo.
    this.personajeActual.draw(this.context);
  }

  isVisibleInCamera(object, padding = 100) {
    const cameraX = this.camera?.x ?? 0;
    const width = object.width ?? 0;
    return object.x + width >= cameraX - padding && object.x <= cameraX + this.canvas.width + padding;
  }

  drawBackground() {
    if (this.level.id === 4) {
      this.level.drawBackground(this.context, this.canvas, this.camera.x, this.visualTime);
      return;
    }
    if (this.level.id === 1) {
      this.level1Renderer.drawBackground(this.context, this.canvas, this.camera.x, this.level.currentZoneIndex, this.visualTime);
      return;
    }
    if (this.level.id === 2 && this.level.currentZoneIndex === 1) {
      this.drawUnderwaterBackground();
      return;
    }
    if (this.level.id === 3 && this.level.bossArena) {
      this.drawArenaBackground();
      return;
    }
    if (this.level.id === 3 && this.level.currentZoneIndex === 1) {
      this.drawRuinsBackground();
      return;
    }
    if (this.level.theme === "jardin") this.drawGardenBackground();
    else if (this.level.theme === "zorro") this.drawFoxBackground();
    else this.drawFinalBackground();
  }

  drawGardenBackground() {
    const c = this.context;
    const sky = c.createLinearGradient(0, 0, 0, this.canvas.height);
    sky.addColorStop(0, "#3d6682");
    sky.addColorStop(0.38, "#d99183");
    sky.addColorStop(0.7, "#f2ba83");
    sky.addColorStop(1, "#487c7f");
    c.fillStyle = sky; c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawSun(970, 170, 72, "#ffe7a6", "rgb(255 221 145 / 38%)");
    this.drawCloudBank("#f8cdb4", 95, 0.16, 0.16);
    this.drawMountainRange(0.12, 365, "#7fa1a0", 125, 450);
    this.drawMountainRange(0.25, 430, "#527783", 105, 380);
    this.drawGardenHaze();
    this.drawPineLine(475, "#2d5f62", 0.42);
    this.drawFireflies("#fff0a5", 18);
  }

  drawGardenHaze() {
    const c = this.context;
    const haze = c.createLinearGradient(0, 330, 0, 560);
    haze.addColorStop(0, "rgb(255 237 203 / 0%)");
    haze.addColorStop(0.55, "rgb(255 232 197 / 20%)");
    haze.addColorStop(1, "rgb(161 223 204 / 8%)");
    c.fillStyle = haze; c.fillRect(0, 300, this.canvas.width, 270);
    c.save(); c.globalAlpha = 0.17; c.fillStyle = "#274f50";
    const shift = -((this.camera?.x ?? 0) * 0.31 % 230);
    for (let x = shift - 180; x < this.canvas.width + 180; x += 230) {
      c.beginPath(); c.ellipse(x + 90, 458, 95, 52, 0, Math.PI, Math.PI * 2); c.fill();
      c.fillRect(x + 84, 414, 13, 44);
    }
    c.restore();
  }

  drawFoxBackground() {
    const c = this.context;
    const sky = c.createLinearGradient(0, 0, 0, this.canvas.height);
    sky.addColorStop(0, "#365675"); sky.addColorStop(0.52, "#e5a665"); sky.addColorStop(1, "#8f6644");
    c.fillStyle = sky; c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawSun(925, 150, 61, "#ffe0a0", "rgb(255 215 138 / 34%)");
    this.drawCloudBank("#ffe4b4", 105, 0.12, 0.12);
    this.drawMountainRange(0.16, 390, "#ad7852", 95, 370);
    this.drawMountainRange(0.34, 475, "#74523e", 105, 320);
    this.drawPineLine(510, "#694f42", 0.46);
    this.drawFireflies("#f6cf7d", 13);
  }

  drawRuinsBackground() {
    const c = this.context;
    const sky = c.createLinearGradient(0, 0, 0, this.canvas.height);
    sky.addColorStop(0, "#252540"); sky.addColorStop(0.45, "#51435d"); sky.addColorStop(1, "#23263a");
    c.fillStyle = sky; c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawMoonAndStars();
    this.drawMountainRange(0.16, 490, "#37374f", 170, 350);
    this.drawCloudBank("#9b8090", 230, 0.12, 0.12);
    c.fillStyle = "rgb(211 157 125 / 12%)"; c.fillRect(0, 530, this.canvas.width, 190);
  }

  drawFinalBackground() {
    const c = this.context;
    const sky = c.createLinearGradient(0, 0, 0, this.canvas.height);
    sky.addColorStop(0, "#16182f"); sky.addColorStop(0.5, "#3a315a"); sky.addColorStop(1, "#191c35");
    c.fillStyle = sky; c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawMoonAndStars();
    this.drawMountainRange(0.18, 430, "#302a4d", 160, 390);
    this.drawMountainRange(0.4, 510, "#25233d", 120, 300);
    this.drawCrystalSkyline();
    const mist = c.createLinearGradient(0, 480, 0, 640);
    mist.addColorStop(0, "rgb(178 159 255 / 0%)"); mist.addColorStop(1, "rgb(178 159 255 / 26%)");
    c.fillStyle = mist; c.fillRect(0, 440, this.canvas.width, 200);
  }

  drawCrystalSkyline() {
    const c = this.context; const shift = -((this.camera?.x ?? 0) * 0.22 % 190);
    c.save(); c.globalAlpha = 0.28; c.fillStyle = "#71669b";
    for (let x = shift - 190; x < this.canvas.width + 190; x += 190) {
      c.beginPath(); c.moveTo(x, 525); c.lineTo(x + 32, 385); c.lineTo(x + 58, 525); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(x + 72, 525); c.lineTo(x + 102, 425); c.lineTo(x + 130, 525); c.closePath(); c.fill();
    }
    c.restore();
  }

  drawSun(x, y, radius, color, glow) {
    const c = this.context;
    const halo = c.createRadialGradient(x, y, 4, x, y, radius * 2.8);
    halo.addColorStop(0, glow); halo.addColorStop(1, "rgb(255 235 180 / 0%)");
    c.fillStyle = halo; c.beginPath(); c.arc(x, y, radius * 2.8, 0, Math.PI * 2); c.fill();
    c.fillStyle = color; c.beginPath(); c.arc(x, y, radius, 0, Math.PI * 2); c.fill();
  }

  drawCloudBank(color, y, alpha, parallax) {
    const c = this.context; const shift = -((this.camera?.x ?? 0) * parallax % 520);
    c.save(); c.globalAlpha = alpha; c.fillStyle = color;
    for (let x = shift - 260; x < this.canvas.width + 350; x += 260) {
      c.beginPath(); c.ellipse(x, y, 86, 28, 0, 0, Math.PI * 2); c.ellipse(x + 72, y - 15, 72, 35, 0, 0, Math.PI * 2); c.ellipse(x + 135, y + 4, 105, 27, 0, 0, Math.PI * 2); c.fill();
    }
    c.restore();
  }

  drawMountainRange(parallax, baseY, color, height, spacing) {
    const c = this.context; const shift = -((this.camera?.x ?? 0) * parallax % spacing);
    c.save(); c.fillStyle = color;
    for (let x = shift - spacing; x < this.canvas.width + spacing; x += spacing) {
      const peak = baseY - height + ((Math.round(x / spacing) % 2) * 32);
      c.beginPath(); c.moveTo(x, baseY); c.lineTo(x + spacing * 0.45, peak); c.lineTo(x + spacing, baseY); c.closePath(); c.fill();
      c.fillStyle = "rgb(255 250 218 / 9%)"; c.beginPath(); c.moveTo(x + spacing * 0.45, peak); c.lineTo(x + spacing * 0.61, baseY); c.lineTo(x + spacing * 0.45, baseY - 30); c.closePath(); c.fill(); c.fillStyle = color;
    }
    c.restore();
  }

  drawPineLine(baseY, color, parallax) {
    const c = this.context; const shift = -((this.camera?.x ?? 0) * parallax % 92);
    c.save(); c.fillStyle = color;
    for (let x = shift - 100; x < this.canvas.width + 100; x += 92) {
      const height = 44 + ((x + 500) % 3) * 13;
      c.beginPath(); c.moveTo(x, baseY); c.lineTo(x + 19, baseY - height); c.lineTo(x + 37, baseY); c.closePath(); c.fill();
      c.fillRect(x + 16, baseY - 17, 6, 21);
    }
    c.restore();
  }

  drawFireflies(color, amount) {
    const c = this.context; c.save(); c.fillStyle = color; c.shadowColor = color; c.shadowBlur = 10;
    for (let index = 0; index < amount; index += 1) {
      const x = (index * 137 + 96) % this.canvas.width;
      const y = 150 + (index * 71) % 345 + Math.sin(this.visualTime * 1.4 + index) * 8;
      c.globalAlpha = 0.28 + (Math.sin(this.visualTime * 2 + index) + 1) * 0.2;
      c.beginPath(); c.arc(x, y, index % 3 === 0 ? 2 : 1, 0, Math.PI * 2); c.fill();
    }
    c.restore();
  }

  drawMoonAndStars() {
    const c = this.context; c.save(); c.fillStyle = "#d9d5ff";
    for (let index = 0; index < 48; index += 1) {
      const x = (index * 97 + 31) % this.canvas.width; const y = 24 + (index * 47) % 295;
      c.globalAlpha = 0.35 + (Math.sin(this.visualTime + index) + 1) * 0.2;
      c.fillRect(x, y, index % 4 === 0 ? 3 : 2, index % 4 === 0 ? 3 : 2);
    }
    c.globalAlpha = 1; this.drawSun(1005, 136, 42, "#ded9ff", "rgb(194 181 255 / 32%)"); c.restore();
  }

  drawLevelDecorations() {
    if (this.level.id === 1) {
      this.level1Renderer.drawDecorations(this.context, this.level.worldWidth, this.level.currentZoneIndex, this.camera.x, this.canvas.width, this.visualTime);
      return;
    }
    if (this.level.id === 2 && this.level.currentZoneIndex === 1) {
      this.drawUnderwaterDecorations();
      return;
    }
    if (this.level.id === 3 && this.level.bossArena) {
      this.drawArenaDecorations();
      return;
    }
    if (this.level.id === 3 && this.level.currentZoneIndex === 1) {
      for (const [x, y, scale] of [[320, 620, 0.8], [810, 620, 1.1], [1370, 620, 0.92], [1830, 620, 1.18]]) {
        this.drawRuinedArch(x, y);
        this.drawCrystalSpire(x + 105, y, scale);
      }
      return;
    }
    if (this.level.theme === "jardin") this.drawGarden();
    else if (this.level.theme === "zorro") this.drawFoxPlanet();
    else this.drawFinalPlanet();
  }

  drawGarden() {
    const c = this.context;
    const water = c.createLinearGradient(0, 560, 0, 640);
    water.addColorStop(0, "#4eabb0"); water.addColorStop(1, "#194e62"); c.fillStyle = water; c.fillRect(0, 558, this.level.worldWidth, 82);
    c.save(); c.globalAlpha = 0.38; c.strokeStyle = "#c2f2df"; c.lineWidth = 2;
    for (let x = 0; x < this.level.worldWidth; x += 95) { const waveY = 575 + (x % 4) * 10; c.beginPath(); c.moveTo(x, waveY); c.quadraticCurveTo(x + 24, waveY - 5, x + 50, waveY); c.stroke(); }
    c.restore();
    for (let x = 90; x < this.level.worldWidth; x += 720) {
      const scale = 0.82 + ((Math.floor(x / 720) % 3) * 0.14);
      this.drawGardenTree(x, 540, scale);
    }
    for (let x = 20; x < this.level.worldWidth; x += 360) {
      this.drawPagoda(x + 142, 430, x % 720 === 20 ? 0.67 : 0.52);
      this.drawReeds(x + 270, 607);
      this.drawLantern(x + 36, 552);
      this.drawLotus(x + 230, 610, 0.82);
      this.drawLotus(x + 292, 620, 0.48);
      this.drawGardenShrub(x + 320, 607, x % 720 === 20 ? "#b95c83" : "#568568");
    }
    this.drawBuddha(1460, 395); this.drawRose(1860, 568);
    this.drawWaterfall(1468, 500);
    this.drawGardenBridge(2860, 545);
    this.drawTuberia();
    this.drawJetpackCourse();
  }

  drawGardenBridge(x, y) {
    const c = this.context;
    c.save(); c.translate(x, y);
    c.strokeStyle = "#5b3b34"; c.lineWidth = 10;
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(110, -66, 230, 0); c.stroke();
    c.strokeStyle = "#d59b5b"; c.lineWidth = 5;
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(110, -66, 230, 0); c.stroke();
    for (let step = 0; step <= 10; step += 1) {
      const bridgeX = step * 23;
      const bridgeY = -Math.sin((step / 10) * Math.PI) * 59;
      c.fillStyle = "#9b693f"; c.fillRect(bridgeX, bridgeY, 20, 8);
    }
    c.restore();
  }

  drawTuberia() {
    const pipe = this.level.tuberia;
    if (!pipe) return;
    const c = this.context;
    c.save(); c.translate(pipe.x, pipe.y);
    c.fillStyle = "rgb(18 30 40 / 30%)"; c.fillRect(8, 132, 94, 12);
    c.fillStyle = "#315d70"; c.fillRect(12, 22, 80, 118);
    c.fillStyle = "#5fa8a1"; c.fillRect(18, 28, 20, 106);
    c.fillStyle = "#264653"; c.fillRect(0, 0, 105, 30);
    c.fillStyle = "#7ccfc1"; c.fillRect(7, 5, 91, 18);
    c.fillStyle = "#c8f6d3"; c.fillRect(20, 8, 34, 5);
    c.fillStyle = "#fff1b0"; c.font = "bold 15px Arial"; c.textAlign = "center";
    c.fillText("TUBERÍA", 52, -10);
    c.restore();
  }

  drawJetpackCourse() {
    if (this.level.id !== 1) return;
    const c = this.context;
    c.save(); c.globalAlpha = 0.5;
    for (const [x, y, height] of [[4040, 70, 210], [4520, 420, 180], [4920, 70, 245], [5340, 410, 165], [5720, 65, 220]]) {
      c.fillStyle = "#315b65"; c.fillRect(x, y, 48, height);
      c.fillStyle = "#79b6b0"; c.fillRect(x + 7, y, 10, height);
      c.fillStyle = "#d8f3d7"; c.fillRect(x + 23, y + 15, 5, height - 30);
    }
    c.restore();
  }

  drawFoxPlanet() {
    const c = this.context;
    for (let x = -90; x < this.level.worldWidth; x += 300) {
      c.fillStyle = "#b9804d"; c.beginPath(); c.ellipse(x + 150, 628, 220, 72, 0, Math.PI, Math.PI * 2); c.fill();
      this.drawDesertRock(x + 42, 594, 1); this.drawDesertGrass(x + 246, 615);
      if (x % 600 === -90) this.drawFoxTree(x + 162, 553);
      if (x % 600 === 210) this.drawDesertFlower(x + 100, 609);
    }
  }

  drawFinalPlanet() {
    for (let x = -80; x < this.level.worldWidth; x += 260) {
      this.drawCrystalSpire(x + 100, 630, 0.8 + (x % 3) * 0.08);
      if (x % 520 === -80) this.drawRuinedArch(x + 170, 590);
      if (x % 520 === 180) this.drawCrystalCluster(x + 205, 630);
    }
  }

  drawGardenTree(x, groundY, scale) {
    const c = this.context; c.save(); c.translate(x, groundY); c.scale(scale, scale);
    const trunk = c.createLinearGradient(-15, -200, 20, 0); trunk.addColorStop(0, "#6c4b3f"); trunk.addColorStop(1, "#2a4037");
    c.strokeStyle = trunk; c.lineWidth = 22; c.lineCap = "round"; c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-10, -80, 26, -118, 6, -185); c.stroke();
    c.lineWidth = 11; c.beginPath(); c.moveTo(5, -120); c.lineTo(-54, -154); c.moveTo(8, -145); c.lineTo(55, -186); c.stroke();
    const foliage = c.createRadialGradient(-18, -190, 8, 0, -165, 105); foliage.addColorStop(0, "#7ca568"); foliage.addColorStop(0.58, "#3d745f"); foliage.addColorStop(1, "#244c48"); c.fillStyle = foliage;
    for (const [leafX, leafY, radius] of [[-54, -165, 43], [-16, -197, 54], [33, -189, 47], [68, -162, 36], [-77, -132, 32]]) { c.beginPath(); c.arc(leafX, leafY, radius, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = "#d9789b"; c.globalAlpha = 0.82;
    for (const [leafX, leafY] of [[-53, -177], [-10, -212], [35, -197], [68, -170]]) { c.beginPath(); c.ellipse(leafX, leafY, 24, 15, -0.35, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = "#ffe0ee"; c.globalAlpha = 0.7;
    for (const [leafX, leafY] of [[-68, -157], [-28, -198], [14, -211], [51, -181], [80, -157]]) { c.beginPath(); c.arc(leafX, leafY, 3, 0, Math.PI * 2); c.fill(); }
    c.restore();
  }

  drawPagoda(x, y, scale) {
    const c = this.context; c.save(); c.translate(x, y); c.scale(scale, scale);
    c.fillStyle = "rgb(18 38 49 / 32%)"; c.fillRect(25, 47, 96, 104);
    const walls = c.createLinearGradient(30, 45, 110, 150); walls.addColorStop(0, "#6e9aa0"); walls.addColorStop(1, "#294d5d"); c.fillStyle = walls; c.fillRect(32, 43, 78, 104);
    c.fillStyle = "#d4a966"; c.fillRect(49, 84, 13, 63); c.fillRect(81, 84, 13, 63);
    c.fillStyle = "#f6cf78"; c.fillRect(64, 89, 16, 58);
    c.strokeStyle = "#1d3f4b"; c.lineWidth = 5;
    for (const roofY of [45, 8, -30]) { c.fillStyle = "#245262"; c.beginPath(); c.moveTo(1, roofY + 25); c.quadraticCurveTo(17, roofY + 31, 32, roofY + 19); c.lineTo(72, roofY - 17); c.lineTo(112, roofY + 19); c.quadraticCurveTo(128, roofY + 31, 143, roofY + 25); c.lineTo(128, roofY + 31); c.lineTo(16, roofY + 31); c.closePath(); c.fill(); c.stroke(); }
    c.strokeStyle = "#8cc2bf"; c.globalAlpha = 0.48; c.lineWidth = 2; for (const roofY of [45, 8, -30]) { c.beginPath(); c.moveTo(18, roofY + 23); c.quadraticCurveTo(72, roofY - 4, 126, roofY + 23); c.stroke(); }
    c.globalAlpha = 1; c.fillStyle = "#f8d88a"; c.fillRect(58, 59, 9, 10); c.fillRect(78, 59, 9, 10);
    c.fillStyle = "#e3bd68"; c.fillRect(68, -51, 8, 21); c.beginPath(); c.arc(72, -54, 6, 0, Math.PI * 2); c.fill(); c.restore();
  }

  drawBuddha(x, y) {
    const c = this.context; c.save(); c.translate(x, y);
    c.fillStyle = "rgb(8 36 44 / 25%)"; c.beginPath(); c.ellipse(0, 151, 98, 22, 0, 0, Math.PI * 2); c.fill();
    const stone = c.createLinearGradient(-80, 0, 70, 150); stone.addColorStop(0, "#779a91"); stone.addColorStop(1, "#315a5b"); c.fillStyle = stone;
    c.beginPath(); c.ellipse(0, 100, 83, 51, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(0, 34, 31, 0, Math.PI * 2); c.fill();
    for (let xOffset = -17; xOffset <= 17; xOffset += 8) { c.beginPath(); c.arc(xOffset, 12 - Math.abs(xOffset) / 3, 10, 0, Math.PI * 2); c.fill(); }
    c.strokeStyle = "#b6d2b8"; c.globalAlpha = 0.55; c.lineWidth = 3; c.beginPath(); c.arc(0, 37, 18, 0.2, Math.PI - 0.2); c.stroke(); c.restore();
  }

  drawWaterfall(x, y) {
    const c = this.context; c.save(); c.globalAlpha = 0.5; const water = c.createLinearGradient(x, y, x, y + 118); water.addColorStop(0, "#e0ffff"); water.addColorStop(1, "#76c9d6"); c.fillStyle = water; c.beginPath(); c.moveTo(x - 22, y); c.quadraticCurveTo(x, y + 40, x - 8, y + 118); c.lineTo(x + 18, y + 118); c.quadraticCurveTo(x + 10, y + 48, x + 29, y); c.closePath(); c.fill(); c.restore();
  }

  drawLotus(x, y, size) {
    const c = this.context; c.save(); c.translate(x, y); c.fillStyle = "#315d51"; c.beginPath(); c.ellipse(0, 6, 26 * size, 11 * size, 0, 0, Math.PI * 2); c.fill();
    for (let petal = 0; petal < 10; petal += 1) { c.save(); c.rotate((Math.PI * 2 * petal) / 10); const petalGradient = c.createLinearGradient(0, -30 * size, 0, 0); petalGradient.addColorStop(0, "#ffd1df"); petalGradient.addColorStop(1, petal % 2 ? "#e77da5" : "#f49cbd"); c.fillStyle = petalGradient; c.beginPath(); c.ellipse(0, -22 * size, 9 * size, 25 * size, 0, 0, Math.PI * 2); c.fill(); c.restore(); }
    c.fillStyle = "#ffe7a4"; c.beginPath(); c.arc(0, 0, 8 * size, 0, Math.PI * 2); c.fill(); c.restore();
  }

  drawLantern(x, y) {
    const c = this.context; c.save(); c.translate(x, y); c.fillStyle = "#273d44"; c.fillRect(-3, 0, 6, 57); c.fillStyle = "rgb(255 205 116 / 20%)"; c.beginPath(); c.arc(0, 20, 32, 0, Math.PI * 2); c.fill(); c.fillStyle = "#f8cf7e"; c.fillRect(-13, 7, 26, 25); c.strokeStyle = "#4f3a34"; c.lineWidth = 4; c.strokeRect(-13, 7, 26, 25); c.fillStyle = "#263c43"; c.beginPath(); c.moveTo(-18, 7); c.lineTo(0, -9); c.lineTo(18, 7); c.closePath(); c.fill(); c.restore();
  }

  drawReeds(x, y) {
    const c = this.context; c.save(); c.strokeStyle = "#5c8150"; c.lineWidth = 3; for (let index = 0; index < 7; index += 1) { c.beginPath(); c.moveTo(x + index * 5, y); c.quadraticCurveTo(x + index * 7, y - 28, x + index * 3, y - 50); c.stroke(); } c.restore();
  }

  drawGardenShrub(x, y, color) {
    const c = this.context; c.save(); c.fillStyle = color;
    for (const [offsetX, offsetY, radius] of [[0, 0, 21], [20, -10, 18], [40, 0, 22], [57, -8, 15]]) { c.beginPath(); c.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2); c.fill(); }
    c.globalAlpha = 0.4; c.fillStyle = "#ffe0ef"; c.beginPath(); c.arc(x + 20, y - 13, 6, 0, Math.PI * 2); c.arc(x + 48, y - 3, 5, 0, Math.PI * 2); c.fill(); c.restore();
  }

  drawRose(x, y) {
    const c = this.context; c.save(); c.translate(x, y); c.shadowColor = "#f294b5"; c.shadowBlur = 12; c.strokeStyle = "#466b49"; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 39); c.lineTo(0, 1); c.stroke(); c.fillStyle = "#d74d76";
    for (let petal = 0; petal < 8; petal += 1) { c.save(); c.rotate((Math.PI * 2 * petal) / 8); c.beginPath(); c.ellipse(0, -12, 9, 16, 0, 0, Math.PI * 2); c.fill(); c.restore(); } c.fillStyle = "#ffe7b0"; c.beginPath(); c.arc(0, 0, 6, 0, Math.PI * 2); c.fill(); c.restore();
  }

  drawDesertRock(x, y, scale) {
    const c = this.context; c.save(); c.translate(x, y); c.scale(scale, scale); c.fillStyle = "#835842"; c.beginPath(); c.moveTo(-25, 16); c.lineTo(-13, -17); c.lineTo(20, -23); c.lineTo(37, 11); c.closePath(); c.fill(); c.fillStyle = "#bc8256"; c.beginPath(); c.moveTo(-13, -17); c.lineTo(20, -23); c.lineTo(5, 8); c.closePath(); c.fill(); c.restore();
  }

  drawDesertGrass(x, y) {
    const c = this.context; c.strokeStyle = "#d4b56d"; c.lineWidth = 2; for (let index = 0; index < 8; index += 1) { c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + index - 5, y - 16, x + index * 3, y - 27); c.stroke(); }
  }

  drawDesertFlower(x, y) {
    const c = this.context; c.save(); c.translate(x, y); c.strokeStyle = "#5c7b4a"; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 8); c.lineTo(0, -18); c.stroke();
    c.fillStyle = "#f2b178"; for (let petal = 0; petal < 6; petal += 1) { c.save(); c.rotate(petal * Math.PI / 3); c.beginPath(); c.ellipse(0, -23, 4, 9, 0, 0, Math.PI * 2); c.fill(); c.restore(); } c.fillStyle = "#ffdf82"; c.beginPath(); c.arc(0, -18, 4, 0, Math.PI * 2); c.fill(); c.restore();
  }

  drawFoxTree(x, y) {
    const c = this.context; c.save(); c.translate(x, y); c.strokeStyle = "#674334"; c.lineWidth = 13; c.beginPath(); c.moveTo(0, 78); c.lineTo(-3, 15); c.lineTo(-25, -4); c.moveTo(-3, 28); c.lineTo(21, -4); c.stroke(); c.fillStyle = "#c87942"; for (const [leafX, leafY, radius] of [[-31, -15, 31], [0, -31, 39], [32, -12, 30]]) { c.beginPath(); c.arc(leafX, leafY, radius, 0, Math.PI * 2); c.fill(); } c.restore();
  }

  drawCrystalSpire(x, y, scale) {
    const c = this.context; c.save(); c.translate(x, y); c.scale(scale, scale); const crystal = c.createLinearGradient(-30, -170, 30, 0); crystal.addColorStop(0, "#d2c1ff"); crystal.addColorStop(0.45, "#7360b4"); crystal.addColorStop(1, "#302956"); c.fillStyle = crystal; c.beginPath(); c.moveTo(-36, 0); c.lineTo(-11, -130); c.lineTo(8, -193); c.lineTo(35, 0); c.closePath(); c.fill(); c.strokeStyle = "#d8ccff"; c.globalAlpha = 0.5; c.lineWidth = 2; c.stroke(); c.restore();
  }

  drawCrystalCluster(x, y) {
    const c = this.context; c.save(); c.translate(x, y); c.globalAlpha = 0.82;
    for (const [offsetX, height] of [[-25, 55], [0, 86], [28, 48]]) { const crystal = c.createLinearGradient(offsetX, -height, offsetX + 16, 0); crystal.addColorStop(0, "#e4ddff"); crystal.addColorStop(1, "#594d91"); c.fillStyle = crystal; c.beginPath(); c.moveTo(offsetX - 9, 0); c.lineTo(offsetX, -height); c.lineTo(offsetX + 13, 0); c.closePath(); c.fill(); } c.restore();
  }

  drawRuinedArch(x, y) {
    const c = this.context; c.save(); c.translate(x, y); c.fillStyle = "#3f3a59"; c.fillRect(-38, -70, 18, 70); c.fillRect(21, -70, 18, 70); c.strokeStyle = "#6e668d"; c.lineWidth = 16; c.beginPath(); c.arc(0, -66, 30, Math.PI, 0); c.stroke(); c.restore();
  }

  drawForegroundDetails() {
    if (this.level.id === 1) return;
    if (this.level.theme === "jardin") {
      const c = this.context; c.save(); c.globalAlpha = 0.45; c.fillStyle = "#244b47";
      for (let x = 30; x < this.level.worldWidth; x += 190) { c.beginPath(); c.ellipse(x, 640, 55, 22, 0, Math.PI, Math.PI * 2); c.fill(); }
      c.restore();
      c.save(); c.globalAlpha = 0.3; c.fillStyle = "#173a3c";
      for (let x = 110; x < this.level.worldWidth; x += 460) { c.beginPath(); c.ellipse(x, 650, 115, 45, 0, Math.PI, Math.PI * 2); c.fill(); }
      c.restore();
    }
    if (this.level.theme === "final") {
      const c = this.context; c.save(); c.globalAlpha = 0.2; c.fillStyle = "#c2b8ff"; c.fillRect(0, 612, this.level.worldWidth, 28); c.restore();
    }
  }

  drawWorldExits() {
    const c = this.context;
    const exit = this.level.zoneExit;
    if (exit && exit.active !== false) {
      const x = exit.x; const y = exit.y;
      c.fillStyle = "#282c47"; c.fillRect(x, y + 12, 22, exit.height - 12); c.fillRect(x + exit.width - 22, y + 12, 22, exit.height - 12);
      c.fillStyle = "#9389b0"; c.fillRect(x - 9, y + 7, exit.width + 18, 16); c.fillRect(x + 7, y - 3, 14, 20); c.fillRect(x + exit.width - 21, y - 3, 14, 20);
      c.fillStyle = "rgb(163 206 237 / 25%)"; c.fillRect(x + 22, y + 28, exit.width - 44, exit.height - 28);
      c.strokeStyle = "#e5d8a3"; c.lineWidth = 3; c.strokeRect(x + 22, y + 28, exit.width - 44, exit.height - 28);
      c.fillStyle = "#f5e6ae"; c.font = "bold 14px Arial"; c.textAlign = "center"; c.fillText(exit.label ?? "ENTRAR", x + exit.width / 2, y - 13);
    }
    const surface = this.level.waterExit;
    if (surface?.active !== false && surface) {
      c.fillStyle = "#9ce8dc"; c.fillRect(surface.x, surface.y + 10, 12, surface.height - 10); c.fillRect(surface.x + surface.width - 12, surface.y + 10, 12, surface.height - 10);
      c.fillRect(surface.x - 10, surface.y, surface.width + 20, 13);
      c.fillStyle = "rgb(173 248 236 / 18%)"; c.fillRect(surface.x + 12, surface.y + 19, surface.width - 24, surface.height - 19);
      c.fillStyle = "#d4fff2"; c.font = "bold 14px Arial"; c.textAlign = "center"; c.fillText("↑ SUPERFICIE", surface.x + surface.width / 2, surface.y - 9);
    }
  }

  drawUnderwaterBackground() {
    const c = this.context;
    const water = c.createLinearGradient(0, 0, 0, this.canvas.height);
    water.addColorStop(0, "#387f91"); water.addColorStop(0.38, "#17556f"); water.addColorStop(1, "#102947");
    c.fillStyle = water; c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const cameraShift = -((this.camera.x * 0.18) % 420);
    c.fillStyle = "rgb(172 238 222 / 12%)";
    for (let x = cameraShift - 100; x < this.canvas.width + 100; x += 420) {
      c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 90, 0); c.lineTo(x + 230, 390); c.lineTo(x + 135, 390); c.closePath(); c.fill();
    }
    c.fillStyle = "rgb(108 183 194 / 17%)"; c.fillRect(0, 610, this.canvas.width, 110);
    c.fillStyle = "rgb(193 245 224 / 32%)";
    for (let i = 0; i < 10; i += 1) {
      const x = (i * 137 + 65 - this.camera.x * 0.35) % this.canvas.width;
      const y = 50 + (i * 73) % 520 + Math.sin(this.visualTime * 1.5 + i) * 6;
      c.fillRect((x + this.canvas.width) % this.canvas.width, y, 3, 3);
    }
  }

  drawUnderwaterDecorations() {
    const c = this.context; const left = this.camera.x - 180; const right = this.camera.x + this.canvas.width + 180;
    c.fillStyle = "#1b3847";
    for (let x = Math.floor(left / 360) * 360; x < right; x += 360) {
      c.fillRect(x, 570, 62, 95); c.fillRect(x + 8, 525, 48, 45); c.fillRect(x - 8, 558, 78, 12);
      c.fillStyle = "#426476"; c.fillRect(x + 14, 540, 8, 24); c.fillRect(x + 40, 540, 8, 24); c.fillStyle = "#1b3847";
    }
    for (let x = Math.floor(left / 245) * 245; x < right; x += 245) {
      const sway = Math.round(Math.sin(this.visualTime * 1.7 + x) * 5);
      c.fillStyle = "#2f897c"; c.fillRect(x + sway, 618, 9, -92); c.fillRect(x - 9 + sway, 563, 12, -18); c.fillRect(x + 6 + sway, 541, 14, -17);
      c.fillStyle = "#76b89a"; c.fillRect(x + 3 + sway, 544, 3, 53);
    }
    c.fillStyle = "rgb(200 247 227 / 46%)";
    for (let i = 0; i < 12; i += 1) {
      const x = (i * 173 + 40 - this.camera.x * 0.12) % this.canvas.width;
      const y = 120 + ((i * 89 + this.visualTime * (12 + i % 3) * 10) % 430);
      c.fillRect((x + this.canvas.width) % this.canvas.width, y, 4, 4);
      if (i % 3 === 0) c.fillRect((x + this.canvas.width) % this.canvas.width + 7, y + 10, 2, 2);
    }
  }

  drawArenaBackground() {
    const c = this.context;
    const sky = c.createLinearGradient(0, 0, 0, this.canvas.height);
    sky.addColorStop(0, "#17162d"); sky.addColorStop(0.58, "#34304f"); sky.addColorStop(1, "#151a2d");
    c.fillStyle = sky; c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawMoonAndStars();
    c.fillStyle = "#292b45"; c.fillRect(0, 560, this.canvas.width, 160);
    c.fillStyle = "rgb(222 180 126 / 10%)"; c.fillRect(0, 554, this.canvas.width, 7);
    c.fillStyle = "rgb(213 179 138 / 12%)";
    for (let x = 30; x < this.canvas.width; x += 105) c.fillRect(x, 590 + (x % 5) * 8, 29, 3);
  }

  drawArenaDecorations() {
    const c = this.context;
    for (const x of [70, 190, 1090, 1200]) {
      c.fillStyle = "#423d62"; c.fillRect(x, 560, 22, 80); c.fillRect(x - 18, 548, 58, 13);
      c.fillStyle = "#817396"; c.fillRect(x + 5, 568, 6, 45);
    }
    c.fillStyle = "rgb(196 167 231 / 15%)";
    c.beginPath(); c.ellipse(640, 628, 220, 28, 0, 0, Math.PI * 2); c.fill();
  }

  drawFinalScene() {
    const c = this.context;
    this.drawFinalBackground();
    c.fillStyle = "#26233d"; c.fillRect(0, 600, this.canvas.width, 120);
    c.fillStyle = "#8c7d9f"; c.fillRect(0, 596, this.canvas.width, 8);
    const player = this.personajeActual;
    if (player) {
      const position = { x: player.x, y: player.y, facing: player.facing, state: player.state };
      player.x = 350; player.y = 448; player.facing = 1; player.state = "IDLE"; player.draw(c);
      player.x = position.x; player.y = position.y; player.facing = position.facing; player.state = position.state;
    }
    this.juan.draw(c);
    if (this.finalSequence === "transition") {
      this.drawOverlay("EL GUARDIÁN HA CAÍDO", "Las estrellas vuelven a brillar");
      return;
    }
    if (this.finalSequence === "juan") {
      c.fillStyle = "rgb(14 19 37 / 90%)"; c.beginPath(); c.roundRect(75, 510, 1130, 150, 18); c.fill();
      c.strokeStyle = "#e4c67e"; c.lineWidth = 2; c.stroke();
      c.textAlign = "left"; c.fillStyle = "#ffe6a0"; c.font = "bold 21px Georgia"; c.fillText("JUAN", 110, 550);
      c.fillStyle = "#f8f4e3"; c.font = "24px Georgia"; c.fillText(this.finalDialogue[this.finalDialogueIndex] ?? "", 110, 594);
      c.textAlign = "right"; c.fillStyle = "#c9d7e8"; c.font = "15px Arial"; c.fillText("ENTER · CONTINUAR", 1170, 638);
      return;
    }
    if (this.finalSequence === "poem") {
      this.drawFinalTextPanel("POEMA", finalPoem);
      return;
    }
    if (this.finalSequence === "credits") {
      c.fillStyle = "rgb(14 19 37 / 91%)"; c.fillRect(210, 75, 860, 575);
      c.textAlign = "center"; c.fillStyle = "#ffe6a0"; c.font = "bold 34px Georgia"; c.fillText("CRÉDITOS", 640, 132);
      const creditLines = credits.flatMap((item) => [
        { text: item.role, heading: true },
        ...item.value.split(/\r?\n/).map((text) => ({ text, heading: false })),
        { text: "", heading: false },
      ]);
      const lineHeight = 31;
      const maxScroll = Math.max(0, creditLines.length * lineHeight - 420);
      const scroll = Math.min(this.finalScroll, maxScroll);
      creditLines.forEach((line, index) => {
        if (!line.text) return;
        c.fillStyle = line.heading ? "#ffe6a0" : "#f8f4e3";
        c.font = line.heading ? "bold 21px Georgia" : "20px Arial";
        c.fillText(line.text, 640, 180 + index * lineHeight - scroll);
      });
      c.fillStyle = "#c9d7e8"; c.font = "14px Arial"; c.fillText("ENTER · CONTINUAR", 640, 620);
      return;
    }
    if (this.finalSequence === "victory") {
      const rewards = ["EXTRAS", "Nivel 4", this.latestCharacterUnlock].filter(Boolean).join(" · ");
      const returnPrompt = "Pulsa Enter para volver al menú";
      this.drawOverlay("CAMPAÑA COMPLETADA", `${rewards} · ${returnPrompt}`);
    }
  }

  drawFinalTextPanel(title, lines, note) {
    const c = this.context;
    c.fillStyle = "rgb(14 19 37 / 93%)"; c.beginPath(); c.roundRect(190, 45, 900, 620, 18); c.fill();
    c.strokeStyle = "#e4c67e"; c.lineWidth = 2; c.stroke();
    c.textAlign = "center"; c.fillStyle = "#ffe6a0"; c.font = "bold 34px Georgia"; c.fillText(title, 640, 98);
    const lineHeight = Math.min(30, 440 / Math.max(1, lines.length));
    const contentHeight = (lines.length - 1) * lineHeight;
    const firstBaseline = 140 + (420 - contentHeight) / 2;
    c.fillStyle = "#f8f4e3"; c.font = `italic ${Math.max(16, Math.min(24, lineHeight * 0.88))}px Georgia`;
    lines.forEach((line, index) => { if (line) c.fillText(line, 640, firstBaseline + index * lineHeight); });
    c.fillStyle = "#c9d7e8"; c.font = "14px Arial";
    if (note) c.fillText(note, 640, 610);
    c.fillText("ENTER · CONTINUAR", 640, 640);
  }

  drawGoal() {
    if (!this.level.goal) return;
    const { x, y, width, height, label } = this.level.goal; const c = this.context; c.save(); c.translate(x, y);
    c.strokeStyle = "#fef08a"; c.lineWidth = 7; c.shadowColor = "#fde68a"; c.shadowBlur = 20; c.beginPath(); c.ellipse(width / 2, height / 2, width / 2, height / 2, 0, 0, Math.PI * 2); c.stroke();
    c.shadowBlur = 0; c.fillStyle = "#fff7c2"; c.font = "18px Arial"; c.textAlign = "center"; c.fillText(label, width / 2, -14); c.restore();
  }

  drawInterface() {
    if (this.level.id === 4) {
      this.drawArcadeInterface();
      return;
    }
    const c = this.context;
    const panel = c.createLinearGradient(20, 18, 20, 170);
    panel.addColorStop(0, "rgb(20 30 53 / 88%)"); panel.addColorStop(1, "rgb(16 43 58 / 70%)");
    c.fillStyle = panel; c.beginPath(); c.roundRect(20, 18, 412, 152, 14); c.fill();
    c.strokeStyle = "rgb(255 231 159 / 65%)"; c.lineWidth = 1.5; c.stroke();
    c.textAlign = "left"; c.font = "bold 21px Georgia"; c.fillStyle = "#fff7d7"; c.fillText(this.level.title, 36, 48);
    this.drawHudStat("MIS VIDAS", "❤", this.lives, 36, 68, "#ffd7dc", "#ef6e81");
    this.drawHudStat("MIS ESTRELLAS", "⭐", this.starsCollected, 224, 68, "#fff0ae", "#eebd4e");
    if (this.level.id === 3) this.drawEnemyProgress();
    if (this.personajeActual.hasDoubleJump || this.personajeActual.hasSword || this.personajeActual.hasSling) {
      const abilityY = this.level.id === 3 ? 74 : 18;
      c.fillStyle = "rgb(16 43 58 / 78%)"; c.beginPath(); c.roundRect(448, abilityY, 236, 47, 15); c.fill();
      c.strokeStyle = "rgb(255 231 159 / 45%)"; c.lineWidth = 1; c.stroke();
      c.fillStyle = "#f7dc8a"; c.font = "15px Arial"; c.textAlign = "center";
      const abilities = [this.personajeActual.hasDoubleJump ? "✦ doble salto" : "", this.personajeActual.hasSling ? "◉ honda" : "", this.personajeActual.hasSword ? "⚔ espada" : ""].filter(Boolean).join("   ");
      c.fillText(abilities, 566, abilityY + 29);
    }
    if (this.boss && this.level.bossArena && !this.boss.isDefeated) this.drawBossHealth();

    if (this.developerMode) {
      c.fillStyle = "rgb(55 35 62 / 90%)"; c.beginPath(); c.roundRect(510, 18, 260, 34, 13); c.fill();
      c.strokeStyle = "#f2c6ff"; c.lineWidth = 1; c.stroke();
      c.fillStyle = "#ffe0ff"; c.font = "bold 12px Arial"; c.textAlign = "center";
      c.fillText("MODO DESARROLLADOR · INMORTAL", 640, 40);
    }

    c.fillStyle = "rgb(16 26 48 / 62%)"; c.beginPath(); c.roundRect(this.canvas.width - 344, 18, 324, 47, 18); c.fill();
    c.textAlign = "center"; c.fillStyle = "#fff7c2"; c.font = "17px Arial";
    const controlsText = this.personajeActual.movementMode === "SWIMMING" ? "A/D nadar · Espacio brazada · Esc pausa" : this.personajeActual.movementMode === "JETPACK" ? "A/D mover · Espacio impulsar · S/↓ bajar" : this.levelNumber === 3 || this.personajeActual.hasSling ? "J atacar · Espacio saltar · Esc pausa" : "A/D o ←/→ · Espacio saltar · Esc pausa";
    c.fillText(controlsText, this.canvas.width - 182, 48);
    if (this.personajeActual.movementMode === "JETPACK" && this.personajeActual.jetpackFuelLimited) {
      const fuelRatio = this.personajeActual.jetpackFuel / this.personajeActual.jetpackFuelMax;
      c.fillStyle = "rgb(16 26 48 / 74%)"; c.beginPath(); c.roundRect(this.canvas.width - 344, 72, 324, 31, 12); c.fill();
      c.fillStyle = "#e7e6ff"; c.font = "bold 12px Arial"; c.textAlign = "left"; c.fillText("COMBUSTIBLE", this.canvas.width - 331, 92);
      c.fillStyle = "#263650"; c.fillRect(this.canvas.width - 233, 82, 195, 11);
      c.fillStyle = fuelRatio > 0.28 ? "#8ee0c2" : "#ed8b82"; c.fillRect(this.canvas.width - 233, 82, 195 * fuelRatio, 11);
    }
    if (this.message) { c.textAlign = "center"; c.fillStyle = "#fff7c2"; c.font = "bold 22px Arial"; c.fillText(this.message, this.canvas.width / 2, 90); }
    if (this.zorro?.warning) { c.textAlign = "center"; c.fillStyle = "#fee2e2"; c.font = "bold 22px Arial"; c.fillText("El Zorro detecta un peligro cerca", this.canvas.width / 2, 130); }
    else if (this.zorro?.routeHint && !this.message) { c.textAlign = "center"; c.fillStyle = "#fff0b8"; c.font = "bold 18px Arial"; c.fillText(this.zorro.routeHint, this.canvas.width / 2, 126); }
    if (this.state === GameState.NIVEL_COMPLETADO) this.drawOverlay("CAPÍTULO COMPLETADO", "Toca la pantalla o pulsa Enter para continuar");
    if (this.state === GameState.PAUSA) this.drawPauseScreen();
    if (this.state === GameState.GAME_OVER) this.drawGameOverScreen();
    if (this.zoneTransition) this.drawZoneTransition();
  }

  drawArcadeInterface() {
    const c = this.context;
    c.fillStyle = "rgb(20 27 45 / 78%)"; c.beginPath(); c.roundRect(22, 20, 330, 105, 14); c.fill();
    c.strokeStyle = "rgb(255 231 159 / 60%)"; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = "#fff0c5"; c.textAlign = "left"; c.font = "bold 15px Arial"; c.fillText("PUNTUACIÓN", 42, 47);
    c.font = "bold 32px Arial"; c.fillText(String(this.level.score).padStart(6, "0"), 42, 82);
    c.fillStyle = "#dbe8e7"; c.font = "14px Arial"; c.fillText(`RÉCORD ${String(this.level.bestScore).padStart(6, "0")}`, 42, 108);
    c.fillStyle = "rgb(20 27 45 / 78%)"; c.beginPath(); c.roundRect(this.canvas.width - 280, 20, 258, 66, 14); c.fill();
    c.strokeStyle = "rgb(255 231 159 / 60%)"; c.lineWidth = 1; c.stroke();
    c.fillStyle = "#fff0c5"; c.font = "bold 23px Arial"; c.textAlign = "center";
    c.fillText(`${Math.floor(this.level.distance)} m`, this.canvas.width - 151, 49);
    c.fillStyle = "#d9d4cc"; c.font = "13px Arial"; c.fillText(this.level.zone.name, this.canvas.width - 151, 72);
    if (this.developerMode) {
      c.fillStyle = "rgb(55 35 62 / 90%)"; c.beginPath(); c.roundRect(this.canvas.width / 2 - 132, 18, 264, 32, 13); c.fill();
      c.fillStyle = "#ffe0ff"; c.font = "bold 12px Arial"; c.fillText("MODO DESARROLLADOR · INMORTAL", this.canvas.width / 2, 39);
    }
    c.fillStyle = "rgb(16 26 48 / 68%)"; c.beginPath(); c.roundRect(this.canvas.width / 2 - 248, this.canvas.height - 48, 496, 30, 12); c.fill();
    c.fillStyle = "#fff7d8"; c.font = "14px Arial"; c.fillText("← / → ritmo   ·   S / ↓ agacharse   ·   ESPACIO saltar", this.canvas.width / 2, this.canvas.height - 28);
    if (this.message) {
      c.fillStyle = "#fff4ce"; c.font = "bold 22px Georgia"; c.fillText(this.message, this.canvas.width / 2, 164);
    }
    if (this.state === GameState.PAUSA) this.drawPauseScreen();
    if (this.state === GameState.GAME_OVER) this.drawArcadeGameOver();
  }

  drawArcadeGameOver() {
    const c = this.context;
    c.fillStyle = "rgb(8 10 24 / 80%)"; c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    c.textAlign = "center"; c.fillStyle = "#fff7c2"; c.font = "bold 62px Arial"; c.fillText("FIN DE LA CARRERA", this.canvas.width / 2, 285);
    c.fillStyle = "#f8ead1"; c.font = "25px Arial";
    c.fillText(`Puntuación ${String(this.level.score).padStart(6, "0")}   ·   Distancia ${Math.floor(this.level.distance)} m`, this.canvas.width / 2, 340);
    c.fillStyle = "#ffe5a7"; c.font = "bold 18px Arial"; c.fillText(`RÉCORD ${String(this.level.bestScore).padStart(6, "0")}`, this.canvas.width / 2, 375);
    this.drawOverlayButton("NUEVA CARRERA", 430, "#355d75");
    this.drawOverlayButton("MENÚ PRINCIPAL", 500, "#5a4364");
  }

  drawHudStat(label, icon, value, x, y, textColor, accentColor) {
    const c = this.context;
    c.fillStyle = "rgb(255 255 255 / 8%)"; c.beginPath(); c.roundRect(x, y, 172, 82, 10); c.fill();
    c.fillStyle = accentColor; c.beginPath(); c.roundRect(x, y, 5, 82, 3); c.fill();
    c.textAlign = "left"; c.fillStyle = "#cce8e2"; c.font = "bold 13px Arial"; c.fillText(label, x + 18, y + 23);
    c.fillStyle = textColor; c.font = "bold 30px Arial"; c.fillText(icon, x + 18, y + 59);
    c.fillStyle = "#fffdf3"; c.font = "bold 29px Arial"; c.fillText(String(value), x + 62, y + 59);
  }

  drawEnemyProgress() {
    const c = this.context;
    const { enemiesDefeated, doubleJumpUnlockKills, doubleJumpUnlocked } = this.level;
    c.fillStyle = "rgb(16 43 58 / 78%)"; c.beginPath(); c.roundRect(448, 18, 236, 47, 15); c.fill();
    c.strokeStyle = doubleJumpUnlocked ? "rgb(255 224 129 / 76%)" : "rgb(255 231 159 / 45%)"; c.lineWidth = 1; c.stroke();
    c.textAlign = "center"; c.font = "bold 15px Arial";
    c.fillStyle = doubleJumpUnlocked ? "#ffe48a" : "#dfe9ff";
    c.fillText(doubleJumpUnlocked ? "Enemigos: 3/3  ·  DOBLE SALTO" : `Enemigos: ${enemiesDefeated}/${doubleJumpUnlockKills}`, 566, 47);
  }

  drawBossHealth() {
    const c = this.context; const x = 710; const y = 76; const width = 214;
    c.fillStyle = "rgb(16 26 48 / 88%)"; c.beginPath(); c.roundRect(x, y, width, 64, 12); c.fill();
    c.strokeStyle = "rgb(255 231 159 / 60%)"; c.lineWidth = 1; c.stroke();
    c.textAlign = "center"; c.fillStyle = "#fff2ca"; c.font = "bold 12px Arial"; c.fillText("GUARDIÁN · FASE " + (this.boss.phase + 1), x + width / 2, y + 16);
    const gap = 3; const segmentWidth = (width - 24 - gap * (this.boss.maxHealth - 1)) / this.boss.maxHealth;
    for (let index = 0; index < this.boss.maxHealth; index += 1) {
      const sx = x + 12 + index * (segmentWidth + gap);
      c.fillStyle = index < this.boss.health ? (this.boss.vulnerableTime > 0 ? "#f8d77f" : "#d27b75") : "#3b3c58";
      c.fillRect(sx, y + 28, segmentWidth, 17);
      c.fillStyle = "rgb(255 255 255 / 24%)"; c.fillRect(sx + 2, y + 30, Math.max(0, segmentWidth - 4), 3);
    }
    if (this.boss.vulnerableTime > 0) { c.fillStyle = "#fff0a3"; c.font = "bold 10px Arial"; c.fillText("PUNTO DÉBIL", x + width / 2, y + 57); }
  }

  drawOverlay(title, subtitle) {
    const c = this.context; c.fillStyle = "rgb(8 10 24 / 80%)"; c.fillRect(0, 0, this.canvas.width, this.canvas.height); c.textAlign = "center"; c.fillStyle = "#fff7c2"; c.font = "bold 62px Arial"; c.fillText(title, this.canvas.width / 2, 320); c.font = "26px Arial"; c.fillText(subtitle, this.canvas.width / 2, 375);
  }

  drawZoneTransition() {
    const progress = 1 - this.zoneTransition.time / this.zoneTransition.duration;
    const c = this.context;
    c.save();
    c.globalAlpha = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
    c.fillStyle = "#0d2235";
    c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    c.fillStyle = "#ffe7a4";
    c.textAlign = "center";
    c.font = "bold 34px Georgia";
    c.fillText(this.zoneTransition.title ?? "VIAJE ENTRE ZONAS", this.canvas.width / 2, this.canvas.height / 2);
    c.restore();
  }

  drawPauseScreen() {
    this.drawOverlay("PAUSA", "El mundo espera tu decisión");
    this.drawOverlayButton("CONTINUAR", 380, "#355d75");
    this.drawOverlayButton("REINICIAR NIVEL", 450, "#725338");
    this.drawOverlayButton("MENÚ", 520, "#5a4364");
  }

  drawGameOverScreen() {
    this.drawOverlay("GAME OVER", "El viaje no termina aquí.");
    this.drawOverlayButton("REINTENTAR", 430, "#355d75");
    this.drawOverlayButton("MENÚ PRINCIPAL", 500, "#5a4364");
  }

  drawOverlayButton(label, y, color) {
    const c = this.context;
    c.fillStyle = color;
    c.fillRect(this.canvas.width / 2 - 175, y - 27, 350, 52);
    c.strokeStyle = "#fff0bd";
    c.lineWidth = 2;
    c.strokeRect(this.canvas.width / 2 - 175, y - 27, 350, 52);
    c.fillStyle = "#fff";
    c.textAlign = "center";
    c.font = "bold 21px Arial";
    c.fillText(label, this.canvas.width / 2, y + 7);
  }

  drawMenu() {
    if (this.menuView === "extras") return this.drawExtrasMenu();
    if (this.menuView === "characters") return this.drawExtrasCharacters();
    if (this.menuView === "book") return this.drawBookViewer();
    if (this.menuView === "gifts") return this.drawGiftGallery();
    const c = this.context; const g = c.createLinearGradient(0, 0, 0, this.canvas.height); g.addColorStop(0, "#172846"); g.addColorStop(0.55, "#4c4a74"); g.addColorStop(1, "#8a5268"); c.fillStyle = g; c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    c.save(); c.fillStyle = "#ffe7a4"; c.globalAlpha = 0.82; c.beginPath(); c.arc(1110, 240, 54, 0, Math.PI * 2); c.fill(); c.fillStyle = "#fff7d3"; for (let index = 0; index < 38; index += 1) { const x = (index * 149 + 43) % this.canvas.width; const y = 25 + (index * 71) % 430; c.globalAlpha = 0.25 + (index % 3) * 0.15; c.fillRect(x, y, 2, 2); } c.restore();
    c.fillStyle = "rgb(18 45 62 / 32%)"; c.beginPath(); c.ellipse(170, 675, 310, 115, 0, Math.PI, Math.PI * 2); c.ellipse(1110, 675, 340, 130, 0, Math.PI, Math.PI * 2); c.fill();
    c.textAlign = "center"; c.fillStyle = "#fff4c4"; c.font = "bold 58px Georgia"; c.fillText("PRINCIPITO", this.canvas.width / 2, 78); c.font = "italic 23px Georgia"; c.fillText("La aventura para llegar a Neiva", this.canvas.width / 2, 117); c.font = "bold 22px Arial"; c.fillStyle = "#ffffff"; c.fillText("PERSONAJES", this.canvas.width / 2, 165);
    const characterOptions = this.getMainCharacterOptions();
    const columnCenters = [430, 850];
    characterOptions.forEach((option, index) => {
      this.drawCharacterButton(option.label, columnCenters[index], 214, this.selectedCharacter === option.id, !option.unlocked);
      if (!option.unlocked) {
        c.fillStyle = "#ffe4c0"; c.font = "12px Arial"; c.textAlign = "center";
        c.fillText(this.getCharacterRequirement(option.id), columnCenters[index], 248);
      }
    });
    const starProgress = this.progression.getStarProgress();
    c.font = "14px Arial"; c.fillStyle = "#eee4ce";
    c.fillText(`Estrellas únicas: ${starProgress.obtained}/${starProgress.total} · Eren 70% · Eren Titan 100%`, this.canvas.width / 2, 310);
    c.font = "bold 17px Arial"; c.fillStyle = "#fff7c2"; c.fillText("DIFICULTAD", this.canvas.width / 2, 339);
    this.drawDifficultyButton("FÁCIL", 220, this.difficulty === "facil");
    this.drawDifficultyButton("NORMAL", 640, this.difficulty === "normal");
    this.drawDifficultyButton("DIFÍCIL", 1060, this.difficulty === "dificil");
    this.drawMenuButton("INICIAR VIAJE", 447, false, false);
    if (this.isIsabelaUnlocked) {
      c.font = "15px Arial"; c.fillStyle = "#fff7c2"; c.fillText("REJUGAR CAMPAÑA", this.canvas.width / 2, 516);
      this.drawReplayButton("CAPÍTULO 1", 320);
      this.drawReplayButton("CAPÍTULO 2", 640);
      this.drawReplayButton("CAPÍTULO 3", 960);
    } else {
      c.font = "15px Arial"; c.fillStyle = "#fff7c2"; c.fillText("Completa la campaña para habilitar EXTRAS y el Nivel 4", this.canvas.width / 2, 551);
    }
    c.font = "16px Arial"; c.fillStyle = "#e9d5ff"; c.fillText("A/D o flechas para moverte · Espacio para saltar", this.canvas.width / 2, 615);
    this.drawExtrasEntry();
    c.textAlign = "right"; c.font = "italic 16px Georgia"; c.fillStyle = "#fff1c7"; c.fillText("Hecho para mi Izzyta", this.canvas.width - 28, this.canvas.height - 24);
  }

  drawMenuBackdrop(title, subtitle = "") {
    const c = this.context;
    const gradient = c.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, "#172846"); gradient.addColorStop(0.55, "#4c4a74"); gradient.addColorStop(1, "#8a5268");
    c.fillStyle = gradient; c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    c.fillStyle = "rgb(18 45 62 / 35%)"; c.beginPath(); c.ellipse(170, 675, 310, 115, 0, Math.PI, Math.PI * 2); c.ellipse(1110, 675, 340, 130, 0, Math.PI, Math.PI * 2); c.fill();
    for (let index = 0; index < 38; index += 1) {
      c.globalAlpha = 0.25 + (index % 3) * 0.12;
      c.fillStyle = "#fff2c7"; c.fillRect((index * 149 + 43) % this.canvas.width, 25 + (index * 71) % 430, 2, 2);
    }
    c.globalAlpha = 1;
    c.textAlign = "center"; c.fillStyle = "#fff4c4"; c.font = "bold 46px Georgia"; c.fillText(title, this.canvas.width / 2, 82);
    if (subtitle) { c.fillStyle = "#f2ddc0"; c.font = "italic 18px Georgia"; c.fillText(subtitle, this.canvas.width / 2, 116); }
  }

  drawExtrasEntry() {
    const c = this.context;
    const x = 1008; const y = 590; const width = 220; const height = 48;
    c.fillStyle = this.isExtrasUnlocked ? "#365d78" : "#3d4257";
    c.beginPath(); c.roundRect(x, y, width, height, 10); c.fill();
    c.strokeStyle = this.isExtrasUnlocked ? "#c3dfd3" : "#8b8995"; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = this.isExtrasUnlocked ? "#fff7d7" : "#c7c3cc"; c.font = "bold 16px Arial"; c.textAlign = "center";
    c.fillText(this.isExtrasUnlocked ? "EXTRAS" : "EXTRAS 🔒", x + width / 2, y + 29);
  }

  drawExtrasMenu() {
    const c = this.context;
    this.drawMenuBackdrop("EXTRAS", "Un espacio para personajes, lectura y recuerdos");
    const entries = ["PERSONAJES", "EL LIBRO", "REGALOS", this.isLevel4Unlocked ? "NIVEL 4 · ARCADE INFINITO" : "NIVEL 4 🔒", "VOLVER"];
    entries.forEach((label, index) => {
      this.drawExtrasButton(label, 220 + index * 82, index === this.menuCursor, 400, 58, index === 3 ? 16 : 20);
    });
    c.fillStyle = "#fff1c7"; c.font = "italic 16px Georgia"; c.textAlign = "right"; c.fillText("Hecho para mi Izzyta", this.canvas.width - 28, this.canvas.height - 24);
  }

  drawExtrasCharacters() {
    const c = this.context;
    this.drawMenuBackdrop("PERSONAJES", "Elige quién continuará este viaje");
    this.getCharacterOptions().forEach((option, index) => {
      const centerX = [220, 640, 1060][index % 3];
      const centerY = index < 3 ? 220 : 320;
      this.drawCharacterButton(option.label, centerX, centerY, this.selectedCharacter === option.id, !option.unlocked);
      c.fillStyle = option.unlocked ? "#dbe8d3" : "#ffe4c0"; c.font = "12px Arial"; c.textAlign = "center";
      c.fillText(this.getCharacterRequirement(option.id), centerX, centerY + 34);
      if (this.menuCursor === index) {
        c.strokeStyle = "#fff3be"; c.lineWidth = 2; c.strokeRect(centerX - 120, centerY - 24, 240, 48);
      }
    });
    this.drawExtrasButton("VOLVER", 610, this.menuCursor === this.getCharacterOptions().length);
  }

  drawBookViewer() {
    const c = this.context;
    this.drawMenuBackdrop("EL LIBRO", bookPages.length ? `Página ${this.bookPageIndex + 1} de ${bookPages.length} · ← →` : "Visor listo para el contenido que proporciones");
    c.fillStyle = "rgb(18 30 50 / 82%)"; c.beginPath(); c.roundRect(180, 145, 920, 385, 16); c.fill();
    c.strokeStyle = "#d3b77f"; c.lineWidth = 2; c.stroke();
    c.textAlign = "center"; c.fillStyle = "#fff0ca"; c.font = "bold 27px Georgia";
    if (bookPages.length) {
      const page = bookPages[this.bookPageIndex];
      c.fillText(page.title ?? `Página ${this.bookPageIndex + 1}`, this.canvas.width / 2, 198);
      c.textAlign = "left"; c.fillStyle = "#f4ead6"; c.font = "20px Georgia";
      this.wrapCanvasText(page.text ?? "", 250, 245, 780, 31, 78).forEach((line, index) => c.fillText(line, 250, 245 + index * 31));
    } else {
      c.fillText("El contenido del libro aún no está en el proyecto.", this.canvas.width / 2, 310);
      c.fillStyle = "#d8d2de"; c.font = "18px Arial";
      c.fillText("Cuando se proporcione, se añadirá por páginas sin cambiar este visor.", this.canvas.width / 2, 350);
    }
    this.drawExtrasButton("VOLVER", 600, false, 190, 44, 18, 320);
    if (bookPages.length) {
      this.drawExtrasButton("ANTERIOR", 600, false, 190, 44, 16, 550);
      this.drawExtrasButton("SIGUIENTE", 600, false, 190, 44, 16, 760);
    }
  }

  wrapCanvasText(text, x, y, maxWidth, lineHeight, maxChars) {
    const words = String(text).split(/\s+/).filter(Boolean);
    const lines = []; let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (candidate.length > maxChars || (line && this.context.measureText(candidate).width > maxWidth)) {
        lines.push(line); line = word;
      } else line = candidate;
    }
    if (line) lines.push(line);
    return lines.slice(0, Math.max(1, Math.floor((530 - y) / lineHeight)));
  }

  drawGiftGallery() {
    const c = this.context;
    this.drawMenuBackdrop(this.giftViewerOpen ? "REGALO" : "REGALOS", giftImages.length ? `Recuerdo ${this.giftIndex + 1} de ${giftImages.length} · toca la imagen para ampliar` : "Galería preparada para las imágenes que proporciones");
    if (!giftImages.length) {
      c.fillStyle = "rgb(18 30 50 / 82%)"; c.beginPath(); c.roundRect(180, 165, 920, 350, 16); c.fill();
      c.strokeStyle = "#d3b77f"; c.lineWidth = 2; c.stroke(); c.textAlign = "center"; c.fillStyle = "#fff0ca"; c.font = "bold 25px Georgia";
      c.fillText("Aún no hay imágenes de regalos", this.canvas.width / 2, 315);
      c.fillStyle = "#d8d2de"; c.font = "18px Arial"; c.fillText("Las imágenes personales se agregan en assets/regalos.", this.canvas.width / 2, 355);
    } else {
      const gift = giftImages[this.giftIndex]; const image = this.getGiftImage(gift);
      if (image) {
        const maxWidth = this.giftViewerOpen ? 1180 : 880; const maxHeight = this.giftViewerOpen ? 530 : 410;
        const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
        const width = image.naturalWidth * scale; const height = image.naturalHeight * scale;
        c.drawImage(image, (this.canvas.width - width) / 2, 145 + (420 - height) / 2, width, height);
      } else {
        c.fillStyle = "#f4ead6"; c.font = "20px Arial"; c.textAlign = "center"; c.fillText("Cargando imagen…", this.canvas.width / 2, 350);
      }
    }
    this.drawExtrasButton("VOLVER", 600, false, 190, 44, 18, 320);
    if (giftImages.length) {
      this.drawExtrasButton("ANTERIOR", 600, false, 190, 44, 16, 550);
      this.drawExtrasButton("SIGUIENTE", 600, false, 190, 44, 16, 760);
      if (this.giftViewerOpen) this.drawExtrasButton("CERRAR", 600, false, 160, 44, 16, 980);
    }
  }

  drawExtrasButton(label, y, selected = false, width = 400, height = 62, fontSize = 20, centerX = this.canvas.width / 2) {
    const c = this.context; const x = centerX - width / 2;
    c.fillStyle = selected ? "#bd8943" : "#365d78"; c.beginPath(); c.roundRect(x, y - height / 2, width, height, 11); c.fill();
    c.strokeStyle = selected ? "#fff0a9" : "#b9d9d3"; c.lineWidth = selected ? 2.5 : 1.5; c.stroke();
    c.fillStyle = "#fff7d7"; c.font = `bold ${fontSize}px Arial`; c.textAlign = "center"; c.fillText(label, centerX, y + fontSize * 0.35);
  }

  drawCharacterButton(label, centerX, centerY, selected, disabled) {
    const c = this.context;
    const x = centerX - 116;
    c.fillStyle = selected ? "#bd8943" : disabled ? "rgb(36 42 62 / 76%)" : "#365d78";
    c.beginPath(); c.roundRect(x, centerY - 20, 232, 40, 9); c.fill();
    c.strokeStyle = selected ? "#fff0a9" : disabled ? "#777687" : "#b9d9d3";
    c.lineWidth = selected ? 2.5 : 1.5; c.stroke();
    c.fillStyle = disabled ? "#aaa8b5" : "#fff7d7";
    c.textAlign = "center"; c.font = "bold 17px Arial";
    c.fillText(disabled ? `${label}  🔒` : label, centerX, centerY + 6);
  }

  drawMenuButton(label, y, selected, disabled) {
    const c = this.context; const x = this.canvas.width / 2 - 190; const gradient = c.createLinearGradient(x, y - 30, x, y + 24); gradient.addColorStop(0, selected ? "#ffe092" : disabled ? "#5c5872" : "#497390"); gradient.addColorStop(1, selected ? "#d99d45" : disabled ? "#45425c" : "#294c69"); c.fillStyle = gradient; c.beginPath(); c.roundRect(x, y - 30, 380, 54, 10); c.fill(); c.strokeStyle = "#fff0bd"; c.lineWidth = 2; c.stroke(); c.fillStyle = disabled ? "#cbc5d6" : "#fff"; c.font = "bold 22px Arial"; c.textAlign = "center"; c.fillText(label, this.canvas.width / 2, y + 6);
  }

  drawDifficultyButton(label, centerX, selected) {
    const c = this.context;
    const x = centerX - 116;
    c.fillStyle = selected ? "#d99d45" : "#294c69";
    c.beginPath(); c.roundRect(x, 350, 232, 36, 9); c.fill();
    c.strokeStyle = selected ? "#fff3be" : "#8eb4c7"; c.lineWidth = 2; c.stroke();
    c.fillStyle = "#fff"; c.textAlign = "center"; c.font = "bold 15px Arial"; c.fillText(label, centerX, 373);
  }

  drawReplayButton(label, centerX) {
    const c = this.context;
    const x = centerX - 115;
    c.fillStyle = "#365d78";
    c.beginPath(); c.roundRect(x, 526, 230, 38, 9); c.fill();
    c.strokeStyle = "#b9d9d3"; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = "#fff7d7"; c.textAlign = "center"; c.font = "bold 15px Arial"; c.fillText(label, centerX, 551);
  }
}
