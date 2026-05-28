/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */
import type { App } from 'vue'
import router from '@/router'
import pinia from '@/stores'
import vuetify from './vuetify'

export const registerPlugins = (app: App) => {
  app.use(pinia).use(vuetify).use(router)
}
