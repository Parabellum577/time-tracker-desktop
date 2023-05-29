import { take, race, call } from 'redux-saga/effects'
import { SagaIterator } from 'redux-saga'
import { BrowserWindow, app } from 'electron'
import * as helpActions from '@store/helpIntegration/actions'
import { IHintType } from './types'

function handleCloseWindow(window: BrowserWindow) {
  return new Promise(res => {
    window.once('closed', () => {
      res()
    })
  })
}

export function* openHelpWindow(): SagaIterator {
  while (true) {
    const { payload } = yield take(helpActions.showHelpWindow)

    const isGif = payload.templateWithGif

    let helpWin = new BrowserWindow({
      width: isGif ? 1120 : 600,
      height: isGif ? 770 : 800,
      resizable: false,
    })

    const appPath = app.getAppPath()
    const templatePath = `file://${appPath}/help-instructions/${payload.hintTemplate}`

    helpWin.webContents.on('did-finish-load', () => {
      helpWin.setTitle(payload.hintName)
    })

    helpWin.setMenuBarVisibility(false)
    helpWin.loadURL(templatePath)

    yield race([take(helpActions.closeHelpWindow), call(handleCloseWindow, helpWin)])

    if (!helpWin.isDestroyed()) {
      helpWin.close()
    }

    helpWin = null
  }
}
