<template>
  <div class="shell">
    <BackgroundFx class="bg" />
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import BackgroundFx from '@/ui/visual/BackgroundFx.vue'
</script>

<style scoped>
.shell {
  position: relative;
  min-height: 100vh;
  isolation: isolate;
}

.bg {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.content {
  min-height: 100vh;
}
</style>

