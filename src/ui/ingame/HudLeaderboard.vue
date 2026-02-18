<template>
  <div class="lb">
    <div class="title n-title">LEADERBOARD</div>
    <div class="rows">
      <div
        v-for="r in rows"
        :key="`${r.rank}-${r.name}`"
        class="row"
        :class="{ top3: typeof r.rank === 'number' && r.rank <= 3, you: r.isYou }"
      >
        <div class="rank">{{ typeof r.rank === 'number' ? `#${r.rank}` : r.rank }}</div>
        <div class="name">{{ r.name }}</div>
        <div class="value">{{ r.value.toLocaleString() }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  rows: { type: Array, required: true },
})
</script>

<style scoped>
.lb {
  pointer-events: none;
  width: 260px;
  padding: 12px 12px 14px;
  border-radius: var(--n-r-20);
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(11, 11, 15, 0.55);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 0 0 1px rgba(0, 245, 255, 0.08), 0 0 22px rgba(0, 245, 255, 0.08);
}

.title {
  letter-spacing: 2.2px;
  font-size: 11px;
  color: var(--n-text-dim);
}

.rows {
  margin-top: 10px;
  display: grid;
  gap: 8px;
}

.row {
  display: grid;
  grid-template-columns: 60px 1fr 90px;
  gap: 10px;
  align-items: center;
  padding: 10px 10px;
  border-radius: var(--n-r-16);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
}

.row.top3 {
  border-color: rgba(124, 58, 237, 0.18);
  box-shadow: 0 0 0 1px rgba(124, 58, 237, 0.12), 0 0 18px rgba(124, 58, 237, 0.08);
  animation: breathe 2.4s var(--n-ease) infinite alternate;
}

.row.you {
  border-color: rgba(0, 245, 255, 0.18);
  box-shadow: 0 0 0 1px rgba(0, 245, 255, 0.10), 0 0 16px rgba(0, 245, 255, 0.08);
}

.row.you .name {
  color: rgba(234, 234, 234, 0.94);
}

.row.you .rank {
  color: rgba(0, 245, 255, 0.92);
}

@keyframes breathe {
  from {
    box-shadow: 0 0 0 1px rgba(124, 58, 237, 0.10), 0 0 14px rgba(124, 58, 237, 0.06);
  }
  to {
    box-shadow: 0 0 0 1px rgba(124, 58, 237, 0.18), 0 0 22px rgba(124, 58, 237, 0.12);
  }
}

.rank {
  font-family: Sora, Inter, system-ui, sans-serif;
  letter-spacing: 1.0px;
  color: rgba(234, 234, 234, 0.9);
}

.name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.value {
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: rgba(234, 234, 234, 0.82);
}

@media (prefers-reduced-motion: reduce) {
  .row.top3 {
    animation: none;
  }
}
</style>

