<template>
  <div class="orb" :class="[rarity && `r-${rarity}`, animated && 'animated']" />
</template>

<script setup>
defineProps({
  rarity: { type: String, default: '' }, // common | rare | epic | legendary
  animated: { type: Boolean, default: true },
})
</script>

<style scoped>
.orb {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background:
    radial-gradient(24px 24px at 30% 28%, rgba(255, 255, 255, 0.22), transparent 60%),
    radial-gradient(48px 48px at 70% 74%, rgba(124, 58, 237, 0.14), transparent 62%),
    radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.01) 56%, rgba(0, 0, 0, 0.18) 100%);
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.5),
    inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  position: relative;
  overflow: hidden;
}

.orb::after {
  content: '';
  position: absolute;
  inset: -40%;
  background: conic-gradient(
    from 140deg,
    transparent 0deg,
    rgba(0, 245, 255, 0.09) 65deg,
    rgba(124, 58, 237, 0.10) 140deg,
    transparent 220deg,
    transparent 360deg
  );
  opacity: 0.55;
  transform: rotate(0deg);
}

.orb.animated::after {
  animation: spin 7.5s linear infinite;
}

.orb.r-common {
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.08);
}

.orb.r-rare {
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(0, 245, 255, 0.20),
    0 0 18px rgba(0, 245, 255, 0.14);
}

.orb.r-epic {
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(124, 58, 237, 0.22),
    0 0 18px rgba(124, 58, 237, 0.16);
}

.orb.r-legendary {
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(247, 200, 75, 0.26),
    0 0 22px rgba(247, 200, 75, 0.16);
}

.orb.r-legendary::after {
  opacity: 0.75;
  background: conic-gradient(
    from 140deg,
    transparent 0deg,
    rgba(247, 200, 75, 0.22) 85deg,
    rgba(255, 255, 255, 0.10) 140deg,
    transparent 220deg,
    transparent 360deg
  );
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .orb.animated::after {
    animation: none;
  }
}
</style>

