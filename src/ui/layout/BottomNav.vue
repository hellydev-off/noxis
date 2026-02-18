<template>
  <nav class="nav">
    <RouterLink v-for="i in items" :key="i.to.name" class="item" :to="i.to">
      <span class="icon" v-html="i.icon" />
      <span class="label">{{ i.label }}</span>
      <span class="activeLine" />
    </RouterLink>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'

const items = [
  {
    label: 'Home',
    to: { name: 'lobby' },
    icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5Z" stroke="currentColor" stroke-width="1.6"/></svg>`,
  },
  {
    label: 'Market',
    to: { name: 'market' },
    icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M6 7h15l-1.4 7.2a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.6L6 7Z" stroke="currentColor" stroke-width="1.6"/><path d="M6 7 5 4H2" stroke="currentColor" stroke-width="1.6"/><path d="M9 20a1.2 1.2 0 1 0 0-2.4A1.2 1.2 0 0 0 9 20ZM18 20a1.2 1.2 0 1 0 0-2.4A1.2 1.2 0 0 0 18 20Z" fill="currentColor" opacity="0.8"/></svg>`,
  },
  {
    label: 'Ranking',
    to: { name: 'ranking' },
    icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M7 21V11h4v10H7Zm6 0V7h4v14h-4ZM5 21H3V13h2v8Zm16 0h-2V9h2v12Z" fill="currentColor" opacity="0.9"/></svg>`,
  },
  {
    label: 'Inventory',
    to: { name: 'inventory' },
    icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7Z" stroke="currentColor" stroke-width="1.6"/><path d="M8 7a4 4 0 0 1 8 0" stroke="currentColor" stroke-width="1.6"/></svg>`,
  },
  {
    label: 'Profile',
    to: { name: 'profile' },
    icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 12a4.2 4.2 0 1 0 0-8.4A4.2 4.2 0 0 0 12 12Z" stroke="currentColor" stroke-width="1.6"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0" stroke="currentColor" stroke-width="1.6"/></svg>`,
  },
]
</script>

<style scoped>
.nav {
  height: var(--n-navh);
  position: sticky;
  bottom: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: stretch;
  gap: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(11, 11, 15, 0.62);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.item {
  position: relative;
  display: grid;
  place-items: center;
  gap: 5px;
  padding: 10px 8px 14px;
  color: rgba(234, 234, 234, 0.68);
  transition:
    color var(--n-fast) var(--n-ease),
    transform var(--n-fast) var(--n-ease);
}

.icon :deep(svg) {
  width: 18px;
  height: 18px;
}

.label {
  font-size: 11px;
  letter-spacing: 0.7px;
  font-family: Sora, Inter, system-ui, sans-serif;
}

.activeLine {
  position: absolute;
  left: 20%;
  right: 20%;
  bottom: 10px;
  height: 2px;
  border-radius: var(--n-r-pill);
  opacity: 0;
  background: linear-gradient(90deg, rgba(124, 58, 237, 0.0), rgba(124, 58, 237, 0.9), rgba(0, 245, 255, 0.7));
  box-shadow: 0 0 16px rgba(124, 58, 237, 0.24);
  transform: scaleX(0.85);
  transition:
    opacity var(--n-fast) var(--n-ease),
    transform var(--n-fast) var(--n-ease);
}

.item.router-link-active {
  color: var(--n-text);
}

.item.router-link-active .activeLine {
  opacity: 1;
  transform: scaleX(1);
}

.item:hover {
  color: var(--n-text);
  transform: translateY(-1px);
}

@media (max-width: 560px) {
  .nav {
    height: 86px;
  }
  .item {
    padding-bottom: 18px;
  }
}
</style>

