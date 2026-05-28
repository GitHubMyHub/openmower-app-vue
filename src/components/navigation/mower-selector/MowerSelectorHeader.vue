<script setup lang="ts">
withDefaults(
  defineProps<{ title?: string; subtitle?: string }>(),
  { title: 'Select Mower', subtitle: 'Choose which mower to control' },
)
</script>

<template>
  <div class="pa-4" style="border-bottom: 1px solid rgba(0, 0, 0, 0.08); user-select: none">
    <div class="text-subtitle-2 font-weight-bold">{{ title }}</div>
    <div class="text-caption text-medium-emphasis">{{ subtitle }}</div>
  </div>
</template>
