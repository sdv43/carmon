export const writeLog = (msg: string) => {
  if (process.env.NODE_ENV === 'development') {
    log.info(`CARMON. ${msg}`)
  }
}

export const writeError = (msg: string, error: unknown) => {
  let errMsg = `${error}`

  if (error instanceof Error) {
    errMsg = error.message
  }

  writeLog(msg + ', error: ' + errMsg)
}

export const delay = async (sec: number) =>
  new Promise((resolve) => setTimeout(resolve, sec * 1000))
