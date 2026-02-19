<template>
  <div class="page">
    <TopBar />

    <main class="main n-container">
      <div class="grid">
        <Sidebar @update:category="handleCategoryChange" />

        <section class="content">
          <div class="header">
            <div>
              <div class="h1 n-title">{{ category }}</div>
              <div class="sub n-subtle">Clean drops. No clutter.</div>
            </div>
          </div>

          <div>
            <Content :items="items" :category="category" />
          </div>
        </section>
      </div>
    </main>

    <BottomNav />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import BottomNav from "@/ui/layout/BottomNav.vue";
import TopBar from "@/ui/layout/TopBar.vue";
import Sidebar from "@/ui/market/menu/Sidebar.vue";
import Content from "@/ui/market/content/Content.vue";

import { marketApi } from "@/api/requests/bot";

const category = ref("Skins");

const handleCategoryChange = (c) => {
  category.value = c;
};

const items = ref([]);
const loading = ref(true);

const getItems = async () => {
  try {
    const { data } = await marketApi.getItemsFromMarket("skin");

    items.value = data;
  } catch (error) {
    console.error("Ошибка:", error);
  }
};

onMounted(getItems);
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: grid;
  grid-template-rows: var(--n-topbarh) 1fr var(--n-navh);
}

.main {
  padding-top: var(--n-24);
  padding-bottom: var(--n-24);
}

.grid {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: var(--n-20);
  align-items: start;
}

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

.header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: var(--n-16);
}

.h1 {
  font-size: 18px;
  letter-spacing: 1.6px;
}

.sub {
  margin-top: 6px;
  font-size: 13px;
}

.items {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--n-16);
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

@media (max-width: 980px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .sidePanel {
    position: relative;
    top: unset;
  }
  .items {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .items {
    grid-template-columns: 1fr;
  }
}
</style>
