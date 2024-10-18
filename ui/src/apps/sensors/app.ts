import { apiOBD2DataGet } from '../../api/obd2'
import { delay, writeError } from '../../utils'

let counter = 0
let latestOBD2Error = ''
const uiaId = 'system'

export const SensDataCtxt = 'SensData'
export const SensErrorCtxt = 'SensError'

export const SensActions = {
  showDataCtxt: 'sensactionShowDataCtxt',
  showErrorCtxt: 'sensactionShowErrorCtxt',
  backFromErrorCtxt: 'sensactionBackFromErrorCtxt',
}

const getOBD2Data = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let finalError: any

  for (let i = 0; i < 3; i++) {
    try {
      return await apiOBD2DataGet()
    } catch (error) {
      finalError = error

      if (i < 2) {
        await delay(5)
      }
    }
  }

  throw finalError
}

const buildOBD2DataListItems = (
  data: Awaited<ReturnType<typeof getOBD2Data>>,
) => {
  return data
    ? [
        {
          text1Id: 'SensorsOilLevel',
          label1Id: 'SensorsOilLevelValue',
          label1SubMap: { value: data.OilLevel },
          hasCaret: false,
          itemStyle: 'style06',
          disabled: false,
        },
        {
          text1Id: 'SensorsOilTemp',
          label1Id: 'SensorsOilTempValue',
          label1SubMap: { value: parseFloat(`${data.OilTemp}`).toFixed(1) },
          hasCaret: false,
          itemStyle: 'style06',
          disabled: false,
        },
        {
          text1Id: 'SensorsTirePress1',
          label1Id: 'SensorsTirePressValue',
          label1SubMap: { value: parseFloat(`${data.TirePress1}`).toFixed(1) },
          hasCaret: false,
          itemStyle: 'style06',
          disabled: false,
        },
        {
          text1Id: 'SensorsTirePress2',
          label1Id: 'SensorsTirePressValue',
          label1SubMap: { value: parseFloat(`${data.TirePress2}`).toFixed(1) },
          hasCaret: false,
          itemStyle: 'style06',
          disabled: false,
        },
        {
          text1Id: 'SensorsTirePress3',
          label1Id: 'SensorsTirePressValue',
          label1SubMap: { value: parseFloat(`${data.TirePress3}`).toFixed(1) },
          hasCaret: false,
          itemStyle: 'style06',
          disabled: false,
        },
        {
          text1Id: 'SensorsTirePress4',
          label1Id: 'SensorsTirePressValue',
          label1SubMap: { value: parseFloat(`${data.TirePress4}`).toFixed(1) },
          hasCaret: false,
          itemStyle: 'style06',
          disabled: false,
        },
        {
          text1Id: 'SensorsPCMVoltage',
          label1Id: 'SensorsPCMVoltageValue',
          label1SubMap: { value: parseFloat(`${data.PCMVoltage}`).toFixed(1) },
          hasCaret: false,
          itemStyle: 'style06',
          disabled: false,
        },
        {
          text1Id: 'SensorsOilPress',
          label1Id: 'SensorsOilPressValue',
          label1SubMap: { value: data.OilPress },
          hasCaret: false,
          itemStyle: 'style06',
          disabled: false,
        },
      ]
    : []
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const upadteOBD2DataList = async (list2Ctrl: any) => {
  try {
    const sensorsData = await getOBD2Data()
    const items = buildOBD2DataListItems(sensorsData)

    if (sensorsData) {
      if (framework.getCurrCtxtId() !== SensDataCtxt) {
        return false
      }

      list2Ctrl.setDataListAndUpdateItems({
        itemCountKnown: true,
        itemCount: items.length,
        items: items,
      })
    } else {
      throw new Error('No data')
    }

    return true
  } catch (error) {
    writeError('sensors/app.ts handleDataCtxReady', error)

    latestOBD2Error = 'Unknown error'

    if (error instanceof Error) {
      latestOBD2Error = error.message
    }

    if (framework.getCurrCtxtId() !== SensDataCtxt) {
      return false
    }

    framework.sendEventToMmui(uiaId, SensActions.showErrorCtxt)

    return false
  }
}

const handleDataCtxReady = async function () {
  if (!this._currentContext || !this._currentContextTemplate) {
    return
  }

  const counterCopy = counter

  const isOk = await upadteOBD2DataList(this._currentContextTemplate.list2Ctrl)

  if (isOk) {
    while (await upadteOBD2DataList(this._currentContextTemplate.list2Ctrl)) {
      await delay(5)

      if (counterCopy !== counter) {
        break
      }
    }
  }
}

const handleDataCtxOut = function () {
  counter++
}

const handleErrorCtxReady = function () {
  this._currentContextTemplate.dialog3Ctrl.setText1(latestOBD2Error)
}

const handleErrorCtxBack = function (ctrl, appData) {
  framework.sendEventToMmui(uiaId, appData)
}

const patchUpdateApplicationStructure = () => {
  const originalFn = systemApp.prototype._updateApplicationStructure

  systemApp.prototype._updateApplicationStructure = function (
    vehicleConfiguration: string,
  ) {
    originalFn.bind(this)(vehicleConfiguration)

    this._applicationsCtxtWiseAppNames['VehicleStatusMonitor'].push('sensors')
  }
}

const pathcInitApplicationsDataList = () => {
  const originalFn = systemApp.prototype._initApplicationsDataList

  systemApp.prototype._initApplicationsDataList = function () {
    originalFn.bind(this)()

    this._masterApplicationDataList.items.push({
      appData: {
        appName: 'sensors',
        isVisible: true,
        audioSourceId: 'None',
        mmuiEvent: SensActions.showDataCtxt,
      },
      text1Id: 'SensorsApp',
      disabled: false,
      itemStyle: 'style22',
      hasCaret: false,
    })
  }
}

const patchAppInit = () => {
  const originalFn = systemApp.prototype.appInit

  systemApp.prototype.appInit = function () {
    originalFn.bind(this)()

    this._contextTable[SensDataCtxt] = {
      leftBtnStyle: 'goBack',
      sbNameId: 'SensorsApp',
      template: 'List2Tmplt',
      controlProperties: {
        List2Ctrl: {
          titleConfiguration: 'noTitle',
          dataList: null,
          numberedList: false,
        },
      },
      readyFunction: handleDataCtxReady.bind(this),
      contextOutFunction: handleDataCtxOut.bind(this),
    }

    this._contextTable[SensErrorCtxt] = {
      template: 'Dialog3Tmplt',
      controlProperties: {
        Dialog3Ctrl: {
          titleStyle: 'titleStyle01',
          titleId: 'SensorsErrorTitle',
          contentStyle: 'style02',
          fullScreen: true,
          defaultSelectCallback: handleErrorCtxBack.bind(this),
          buttonCount: 1,
          buttonConfig: {
            button1: {
              labelId: 'SensorsErrorBack',
              appData: SensActions.backFromErrorCtxt,
            },
          },
          text1: 'Unknown error',
        },
      },
      readyFunction: handleErrorCtxReady.bind(this),
    }
  }
}

export const patchSystemApp = () => {
  patchUpdateApplicationStructure()
  pathcInitApplicationsDataList()
  patchAppInit()
}
