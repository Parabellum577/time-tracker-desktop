import { Tray, Menu, app, ipcMain } from 'electron'
import { images } from './images'
import { getWindow, createWindow } from '@electronMain/src/helpers/browserWindow'

export default class TraySettings {
  public static getInstance() {
    if (!this.INSTANCE) {
      this.INSTANCE = new TraySettings()
    }
    return this.INSTANCE
  }
  private static INSTANCE: TraySettings
  public tray: Tray

  private constructor() {}

  public createTrayMenu = () => {
    this.tray = new Tray(images.pausedAppImage)

    this.tray.setToolTip('timetracker')

    if (process.platform === 'darwin') {
      app.dock.setIcon(images.appImage)
    }

    this.tray.on('double-click', () => {
      const currentWindow = getWindow()
      if (!currentWindow) {
        createWindow()
      } else {
        currentWindow.show()
        currentWindow.focus()
      }
    })

    this.updateContextMenu()
  }

  public setIcon = (newIcon: Electron.NativeImage | string) => {
    this.tray.setImage(newIcon)
  }

  public updateContextMenu = () => {
    const contextMenu = Menu.buildFromTemplate(this.getItems())
    const mainWindow = getWindow()
    this.tray.setContextMenu(contextMenu)

    ipcMain.on('mainWindow-opened', () => this.updateContextMenu())
    ipcMain.on('mainWindow-closed', (e: Event) => {
      if (mainWindow) {
        mainWindow.once('closed', this.updateContextMenu)
      }
      e.returnValue = true
    })
  }

  public getItems = () => {
    const currentWindow = getWindow()
    const isAppOpen = currentWindow && !currentWindow.isDestroyed()
    const menuItems = [
      {
        label: isAppOpen ? 'Hide to tray' : 'Show timetracker',
        click: () => {
          if (getWindow()) {
            currentWindow.close()
          } else {
            createWindow()
          }
          this.updateContextMenu()
        },
      },
      {
        label: 'Quit',
        click: () => {
          console.log('CLOSE_APP_VIA_TRAY')
          ipcMain.emit('close-application')
        },
      },
    ]

    return menuItems
  }
}
