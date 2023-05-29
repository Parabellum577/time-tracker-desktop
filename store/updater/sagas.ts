import { SagaIterator } from 'redux-saga'
import { app } from 'electron'
import { autoUpdater } from 'electron-updater'
import LinuxAutoUpdater from './linuxAutoUpdater'

import * as isDev from 'electron-is-dev'
import { race, delay, put, take, call, fork, cancel } from 'redux-saga/effects'
import { showNotification } from '../notifications/actions'
import * as actions from './actions'
import { getType, ActionType } from 'typesafe-actions'

import { stopPlanning, startPlanning } from '@store/plannings/actions'
import { getWindowVisibility } from '@electronMain/src/helpers/browserWindow'
import time from '@services/time'
import { isIdle } from '@store/idleDetectionElectron/sagas'
import persistStore from '@store/persistStore'
import { REASON_FOR_QUIT_KEY } from '@electronMain/src/helpers/memoryLeakDetection'

const isSilent = false
const isForceRunAfter = true

const updater = process.env.TARGET_PACKAGE !== 'deb' ? autoUpdater : LinuxAutoUpdater
const autoUpdaterPackages = ['deb', 'dmg', 'pkg', 'nsis', 'AppImage']

function* updateEventsListener(eventName: 'update-downloaded' | 'update-not-available'): SagaIterator {
  let handler: (...args: any[]) => void
  try {
    yield call(
      () =>
        new Promise(resolve => {
          handler = resolve
          updater.addListener(eventName, handler)
        }),
    )
  } catch (error) {
    console.log('remove listener')
    updater.removeListener(eventName, handler)
  }
  return true
}

export function* updaterIterator(): SagaIterator {
  if (isDev) {
    return
  }

  if (!autoUpdaterPackages.includes(process.env.TARGET_PACKAGE)) {
    return
  }

  let isUpdateAvailable = false
  updater.once('error', (e: any) => {
    console.error(e)
  })

  const url = `${process.env.API_URL}/distribution/${process.platform}/${process.env.UPDATE_FOLDER}`

  updater.setFeedURL(url)

  while (true) {
    if (!isUpdateAvailable) {
      console.log('checkForUpdates')
      updater.checkForUpdates()

      console.log('wait response updateAvailable | updateNotAvailable')
      const { updateAvailable, updateNotAvailable } = yield race({
        updateAvailable: call(updateEventsListener, 'update-downloaded'),
        updateNotAvailable: call(updateEventsListener, 'update-downloaded'),
      })
      if (updateAvailable) {
        isUpdateAvailable = true
        console.log('Update available')
      } else {
        console.log('Update not available')
      }
      updater.removeAllListeners('update-downloaded')
      updater.removeAllListeners('update-not-available')
    }

    if (isUpdateAvailable) {
      yield put(showNotification.request({ notificationType: 'Update' }))
      yield put(actions.updateAvailable(true))
    }

    yield delay(10 * 60 * 1000)
  }
}

export function* updateApplicationIterator(): SagaIterator {
  console.log(`wait take(actions.updateApplication)`)
  while (true) {
    yield take(actions.updateApplication)
    console.log(`run updater.quitAndInstall`)
    persistStore.set(REASON_FOR_QUIT_KEY, 'UPDATE')
    if (process.platform !== 'win32') {
      app.relaunch()
    }
    updater.quitAndInstall(isSilent, isForceRunAfter)
  }
}

export function* delayReboot(
  stopPlanningAction: ActionType<typeof stopPlanning.request>,
  timeStopped: number,
  isActivePlanning: boolean,
) {
  const isActiveWindow = getWindowVisibility()
  const now = time.now()
  const stopedTimeAgo = now - timeStopped

  if (
    !isActiveWindow &&
    !isIdle &&
    (!stopPlanningAction || !stopPlanningAction.payload || stopPlanningAction.payload.reason !== 'idle') &&
    stopedTimeAgo >= 120 &&
    !isActivePlanning
  ) {
    updater.checkForUpdates()

    const { updateAvailable } = yield race({
      updateAvailable: call(updateEventsListener, 'update-downloaded'),
      updateNotAvailable: call(updateEventsListener, 'update-not-available'),
    })

    if (updateAvailable) {
      if (process.platform !== 'win32') {
        app.relaunch()
      }
      updater.quitAndInstall(isSilent, isForceRunAfter)
    }
  }
}

export function* rebootAfterInactivity(): SagaIterator {
  let delayTask
  let timeStopped
  let isActivePlanning

  while (true) {
    const { startPlanningAction, stopPlanningAction } = yield race({
      startPlanningAction: take(getType(startPlanning.success)),
      stopPlanningAction: take(getType(stopPlanning.request)),
      delay: delay(60 * 2 * 1000),
    })

    if (startPlanningAction) {
      isActivePlanning = true
    } else if (stopPlanningAction) {
      timeStopped = time.now()
      isActivePlanning = false
    }

    if (delayTask) {
      cancel(delayTask)
    }

    if (!startPlanningAction) {
      delayTask = yield fork(delayReboot, stopPlanningAction, timeStopped, isActivePlanning)
    }
  }
}
