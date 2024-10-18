import { writeLog } from '../../utils'
import { state, stateSave } from './state'

let interval: number | null = null

export const startHoursCounter = () => {
  if (interval) {
    return
  }

  interval = window.setInterval(() => {
    writeLog('counter.ts startHoursCounter, counter started')

    if (state.enabled) {
      state.hours -= 30
      stateSave()
    }
  }, 30 * 1000)
}

export const stopHoursCounter = () => {
  if (interval) {
    writeLog('counter.ts stopHoursCounter. counter stopped')
    clearInterval(interval)
    interval = null
  }
}
