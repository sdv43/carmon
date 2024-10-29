import { apiCarBatteryLevelGet } from '../../api/carBattery'

let interval: number | null = null

const createInterval = (delay: number) => {
  return window.setInterval(async () => {
    const level = await apiCarBatteryLevelGet()

    if (level) {
      const state = Math.trunc(level / 10) || 1
      const visibility = state < 5

      framework.common.setSbIcon(
        'CarBatt',
        visibility,
        visibility ? `${state}` : '1',
      )
    }
  }, delay)
}

export const startBatteryStatusChecker = async () => {
  if (interval) {
    window.clearInterval(interval)
  }

  interval = createInterval(10 * 1000)

  setTimeout(
    () => {
      if (interval) {
        window.clearInterval(interval)
      }

      interval = createInterval(5 * 60 * 1000)
    },
    5 * 60 * 1000,
  )
}
