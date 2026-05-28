<script setup lang="ts">
import { useTheme } from 'vuetify'
const theme = useTheme()
const isDark = theme.global.current.value.dark
</script>

<template>
  <div class="sidebar-header" :class="{ dark: isDark }">
    <img src="/logo.svg" width="230" height="70" alt="OpenMower" />
  </div>
</template>

<style scoped lang="scss">
.sidebar-header {
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  text-align: center;
  padding-right: 16px;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
}
</style>
