import { BrowserWindow, screen, app, ipcMain } from 'electron'
import * as isDev from 'electron-is-dev'

import * as path from 'path'

import { images } from '../../../services/tray/images'
import { RELAUNCH_AFTER_CRASH_FLAG } from './memoryLeakDetection'

let mainWindow: Electron.BrowserWindow
const appPath = path.join(app.getAppPath())
export const getWindow = () => mainWindow

let windowVisibilityState = false
export const getWindowVisibility = () => {
  return windowVisibilityState
}

let isRelaunchAfterCrash = process.argv.some(p => p.includes(RELAUNCH_AFTER_CRASH_FLAG))

export function createWindow() {
  if (isRelaunchAfterCrash) {
    isRelaunchAfterCrash = false
    return
  }

  // Create the browser window.
  let workAreaSize = screen.getPrimaryDisplay().workAreaSize.height
  const withoutFrame = process.platform === 'win32' || 'linux'
  const additionalHeight = withoutFrame && process.platform === 'win32' ? 48 : 30
  const height = 800 + additionalHeight

  const config: Electron.BrowserWindowConstructorOptions = {
    width: 445,
    height: Math.min(height, workAreaSize - 20),
    skipTaskbar: false,
    show: false,
    resizable: false,
    icon: images.appImage,
    backgroundColor: '#282f36',
    frame: !withoutFrame,
    titleBarStyle: 'hiddenInset',
    maximizable: false,
    fullscreenable: false,
    webPreferences: {
      experimentalFeatures: true,
      webSecurity: false,
      nodeIntegration: true,
      sandbox: false,
    },
  }

  mainWindow = new BrowserWindow(config)
  mainWindow.center()

  mainWindow.on('blur', () => {
    windowVisibilityState = false
  })
  mainWindow.on('focus', () => {
    windowVisibilityState = true
  })

  if (!isDev) {
    mainWindow.loadURL(`file://${appPath}/build-render/index.html`)

    // mainWindow.webContents.on('crashed', () => {
    //   app.relaunch()
    //   app.exit()
    // })

    // mainWindow.on('unresponsive', () => {
    //   app.relaunch()
    //   app.exit()
    // })
  } else {
    mainWindow.loadURL('http://localhost:3000')
    BrowserWindow.addDevToolsExtension('./electron-main/devtools/react-dev-tools')
    BrowserWindow.addDevToolsExtension('./electron-main/devtools/redux-dev-tools')
    const { client } = __non_webpack_require__('electron-connect')
    client.create(mainWindow)

    mainWindow.webContents.on('devtools-reload-page', () => {
      mainWindow.show()
      mainWindow.focus()
    })
  }

  if (process.env.STAGE !== 'production') {
    mainWindow.webContents.openDevTools()
  }

  screen.on('display-metrics-changed', () => {
    workAreaSize = screen.getPrimaryDisplay().workAreaSize.height
    config.height = Math.min(height, workAreaSize - 20)
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setSize(config.width, config.height)
    }
  })

  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      mainWindow.show()
      mainWindow.focus()
    }, 300)
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  return mainWindow
}
