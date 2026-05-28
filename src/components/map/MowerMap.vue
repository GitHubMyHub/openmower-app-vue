<script setup lang="ts">
/**
 * MowerMap.vue
 *
 * Renders the mower's map using maplibre-gl. Compared to the original Next.js
 * implementation this is a display-first port: areas/docking stations/mower
 * pose are drawn live, but the full MapboxDraw editor workflow is intentionally
 * simplified — the original React code relied heavily on @mapbox/mapbox-gl-draw
 * with React-only state machines and dialogs. Edit mode is exposed as a toggle
 * but no draw control is wired up yet.
 */
import { computed, onBeforeUnmount, onMounted, shallowRef, ref, watch } from 'vue'
import maplibregl, { type Map, type StyleSpecification } from 'maplibre-gl'
import { storeToRefs } from 'pinia'
import { useTheme, useDisplay } from 'vuetify'
import type { Feature, Polygon } from 'geojson'
import { area as turfArea } from '@turf/area'
import { featureCollection } from '@turf/helpers'

import type { AreaProps, MapData } from '@/stores/schemas'
import { useMapStore } from '@/stores/map'
import { useMowersStore } from '@/stores/mowers'
import { mapToFeatures } from '@/utils/area-converter'
import { mapStyles } from './mapStyles'
import MowerMarker from './MowerMarker.vue'
import DockingStationMarker from './DockingStationMarker.vue'

const props = defineProps<{ mapData: MapData; saveMapToMower: () => Promise<void> }>()

const containerRef = ref<HTMLDivElement | null>(null)
const map = shallowRef<Map | null>(null)
const showSatelliteLayer = ref(false)

const theme = useTheme()
const { mdAndUp } = useDisplay()
const showAreaList = ref(mdAndUp.value)

const mapStore = useMapStore()
const { editMode, features } = storeToRefs(mapStore)
const mowersStore = useMowersStore()
const isDocked = computed(() => mowersStore.selectedMower?.state.is_charging ?? false)

const areas = computed(
  () =>
    features.value.features.filter(
      (f) => f.geometry.type === 'Polygon',
    ) as Feature<Polygon, AreaProps>[],
)
const workingAreas = computed(() => areas.value.filter((a) => a.properties.type === 'mow'))
const totalWorkingArea = computed(() => turfArea(featureCollection(workingAreas.value)))

defineExpose({ areas, workingAreas, totalWorkingArea })

// Init map -------------------------------------------------------------------
onMounted(() => {
  if (!containerRef.value) return
  const style = mapStyles[showSatelliteLayer.value ? 'satellite' : 'white'] as StyleSpecification
  map.value = new maplibregl.Map({
    container: containerRef.value,
    style,
    center: [mapStore.datum.long, mapStore.datum.lat],
    zoom: 18,
    maxZoom: 25,
    pitchWithRotate: false,
    dragRotate: false,
    attributionControl: false,
  })
  map.value.touchZoomRotate.disableRotation()
  map.value.addControl(new maplibregl.FullscreenControl(), 'top-right')
  map.value.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

  map.value.on('load', () => updateAreasLayer())
})

onBeforeUnmount(() => {
  map.value?.remove()
  map.value = null
})

// Style switching ------------------------------------------------------------
watch(showSatelliteLayer, (val) => {
  if (!map.value) return
  map.value.setStyle(mapStyles[val ? 'satellite' : 'white'] as StyleSpecification)
  map.value.once('styledata', () => updateAreasLayer())
})

// Sync the visible areas with the store's feature collection -----------------
function updateAreasLayer() {
  const m = map.value
  if (!m) return
  const data = mapToFeatures(props.mapData)

  if (m.getSource('areas')) {
    ;(m.getSource('areas') as maplibregl.GeoJSONSource).setData(data)
  } else {
    m.addSource('areas', { type: 'geojson', data })
    m.addLayer({
      id: 'areas-fill',
      type: 'fill',
      source: 'areas',
      paint: {
        'fill-color': [
          'match',
          ['get', 'type'],
          'mow',
          '#4CAF50',
          'nav',
          '#2196F3',
          'obstacle',
          '#F44336',
          /* other */ '#9E9E9E',
        ],
        'fill-opacity': 0.35,
      },
    })
    m.addLayer({
      id: 'areas-outline',
      type: 'line',
      source: 'areas',
      paint: { 'line-color': '#ffffff', 'line-width': 2 },
    })
  }

  // Update the store-held collection (display-only)
  mapStore.setFeatures(data, false)
}

watch(
  () => props.mapData,
  () => {
    updateAreasLayer()
    fitToBounds()
  },
  { deep: true },
)

watch(
  () => mapStore.datum,
  (d) => {
    map.value?.setCenter([d.long, d.lat])
  },
)

// Bounds ---------------------------------------------------------------------
function fitToBounds() {
  const m = map.value
  if (!m) return
  const b = mapStore.bounds
  m.fitBounds(b as [number, number, number, number], {
    padding: { top: 10, bottom: 10, left: 60, right: showAreaList.value ? 390 : 60 },
    duration: 0,
    maxZoom: 22,
  })
}

function toggleEditMode() {
  mapStore.setEditMode(!mapStore.editMode)
}

async function save() {
  await props.saveMapToMower()
}
</script>

<template>
  <div class="mower-map-wrapper">
    <div ref="containerRef" class="mower-map" />

    <!-- Floating controls (top-left) -->
    <v-btn
      class="ctrl-tl"
      :color="editMode ? 'secondary' : 'surface'"
      icon
      size="small"
      :title="editMode ? 'Exit edit mode' : 'Edit mode'"
      @click="toggleEditMode"
    >
      <v-icon>{{ editMode ? 'mdi-check' : 'mdi-pencil' }}</v-icon>
    </v-btn>
    <v-btn
      v-if="editMode"
      class="ctrl-tl ctrl-tl-2"
      color="primary"
      icon
      size="small"
      title="Save map to mower"
      @click="save"
    >
      <v-icon>mdi-content-save</v-icon>
    </v-btn>

    <!-- Top-right extras -->
    <v-btn
      class="ctrl-tr"
      :color="showSatelliteLayer ? 'secondary' : 'surface'"
      icon
      size="small"
      title="Toggle satellite layer"
      @click="showSatelliteLayer = !showSatelliteLayer"
    >
      <v-icon>mdi-earth</v-icon>
    </v-btn>
    <v-btn class="ctrl-tr ctrl-tr-2" color="surface" icon size="small" title="Fit to bounds" @click="fitToBounds">
      <v-icon>mdi-crosshairs-gps</v-icon>
    </v-btn>

    <!-- Mower & dock markers -->
    <template v-if="map">
      <DockingStationMarker
        v-for="station in props.mapData.docking_stations"
        :key="station.id"
        :map="map"
        :station="station"
        :datum="mapStore.datum"
        :is-docked="isDocked"
      />
      <MowerMarker :map="map" :datum="mapStore.datum" :is-docked="isDocked" />
    </template>
  </div>
</template>

<style scoped lang="scss">
.mower-map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  background-color: #000;
}
.mower-map {
  position: absolute;
  inset: 0;
}
.ctrl-tl {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 5;
}
.ctrl-tl-2 {
  top: 60px;
}
.ctrl-tr {
  position: absolute;
  top: 10px;
  right: 60px;
  z-index: 5;
}
.ctrl-tr-2 {
  right: 110px;
}
</style>
