<template>
  <div @click="leaveGame" class="lb">
    <div class="title n-title">Leave</div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const leaveGame = () => {
  router.push("/");
};
</script>

<style scoped>
.lb {
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  padding: 6px 8px;
  border-radius: var(--n-r-20);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(70, 18, 18, 0.55);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow:
    0 0 0 1px rgba(126, 15, 37, 0.08),
    0 0 22px rgba(0, 245, 255, 0.08);
}

.title {
  letter-spacing: 2.2px;
  font-size: 11px;
  color: var(--n-text-dim);
}

@media (prefers-reduced-motion: reduce) {
  .row.top3 {
    animation: none;
  }
}
</style>
