<template>
  <div class="page">
    <TopBar />

    <main class="main n-container">
      <div class="head">
        <div>
          <div class="h1 n-title">SETTINGS</div>
          <div class="sub n-subtle">Minimal controls. Maximum clarity.</div>
        </div>
        <SegmentedControl v-model="perf" :options="['Performance', 'Balanced', 'Ultra']" />
      </div>

      <section class="sections">
        <GlassPanel class="section" variant="strong">
          <div class="title n-title">GRAPHICS</div>
          <div class="row">
            <div>
              <div class="label">Particles</div>
              <div class="hint n-subtle">Ambient background motion.</div>
            </div>
            <ToggleSwitch v-model="particles" />
          </div>
          <div class="row">
            <div>
              <div class="label">High FPS Mode</div>
              <div class="hint n-subtle">Prioritize responsiveness.</div>
            </div>
            <ToggleSwitch v-model="highFps" />
          </div>
        </GlassPanel>

        <GlassPanel class="section" variant="strong">
          <div class="title n-title">CONTROLS</div>
          <div class="row">
            <div>
              <div class="label">Hold to Split</div>
              <div class="hint n-subtle">Safer inputs in fights.</div>
            </div>
            <ToggleSwitch v-model="holdSplit" />
          </div>
          <div class="row">
            <div>
              <div class="label">Smart Eject</div>
              <div class="hint n-subtle">Reduces accidental waste.</div>
            </div>
            <ToggleSwitch v-model="smartEject" />
          </div>
        </GlassPanel>

        <GlassPanel class="section" variant="strong">
          <div class="title n-title">AUDIO</div>
          <div class="row">
            <div>
              <div class="label">Master</div>
              <div class="hint n-subtle">SFX + music.</div>
            </div>
            <ToggleSwitch v-model="audio" />
          </div>
        </GlassPanel>

        <GlassPanel class="section" variant="strong">
          <div class="title n-title">GAMEPLAY (DEMO)</div>
          <div class="row">
            <div>
              <div class="label">Speed</div>
              <div class="hint n-subtle">Simple multiplier for movement.</div>
            </div>
            <div class="range">
              <input v-model="speedUi" type="range" min="60" max="160" step="1" />
              <div class="rangeVal n-subtle">{{ speedUi }}%</div>
            </div>
          </div>
          <div class="row">
            <div>
              <div class="label">Mass balls on field</div>
              <div class="hint n-subtle">Pellets count (demo).</div>
            </div>
            <div class="range">
              <input v-model="pelletsUi" type="range" min="400" max="6000" step="50" />
              <div class="rangeVal n-subtle">{{ pelletsUi }}</div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel class="section" variant="strong">
          <div class="title n-title">ACCOUNT</div>
          <div class="row">
            <div>
              <div class="label">Streamer Mode</div>
              <div class="hint n-subtle">Hide sensitive UI.</div>
            </div>
            <ToggleSwitch v-model="streamer" />
          </div>
          <div class="row">
            <div>
              <div class="label">Sign out</div>
              <div class="hint n-subtle">Ends session on this device.</div>
            </div>
            <NeonButton size="sm" tone="danger">SIGN OUT</NeonButton>
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
import ToggleSwitch from '@/ui/primitives/ToggleSwitch.vue'
import SegmentedControl from '@/ui/primitives/SegmentedControl.vue'
import NeonButton from '@/ui/primitives/NeonButton.vue'
import { demoSettings } from '@/game/demo/demoSettings'

const perf = ref('Balanced')
const particles = ref(true)
const highFps = ref(true)
const holdSplit = ref(false)
const smartEject = ref(true)
const audio = ref(true)
const streamer = ref(false)

const speedUi = computed({
  get: () => Math.round((demoSettings.speed || 1) * 100),
  set: (v) => {
    demoSettings.speed = Math.min(1.6, Math.max(0.6, Number(v) / 100))
  },
})

const pelletsUi = computed({
  get: () => demoSettings.pellets,
  set: (v) => {
    demoSettings.pellets = Math.min(6000, Math.max(400, Number(v)))
  },
})
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

.sections {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--n-16);
}

.section {
  display: grid;
  gap: 14px;
}

.title {
  font-size: 12px;
  letter-spacing: 2.4px;
  color: var(--n-text-dim);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 12px;
  border-radius: var(--n-r-16);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
}

.label {
  font-size: 13.5px;
}

.hint {
  margin-top: 4px;
  font-size: 12.5px;
}

.range {
  display: grid;
  gap: 6px;
  min-width: 180px;
  justify-items: end;
}

input[type='range'] {
  width: 220px;
  accent-color: var(--n-purple);
}

.rangeVal {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 980px) {
  .sections {
    grid-template-columns: 1fr;
  }

  input[type='range'] {
    width: 180px;
  }
}
</style>

