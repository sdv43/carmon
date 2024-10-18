import { writeError } from '../../utils'
import { state, stateInit, stateSave } from './state'

const uiaId = 'schedmaint'

export const EHConfigCtxt = 'EngineHoursConfiguration'
export const EHResetCtxt = 'EngineHoursResetConfirmation'

export const EHActions = {
  setOnOff: 'ehactionSetOnOff',
  setHoursLimit: 'ehactionSetHoursLimit',
  showResetCtxt: 'ehactionShowResetCtxt',
  resetHours: 'ehactionResetHours',
  cancelResetHours: 'ehactionCancelResetHours',
  showConfigCtxt: 'ehactionShowConfigCtxt',
}

const buildListItems = () => {
  return [
    {
      appData: EHActions.setOnOff,
      text1Id: 'Setting',
      itemStyle: 'styleOnOff',
      hasCaret: false,
      value: state.enabled ? 1 : 0,
    },
    {
      appData: EHActions.setHoursLimit,
      itemStyle: 'styleStep',
      text1Id: 'engineHoursDueIn',
      label1Id: 'Hours',
      label2: Math.round(state.hours / 3600),
      label2Id: 'hours',
      label2SubMap: { value: Math.round(state.hours / 3600) },
      hasCaret: false,
      value: Math.round(state.hours / 3600),
      min: 0,
      max: 500,
      increment: 20,
      styleMod: 'hint',
    },
    {
      appData: EHActions.showResetCtxt,
      text1Id: 'Reset',
      hasCaret: false,
      itemStyle: 'style01',
    },
  ]
}

const handleDetailCtxReady = function () {
  const isWarning = Math.round(state.hours / 3600) < 20
  const items = buildListItems()

  this._currentContextTemplate.list2Ctrl.setTitle({
    text1Id: 'engineHoursChange',
    titleStyle: isWarning ? 'style02a' : 'style02',
    image1: isWarning ? 'apps/schedmaint/images/Icn_Warning_75.png' : undefined,
    styleMod: isWarning ? 'both' : undefined,
  })

  this._currentContextTemplate.list2Ctrl.setDataListAndUpdateItems({
    itemCountKnown: true,
    itemCount: state.enabled ? items.length : 1,
    items: items,
  })
}

const handleDetailCtxItemClick = (listCtrlObj, appData, params) => {
  switch (appData) {
    case EHActions.setOnOff: {
      state.enabled = params.additionalData == 1
      const items = buildListItems()

      listCtrlObj.setDataListAndUpdateItems({
        itemCountKnown: true,
        itemCount: state.enabled ? items.length : 1,
        items: items,
      })

      stateSave()
      break
    }

    case EHActions.setHoursLimit:
      state.hoursLimit = params.value
      state.hours = params.value * 3600

      stateSave()
      break

    case EHActions.showResetCtxt:
      framework.sendEventToMmui(uiaId, appData)
      break
  }
}

const handleResetCtxButtonClick = (listCtrlObj, appData) => {
  switch (appData) {
    case EHActions.cancelResetHours:
      framework.sendEventToMmui(uiaId, appData, null)
      break
    case EHActions.resetHours:
      state.hours = state.hoursLimit * 3600
      framework.sendEventToMmui(uiaId, EHActions.cancelResetHours, null)

      stateSave()
      break
  }
}

const patchUpdateListTestCtrl = () => {
  const originalFn = schedmaintApp.prototype._updateListTestCtrl

  schedmaintApp.prototype._updateListTestCtrl = function () {
    originalFn.bind(this)()

    if (
      this._currentContextTemplate &&
      this._currentContext &&
      this._currentContext.ctxtId === 'MaintenanceList'
    ) {
      const isWarning = Math.round(state.hours / 3600) < 20

      this._MaintenanceListCtxtDataList.items.push({
        appData: EHActions.showConfigCtxt,
        text1Id: 'engineHoursChange',
        image1: isWarning
          ? 'apps/schedmaint/images/Icn_Warning_75.png'
          : undefined,
        label1Warning: isWarning,
        label1Id: state.enabled ? 'hours' : 'Off',
        label1SubMap: {
          value: state.enabled ? Math.round(state.hours / 3600) : 0,
        },
        label1Align: state.enabled ? 'left' : 'center',
        labelWidth: state.enabled ? 'wide' : undefined,
        hasCaret: true,
        itemStyle: 'style06',
        disabled: state.disabled,
      })

      this._MaintenanceListCtxtDataList.itemCount += 1
      this._updateDataList()
    }
  }
}

const patchListItemClickCallback = () => {
  const originalFn = schedmaintApp.prototype._listItemClickCallback

  schedmaintApp.prototype._listItemClickCallback = function (
    listCtrlObj,
    appData,
    params,
  ) {
    if (appData == EHActions.showConfigCtxt) {
      framework.sendEventToMmui(uiaId, appData)
    } else {
      originalFn.bind(this)(listCtrlObj, appData, params)
    }
  }
}

const patchAppInit = () => {
  const originalFn = schedmaintApp.prototype.appInit

  schedmaintApp.prototype.appInit = function () {
    originalFn.bind(this)()

    const isWarning = Math.round(state.hours / 3600) < 20
    const items = buildListItems()

    this._contextTable[EHConfigCtxt] = {
      template: 'List2Tmplt',
      leftBtnStyle: 'goBack',
      sbNameId: 'Maintenance',
      controlProperties: {
        List2Ctrl: {
          titleConfiguration: 'listTitle',
          title: {
            text1Id: 'engineHoursChange',
            titleStyle: isWarning ? 'style02a' : 'style02',
            image1: isWarning
              ? 'apps/schedmaint/images/Icn_Warning_75.png'
              : undefined,
            styleMod: isWarning ? 'both' : undefined,
          },
          selectCallback: handleDetailCtxItemClick,
          dataList: {
            itemCountKnown: true,
            itemCount: state.enabled ? items.length : 1,
            items: items,
          },
        },
      },
      readyFunction: handleDetailCtxReady.bind(this),
    }

    this._contextTable[EHResetCtxt] = {
      template: 'Dialog3Tmplt',
      controlProperties: {
        Dialog3Ctrl: {
          text1Id: 'confirmOffEngineHours',
          defaultSelectCallback: handleResetCtxButtonClick,
          contentStyle: 'style02',
          fullScreen: false,
          buttonConfig: {
            button1: {
              buttonColor: 'normal',
              buttonBehavior: 'shortPressOnly',
              labelId: 'Back',
              appData: EHActions.cancelResetHours,
              disabled: false,
            },
            button2: {
              buttonColor: 'normal',
              buttonBehavior: 'shortPressOnly',
              labelId: 'Reset',
              appData: EHActions.resetHours,
              disabled: false,
            },
          },
        },
      },
    }

    stateInit()
      .then(() => {
        this._updateListTestCtrl()
      })
      .catch((error) => {
        writeError('engineHours/app.ts stateInit', error)
      })
  }
}

export const patchSchedmaintApp = () => {
  patchAppInit()
  patchUpdateListTestCtrl()
  patchListItemClickCallback()
}
