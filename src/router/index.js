import { createRouter, createWebHistory } from "vue-router";

import LobbyPage from "@/pages/LobbyPage.vue";
import MarketPage from "@/pages/MarketPage.vue";
import RankingPage from "@/pages/RankingPage.vue";
import InventoryPage from "@/pages/InventoryPage.vue";
import ProfilePage from "@/pages/ProfilePage.vue";
import SettingsPage from "@/pages/SettingsPage.vue";
import InGamePage from "@/pages/InGamePage.vue";
import auth from "@/pages/auth.vue";

import Admin from "@/pages/admin/Admin.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "lobby", component: LobbyPage },
    { path: "/market", name: "market", component: MarketPage },
    { path: "/ranking", name: "ranking", component: RankingPage },
    { path: "/inventory", name: "inventory", component: InventoryPage },
    { path: "/profile", name: "profile", component: ProfilePage },
    { path: "/settings", name: "settings", component: SettingsPage },
    { path: "/ingame", name: "ingame", component: InGamePage },
    { path: "/auth", name: "auth", component: auth },
    { path: "/admin", name: "Admin", component: Admin },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
