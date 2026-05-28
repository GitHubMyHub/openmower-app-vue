/**
 * Navigation items, ported from the original `navigationItems.tsx`.
 * Icons are Material Design Icons (mdi-*) names ready for v-icon.
 */
import type { NavigationItem } from '@/types'

export function createNavigationItems(): NavigationItem[] {
  const isDev = import.meta.env.VITE_IS_DEV === 'true' || import.meta.env.DEV
  const items: (NavigationItem | false)[] = [
    isDev && { label: 'Dashboard', icon: 'mdi-view-dashboard', path: '/', isGlobal: true },
    { label: 'Map', icon: 'mdi-map', path: '/map', isGlobal: false },
    isDev && { label: 'Tasks', icon: 'mdi-clipboard-text', path: '/tasks', isGlobal: false },
    isDev && { label: 'Sensors', icon: 'mdi-access-point', path: '/sensors', isGlobal: false },
    isDev && { label: 'Settings', icon: 'mdi-cog', path: '/settings', isGlobal: true },
    { label: 'Debug', icon: 'mdi-bug', path: '/debug', isGlobal: true },
  ]
  return items.filter((i): i is NavigationItem => !!i)
}
