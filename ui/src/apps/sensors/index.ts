import { patchSystemApp } from './app'
import { patchSystemAppDictRu } from './dictRu'

declare global {
  interface Window {
    applySensorsDictRuExt: () => void
    applySensorsExt: () => void
  }

  const Localization_systemAppDict_ru_RU: Record<string, string>
}

window.applySensorsDictRuExt = patchSystemAppDictRu
window.applySensorsExt = patchSystemApp
