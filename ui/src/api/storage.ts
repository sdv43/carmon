import { api } from './api'

export const apiStorageSet = async (key: string, value: string) => {
  await api<null>('POST', '/storage/set', { key, value })
}

export const apiStorageGet = async (key: string) => {
  const resp = await api<{ Value: string | null }>('GET', '/storage/get', {
    key,
  })

  return resp?.Value
}
