<!-- GameOverModal.vue -->
<template>
  <Teleport to="body">
    <div v-if="visible" class="game-over-overlay">
      <div class="game-over-modal">
        <h2 class="title">Вы проиграли</h2>
        <p class="score">Ваша масса: {{ mass }}</p>
        <button class="restart-btn" @click="restart">Играть снова</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  visible: Boolean,
  mass: Number,
});

const emit = defineEmits(["restart"]);

const restart = () => emit("restart");
</script>

<style scoped>
.game-over-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  pointer-events: auto;
}
.game-over-modal {
  background: rgba(20, 20, 30, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 32px 48px;
  text-align: center;
  color: white;
  box-shadow: 0 0 30px rgba(0, 245, 255, 0.3);
}
.title {
  font-size: 32px;
  margin-bottom: 16px;
  color: #ff4d4d;
}
.score {
  font-size: 18px;
  margin-bottom: 24px;
  opacity: 0.8;
}
.restart-btn {
  background: linear-gradient(135deg, #00f5ff, #7c3aed);
  border: none;
  border-radius: 40px;
  padding: 12px 32px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.restart-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px #00f5ff;
}
</style>
