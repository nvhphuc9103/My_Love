const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d", { alpha: true });

const floatingHearts = document.getElementById("floatingHearts");
const promiseCard = document.getElementById("promiseCard");
const promiseToggle = document.getElementById("promiseToggle");

const HEART_FORM_SECONDS = 5;
const SHOW_CARD_AFTER_SECONDS = 5.15;

// Giảm DOM hearts để nhẹ hơn
const FLOATING_HEART_INTERVAL = 850;
const MAX_FLOATING_HEARTS = 16;

let width = 0;
let height = 0;
let dpr = 1;

let particles = [];
let backgroundStars = [];

let startTime = performance.now();
let cardReady = false;
let cardVisible = false;
let floatingTimer = null;
let resizeTimer = null;
let animationId = null;

let baseGradient = null;
let particleSprites = {};
let isPageVisible = true;

const palette = [
  {
    key: "pink",
    fill: "rgba(156, 71, 111, 0.95)",
    rgb: "255, 113, 206"
  },
  {
    key: "softPink",
    fill: "rgba(156, 99, 144, 0.92)",
    rgb: "255, 183, 240"
  },
  {
    key: "gold",
    fill: "rgba(148, 139, 100, 0.9)",
    rgb: "255, 238, 173"
  },
  {
    key: "purple",
    fill: "rgba(108, 81, 143, 0.92)",
    rgb: "190, 140, 255"
  },
  {
    key: "white",
    fill: "rgba(255, 255, 255, 0.59)",
    rgb: "255, 255, 255"
  }
];

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;

  // Giảm DPR để nhẹ hơn trên điện thoại nhưng vẫn nét
  dpr = Math.min(window.devicePixelRatio || 1, width < 760 ? 1.25 : 1.5);

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  createBaseGradient();
  createParticleSprites();
  createBackgroundStars();
  createHeartParticles();
}

function createBaseGradient() {
  baseGradient = ctx.createRadialGradient(
    width / 2,
    height * 0.32,
    20,
    width / 2,
    height * 0.36,
    Math.max(width, height)
  );

  baseGradient.addColorStop(0, "rgba(255, 90, 205, 0.16)");
  baseGradient.addColorStop(0.3, "rgba(88, 53, 170, 0.2)");
  baseGradient.addColorStop(1, "rgba(7, 0, 18, 1)");
}

// Vẽ sẵn hạt sáng thành ảnh nhỏ, sau đó drawImage cho nhẹ
function createParticleSprites() {
  particleSprites = {};

  for (const item of palette) {
    const size = 72;
    const offscreen = document.createElement("canvas");
    const offCtx = offscreen.getContext("2d");

    offscreen.width = size;
    offscreen.height = size;

    const center = size / 2;
    const gradient = offCtx.createRadialGradient(
      center,
      center,
      0,
      center,
      center,
      center
    );

    gradient.addColorStop(0, `rgba(${item.rgb}, 1)`);
    gradient.addColorStop(0.28, `rgba(${item.rgb}, 0.75)`);
    gradient.addColorStop(0.58, `rgba(${item.rgb}, 0.22)`);
    gradient.addColorStop(1, `rgba(${item.rgb}, 0)`);

    offCtx.fillStyle = gradient;
    offCtx.fillRect(0, 0, size, size);

    particleSprites[item.key] = offscreen;
  }
}

function heartPoint(t) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t);

  return { x, y: -y };
}

function randomPaletteItem() {
  return palette[Math.floor(Math.random() * palette.length)];
}

function getHeartLayout() {
  const isMobile = width < 760;
  const shortScreen = height < 640;

  return {
    isMobile,
    scale: Math.min(width, height) * (isMobile ? 0.0185 : 0.0225),
    centerX: width / 2,
    centerY: height * (isMobile ? 0.29 : shortScreen ? 0.36 : 0.34)
  };
}

function createBackgroundStars() {
  // Nền sao giảm nhẹ số lượng
  const count = width < 760 ? 64 : 105;

  backgroundStars = Array.from({ length: count }, (_, i) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: i % 8 === 0 ? Math.random() * 1.45 + 1.1 : Math.random() * 0.85 + 0.45,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.0012 + 0.0007,
    hue: Math.random() > 0.55 ? "255, 210, 250" : "255, 238, 173"
  }));
}

function createHeartParticles() {
  const { isMobile, scale, centerX, centerY } = getHeartLayout();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Số hạt nhẹ hơn bản cũ nhưng vẫn đủ dày
  const count = reducedMotion
    ? isMobile
      ? 300
      : 540
    : isMobile
      ? 520
      : 980;

  particles = [];

  for (let i = 0; i < count; i++) {
    const t = Math.random() * Math.PI * 2;
    const point = heartPoint(t);

    // Kết hợp hạt bên trong + hạt viền để trái tim rõ nét hơn
    const isOutline = Math.random() > 0.72;
    const fill = isOutline ? 0.92 + Math.random() * 0.12 : Math.sqrt(Math.random());

    const jitterX = (Math.random() - 0.5) * (isMobile ? 6 : 8);
    const jitterY = (Math.random() - 0.5) * (isMobile ? 6 : 8);

    const targetX = centerX + point.x * scale * fill + jitterX;
    const targetY = centerY + point.y * scale * fill + jitterY;

    let startX = Math.random() * width;
    let startY = Math.random() * height;
    const side = Math.floor(Math.random() * 4);

    if (side === 0) {
      startX = -80 - Math.random() * 120;
      startY = Math.random() * height;
    } else if (side === 1) {
      startX = width + 80 + Math.random() * 120;
      startY = Math.random() * height;
    } else if (side === 2) {
      startX = Math.random() * width;
      startY = -80 - Math.random() * 120;
    } else {
      startX = Math.random() * width;
      startY = height + 80 + Math.random() * 120;
    }

    const color = randomPaletteItem();

    particles.push({
      startX,
      startY,
      targetX,
      targetY,
      size: Math.random() * (isMobile ? 1.7 : 2.15) + 0.9,
      spriteKey: color.key,
      delay: Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2,
      orbit: Math.random() * (isMobile ? 1.2 : 1.8) + 0.35,
      alpha: Math.random() * 0.35 + 0.65
    });
  }
}

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}

function drawBackground(time) {
  ctx.fillStyle = baseGradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (const star of backgroundStars) {
    const alpha = 0.16 + Math.abs(Math.sin(time * star.speed + star.phase)) * 0.42;

    ctx.fillStyle = `rgba(${star.hue}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawHeartGlow(time, progress) {
  const { centerX, centerY, scale } = getHeartLayout();
  const radius = Math.max(130, scale * 35);
  const pulse = 0.75 + Math.abs(Math.sin(time * 0.0024)) * 0.25;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  const glow = ctx.createRadialGradient(centerX, centerY, 6, centerX, centerY, radius);
  glow.addColorStop(0, `rgba(255, 150, 226, ${0.18 * progress * pulse})`);
  glow.addColorStop(0.35, `rgba(255, 216, 156, ${0.08 * progress})`);
  glow.addColorStop(1, "rgba(255, 122, 223, 0)");

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawParticles(time) {
  const elapsed = (time - startTime) / 1000;
  const rawProgress = Math.min(elapsed / HEART_FORM_SECONDS, 1);
  const baseProgress = easeOutCubic(rawProgress);

  const { centerX, centerY } = getHeartLayout();
  const pulse = 1 + Math.sin(time * 0.003) * 0.022;

  drawHeartGlow(time, baseProgress);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (const p of particles) {
    const localRaw = Math.max(0, Math.min((rawProgress - p.delay) / (1 - p.delay), 1));
    const progress = easeOutCubic(localRaw);

    if (progress <= 0) continue;

    const wave = Math.sin(time * 0.003 + p.phase);

    const targetX = centerX + (p.targetX - centerX) * pulse;
    const targetY = centerY + (p.targetY - centerY) * pulse;

    const x =
      p.startX +
      (targetX - p.startX) * progress +
      Math.cos(time * 0.002 + p.phase) * p.orbit * progress;

    const y =
      p.startY +
      (targetY - p.startY) * progress +
      Math.sin(time * 0.002 + p.phase) * p.orbit * progress;

    const size = p.size * (0.5 + Math.abs(wave) * 0.8);
    const sprite = particleSprites[p.spriteKey];

    ctx.globalAlpha = p.alpha * (0.26 + progress * 0.32);
    ctx.drawImage(sprite, x - size, y - size, size * 2, size * 2);
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

function showPromiseCard() {
  if (cardReady) return;

  cardReady = true;
  cardVisible = true;

  document.body.classList.add("heart-ready");

  promiseCard.classList.remove("promise-card-hidden");
  promiseCard.classList.add("promise-card-visible");

  promiseToggle.textContent = "Ẩn lời hứa";
  promiseToggle.setAttribute("aria-expanded", "true");

  startFloatingHearts();

  setTimeout(() => {
    promiseCard.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 450);
}

function animate(time) {
  if (!isPageVisible) {
    animationId = requestAnimationFrame(animate);
    return;
  }

  drawBackground(time);
  drawParticles(time);

  const elapsed = (time - startTime) / 1000;
  if (elapsed >= SHOW_CARD_AFTER_SECONDS) showPromiseCard();

  animationId = requestAnimationFrame(animate);
}

function spawnFloatingHeart() {
  if (!floatingHearts || floatingHearts.childElementCount >= MAX_FLOATING_HEARTS) return;

  const heart = document.createElement("span");
  heart.className = "float-heart";
  heart.textContent = Math.random() > 0.45 ? "💖" : "💕";
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.fontSize = `${Math.random() * 16 + 17}px`;
  heart.style.setProperty("--drift", `${(Math.random() - 0.5) * 145}px`);
  heart.style.animationDuration = `${Math.random() * 3.5 + 6.5}s`;

  floatingHearts.appendChild(heart);

  setTimeout(() => heart.remove(), 11000);
}

function startFloatingHearts() {
  if (floatingTimer) return;

  spawnFloatingHeart();
  floatingTimer = setInterval(spawnFloatingHeart, FLOATING_HEART_INTERVAL);
}

promiseToggle.addEventListener("click", () => {
  if (!cardReady) {
    showPromiseCard();
    return;
  }

  cardVisible = !cardVisible;

  promiseCard.classList.toggle("promise-card-hidden", !cardVisible);
  promiseCard.classList.toggle("promise-card-visible", cardVisible);

  promiseToggle.textContent = cardVisible ? "Ẩn lời hứa" : "Hiện lời hứa";
  promiseToggle.setAttribute("aria-expanded", String(cardVisible));

  if (cardVisible) {
    setTimeout(() => {
      promiseCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resizeCanvas, 180);
});

document.addEventListener("visibilitychange", () => {
  isPageVisible = !document.hidden;
});

promiseToggle.setAttribute("aria-expanded", "false");

resizeCanvas();
animationId = requestAnimationFrame(animate);