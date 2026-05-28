<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useConfigStore } from '@/stores/config'
import MowerSelectorHeader from './MowerSelectorHeader.vue'
import MowerSelectorItem from './MowerSelectorItem.vue'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', id: string): void
}>()

const { mowerConfigs } = storeToRefs(useConfigStore())
</script>

<template>
  <v-dialog
    :model-value="props.modelValue"
    max-width="320"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="xl">
      <MowerSelectorHeader />
      <v-list>
        <MowerSelectorItem
          v-for="mower in mowerConfigs"
          :key="mower.id"
          :mower="mower"
          @click="emit('select', mower.id)"
        />
      </v-list>
    </v-card>
  </v-dialog>
</template>
