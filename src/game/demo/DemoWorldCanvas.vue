<template>
  <canvas
    ref="canvasEl"
    class="c"
    aria-label="Game world"
    @pointermove="onPointerMove"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointerleave="onPointerUp"
  />
  <div
    v-if="isMobile"
    class="joystick-container"
    ref="joystickEl"
    @touchstart.prevent="onJoystickStart"
    @touchmove.prevent="onJoystickMove"
    @touchend.prevent="onJoystickEnd"
    @touchcancel.prevent="onJoystickEnd"
  >
    <div class="joystick-base">
      <div
        class="joystick-thumb"
        :style="{
          transform: `translate(${joystick.currentX}px, ${joystick.currentY}px)`,
        }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { demoSettings } from "@/game/demo/demoSettings";
import { io } from "socket.io-client";

const emit = defineEmits([
  "update:mass",
  "update:radarPings",
  "update:leaderboard",
  "died",
]);

const canvasEl = ref(null);
const joystickEl = ref(null);
let socket = null;

let raf = 0;
let lastT = 0;
let ctx = null;
let dpr = 1;
let w = 0;
let h = 0;
let leaderboardAcc = 0;

// === КОНСТАНТЫ ===
const MAP_R = 5000;
const ATTRACTION_RADIUS = 400;
const ATTRACTION_FORCE_PLAYER = 0.12;
const ATTRACTION_FORCE_ENEMY = 0.06;
const PELLET_BASE_COUNT = 800;

const PELLET_COLORS = [
  "#f0f",
  "#ff0",
  "#0ff",
  "#0f0",
  "#f00",
  "#ffa500",
  "#ff69b4",
  "#00ced1",
  "#ff4500",
  "#da70d6",
  "#7b68ee",
  "#48d1cc",
  "#ff1493",
  "#ffd700",
];

// --- Определение мобильного устройства ---
const isMobile = ref(window.matchMedia("(max-width: 768px)").matches);

function checkMobile() {
  isMobile.value = window.matchMedia("(max-width: 768px)").matches;
}
window.addEventListener("resize", checkMobile);
onBeforeUnmount(() => window.removeEventListener("resize", checkMobile));

// --- Состояние джойстика ---
const joystick = ref({
  active: false,
  angle: 0,
  force: 0,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
});

// --- Кеш изображений и функция загрузки ---
const imageCache = new Map();

function loadImage(url) {
  if (!url) return Promise.reject("No URL");
  if (imageCache.has(url)) {
    return Promise.resolve(imageCache.get(url));
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

const state = {
  alive: true,
  pointerDown: false,
  pointer: { x: 0, y: 0 },
  cam: { x: 0, y: 0, zoom: 0.85 },
  pellets: [],
  enemies: [],
  fx: [],
  lastMass: 0,
  cells: [
    {
      id: null,
      x: 0,
      y: 0,
      tx: 0,
      ty: 0,
      mass: 50,
      targetMass: 50,
      vx: 0,
      vy: 0,
      angle: 0,
      pulse: 0,
      tone: "purple",
      shield: 0,
      turbo: 0,
      skinUrl: null,
    },
  ],
  pendingEatIds: new Map(),
  rejectedEatIds: new Map(),
  time: 0,
};

const MASS_THRESHOLD = 1000;
const SPEED_AT_THRESHOLD = 700;

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}

function massToRadius(m, pulse = 0) {
  if (m < 0) return 0;
  const base = clamp(Math.sqrt(m) * 1.8, 14, 450);
  return base * (1 + pulse * 0.3);
}

function pelletRadius(mass) {
  return clamp(Math.sqrt(mass) * 2.5, 4, 18);
}

function desiredZoom(m, speed) {
  const massFactor = Math.pow(m / 5000, 0.3);
  const baseZoom = 1.2 / (1 + massFactor * 0.6);
  const speedZoom = 1 / (1 + speed / 2500);
  return clamp(baseZoom * speedZoom, 0.15, 1.2);
}

// === СЕТЕВАЯ ЛОГИКА ===
function setupSocket() {
  const token = localStorage.getItem("token");
  socket = io("https://noxis-server-xmbj.onrender.com", { auth: { token } });

  socket.on("connect", () => {
    console.log("Connected as:", socket.id);
    socket.emit("join-game");

    // Устанавливаем скин игрока из demoSettings
    const main = state.cells[0];
    const skinUrl = demoSettings.equipment.skin;
    if (skinUrl && skinUrl !== main.skinUrl) {
      main.skinUrl = skinUrl;
      loadImage(skinUrl).catch((err) =>
        console.warn("Failed to load skin", err),
      );
      // При необходимости отправить на сервер: socket.emit("set-skin", { skinUrl });
    }
  });

  socket.on("init-world", (data) => {
    let pelletsFromServer = data.pellets.map((p) => ({
      ...p,
      tx: p.x,
      ty: p.y,
    }));
    if (pelletsFromServer.length < PELLET_BASE_COUNT) {
      const additional = PELLET_BASE_COUNT - pelletsFromServer.length;
      for (let i = 0; i < additional; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * MAP_R * 0.9;
        pelletsFromServer.push({
          id: `local-${i}-${Date.now()}`,
          x: Math.cos(angle) * r,
          y: Math.sin(angle) * r,
          tx: Math.cos(angle) * r,
          ty: Math.sin(angle) * r,
          v: Math.floor(Math.random() * 30) + 5,
          local: true,
        });
      }
    }
    state.pellets = pelletsFromServer;
    state.alive = true;
  });

  socket.on("world_update", (data) => {
    const now = performance.now() / 1000;
    const serverPellets = data.pellets.filter(
      (p) => !p.id.startsWith("local-"),
    );
    const serverPelletMap = new Map(serverPellets.map((p) => [p.id, p]));

    for (let i = 0; i < state.pellets.length; i++) {
      const p = state.pellets[i];
      if (p.id.startsWith("local-")) continue;
      const sp = serverPelletMap.get(p.id);
      if (sp) {
        p.tx = sp.x;
        p.ty = sp.y;
        p.v = sp.v;
        serverPelletMap.delete(p.id);
      } else {
        state.pellets.splice(i, 1);
        i--;
      }
    }

    for (const sp of serverPelletMap.values()) {
      if (!state.pendingEatIds.has(sp.id) && !state.rejectedEatIds.has(sp.id)) {
        state.pellets.push({
          id: sp.id,
          x: sp.x,
          y: sp.y,
          tx: sp.x,
          ty: sp.y,
          v: sp.v,
        });
      }
    }

    const serverPlayers = data.players;
    const me = serverPlayers.find((p) => p.id === socket.id);
    if (me && state.alive) {
      const main = state.cells[0];
      main.tx = me.x;
      main.ty = me.y;
      if (Math.abs(me.mass - main.targetMass) > 50) {
        main.targetMass = me.mass;
      }
      main.id = me.id;
      main.shield = me.shield || 0;
      // Скин с сервера не принимаем, используем локальный
    }

    const enemyMap = new Map(state.enemies.map((e) => [e.id, e]));
    for (const p of serverPlayers) {
      if (p.id === socket.id) continue;
      if (enemyMap.has(p.id)) {
        const e = enemyMap.get(p.id);
        e.tx = p.x;
        e.ty = p.y;
        e.mass = p.mass;
        if (p.skinUrl && p.skinUrl !== e.skinUrl) {
          e.skinUrl = p.skinUrl;
          loadImage(p.skinUrl).catch((err) =>
            console.warn("Failed to load enemy skin", err),
          );
        }
      } else {
        state.enemies.push({
          id: p.id,
          x: p.x,
          y: p.y,
          tx: p.x,
          ty: p.y,
          mass: p.mass,
          skinUrl: p.skinUrl,
        });
        if (p.skinUrl) {
          loadImage(p.skinUrl).catch((err) =>
            console.warn("Failed to load enemy skin", err),
          );
        }
      }
    }
    state.enemies = state.enemies.filter((e) =>
      serverPlayers.some((p) => p.id === e.id),
    );
  });

  socket.on("game-over", (data) => {
    state.alive = false;
    emit("died", data);
  });

  socket.on("connect_error", (err) => {
    console.error("Auth Error:", err.message);
  });
}

// === КООРДИНАТЫ ===
function resize() {
  const c = canvasEl.value;
  if (!c) return;
  const rect = c.getBoundingClientRect();
  dpr = Math.min(2, window.devicePixelRatio || 1);
  w = Math.max(1, Math.floor(rect.width));
  h = Math.max(1, Math.floor(rect.height));
  c.width = Math.floor(w * dpr);
  c.height = Math.floor(h * dpr);
  ctx = c.getContext("2d", { alpha: true });
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function screenToWorld(sx, sy) {
  const { cam } = state;
  const cx = w * 0.5;
  const cy = h * 0.5;
  return {
    x: (sx - cx) / cam.zoom + cam.x,
    y: (sy - cy) / cam.zoom + cam.y,
  };
}

function onPointerMove(e) {
  if (!state.alive) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const p = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
  state.pointer.x = p.x;
  state.pointer.y = p.y;
}

function onPointerDown(e) {
  if (!state.alive) return;
  state.pointerDown = true;
  onPointerMove(e);
}
function onPointerUp() {
  state.pointerDown = false;
}

// === ОБНОВЛЕНИЕ ===
function segmentIntersectsCircle(x1, y1, x2, y2, cx, cy, r) {
  const d1 = Math.hypot(x1 - cx, y1 - cy);
  const d2 = Math.hypot(x2 - cx, y2 - cy);
  if (d1 <= r || d2 <= r) return true;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len === 0) return false;
  const dot = ((cx - x1) * dx + (cy - y1) * dy) / (len * len);
  const t = Math.max(0, Math.min(1, dot));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(projX - cx, projY - cy) <= r;
}

function applyAttraction(dt) {
  const main = state.cells[0];
  if (!main || !state.alive) return;

  const cells = [
    { type: "player", x: main.x, y: main.y, mass: main.mass, id: main.id },
    ...state.enemies.map((e) => ({
      type: "enemy",
      x: e.x,
      y: e.y,
      mass: e.mass,
      id: e.id,
    })),
  ];

  for (const p of state.pellets) {
    let closest = null;
    let minDist = Infinity;
    for (const cell of cells) {
      const dx = cell.x - p.x;
      const dy = cell.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < minDist && dist < ATTRACTION_RADIUS) {
        minDist = dist;
        closest = cell;
      }
    }

    if (closest) {
      const forceMultiplier =
        closest.type === "player"
          ? ATTRACTION_FORCE_PLAYER
          : ATTRACTION_FORCE_ENEMY;
      const angle = Math.atan2(closest.y - p.y, closest.x - p.x);
      const force =
        forceMultiplier * (1 - minDist / ATTRACTION_RADIUS) * dt * 40;
      p.x += Math.cos(angle) * force;
      p.y += Math.sin(angle) * force;

      if (!p.id.startsWith("local-")) {
        const maxOffset = 150;
        const dx = p.x - p.tx;
        const dy = p.y - p.ty;
        const offset = Math.hypot(dx, dy);
        if (offset > maxOffset) {
          p.x = p.tx + (dx / offset) * maxOffset;
          p.y = p.ty + (dy / offset) * maxOffset;
        }
      }
    } else {
      if (!p.id.startsWith("local-")) {
        p.x = lerp(p.x, p.tx, 0.02);
        p.y = lerp(p.y, p.ty, 0.02);
      }
    }
  }
}

function update(dt) {
  state.time += dt;

  const main = state.cells[0];
  if (!main || !socket || !state.alive) return;

  const oldX = main.x;
  const oldY = main.y;

  // === УПРАВЛЕНИЕ: джойстик или мышь ===
  let targetAngle;
  let desiredSpeed;

  if (joystick.value.active && joystick.value.force > 0.01) {
    // Управление джойстиком
    targetAngle = joystick.value.angle;
    const baseSpeed =
      main.mass <= MASS_THRESHOLD
        ? SPEED_AT_THRESHOLD
        : SPEED_AT_THRESHOLD * Math.sqrt(MASS_THRESHOLD / main.mass);
    desiredSpeed = baseSpeed * joystick.value.force;
  } else {
    // Управление мышью / касанием (работает как раньше)
    targetAngle = Math.atan2(
      state.pointer.y - main.y,
      state.pointer.x - main.x,
    );
    if (main.mass <= MASS_THRESHOLD) {
      desiredSpeed = SPEED_AT_THRESHOLD;
    } else {
      desiredSpeed = SPEED_AT_THRESHOLD * Math.sqrt(MASS_THRESHOLD / main.mass);
    }
  }

  // Плавный поворот к целевому углу
  let angleDiff = targetAngle - main.angle;
  while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
  while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
  const turnSpeed = 8.0;
  const maxTurn = turnSpeed * dt;
  if (Math.abs(angleDiff) > maxTurn) {
    main.angle += Math.sign(angleDiff) * maxTurn;
  } else {
    main.angle = targetAngle;
  }

  const desiredVx = Math.cos(main.angle) * desiredSpeed;
  const desiredVy = Math.sin(main.angle) * desiredSpeed;

  const inertia = 0.15;
  main.vx = lerp(main.vx, desiredVx, inertia);
  main.vy = lerp(main.vy, desiredVy, inertia);

  let newX = main.x + main.vx * dt;
  let newY = main.y + main.vy * dt;

  const playerRadius = massToRadius(main.mass, main.pulse);
  const distFromOrigin = Math.hypot(newX, newY);
  if (distFromOrigin + playerRadius > MAP_R) {
    const angleToOrigin = Math.atan2(newY, newX);
    newX = Math.cos(angleToOrigin) * (MAP_R - playerRadius);
    newY = Math.sin(angleToOrigin) * (MAP_R - playerRadius);
    const radialSpeed =
      main.vx * Math.cos(angleToOrigin) + main.vy * Math.sin(angleToOrigin);
    if (radialSpeed > 0) {
      main.vx -= radialSpeed * Math.cos(angleToOrigin);
      main.vy -= radialSpeed * Math.sin(angleToOrigin);
    }
  }
  main.x = newX;
  main.y = newY;

  socket.emit("move", { angle: main.angle });

  if (main.targetMass !== main.mass) {
    const diff = main.targetMass - main.mass;
    const change = diff * 5 * dt;
    if (Math.abs(change) < 0.1 && Math.abs(diff) < 1) {
      main.mass = main.targetMass;
    } else {
      main.mass += change;
    }
  }

  main.pulse *= 1 - dt * 8;
  if (main.pulse < 0.01) main.pulse = 0;

  applyAttraction(dt);

  const now = performance.now() / 1000;
  for (let i = state.pellets.length - 1; i >= 0; i--) {
    const p = state.pellets[i];

    if (!p.id.startsWith("local-") && state.rejectedEatIds.has(p.id)) {
      const until = state.rejectedEatIds.get(p.id);
      if (now < until) continue;
      else state.rejectedEatIds.delete(p.id);
    }

    const pelletR = pelletRadius(p.v);
    const collision = segmentIntersectsCircle(
      oldX,
      oldY,
      main.x,
      main.y,
      p.x,
      p.y,
      playerRadius + pelletR,
    );

    if (collision) {
      if (p.id.startsWith("local-")) {
        state.pellets.splice(i, 1);
        main.targetMass += p.v;
        main.pulse = 0.5;
        state.fx.push({ x: p.x, y: p.y, t: 0 });
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * MAP_R * 0.9;
        state.pellets.push({
          id: `local-${Date.now()}-${Math.random()}`,
          x: Math.cos(angle) * r,
          y: Math.sin(angle) * r,
          tx: Math.cos(angle) * r,
          ty: Math.sin(angle) * r,
          v: Math.floor(Math.random() * 30) + 5,
          local: true,
        });
        continue;
      }

      socket.emit(
        "eat-pellet",
        {
          pelletId: p.id,
          playerX: main.x,
          playerY: main.y,
          pelletX: p.x,
          pelletY: p.y,
        },
        (response) => {
          if (response?.success) {
            state.pendingEatIds.delete(p.id);
          } else {
            state.rejectedEatIds.set(p.id, now + 1);
            state.pendingEatIds.delete(p.id);
          }
        },
      );

      state.pendingEatIds.set(p.id, now);
      state.pellets.splice(i, 1);
      main.targetMass += p.v;
      main.pulse = 0.5;
      state.fx.push({ x: p.x, y: p.y, t: 0 });
    }
  }

  for (let i = state.pellets.length - 1; i >= 0; i--) {
    const p = state.pellets[i];
    for (const e of state.enemies) {
      const enemyR = massToRadius(e.mass);
      const pelletR = pelletRadius(p.v);
      const dist = Math.hypot(e.x - p.x, e.y - p.y);
      if (dist < enemyR + pelletR) {
        if (!p.id.startsWith("local-")) {
          state.rejectedEatIds.set(p.id, now + 2);
        }
        state.pellets.splice(i, 1);
        break;
      }
    }
  }

  for (const [id, time] of state.pendingEatIds) {
    if (now - time > 1.0) state.pendingEatIds.delete(id);
  }
  for (const [id, until] of state.rejectedEatIds) {
    if (now > until) state.rejectedEatIds.delete(id);
  }

  if (main.tx !== undefined && main.ty !== undefined) {
    let targetX = main.tx;
    let targetY = main.ty;
    const targetDist = Math.hypot(targetX, targetY);
    if (targetDist + playerRadius > MAP_R) {
      const angle = Math.atan2(targetY, targetX);
      targetX = Math.cos(angle) * (MAP_R - playerRadius);
      targetY = Math.sin(angle) * (MAP_R - playerRadius);
    }

    const errorX = targetX - main.x;
    const errorY = targetY - main.y;

    const isMoving = Math.hypot(desiredVx, desiredVy) > 10;
    const correctionFactor = isMoving ? 3 : 15;
    let correctionX = errorX * correctionFactor * dt;
    let correctionY = errorY * correctionFactor * dt;

    const maxCorrection = 1.5 * desiredSpeed * dt;
    const correctionDist = Math.hypot(correctionX, correctionY);
    if (correctionDist > maxCorrection) {
      correctionX *= maxCorrection / correctionDist;
      correctionY *= maxCorrection / correctionDist;
    }

    main.x += correctionX;
    main.y += correctionY;
  }

  const enemyLerp = Math.min(20, 2 / dt);
  for (const e of state.enemies) {
    if (e.tx !== undefined) {
      e.x = lerp(e.x, e.tx, enemyLerp * dt);
      e.y = lerp(e.y, e.ty, enemyLerp * dt);
    }
  }

  const targetZoom = desiredZoom(main.mass, Math.hypot(main.vx, main.vy));
  const zoomDiff = targetZoom - state.cam.zoom;
  state.cam.zoom += zoomDiff * Math.min(1, dt * 8);
  state.cam.x = lerp(state.cam.x, main.x, dt * 8);
  state.cam.y = lerp(state.cam.y, main.y, dt * 8);

  updateFx(dt);
  state.lastMass = Math.floor(main.mass);
  emit("update:mass", state.lastMass);

  leaderboardAcc += dt;
  if (leaderboardAcc >= 0.5) {
    updateLeaderboard();
    leaderboardAcc = 0;
  }

  updateRadar(main);
}

function updateLeaderboard() {
  const list = [
    { name: "YOU", value: state.lastMass, isYou: true },
    ...state.enemies.map((e) => ({
      name: e.username || "Enemy",
      value: Math.floor(e.mass),
      isYou: false,
    })),
  ];
  list.sort((a, b) => b.value - a.value);
  emit(
    "update:leaderboard",
    list.slice(0, 10).map((item, i) => ({ rank: i + 1, ...item })),
  );
}

function updateRadar(mainCell) {
  const range = 5000;
  const radarPings = state.enemies.map((e) => ({
    x: clamp(0.5 + ((e.x - mainCell.x) / range) * 0.5, 0, 1),
    y: clamp(0.5 + ((e.y - mainCell.y) / range) * 0.5, 0, 1),
    tone: e.mass > mainCell.mass ? "danger" : "cyan",
    a: clamp(
      1 - Math.hypot(e.x - mainCell.x, e.y - mainCell.y) / range,
      0.2,
      1,
    ),
  }));
  emit("update:radarPings", radarPings);
}

function updateFx(dt) {
  for (let i = state.fx.length - 1; i >= 0; i--) {
    const f = state.fx[i];
    f.t += dt;
    if (f.t > 0.6) state.fx.splice(i, 1);
  }
}

// === ОТРИСОВКА ===
function draw() {
  if (!ctx) return;
  const cam = state.cam;
  ctx.clearRect(0, 0, w, h);

  // Барьер
  ctx.save();
  ctx.translate(w * 0.5, h * 0.5);
  ctx.scale(cam.zoom, cam.zoom);
  ctx.shadowColor = "#ff0000";
  ctx.shadowBlur = 40;
  ctx.beginPath();
  ctx.strokeStyle = "#ff8888";
  ctx.lineWidth = 6;
  ctx.arc(0, 0, MAP_R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.strokeStyle = "#ff3b5c";
  ctx.lineWidth = 8;
  ctx.arc(0, 0, MAP_R, 0, Math.PI * 2);
  ctx.stroke();
  const pulse = Math.sin(state.time * 3) * 0.2 + 0.8;
  ctx.shadowBlur = 30;
  ctx.beginPath();
  ctx.strokeStyle = `rgba(255, 100, 100, ${0.3 + pulse * 0.2})`;
  ctx.lineWidth = 4;
  ctx.arc(0, 0, MAP_R - 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
  ctx.restore();

  // Мир
  ctx.save();
  ctx.translate(w * 0.5, h * 0.5);
  ctx.scale(cam.zoom, cam.zoom);
  ctx.translate(-cam.x, -cam.y);

  // Пеллеты
  for (const p of state.pellets) {
    const r = pelletRadius(p.v);
    const colorIndex = Math.floor(p.v / 4) % PELLET_COLORS.length;
    const baseColor = PELLET_COLORS[colorIndex];
    ctx.shadowColor = baseColor;
    ctx.shadowBlur = 20 * (p.v / 25);
    const pulseScale =
      1 + Math.sin(state.time * 5 + (p.id?.charCodeAt(0) || 0)) * 0.05;
    const currentR = r * pulseScale;
    ctx.beginPath();
    ctx.fillStyle = baseColor;
    ctx.arc(p.x, p.y, currentR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.arc(
      p.x - currentR * 0.2,
      p.y - currentR * 0.2,
      currentR * 0.3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";

  // Враги (со скинами)
  for (const e of state.enemies) {
    const r = massToRadius(e.mass);
    ctx.save();
    ctx.beginPath();
    ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
    ctx.clip();

    if (e.skinUrl && imageCache.has(e.skinUrl)) {
      const img = imageCache.get(e.skinUrl);
      ctx.drawImage(img, e.x - r, e.y - r, r * 2, r * 2);
    } else {
      ctx.fillStyle = "rgba(124, 58, 237, 0.2)";
      ctx.fill();
    }
    ctx.restore();

    ctx.strokeStyle = "#7c3aed";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Игрок (со скином или градиентом)
  if (state.alive) {
    const main = state.cells[0];
    const r = massToRadius(main.mass, main.pulse);

    ctx.save();
    ctx.beginPath();
    ctx.arc(main.x, main.y, r, 0, Math.PI * 2);
    ctx.clip();

    if (main.skinUrl && imageCache.has(main.skinUrl)) {
      const img = imageCache.get(main.skinUrl);
      ctx.drawImage(img, main.x - r, main.y - r, r * 2, r * 2);
    } else {
      // Градиент с фиксированным цветом
      const grd = ctx.createRadialGradient(
        main.x,
        main.y,
        r * 0.2,
        main.x,
        main.y,
        r,
      );
      grd.addColorStop(0, "#00f5ff");
      grd.addColorStop(1, "rgba(0, 245, 255, 0.2)");
      ctx.fillStyle = grd;
      ctx.fill();
    }
    ctx.restore();

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.restore();
}

function tick(t) {
  const dt = Math.min(0.1, (t - lastT) / 1000);
  lastT = t;
  update(dt);
  draw();
  raf = requestAnimationFrame(tick);
}

onMounted(() => {
  resize();
  setupSocket();
  window.addEventListener("resize", resize);
  lastT = performance.now();
  raf = requestAnimationFrame(tick);
});

onBeforeUnmount(() => {
  if (socket) socket.disconnect();
  window.removeEventListener("resize", resize);
  cancelAnimationFrame(raf);
});

// === МЕТОДЫ ДЖОЙСТИКА ===
function onJoystickStart(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = joystickEl.value.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  joystick.value.startX = centerX;
  joystick.value.startY = centerY;
  joystick.value.active = true;
  updateJoystickFromTouch(touch);
}

function onJoystickMove(e) {
  e.preventDefault();
  if (!joystick.value.active) return;
  const touch = e.touches[0];
  updateJoystickFromTouch(touch);
}

function onJoystickEnd(e) {
  e.preventDefault();
  joystick.value.active = false;
  joystick.value.force = 0;
  joystick.value.currentX = 0;
  joystick.value.currentY = 0;
}

function updateJoystickFromTouch(touch) {
  const maxDist = 50; // максимальное смещение джойстика в пикселях
  const dx = touch.clientX - joystick.value.startX;
  const dy = touch.clientY - joystick.value.startY;
  const dist = Math.hypot(dx, dy);
  const limitedDist = Math.min(dist, maxDist);
  const angle = Math.atan2(dy, dx);
  joystick.value.angle = angle;
  joystick.value.force = limitedDist / maxDist;
  joystick.value.currentX = Math.cos(angle) * limitedDist;
  joystick.value.currentY = Math.sin(angle) * limitedDist;
}

// Экспортируемые методы
function splitDash() {
  if (!state.alive) return;
  socket.emit("action", { type: "split" });
}
function eject() {
  if (!state.alive) return;
  socket.emit("action", { type: "eject" });
}
function activateShield() {
  if (!state.alive) return;
  socket.emit("action", { type: "shield" });
}
function activateTurbo() {
  if (!state.alive) return;
  socket.emit("action", { type: "turbo" });
}
function respawn() {
  if (socket && !state.alive) {
    socket.emit("respawn");
    state.alive = true;
  }
}

defineExpose({ splitDash, eject, activateShield, activateTurbo, respawn });
</script>

<style scoped>
.c {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: #09090b;
  touch-action: none;
  cursor: crosshair;
}

.joystick-container {
  position: absolute;
  bottom: 40px;
  left: 40px;
  width: 120px;
  height: 120px;
  z-index: 10;
  touch-action: none;
}

.joystick-base {
  width: 100%;
  height: 100%;
  background: rgba(30, 30, 40, 0.7);
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.joystick-thumb {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  box-shadow: 0 0 15px #00f5ff;
  transition: transform 0.02s;
  will-change: transform;
}
</style>
