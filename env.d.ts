/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IS_DEV?: string
  readonly VITE_MOWER_NAME?: string
  readonly VITE_MOWER_MQTT_WS_URL?: string
  readonly VITE_MOWER_MQTT_PREFIX?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
