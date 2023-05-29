import { app } from 'electron'
import * as path from 'path'

const appPath = app.getAppPath()

export const images = {
  appImage: path.join(appPath, 'images/icon1024.png'),
  trackingAppImage: path.join(
    appPath,
    process.platform === 'darwin' ? 'images/tray-icon-tracking-darwin@2x.png' : 'images/tracking@2x.png',
  ),
  pausedAppImage: path.join(
    appPath,
    process.platform === 'darwin' ? 'images/tray-icon-paused-darwin@2x.png' : 'images/pause@2x.png',
  ),
}
