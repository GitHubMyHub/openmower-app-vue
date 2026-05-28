<script setup lang="ts">
/**
 * DashboardView — port of `src/app/page.tsx`.
 *
 * Displays per-mower status cards plus a fleet control center. Live status
 * fields (currently_state, battery, …) come from each Mower instance; the
 * cosmetic fields (efficiency, ETA, etc.) are mocked here exactly like in the
 * upstream Next.js version.
 */
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { HeaderStat, Page, PageContent, PageHeader } from '@/components/page'
import { useMowersStore } from '@/stores/mowers'

const mowersStore = useMowersStore()
const { mowers } = storeToRefs(mowersStore)

interface MockStatus {
  status: 'active' | 'docked' | 'error' | 'charging'
  estimatedTime: string
  location: string
  efficiency: number
  speed: string
}
const mockStatusData: Record<string, MockStatus> = {
  '1': {
    status: 'active',
    estimatedTime: '45 min',
    location: 'Back Garden',
    efficiency: 92,
    speed: '0.8 m/s',
  },
  '2': {
    status: 'docked',
    estimatedTime: 'Ready',
    location: 'Docking Station',
    efficiency: 88,
    speed: '0 m/s',
  },
}

const isProcessing = ref(false)

const mowersWithStatus = computed(() =>
  mowers.value.map((mower) => {
    const mock = mockStatusData[mower.id] ?? {
      status: 'docked' as const,
      estimatedTime: '—',
      location: '—',
      efficiency: 0,
      speed: '0 m/s',
    }
    return {
      ...mock,
      id: mower.id,
      name: mower.name,
      battery: mower.state.battery_percentage,
      operation: mower.state.current_state,
    }
  }),
)

const activeCount = computed(() => mowersWithStatus.value.filter((m) => m.status === 'active').length)
const avgEfficiency = computed(() => {
  if (mowers.value.length === 0) return '0%'
  const total = mowersWithStatus.value.reduce((acc, m) => acc + m.efficiency, 0)
  return `${Math.round(total / mowersWithStatus.value.length)}%`
})

function statusColor(status: string) {
  switch (status) {
    case 'active': return 'success'
    case 'docked': return 'info'
    case 'error': return 'error'
    case 'charging': return 'warning'
    default: return 'default'
  }
}
function statusLabel(status: string) {
  switch (status) {
    case 'active': return 'Mowing'
    case 'docked': return 'Docked'
    case 'error': return 'Error'
    case 'charging': return 'Charging'
    default: return 'Unknown'
  }
}
function batteryColor(b: number) {
  if (b > 50) return 'success'
  if (b > 20) return 'warning'
  return 'error'
}

async function handleAction(action: string, mowerId: string) {
  isProcessing.value = true
  await new Promise((r) => setTimeout(r, 500))
  // eslint-disable-next-line no-console
  console.log(`${action} for mower ${mowerId}`)
  isProcessing.value = false
}
</script>

<template>
  <Page>
    <PageHeader title="Dashboard" subtitle="Monitor and control your robotic lawnmowers with precision">
      <HeaderStat icon="mdi-trending-up" :value="mowers.length" label="Active Mowers" />
      <HeaderStat icon="mdi-speedometer" :value="activeCount" label="Currently Mowing" />
      <HeaderStat icon="mdi-check-circle" :value="avgEfficiency" label="Average Efficiency" />
    </PageHeader>

    <PageContent>
      <div v-if="mowers.length === 0" class="d-flex justify-center align-center" style="height: 200px">
        <div class="text-h6 text-medium-emphasis">
          No mowers configured. Please add mowers to your config.json file.
        </div>
      </div>

      <template v-else>
        <div class="d-flex flex-wrap ga-6 mb-8">
          <v-card
            v-for="mower in mowersWithStatus"
            :key="mower.id"
            class="flex-grow-1"
            style="min-width: 0; flex: 1 1 450px"
            rounded="lg"
          >
            <v-card-text>
              <div class="d-flex justify-space-between align-start mb-4">
                <div>
                  <h2 class="text-h4 font-weight-bold mb-2">{{ mower.name }}</h2>
                  <v-chip :color="statusColor(mower.status)" class="font-weight-bold">
                    {{ statusLabel(mower.status) }}
                  </v-chip>
                </div>
                <v-avatar :color="statusColor(mower.status)" size="56">
                  <v-icon color="white">mdi-map-marker</v-icon>
                </v-avatar>
              </div>

              <div class="mb-6">
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="d-flex align-center ga-2">
                    <v-icon :color="batteryColor(mower.battery)">mdi-battery</v-icon>
                    <span class="text-h6 font-weight-bold">Battery Status</span>
                  </div>
                  <span class="text-h4 font-weight-bold" :class="`text-${batteryColor(mower.battery)}`">
                    {{ mower.battery }}%
                  </span>
                </div>
                <v-progress-linear
                  :model-value="mower.battery"
                  :color="batteryColor(mower.battery)"
                  height="12"
                  rounded
                />
              </div>

              <div class="mb-6">
                <div class="text-h6 font-weight-bold text-medium-emphasis mb-2">Current Operation</div>
                <div class="d-flex align-center ga-3 pa-3 bg-grey-lighten-4 rounded">
                  <v-icon color="primary">mdi-play</v-icon>
                  <span class="text-body-1 font-weight-medium">{{ mower.operation }}</span>
                </div>
              </div>

              <div class="metrics-grid mb-6">
                <div class="metric">
                  <v-icon color="primary" size="24" class="mb-1">mdi-timer</v-icon>
                  <div class="text-body-2 text-medium-emphasis">Est. Time</div>
                  <div class="text-h6 font-weight-bold text-primary">{{ mower.estimatedTime }}</div>
                </div>
                <div class="metric">
                  <v-icon color="success" size="24" class="mb-1">mdi-speedometer</v-icon>
                  <div class="text-body-2 text-medium-emphasis">Speed</div>
                  <div class="text-h6 font-weight-bold text-success">{{ mower.speed }}</div>
                </div>
                <div class="metric">
                  <v-icon color="info" size="24" class="mb-1">mdi-trending-up</v-icon>
                  <div class="text-body-2 text-medium-emphasis">Efficiency</div>
                  <div class="text-h6 font-weight-bold text-info">{{ mower.efficiency }}%</div>
                </div>
              </div>

              <div class="d-flex ga-3">
                <template v-if="mower.status === 'active'">
                  <v-btn block color="warning" prepend-icon="mdi-stop" :disabled="isProcessing"
                    @click="handleAction('stop', mower.id)">Stop Mowing</v-btn>
                  <v-btn block color="info" variant="outlined" prepend-icon="mdi-skip-next" :disabled="isProcessing"
                    @click="handleAction('skip', mower.id)">Skip Area</v-btn>
                </template>
                <template v-else>
                  <v-btn block color="primary" prepend-icon="mdi-play" :disabled="isProcessing"
                    @click="handleAction('start', mower.id)">Start Mowing</v-btn>
                  <v-btn block color="secondary" variant="outlined" prepend-icon="mdi-home" :disabled="isProcessing"
                    @click="handleAction('dock', mower.id)">Return to Dock</v-btn>
                </template>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <v-sheet class="pa-6" rounded="xl" elevation="1">
          <div class="text-center mb-6">
            <h3 class="text-h4 font-weight-bold mb-2">Fleet Control Center</h3>
            <p class="text-body-1 text-medium-emphasis">Manage all your mowers simultaneously</p>
          </div>
          <div class="d-flex flex-wrap ga-4 justify-center">
            <v-btn color="primary" size="large" prepend-icon="mdi-play" :disabled="isProcessing"
              @click="handleAction('startAll', 'all')">Start All Mowers</v-btn>
            <v-btn color="warning" variant="outlined" size="large" prepend-icon="mdi-stop" :disabled="isProcessing"
              @click="handleAction('stopAll', 'all')">Stop All Mowers</v-btn>
            <v-btn color="secondary" variant="outlined" size="large" prepend-icon="mdi-home" :disabled="isProcessing"
              @click="handleAction('dockAll', 'all')">Dock All Mowers</v-btn>
            <v-btn color="error" variant="outlined" size="large" prepend-icon="mdi-alert" :disabled="isProcessing"
              @click="handleAction('emergency', 'all')">Emergency Stop</v-btn>
          </div>
        </v-sheet>
      </template>
    </PageContent>
  </Page>
</template>

<style scoped>
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}
.metric {
  text-align: center;
  padding: 12px;
  background: rgba(76, 175, 80, 0.05);
  border-radius: 8px;
}
</style>
