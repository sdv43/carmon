import { patchGuiFramework } from './GuiFramework'

declare global {
  interface Window {
    applyMmuiExt: () => void
  }
}

window.applyMmuiExt = patchGuiFramework
