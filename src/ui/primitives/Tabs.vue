<template>
  <div class="tabs" role="tablist">
    <button
      v-for="t in tabs"
      :key="t.key"
      type="button"
      class="tab"
      :class="{ active: modelValue === t.key }"
      role="tab"
      @click="$emit('update:modelValue', t.key)"
    >
      <span class="label">{{ t.label }}</span>
      <span class="line" />
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, required: true },
  tabs: { type: Array, required: true },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tab {
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--n-r-pill);
  padding: 9px 12px 11px;
  cursor: pointer;
  color: rgba(234, 234, 234, 0.72);
  transition:
    transform var(--n-fast) var(--n-ease),
    border-color var(--n-fast) var(--n-ease),
    color var(--n-fast) var(--n-ease),
    box-shadow var(--n-fast) var(--n-ease);
  overflow: hidden;
}

.label {
  font-family: Sora, Inter, system-ui, sans-serif;
  letter-spacing: 1.2px;
  font-size: 12px;
}

.line {
  position: absolute;
  left: 18%;
  right: 18%;
  bottom: 5px;
  height: 2px;
  border-radius: var(--n-r-pill);
  opacity: 0;
  background: linear-gradient(90deg, rgba(124, 58, 237, 0.0), rgba(124, 58, 237, 0.9), rgba(0, 245, 255, 0.7));
  transition:
    opacity var(--n-fast) var(--n-ease),
    transform var(--n-fast) var(--n-ease);
  transform: scaleX(0.8);
}

.tab:hover {
  transform: translateY(-1px);
  color: var(--n-text);
  border-color: rgba(255, 255, 255, 0.14);
}

.tab.active {
  color: var(--n-text);
  border-color: rgba(124, 58, 237, 0.22);
  box-shadow: var(--n-glow-purple);
}

.tab.active .line {
  opacity: 1;
  transform: scaleX(1);
}
</style>

