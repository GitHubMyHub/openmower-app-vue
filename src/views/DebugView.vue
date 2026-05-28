<script setup lang="ts">
/**
 * DebugView — port of `src/app/debug/page.tsx`.
 */
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { HeaderStat, Page, PageContent, PageHeader } from '@/components/page'
import { useMowersStore, type Mower, type MqttStatus } from '@/stores/mowers'

const mowersStore = useMowersStore()
const { mowers, mqttStatuses } = storeToRefs(mowersStore)

const connectedCount = computed(
  () => mowers.value.filter((m) => mqttStatuses.value[m.id] === 'connected').length,
)

function mqttIcon(status: MqttStatus): string {
  switch (status) {
    case 'connected': return 'mdi-check-circle'
    case 'reconnecting':
    case 'connecting': return 'mdi-refresh'
    case 'offline': return 'mdi-wifi-off'
    case 'disconnected': return 'mdi-alert-circle'
  }
}
function mqttColor(status: MqttStatus) {
  switch (status) {
    case 'connected': return 'success'
    case 'reconnecting': return 'warning'
    case 'connecting': return 'info'
    case 'offline':
    case 'disconnected': return 'error'
  }
}

function maskPassword(rawUrl: string): string {
  try {
    const u = new URL(rawUrl)
    if (u.password) {
      const decoded = decodeURIComponent(u.password)
      return rawUrl.replace(`:${decoded}@`, `:${'*'.repeat(decoded.length)}@`)
    }
    return rawUrl
  } catch {
    return rawUrl
  }
}

// Pings ----------------------------------------------------------------------
interface PingState { latency: number | null; error: string | null; loading: boolean }

function usePing(fn: () => Promise<unknown>) {
  const state = ref<PingState>({ latency: null, error: null, loading: true })
  async function run() {
    state.value = { latency: null, error: null, loading: true }
    const start = performance.now()
    try {
      await fn()
      state.value = { latency: Math.round(performance.now() - start), error: null, loading: false }
    } catch (e) {
      state.value = {
        latency: null,
        error: e instanceof Error ? e.message : 'Timeout',
        loading: false,
      }
    }
  }
  onMounted(() => setTimeout(run, 1000))
  return { state, run }
}

function pingFor(mower: Mower) {
  return usePing(() => mower.rpc.rpc.ping())
}
</script>

<template>
  <Page>
    <PageHeader title="Debug" subtitle="Connection health and diagnostics for all configured mowers">
      <HeaderStat icon="mdi-bug" :value="mowers.length" label="Mowers configured" />
      <HeaderStat icon="mdi-check-circle" :value="connectedCount" label="MQTT connected" />
    </PageHeader>

    <PageContent>
      <div v-if="mowers.length === 0" class="d-flex justify-center align-center" style="height: 200px">
        <div class="text-h6 text-medium-emphasis">No mowers configured.</div>
      </div>

      <div v-else class="d-flex flex-column ga-4">
        <v-card v-for="mower in mowers" :key="mower.id" rounded="lg">
          <v-card-text>
            <div class="text-h5 font-weight-bold mb-1">{{ mower.name }}</div>
            <div v-if="mower.description" class="text-body-2 text-medium-emphasis mb-3">
              {{ mower.description }}
            </div>

            <div class="d-flex flex-column ga-4">
              <!-- MQTT -->
              <div>
                <div class="d-flex align-center ga-2 mb-2">
                  <v-icon size="small">mdi-link</v-icon>
                  <span class="text-subtitle-2 font-weight-bold">MQTT</span>
                  <v-chip
                    :color="mqttColor(mqttStatuses[mower.id] ?? 'connecting')"
                    size="small"
                    :prepend-icon="mqttIcon(mqttStatuses[mower.id] ?? 'connecting')"
                  >
                    {{ mqttStatuses[mower.id] ?? 'connecting' }}
                  </v-chip>
                </div>
                <div class="text-body-2"><strong>URL:</strong> <code>{{ maskPassword(mower.mqttUrl) }}</code></div>
                <div class="text-body-2">
                  <strong>Prefix:</strong> <code>{{ mower.mqttPrefix || '(none)' }}</code>
                </div>
              </div>

              <v-divider />

              <!-- RPC -->
              <div>
                <div class="d-flex align-center ga-2 mb-2">
                  <v-icon size="small">mdi-play</v-icon>
                  <span class="text-subtitle-2 font-weight-bold">RPC</span>
                </div>
                <PingChip :ping="pingFor(mower)" label="Ping" />
              </div>

              <v-divider />

              <!-- Capabilities -->
              <div>
                <div class="d-flex align-center ga-2 mb-2">
                  <v-icon size="small">mdi-check-circle</v-icon>
                  <span class="text-subtitle-2 font-weight-bold">Capabilities</span>
                </div>
                <div v-if="Object.keys(mower.capabilities).length === 0" class="text-body-2 text-disabled">
                  No capabilities received yet
                </div>
                <div v-else class="d-flex flex-wrap ga-2">
                  <v-chip
                    v-for="(level, key) in mower.capabilities"
                    :key="key"
                    size="small"
                    variant="outlined"
                  >
                    {{ key }}: <strong class="ms-1">{{ level }}</strong>
                  </v-chip>
                </div>
              </div>

              <v-divider />

              <!-- Map -->
              <div>
                <div class="d-flex align-center ga-2 mb-2">
                  <v-icon size="small">mdi-map</v-icon>
                  <span class="text-subtitle-2 font-weight-bold">Map</span>
                  <v-chip
                    :color="mower.map.areas.length || mower.map.docking_stations.length ? 'success' : undefined"
                    size="small"
                  >
                    {{ mower.map.areas.length || mower.map.docking_stations.length ? 'Loaded' : 'Not loaded' }}
                  </v-chip>
                </div>
                <div class="text-body-2">
                  <strong>Datum:</strong>
                  <a
                    v-if="mower.map.datum"
                    :href="`https://www.google.com/maps?q=${mower.map.datum.lat},${mower.map.datum.long}`"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ mower.map.datum.lat.toFixed(6) }}, {{ mower.map.datum.long.toFixed(6) }}
                  </a>
                  <span v-else class="text-disabled">Not set</span>
                </div>
                <div class="text-body-2"><strong>Areas:</strong> {{ mower.map.areas.length }}</div>
                <div class="text-body-2">
                  <strong>Docking stations:</strong> {{ mower.map.docking_stations.length }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </PageContent>
  </Page>
</template>

<script lang="ts">
import { defineComponent, h } from 'vue'

// Inline PingChip component — keeps DebugView compact while reusing the
// per-mower ping composable returned by `usePing` above.
export const PingChip = defineComponent({
  props: {
    ping: { type: Object, required: true },
    label: { type: String, required: true },
  },
  setup(props) {
    return () => {
      const s = props.ping.state.value
      const children = [
        h(
          'span',
          {
            style:
              'display:inline-flex;align-items:center;gap:6px;padding:2px 8px;border:1px solid rgba(0,0,0,0.2);border-radius:12px;cursor:pointer;font-size:0.75rem;',
            onClick: () => props.ping.run(),
          },
          [props.label],
        ),
        ' ',
        s.loading
          ? h('span', { style: 'opacity:0.7;font-size:0.75rem;' }, 'Waiting…')
          : s.error
          ? h('span', { style: 'color:#F44336;font-size:0.75rem;' }, s.error)
          : h('span', { style: 'color:#4CAF50;font-size:0.75rem;' }, `${s.latency} ms`),
      ]
      return h('div', { style: 'display:flex;align-items:center;gap:8px;' }, children)
    }
  },
})
</script>
