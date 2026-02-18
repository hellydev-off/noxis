<template>
  <GlassPanel class="card" variant="strong" :glow="glow">
    <div class="top">
      <div class="label n-subtle">{{ label }}</div>
      <div class="line" :class="`c-${glow}`" />
    </div>
    <div class="value n-title">
      <CountUpNumber :value="value" />
      <span v-if="suffix" class="suffix">{{ suffix }}</span>
    </div>
  </GlassPanel>
</template>

<script setup>
import GlassPanel from '@/ui/primitives/GlassPanel.vue'
import CountUpNumber from '@/ui/visual/CountUpNumber.vue'

defineProps({
  label: { type: String, required: true },
  value: { type: Number, required: true },
  suffix: { type: String, default: '' },
  glow: { type: String, default: 'purple' }, // purple | cyan | ''
})
</script>

<style scoped>
.card {
  display: grid;
  gap: 12px;
  min-height: 110px;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.label {
  letter-spacing: 1.6px;
  font-size: 11px;
  font-family: Sora, Inter, system-ui, sans-serif;
}

.line {
  width: 38px;
  height: 2px;
  border-radius: var(--n-r-pill);
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 18px rgba(255, 255, 255, 0.10);
}

.line.c-purple {
  background: rgba(124, 58, 237, 0.75);
  box-shadow: 0 0 18px rgba(124, 58, 237, 0.22);
}

.line.c-cyan {
  background: rgba(0, 245, 255, 0.75);
  box-shadow: 0 0 18px rgba(0, 245, 255, 0.18);
}

.value {
  font-size: 22px;
  letter-spacing: 0.4px;
  font-variant-numeric: tabular-nums;
}

.suffix {
  margin-left: 6px;
  font-size: 14px;
  color: var(--n-text-dim);
}
</style>

