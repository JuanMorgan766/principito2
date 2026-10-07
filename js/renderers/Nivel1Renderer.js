export class Nivel1Renderer {
  drawBackground(context, canvas, cameraX, zoneIndex, time = 0) {
    const sky = context.createLinearGradient(0, 0, 0, canvas.height);
    if (zoneIndex === 0) {
      sky.addColorStop(0, "#485b79"); sky.addColorStop(0.46, "#ce817b"); sky.addColorStop(0.72, "#f3b477"); sky.addColorStop(1, "#557d78");
    } else {
      sky.addColorStop(0, "#111c42"); sky.addColorStop(0.5, "#465987"); sky.addColorStop(1, "#b07d91");
    }
    context.fillStyle = sky; context.fillRect(0, 0, canvas.width, canvas.height);
    context.save();
    if (zoneIndex === 0) {
      this.pixelSun(context, 990, 155, 42);
      this.pixelMountains(context, canvas, cameraX, 0.12, 430, "#66788a");
      this.pixelMountains(context, canvas, cameraX, 0.25, 510, "#405e68");
      this.pixelTreeLine(context, canvas, cameraX, 0.4, "#284b49");
      context.fillStyle = "rgb(36 98 106 / 36%)"; context.fillRect(0, 545, canvas.width, 95);
      context.fillStyle = "rgb(255 220 161 / 18%)";
      for (let i = 0; i < 8; i += 1) context.fillRect(((i * 191 - cameraX * 0.3) % canvas.width + canvas.width) % canvas.width, 566 + (i % 3) * 17, 76, 3);
    } else {
      this.pixelStars(context, canvas, time);
      this.pixelSun(context, 1035, 158, 35, "#e7e0ff");
      this.pixelMountains(context, canvas, cameraX, 0.12, 550, "#303b65");
      this.clouds(context, canvas, cameraX, time);
    }
    context.restore();
  }

  pixelSun(context, x, y, radius, color = "#ffe6a0") {
    context.fillStyle = "rgb(255 225 161 / 12%)"; context.fillRect(x - radius * 1.8, y - radius * 1.8, radius * 3.6, radius * 3.6);
    context.fillStyle = color; context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    context.fillStyle = "rgb(255 251 213 / 45%)"; context.fillRect(x - radius + 8, y - radius + 8, radius * 1.2, 5);
  }

  pixelMountains(context, canvas, cameraX, parallax, baseY, color) {
    const shift = -((cameraX * parallax) % 420);
    context.fillStyle = color;
    for (let x = shift - 420; x < canvas.width + 420; x += 420) {
      context.beginPath(); context.moveTo(x, baseY); context.lineTo(x + 90, baseY - 110); context.lineTo(x + 150, baseY - 45); context.lineTo(x + 250, baseY - 180); context.lineTo(x + 420, baseY); context.fill();
    }
  }

  pixelTreeLine(context, canvas, cameraX, parallax, color) {
    const shift = -((cameraX * parallax) % 105);
    context.fillStyle = color;
    for (let x = shift - 105; x < canvas.width + 105; x += 105) {
      const height = 70 + (Math.abs(Math.floor(x / 105)) % 3) * 17;
      context.fillRect(x + 20, 545 - height, 12, height);
      context.fillRect(x, 545 - height - 18, 52, 28);
      context.fillRect(x + 8, 545 - height - 37, 36, 25);
    }
  }

  pixelStars(context, canvas, time) {
    context.fillStyle = "#dce5ff";
    for (let i = 0; i < 56; i += 1) {
      context.globalAlpha = 0.38 + (Math.sin(time * 1.4 + i) + 1) * 0.24;
      const x = (i * 113 + 37) % canvas.width; const y = 24 + (i * 53) % 435;
      context.fillRect(x, y, i % 5 === 0 ? 4 : 2, i % 5 === 0 ? 4 : 2);
    }
    context.globalAlpha = 1;
  }

  clouds(context, canvas, cameraX, time) {
    context.fillStyle = "rgb(203 220 255 / 35%)";
    const offset = -((cameraX * 0.2 + time * 8) % 420);
    for (let x = offset - 420; x < canvas.width + 420; x += 420) {
      context.fillRect(x, 180, 156, 18); context.fillRect(x + 24, 160, 92, 20);
      context.fillRect(x + 196, 300, 138, 15); context.fillRect(x + 218, 282, 78, 18);
    }
  }

  drawDecorations(context, worldWidth, zoneIndex, cameraX, viewWidth, time = 0) {
    if (zoneIndex === 1) return this.drawFloatingIslands(context, cameraX, viewWidth, time);
    context.fillStyle = "#254c43";
    for (let x = Math.max(0, Math.floor(cameraX / 210) * 210 - 210); x < Math.min(worldWidth, cameraX + viewWidth + 210); x += 210) {
      context.fillRect(x + 18, 570, 7, 72); context.fillRect(x, 582, 42, 8);
      context.fillRect(x - 5, 574, 52, 6);
      for (let b = 0; b < 5; b += 1) context.fillRect(x - 26 + b * 14, 565 - (b % 2) * 8, 12, 12);
    }
    for (const [x, y, scale] of [[650, 571, 1], [2080, 551, 1.25], [2900, 561, 0.92], [4375, 571, 1.1]]) {
      if (x < cameraX - 210 || x > cameraX + viewWidth + 210) continue;
      this.temple(context, x, y, scale);
    }
    if (1080 >= cameraX - 100 && 1080 <= cameraX + viewWidth + 100) this.stoneGardenFigure(context, 1080, 574);
    for (const [x, y] of [[790, 615], [2280, 618], [3680, 615]]) {
      if (x >= cameraX - 40 && x <= cameraX + viewWidth + 40) this.lotus(context, x, y, time);
    }
    this.drawIntegratedPipe(context, 4750, 492);
  }

  temple(context, x, y, scale) {
    context.save(); context.translate(x, y); context.scale(scale, scale);
    context.fillStyle = "rgb(17 32 43 / 36%)"; context.fillRect(-72, 0, 144, 17);
    context.fillStyle = "#695248"; context.fillRect(-54, -82, 108, 82);
    context.fillStyle = "#b38861"; context.fillRect(-44, -72, 88, 72);
    context.fillStyle = "#e1b77c"; context.fillRect(-36, -65, 12, 65); context.fillRect(24, -65, 12, 65);
    context.fillStyle = "#2e4e59";
    context.fillRect(-78, -88, 156, 12); context.fillRect(-62, -102, 124, 12); context.fillRect(-43, -116, 86, 12);
    context.fillStyle = "#d6a75e"; context.fillRect(-67, -91, 134, 4); context.fillRect(-51, -105, 102, 4);
    context.fillStyle = "#f5cf7c"; context.fillRect(-7, -44, 14, 44);
    context.restore();
  }

  lotus(context, x, y, time) {
    const bob = Math.round(Math.sin(time * 2 + x) * 2);
    context.fillStyle = "#315c50"; context.fillRect(x - 20, y + bob, 40, 7);
    context.fillStyle = "#e87ca4"; context.fillRect(x - 4, y - 15 + bob, 8, 18); context.fillRect(x - 13, y - 8 + bob, 10, 11); context.fillRect(x + 3, y - 8 + bob, 10, 11);
    context.fillStyle = "#ffe39b"; context.fillRect(x - 3, y - 5 + bob, 6, 6);
  }

  stoneGardenFigure(context, x, y) {
    context.save(); context.translate(x, y);
    context.fillStyle = "#35585a"; context.fillRect(-38, -11, 76, 12); context.fillRect(-30, -20, 60, 10);
    context.fillStyle = "#507472"; context.fillRect(-26, -55, 52, 36); context.fillRect(-39, -35, 78, 18);
    context.fillStyle = "#70908a"; context.fillRect(-19, -50, 35, 22); context.fillRect(-34, -31, 18, 10);
    context.fillStyle = "#567b79"; context.fillRect(-19, -78, 38, 29); context.fillRect(-26, -70, 7, 18); context.fillRect(19, -70, 7, 18);
    context.fillStyle = "#9aab8f"; context.fillRect(-12, -73, 25, 20); context.fillRect(-4, -82, 11, 9);
    context.fillStyle = "#2a464c"; context.fillRect(-7, -63, 3, 3); context.fillRect(6, -63, 3, 3);
    context.fillStyle = "#dbbd78"; context.fillRect(-2, -56, 5, 2);
    context.restore();
  }

  drawIntegratedPipe(context, x, y) {
    context.fillStyle = "#24434b"; context.fillRect(x - 13, y + 3, 136, 150);
    context.fillStyle = "#458b78"; context.fillRect(x, y + 23, 110, 125);
    context.fillStyle = "#7fc69a"; context.fillRect(x + 13, y + 35, 18, 88);
    context.fillStyle = "#9ad8a5"; context.fillRect(x - 12, y, 134, 35);
    context.fillStyle = "#3b765f"; context.fillRect(x - 12, y + 26, 134, 10);
    context.fillStyle = "#274d4c"; context.fillRect(x + 39, y + 44, 34, 104);
    context.fillStyle = "#82a97c"; context.fillRect(x + 45, y + 47, 7, 85);
    context.fillStyle = "#bb8e63"; context.fillRect(x - 23, y + 144, 154, 12);
    context.fillStyle = "#3e6250"; context.fillRect(x - 33, y + 133, 16, 24); context.fillRect(x + 115, y + 136, 20, 21);
  }

  drawFloatingIslands(context, cameraX, viewWidth, time) {
    const islands = [[140, 590], [530, 560], [900, 603], [1270, 566], [1660, 592], [2070, 570], [2470, 605], [2880, 565], [3280, 590]];
    for (const [x, y] of islands) {
      if (x < cameraX - 100 || x > cameraX + viewWidth + 100) continue;
      const bob = Math.round(Math.sin(time * 1.2 + x) * 3);
      context.fillStyle = "#303657"; context.fillRect(x, y + bob, 88, 12);
      context.fillStyle = "#506279"; context.fillRect(x + 8, y + 12 + bob, 70, 13);
      context.fillStyle = "#394b62"; context.fillRect(x + 18, y + 25 + bob, 11, 23); context.fillRect(x + 52, y + 25 + bob, 9, 17);
      context.fillStyle = "#9ec0bb"; context.fillRect(x + 16, y + bob, 52, 4);
    }
  }
}
