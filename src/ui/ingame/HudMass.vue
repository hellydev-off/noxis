<template>
  <div class="mass">
    <div class="label n-subtle">MASS</div>
    <div class="value n-title">{{ formatted }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  mass: { type: Number, required: true },
})

const formatted = computed(() => Math.round(props.mass).toLocaleString())
</script>

<style scoped>
.mass {
  pointer-events: none;
  padding: 10px 14px 12px;
  border-radius: var(--n-r-20);
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(11, 11, 15, 0.45);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 0 0 1px rgba(124, 58, 237, 0.10), 0 0 24px rgba(124, 58, 237, 0.10);
  text-align: center;
  min-width: 170px;
}

.label {
  font-family: Sora, Inter, system-ui, sans-serif;
  letter-spacing: 2px;
  font-size: 10.5px;
}

.value {
  margin-top: 3px;
  font-size: 18px;
  letter-spacing: 1px;
  color: var(--n-text);
  text-shadow: 0 0 24px rgba(124, 58, 237, 0.24);
  font-variant-numeric: tabular-nums;
}
</style>

