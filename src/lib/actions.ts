import type { AppConfig } from '@/types'

/**
 * Loads the application configuration. In the browser-only Vue port, we
 * fetch `config.json` from the public folder. Environment-variable based
 * configuration (originally implemented as a Next.js server action) can be
 * provided at build time via `VITE_MOWER_*` variables.
 */
async function loadConfigFromEnv(): Promise<AppConfig | null> {
  const name = import.meta.env.VITE_MOWER_NAME
  if (!name) return null

  const hostname = window.location.hostname || 'localhost'
  const mqtt_ws_url = import.meta.env.VITE_MOWER_MQTT_WS_URL ?? `ws://${hostname}:9001`
  const mqtt_prefix = import.meta.env.VITE_MOWER_MQTT_PREFIX ?? ''

  return {
    mowers: [
      {
        id: '1',
        name,
        mqtt_ws_url,
        mqtt_prefix,
        description: '',
      },
    ],
  }
}

export async function loadAppConfig(): Promise<AppConfig> {
  const envConfig = await loadConfigFromEnv()
  if (envConfig) return envConfig

  try {
    const res = await fetch('/config.json')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as AppConfig
  } catch (err) {
    console.error('Error reading /config.json, falling back to localhost defaults', err)
    const hostname = window.location.hostname || 'localhost'
    return {
      mowers: [
        {
          id: '1',
          name: 'OpenMower',
          mqtt_ws_url: `ws://${hostname}:9001`,
          mqtt_prefix: '',
          description: '',
        },
      ],
    }
  }
}
