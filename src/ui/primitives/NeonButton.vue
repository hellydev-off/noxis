<template>
  <button
    class="btn"
    :class="[tone && `t-${tone}`, size && `s-${size}`, block && 'block', loading && 'loading']"
    :disabled="disabled || loading"
    type="button"
    @click="$emit('click', $event)"
  >
    <span class="ripple" />
    <span class="inner">
      <slot />
    </span>
  </button>
</template>

<script setup>
defineProps({
  tone: { type: String, default: 'purple' }, // purple | cyan | ghost | danger
  size: { type: String, default: 'md' }, // sm | md | lg | xl
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})
defineEmits(['click'])
</script>

<style scoped>
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: var(--n-r-16);
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.04);
  color: var(--n-text);
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
  transform: translateZ(0);
  transition:
    transform var(--n-fast) var(--n-ease),
    filter var(--n-fast) var(--n-ease),
    border-color var(--n-fast) var(--n-ease),
    box-shadow var(--n-fast) var(--n-ease),
    background var(--n-fast) var(--n-ease);
  overflow: hidden;
}

.btn.block {
  width: 100%;
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.inner {
  position: relative;
  z-index: 1;
  font-family: Sora, Inter, system-ui, sans-serif;
  letter-spacing: 0.9px;
  font-weight: 650;
}

.ripple {
  position: absolute;
  inset: -2px;
  background: radial-gradient(420px 260px at 50% 0%, rgba(124, 58, 237, 0.25), transparent 60%);
  opacity: 0;
  transform: scale(0.98);
  transition:
    opacity var(--n-fast) var(--n-ease),
    transform var(--n-fast) var(--n-ease);
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.06);
}

.btn:hover:not(:disabled) .ripple {
  opacity: 1;
  transform: scale(1);
}

.btn:active:not(:disabled) {
  transform: translateY(0px) scale(0.99);
}

/* Tones */
.btn.t-purple {
  background: rgba(124, 58, 237, 0.10);
  border-color: rgba(124, 58, 237, 0.28);
  box-shadow: 0 0 0 1px rgba(124, 58, 237, 0.18), 0 0 24px rgba(124, 58, 237, 0.18);
}
.btn.t-purple .ripple {
  background: radial-gradient(520px 320px at 50% 0%, rgba(124, 58, 237, 0.32), transparent 62%);
}

.btn.t-cyan {
  background: rgba(0, 245, 255, 0.08);
  border-color: rgba(0, 245, 255, 0.22);
  box-shadow: 0 0 0 1px rgba(0, 245, 255, 0.14), 0 0 24px rgba(0, 245, 255, 0.14);
}
.btn.t-cyan .ripple {
  background: radial-gradient(520px 320px at 50% 0%, rgba(0, 245, 255, 0.26), transparent 62%);
}

.btn.t-ghost {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.10);
  box-shadow: none;
}

.btn.t-danger {
  background: rgba(255, 59, 92, 0.10);
  border-color: rgba(255, 59, 92, 0.26);
  box-shadow: 0 0 0 1px rgba(255, 59, 92, 0.16), 0 0 24px rgba(255, 59, 92, 0.12);
}
.btn.t-danger .ripple {
  background: radial-gradient(520px 320px at 50% 0%, rgba(255, 59, 92, 0.28), transparent 62%);
}

/* Sizes */
.btn.s-sm {
  padding: 9px 12px;
  border-radius: var(--n-r-12);
  font-size: 13px;
}
.btn.s-md {
  font-size: 14px;
}
.btn.s-lg {
  padding: 14px 18px;
  font-size: 14.5px;
  border-radius: var(--n-r-16);
}
.btn.s-xl {
  padding: 16px 22px;
  font-size: 15px;
  border-radius: 18px;
}

@media (prefers-reduced-motion: reduce) {
  .btn,
  .ripple {
    transition: none;
  }
}
</style>

