<script setup lang="ts">
import type { MowerConfig } from '@/types'

const props = defineProps<{ selectedMower: MowerConfig }>()
const emit = defineEmits<{ (e: 'open'): void }>()
</script>

<template>
  <div class="pa-4" style="border-top: 1px solid rgba(0, 0, 0, 0.08)">
    <div class="text-overline text-medium-emphasis font-weight-bold mb-1">Active Mower</div>
    <div class="d-flex align-center" style="cursor: pointer" @click="emit('open')">
      <v-avatar color="primary" size="40" class="me-3">
        <v-icon size="small">mdi-robot-mower</v-icon>
      </v-avatar>
      <div class="flex-grow-1 text-truncate">
        <div class="text-body-2 font-weight-bold text-truncate">{{ props.selectedMower.name }}</div>
      </div>
      <v-icon color="primary">mdi-chevron-down</v-icon>
    </div>
  </div>
</template>
