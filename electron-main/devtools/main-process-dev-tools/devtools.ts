import { ipcMain, BrowserWindow } from 'electron'
import * as path from 'path'
let devtoolsWindow: BrowserWindow
let requstQueue: any[] = []

const init = () =>
  new Promise(resolve => {
    devtoolsWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        nodeIntegration: true,
      },
    })
    devtoolsWindow.loadFile('./electron-main/devtools/main-process-dev-tools/devtools.html')

    const listenerNames: string[] = ['requestStarted', 'requestSuccess', 'requestError']
    devtoolsWindow.on('ready-to-show', () => {
      setTimeout(resolve, 3000)
      devtoolsWindow.showInactive()
      requstQueue.forEach(request => {
        devtoolsWindow.webContents.send(request.name, request.arg)
      })
      requstQueue = []
    })
    const listener = (name: string) => (event: Event, arg: any) => {
      sendToNetworkMonitor(name, arg)
    }
    listenerNames.forEach(name => ipcMain.on(name, listener(name)))
  })

export const sendToNetworkMonitor = (name: string, arg: any) => {
  if (devtoolsWindow && !devtoolsWindow.isDestroyed()) {
    devtoolsWindow.webContents.send(name, arg)
  } else {
    requstQueue.push({ name, arg })
  }
}

export default init
