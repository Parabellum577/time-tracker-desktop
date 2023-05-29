import { app, ipcMain } from 'electron'
import * as os from 'os'
import persistStore from '@store/persistStore'

const MAX_HEAP_SIZE = 524288000 // 500 MB

export const RELAUNCH_AFTER_CRASH_FLAG = '--relaunch-after-crash'

export default () => {
  setInterval(() => {
    const { totalPhysicalSize } = process.getHeapStatistics()
    if (totalPhysicalSize > MAX_HEAP_SIZE) {
      console.log('totalPhysicalSize', totalPhysicalSize)
      const filePath = `${os.tmpdir()}/df-profiler.heapsnapshot`
      console.log('Take snapshot status: ', process.takeHeapSnapshot(filePath))
      if (process.platform !== 'win32') {
        app.relaunch({ args: process.argv.slice(1).concat([RELAUNCH_AFTER_CRASH_FLAG]) })
      }
      app.exit()
    }
  }, 60000)

  ipcMain.on('TAKE_HEAP_SNAPSHOT', () => {
    const filePath = `${os.tmpdir()}/df-profiler.heapsnapshot`
    console.log('Take snapshot status: ', process.takeHeapSnapshot(filePath))
  })
}

export const REASON_FOR_QUIT_KEY = 'REASON_FOR_QUIT'

export const handleCrash = () => {
  const reasonForQuit: 'CLOSE_APP' | 'CRASH' | 'UPDATE' = persistStore.get(REASON_FOR_QUIT_KEY)
  if (reasonForQuit === 'CLOSE_APP') {
    persistStore.set(REASON_FOR_QUIT_KEY, 'NULL')
    app.exit()
    return false
  }
  if (reasonForQuit === 'CRASH') {
    console.log('APP CRASHED AND SUCCESSFULLY RESTARTED')
  }
  app.relaunch()
  persistStore.set(REASON_FOR_QUIT_KEY, 'CRASH')
  return true
}
