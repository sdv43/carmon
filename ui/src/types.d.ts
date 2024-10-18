/* eslint-disable @typescript-eslint/no-explicit-any */
declare const framework: {
  _focusStack: unknown
  routeMmuiMsg: (opts: unknown) => void
  sendEventToMmui: (id: string, opts: unknown, p?: unknown) => void
  getCurrentApp: () => unknown
  getCurrCtxtId: () => unknown
  getCurrCtxtSeqNo: () => unknown
  registerTmpltLoaded: (a: string) => void
  registerAppDictLoaded: (a: string, b: string) => void
  registerAppLoaded: (a: string, b: null, c: boolean) => void
}

declare const log: {
  info: (m: string) => void
}

declare const GuiFramework: any

declare const schedmaintApp: any

declare const systemApp: any

declare const baseApp: any