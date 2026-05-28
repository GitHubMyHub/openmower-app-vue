<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useConfigStore } from '@/stores/config'
import { useMowersStore } from '@/stores/mowers'
import SidebarHeader from './SidebarHeader.vue'
import SidebarItem from './SidebarItem.vue'
import SelectedMower from './SelectedMower.vue'
import MowerSelector from '../mower-selector/MowerSelector.vue'
import { createNavigationItems } from '../navigationItems'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'update:open', value: boolean): void }>()

const { mdAndUp } = useDisplay()
const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const mowersStore = useMowersStore()
const { mowerConfigs } = storeToRefs(configStore)

const items = createNavigationItems()
const showMowerSelector = ref(false)

const selectedMower = computed(() =>
  mowerConfigs.value.find((m) => m.id === mowersStore.selectedMower?.id),
)

function handleNavigation(path: string) {
  router.push(path)
  emit('update:open', false)
}

function handleMowerSelect(id: string) {
  mowersStore.selectMower(id)
  showMowerSelector.value = false
}
</script>

<template>
  <!-- Permanent drawer on desktop, temporary on mobile -->
  <v-navigation-drawer
    :model-value="mdAndUp || props.open"
    :permanent="mdAndUp"
    :temporary="!mdAndUp"
    width="280"
    class="om-sidebar"
    @update:model-value="emit('update:open', $event)"
  >
    <div class="d-flex flex-column" style="height: 100%; user-select: none">
      <SidebarHeader />
      <div class="flex-grow-1" style="overflow: auto">
        <v-list nav density="comfortable" class="py-1">
          <SidebarItem
            v-for="item in items"
            :key="item.path"
            :item="item"
            :is-active="route.path === item.path"
            @click="handleNavigation"
          />
        </v-list>
      </div>
      <SelectedMower
        v-if="mowerConfigs.length > 1 && selectedMower"
        :selected-mower="selectedMower"
        @open="showMowerSelector = true"
      />
    </div>
  </v-navigation-drawer>

  <MowerSelector v-model="showMowerSelector" @select="handleMowerSelect" />
</template>

<style scoped lang="scss">
.om-sidebar :deep(.v-navigation-drawer__content) {
  border-radius: 0 24px 24px 0;
}
</style>
