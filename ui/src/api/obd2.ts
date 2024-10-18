import { api } from './api'

export const apiOBD2DataGet = async () => {
  const resp = await api<{
    PCMVoltage: number
    OilTemp: number
    OilPress: number
    OilLevel: number
    TirePress1: number
    TirePress2: number
    TirePress3: number
    TirePress4: number
  }>('GET', '/obd2/data')

  return resp
}
