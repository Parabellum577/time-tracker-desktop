import { select, call, fork, take, put, race, delay, cancel } from 'redux-saga/effects'
import * as _ from 'lodash'
import { getType, ActionType } from 'typesafe-actions'
import { powerMonitor, app } from 'electron'
import * as planningsActions from '@store/plannings/actions'
import * as projectsActions from '@store/projects/actions'
import { IPlanning, IDefaultUserSettings } from '@types'
import { IRootState } from '@store/rootReducer'
import { idleDetected, activityDetected } from '@store/idleDetectionElectron/actions'
import { showNotification } from '@store/notifications/actions'
import { getActivePlanning } from '@services/helpers'
import time from '@services/time'

interface IStartStopRace {
  startPlanningAction?: ActionType<typeof planningsActions.startPlanning.success>
  stopPlanningAction?: ActionType<typeof planningsActions.stopPlanning.success>
}

export const getOpenPlanningsFromStore = (state: IRootState) => state.plannings.openPlannings
export const getColdPlanningsFromStore = (state: IRootState) => state.plannings.coldPlannings
export const getUserSettings = (state: IRootState) => state.user.defaultUserSettings
export const getIsMasterFromStore = (state: IRootState) => state.synchronization.isMaster

export function* idleDetectionSaga() {
  let activePlanning: IPlanning = null
  while (true) {
    activePlanning = yield call(getActivePlanning)

    if (!activePlanning) {
      yield take(planningsActions.startPlanning.success)
    }

    const isMaster: IPlanning[] = yield select(getIsMasterFromStore)
    if (!isMaster) {
      yield take(planningsActions.stopPlanning.success)
      continue
    }

    activePlanning = yield call(getActivePlanning)
    if (!activePlanning) {
      continue
    }
    const idleSetting = yield call(getSettings, activePlanning.ProjectID, activePlanning.TrackerID, activePlanning.ID)

    const idleValue = +idleSetting.Value * 60 || 86400 // minutes to seconds
    console.log('Start idleDetectionLoop', idleValue)

    const [isIdleDetected] = yield race([
      call(idleDetectionLoop, idleValue),
      take(planningsActions.stopPlanning.success),
      take(planningsActions.startPlanning.success),
    ])

    if (isIdleDetected) {
      yield put(planningsActions.stopPlanning.request({ reason: 'idle' }))
      yield race([take(planningsActions.stopPlanning.success), take(planningsActions.stopPlanning.failure)])
      yield put(idleDetected(idleValue))
      const [isActivityDetected] = yield race([
        call(handleActivityAfterIdle, idleValue),
        take(planningsActions.startPlanning.success),
        take(planningsActions.stopPlanning.success),
      ])

      if (isActivityDetected) {
        yield put(planningsActions.startPlanning.request({ PlanningID: activePlanning.ID }))
        yield put(activityDetected())
      }
    }
  }
}

function* getSettings(ProjectID: IPlanning['ProjectID'], TrackerID: IPlanning['TrackerID'], ID: IPlanning['ID']) {
  let idleSetting
  if (TrackerID === 0 && ProjectID === '0') {
    const userSettings: IDefaultUserSettings = yield select(getUserSettings)
    idleSetting = {
      Key: 'track-idle-detection',
      Value: userSettings.idle,
    }
  } else {
    yield put(
      projectsActions.getProjectSettings.request({
        ProjectID,
        TrackerID,
      }),
    )
    const getProjectSettingsAction: ActionType<typeof projectsActions.getProjectSettings.success> = yield take(
      projectsActions.getProjectSettings.success,
    )

    const settings = getProjectSettingsAction.payload.settings
    idleSetting = settings.find(setting => setting.Key === 'track-idle-detection')
    if (!idleSetting) {
      idleSetting = {
        Key: 'track-idle-detection',
        Value: '5',
      }
    }
  }
  return idleSetting
}

let isSleepMode = false

const setSleepHandlers = () => {
  powerMonitor.on('shutdown', () => {
    console.log('Shutdown', time.now())
    isSleepMode = true
  })

  powerMonitor.on('suspend', () => {
    console.log('Suspend', time.now())
    isSleepMode = true
  })

  powerMonitor.on('lock-screen', () => {
    console.log('Lock', time.now())
    isSleepMode = true
  })

  powerMonitor.on('unlock-screen', () => {
    console.log('Unlock', time.now())
    isSleepMode = false
  })

  if (process.platform === 'darwin') {
    powerMonitor.on('resume', () => {
      console.log('Resume', time.now())
      isSleepMode = false
    })
  }
}

if (app.isReady()) {
  setSleepHandlers()
} else {
  app.on('ready', setSleepHandlers)
}

export function isIdle(idleTime: number): Promise<boolean> {
  return new Promise(resolve => {
    powerMonitor.querySystemIdleState(idleTime, state => {
      resolve(state !== 'active' || isSleepMode)
    })
  })
}

export function* idleDetectionLoop(idleTime: number) {
  try {
    while (true) {
      yield delay(1000)
      const isIdleDetected = yield call(isIdle, idleTime)
      if (isIdleDetected) {
        console.log('IDLE DETECTED!')
        return true
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    console.log('idleDetectionLoop finished')
  }
}

export function* handleActivityAfterIdle(idleTime: number) {
  console.log('handleActivityAfterIdle')

  try {
    while (true) {
      yield delay(1000)
      const isIdleDetected = yield call(isIdle, idleTime)
      if (!isIdleDetected) {
        console.log('ACTIVITY DETECTED!')
        return true
      }
    }
  } finally {
    console.log('handleActivityAfterIdle finished')
  }
}
