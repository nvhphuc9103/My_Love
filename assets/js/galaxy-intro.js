import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";


function startLoveMusicIfPossible() {
  try {
    if (window.parent && window.parent !== window && typeof window.parent.startLoveMusic === "function") {
      window.parent.startLoveMusic();
      return;
    }
  } catch (error) {}

  try {
    window.parent?.postMessage?.({ type: "love:startMusic" }, "*");
  } catch (error) {}
}

function goLovePage(page) {
  try {
    if (window.parent && window.parent !== window && typeof window.parent.goLovePage === "function") {
      window.parent.goLovePage(page);
      return;
    }
  } catch (error) {}

  window.location.href = `${page}.html`;
}

const canvas = document.getElementById("galaxyCanvas");
const exploreBtn = document.getElementById("exploreBtn");
const introContent = document.querySelector(".intro-content");
const dragHint = document.getElementById("dragHint");
const transitionText = document.getElementById("transitionText");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  260
);
camera.position.set(0, 1.6, 16);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const mainGroup = new THREE.Group();
scene.add(mainGroup);

const isMobile = window.innerWidth < 768;
const sphereCount = isMobile ? 3500 : 6500;
const ringCount = isMobile ? 6500 : 12000;
const bgCount = isMobile ? 760 : 1400;

const clock = new THREE.Clock();
let explosionActive = false;
let explosionStart = 0;

function createParticleMaterial(pointScale = 55) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uPointScale: { value: pointScale },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
    },
    vertexShader: `
      attribute float aSize;
      attribute float aTwinkle;
      attribute vec3 color;

      varying vec3 vColor;
      varying float vTwinkle;

      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uPointScale;

      void main() {
        vColor = color;
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);

        float twinkle = sin(
          uTime * aTwinkle +
          position.x * 2.0 +
          position.y * 3.0 +
          position.z * 2.0
        );

        vTwinkle = 0.55 + abs(twinkle) * 0.45;

        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;
        gl_Position = projectedPosition;

        gl_PointSize = aSize * uPixelRatio * vTwinkle;
        gl_PointSize *= uPointScale / -viewPosition.z;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vTwinkle;
      uniform float uOpacity;

      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        float strength = 1.0 - smoothstep(0.0, 0.5, d);
        strength = pow(strength, 1.9);
        vec3 finalColor = vColor * vTwinkle;
        gl_FragColor = vec4(finalColor * 0.88, strength * 0.62 * uOpacity);
      }
    `
  });
}

const particleMaterial = createParticleMaterial(55);
const bgMaterial = createParticleMaterial(95);

function makeGeometry(count) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(count), 1));
  geometry.setAttribute("aTwinkle", new THREE.BufferAttribute(new Float32Array(count), 1));
  return geometry;
}

function setParticle(geometry, index, x, y, z, color, size, twinkle) {
  const i3 = index * 3;
  geometry.attributes.position.array[i3] = x;
  geometry.attributes.position.array[i3 + 1] = y;
  geometry.attributes.position.array[i3 + 2] = z;
  geometry.attributes.color.array[i3] = color.r;
  geometry.attributes.color.array[i3 + 1] = color.g;
  geometry.attributes.color.array[i3 + 2] = color.b;
  geometry.attributes.aSize.array[index] = size;
  geometry.attributes.aTwinkle.array[index] = twinkle;
}

function randomColor(colors) {
  return colors[Math.floor(Math.random() * colors.length)].clone();
}

const sphereColors = [
  new THREE.Color("#ffffff"),
  new THREE.Color("#ffe4ff"),
  new THREE.Color("#ff9df2"),
  new THREE.Color("#c084fc"),
  new THREE.Color("#fef3c7")
];

const sphereGeometry = makeGeometry(sphereCount);
const sphereRadius = 3.05;

for (let i = 0; i < sphereCount; i++) {
  const u = Math.random();
  const v = Math.random();
  const theta = u * Math.PI * 2;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * sphereRadius;

  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.cos(phi);
  const z = r * Math.sin(phi) * Math.sin(theta);

  let color = randomColor(sphereColors);
  if (r < sphereRadius * 0.35) color.lerp(new THREE.Color("#fff4ba"), 0.7);

  const size = Math.random() * 0.75 + 0.35;
  const twinkle = Math.random() * 2.5 + 1.5;
  setParticle(sphereGeometry, i, x, y, z, color, size, twinkle);
}

const sphereParticles = new THREE.Points(sphereGeometry, particleMaterial);
mainGroup.add(sphereParticles);

const ringColors = [
  new THREE.Color("#7c3aed"),
  new THREE.Color("#a855f7"),
  new THREE.Color("#d946ef"),
  new THREE.Color("#f0abfc"),
  new THREE.Color("#fef3c7"),
  new THREE.Color("#ffffff")
];

const ringGeometry = makeGeometry(ringCount);
const innerRadius = 3.75;
const outerRadius = 10.5;

for (let i = 0; i < ringCount; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radiusRandom = Math.pow(Math.random(), 0.72);
  const radius = innerRadius + radiusRandom * (outerRadius - innerRadius);
  const widthNoise = (Math.random() - 0.5) * 0.38;

  const x = Math.cos(angle) * radius + widthNoise;
  const z = Math.sin(angle) * radius * 0.72;
  const y = (Math.random() - 0.5) * 0.28;

  let color;
  if (radius < 5.1) color = new THREE.Color("#fff4ba");
  else if (radius < 7.0) color = new THREE.Color("#ffb3f7");
  else color = randomColor(ringColors);

  if (Math.random() > 0.94) color = new THREE.Color("#ffffff");

  const size = Math.random() * 0.65 + 0.25;
  const twinkle = Math.random() * 2.8 + 1.2;
  setParticle(ringGeometry, i, x, y, z, color, size, twinkle);
}

const ringParticles = new THREE.Points(ringGeometry, particleMaterial);
ringParticles.rotation.x = -0.25;
ringParticles.rotation.z = 0.03;
mainGroup.add(ringParticles);

const glowGeometry = new THREE.SphereGeometry(3.18, 64, 64);
const glowMaterial = new THREE.MeshBasicMaterial({
  color: "#ffb7f5",
  transparent: true,
  opacity: 0.07,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});
const sphereGlow = new THREE.Mesh(glowGeometry, glowMaterial);
mainGroup.add(sphereGlow);

const bgGeometry = makeGeometry(bgCount);
const bgColors = [
  new THREE.Color("#ffffff"),
  new THREE.Color("#ff9df2"),
  new THREE.Color("#a78bfa"),
  new THREE.Color("#93c5fd"),
  new THREE.Color("#fef3c7")
];

for (let i = 0; i < bgCount; i++) {
  const distance = 35 + Math.random() * 90;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const x = distance * Math.sin(phi) * Math.cos(theta);
  const y = distance * Math.cos(phi);
  const z = distance * Math.sin(phi) * Math.sin(theta);
  const color = randomColor(bgColors);
  const size = Math.random() * 2.15 + 0.9;
  const twinkle = Math.random() * 4.0 + 2.0;
  setParticle(bgGeometry, i, x, y, z, color, size, twinkle);
}

const backgroundStars = new THREE.Points(bgGeometry, bgMaterial);
scene.add(backgroundStars);

let isDragging = false;
let previousX = 0;
let previousY = 0;
let targetRotationX = -0.12;
let targetRotationY = 0.25;
let currentRotationX = targetRotationX;
let currentRotationY = targetRotationY;
let autoRotate = true;

function onPointerDown(event) {
  if (explosionActive) return;
  isDragging = true;
  autoRotate = false;
  previousX = event.clientX;
  previousY = event.clientY;
}

function onPointerMove(event) {
  if (!isDragging || explosionActive) return;
  const deltaX = event.clientX - previousX;
  const deltaY = event.clientY - previousY;
  targetRotationY += deltaX * 0.006;
  targetRotationX += deltaY * 0.004;
  targetRotationX = Math.max(-0.9, Math.min(0.9, targetRotationX));
  previousX = event.clientX;
  previousY = event.clientY;
}

function onPointerUp() {
  isDragging = false;
  setTimeout(() => {
    if (!explosionActive) autoRotate = true;
  }, 1500);
}

canvas.addEventListener("pointerdown", onPointerDown);
canvas.addEventListener("pointermove", onPointerMove);
window.addEventListener("pointerup", onPointerUp);
window.addEventListener("pointercancel", onPointerUp);

exploreBtn.addEventListener("click", () => {
  if (explosionActive) return;
  startLoveMusicIfPossible();
  explosionActive = true;
  explosionStart = clock.getElapsedTime();
  autoRotate = false;
  exploreBtn.disabled = true;
  exploreBtn.querySelector("span").textContent = "Đang mở ra...";
  introContent.classList.add("hide");
  dragHint.classList.add("hide");

  setTimeout(() => transitionText.classList.add("show"), 700);
  setTimeout(() => {
    goLovePage("story");
  }, 3300);
});

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}

function animate() {
  const elapsedTime = clock.getElapsedTime();
  particleMaterial.uniforms.uTime.value = elapsedTime;
  bgMaterial.uniforms.uTime.value = elapsedTime;

  if (autoRotate) targetRotationY += 0.0012;

  currentRotationX += (targetRotationX - currentRotationX) * 0.08;
  currentRotationY += (targetRotationY - currentRotationY) * 0.08;

  mainGroup.rotation.x = currentRotationX;
  mainGroup.rotation.y = currentRotationY;

  sphereParticles.rotation.y += 0.0009;
  ringParticles.rotation.y -= 0.00045;
  sphereGlow.scale.setScalar(1 + Math.sin(elapsedTime * 1.3) * 0.025);

  backgroundStars.rotation.y += 0.00015;
  backgroundStars.rotation.x += 0.00006;

  if (explosionActive) {
    const t = Math.min((elapsedTime - explosionStart) / 2.6, 1);
    const e = easeOutCubic(t);
    const scale = 1 + e * 6.6;
    mainGroup.scale.setScalar(scale);
    backgroundStars.scale.setScalar(1 + e * 2.2);
    camera.position.z = 16 - e * 7.5;
    particleMaterial.uniforms.uOpacity.value = Math.max(0, 1 - t * 0.85);
    bgMaterial.uniforms.uOpacity.value = Math.max(0, 1 - t * 0.72);
    glowMaterial.opacity = Math.max(0, 0.07 + e * 0.25 - t * 0.35);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  particleMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
  bgMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
});
