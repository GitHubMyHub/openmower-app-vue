<script setup lang="ts">
import { computed } from 'vue'
import type { Map } from 'maplibre-gl'
import type { Datum } from '@/stores/schemas'
import { useMowersStore } from '@/stores/mowers'
import MapMarker from './MapMarker.vue'
import { MOWER_LENGTH_M } from './constants'

const props = defineProps<{ map: Map | null; datum: Datum; isDocked: boolean }>()
const store = useMowersStore()
const pose = computed(() => store.selectedMower?.state.pose)
const position = computed(() => (pose.value ? { x: pose.value.x, y: pose.value.y } : null))
const markerColor = computed(() =>
  pose.value && pose.value.pos_accuracy === 0 ? '#F44336' : '#4CAF50',
)
</script>

<template>
  <MapMarker
    v-if="position && pose && !props.isDocked"
    :map="props.map"
    :position="position"
    :heading="pose.heading"
    :size-m="MOWER_LENGTH_M"
    :datum="props.datum"
    class-name="mower-marker"
  >
    <template #default="{ size }">
      <svg :width="size" :height="size" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16 3 L26 29 L16 23 L6 29 Z"
          :fill="markerColor"
          stroke="#fff"
          stroke-width="2"
          stroke-linejoin="round"
        />
      </svg>
    </template>
  </MapMarker>
</template>
