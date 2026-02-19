<template>
  <GlassPanel :class="{ 'is-active': isActive }" class="card" interactive>
    <div class="preview-container" :class="item.rarity">
      <div class="id-ribbon">#{{ item.id }}</div>

      <div class="glow-base" :class="`glow-${item.rarity}`"></div>

      <img
        :src="`http://localhost:3000${item.imageUrl}`"
        class="main-img"
        :alt="item.title"
      />

      <div class="rarity-pill" :class="item.rarity">
        {{ item.rarity.toUpperCase() }}
      </div>
    </div>

    <div class="content">
      <div class="bottom-info">
        <h3 class="item-name">{{ item.title }}</h3>
        <NeonButton
          size="sm"
          :tone="isActive ? 'cyan' : 'ghost'"
          :loading="loading"
          :disabled="isActive || loading"
          @click="$emit('equip', item)"
        >
          {{ isActive ? "EQUIPPED" : "EQUIP" }}
        </NeonButton>
      </div>
    </div>
  </GlassPanel>
</template>

<script setup>
import GlassPanel from "@/ui/primitives/GlassPanel.vue";
import NeonButton from "@/ui/primitives/NeonButton.vue";
import OrbPreview from "@/ui/visual/OrbPreview.vue";

defineProps({
  item: Object,
  isActive: Boolean,
  loading: Boolean,
});

defineEmits(["equip"]);
</script>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 24px;
  /* Убираем отсюда overflow: hidden, чтобы лента ID могла "дышать" */
  transition: all 0.3s ease;
}

.preview-container {
  position: relative;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  border-radius: 20px;
  overflow: hidden;
  z-index: 1;
  contain: paint;
}

.id-ribbon {
  position: absolute;
  top: 10px;
  right: -32px;
  width: 110px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  text-align: center;
  padding: 4px 0;
  transform: rotate(45deg);
  z-index: 10;
  backdrop-filter: blur(4px);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.main-img {
  width: 100px;
  height: 100px;
  object-fit: contain;
  z-index: 5; /* Картинка выше свечения */
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.6));
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.glow-base {
  position: absolute;
  width: 100px;
  height: 100px;
  filter: blur(40px);
  opacity: 0.15;
  z-index: 2; /* Свечение за картинкой */
  transition: all 0.5s ease;
  pointer-events: none; /* Чтобы не мешало кликам */
}

/* Исправленная логика сияния при наведении на кнопку */
.card:has(.buy-btn:hover) .glow-base {
  opacity: 0.7;
  transform: scale(
    2.2
  ); /* Увеличиваем масштаб, но overflow: hidden его обрежет */
  filter: blur(35px);
  animation: pulse-glow 1.5s infinite alternate;
}

@keyframes pulse-glow {
  0% {
    transform: scale(2);
    opacity: 0.5;
  }
  100% {
    transform: scale(2.5);
    opacity: 0.8;
  }
}

/* Остальные стили оставляем без изменений */
.glow-common {
  background: #7ccb68;
}
.glow-rare {
  background: #00d9ff;
}
.glow-legendary {
  background: #ffae00;
}
.glow-epic {
  background: #bc61ff;
}

.rarity-pill {
  position: absolute;
  bottom: 12px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 900;
  color: #000;
  z-index: 6;
}

.rarity-pill.common {
  background: #7ccb68;
}
.rarity-pill.rare {
  background: #00d9ff;
}
.rarity-pill.legendary {
  background: #ffae00;
}
.rarity-pill.epic {
  background: #bc61ff;
}

.item-name {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.bottom-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-tag {
  display: flex;
  align-items: center;
  font-weight: 800;
  color: #4ade80;
}

.buy-btn {
  width: 100%;
  border-radius: 14px;
  font-weight: 800;
  cursor: pointer;
}
</style>
