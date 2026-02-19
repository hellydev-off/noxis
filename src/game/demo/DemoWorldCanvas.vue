<template>
  <canvas
    ref="canvasEl"
    class="c"
    aria-label="Game world"
    tabindex="0"
    @keydown.prevent="onKeyDown"
    @keyup.prevent="onKeyUp"
    @blur="onBlur"
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
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import { demoSettings } from "@/game/demo/demoSettings";
import { io } from "socket.io-client";

const emit = defineEmits([
  "update:mass",
  "update:radarPings",
  "update:leaderboard",
  "died",
  "update:bonus-counts", // новое событие для передачи количества бонусов
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

// ========== ЭКСПОРТИРУЕМЫЕ МЕТОДЫ ==========
function splitDash() {
  if (!state.alive) return;
  socket?.emit("action", { type: "split" });
}
function eject() {
  if (!state.alive) return;
  socket?.emit("action", { type: "eject" });
}
function activateShield() {
  if (!state.alive) return;
  socket?.emit("action", { type: "shield" });
}
function activateTurbo() {
  if (!state.alive) return;
  socket?.emit("action", { type: "turbo" });
}
function activateSpike() {
  if (!state.alive) return;
  socket?.emit("action", { type: "spike" });
}
function activateFreeze() {
  if (!state.alive) return;
  socket?.emit("action", { type: "freeze" });
}
function respawn() {
  if (socket && !state.alive) {
    socket.emit("respawn");
    state.alive = true;
  }
}
function focusCanvas() {
  canvasEl.value?.focus();
}
// ===========================================

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

const isMobile = ref(window.matchMedia("(max-width: 768px)").matches);
function checkMobile() {
  isMobile.value = window.matchMedia("(max-width: 768px)").matches;
}
window.addEventListener("resize", checkMobile);
onBeforeUnmount(() => window.removeEventListener("resize", checkMobile));

const keys = reactive({
  w: false,
  a: false,
  s: false,
  d: false,
});

const joystick = ref({
  active: false,
  angle: 0,
  force: 0,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
});

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

// --- Состояние игры ---
const state = reactive({
  alive: true,
  cam: { x: 0, y: 0, zoom: 0.85 },
  pellets: [],
  allCells: [],
  fx: [],
  spikes: [],
  lastMass: 0,
  time: 0,
  pendingEatIds: new Map(),
  rejectedEatIds: new Map(),
  // Количества бонусов (приходят с сервера)
  bonusCounts: {
    spike: 3,
    freeze: 2,
  },
});

const myCells = computed(() =>
  state.allCells.filter((c) => c.ownerId === socket?.id),
);
const enemyCells = computed(() =>
  state.allCells.filter((c) => c.ownerId !== socket?.id),
);

const totalPlayerMass = computed(() =>
  myCells.value.reduce((sum, cell) => sum + cell.mass, 0),
);

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

function desiredZoom(massList, speed) {
  const maxMass = Math.max(...massList, 50);
  const massFactor = Math.pow(maxMass / 5000, 0.3);
  const baseZoom = 1.2 / (1 + massFactor * 0.6);
  const speedZoom = 1 / (1 + speed / 2500);
  return clamp(baseZoom * speedZoom, 0.15, 1.2);
}

function setupSocket() {
  const token = localStorage.getItem("user_id");
  socket = io("https://noxis-server-xmbj.onrender.com", { auth: { token } });

  socket.on("connect", () => {
    console.log("Connected as:", socket.id);
    const skinUrl = demoSettings.equipment.skin;
    socket.emit("join-game", { skinUrl });
    if (skinUrl) {
      loadImage(skinUrl).catch((err) =>
        console.warn("Failed to load skin", err),
      );
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

    // Инициализация бонусов (позже от сервера)
    if (data.bonusCounts) {
      state.bonusCounts = data.bonusCounts;
      emit("update:bonus-counts", state.bonusCounts);
    }
  });

  socket.on("world_update", (data) => {
    const now = performance.now() / 1000;
    // Обновление пеллет
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

    // Обновление клеток
    const serverCells = data.cells;
    const serverCellMap = new Map(serverCells.map((c) => [c.id, c]));

    for (let i = state.allCells.length - 1; i >= 0; i--) {
      const localCell = state.allCells[i];
      if (!serverCellMap.has(localCell.id)) {
        state.allCells.splice(i, 1);
      }
    }

    for (const sc of serverCells) {
      const local = state.allCells.find((c) => c.id === sc.id);
      if (local) {
        local.tx = sc.x;
        local.ty = sc.y;
        local.mass = sc.mass;
        local.angle = sc.angle;
        local.shieldUntil = sc.shieldUntil;
        local.turboUntil = sc.turboUntil;
        local.frozenUntil = sc.frozenUntil;
        if (sc.skinUrl && sc.skinUrl !== local.skinUrl) {
          local.skinUrl = sc.skinUrl;
          loadImage(sc.skinUrl).catch(() => {});
        }
      } else {
        const newCell = {
          id: sc.id,
          ownerId: sc.ownerId,
          username: sc.username,
          x: sc.x,
          y: sc.y,
          tx: sc.x,
          ty: sc.y,
          mass: sc.mass,
          angle: sc.angle,
          shieldUntil: sc.shieldUntil,
          turboUntil: sc.turboUntil,
          frozenUntil: sc.frozenUntil,
          skinUrl: sc.skinUrl,
          vx: 0,
          vy: 0,
          pulse: 0,
        };
        state.allCells.push(newCell);
        if (sc.skinUrl) {
          loadImage(sc.skinUrl).catch(() => {});
        }
      }
    }

    // Обновление снарядов
    state.spikes = data.spikes || [];

    // Обновление количества бонусов (если пришло)
    if (data.bonusCounts) {
      state.bonusCounts = data.bonusCounts;
      emit("update:bonus-counts", state.bonusCounts);
    }

    if (myCells.value.length === 0 && state.alive) {
      state.alive = false;
      emit("died", { reason: "eaten" });
    }
  });

  socket.on("cell-destroyed", (data) => {
    const index = state.allCells.findIndex((c) => c.id === data.cellId);
    if (index !== -1) {
      state.allCells.splice(index, 1);
    }
  });

  socket.on("game-over", (data) => {
    state.alive = false;
    emit("died", data);
  });

  socket.on("spike-hit", (data) => {
    state.fx.push({ x: data.x, y: data.y, t: 0, type: "spike" });
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

// === ОБНОВЛЕНИЕ ===
function applyAttraction(dt) {
  const cells = state.allCells.map((c) => ({
    type: c.ownerId === socket?.id ? "player" : "enemy",
    x: c.x,
    y: c.y,
    mass: c.mass,
    id: c.id,
  }));

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

  if (!socket || !state.alive) return;

  let targetAngle = 0;
  let targetFactor = 0;

  if (isMobile.value) {
    if (joystick.value.active && joystick.value.force > 0.01) {
      targetAngle = joystick.value.angle;
      targetFactor = joystick.value.force;
    }
  } else {
    const dx = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
    const dy = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);
    const length = Math.hypot(dx, dy);
    if (length > 0.01) {
      targetAngle = Math.atan2(dy, dx);
      targetFactor = 1;
    }
  }

  socket.emit("move", { angle: targetAngle, factor: targetFactor });

  for (const cell of myCells.value) {
    if (cell.tx !== undefined) {
      const speed = 8;
      cell.x = lerp(cell.x, cell.tx, Math.min(1, speed * dt));
      cell.y = lerp(cell.y, cell.ty, Math.min(1, speed * dt));
    }
    cell.pulse *= 1 - dt * 8;
    if (cell.pulse < 0.01) cell.pulse = 0;
  }

  for (const cell of enemyCells.value) {
    if (cell.tx !== undefined) {
      const speed = 6;
      cell.x = lerp(cell.x, cell.tx, Math.min(1, speed * dt));
      cell.y = lerp(cell.y, cell.ty, Math.min(1, speed * dt));
    }
  }

  applyAttraction(dt);

  const now = performance.now() / 1000;
  for (let i = state.pellets.length - 1; i >= 0; i--) {
    const p = state.pellets[i];

    if (!p.id.startsWith("local-") && state.rejectedEatIds.has(p.id)) {
      const until = state.rejectedEatIds.get(p.id);
      if (now < until) continue;
      else state.rejectedEatIds.delete(p.id);
    }

    for (const cell of myCells.value) {
      const cellR = massToRadius(cell.mass, cell.pulse);
      const pelletR = pelletRadius(p.v);
      const dist = Math.hypot(cell.x - p.x, cell.y - p.y);
      if (dist < cellR + pelletR) {
        if (p.id.startsWith("local-")) {
          state.pellets.splice(i, 1);
          cell.mass += p.v;
          cell.pulse = 0.5;
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
          break;
        } else {
          socket.emit(
            "eat-pellet",
            {
              pelletId: p.id,
              playerX: cell.x,
              playerY: cell.y,
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
          cell.pulse = 0.5;
          state.fx.push({ x: p.x, y: p.y, t: 0 });
          break;
        }
      }
    }
  }

  for (const [id, time] of state.pendingEatIds) {
    if (now - time > 1.0) state.pendingEatIds.delete(id);
  }
  for (const [id, until] of state.rejectedEatIds) {
    if (now > until) state.rejectedEatIds.delete(id);
  }

  if (myCells.value.length > 0) {
    const avgX =
      myCells.value.reduce((sum, c) => sum + c.x, 0) / myCells.value.length;
    const avgY =
      myCells.value.reduce((sum, c) => sum + c.y, 0) / myCells.value.length;
    const masses = myCells.value.map((c) => c.mass);
    const avgSpeed =
      myCells.value.reduce((sum, c) => {
        const vx = c.vx || 0;
        const vy = c.vy || 0;
        return sum + Math.hypot(vx, vy);
      }, 0) / myCells.value.length;

    const targetZoom = desiredZoom(masses, avgSpeed);
    state.cam.zoom = lerp(state.cam.zoom, targetZoom, dt * 8);
    state.cam.x = lerp(state.cam.x, avgX, dt * 8);
    state.cam.y = lerp(state.cam.y, avgY, dt * 8);
  }

  for (let i = state.fx.length - 1; i >= 0; i--) {
    const f = state.fx[i];
    f.t += dt;
    if (f.t > 0.6) state.fx.splice(i, 1);
  }

  state.lastMass = totalPlayerMass.value;
  emit("update:mass", Math.floor(state.lastMass));

  leaderboardAcc += dt;
  if (leaderboardAcc >= 0.5) {
    updateLeaderboard();
    leaderboardAcc = 0;
  }

  updateRadar();
}

function updateLeaderboard() {
  const list = [
    { name: "YOU", value: state.lastMass, isYou: true },
    ...enemyCells.value.map((e) => ({
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

function updateRadar() {
  if (myCells.value.length === 0) return;
  const mainCell = myCells.value[0];
  const range = 5000;
  const radarPings = enemyCells.value.map((e) => ({
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

  // Снаряды (шипы)
  ctx.shadowColor = "#ff0000";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "#ff4444";
  for (const spike of state.spikes) {
    ctx.beginPath();
    ctx.arc(spike.x, spike.y, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Враги
  const now = Date.now();
  for (const e of enemyCells.value) {
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

    if (e.frozenUntil && e.frozenUntil > now) {
      ctx.beginPath();
      ctx.arc(e.x, e.y, r + 6, 0, Math.PI * 2);
      ctx.strokeStyle = "#00aaff";
      ctx.lineWidth = 4;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (e.shieldUntil && e.shieldUntil > now) {
      ctx.beginPath();
      ctx.arc(e.x, e.y, r + 5, 0, Math.PI * 2);
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    if (e.turboUntil && e.turboUntil > now) {
      ctx.beginPath();
      ctx.arc(e.x, e.y, r + 2, 0, Math.PI * 2);
      ctx.strokeStyle = "#ffaa00";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Свои клетки
  for (const cell of myCells.value) {
    const r = massToRadius(cell.mass, cell.pulse);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cell.x, cell.y, r, 0, Math.PI * 2);
    ctx.clip();

    if (cell.skinUrl && imageCache.has(cell.skinUrl)) {
      const img = imageCache.get(cell.skinUrl);
      ctx.drawImage(img, cell.x - r, cell.y - r, r * 2, r * 2);
    } else {
      const grd = ctx.createRadialGradient(
        cell.x,
        cell.y,
        r * 0.2,
        cell.x,
        cell.y,
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

    const now = Date.now();
    if (cell.shieldUntil && cell.shieldUntil > now) {
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, r + 5, 0, Math.PI * 2);
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    if (cell.turboUntil && cell.turboUntil > now) {
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, r + 2, 0, Math.PI * 2);
      ctx.strokeStyle = "#ffaa00";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  // Эффекты
  for (const f of state.fx) {
    const alpha = 1 - f.t / 0.6;
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.arc(f.x, f.y, 20 * (1 + f.t), 0, Math.PI * 2);
    ctx.fill();
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

// === ОБРАБОТЧИКИ КЛАВИАТУРЫ ===
function onKeyDown(e) {
  if (isMobile.value) return;
  const key = e.key.toLowerCase();
  if (key === "w" || key === "a" || key === "s" || key === "d") {
    keys[key] = true;
  }
}

function onKeyUp(e) {
  if (isMobile.value) return;
  const key = e.key.toLowerCase();
  if (key === "w" || key === "a" || key === "s" || key === "d") {
    keys[key] = false;
  }
}

function onBlur() {
  keys.w = false;
  keys.a = false;
  keys.s = false;
  keys.d = false;
}

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
  const maxDist = 50;
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

watch(isMobile, (newVal) => {
  if (newVal) {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);
  } else {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
  }
});

onMounted(() => {
  resize();
  setupSocket();
  window.addEventListener("resize", resize);
  canvasEl.value?.focus();
  if (!isMobile.value) {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
  }
  lastT = performance.now();
  raf = requestAnimationFrame(tick);
});

onBeforeUnmount(() => {
  if (socket) socket.disconnect();
  window.removeEventListener("resize", resize);
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
  window.removeEventListener("blur", onBlur);
  cancelAnimationFrame(raf);
});

defineExpose({
  splitDash,
  eject,
  activateShield,
  activateTurbo,
  activateSpike,
  activateFreeze,
  respawn,
  focusCanvas,
});
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
  outline: none;
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
