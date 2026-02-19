<template>
  <div class="content">
    <Card
      v-for="it in items"
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
  items: { type: Array },
});
</script>

<style scoped>
.content {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
</style>
