<template>
  <div class="game">
    <div class="world">
      <DemoWorldCanvas
        ref="world"
        @update:mass="mass = $event"
        @update:radarPings="radarPings = $event"
        @update:leaderboard="leaderboardRows = $event"
        @died="handleDeath"
        @update:bonus-counts="updateBonusCounts"
      />
      <div class="depth" aria-hidden="true" />
    </div>

    <div class="hud">
      <Menu class="menu" />
      <HudMass class="mass" :mass="mass" />
      <HudLeaderboard class="lb" :rows="leaderboardRows" />
      <HudRadar class="radar" :pings="radarPings" />

      <div class="abilities">
        <AbilityButton
          label="Split"
          hotkey="Space"
          tone="cyan"
          :cooldown="cooldowns.split"
          :icon="icons.split"
          @click="fire('split')"
        />
        <AbilityButton
          label="Eject"
          hotkey="F"
          tone="purple"
          :cooldown="cooldowns.eject"
          :icon="icons.eject"
          @click="fire('eject')"
        />
        <AbilityButton
          label="Special"
          hotkey="E / dbl"
          tone="purple"
          :cooldown="cooldowns.special"
          :icon="icons.special"
          @click="fire('special')"
          @dblclick.prevent="fire('specialTurbo')"
        />
        <!-- Spike с отображением количества -->
        <div class="bonus-wrapper">
          <AbilityButton
            label="Spike"
            hotkey="Q"
            tone="red"
            :cooldown="cooldowns.spike"
            :icon="icons.spike"
            @click="fire('spike')"
          />
          <span v-if="spikeCount > 0" class="bonus-count">{{
            spikeCount
          }}</span>
        </div>
        <!-- Freeze с отображением количества -->
        <div class="bonus-wrapper">
          <AbilityButton
            label="Freeze"
            hotkey="R"
            tone="blue"
            :cooldown="cooldowns.freeze"
            :icon="icons.freeze"
            @click="fire('freeze')"
          />
          <span v-if="freezeCount > 0" class="bonus-count">{{
            freezeCount
          }}</span>
        </div>
      </div>

      <div class="mobile">
        <button class="collapse" type="button" @click="showLb = !showLb">
          {{ showLb ? "HIDE" : "SHOW" }} LEADERBOARD
        </button>
      </div>

      <HudLeaderboard v-if="showLb" class="lbMobile" :rows="leaderboardRows" />
    </div>

    <!-- Модальное окно Game Over -->
    <GameOverModal
      :visible="gameOverVisible"
      :mass="lastMass"
      @restart="restartGame"
    />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import AbilityButton from "@/ui/ingame/AbilityButton.vue";
import HudLeaderboard from "@/ui/ingame/HudLeaderboard.vue";
import HudMass from "@/ui/ingame/HudMass.vue";
import HudRadar from "@/ui/ingame/HudRadar.vue";
import DemoWorldCanvas from "@/game/demo/DemoWorldCanvas.vue";
import Menu from "@/ui/ingame/Menu.vue";
import GameOverModal from "@/ui/ingame/GameOverModal.vue";

const router = useRouter();

const mass = ref(0);
const showLb = ref(false);
const world = ref(null);

const leaderboardRows = ref([]);
const radarPings = ref([]);

// Состояние модалки Game Over
const gameOverVisible = ref(false);
const lastMass = ref(0);

// Количества бонусов (пока константы для теста, позже будут приходить с сервера)
const spikeCount = ref(3);
const freezeCount = ref(2);

// Кулдауны способностей
const cooldowns = reactive({
  split: 0,
  eject: 0,
  special: 0,
  spike: 0,
  freeze: 0,
});

const icons = {
  split: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M7 7 4 4m13 3 3-3M7 17l-3 3m16-3 3 3" stroke="currentColor" stroke-width="1.2" opacity="0.7" stroke-linecap="round"/></svg>`,
  eject: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 19V6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M7 10l5-5 5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 19h12" stroke="currentColor" stroke-width="1.2" opacity="0.8"/></svg>`,
  special: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 2l2.3 6.2L21 10l-6.7 1.8L12 18l-2.3-6.2L3 10l6.7-1.8L12 2Z" stroke="currentColor" stroke-width="1.4"/><path d="M12 8.6 13 11l2.5.7-2.5.7-1 2.4-1-2.4-2.5-.7L11 11l1-2.4Z" fill="currentColor" opacity="0.8"/></svg>`,
  spike: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 2L4 8v8l8 6 8-6V8l-8-6z" stroke="currentColor" stroke-width="1.4"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.8"/></svg>`,
  freeze: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 2v20M2 12h20M4 4l16 16M20 4L4 20" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.6"/></svg>`,
};

function triggerCooldown(key, seconds) {
  cooldowns[key] = 1;
  const start = performance.now();
  const total = seconds * 1000;
  const step = (t) => {
    const k = Math.min(1, (t - start) / total);
    cooldowns[key] = 1 - k;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

let lastSpecialTap = 0;
function fire(key) {
  if (key === "split") {
    if (cooldowns.split > 0.01) return;
    world.value?.splitDash?.();
    triggerCooldown("split", 2.2);
    return;
  }
  if (key === "eject") {
    if (cooldowns.eject > 0.01) return;
    world.value?.eject?.();
    triggerCooldown("eject", 1.1);
    return;
  }
  if (key === "specialTurbo") {
    if (cooldowns.special > 0.01) return;
    world.value?.activateTurbo?.();
    triggerCooldown("special", 10);
    return;
  }
  if (key === "special") {
    if (cooldowns.special > 0.01) return;
    const now = performance.now();
    const dbl = now - lastSpecialTap < 320;
    lastSpecialTap = now;
    if (dbl) {
      world.value?.activateTurbo?.();
    } else {
      world.value?.activateShield?.();
    }
    triggerCooldown("special", 10);
    return;
  }
  // Spike: проверяем наличие бонусов
  if (key === "spike") {
    if (cooldowns.spike > 0.01) return;
    if (spikeCount.value <= 0) {
      console.warn("No spikes left");
      return;
    }
    world.value?.activateSpike?.();
    // Уменьшаем количество после успешного вызова (сервер подтвердит)
    spikeCount.value--;
    triggerCooldown("spike", 3);
    return;
  }
  // Freeze: проверяем наличие бонусов
  if (key === "freeze") {
    if (cooldowns.freeze > 0.01) return;
    if (freezeCount.value <= 0) {
      console.warn("No freezes left");
      return;
    }
    world.value?.activateFreeze?.();
    freezeCount.value--;
    triggerCooldown("freeze", 5);
    return;
  }
}

// Обработчик обновления количества бонусов от сервера (через событие из canvas)
function updateBonusCounts(data) {
  if (data.spike !== undefined) spikeCount.value = data.spike;
  if (data.freeze !== undefined) freezeCount.value = data.freeze;
}

function onKeyDown(e) {
  const tag = e.target?.tagName || "";
  if (tag === "INPUT" || tag === "TEXTAREA") return;

  if (e.code === "Space") {
    e.preventDefault();
    fire("split");
  } else if (e.key?.toLowerCase?.() === "f") {
    e.preventDefault();
    fire("eject");
  } else if (e.key?.toLowerCase?.() === "q") {
    e.preventDefault();
    fire("spike");
  } else if (e.key?.toLowerCase?.() === "r") {
    e.preventDefault();
    fire("freeze");
  } else if (e.key?.toLowerCase?.() === "e") {
    e.preventDefault();
    fire("special");
  }
}

function handleDeath(data) {
  console.log("Player died", data);
  lastMass.value = mass.value;
  gameOverVisible.value = true;
}

function restartGame() {
  gameOverVisible.value = false;
  world.value?.respawn?.();
}

onMounted(() => {
  window.addEventListener("keydown", onKeyDown, { passive: false });

  setTimeout(() => {
    world.value?.focusCanvas();
  }, 100);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeyDown);
});
</script>

<style scoped>
.game {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.world {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      900px 700px at 40% 30%,
      rgba(124, 58, 237, 0.14),
      transparent 62%
    ),
    radial-gradient(
      860px 660px at 70% 70%,
      rgba(0, 245, 255, 0.09),
      transparent 64%
    ),
    linear-gradient(160deg, rgba(5, 5, 5, 0.18), rgba(11, 11, 15, 0.1));
}

.depth {
  position: absolute;
  inset: -30%;
  background: radial-gradient(
    circle at 50% 50%,
    transparent 0%,
    rgba(0, 0, 0, 0.55) 68%
  );
  filter: blur(6px);
  pointer-events: none;
  opacity: 0.8;
}

.hud {
  position: relative;
  min-height: 100vh;
  pointer-events: none;
}

.mass {
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
}

.menu {
  position: absolute;
  top: 18px;
  left: 18px;
}

.lb {
  position: absolute;
  top: 18px;
  right: 18px;
}

.radar {
  position: absolute;
  left: 18px;
  bottom: 18px;
}

.abilities {
  position: absolute;
  right: 18px;
  bottom: 18px;
  display: grid;
  gap: 12px;
  justify-items: end;
}

.abilities :deep(button) {
  pointer-events: auto;
}

/* Обёртка для кнопки с бонусом */
.bonus-wrapper {
  position: relative;
  display: inline-block;
}

.bonus-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4444;
  color: white;
  font-size: 12px;
  font-weight: bold;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  z-index: 2;
}

.mobile {
  display: none;
}

.collapse {
  pointer-events: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(11, 11, 15, 0.6);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-radius: var(--n-r-pill);
  color: var(--n-text);
  font-family: Sora, Inter, system-ui, sans-serif;
  letter-spacing: 1.6px;
  font-size: 11px;
  padding: 10px 12px;
}

.lbMobile {
  display: none;
}

@media (max-width: 720px) {
  .lb {
    display: none;
  }
  .mobile {
    display: block;
    position: absolute;
    top: 14px;
    right: 14px;
    pointer-events: auto;
  }
  .lbMobile {
    display: block;
    position: absolute;
    top: 58px;
    right: 14px;
  }
  .abilities {
    right: 14px;
    bottom: 14px;
    gap: 10px;
  }
  .radar {
    left: 14px;
    bottom: 14px;
  }
}
</style>
