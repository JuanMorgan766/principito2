import { GameState } from "./GameState.js";
import { Isabela } from "./entities/Isabela.js";
import { Principito } from "./entities/Principito.js";
import { Zorro } from "./entities/Zorro.js";
import { Nivel1 } from "./levels/Nivel1.js";
import { Nivel2 } from "./levels/Nivel2.js";
import { Nivel3 } from "./levels/Nivel3.js";
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

const UNLOCK_KEY = "principito-isabela-desbloqueada";
const DIFFICULTY_KEY = "principito-dificultad";
const FINAL_CARD_DURATION = 15;
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
    this.lastFrameTime = 0;
    this.input = new InputManager();
    this.input.bindTouchControls(document);
    this.audio = new AudioManager();
    this.selectedCharacter = "Principito";
    this.isIsabelaUnlocked = this.readIsabelaUnlock();
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
    this.visualTime = 0;
    this.zoneTransition = null;
    this.fullscreenRequestPending = false;
    this.canvas.addEventListener("pointerdown", (event) => this.handleCanvasClick(event));
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
    return new Nivel3();
  }

  createCharacter(spawn) {
    return this.selectedCharacter === "Isabela" ? new Isabela(spawn.x, spawn.y) : new Principito(spawn.x, spawn.y);
  }

  startLevel(number) {
    this.levelNumber = number;
    this.level = this.createLevel(number);
    this.bossHitsTaken = 0;
    this.boss = null;
    this.finalSequence = null;
    this.spawnPoint = { ...this.level.spawn };
    this.personajeActual = this.createCharacter(this.spawnPoint);
    this.personajeActual.lives = this.lives;
    this.camera = new Camera(this.canvas.width, this.level.worldWidth);
    this.camera.follow(this.personajeActual);
    this.zorro = new Zorro(Math.max(0, this.personajeActual.x - 110), this.personajeActual.y + this.personajeActual.height - 48);
    this.personajeActual.lives = this.lives;
    this.projectiles = [];
    this.zoneTransition = null;
    this.starsCollected = 0;
    this.clearMessage();
    this.state = GameState.JUGANDO;
    this.audio.playMusic(number);
    this.applyDifficultyToActiveZone();
    this.updateMobileControlsVisibility();
    this.refreshTouchControlLabels();
  }

  startNewGame() {
    this.lives = 3;
    this.level3BonusGranted = false;
    this.startLevel(1);
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
    if (!controls) return;
    controls.classList.toggle("is-visible", this.state === GameState.JUGANDO);
    this.updateTubeEntryControl();
  }

  refreshTouchControlLabels() {
    if (!this.personajeActual) return;
    const jumpButton = document.querySelector('[data-control="jump"]');
    const attackButton = document.querySelector('[data-control="attack"]');
    if (jumpButton) jumpButton.textContent = this.personajeActual.movementMode === "SWIMMING" ? "BRAZADA" : this.personajeActual.movementMode === "JETPACK" ? "IMPULSO" : "SALTO";
    if (attackButton) attackButton.hidden = !this.personajeActual.hasSword && !this.personajeActual.hasSling;
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
    if (this.state === GameState.NIVEL_COMPLETADO && this.input.consumeContinue()) return this.startLevel(this.levelNumber + 1);
    if (this.state === GameState.FINAL) {
      if (this.input.consumeContinue()) this.advanceFinalSequence();
      this.updateFinalSequence(deltaTime);
      return;
    }
    if (this.state !== GameState.JUGANDO) return;

    this.updateMessage(deltaTime);

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
      this.handlePlayerDeath();
      return;
    }
    this.camera.follow(this.personajeActual);
    this.updateTubeEntryControl();
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
    this.personajeActual.respawn(this.level.spawn.x, this.level.spawn.y);
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
    this.finalSequence = "victory";
    this.finalTimer = 0;
  }

  startJetpackSection() {
    this.level.jetpackStarted = true;
    this.personajeActual.respawn(this.level.spawn.x, this.level.spawn.y);
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
      if (y >= 400 && y <= 455) this.startNewGame();
      else if (y >= 470 && y <= 525) this.returnToMenu();
      return;
    }
    if (this.state === GameState.NIVEL_COMPLETADO) {
      this.startLevel(this.levelNumber + 1);
      return;
    }
    if (this.state === GameState.FINAL) {
      this.advanceFinalSequence();
      return;
    }
    if (this.state !== GameState.MENU) return;
    if (y >= 295 && y <= 355) this.selectedCharacter = "Principito";
    else if (y >= 370 && y <= 430 && this.isIsabelaUnlocked) this.selectedCharacter = "Isabela";
    else if (y >= 462 && y <= 515) this.setDifficulty(x < 510 ? "facil" : x < 770 ? "normal" : "dificil");
    else if (y >= 535 && y <= 590) this.startNewGame();
    else if (this.isIsabelaUnlocked && y >= 605 && y <= 649) {
      if (x >= 205 && x <= 435) this.startLevel(1);
      else if (x >= 525 && x <= 755) this.startLevel(2);
      else if (x >= 845 && x <= 1075) this.startLevel(3);
    }
  }

  render() {
    const { context, canvas } = this;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = false;
    if (this.state === GameState.MENU) return this.drawMenu();
    if (this.state === GameState.FINAL) return this.drawFinalScene();
    this.drawBackground();
    context.save(); context.translate(-this.camera.x, 0); this.drawWorld(); context.restore();
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
      this.drawOverlay("VIAJE COMPLETADO", this.selectedCharacter === "Principito" ? "Isabela ya está disponible · pulsa Enter para volver al menú" : "Las estrellas guardarán este viaje · pulsa Enter para volver al menú");
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
    const c = this.context; const g = c.createLinearGradient(0, 0, 0, this.canvas.height); g.addColorStop(0, "#172846"); g.addColorStop(0.55, "#4c4a74"); g.addColorStop(1, "#8a5268"); c.fillStyle = g; c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    c.save(); c.fillStyle = "#ffe7a4"; c.globalAlpha = 0.82; c.beginPath(); c.arc(1110, 240, 54, 0, Math.PI * 2); c.fill(); c.fillStyle = "#fff7d3"; for (let index = 0; index < 38; index += 1) { const x = (index * 149 + 43) % this.canvas.width; const y = 25 + (index * 71) % 430; c.globalAlpha = 0.25 + (index % 3) * 0.15; c.fillRect(x, y, 2, 2); } c.restore();
    c.fillStyle = "rgb(18 45 62 / 32%)"; c.beginPath(); c.ellipse(170, 675, 310, 115, 0, Math.PI, Math.PI * 2); c.ellipse(1110, 675, 340, 130, 0, Math.PI, Math.PI * 2); c.fill();
    c.textAlign = "center"; c.fillStyle = "#fff4c4"; c.font = "bold 68px Georgia"; c.fillText("PRINCIPITO", this.canvas.width / 2, 120); c.font = "italic 27px Georgia"; c.fillText("La aventura para llegar a Neiva", this.canvas.width / 2, 165); c.font = "bold 25px Arial"; c.fillStyle = "#ffffff"; c.fillText("PERSONAJE", this.canvas.width / 2, 255);
    this.drawMenuButton("EL PRINCIPITO", 325, this.selectedCharacter === "Principito", false); this.drawMenuButton(this.isIsabelaUnlocked ? "ISABELA" : "ISABELA  🔒", 400, this.selectedCharacter === "Isabela", !this.isIsabelaUnlocked);
    c.font = "bold 18px Arial"; c.fillStyle = "#fff7c2"; c.fillText("DIFICULTAD", this.canvas.width / 2, 455);
    this.drawDifficultyButton("FÁCIL", 405, this.difficulty === "facil");
    this.drawDifficultyButton("NORMAL", 640, this.difficulty === "normal");
    this.drawDifficultyButton("DIFÍCIL", 875, this.difficulty === "dificil");
    this.drawMenuButton("INICIAR VIAJE", 565, false, false);
    if (this.isIsabelaUnlocked) {
      c.font = "16px Arial"; c.fillStyle = "#fff7c2"; c.fillText("REJUGAR", this.canvas.width / 2, 615);
      this.drawReplayButton("CAPÍTULO 1", 320);
      this.drawReplayButton("CAPÍTULO 2", 640);
      this.drawReplayButton("CAPÍTULO 3", 960);
    } else {
      c.font = "18px Arial"; c.fillStyle = "#fff7c2"; c.fillText("Desbloquea a Isabela al completar el Capítulo 3", this.canvas.width / 2, 635);
    }
    c.font = "18px Arial"; c.fillStyle = "#e9d5ff"; c.fillText("A/D o flechas para moverte · Espacio para saltar", this.canvas.width / 2, 680);
    c.textAlign = "right"; c.font = "italic 16px Georgia"; c.fillStyle = "#fff1c7"; c.fillText("Hecho para mi Izzyta", this.canvas.width - 28, this.canvas.height - 24);
  }

  drawMenuButton(label, y, selected, disabled) {
    const c = this.context; const x = this.canvas.width / 2 - 190; const gradient = c.createLinearGradient(x, y - 30, x, y + 24); gradient.addColorStop(0, selected ? "#ffe092" : disabled ? "#5c5872" : "#497390"); gradient.addColorStop(1, selected ? "#d99d45" : disabled ? "#45425c" : "#294c69"); c.fillStyle = gradient; c.beginPath(); c.roundRect(x, y - 30, 380, 54, 10); c.fill(); c.strokeStyle = "#fff0bd"; c.lineWidth = 2; c.stroke(); c.fillStyle = disabled ? "#cbc5d6" : "#fff"; c.font = "bold 22px Arial"; c.textAlign = "center"; c.fillText(label, this.canvas.width / 2, y + 6);
  }

  drawDifficultyButton(label, centerX, selected) {
    const c = this.context;
    const x = centerX - 102;
    c.fillStyle = selected ? "#d99d45" : "#294c69";
    c.beginPath(); c.roundRect(x, 467, 204, 38, 9); c.fill();
    c.strokeStyle = selected ? "#fff3be" : "#8eb4c7"; c.lineWidth = 2; c.stroke();
    c.fillStyle = "#fff"; c.textAlign = "center"; c.font = "bold 15px Arial"; c.fillText(label, centerX, 492);
  }

  drawReplayButton(label, centerX) {
    const c = this.context;
    const x = centerX - 115;
    c.fillStyle = "#365d78";
    c.beginPath(); c.roundRect(x, 620, 230, 38, 9); c.fill();
    c.strokeStyle = "#b9d9d3"; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = "#fff7d7"; c.textAlign = "center"; c.font = "bold 15px Arial"; c.fillText(label, centerX, 645);
  }
}
