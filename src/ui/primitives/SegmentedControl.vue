<template>
  <div class="seg">
    <button
      v-for="o in options"
      :key="o"
      type="button"
      class="opt"
      :class="{ active: modelValue === o }"
      @click="$emit('update:modelValue', o)"
    >
      {{ o }}
      <span class="glow" />
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, required: true },
  options: { type: Array, required: true },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.seg {
  display: inline-grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 6px;
  padding: 6px;
  border-radius: var(--n-r-pill);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.opt {
  position: relative;
  border: 1px solid transparent;
  background: transparent;
  color: rgba(234, 234, 234, 0.70);
  border-radius: var(--n-r-pill);
  padding: 9px 12px;
  cursor: pointer;
  font-size: 12px;
  letter-spacing: 1.1px;
  font-family: Sora, Inter, system-ui, sans-serif;
  transition:
    color var(--n-fast) var(--n-ease),
    border-color var(--n-fast) var(--n-ease),
    transform var(--n-fast) var(--n-ease);
  overflow: hidden;
}

.opt:hover {
  color: var(--n-text);
  transform: translateY(-1px);
}

.opt.active {
  color: var(--n-text);
  background: rgba(124, 58, 237, 0.10);
  border-color: rgba(124, 58, 237, 0.22);
}

.glow {
  position: absolute;
  inset: -2px;
  opacity: 0;
  background: radial-gradient(240px 120px at 50% 0%, rgba(124, 58, 237, 0.30), transparent 60%);
  transition: opacity var(--n-fast) var(--n-ease);
}

.opt.active .glow {
  opacity: 1;
}
</style>

