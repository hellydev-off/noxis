<template>
  <div class="page">
    <TopBar />

    <main class="main n-container">
      <section class="top">
        <GlassPanel class="season" glow="purple">
          <div class="seasonLeft">
            <div class="emblem" />
            <div>
              <div class="h1 n-title">SEASON LEAGUE</div>
              <div class="sub n-subtle">Progress and pressure — clean.</div>
            </div>
          </div>
          <div class="seasonRight">
            <div class="rank">
              <div class="label n-subtle">CURRENT RANK</div>
              <div class="value n-title">#42</div>
            </div>
            <div class="bar">
              <div class="fill" :style="{ width: `${progress}%` }" />
            </div>
            <div class="barMeta n-subtle">{{ progress }}% to next league</div>
          </div>
        </GlassPanel>
      </section>

      <section class="board">
        <GlassPanel class="tableWrap" variant="strong">
          <div class="tableTitle n-title">LEADERBOARD</div>

          <div class="table">
            <div class="row head">
              <div>Rank</div>
              <div>Player</div>
              <div class="num">Points</div>
              <div class="num">Kills</div>
            </div>

            <div
              v-for="p in leaderboard"
              :key="p.rank"
              class="row"
              :class="{ top3: p.rank <= 3 }"
            >
              <div class="rankCell">{{ p.rank }}</div>
              <div class="playerCell">
                <span class="dot" />
                <span>{{ p.name }}</span>
              </div>
              <div class="num">{{ p.points }}</div>
              <div class="num">{{ p.kills }}</div>
            </div>
          </div>
        </GlassPanel>
      </section>
    </main>

    <BottomNav />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BottomNav from '@/ui/layout/BottomNav.vue'
import TopBar from '@/ui/layout/TopBar.vue'
import GlassPanel from '@/ui/primitives/GlassPanel.vue'

const progress = ref(68)

const leaderboard = [
  { rank: 1, name: 'N0VA', points: 18240, kills: 221 },
  { rank: 2, name: 'CYANRIFT', points: 17410, kills: 203 },
  { rank: 3, name: 'VANTABLADE', points: 16930, kills: 198 },
  { rank: 4, name: 'NEONHALO', points: 15800, kills: 176 },
  { rank: 5, name: 'IONFANG', points: 15110, kills: 169 },
  { rank: 6, name: 'SPECTRA', points: 14810, kills: 162 },
  { rank: 7, name: 'PHASE', points: 14122, kills: 154 },
]
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: grid;
  grid-template-rows: var(--n-topbarh) 1fr var(--n-navh);
}

.main {
  padding-top: var(--n-24);
  padding-bottom: var(--n-24);
  display: grid;
  gap: var(--n-20);
}

.season {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--n-20);
  align-items: center;
}

.seasonLeft {
  display: flex;
  gap: 14px;
  align-items: center;
}

.emblem {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background:
    radial-gradient(28px 28px at 35% 35%, rgba(255, 255, 255, 0.16), transparent 62%),
    radial-gradient(40px 40px at 70% 80%, rgba(124, 58, 237, 0.16), transparent 62%),
    rgba(255, 255, 255, 0.02);
  box-shadow: var(--n-glow-purple);
}

.h1 {
  letter-spacing: 2.6px;
  font-size: 13px;
}

.sub {
  margin-top: 6px;
  font-size: 13px;
}

.seasonRight {
  display: grid;
  gap: 10px;
  justify-items: end;
}

.rank .label {
  font-size: 11px;
  letter-spacing: 1.8px;
}

.rank .value {
  font-size: 22px;
  letter-spacing: 0.6px;
}

.bar {
  width: min(360px, 100%);
  height: 10px;
  border-radius: var(--n-r-pill);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.fill {
  height: 100%;
  border-radius: var(--n-r-pill);
  background: linear-gradient(90deg, rgba(124, 58, 237, 0.95), rgba(0, 245, 255, 0.75));
  box-shadow: 0 0 22px rgba(124, 58, 237, 0.22);
}

.barMeta {
  font-size: 12px;
}

.tableWrap {
  padding: var(--n-20);
}

.tableTitle {
  letter-spacing: 2.2px;
  font-size: 12px;
  margin-bottom: 12px;
  color: var(--n-text-dim);
}

.table {
  display: grid;
  gap: 8px;
}

.row {
  display: grid;
  grid-template-columns: 90px 1fr 120px 100px;
  gap: 10px;
  align-items: center;
  padding: 12px 12px;
  border-radius: var(--n-r-16);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  transition:
    transform var(--n-fast) var(--n-ease),
    border-color var(--n-fast) var(--n-ease),
    box-shadow var(--n-fast) var(--n-ease),
    background var(--n-fast) var(--n-ease);
}

.row.head {
  background: transparent;
  border: 0;
  padding: 0 12px 6px;
  color: var(--n-text-dim);
  font-size: 12px;
  letter-spacing: 1.2px;
  font-family: Sora, Inter, system-ui, sans-serif;
}

.row:not(.head):hover {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.03);
}

.row.top3 {
  border-color: rgba(124, 58, 237, 0.18);
  box-shadow: 0 0 0 1px rgba(124, 58, 237, 0.14), 0 0 24px rgba(124, 58, 237, 0.10);
  animation: topGlow 2.6s var(--n-ease) infinite alternate;
}

@keyframes topGlow {
  from {
    box-shadow: 0 0 0 1px rgba(124, 58, 237, 0.10), 0 0 18px rgba(124, 58, 237, 0.08);
  }
  to {
    box-shadow: 0 0 0 1px rgba(124, 58, 237, 0.18), 0 0 26px rgba(124, 58, 237, 0.14);
  }
}

.rankCell {
  font-family: Sora, Inter, system-ui, sans-serif;
  letter-spacing: 1.2px;
  color: rgba(234, 234, 234, 0.9);
}

.playerCell {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(0, 245, 255, 0.8);
  box-shadow: 0 0 14px rgba(0, 245, 255, 0.18);
}

.num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 980px) {
  .season {
    grid-template-columns: 1fr;
  }
  .seasonRight {
    justify-items: start;
  }
  .row {
    grid-template-columns: 70px 1fr 90px 70px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .row.top3 {
    animation: none;
  }
}
</style>

