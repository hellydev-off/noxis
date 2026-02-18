<template>
  <span>{{ display }}</span>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  value: { type: Number, required: true },
  durationMs: { type: Number, default: 650 },
})

const displayValue = ref(0)
const from = ref(0)
let raf = 0
let start = 0

const display = computed(() => Math.round(displayValue.value).toLocaleString())

function animate(to) {
  cancelAnimationFrame(raf)
  start = performance.now()
  const d = Math.max(120, props.durationMs)
  const a = from.value

  const step = (t) => {
    const k = Math.min(1, (t - start) / d)
    const eased = 1 - Math.pow(1 - k, 3)
    displayValue.value = a + (to - a) * eased
    if (k < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
}

watch(
  () => props.value,
  (v) => {
    from.value = displayValue.value
    animate(v)
  },
  { immediate: true },
)

onMounted(() => {
  displayValue.value = props.value
})

onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

