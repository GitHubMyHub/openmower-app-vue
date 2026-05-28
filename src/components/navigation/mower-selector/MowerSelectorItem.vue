<script setup lang="ts">
import type { MowerConfig } from '@/types'
defineProps<{ mower: MowerConfig }>()
</script>

<template>
  <v-list-item link>
    <v-list-item-title class="font-weight-medium">{{ mower.name }}</v-list-item-title>
    <v-list-item-subtitle v-if="mower.description">{{ mower.description }}</v-list-item-subtitle>
  </v-list-item>
</template>
