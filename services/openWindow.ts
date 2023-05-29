import { BrowserWindow, screen, app, shell } from 'electron'
import * as path from 'path'

export function openExternal(url: string) {
  shell.openExternal(url)
}

export function openNotificationWindow() {
  const appPath = path.join(app.getAppPath())

  const size = screen.getPrimaryDisplay().workAreaSize
  const windowOptions = {
    width: 384,
    height: 84,
    x: size.width - 404,
    y: size.height - 104,
    useContentSize: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      devTools: false,
      experimentalFeatures: true,
      webSecurity: false,
      nodeIntegration: true,
    },
    focusable: false,
    movable: false,
    show: false,
    transparent: true,
  }

  if (process.platform !== 'linux') {
    windowOptions.transparent = true
  }

  const notificationWindow = new BrowserWindow(windowOptions)
  notificationWindow.loadURL(`file://${appPath}/notifications.html`)

  return notificationWindow
}
