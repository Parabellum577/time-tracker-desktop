import { app, ipcMain, Menu } from 'electron'
import * as isDev from 'electron-is-dev'

import { createWindow, getWindow } from './helpers/browserWindow'
import TraySettings from '@services/tray/tray'
import { singleAppInstance } from './helpers/singleAppInstance'
import Token from '@electronMain/src/helpers/token'
import mainDevTools from '../devtools/main-process-dev-tools/devtools'
import store from '@store/electron'
import memoryLeakDetection, { handleCrash, REASON_FOR_QUIT_KEY } from './helpers/memoryLeakDetection'
import * as logsProxy from '@services/logsProxy'
import * as analyticsFacade from './analytics/facade'
import persistStore from '@store/persistStore'

logsProxy.init()

if (process.platform !== 'win32') {
  app.disableHardwareAcceleration()
}

if (process.platform === 'win32') {
  handleCrash()
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
app.commandLine.appendSwitch('ignore-certificate-errors', 'true')
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// return from main function is required for preventing issues with power-monitor

const trayMenu = TraySettings.getInstance()
console.log('APP_STARTED')

process.on('exit', code => {
  console.log('APP_CLOSED', code)
})

app.on('open-url', (event, urlString) => {
  // darwin auth
  event.preventDefault()
  const win = getWindow() || createWindow()
  Token.loginByOTSCode(urlString, win)
}) // only first start

const readyCallback = async () => {
  console.log('APP_VERSION:', app.getVersion())
  if (process.platform === 'darwin') {
    Menu.setApplicationMenu(
      Menu.buildFromTemplate([
        {
          label: 'Edit',
          submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { role: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'selectAll' },
            { role: 'quit' },
          ],
        },
      ]),
    )
  }
  if (process.env.STAGE !== 'production') {
    await mainDevTools()
  }
  memoryLeakDetection()
  analyticsFacade.init()
  store()
  createWindow()

  process.on('uncaughtException', event => {
    console.error(event)
    setTimeout(() => {
      persistStore.set(REASON_FOR_QUIT_KEY, 'CRASH')
      if (process.platform !== 'win32') {
        app.relaunch()
      }
      app.exit()
    }, 2000)
  })

  trayMenu.createTrayMenu()

  app.setAsDefaultProtocolClient(process.env.PROTOCOL)

  const otsParameter = process.argv.slice(1).toString()
  if (otsParameter) {
    Token.setNewToken(otsParameter)
  }

  ipcMain.on('app-ready', (event: any) => {
    if (Token.token) {
      event.sender.send('ots-login', Token.token, Token.trackerID, Token.projectID, Token.issueID)
    }
  })

  app.on('open-url', (event, urlString) => {
    // darwin auth
    console.log('darwin token: ', urlString)
    event.preventDefault()
    const mainWindow = getWindow() || createWindow()
    Token.loginByOTSCode(urlString, mainWindow)
    mainWindow.focus()
    mainWindow.show()
  }) // only second start
}

if (!isDev) {
  singleAppInstance(readyCallback)
}

app.on('ready', readyCallback)

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (getWindow() === null) {
    createWindow()
  }
})

app.on('window-all-closed', (event: Event) => {
  event.preventDefault()
  return false
})

ipcMain.on('openDevTools', (event: Event, arg: string) => {
  mainDevTools()
  const mainWindow = getWindow()
  if (mainWindow) {
    mainWindow.webContents.openDevTools()
  }
})
// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
