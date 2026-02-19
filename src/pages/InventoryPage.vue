<template>
  <div class="page">
    <TopBar />

    <main class="main n-container">
      <div class="head">
        <div>
          <div class="h1 n-title">INVENTORY</div>
          <div class="sub n-subtle">Equip with intent.</div>
        </div>
        <Tabs v-model="currentTab" :tabs="tabs" />
      </div>

      <section class="grid">
        <div v-if="!userData" class="status-msg n-subtle">LOADING...</div>

        <template v-else>
          <InventoryCard
            v-for="item in filteredItems"
            :key="item.id"
            :item="item"
            :is-active="!!item.isActive"
            :loading="loadingId === item.id"
            @equip="handleSelectSkin"
          />

          <div v-if="filteredItems.length === 0" class="status-msg n-subtle">
            EMPTY CATEGORY
          </div>
        </template>
      </section>
    </main>

    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useUserStore } from "@/store/userStore";
import { marketApi } from "@/api/requests/bot";

import BottomNav from "@/ui/layout/BottomNav.vue";
import TopBar from "@/ui/layout/TopBar.vue";
import Tabs from "@/ui/primitives/Tabs.vue";
import InventoryCard from "@/ui/inventory/InventoryCard.vue";

const userStore = useUserStore();
const currentTab = ref("skin");
const loadingId = ref(null);

const tabs = [{ key: "skin", label: "Skins" }];

// 1. Получаем данные (учитываем возможную вложенность .user)
const userData = computed(
  () => userStore.getUserInfo?.user || userStore.getUserInfo,
);

// 2. Список предметов: фильтруем по категории
const filteredItems = computed(() => {
  const inv = userData.value?.inventory;
  if (!Array.isArray(inv)) return [];
  return inv.filter((it) => it.type === currentTab.value);
});

/**
 * Проверка isActive:
 * Больше не вызываем функцию isEquipped отдельно,
 * передаем в пропс :is-active="!!item.isActive" напрямую в шаблоне.
 */

// 3. Выбор (активация) скина
const handleSelectSkin = async (skinItem) => {
  const userId = userData.value?.user_id;

  // Если нет ID пользователя или скин уже активен — выходим
  if (!userId || skinItem.isActive) return;

  loadingId.value = skinItem.id;

  try {
    // Отправляем запрос на сервер
    const response = await marketApi.selectSkin(skinItem, userId);

    /**
     * Сервер должен вернуть обновленный объект пользователя,
     * где у выбранного скина isActive: true, а у остальных isActive: false.
     */
    if (response.data) {
      if (typeof userStore.setUserInfo === "function") {
        userStore.setUserInfo(response.data);
      } else {
        // Если метода нет, обновляем поле напрямую (зависит от твоей реализации стора)
        userStore.userInfo = response.data;
      }
      console.log("Inventory updated. Selected skin ID:", skinItem.id);
    }
  } catch (e) {
    console.error("Selection error:", e);
  } finally {
    loadingId.value = null;
  }
};
</script>

<style scoped>
/* Стили оставляем без изменений, они у тебя рабочие */
.page {
  min-height: 100vh;
  display: grid;
  grid-template-rows: var(--n-topbarh) 1fr var(--n-navh);
}
.main {
  padding: var(--n-24) 0;
  display: grid;
  gap: var(--n-16);
  align-content: start;
}
.head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--n-16);
  flex-wrap: wrap;
}
.h1 {
  font-size: 18px;
  letter-spacing: 1.6px;
  font-weight: 700;
  color: #fff;
}
.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--n-16);
  margin-top: 20px;
}
.status-msg {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
}

@media (max-width: 980px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 560px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
