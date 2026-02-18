<template>
  <div class="page">
    <TopBar />

    <main class="main n-container">
      <section class="hero">
        <GlassPanel class="left" glow="cyan">
          <div class="avatarWrap">
            <div class="bigOrb" />
          </div>
          <div class="name n-title">{{ player.username }}</div>
          <div class="rank n-subtle">RANK: #42 • LEAGUE: ARC</div>
        </GlassPanel>

        <div class="right">
          <div class="stats">
            <StatCard label="TOTAL MASS COLLECTED" :value="9284012" glow="purple" />
            <StatCard label="TOTAL KILLS" :value="12840" glow="cyan" />
            <StatCard label="WINS" :value="632" glow="purple" />
            <StatCard label="WIN RATE" :value="58" suffix="%" glow="cyan" />
            <StatCard label="MATCHES PLAYED" :value="1085" glow="purple" />
          </div>
        </div>
      </section>
    </main>

    <BottomNav />
  </div>
</template>

<script setup>
import BottomNav from '@/ui/layout/BottomNav.vue'
import TopBar from '@/ui/layout/TopBar.vue'
import GlassPanel from '@/ui/primitives/GlassPanel.vue'
import StatCard from '@/ui/cards/StatCard.vue'
import { player } from '@/ui/state/player'
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
}

.hero {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: var(--n-20);
  align-items: start;
}

.left {
  display: grid;
  gap: 12px;
  justify-items: center;
  padding: var(--n-24);
}

.avatarWrap {
  width: 160px;
  height: 160px;
  display: grid;
  place-items: center;
}

.bigOrb {
  width: 148px;
  height: 148px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background:
    radial-gradient(50px 50px at 28% 28%, rgba(255, 255, 255, 0.18), transparent 62%),
    radial-gradient(90px 90px at 72% 78%, rgba(0, 245, 255, 0.12), transparent 62%),
    radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01) 56%, rgba(0, 0, 0, 0.20) 100%);
  box-shadow: var(--n-glow-cyan), 0 20px 60px rgba(0, 0, 0, 0.55);
  position: relative;
  overflow: hidden;
}

.bigOrb::after {
  content: '';
  position: absolute;
  inset: -40%;
  background: conic-gradient(
    from 120deg,
    transparent 0deg,
    rgba(0, 245, 255, 0.16) 90deg,
    rgba(124, 58, 237, 0.14) 150deg,
    transparent 240deg,
    transparent 360deg
  );
  opacity: 0.75;
  animation: spin 8.5s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.name {
  font-size: 18px;
  letter-spacing: 1.4px;
}

.rank {
  font-size: 13px;
  letter-spacing: 0.4px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--n-16);
}

@media (max-width: 980px) {
  .hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .stats {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bigOrb::after {
    animation: none;
  }
}
</style>

