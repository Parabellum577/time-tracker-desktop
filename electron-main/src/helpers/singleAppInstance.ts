import { app } from 'electron'
import Token from './token'
import { createWindow, getWindow } from './browserWindow'
import { REASON_FOR_QUIT_KEY } from './memoryLeakDetection'
import persistStore from '@store/persistStore'

export const singleAppInstance = (readyCallback: () => Promise<void>) => {
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    persistStore.set(REASON_FOR_QUIT_KEY, 'CLOSE_APP')
    app.quit()
  } else {
    app.on('second-instance', async (event, commandLine) => {
      // Someone tried to run a second instance, we should focus our window.
      const win = getWindow() || createWindow()

      console.log('SINGLE PAGE INSTANCE')
      console.log(commandLine.slice(1).toString())

      Token.loginByOTSCode(commandLine.slice(1).toString(), win)
      win.show()
      win.focus()
    })
  }
}
