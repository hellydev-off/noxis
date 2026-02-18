<template>
  <GlassPanel class="card" interactive>
    <div class="preview">
      <OrbPreview :rarity="item.rarity" />
    </div>
    <div class="meta">
      <div class="name">{{ item.name }}</div>
      <div class="rarity" :class="`r-${item.rarity}`">
        {{ item.rarity.toUpperCase() }}
      </div>
    </div>
    <div class="category">{{ category }}</div>
    <NeonButton class="buy" size="sm" :tone="item.rarityTone">BUY</NeonButton>
  </GlassPanel>
</template>

<script setup>
import GlassPanel from "@/ui/primitives/GlassPanel.vue";
import NeonButton from "@/ui/primitives/NeonButton.vue";
import OrbPreview from "@/ui/visual/OrbPreview.vue";

defineProps({
  item: { type: Object, required: true },
  category: { type: String, required: true },
});
</script>

<style scoped>
.card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.card {
  display: grid;
  grid-template-rows: auto auto auto;
  gap: 12px;
  min-height: 180px;
  align-content: start;
}

.preview {
  display: flex;
  justify-content: center;
  padding-top: 4px;
}

.meta {
  display: grid;
  gap: 6px;
}

.name {
  font-size: 14px;
  letter-spacing: 0.2px;
}

.rarity {
  font-family: Sora, Inter, system-ui, sans-serif;
  letter-spacing: 1.4px;
  font-size: 11px;
  color: rgba(234, 234, 234, 0.65);
}

.rarity.r-rare {
  color: rgba(0, 245, 255, 0.86);
}
.rarity.r-epic {
  color: rgba(124, 58, 237, 0.9);
}
.rarity.r-legendary {
  color: rgba(247, 200, 75, 0.95);
}

.buy {
  justify-self: end;
}

/* Legendary shimmer (subtle, premium) */
.card:has(.rarity.r-legendary) {
  position: relative;
}
.card:has(.rarity.r-legendary)::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: var(--n-r-20);
  pointer-events: none;
  background: linear-gradient(
    110deg,
    transparent 0%,
    rgba(247, 200, 75, 0.08) 32%,
    transparent 55%
  );
  opacity: 0;
  transform: translateX(-18%);
  transition: opacity var(--n-med) var(--n-ease);
}
.card:has(.rarity.r-legendary):hover::after {
  opacity: 1;
  animation: shimmer 1.2s linear infinite;
}

@keyframes shimmer {
  to {
    transform: translateX(18%);
  }
}
</style>
