import { defineStore } from 'pinia'
import type { AppConfig, MowerConfig } from '@/types'

interface State {
  config: AppConfig
}

export const useConfigStore = defineStore('config', {
  state: (): State => ({ config: { mowers: [] } }),
  getters: {
    mowerConfigs: (state): MowerConfig[] => state.config.mowers,
  },
  actions: {
    setConfig(config: AppConfig) {
      this.config = config
    },
  },
})
