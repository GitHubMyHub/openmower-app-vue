<script setup lang="ts">
import { computed } from 'vue'
import type { Map } from 'maplibre-gl'
import type { Datum } from '@/stores/schemas'
import MapMarker from './MapMarker.vue'
import { DOCK_SIZE_M } from './constants'

const props = withDefaults(
  defineProps<{
    map: Map | null
    station: { position: { x: number; y: number }; heading: number }
    datum: Datum
    isDocked?: boolean
  }>(),
  { isDocked: false },
)

const opacity = computed(() => (props.isDocked ? 0.6 : 0.3))
</script>

<template>
  <MapMarker
    :map="props.map"
    :position="props.station.position"
    :heading="props.station.heading"
    :size-m="DOCK_SIZE_M"
    :datum="props.datum"
    class-name="docking-station-marker"
  >
    <template #default="{ size }">
      <svg :width="size" :height="size" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16 2 L30 14 L26 14 L26 29 L6 29 L6 14 L2 14 Z"
          fill="#F5A523"
          :fill-opacity="opacity"
          stroke="#F5A523"
          stroke-width="1.5"
          :stroke-opacity="opacity"
          stroke-linejoin="round"
        />
        <path
          d="M7.5 13.75 L24.5 13.75 M13 28 L13 22 L19 22 L19 28"
          stroke="#F5A523"
          stroke-width="0.75"
          :stroke-opacity="opacity"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </template>
  </MapMarker>
</template>
