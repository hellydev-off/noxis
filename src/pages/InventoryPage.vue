<template>
  <div class="page">
    <TopBar />

    <main class="main n-container">
      <div class="head">
        <div>
          <div class="h1 n-title">INVENTORY</div>
          <div class="sub n-subtle">Equip with intent.</div>
        </div>
        <Tabs v-model="tab" :tabs="tabs" />
      </div>

      <section class="grid">
        <GlassPanel v-for="it in items" :key="it.name" class="card" interactive>
          <div class="top">
            <OrbPreview :rarity="it.rarity" />
            <div class="meta">
              <div class="name">{{ it.name }}</div>
              <div class="rarity n-subtle">{{ it.rarity.toUpperCase() }}</div>
            </div>
          </div>
          <div class="actions">
            <NeonButton size="sm" :tone="it.active ? 'cyan' : 'ghost'" @click="equip(it)">
              {{ it.active ? 'EQUIPPED' : 'EQUIP' }}
            </NeonButton>
          </div>
        </GlassPanel>
      </section>
    </main>

    <BottomNav />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import BottomNav from '@/ui/layout/BottomNav.vue'
import TopBar from '@/ui/layout/TopBar.vue'
import GlassPanel from '@/ui/primitives/GlassPanel.vue'
import NeonButton from '@/ui/primitives/NeonButton.vue'
import OrbPreview from '@/ui/visual/OrbPreview.vue'
import Tabs from '@/ui/primitives/Tabs.vue'

const tab = ref('Skins')
const tabs = [
  { key: 'Skins', label: 'Skins' },
  { key: 'Boosters', label: 'Boosters' },
  { key: 'Abilities', label: 'Abilities' },
  { key: 'Effects', label: 'Effects' },
  { key: 'Trails', label: 'Trails' },
]

const inventory = ref([
  { name: 'Nightglass', rarity: 'common', type: 'Skins', active: true },
  { name: 'Cyan Pulse', rarity: 'rare', type: 'Skins', active: false },
  { name: 'Nebula Shard', rarity: 'epic', type: 'Skins', active: false },
  { name: 'Aurum Singularity', rarity: 'legendary', type: 'Skins', active: false },
  { name: 'Phase Booster', rarity: 'rare', type: 'Boosters', active: false },
  { name: 'Ion Booster', rarity: 'common', type: 'Boosters', active: false },
  { name: 'Collapse Field', rarity: 'epic', type: 'Abilities', active: false },
  { name: 'Micro Warp', rarity: 'rare', type: 'Abilities', active: false },
])

const items = computed(() => inventory.value.filter((i) => i.type === tab.value))

function equip(it) {
  for (const i of inventory.value) {
    if (i.type === it.type) i.active = false
  }
  it.active = true
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
  gap: var(--n-16);
}

.head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--n-16);
  flex-wrap: wrap;
}

.h1 {
  font-size: 18px;
  letter-spacing: 1.6px;
}

.sub {
  margin-top: 6px;
  font-size: 13px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--n-16);
}

.card {
  min-height: 160px;
  display: grid;
  gap: 14px;
  align-content: start;
}

.top {
  display: flex;
  gap: 12px;
  align-items: center;
}

.meta {
  display: grid;
  gap: 6px;
}

.name {
  font-size: 14px;
}

.rarity {
  font-family: Sora, Inter, system-ui, sans-serif;
  letter-spacing: 1.2px;
  font-size: 11px;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 980px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>

