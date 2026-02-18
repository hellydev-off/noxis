<template>
  <div class="radar" aria-label="Radar">
    <div class="ring" />
    <div class="cross x" />
    <div class="cross y" />

    <div class="ping player-center" />

    <div
      v-for="(p, idx) in pings"
      :key="idx"
      class="ping"
      :class="`t-${p.tone || 'purple'}`" 
      :style="{
        left: `${p.x * 100}%`,
        top: `${p.y * 100}%`,
        opacity: p.a ?? 0.6,
        transform: `translate(-50%, -50%) scale(${0.8 + (p.a ?? 0.5) * 0.5})`
      }"
    />
  </div>
</template>

<script setup>
defineProps({
  // Ожидаем массив объектов: {x: 0..1, y: 0..1, tone: 'danger', a: 0..1}
  pings: { type: Array, default: () => [] }, 
})
</script>

<style scoped>
.radar {
  pointer-events: none;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(11, 11, 15, 0.65); /* Чуть темнее фон для контраста */
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 0 0 1px rgba(0, 245, 255, 0.1), 0 0 22px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
}

.ring {
  position: absolute;
  inset: 20%; /* Кольцо дистанции */
  border-radius: 50%;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}

.cross {
  position: absolute;
  left: 50%;
  top: 50%;
  background: rgba(255, 255, 255, 0.1);
  transform: translate(-50%, -50%);
}

.cross.x { width: 100%; height: 1px; }
.cross.y { width: 1px; height: 100%; }

/* Точки на радаре */
.ping {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  transition: top 0.1s linear, left 0.1s linear; /* Плавное движение точек */
  will-change: top, left;
}

/* Центральная точка (Игрок) */
.player-center {
  left: 50%;
  top: 50%;
  width: 8px;
  height: 8px;
  background: #fff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  z-index: 10;
  transform: translate(-50%, -50%);
}

/* Цвета врагов */
.ping.t-cyan {
  background: #00f5ff;
  box-shadow: 0 0 8px rgba(0, 245, 255, 0.6);
}
.ping.t-purple {
  background: #7c3aed;
  box-shadow: 0 0 8px rgba(124, 58, 237, 0.6);
}
.ping.t-danger {
  background: #ff3b5c;
  box-shadow: 0 0 8px rgba(255, 59, 92, 0.8);
  z-index: 5; /* Опасные поверх остальных */
}
</style>