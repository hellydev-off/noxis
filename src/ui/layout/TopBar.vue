<template>
  <header class="topbar">
    <div class="left">
      <button class="logo" type="button" @click="goHome">
        <span class="word">NOXIS</span>
        <span class="underline" />
      </button>
    </div>

    <div class="right">
      <div class="wallet">
        <div class="chip">
          <span class="label">CR</span>
          <span class="value">{{ player.currency }}</span>
        </div>
        <div class="chip cyan">
          <span class="label">EX</span>
          <span class="value">{{ player.premium }}</span>
        </div>
      </div>

      <button
        class="settings"
        type="button"
        @click="goSettings"
        aria-label="Settings"
      >
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
            stroke="currentColor"
            stroke-width="1.8"
          />
          <path
            d="M19.4 15a8 8 0 0 0 .1-1 8 8 0 0 0-.1-1l2-1.5-2-3.5-2.4.8a7.8 7.8 0 0 0-1.7-1L14.9 3h-4l-.4 2.8a7.8 7.8 0 0 0-1.7 1L6.4 6l-2 3.5 2 1.5a8 8 0 0 0-.1 1 8 8 0 0 0 .1 1l-2 1.5 2 3.5 2.4-.8c.5.4 1.1.8 1.7 1l.4 2.8h4l.4-2.8c.6-.2 1.2-.6 1.7-1l2.4.8 2-3.5-2-1.5Z"
            stroke="currentColor"
            stroke-width="1.2"
            opacity="0.8"
          />
        </svg>
      </button>
      <div>
        <button @click="goAuth">Логин</button>
      </div>

      <div class="profile">
        <div class="avatar" />
        <div class="meta">
          <div class="name">{{ player.username }}</div>
          <div class="level">
            <span class="badge">Lv {{ player.level }}</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from "vue-router";
import { player } from "@/ui/state/player";

const router = useRouter();
function goHome() {
  router.push({ name: "lobby" });
}
function goSettings() {
  router.push({ name: "settings" });
}

function goAuth() {
  router.push({ name: "auth" });
}
</script>

<style scoped>
.topbar {
  height: var(--n-topbarh);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--n-gutter);
}

.left,
.right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo {
  background: transparent;
  border: 0;
  padding: 10px 10px 10px 0;
  cursor: pointer;
  color: var(--n-text);
  position: relative;
}

.word {
  font-family: Sora, Inter, system-ui, sans-serif;
  letter-spacing: 3.5px;
  font-weight: 650;
  font-size: 15px;
}

.underline {
  position: absolute;
  left: 0;
  right: 25%;
  bottom: 6px;
  height: 2px;
  border-radius: var(--n-r-pill);
  background: linear-gradient(
    90deg,
    rgba(124, 58, 237, 0),
    rgba(124, 58, 237, 0.95),
    rgba(0, 245, 255, 0.65)
  );
  box-shadow: 0 0 18px rgba(124, 58, 237, 0.28);
  opacity: 0.85;
  transform-origin: left;
  animation: underline 2.8s var(--n-ease) infinite alternate;
}

@keyframes underline {
  from {
    transform: scaleX(0.72);
    opacity: 0.6;
  }
  to {
    transform: scaleX(1);
    opacity: 0.95;
  }
}

.wallet {
  display: flex;
  gap: 10px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: var(--n-r-pill);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(124, 58, 237, 0.18);
  box-shadow: 0 0 0 1px rgba(124, 58, 237, 0.1);
}

.chip.cyan {
  border-color: rgba(0, 245, 255, 0.16);
  box-shadow: 0 0 0 1px rgba(0, 245, 255, 0.1);
}

.label {
  font-family: Sora, Inter, system-ui, sans-serif;
  letter-spacing: 1.2px;
  font-size: 12px;
  color: var(--n-text-dim);
}

.value {
  font-variant-numeric: tabular-nums;
  font-size: 13.5px;
}

.settings {
  width: 40px;
  height: 40px;
  border-radius: var(--n-r-16);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition:
    transform var(--n-fast) var(--n-ease),
    box-shadow var(--n-fast) var(--n-ease),
    border-color var(--n-fast) var(--n-ease);
}

.settings svg {
  width: 18px;
  height: 18px;
}

.settings:hover {
  transform: translateY(-1px);
  border-color: rgba(124, 58, 237, 0.26);
  box-shadow: var(--n-glow-purple);
}

.profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--n-r-20);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background:
    radial-gradient(
      18px 18px at 30% 30%,
      rgba(255, 255, 255, 0.2),
      transparent 60%
    ),
    radial-gradient(
      24px 24px at 70% 80%,
      rgba(0, 245, 255, 0.1),
      transparent 62%
    ),
    rgba(255, 255, 255, 0.02);
  box-shadow: 0 0 0 1px rgba(0, 245, 255, 0.08);
}

.meta {
  display: grid;
  gap: 2px;
}

.name {
  font-size: 13.5px;
  letter-spacing: 0.2px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 3px 8px;
  border-radius: var(--n-r-pill);
  border: 1px solid rgba(124, 58, 237, 0.18);
  color: var(--n-text-dim);
  font-size: 12px;
}

@media (max-width: 720px) {
  .wallet {
    display: none;
  }
  .meta {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .underline {
    animation: none;
  }
}
</style>
