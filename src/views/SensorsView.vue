<script setup lang="ts">
/**
 * SensorsView — port of `src/app/sensors/page.tsx`. Uses mock data exactly as
 * in the upstream Next.js version while the live wire-up is still pending.
 */
import { HeaderStat, Page, PageContent, PageHeader } from '@/components/page'

const mockSensorData = {
  battery: { voltage: 24.2, current: 2.1, temperature: 35, health: 'good', estimatedTime: '2h 15m' },
  motors: {
    leftWheel: { rpm: 120, power: 85, temperature: 42 },
    rightWheel: { rpm: 118, power: 83, temperature: 41 },
    blade: { rpm: 2800, power: 92, temperature: 38 },
  },
  sensors: {
    gps: { accuracy: '±0.5m', satellites: 8, status: 'good' },
    obstacle: { front: 'clear', left: 'clear', right: 'clear', status: 'good' },
    rain: { detected: false, humidity: 45, status: 'good' },
  },
  system: { uptime: '3h 22m', errors: 0, warnings: 1, status: 'operational' },
}

function color(status: string) {
  switch (status) {
    case 'good':
    case 'operational': return 'success'
    case 'fair':
    case 'degraded': return 'warning'
    case 'poor':
    case 'error': return 'error'
    default: return undefined
  }
}
</script>

<template>
  <Page>
    <PageHeader
      title="Sensor Data & Diagnostics"
      subtitle="Real-time monitoring and system health across all mower systems"
    >
      <HeaderStat icon="mdi-battery" :value="`${mockSensorData.battery.voltage}V`" label="Battery Voltage" />
      <HeaderStat icon="mdi-crosshairs-gps" :value="mockSensorData.sensors.gps.satellites" label="GPS Satellites" />
      <HeaderStat icon="mdi-check-circle" :value="mockSensorData.system.errors" label="System Errors" />
    </PageHeader>

    <PageContent>
      <div class="d-flex flex-column ga-4">
        <v-card rounded="lg">
          <v-card-text>
            <h2 class="text-h6 mb-3">System Status</h2>
            <div class="d-flex flex-wrap ga-3 align-center">
              <v-chip :color="color(mockSensorData.system.status)" prepend-icon="mdi-check-circle">
                {{ mockSensorData.system.status }}
              </v-chip>
              <span class="text-body-2 text-medium-emphasis">Uptime: {{ mockSensorData.system.uptime }}</span>
              <v-chip size="small" :color="mockSensorData.system.errors > 0 ? 'error' : undefined">
                {{ mockSensorData.system.errors }} Errors
              </v-chip>
              <v-chip size="small" :color="mockSensorData.system.warnings > 0 ? 'warning' : undefined">
                {{ mockSensorData.system.warnings }} Warnings
              </v-chip>
            </div>
          </v-card-text>
        </v-card>

        <v-card rounded="lg">
          <v-card-text>
            <h2 class="text-h6 mb-3">Battery Status</h2>
            <div class="d-flex flex-wrap ga-4">
              <div class="metric-block">
                <div class="d-flex align-center ga-2 mb-1"><v-icon color="primary">mdi-battery</v-icon><span>Voltage</span></div>
                <div class="text-h4 text-primary">{{ mockSensorData.battery.voltage }}V</div>
                <div class="text-body-2 text-medium-emphasis">Nominal: 24V</div>
              </div>
              <div class="metric-block">
                <div class="d-flex align-center ga-2 mb-1"><v-icon color="primary">mdi-speedometer</v-icon><span>Current</span></div>
                <div class="text-h4 text-primary">{{ mockSensorData.battery.current }}A</div>
                <div class="text-body-2 text-medium-emphasis">Peak: 5A</div>
              </div>
              <div class="metric-block">
                <div class="d-flex align-center ga-2 mb-1"><v-icon color="primary">mdi-thermometer</v-icon><span>Temperature</span></div>
                <div class="text-h4 text-primary">{{ mockSensorData.battery.temperature }}°C</div>
                <div class="text-body-2 text-medium-emphasis">Range: 0–60°C</div>
              </div>
              <div class="metric-block">
                <div class="d-flex align-center ga-2 mb-1"><v-icon color="primary">mdi-check-circle</v-icon><span>Health</span></div>
                <v-chip :color="color(mockSensorData.battery.health)">{{ mockSensorData.battery.health }}</v-chip>
                <div class="text-body-2 text-medium-emphasis mt-1">Est. Time: {{ mockSensorData.battery.estimatedTime }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card rounded="lg">
          <v-card-text>
            <h2 class="text-h6 mb-3">Motor Status</h2>
            <div class="d-flex flex-wrap ga-4">
              <div
                v-for="(data, motor) in mockSensorData.motors"
                :key="motor"
                class="metric-block"
              >
                <div class="text-subtitle-1 font-weight-medium text-capitalize mb-2">{{ motor }}</div>
                <div class="mb-2">
                  <div class="d-flex justify-space-between"><span>RPM</span><span>{{ data.rpm }}</span></div>
                  <v-progress-linear :model-value="(data.rpm / 3000) * 100" color="primary" height="6" rounded />
                </div>
                <div class="mb-2">
                  <div class="d-flex justify-space-between"><span>Power</span><span>{{ data.power }}%</span></div>
                  <v-progress-linear :model-value="data.power" color="success" height="6" rounded />
                </div>
                <div>
                  <div class="d-flex justify-space-between"><span>Temperature</span><span>{{ data.temperature }}°C</span></div>
                  <v-progress-linear
                    :model-value="(data.temperature / 80) * 100"
                    :color="data.temperature > 60 ? 'warning' : 'info'"
                    height="6"
                    rounded
                  />
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card rounded="lg">
          <v-card-text>
            <h2 class="text-h6 mb-3">Sensor Status</h2>
            <div class="d-flex flex-wrap ga-4">
              <div class="metric-block">
                <div class="d-flex align-center ga-2 mb-2">
                  <v-icon color="primary">mdi-crosshairs-gps</v-icon>
                  <span class="text-subtitle-1">GPS</span>
                  <v-chip size="small" :color="color(mockSensorData.sensors.gps.status)">{{ mockSensorData.sensors.gps.status }}</v-chip>
                </div>
                <div class="text-body-2 text-medium-emphasis">Accuracy: {{ mockSensorData.sensors.gps.accuracy }}</div>
                <div class="text-body-2 text-medium-emphasis">Satellites: {{ mockSensorData.sensors.gps.satellites }}</div>
              </div>
              <div class="metric-block">
                <div class="d-flex align-center ga-2 mb-2">
                  <v-icon color="primary">mdi-alert</v-icon>
                  <span class="text-subtitle-1">Obstacle Detection</span>
                  <v-chip size="small" :color="color(mockSensorData.sensors.obstacle.status)">{{ mockSensorData.sensors.obstacle.status }}</v-chip>
                </div>
                <div class="text-body-2 text-medium-emphasis">Front: {{ mockSensorData.sensors.obstacle.front }}</div>
                <div class="text-body-2 text-medium-emphasis">Left: {{ mockSensorData.sensors.obstacle.left }}</div>
                <div class="text-body-2 text-medium-emphasis">Right: {{ mockSensorData.sensors.obstacle.right }}</div>
              </div>
              <div class="metric-block">
                <div class="d-flex align-center ga-2 mb-2">
                  <v-icon color="primary">mdi-water</v-icon>
                  <span class="text-subtitle-1">Environmental</span>
                  <v-chip size="small" :color="color(mockSensorData.sensors.rain.status)">{{ mockSensorData.sensors.rain.status }}</v-chip>
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Rain: {{ mockSensorData.sensors.rain.detected ? 'Detected' : 'None' }}
                </div>
                <div class="text-body-2 text-medium-emphasis">Humidity: {{ mockSensorData.sensors.rain.humidity }}%</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </PageContent>
  </Page>
</template>

<style scoped>
.metric-block {
  flex: 1 1 200px;
  min-width: 200px;
}
</style>
