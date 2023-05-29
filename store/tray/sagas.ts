import { SagaIterator } from 'redux-saga'
import { take, race, call, delay } from 'redux-saga/effects'
import { startPlanning, stopPlanning, setExtra } from '@store/plannings/actions'
import TraySettings from '@services/tray/tray'
import { images } from '@services/tray/images'
import { getFullSpentTime, getActivePlanning } from '@services/helpers'
import { TimerState, createCanvasIcon } from '@services/tray/tray-icon-create'
import { IPlanning } from '@services/types'

const trayMenu = TraySettings.getInstance()

export function* changeTrayIcon(): SagaIterator {
  while (true) {
    yield race([take(startPlanning.success), take(stopPlanning.success)])
    const activePlanning: IPlanning = yield call(getActivePlanning)
    yield call(handleSetTrayIcon, activePlanning)
  }
}

export function* updateStateOfTrayIcon(): SagaIterator {
  let activePlanning: IPlanning
  while (true) {
    const plannedTime = activePlanning && activePlanning.Estimation
    const spentTime: number = activePlanning && getFullSpentTime(activePlanning)
    const updateIntervalValue = Math.round(plannedTime * 0.05 * 1000)
    const remainingTimeToExpired = plannedTime - spentTime
    const detectOverdueComing = remainingTimeToExpired >= 0 && remainingTimeToExpired < updateIntervalValue / 1000
    const updateIntervalValueBeforeOverdue = remainingTimeToExpired * 1000

    yield race([
      take(setExtra),
      take(stopPlanning.success),
      delay(detectOverdueComing ? updateIntervalValueBeforeOverdue : updateIntervalValue),
    ])

    activePlanning = yield call(getActivePlanning)

    if (!activePlanning) {
      yield take(startPlanning.success)
    }

    if (activePlanning && !activePlanning.IsColdPlanning) {
      yield call(handleSetTrayIcon, activePlanning)
    }
  }
}

function handleSetTrayIcon(activePlanning: IPlanning) {
  if (activePlanning) {
    const IsColdPlanning = activePlanning.IsColdPlanning

    if (IsColdPlanning) {
      trayMenu.setIcon(images.trackingAppImage)
    } else {
      const spentTime: number = getFullSpentTime(activePlanning)
      const plannedTime: number = !IsColdPlanning && activePlanning.Estimation

      const getStateOfTracking = () => {
        return spentTime < plannedTime ? 'taskTracking' : 'overdue'
      }

      const state: TimerState = getStateOfTracking()

      createCanvasIcon(state, spentTime, plannedTime)
    }
  } else {
    trayMenu.setIcon(images.pausedAppImage)
  }
}
