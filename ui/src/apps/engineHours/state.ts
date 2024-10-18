import { apiStorageGet, apiStorageSet } from '../../api/storage'
import { delay, writeError } from '../../utils'

export const storageStateKey = 'engineHoursState'

export const state = {
  disabled: true,
  enabled: false,
  hoursLimit: 200,
  hours: 200 * 3600, // hours in sec
}

const getState = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let finalError: any

  for (let i = 0; i < 10; i++) {
    try {
      return await apiStorageGet(storageStateKey)
    } catch (error) {
      finalError = error
      await delay(5)
    }
  }

  throw finalError
}

export const stateInit = async () => {
  const value = await getState()

  if (value) {
    const savedState = JSON.parse(value)

    state.enabled = savedState.enabled
    state.hoursLimit = savedState.hoursLimit
    state.hours = savedState.hours
  } else {
    await stateSave()
  }

  state.disabled = false
}

export const stateSave = async () => {
  try {
    await apiStorageSet(storageStateKey, JSON.stringify(state))
  } catch (error) {
    writeError('state.ts stateSave', error)
  }
}
