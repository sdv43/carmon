import { api } from './api'

export const apiCarBatteryLevelGet = async () => {
  const resp = await api<{ Value: number | null }>('GET', '/carbattery')

  return resp?.Value
}
