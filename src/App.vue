<template>
  <AppShell>
    <RouterView v-if="userStore.isLoaded" v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>

    <div v-else class="app-loader">Загрузка профиля...</div>
  </AppShell>
</template>

<script setup>
import { onBeforeMount } from "vue";
import { RouterView } from "vue-router";
import AppShell from "@/ui/layout/AppShell.vue";
import { useUserStore } from "@/store/userStore"; // Путь к вашему файлу стора

const userStore = useUserStore();

onBeforeMount(async () => {
  await userStore.fetchUser();
});
</script>

<style scoped>
.app-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* Ваши стили для анимации transition name="page" */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
