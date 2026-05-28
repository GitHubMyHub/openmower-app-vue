import { onBeforeUnmount, ref } from 'vue'
import { useMowersStore } from '@/stores/mowers'

const PUBLISH_INTERVAL_MS = 100

/**
 * Composable port of the original `useTeleop` React hook.
 * Continuously republishes the latest velocity to the mower while moving.
 */
export function useTeleop() {
  const vel = ref({ vx: 0, vz: 0 })
  const interval = ref<ReturnType<typeof setInterval> | null>(null)
  const store = useMowersStore()

  function publish() {
    store.selectedMower?.publishTeleop(vel.value.vx, vel.value.vz)
  }

  function setVelocity(vx: number, vz: number) {
    vel.value = {
      vx: Math.max(-1, Math.min(1, vx)),
      vz: Math.max(-1, Math.min(1, vz)),
    }

    const moving = vx !== 0 || vz !== 0
    const wasMoving = interval.value !== null

    if (moving && !wasMoving) {
      publish()
      interval.value = setInterval(publish, PUBLISH_INTERVAL_MS)
    } else if (!moving && wasMoving) {
      clearInterval(interval.value!)
      interval.value = null
      publish()
    }
  }

  onBeforeUnmount(() => {
    if (interval.value !== null) clearInterval(interval.value)
    vel.value = { vx: 0, vz: 0 }
    publish()
  })

  return { setVelocity }
}
