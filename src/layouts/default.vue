<script setup lang="ts">
import Navigation from '@/components/navigation/Navigation.vue'
</script>

<template>
  <Navigation />
  <v-main class="om-main">
    <router-view />
  </v-main>
</template>

<style scoped>
.om-main {
  min-height: 100dvh;
  overflow: auto;
  padding-bottom: 64px;
}
@media (min-width: 960px) {
  .om-main {
    padding-bottom: 0;
  }
}
</style>
