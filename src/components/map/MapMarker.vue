<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import maplibregl, { Marker, type Map } from 'maplibre-gl'
import type { Datum } from '@/stores/schemas'
import { datumToRelative, pointToAbsolute } from '@/utils/coordinates'

const EARTH_CIRCUMFERENCE_M = 40_075_016.686

function metersToPixels(meters: number, zoom: number, latDeg: number): number {
  const latRad = (latDeg * Math.PI) / 180
  const metersPerPx = (EARTH_CIRCUMFERENCE_M * Math.cos(latRad)) / (256 * Math.pow(2, zoom))
  return meters / metersPerPx
}

const props = defineProps<{
  map: Map | null
  position: { x: number; y: number }
  heading: number
  sizeM: number
  datum: Datum
  className?: string
}>()

const zoom = ref<number>(props.map?.getZoom() ?? 18)
const markerRef = ref<Marker | null>(null)
const elRef = ref<HTMLDivElement | null>(null)

const absPosition = computed(() => {
  const utmDatum = datumToRelative([props.datum.long, props.datum.lat])
  return pointToAbsolute(props.position, utmDatum)
})

const sizePx = computed(() =>
  Math.round(metersToPixels(props.sizeM, zoom.value, absPosition.value[1])),
)

// Convert mower heading (radians, 0 = east, CCW positive) to CSS rotation
const headingDeg = computed(() => 90 - (props.heading * 180) / Math.PI)

function onZoom() {
  if (props.map) zoom.value = props.map.getZoom()
}

onMounted(() => {
  if (!props.map || !elRef.value) return
  markerRef.value = new maplibregl.Marker({ element: elRef.value })
    .setLngLat(absPosition.value)
    .addTo(props.map)
  props.map.on('zoom', onZoom)
})

onBeforeUnmount(() => {
  props.map?.off('zoom', onZoom)
  markerRef.value?.remove()
})

watch(absPosition, (v) => markerRef.value?.setLngLat(v))
</script>

<template>
  <div
    ref="elRef"
    :class="className"
    :style="{
      width: sizePx + 'px',
      height: sizePx + 'px',
      transform: `rotate(${headingDeg}deg)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }"
  >
    <slot :size="sizePx" />
  </div>
</template>
