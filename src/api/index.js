import axios from "axios";

const api = axios.create({
  baseURL: "https://noxis-server-xmbj.onrender.com/api", // Замените на ваш URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Интерцептор для добавления токена к каждому запросу
api.interceptors.request.use(
  (config) => {
    // Достаем токен (из localStorage, Pinia или Vuex)
    const token = localStorage.getItem("user_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// (Опционально) Интерцептор для обработки ошибок (например, 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Например: разлогинить пользователя, если токен протух
      console.error("Сессия истекла");
    }
    return Promise.reject(error);
  },
);

export default api;
