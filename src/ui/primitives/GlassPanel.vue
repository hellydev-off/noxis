<template>
  <component
    :is="as"
    class="glass"
    :class="[
      variant && `v-${variant}`,
      glow && `g-${glow}`,
      interactive && 'interactive',
      padded && 'padded',
    ]"
  >
    <slot />
  </component>
</template>

<script setup>
defineProps({
  as: { type: String, default: 'div' },
  variant: { type: String, default: 'default' }, // default | strong
  glow: { type: String, default: '' }, // purple | cyan
  interactive: { type: Boolean, default: false },
  padded: { type: Boolean, default: true },
})
</script>

<style scoped>
.glass {
  background: var(--n-glass);
  border: 1px solid var(--n-border);
  border-radius: var(--n-r-20);
  box-shadow: var(--n-shadow-1);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.glass.padded {
  padding: var(--n-20);
}

.glass.v-strong {
  background: var(--n-glass-strong);
  border-color: var(--n-border-strong);
}

.glass.g-purple {
  box-shadow: var(--n-shadow-1), var(--n-glow-purple);
}

.glass.g-cyan {
  box-shadow: var(--n-shadow-1), var(--n-glow-cyan);
}

.glass.interactive {
  transition:
    transform var(--n-fast) var(--n-ease),
    box-shadow var(--n-fast) var(--n-ease),
    border-color var(--n-fast) var(--n-ease);
}

.glass.interactive:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.14);
}
</style>

