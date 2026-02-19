import { defineStore } from "pinia";
import { marketApi } from "@/api/requests/bot";

export const useUserStore = defineStore("user", {
  state: () => ({
    user_id: "",
    first_name: "",
    language_code: "",
    username: "",
    balance: 100000,
    level: 1,
    inventory: [],
    activeSkin: [],
    isLoaded: false, // Флаг для отслеживания загрузки
  }),
  getters: {
    getUserInfo: (state) => ({
      user_id: state.user_id,
      first_name: state.first_name,
      username: state.username,
      balance: state.balance,
      inventory: state.inventory,
      activeSkin: state.activeSkin,
    }),
  },

  actions: {
    setUserInfo(data) {
      ((this.user_id = data.user_id),
        (this.first_name = data.first_name),
        (this.username = data.username),
        (this.balance = data.balance),
        (this.inventory = data.inventory),
        (this.activeSkin = data.activeSkin));
    },
    async fetchUser() {
      try {
        const { data } = await marketApi.getUserInfo();

        ((this.user_id = data.user.user_id),
          (this.first_name = data.user.first_name),
          (this.language_code = data.user.language_code),
          (this.username = data.user.username),
          (this.inventory = data.user.inventory),
          (this.isLoaded = true));
      } catch (error) {
        console.error("Ошибка при загрузке пользователя:", error);
      }
    },
  },
});
