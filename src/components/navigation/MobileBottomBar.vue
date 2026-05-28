<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useRoute, useRouter } from 'vue-router'
import { createNavigationItems } from './navigationItems'

const props = defineProps<{ onMenuOpen: () => void }>()
const route = useRoute()
const router = useRouter()
const { mdAndUp } = useDisplay()
const items = createNavigationItems()

const selectedIndex = computed(() => items.findIndex((i) => i.path === route.path))

function go(idx: number) {
  router.push(items[idx]!.path)
}
</script>

<template>
  <v-bottom-navigation
    v-if="!mdAndUp"
    grow
    class="om-mobile-bottom-bar"
    :model-value="selectedIndex"
    color="primary"
  >
    <v-btn icon @click="props.onMenuOpen()">
      <v-icon>mdi-menu</v-icon>
      <span class="text-caption">Menu</span>
    </v-btn>

    <v-btn v-for="(item, idx) in items" :key="item.path" :value="idx" @click="go(idx)">
      <v-icon>{{ item.icon }}</v-icon>
      <span class="text-caption">{{ item.label }}</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<style scoped>
.om-mobile-bottom-bar {
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -2px 12px -2px rgba(0, 0, 0, 0.2);
}
</style>
