import api from "../index";
import { toRaw } from "vue";

export const marketApi = {
  getItemsFromMarket(type) {
    return api.get("/market/all", {
      params: {
        type: type,
      },
    });
  },

  getUserInfo(id) {
    const user_id = localStorage.getItem("user_id");
    console.log(user_id);
    return api.get("/auth/user", {
      params: {
        user_id: user_id,
      },
    });
  },

  getMarketInfo() {
    return api.get("/market/overview");
  },

  getCoinInfo(coin, interval) {
    return api.get(`/market/coin/${coin}?interval=${interval}`);
  },

  getBotHistory(id) {
    return api.get("/bots/history", {
      params: {
        botId: id,
      },
    });
  },

  buyItem(item, userId) {
    return api.post("/market/buy", {
      itemData: item, // Извлекаем конкретный ID
      userId: userId,
    });
  },

  selectSkin(item, userId) {
    return api.post("/inventory/selectSkin", {
      itemData: item, // Извлекаем конкретный ID
      userId: userId,
    });
  },

  updateBot(data) {
    console.log("data", data);
    return api.post("/bots/edit/global", {
      botId: data.id,
      name: data.name,
      pair: data.pair,
      allocatedBalance: data.allocatedBalance,
      gridLevels: data.settings.gridLevels,
      lowerPrice: data.settings.lowerPrice,
      upperPrice: data.settings.upperPrice,
    });
  },

  onBotStatus(id) {
    return api.post(`/bots/${id}/start`);
  },

  offBotStatus(id) {
    return api.post(`/bots/${id}/stop`);
  },

  logout() {
    return api.post("/auth/logout");
  },
};
