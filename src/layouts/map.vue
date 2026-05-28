<script setup lang="ts">
/**
 * Map layout — equivalent to the original `src/app/map/layout.tsx`.
 *
 * The original wrapped the route in MapContextProvider + RMapContextProvider.
 * In the Vue port we use the Pinia `map` store as a global singleton, so no
 * extra wrapper is required — this layout exists for parity and so we can
 * inject map-specific UI/styles later.
 */
import Navigation from '@/components/navigation/Navigation.vue'
</script>

<template>
  <Navigation />
  <v-main class="om-main map-main">
    <router-view />
  </v-main>
</template>

<style scoped>
.map-main {
  height: 100dvh;
  padding-bottom: 64px;
}
@media (min-width: 960px) {
  .map-main {
    padding-bottom: 0;
  }
}
</style>
