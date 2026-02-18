<template>
  <div class="page">
    <TopBar />

    <main class="main n-container">
      <section class="center">
        <NeonButton class="play" size="xl" tone="purple" block @click="play">
          PLAY
        </NeonButton>
        <div class="sub n-subtle">Queue fast. Win cleaner.</div>
      </section>

      <section class="modes">
        <GlassPanel
          v-for="m in modes"
          :key="m.title"
          class="modeCard"
          interactive
          :glow="m.glow"
          @click="selected = m.key"
        >
          <div class="cardTop">
            <div class="miniIcon" v-html="m.icon" />
            <div class="title">
              <div class="name n-title">{{ m.title }}</div>
              <div class="desc n-subtle">{{ m.desc }}</div>
            </div>
          </div>
          <div class="cardBottom">
            <div class="pill" :class="{ active: selected === m.key }">
              {{ selected === m.key ? 'Selected' : 'Select' }}
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
import { useRouter } from 'vue-router'
import BottomNav from '@/ui/layout/BottomNav.vue'
import TopBar from '@/ui/layout/TopBar.vue'
import GlassPanel from '@/ui/primitives/GlassPanel.vue'
import NeonButton from '@/ui/primitives/NeonButton.vue'

const router = useRouter()
const selected = ref('classic')

const modes = [
  {
    key: 'classic',
    title: 'Classic',
    desc: 'Pure mass race. Zero distractions.',
    glow: 'purple',
    icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" stroke-width="1.6"/><path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" fill="currentColor" opacity="0.8"/></svg>`,
  },
  {
    key: 'collapse',
    title: 'Battle Collapse',
    desc: 'Shrinking zone. Faster decisions.',
    glow: 'cyan',
    icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 3v6m0 6v6M3 12h6m6 0h6" stroke="currentColor" stroke-width="1.6"/><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="1.6"/></svg>`,
  },
  {
    key: 'teams',
    title: '5v5 Teams',
    desc: 'Coordination wins. Controlled chaos.',
    glow: 'purple',
    icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M7 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM17 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="1.6"/><path d="M2.5 21a6 6 0 0 1 9 0m1 0a6 6 0 0 1 9 0" stroke="currentColor" stroke-width="1.6" opacity="0.9"/></svg>`,
  },
]

function play() {
  router.push({ name: 'ingame' })
}
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
  gap: var(--n-32);
  align-content: start;
}

.center {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: var(--n-32) 0 var(--n-12);
}

.play {
  max-width: 520px;
  border-radius: 22px;
  letter-spacing: 3px;
  position: relative;
}

.play :deep(.inner) {
  font-size: 16px;
}

.play::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 24px;
  pointer-events: none;
  opacity: 0.0;
  box-shadow: 0 0 42px rgba(124, 58, 237, 0.26);
  transition: opacity var(--n-med) var(--n-ease);
}

.play:hover::after {
  opacity: 1;
}

.sub {
  font-size: 13px;
  letter-spacing: 0.2px;
}

.modes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--n-16);
}

.modeCard {
  cursor: pointer;
  min-height: 140px;
  display: grid;
  gap: 14px;
}

.cardTop {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.miniIcon :deep(svg) {
  width: 22px;
  height: 22px;
  opacity: 0.9;
}

.name {
  font-size: 14px;
}

.desc {
  margin-top: 6px;
  font-size: 13px;
}

.cardBottom {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.pill {
  padding: 7px 10px;
  border-radius: var(--n-r-pill);
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(234, 234, 234, 0.7);
  font-size: 12px;
  letter-spacing: 0.8px;
  font-family: Sora, Inter, system-ui, sans-serif;
  transition:
    border-color var(--n-fast) var(--n-ease),
    color var(--n-fast) var(--n-ease),
    box-shadow var(--n-fast) var(--n-ease);
}

.pill.active {
  color: var(--n-text);
  border-color: rgba(124, 58, 237, 0.25);
  box-shadow: var(--n-glow-purple);
}

@media (max-width: 980px) {
  .modes {
    grid-template-columns: 1fr;
  }
  .modeCard {
    min-height: unset;
  }
  .play {
    max-width: 100%;
  }
}
</style>

