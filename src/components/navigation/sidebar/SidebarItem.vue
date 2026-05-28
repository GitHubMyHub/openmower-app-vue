<script setup lang="ts">
import type { NavigationItem } from '@/types'

const props = defineProps<{
  item: NavigationItem
  isActive: boolean
}>()
const emit = defineEmits<{ (e: 'click', path: string): void }>()
</script>

<template>
  <v-list-item
    :active="props.isActive"
    color="primary"
    rounded="lg"
    class="mx-2"
    :prepend-icon="props.item.icon"
    :title="props.item.label"
    @click="emit('click', props.item.path)"
  />
</template>
