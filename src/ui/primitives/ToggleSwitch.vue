<template>
  <button
    class="toggle"
    :class="{ on: modelValue }"
    type="button"
    role="switch"
    :aria-checked="modelValue ? 'true' : 'false'"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span class="track" />
    <span class="thumb" />
    <span v-if="label" class="label">{{ label }}</span>
  </button>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, required: true },
  label: { type: String, default: '' },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 0;
  color: var(--n-text);
}

.track {
  width: 46px;
  height: 26px;
  border-radius: var(--n-r-pill);
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.04);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2);
  transition:
    background var(--n-fast) var(--n-ease),
    border-color var(--n-fast) var(--n-ease),
    box-shadow var(--n-fast) var(--n-ease);
}

.thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(234, 234, 234, 0.9);
  position: absolute;
  margin-left: 3px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.5);
  transform: translateX(0);
  transition:
    transform var(--n-fast) var(--n-ease),
    background var(--n-fast) var(--n-ease);
}

.toggle {
  position: relative;
}

.toggle.on .track {
  background: rgba(0, 245, 255, 0.10);
  border-color: rgba(0, 245, 255, 0.22);
  box-shadow: 0 0 0 1px rgba(0, 245, 255, 0.12), 0 0 18px rgba(0, 245, 255, 0.10);
}

.toggle.on .thumb {
  transform: translateX(20px);
  background: rgba(234, 234, 234, 0.96);
}

.label {
  font-size: 13px;
  color: var(--n-text-dim);
}
</style>

