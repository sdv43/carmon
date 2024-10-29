import { startBatteryStatusChecker } from '../apps/carBattery'
import { EHActions, EHConfigCtxt, EHResetCtxt } from '../apps/engineHours/app'
import {
  startHoursCounter,
  stopHoursCounter,
} from '../apps/engineHours/counter'
import { SensActions, SensDataCtxt, SensErrorCtxt } from '../apps/sensors/app'
import { pushCtx, popCtx, replaceCtx } from './contextStack'

const patchSendEventToMmui = () => {
  const originalSendFn = GuiFramework.prototype.sendEventToMmui

  GuiFramework.prototype.sendEventToMmui = function (
    uiaId,
    eventId,
    params,
    fromVui,
  ) {
    const ctxtId = framework.getCurrCtxtId()

    if (uiaId === 'schedmaint') {
      switch (eventId) {
        case EHActions.showConfigCtxt:
          pushCtx('schedmaint', EHConfigCtxt)
          return

        case EHActions.showResetCtxt:
          pushCtx('schedmaint', EHResetCtxt)
          return

        case EHActions.cancelResetHours:
          popCtx()
          return
      }
    } else if (uiaId === 'common') {
      switch (eventId) {
        case 'Global.GoBack':
          if (
            ctxtId === EHConfigCtxt ||
            ctxtId === EHResetCtxt ||
            ctxtId === SensDataCtxt ||
            ctxtId === SensErrorCtxt
          ) {
            popCtx()
            return
          }
          break
      }
    } else if (uiaId === 'system') {
      switch (eventId) {
        case SensActions.showDataCtxt:
          pushCtx('system', SensDataCtxt)
          return
        case SensActions.showErrorCtxt:
          replaceCtx('system', SensErrorCtxt)
          return
        case SensActions.backFromErrorCtxt:
          popCtx()
          return
      }
    }

    originalSendFn.bind(this)(uiaId, eventId, params, fromVui)
  }
}

const patchRouteMmuiMsg = () => {
  const originalRouteFn = GuiFramework.prototype.routeMmuiMsg

  GuiFramework.prototype.routeMmuiMsg = function (jsObject) {
    if (
      jsObject.msgType === 'msg' &&
      jsObject.uiaId === 'ecoenergy' &&
      jsObject.msgId === 'IgnitionStatus'
    ) {
      if (jsObject.params.payload.IgnSts === 'ON') {
        startHoursCounter()
      } else if (jsObject.params.payload.IgnSts === 'OFF') {
        stopHoursCounter()
      }
    }

    originalRouteFn.bind(this)(jsObject)
  }
}

export const patchGuiFramework = () => {
  log.addSrcFile('bundle.js', 'Carmon')
  log.setLogLevel(
    'Carmon',
    process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  )

  patchSendEventToMmui()
  patchRouteMmuiMsg()

  startBatteryStatusChecker()
}
