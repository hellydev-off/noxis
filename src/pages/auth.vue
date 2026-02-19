<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="tabs">
        <button :class="{ active: mode === 'login' }" @click="mode = 'login'">
          Login
        </button>
        <button
          :class="{ active: mode === 'register' }"
          @click="mode = 'register'"
        >
          Register
        </button>
      </div>

      <form class="auth-form" @submit.prevent="submit">
        <h2>{{ mode === "login" ? "Login" : "Register" }}</h2>

        <div>
          <label>Username</label>
          <input v-model="username" type="text" required />
        </div>

        <button type="submit" :disabled="loading">
          {{
            loading
              ? mode === "login"
                ? "Logging in..."
                : "Registering..."
              : mode === "login"
                ? "Login"
                : "Register"
          }}
        </button>

        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const mode = ref("login"); // 'login' или 'register'
const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

async function submit() {
  loading.value = true;
  error.value = "";

  const url = mode.value === "login" ? "/api/login" : "/api/register";
  const body = { username: username.value };

  try {
    const res = await fetch("https://noxis-server-xmbj.onrender.com" + url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      if (mode.value === "login" && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        router.push("/");
      } else if (mode.value === "register" && data.success) {
        alert("Registration successful!");
        mode.value = "login";
      }
    } else {
      error.value =
        data.error ||
        (mode.value === "login" ? "Login failed" : "Registration failed");
    }
  } catch (err) {
    error.value = "Network error";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.auth-container {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 360px;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

.tabs button {
  flex: 1;
  padding: 10px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.tabs button.active {
  color: #007bff;
  border-bottom: 2px solid #007bff;
}

.auth-form div {
  margin-bottom: 12px;
}

.auth-form label {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  color: #333;
}

.auth-form input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.auth-form button {
  width: 100%;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.error {
  color: red;
  margin-top: 8px;
  font-size: 13px;
}
</style>
