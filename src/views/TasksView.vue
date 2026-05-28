<script setup lang="ts">
/**
 * TasksView — simplified port of `src/app/tasks/page.tsx`.
 */
import { ref } from 'vue'
import { useDisplay } from 'vuetify'
import { HeaderStat, Page, PageContent, PageHeader } from '@/components/page'

const { mdAndUp } = useDisplay()

interface Task {
  id: string
  name: string
  area: string
  priority: 'high' | 'medium' | 'low'
  status: 'active' | 'pending' | 'scheduled' | 'completed'
  estimatedTime: string
  pattern: string
  nextRun: string
  lastRun: string
  efficiency: number
}

const tasks = ref<Task[]>([
  { id: '1', name: 'Mow Back Garden', area: 'Back Garden', priority: 'high', status: 'active', estimatedTime: '45 min', pattern: '90° rotation', nextRun: 'Today, 2:00 PM', lastRun: 'Yesterday, 3:30 PM', efficiency: 92 },
  { id: '2', name: 'Mow Front Lawn', area: 'Front Lawn', priority: 'medium', status: 'pending', estimatedTime: '30 min', pattern: 'Standard', nextRun: 'Tomorrow, 9:00 AM', lastRun: '2 days ago', efficiency: 88 },
  { id: '3', name: 'Mow Back Garden (45° rotation)', area: 'Back Garden', priority: 'low', status: 'scheduled', estimatedTime: '45 min', pattern: '45° rotation', nextRun: 'Friday, 10:00 AM', lastRun: 'Never', efficiency: 0 },
])
const selected = ref<string | null>(null)
const selectedTask = () => tasks.value.find((t) => t.id === selected.value) ?? null

function priorityColor(p: string) {
  return p === 'high' ? 'error' : p === 'medium' ? 'warning' : 'info'
}
function statusColor(s: string) {
  return { active: 'success', pending: 'warning', scheduled: 'info' }[s] ?? undefined
}
function statusLabel(s: string) {
  return { active: 'Running', pending: 'Pending', scheduled: 'Scheduled', completed: 'Completed' }[s] ?? 'Unknown'
}

const avgEfficiency = Math.round(tasks.value.reduce((acc, t) => acc + t.efficiency, 0) / tasks.value.length)
</script>

<template>
  <Page>
    <PageHeader title="Task Management" subtitle="Schedule and manage mowing sequences with precision">
      <HeaderStat icon="mdi-clipboard-text" :value="tasks.length" label="Total Tasks" />
      <HeaderStat icon="mdi-play" :value="tasks.filter((t) => t.status === 'active').length" label="Active Tasks" />
      <HeaderStat icon="mdi-trending-up" :value="`${avgEfficiency}%`" label="Average Efficiency" />
    </PageHeader>

    <PageContent>
      <div class="d-flex ga-6" :class="mdAndUp ? 'flex-row' : 'flex-column'">
        <div class="flex-grow-1">
          <v-card rounded="lg">
            <v-card-text>
              <div class="d-flex justify-space-between align-center mb-4">
                <div class="d-flex align-center ga-3">
                  <v-avatar color="warning" size="48"><v-icon>mdi-clipboard-text</v-icon></v-avatar>
                  <div>
                    <div class="text-h5 font-weight-bold">Mowing Tasks</div>
                    <div class="text-body-2 text-medium-emphasis">Manage your automated mowing schedule</div>
                  </div>
                </div>
                <div class="d-flex ga-2">
                  <v-btn color="primary" prepend-icon="mdi-plus">Add Task</v-btn>
                  <v-btn color="primary" variant="outlined" prepend-icon="mdi-calendar">Schedule</v-btn>
                </div>
              </div>

              <v-card
                v-for="task in tasks"
                :key="task.id"
                class="mb-3"
                :class="{ 'selected-task': selected === task.id }"
                rounded="lg"
                @click="selected = task.id"
              >
                <v-card-text>
                  <div class="d-flex align-start ga-3">
                    <v-icon class="mt-1">mdi-drag</v-icon>
                    <div class="flex-grow-1">
                      <div class="d-flex align-center ga-3 mb-2">
                        <span class="text-h6 font-weight-bold">{{ task.name }}</span>
                        <v-chip size="small" :color="priorityColor(task.priority)">{{ task.priority }}</v-chip>
                        <v-chip size="small" :color="statusColor(task.status)">{{ statusLabel(task.status) }}</v-chip>
                      </div>
                      <div class="task-details mb-2">
                        <div><div class="text-caption text-medium-emphasis">Area</div><div>{{ task.area }}</div></div>
                        <div><div class="text-caption text-medium-emphasis">Pattern</div><div>{{ task.pattern }}</div></div>
                        <div><div class="text-caption text-medium-emphasis">Est. Time</div><div>{{ task.estimatedTime }}</div></div>
                        <div>
                          <div class="text-caption text-medium-emphasis">Efficiency</div>
                          <div :class="task.efficiency > 80 ? 'text-success' : 'text-warning'">{{ task.efficiency }}%</div>
                        </div>
                      </div>
                      <div class="d-flex ga-4 flex-wrap">
                        <div><div class="text-caption text-medium-emphasis">Next Run</div><div>{{ task.nextRun }}</div></div>
                        <div><div class="text-caption text-medium-emphasis">Last Run</div><div>{{ task.lastRun }}</div></div>
                      </div>
                    </div>
                    <div class="d-flex ga-1 align-center">
                      <v-btn icon size="small" color="primary"><v-icon>mdi-play</v-icon></v-btn>
                      <v-btn icon size="small" color="primary"><v-icon>mdi-pencil</v-icon></v-btn>
                      <v-btn icon size="small" color="error"><v-icon>mdi-delete</v-icon></v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-card-text>
          </v-card>
        </div>

        <div :style="{ width: mdAndUp ? '400px' : '100%' }">
          <v-card rounded="lg">
            <v-card-text>
              <div class="d-flex align-center ga-3 mb-3">
                <v-avatar color="info" size="40"><v-icon>mdi-check-circle</v-icon></v-avatar>
                <div class="text-h5 font-weight-bold">Task Details</div>
              </div>
              <template v-if="selectedTask()">
                <div class="d-flex flex-column ga-3">
                  <div><div class="text-subtitle-2 text-medium-emphasis">Task Name</div><div class="text-h6">{{ selectedTask()!.name }}</div></div>
                  <div><div class="text-subtitle-2 text-medium-emphasis">Area</div><div>{{ selectedTask()!.area }}</div></div>
                  <div><div class="text-subtitle-2 text-medium-emphasis">Pattern</div><div>{{ selectedTask()!.pattern }}</div></div>
                  <div><div class="text-subtitle-2 text-medium-emphasis">Estimated Time</div><div>{{ selectedTask()!.estimatedTime }}</div></div>
                  <div><div class="text-subtitle-2 text-medium-emphasis">Next Run</div><div>{{ selectedTask()!.nextRun }}</div></div>
                  <div><div class="text-subtitle-2 text-medium-emphasis">Last Run</div><div>{{ selectedTask()!.lastRun }}</div></div>
                  <v-divider class="my-2" />
                  <v-btn color="primary" block size="large" prepend-icon="mdi-play">Start Task</v-btn>
                </div>
              </template>
              <div v-else class="text-center py-8">
                <v-icon size="64" color="grey">mdi-clipboard-text</v-icon>
                <div class="text-body-1 text-medium-emphasis">Select a task to view details</div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </PageContent>
  </Page>
</template>

<style scoped>
.task-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}
.selected-task {
  outline: 2px solid rgb(var(--v-theme-primary));
}
</style>
