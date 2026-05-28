<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './sidebar/Sidebar.vue'
import MobileBottomBar from './MobileBottomBar.vue'

const mobileMenuOpen = ref(false)
</script>

<template>
  <Sidebar v-model:open="mobileMenuOpen" />
  <MobileBottomBar :on-menu-open="() => (mobileMenuOpen = true)" />
</template>
