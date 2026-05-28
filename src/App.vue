<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useConfigStore } from '@/stores/config'
import { useMowersStore } from '@/stores/mowers'
import { loadAppConfig } from '@/lib/actions'

const theme = useTheme()
const configStore = useConfigStore()
const mowersStore = useMowersStore()

function syncTheme(isDark: boolean) {
  theme.global.name.value = isDark ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  document.body.style.background = isDark ? '#121212' : '#fafafa'
}

onMounted(async () => {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  syncTheme(mq.matches)
  mq.addEventListener('change', (e) => syncTheme(e.matches))

  try {
    const config = await loadAppConfig()
    configStore.setConfig(config)
    mowersStore.loadMowers()
  } catch (err) {
    console.error('Failed to load app config', err)
  }
})
</script>

<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<style lang="scss">
html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}
</style>
