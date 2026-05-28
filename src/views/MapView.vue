<script setup lang="ts">
/**
 * MapView — port of `src/app/map/page.tsx`.
 */
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { HeaderStat, Page, PageContent, PageHeader } from '@/components/page'
import MowerMap from '@/components/map/MowerMap.vue'
import { useMapStore } from '@/stores/map'
import { useMowersStore } from '@/stores/mowers'
import { fallbackDatum } from '@/stores/schemas'
import { featuresToMap } from '@/utils/area-converter'

const mapStore = useMapStore()
const mowersStore = useMowersStore()
const { features } = storeToRefs(mapStore)

const mower = computed(() => mowersStore.selectedMower)
const mapData = computed(() => mower.value?.map)

function syncDatum() {
  mapStore.setDatum(mapData.value?.datum ?? fallbackDatum)
}
onMounted(syncDatum)
watch(() => mapData.value?.datum, syncDatum)

const areas = computed(() =>
  features.value.features.filter((f) => f.geometry.type === 'Polygon'),
)
const workingAreas = computed(() => areas.value.filter((a) => a.properties?.type === 'mow'))

function formatAreaSize(squareMeters: number): string {
  return `${Math.round(squareMeters)}m²`
}

async function saveMapToMower() {
  if (!mower.value || !mapData.value) return
  await mower.value.rpc.map.replace(featuresToMap(mapData.value, features.value))
}
</script>

<template>
  <Page>
    <template v-if="!mapData">
      <div class="pa-8 text-center text-medium-emphasis">No map data</div>
    </template>
    <template v-else>
      <PageHeader
        title="Map"
        subtitle="Real-time GPS tracking, area management, and intelligent path planning"
      >
        <HeaderStat icon="mdi-map-marker" :value="areas.length" label="Managed Areas" />
        <HeaderStat icon="mdi-play" :value="formatAreaSize(0)" label="Total Mowing Area" />
        <HeaderStat icon="mdi-check-circle" :value="workingAreas.length" label="Mowing Areas" />
      </PageHeader>
      <PageContent class="map-content">
        <MowerMap :map-data="mapData" :save-map-to-mower="saveMapToMower" />
      </PageContent>
    </template>
  </Page>
</template>

<style scoped>
.map-content {
  flex: 1;
  position: relative;
  height: calc(100dvh - 200px);
  min-height: 400px;
}
</style>
