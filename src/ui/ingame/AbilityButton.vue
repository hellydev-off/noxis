<template>
  <button
    class="ab"
    :class="`t-${tone}`"
    type="button"
    @click="$emit('click', $event)"
    @dblclick="$emit('dblclick', $event)"
  >
    <div class="ring">
      <svg viewBox="0 0 44 44" class="svg" aria-hidden="true">
        <circle class="track" cx="22" cy="22" r="18" />
        <circle
          class="cool"
          cx="22"
          cy="22"
          r="18"
          :style="{ strokeDashoffset: dashOffset }"
        />
      </svg>
    </div>

    <div class="icon" v-html="icon" />

    <div class="meta">
      <div class="label n-title">{{ label }}</div>
      <div class="key n-subtle">{{ hotkey }}</div>
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  hotkey: { type: String, default: '' },
  icon: { type: String, default: '' }, // inline svg
  cooldown: { type: Number, default: 0 }, // 0..1 (1 = just used)
  tone: { type: String, default: 'purple' }, // purple | cyan | danger
})

defineEmits(['click', 'dblclick'])

const circumference = 2 * Math.PI * 18
const dashOffset = computed(() => `${circumference * (1 - Math.min(1, Math.max(0, props.cooldown)))}`)
</script>

<style scoped>
.ab {
  pointer-events: auto;
  display: grid;
  grid-template-columns: 52px 1fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    'ring label'
    'ring key';
  align-items: center;
  column-gap: 12px;
  row-gap: 2px;
  padding: 10px 12px 10px 10px;
  border-radius: var(--n-r-20);
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(11, 11, 15, 0.52);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.55);
  cursor: pointer;
  transition:
    transform var(--n-fast) var(--n-ease),
    border-color var(--n-fast) var(--n-ease),
    box-shadow var(--n-fast) var(--n-ease);
}

.ab:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.14);
}

.ab:active {
  transform: translateY(0px) scale(0.995);
}

.ring {
  grid-area: ring;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  position: relative;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background:
    radial-gradient(26px 26px at 30% 30%, rgba(255, 255, 255, 0.14), transparent 62%),
    rgba(255, 255, 255, 0.02);
  overflow: hidden;
}

.svg {
  position: absolute;
  inset: 4px;
  width: calc(100% - 8px);
  height: calc(100% - 8px);
  transform: rotate(-90deg);
}

.track {
  fill: none;
  stroke: rgba(255, 255, 255, 0.08);
  stroke-width: 3;
}

.cool {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 113.097; /* 2πr with r=18 */
  transition: stroke-dashoffset 140ms linear;
}

.icon {
  position: absolute;
  width: 18px;
  height: 18px;
  color: rgba(234, 234, 234, 0.9);
}

.icon :deep(svg) {
  width: 18px;
  height: 18px;
}

.meta {
  display: grid;
  grid-template-rows: auto auto;
}

.label {
  grid-area: label;
  letter-spacing: 1.2px;
  font-size: 12.5px;
}

.key {
  grid-area: key;
  font-size: 12px;
}

/* Tones */
.ab.t-purple {
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(124, 58, 237, 0.10);
}
.ab.t-purple .cool {
  stroke: rgba(124, 58, 237, 0.9);
  filter: drop-shadow(0 0 10px rgba(124, 58, 237, 0.22));
}

.ab.t-cyan {
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(0, 245, 255, 0.08);
}
.ab.t-cyan .cool {
  stroke: rgba(0, 245, 255, 0.9);
  filter: drop-shadow(0 0 10px rgba(0, 245, 255, 0.18));
}

.ab.t-danger .cool {
  stroke: rgba(255, 59, 92, 0.92);
  filter: drop-shadow(0 0 10px rgba(255, 59, 92, 0.16));
}

@media (max-width: 720px) {
  .ab {
    grid-template-columns: 52px 1fr;
    min-width: 220px;
  }
}
</style>

