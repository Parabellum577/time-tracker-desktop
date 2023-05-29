import { BrowserWindow, app, shell } from 'electron'
import { SagaIterator } from 'redux-saga'
import { take } from 'redux-saga/effects'
import * as actions from './actions'

export function* openChatSaga(): SagaIterator {
  let chatWindow: BrowserWindow = null

  while (true) {
    yield take(actions.openChatWindowAction)

    if (!chatWindow || chatWindow.isDestroyed()) {
      chatWindow = openChatWindow()
    } else {
      chatWindow.focus()
    }
  }
}

function openChatWindow() {
  const appPath = app.getAppPath()

  const windowOptions = {
    width: 376,
    height: 660,
    resizable: false,
    autoHideMenuBar: true,
  }

  const chatWindow = new BrowserWindow(windowOptions)

  chatWindow.loadURL(`file://${appPath}/chat.html`)

  chatWindow.webContents.on('new-window', (e, url) => {
    e.preventDefault()
    chatWindow.webContents.send('blocked-new-window', url)
    shell.openExternal(url)
  })

  return chatWindow
}
