import persistStore from '../persistStore'
const Launch = require('auto-launch')

interface IConfig {
  name: string
  isHidden: boolean
  path?: string
}

const config: IConfig = {
  name: 'timetracker',
  isHidden: true,
}

if (process.platform === 'darwin') {
  config.path = `${process.execPath.match(/.*?\.app/)[0]}`
}

const AutoLaunchApp = new Launch(config)
if (!persistStore.get('isNotFirstStart')) {
  AutoLaunchApp.enable()
  persistStore.set('isNotFirstStart', true)
}

export const handleAutoLaunch = async () => {
  const isAutoLaunchOn = await AutoLaunchApp.isEnabled()
  if (isAutoLaunchOn) {
    await AutoLaunchApp.disable()
  } else {
    await AutoLaunchApp.enable()
  }
}

export const autoLaunchState = () => {
  return AutoLaunchApp.isEnabled()
}
