import { patchSchedmaintAppDictRu } from './dictRu'
import { patchSchedmaintApp } from './app'

declare global {
  interface Window {
    applyEngineHoursDictRuExt: () => void
    applyEngineHoursExt: () => void
  }

  const Localization_schedmaintAppDict_ru_RU: Record<string, string>
}

window.applyEngineHoursDictRuExt = patchSchedmaintAppDictRu
window.applyEngineHoursExt = patchSchedmaintApp
