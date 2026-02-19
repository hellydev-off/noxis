<template>
  <div class="market-form">
    <h2>Добавить новый предмет</h2>
    <form @submit.prevent="handleSubmit">
      <div class="field">
        <label>Название:</label>
        <input
          v-model="form.title"
          type="text"
          required
          placeholder="Dragon Lore"
        />
      </div>

      <div class="field">
        <label>Тип:</label>
        <input v-model="form.type" type="text" required placeholder="Weapon" />
      </div>

      <div class="field">
        <label>Цена:</label>
        <input
          v-model="form.price"
          type="number"
          required
          placeholder="price"
        />
      </div>

      <div class="field">
        <label>Редкость:</label>
        <select v-model="form.rarity">
          <option value="common">Common</option>
          <option value="rare">Rare</option>
          <option value="legendary">Legendary</option>
        </select>
      </div>

      <div class="field">
        <label>Изображение:</label>
        <input
          type="file"
          @change="handleFileChange"
          accept="image/*"
          required
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? "Сохранение..." : "Создать позицию" }}
      </button>
    </form>

    <p v-if="message" :class="{ error: isError }">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import axios from "axios";

// Состояние формы
const form = reactive({
  title: "",
  type: "",
  price: null,
  rarity: "common",
});

const selectedFile = ref(null);
const loading = ref(false);
const message = ref("");
const isError = ref(false);

// Обработка выбора файла
const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0];
};

// Отправка данных
const handleSubmit = async () => {
  loading.value = true;
  message.value = "";

  try {
    // Важно: создаем FormData для передачи файла
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("type", form.type);
    formData.append("rarity", form.rarity);
    formData.append("price", form.price);
    formData.append("image", selectedFile.value);

    // Если в data есть доп. поля, их тоже можно добавить:
    // formData.append('data', JSON.stringify({ power: 100 }));

    const response = await axios.post(
      "http://localhost:3000/api/admin/market/create",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    message.value = "Товар успешно добавлен!";
    isError.value = false;

    resetForm();
  } catch (error) {
    console.error(error);
    message.value =
      "Ошибка при сохранении: " +
      (error.response?.data?.message || error.message);
    isError.value = true;
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.title = "";
  form.type = "";
  form.rarity = "common";
  selectedFile.value = null;
};
</script>

<style scoped>
.market-form {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.field {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}
input,
select {
  padding: 8px;
  margin-top: 5px;
}
button {
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  cursor: pointer;
}
button:disabled {
  background-color: #ccc;
}
.error {
  color: red;
}
</style>

<!-- <template>
  <div class="market-list">
    <h3>Список товаров в маркете</h3>

    <div v-if="loading">Загрузка...</div>

    <table v-else border="1">
      <thead>
        <tr>
          <th>Превью</th>
          <th>Название</th>
          <th>Тип</th>
          <th>Редкость</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td>
            <img :src="`http://localhost:3000${item.imageUrl}`" width="50" />
          </td>
          <td>{{ item.title }}</td>
          <td>{{ item.type }}</td>
          <td>{{ item.rarity }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const items = ref([]);
const loading = ref(true);

const fetchItems = async () => {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/admin/market/all",
    );
    items.value = response.data;
  } catch (error) {
    console.error("Ошибка при получении списка:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchItems);
</script> -->
