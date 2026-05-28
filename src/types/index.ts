export interface MowerConfig {
  id: string
  name: string
  mqtt_ws_url: string
  mqtt_prefix: string
  description: string
}

export interface AppConfig {
  mowers: MowerConfig[]
}

export interface NavigationItem {
  label: string
  icon: string
  path: string
  isGlobal: boolean
}
