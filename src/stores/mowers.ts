import { defineStore } from 'pinia'
import { markRaw } from 'vue'
import { BSON } from 'bson'
import mqtt, { type MqttClient } from 'mqtt'
import { useConfigStore } from './config'
import { OpenMowerRpc } from '@/lib/rpc'
import { generateId } from '@/utils/area-utils'
import type { MowerConfig } from '@/types'
import {
  capabilitiesSchema,
  legacyMapSchema,
  mapDefaults,
  mapSchema,
  stateDefaults,
  stateSchema,
  type Area,
  type AreaType,
  type Capabilities,
  type LegacyArea,
  type LegacyMapData,
  type MapData,
  type State,
} from './schemas'

export type MqttStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'offline'

export class Mower {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly mqttUrl: string
  readonly mqttClient: MqttClient
  readonly mqttPrefix: string
  readonly rpc: OpenMowerRpc
  capabilities: Capabilities = {}
  state: State = stateDefaults
  map: MapData = mapDefaults

  constructor(config: MowerConfig, mqttClient: MqttClient) {
    this.id = config.id
    this.name = config.name
    this.description = config.description
    this.mqttUrl = config.mqtt_ws_url
    this.mqttClient = mqttClient
    this.mqttPrefix = config.mqtt_prefix
    this.rpc = new OpenMowerRpc(mqttClient, config.mqtt_prefix)
  }

  hasCapability(capability: string, minLevel = 1): boolean {
    const level = this.capabilities[capability]
    return level !== undefined && level >= minLevel
  }

  publishTeleop(vx: number, vz: number) {
    const payload = BSON.serialize({ vx, vz })
    this.mqttClient.publish(this.mqttPrefix + 'teleop', Buffer.from(payload.buffer))
  }
}

interface MowersState {
  mowers: Mower[]
  mqttStatuses: Record<string, MqttStatus>
  selected: number
}

export const useMowersStore = defineStore('mowers', {
  state: (): MowersState => ({
    mowers: [],
    mqttStatuses: {},
    selected: 0,
  }),
  getters: {
    // Pinia infers `mowers` as a deep proxy type — cast to recover the Mower class shape.
    selectedMower: (state): Mower | undefined =>
      state.mowers[state.selected] as unknown as Mower | undefined,
  },
  actions: {
    loadMowers() {
      // Disconnect previous clients
      for (const oldMower of this.mowers) {
        try {
          oldMower.mqttClient.end()
        } catch {
          /* ignore */
        }
      }

      const mowers: Mower[] = []
      const mowerConfigs = useConfigStore().config.mowers
      const urls = [...new Set(mowerConfigs.map((c) => c.mqtt_ws_url))]

      for (const url of urls) {
        const urlObj = new URL(url)
        const client = mqtt.connect(url, {
          username: urlObj.username,
          password: urlObj.password,
          clean: true,
        })
        const clientMowers: { prefix: string; idx: number }[] = []
        for (const config of mowerConfigs) {
          if (config.mqtt_ws_url === url) {
            // markRaw widens the inferred type — re-assert as Mower so consumers
            // still see the original class methods.
            const mower = markRaw(new Mower(config, client)) as unknown as Mower
            mowers.push(mower)
            clientMowers.push({ prefix: mower.mqttPrefix, idx: mowers.length - 1 })
          }
        }

        const setMqttStatus = (status: MqttStatus) => {
          for (const cm of clientMowers) {
            const id = mowers[cm.idx]?.id
            if (id) this.mqttStatuses[id] = status
          }
        }

        client.on('error', () => setMqttStatus('disconnected'))
        client.on('close', () => setMqttStatus('disconnected'))
        client.on('offline', () => setMqttStatus('offline'))
        client.on('reconnect', () => setMqttStatus('reconnecting'))

        client.on('connect', () => {
          setMqttStatus('connected')
          for (const cm of clientMowers) {
            client.subscribe(cm.prefix + 'capabilities/json')
            client.subscribe(cm.prefix + 'robot_state/json')
            client.subscribe(cm.prefix + 'map/json')
            client.subscribe(cm.prefix + 'rpc/response')
          }
        })

        client.on('message', (topic, payload) => {
          const cm = clientMowers.find((c) => topic.startsWith(c.prefix))
          if (!cm) return
          const { idx, prefix } = cm
          const partial = topic.substring(prefix.length)
          const mower = this.mowers[idx]
          if (!mower) return
          try {
            if (partial === 'robot_state/json') {
              mower.state = stateSchema.parse(JSON.parse(payload.toString()))
            } else if (partial === 'map/json') {
              const json = JSON.parse(payload.toString())
              mower.map =
                'areas' in json
                  ? mapSchema.parse(json)
                  : convertLegacyMap(legacyMapSchema.parse(json))
            } else if (partial === 'rpc/response') {
              mower.rpc._handleResponse(payload.toString())
            } else if (partial === 'capabilities/json') {
              mower.capabilities = capabilitiesSchema.parse(JSON.parse(payload.toString()))
            }
          } catch (err) {
            console.error('Failed to handle MQTT message', topic, err)
          }
        })
      }
      this.mowers = mowers
      this.selected = 0
    },
    selectMower(id: string) {
      const idx = this.mowers.findIndex((m) => m.id === id)
      if (idx >= 0) this.selected = idx
    },
  },
})

const convertLegacyMap = (legacy: LegacyMapData): MapData => ({
  datum: legacy.datum,
  areas: [
    ...convertLegacyAreas(legacy.working_areas ?? [], 'mow', 'Working Area'),
    ...convertLegacyAreas(legacy.navigation_areas ?? [], 'nav', 'Navigation Area'),
  ],
  docking_stations:
    legacy.docking_pose.heading === null ? [] : [convertLegacyDockingStation(legacy.docking_pose)],
})

const convertLegacyAreas = (areas: LegacyArea[], type: AreaType, prefix: string): Area[] =>
  areas.flatMap((area, idx) => [
    {
      id: generateId(),
      properties: {
        name: area.name === '' ? `${prefix} ${idx}` : area.name,
        type,
        active: true,
      },
      outline: area.outline,
    },
    ...(area.obstacles ?? []).map((obstacle) => ({
      id: generateId(),
      properties: {
        name: 'Obstacle',
        type: 'obstacle' as const,
        active: true,
      },
      outline: obstacle,
    })),
  ])

const convertLegacyDockingStation = (docking_pose: LegacyMapData['docking_pose']) => ({
  id: generateId(),
  properties: { name: 'Docking station', active: true },
  position: { x: docking_pose.x, y: docking_pose.y },
  heading: docking_pose.heading!,
})
