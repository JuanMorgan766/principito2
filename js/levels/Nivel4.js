const RECORD_KEY = "principito-nivel4-record";
const SEGMENT_LENGTH = 1180;
const ZONE_LENGTH = 5000;
const GROUND_Y = 570;
const PLAYER_SCALE = 0.52;
const WORLD_WIDTH = 1_000_000_000_000;
const ZONE_TRANSITION_DURATION = 1.6;

const ZONES = [
  { name: "DUNAS DEL ATARDECER", scene: "mountains", sky: ["#e99463", "#744e62", "#26354b"], sun: "#fff0a8", ridge: "#69515c", ground: "#674538", light: "#f4b16c" },
  { name: "VALLE DEL VIENTO", scene: "mountains", sky: ["#91aeb1", "#59747e", "#263e50"], sun: "#f9e3ac", ridge: "#52616b", ground: "#43505a", light: "#c7d9bb" },
  { name: "NUEVA YORK DE NOCHE", scene: "new-york", sky: ["#303a62", "#202843", "#10182c"], sun: "#e5d8b0", ridge: "#222b42", ground: "#252b38", light: "#f2c66d" },
  { name: "COSTA DE CRISTAL", scene: "mountains", sky: ["#729bad", "#4d6881", "#283a58"], sun: "#f7d7a1", ridge: "#42546d", ground: "#38445a", light: "#9fe2dc" },
  { name: "NOCHE DE ESTRELLAS", scene: "mountains", sky: ["#555371", "#343c60", "#1b2842"], sun: "#e6d9ff", ridge: "#383a56", ground: "#303149", light: "#c5b6ff" },
];

function blendColor(from, to, amount) {
  const mix = (start, end) => Math.round(start + (end - start) * amount).toString(16).padStart(2, "0");
  return `#${mix(Number.parseInt(from.slice(1, 3), 16), Number.parseInt(to.slice(1, 3), 16))}${mix(Number.parseInt(from.slice(3, 5), 16), Number.parseInt(to.slice(3, 5), 16))}${mix(Number.parseInt(from.slice(5, 7), 16), Number.parseInt(to.slice(5, 7), 16))}`;
}

export class Nivel4 {
  constructor({ random = Math.random, storage } = {}) {
    this.id = 4;
    this.title = "Nivel 4 — Carrera infinita";
    this.theme = "arcade";
    this.worldWidth = WORLD_WIDTH;
    this.spawn = { x: 120, y: GROUND_Y };
    this.platforms = [{ x: -1000, y: GROUND_Y, width: WORLD_WIDTH, height: 220, color: "#674538" }];
    this.enemies = [];
    this.stars = [];
    this.random = random;
    this.storage = storage ?? this.getDefaultStorage();
    this.bestScore = this.readRecord();
    this.reset();
  }

  getDefaultStorage() {
    try { return globalThis.localStorage; } catch { return null; }
  }

  readRecord() {
    try {
      const value = Number(this.storage?.getItem(RECORD_KEY));
      return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
    } catch { return 0; }
  }

  saveRecord() {
    if (this.score <= this.bestScore) return;
    this.bestScore = this.score;
    try { this.storage?.setItem(RECORD_KEY, String(this.bestScore)); } catch { /* Récord de sesión. */ }
  }

  reset() {
    this.distance = 0;
    this.score = 0;
    this.bonusScore = 0;
    this.speed = 330;
    this.difficultyTier = 0;
    this.zoneIndex = 0;
    this.zoneToastTime = 0;
    this.previousZoneIndex = null;
    this.zoneTransitionTime = 0;
    this.isOver = false;
    this.cameraX = 0;
    this.nextSegmentX = 0;
    this.segmentIndex = 0;
    this.skipHazardForNextSegment = false;
    this.segments = [];
    this.hazards = [];
    this.pickups = [];
    this.ensureSegments(4200);
  }

  start(player) {
    this.reset();
    this.originalPlayerSize = { width: player.width, height: player.height };
    player.width = Math.max(32, Math.round(player.width * PLAYER_SCALE));
    player.height = Math.max(58, Math.round(player.height * PLAYER_SCALE));
    player.arcadeDrawScale = PLAYER_SCALE;
    player.arcadeNativeWidth = this.originalPlayerSize.width;
    player.arcadeNativeHeight = this.originalPlayerSize.height;
    player.arcadeStandingHeight = player.height;
    player.arcadeCrouchHeight = Math.max(36, Math.round(player.height * 0.58));
    player.arcadeCrouching = false;
    const originalShadow = player.drawPixelShadow.bind(player);
    player.drawPixelShadow = (context, _centerX, _y, width) => {
      originalShadow(context, player.x + player.arcadeNativeWidth / 2, player.y + player.arcadeNativeHeight - 4, width ?? player.arcadeNativeWidth * 0.62);
    };
    player.x = 120;
    player.y = GROUND_Y - player.height;
    player.previousX = player.x;
    player.previousY = player.y;
    player.velocityY = 0;
    player.isOnGround = true;
    player.jumpsUsed = 0;
    player.maxJumps = 1;
    player.hasDoubleJump = false;
    player.hasSword = false;
    player.hasSling = false;
    this.cameraX = 0;
  }

  ensureSegments(untilX) {
    while (this.nextSegmentX < untilX) this.generateSegment();
  }

  generateSegment() {
    const startX = this.nextSegmentX;
    const index = this.segmentIndex;
    const safe = index > 0 && index % 5 === 4;
    const skipHazard = this.skipHazardForNextSegment;
    this.skipHazardForNextSegment = false;
    const segment = { x: startX, width: SEGMENT_LENGTH, index, safe };
    this.segments.push(segment);

    if (!safe) {
      if (!skipHazard) {
        const type = this.pickHazardType(index);
        const x = startX + (index === 0 ? 690 : 360 + this.random() * 170);
        this.hazards.push(this.createHazard(type, x, index));
        if (this.difficultyTier >= 4 && index % 2 === 1) {
          // Da tiempo para aterrizar, reaccionar y despegar de nuevo incluso
          // a velocidad máxima; el tramo siguiente queda como recuperación.
          const secondType = this.pickHazardType(index + 1);
          this.hazards.push(this.createHazard(secondType, startX + 1190, index + 1));
          this.skipHazardForNextSegment = true;
        }
      }
    } else {
      this.pickups.push({ x: startX + 560, y: GROUND_Y - 48, width: 24, height: 24, active: true, phase: index });
    }

    this.nextSegmentX += SEGMENT_LENGTH;
    this.segmentIndex += 1;
  }

  pickHazardType(seed) {
    const types = this.difficultyTier < 2 ? ["rock", "thorn", "enemy"] : ["rock", "thorn", "enemy", "aerial"];
    const value = this.random();
    return types[(Math.floor(value * types.length) + seed) % types.length];
  }

  createHazard(kind, x, seed) {
    const sizeVariation = Math.floor(this.random() * 10);
    if (kind === "aerial") return { kind, x, y: GROUND_Y - 108, width: 54, height: 42, active: true, phase: seed * 0.7 };
    if (kind === "enemy") return {
      kind, x, y: GROUND_Y - 62, width: 46, height: 62, active: true,
      phase: seed * 0.4, approaching: false,
      speed: Math.min(this.speed * 0.36, 48 + this.difficultyTier * 9),
    };
    if (kind === "thorn") return { kind, x, y: GROUND_Y - 38, width: 44 + sizeVariation, height: 38, active: true, phase: seed };
    return { kind: "rock", x, y: GROUND_Y - 42 - sizeVariation, width: 42 + sizeVariation, height: 42 + sizeVariation, active: true, phase: seed };
  }

  update(deltaTime, player, input, developerMode = false) {
    if (this.isOver) return { died: false, jumped: false, collected: false };
    const horizontalDirection = input.getHorizontalDirection();
    const speedModifier = horizontalDirection < 0 ? 0.86 : horizontalDirection > 0 ? 1.12 : 1;
    this.speed = Math.min(610, 330 + Math.floor(this.distance / 1900) * 20);
    this.difficultyTier = Math.floor(this.distance / 1900);
    this.distance += this.speed * speedModifier * deltaTime;
    player.previousX = player.x;
    player.x += this.speed * speedModifier * deltaTime;
    for (const hazard of this.hazards) {
      if (hazard.kind !== "enemy" || !hazard.active) continue;
      if (hazard.x - player.x <= 850) hazard.approaching = true;
      if (hazard.approaching) {
        hazard.speed = Math.min(this.speed * 0.36, 48 + this.difficultyTier * 9);
        hazard.x -= hazard.speed * deltaTime;
      }
    }
    const wantsCrouch = Boolean(input.isCrouching?.());
    this.setPlayerCrouching(player, wantsCrouch && player.isOnGround);
    const inputForPlayer = {
      getHorizontalDirection: () => 0,
      getVerticalDirection: () => 0,
      isCrouching: () => wantsCrouch,
      consumeJump: () => input.consumeJump(),
      consumeAttack: () => false,
    };
    const actions = player.update(deltaTime, inputForPlayer, WORLD_WIDTH, this.platforms);
    if (player.arcadeCrouching && !player.isOnGround) this.setPlayerCrouching(player, false);
    this.score = Math.floor(this.distance / 10) + this.bonusScore;
    this.ensureSegments(this.distance + 4300);
    this.segments = this.segments.filter((segment) => segment.x + segment.width > this.distance - 1800);
    this.hazards = this.hazards.filter((hazard) => hazard.active && hazard.x + hazard.width > this.distance - 500);
    this.pickups = this.pickups.filter((pickup) => pickup.active && pickup.x + pickup.width > this.distance - 500);
    this.cameraX = Math.max(0, player.x - 350);

    let zoneChanged = false;
    const nextZone = Math.floor(this.distance / ZONE_LENGTH);
    if (nextZone !== this.zoneIndex) {
      this.previousZoneIndex = this.zoneIndex;
      this.zoneIndex = nextZone;
      this.zoneToastTime = 2.5;
      this.zoneTransitionTime = ZONE_TRANSITION_DURATION;
      zoneChanged = true;
    } else {
      this.zoneToastTime = Math.max(0, this.zoneToastTime - deltaTime);
      this.zoneTransitionTime = Math.max(0, this.zoneTransitionTime - deltaTime);
      if (this.zoneTransitionTime === 0) this.previousZoneIndex = null;
    }

    let collected = false;
    for (const pickup of this.pickups) {
      if (pickup.active && this.intersects(player, pickup)) {
        pickup.active = false;
        this.bonusScore += 50;
        this.score += 50;
        collected = true;
      }
    }
    this.saveRecord();

    for (const hazard of this.hazards) {
      if (!hazard.active || !this.intersects(player, hazard)) continue;
      if (developerMode) {
        hazard.active = false;
        continue;
      }
      this.isOver = true;
      this.saveRecord();
      return { died: true, jumped: actions.jumped, collected };
    }
    if (player.y > GROUND_Y + 70) {
      if (!developerMode) {
        this.isOver = true;
        this.saveRecord();
        return { died: true, jumped: actions.jumped, collected };
      }
      player.y = GROUND_Y - player.height;
      player.velocityY = 0;
      player.isOnGround = true;
    }
    return { died: false, jumped: actions.jumped, collected, zoneChanged };
  }

  intersects(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  setPlayerCrouching(player, crouching) {
    if (crouching && !player.arcadeCrouching) {
      const feet = player.y + player.height;
      player.height = player.arcadeCrouchHeight;
      player.y = feet - player.height;
      player.arcadeCrouching = true;
    } else if (!crouching && player.arcadeCrouching) {
      const feet = player.y + player.height;
      player.height = player.arcadeStandingHeight;
      player.y = feet - player.height;
      player.arcadeCrouching = false;
    }
  }

  get zone() { return ZONES[this.zoneIndex % ZONES.length]; }

  getVisualZone() {
    const current = this.zone;
    if (this.previousZoneIndex === null || this.zoneTransitionTime <= 0) return current;
    const previous = ZONES[this.previousZoneIndex % ZONES.length];
    const blend = 1 - this.zoneTransitionTime / ZONE_TRANSITION_DURATION;
    return {
      name: current.name,
      scene: current.scene,
      previousScene: previous.scene,
      sceneBlend: blend,
      sky: current.sky.map((color, index) => blendColor(previous.sky[index], color, blend)),
      sun: blendColor(previous.sun, current.sun, blend),
      ridge: blendColor(previous.ridge, current.ridge, blend),
      ground: blendColor(previous.ground, current.ground, blend),
      light: blendColor(previous.light, current.light, blend),
    };
  }

  drawBackground(context, canvas, cameraX, visualTime) {
    const zone = this.getVisualZone();
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, zone.sky[0]); gradient.addColorStop(0.58, zone.sky[1]); gradient.addColorStop(1, zone.sky[2]);
    context.fillStyle = gradient; context.fillRect(0, 0, canvas.width, canvas.height);
    const isCity = zone.scene === "new-york";
    const sunX = canvas.width * 0.74 - (cameraX * 0.025) % 280;
    const sunY = isCity ? 132 : 170 + Math.sin(visualTime * 0.25) * 4;
    const glowRadius = isCity ? 145 : 185;
    const glow = context.createRadialGradient(sunX, sunY, 8, sunX, sunY, glowRadius);
    glow.addColorStop(0, `${zone.sun}88`); glow.addColorStop(1, `${zone.sun}00`);
    context.fillStyle = glow; context.fillRect(sunX - glowRadius, sunY - glowRadius, glowRadius * 2, glowRadius * 2);
    context.fillStyle = zone.sun; context.globalAlpha = 0.78; context.beginPath(); context.arc(sunX, sunY, isCity ? 26 : 44, 0, Math.PI * 2); context.fill(); context.globalAlpha = 1;
    if (zone.previousScene && zone.previousScene !== zone.scene) {
      this.drawScenery(context, canvas, cameraX, zone, zone.previousScene, 1 - zone.sceneBlend);
      this.drawScenery(context, canvas, cameraX, zone, zone.scene, zone.sceneBlend);
    } else this.drawScenery(context, canvas, cameraX, zone, zone.scene ?? "mountains", 1);
    context.fillStyle = "rgb(255 232 186 / 22%)";
    for (let index = 0; index < 36; index += 1) {
      const x = (index * 197 - cameraX * 0.13 + canvas.width * 4) % canvas.width;
      const y = 36 + (index * 83) % 350;
      context.fillRect(x, y, index % 6 === 0 ? 3 : 2, index % 6 === 0 ? 3 : 2);
    }
    if (this.zoneToastTime > 0 && this.zoneIndex > 0) {
      context.fillStyle = "rgb(18 27 47 / 52%)"; context.beginPath(); context.roundRect(canvas.width / 2 - 200, 205, 400, 52, 12); context.fill();
      context.fillStyle = "#fff2c9"; context.font = "bold 19px Georgia"; context.textAlign = "center";
      context.fillText(zone.name, canvas.width / 2, 238);
    }
  }

  drawScenery(context, canvas, cameraX, zone, scene, alpha) {
    context.save(); context.globalAlpha *= alpha;
    if (scene === "new-york") this.drawNewYorkSkyline(context, canvas, cameraX);
    else {
      for (let layer = 0; layer < 3; layer += 1) {
        const parallax = cameraX * (0.08 + layer * 0.065);
        const baseY = 340 + layer * 48;
        const colors = ["#343b50", zone.ridge, `${zone.ridge}cc`];
        context.fillStyle = colors[layer]; context.beginPath(); context.moveTo(0, canvas.height);
        for (let point = -2; point <= 10; point += 1) {
          const x = point * 180 - (parallax % 180);
          const peakY = baseY - ((point * 37 + layer * 19) % 78);
          context.lineTo(x, peakY); context.lineTo(x + 88, baseY + 38);
        }
        context.lineTo(canvas.width, canvas.height); context.closePath(); context.fill();
      }
    }
    context.restore();
  }

  drawNewYorkSkyline(context, canvas, cameraX) {
    for (let layer = 0; layer < 3; layer += 1) {
      const parallax = cameraX * (0.08 + layer * 0.075);
      const baseY = 378 + layer * 48;
      const step = 128;
      const first = Math.floor(parallax / step) - 2;
      for (let index = first; index < first + Math.ceil(canvas.width / step) + 5; index += 1) {
        const screenX = index * step - parallax;
        const seed = Math.abs(index * 37 + layer * 19);
        const width = 72 + seed % 45;
        const height = 86 + (seed * 17 % (layer === 0 ? 132 : 96));
        const top = baseY - height;
        context.fillStyle = layer === 0 ? "#182239" : layer === 1 ? "#202b42" : "#29354a";
        context.fillRect(screenX, top, width, height + canvas.height - baseY);
        if (seed % 4 === 0) {
          context.fillRect(screenX + width * 0.42, top - 24, 5, 24);
          context.fillRect(screenX + width * 0.35, top + 10, width * 0.3, 5);
        } else if (seed % 5 === 0) {
          const roofPeak = 12 + seed % 20;
          context.beginPath(); context.moveTo(screenX, top); context.lineTo(screenX + width / 2, top - roofPeak); context.lineTo(screenX + width, top); context.fill();
        }
        context.fillStyle = layer === 0 ? "#efc777" : "#b5c9e5";
        for (let row = 0; row < Math.floor(height / 22); row += 1) {
          for (let column = 0; column < Math.floor(width / 18); column += 1) {
            if ((seed + row * 7 + column * 11) % 5 < 2) context.fillRect(screenX + 10 + column * 18, top + 14 + row * 22, 6, 9);
          }
        }
      }
    }
  }

  drawWorld(context, canvas, cameraX, player, visualTime) {
    const zone = this.getVisualZone();
    context.save(); context.translate(-cameraX, 0);
    // El piso se mantiene continuo y seguro; sus formas y sombras cambian por zona.
    context.fillStyle = zone.ground; context.fillRect(cameraX - 100, GROUND_Y, canvas.width + 220, canvas.height - GROUND_Y);
    context.fillStyle = zone.light; context.fillRect(cameraX - 100, GROUND_Y, canvas.width + 220, 7);
    context.fillStyle = "rgb(25 27 39 / 30%)";
    for (let x = Math.floor((cameraX - 80) / 100) * 100; x < cameraX + canvas.width + 100; x += 100) {
      const offset = (Math.floor(x / 100) % 3) * 7;
      context.fillRect(x, GROUND_Y + 24 + offset, 34, 4);
      context.fillRect(x + 48, GROUND_Y + 53 + (offset % 9), 15, 3);
    }
    if (zone.scene === "new-york") {
      context.fillStyle = "rgb(245 205 117 / 70%)";
      for (let x = Math.floor((cameraX - 80) / 150) * 150; x < cameraX + canvas.width + 100; x += 150) context.fillRect(x, GROUND_Y + 39, 62, 4);
    }
    for (const pickup of this.pickups) if (pickup.active && pickup.x > cameraX - 80 && pickup.x < cameraX + canvas.width + 80) this.drawPickup(context, pickup, visualTime);
    for (const hazard of this.hazards) if (hazard.active && hazard.x > cameraX - 100 && hazard.x < cameraX + canvas.width + 100) this.drawHazard(context, hazard, visualTime, zone);
    if (player) {
      const scale = player.arcadeDrawScale ?? PLAYER_SCALE;
      context.save(); context.translate(player.x, player.y); context.scale(scale, scale * (player.arcadeCrouching ? 0.58 : 1)); context.translate(-player.x, -player.y);
      player.draw(context); context.restore();
    }
    context.restore();
  }

  drawHazard(context, hazard, visualTime, zone) {
    context.save();
    if (hazard.kind === "enemy" || hazard.kind === "aerial") {
      const bob = Math.sin(visualTime * 4 + hazard.phase) * 4;
      const y = hazard.y + (hazard.kind === "aerial" ? bob : 0);
      if (hazard.kind === "enemy" && hazard.approaching) {
        context.strokeStyle = zone.light; context.lineWidth = 3;
        context.beginPath(); context.moveTo(hazard.x - 16, y + 18); context.lineTo(hazard.x - 5, y + 18); context.stroke();
        context.beginPath(); context.moveTo(hazard.x - 11, y + 29); context.lineTo(hazard.x - 4, y + 29); context.stroke();
        if (hazard.x < this.cameraX + 520) {
          context.fillStyle = "#ffd37d"; context.font = "bold 19px Arial"; context.textAlign = "center";
          context.fillText("!", hazard.x + hazard.width / 2, y - 8);
        }
      }
      context.fillStyle = "#242638"; context.beginPath(); context.ellipse(hazard.x + hazard.width / 2, y + hazard.height / 2, hazard.width / 2, hazard.height / 2, 0, 0, Math.PI * 2); context.fill();
      context.fillStyle = zone.light; context.fillRect(hazard.x + 10, y + 12, 7, 5); context.fillRect(hazard.x + 29, y + 12, 7, 5);
      context.fillStyle = "#fff0d0"; context.fillRect(hazard.x + 12, y + 12, 2, 2); context.fillRect(hazard.x + 31, y + 12, 2, 2);
      context.fillStyle = "#392c32"; context.fillRect(hazard.x + 7, y + hazard.height - 5, hazard.width - 14, 7);
    } else if (hazard.kind === "thorn") {
      const count = Math.max(3, Math.floor(hazard.width / 12));
      context.fillStyle = "#292c3b"; context.beginPath(); context.moveTo(hazard.x, GROUND_Y);
      for (let index = 0; index <= count; index += 1) context.lineTo(hazard.x + index * hazard.width / count, GROUND_Y - (index % 2 ? 8 : hazard.height));
      context.lineTo(hazard.x + hazard.width, GROUND_Y); context.closePath(); context.fill();
      context.strokeStyle = zone.light; context.lineWidth = 2; context.stroke();
    } else {
      context.fillStyle = "#292d3c"; context.beginPath(); context.moveTo(hazard.x, GROUND_Y); context.lineTo(hazard.x + 5, hazard.y + 15); context.lineTo(hazard.x + hazard.width * 0.42, hazard.y); context.lineTo(hazard.x + hazard.width - 4, hazard.y + 11); context.lineTo(hazard.x + hazard.width, GROUND_Y); context.closePath(); context.fill();
      context.fillStyle = "rgb(255 255 255 / 14%)"; context.fillRect(hazard.x + hazard.width * 0.44, hazard.y + 8, 5, hazard.height * 0.35);
    }
    context.restore();
  }

  drawPickup(context, pickup, visualTime) {
    const bob = Math.sin(visualTime * 5 + pickup.phase) * 4;
    context.save(); context.translate(pickup.x + pickup.width / 2, pickup.y + pickup.height / 2 + bob);
    context.rotate(Math.PI / 4); context.fillStyle = "#fff0ae"; context.shadowColor = "#ffe99b"; context.shadowBlur = 14;
    context.fillRect(-8, -8, 16, 16); context.shadowBlur = 0; context.fillStyle = "#fffdf0"; context.fillRect(-3, -3, 6, 6); context.restore();
  }
}

export { PLAYER_SCALE, RECORD_KEY, ZONE_LENGTH, SEGMENT_LENGTH };
