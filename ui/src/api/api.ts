import { writeError, writeLog } from '../utils'

const parseJSON = <R>(json: string): R | null => {
  try {
    return json ? JSON.parse(json) : null
  } catch (error) {
    writeError('api/callApi.ts Cannot parse json', error)
  }

  return null
}

export const api = async <R>(
  method: 'GET' | 'POST',
  path: string,
  params?: Record<string, string>,
): Promise<R | null> =>
  new Promise((resolve, reject) => {
    writeLog(`/api/callApi.ts api ${method} ${path} ${JSON.stringify(params)}`)

    let query = ''

    if (method === 'GET' && params) {
      query = Object.keys(params)
        .map((key) => (params ? `${key}=${params[key]}` : `${key}=`))
        .join('&')
    }

    const xhr = new XMLHttpRequest()

    xhr.open(method, encodeURI(`http://localhost:27400${path}?${query}`))

    xhr.onload = () => {
      writeLog(
        `/api/callApi.ts onload ${method} ${path} ${xhr.status} ${xhr.responseText}`,
      )

      if (xhr.status > 299) {
        const error = parseJSON<{ Error: string }>(xhr.responseText)

        reject(new Error(error?.Error || xhr.responseText || xhr.statusText))
      } else {
        const data = parseJSON<R>(xhr.responseText)

        resolve(data)
      }
    }

    xhr.onerror = () => {
      writeError(
        `/api/callApi.ts onerror ${method} ${path} ${xhr.status} ${xhr.responseText}`,
        new Error('Unknown error'),
      )

      reject(new Error('Unknown error'))
    }

    let postData: FormData | null = null

    if (method === 'POST' && params) {
      postData = new FormData()

      Object.keys(params).forEach((key) => {
        postData?.append(key, params[key])
      })
    }

    xhr.send(postData ?? undefined)
  })
