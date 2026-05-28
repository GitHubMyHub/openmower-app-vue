<script setup lang="ts">
defineProps<{ icon: string; value: string | number; label: string }>()
</script>

<template>
  <div class="d-flex align-center ga-3">
    <v-avatar size="48" color="rgba(255,255,255,0.2)">
      <v-icon color="white">{{ icon }}</v-icon>
    </v-avatar>
    <div>
      <div class="text-h4 font-weight-bold">{{ value }}</div>
      <div class="text-body-2" style="opacity: 0.8">{{ label }}</div>
    </div>
  </div>
</template>
