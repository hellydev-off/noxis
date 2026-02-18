<template>
  <AppShell>
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </AppShell>
</template>

<script setup>
import { RouterView } from 'vue-router'
import AppShell from '@/ui/layout/AppShell.vue'
</script>