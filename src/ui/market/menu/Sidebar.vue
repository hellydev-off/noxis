<template>
  <aside class="sidebar">
    <GlassPanel class="sidePanel" padded>
      <div class="sideTitle n-title">MARKET</div>
      <div class="sideItems">
        <button
          v-for="c in categories"
          :key="c"
          type="button"
          class="sideItem"
          :class="{ active: modelValue === c }"
          @click="handleCategoryClick(c)"
        >
          {{ c }}
        </button>
      </div>
    </GlassPanel>
  </aside>
</template>

<script setup>
import { ref } from "vue";
import GlassPanel from "@/ui/primitives/GlassPanel.vue";

const categories = ["Skins", "Boosters", "Abilities", "Loot Boxes", "Premium"];

const emit = defineEmits(["update:category"]);

const handleCategoryClick = (c) => {
  emit("update:category", c);
};
</script>

<style scoped>
.sidePanel {
  position: sticky;
  top: calc(var(--n-topbarh) + var(--n-20));
}

.sideTitle {
  letter-spacing: 2.2px;
  font-size: 12px;
  color: var(--n-text-dim);
}

.sideItems {
  margin-top: 14px;
  display: grid;
  gap: 8px;
}

.sideItem {
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--n-r-16);
  padding: 10px 12px;
  cursor: pointer;
  color: rgba(234, 234, 234, 0.78);
  transition:
    transform var(--n-fast) var(--n-ease),
    border-color var(--n-fast) var(--n-ease),
    box-shadow var(--n-fast) var(--n-ease),
    color var(--n-fast) var(--n-ease);
}

.sideItem:hover {
  transform: translateY(-1px);
  color: var(--n-text);
  border-color: rgba(124, 58, 237, 0.22);
  box-shadow: var(--n-glow-purple);
}

.sideItem.active {
  color: var(--n-text);
  border-color: rgba(0, 245, 255, 0.22);
  box-shadow: var(--n-glow-cyan);
}
</style>
