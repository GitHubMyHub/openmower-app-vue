import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const DefaultLayout = () => import('@/layouts/default.vue')
const MapLayout = () => import('@/layouts/map.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { path: '', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
      { path: 'tasks', name: 'tasks', component: () => import('@/views/TasksView.vue') },
      { path: 'sensors', name: 'sensors', component: () => import('@/views/SensorsView.vue') },
      { path: 'settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },
      { path: 'debug', name: 'debug', component: () => import('@/views/DebugView.vue') },
    ],
  },
  {
    path: '/map',
    component: MapLayout,
    children: [{ path: '', name: 'map', component: () => import('@/views/MapView.vue') }],
  },
  // Fallback
  { path: '/:pathMatch(.*)*', redirect: '/map' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  // Mirror the original Next.js behaviour: dashboard is only accessible in dev mode.
  const isDev = import.meta.env.VITE_IS_DEV === 'true' || import.meta.env.DEV
  if (!isDev && to.path === '/') {
    return '/map'
  }
})

export default router
