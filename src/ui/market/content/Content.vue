<template>
  <div class="content">
    <Card
      v-for="it in filteredItems"
      :key="it.name"
      :item="it"
      :category="it.category"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import Card from "./Card.vue";

const props = defineProps({
  category: { type: String, required: true },
});

const all = [
  { name: "Vanta Core", rarity: "common", category: "Skins" },
  { name: "Cyan Pulse", rarity: "rare", category: "Skins" },
  { name: "Nebula Shard", rarity: "epic", category: "Skins" },
  { name: "Aurum Singularity", rarity: "legendary", category: "Boosters" },
  { name: "Phantom Drift", rarity: "rare", category: "Boosters" },
  { name: "Nightglass", rarity: "common", category: "Boosters" },
  { name: "Void Bloom", rarity: "epic", category: "Abilities" },
  { name: "Solar Crown", rarity: "legendary", category: "Abilities" },
  { name: "Spectral Ion", rarity: "rare", category: "Abilities" },
  { name: "Collapse Field", rarity: "epic", category: "Loot Boxes" },
  { name: "Micro Warp", rarity: "rare", category: "Loot Boxes" },
  { name: "Phase Booster", rarity: "rare", category: "Premium" },
  { name: "Ion Booster", rarity: "common", category: "Premium" },
];

const items = computed(() =>
  all.map((i) => ({
    ...i,
    rarityTone:
      i.rarity === "rare"
        ? "cyan"
        : i.rarity === "epic"
          ? "purple"
          : i.rarity === "legendary"
            ? "ghost"
            : "ghost",
  })),
);

const filteredItems = computed(() =>
  items.value.filter((i) => i.category === props.category),
);
</script>

<style scoped>
.content {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
</style>
