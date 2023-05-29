import { BrowserWindow, app } from 'electron'

const appPath = app.getAppPath()

export default async function createTrayWindow() {
  const windowSettings = {
    show: false,
    webPreferences: { offscreen: true },
  }

  let trayWindow: BrowserWindow = null

  trayWindow = new BrowserWindow(windowSettings)

  trayWindow.loadURL(`file://${appPath}/services/tray/tray.html`)

  return trayWindow
}

export const closeTrayWindow = (window: BrowserWindow) => {
  if (window) {
    window.close()
    window = null
  }
}
