import { SagaIterator } from '@redux-saga/types'

import { race, take, put, delay, select, call } from 'redux-saga/effects'
import { getType } from 'typesafe-actions'
import { startPlanning, stopPlanning, setExtra, planningExpired } from '@store/plannings/actions'
import { showNotification, closeNotification } from '@store/notifications/actions'
import { newDayDetection } from '@store/newDay/actions'
import * as authActions from '@store/auth/actions'
import { IPlanning } from '@types'

import { IRootState } from '@store/rootReducer'
import { getFullSpentTime } from '@services/helpers'
import { idleDetected, activityDetected } from '@store/idleDetectionElectron/actions'

export const getOpenPlanningsFromStore = (state: IRootState) => state.plannings.openPlannings
export const getColdPlanningsFromStore = (state: IRootState) => state.plannings.coldPlannings

export function* stopPlanningInterceptorSaga(): SagaIterator {
  while (true) {
    yield take(getType(stopPlanning.success))
    yield put(showNotification.request({ notificationType: 'StopOfTask' }))
  }
}

export function* breakInterceptorSaga(): SagaIterator {
  while (true) {
    const activePlanning = yield call(getActivePlanning)

    if (!activePlanning) {
      yield take(getType(startPlanning.success))
    }

    const { delaySuccess } = yield race({
      delaySuccess: delay(3 * 60 * 60 * 1000), // 3 hours break
      stopPlanning: take(getType(stopPlanning.success)),
    })

    if (delaySuccess) {
      yield put(showNotification.request({ notificationType: 'Break' }))
    }
  }
}

export function* noRunningTaskInterceptorSaga(): SagaIterator {
  while (true) {
    const isAuthorized = yield select((state: IRootState) => state.auth.authorized)
    if (!isAuthorized) {
      yield take(authActions.loginUser.success)
    }
    const activePlanning = yield call(getActivePlanning)
    let delayTime: number
    let counter: number = 0

    if (activePlanning) {
      yield take(getType(stopPlanning.success))
    } else {
      while (true) {
        if (counter === 0) {
          delayTime = 10 * 60 * 1000
        } else if (counter === 1) {
          delayTime = 1 * 60 * 60 * 1000
        } else {
          delayTime = 3 * 60 * 60 * 1000
        }
        counter++

        const { delaySuccess } = yield race({
          delaySuccess: delay(delayTime),
          start: take(getType(startPlanning.success)),
          logout: take(authActions.signOut),
        })

        if (delaySuccess) {
          yield put(showNotification.request({ notificationType: 'NoTask' }))
        } else {
          break
        }
      }
    }
  }
}

export function* newDayInterceptorSaga(): SagaIterator {
  while (true) {
    yield take(getType(newDayDetection))
    yield put(showNotification.request({ notificationType: 'NewDay' }))
  }
}

function* getActivePlanning() {
  const openPlannings: IPlanning[] = yield select(getOpenPlanningsFromStore)
  const coldPlannings: IPlanning[] = yield select(getColdPlanningsFromStore)
  const activePlanning = openPlannings.concat(coldPlannings).find(p => p.Active)

  return activePlanning
}

export function* taskEndSoonInterceptorSaga(): SagaIterator {
  while (true) {
    let activePlanning = yield call(getActivePlanning)

    if (!activePlanning) {
      yield take(getType(startPlanning.success))
      activePlanning = yield call(getActivePlanning)
    }

    const spentTime = getFullSpentTime(activePlanning)
    const delayTime = (activePlanning.Estimation - spentTime - 10 * 60) * 1000

    if (delayTime > 0) {
      const { delaySuccess } = yield race({
        delaySuccess: delay(delayTime),
        edit: take(getType(setExtra)),
        stop: take(getType(stopPlanning.success)),
      })

      if (delaySuccess) {
        yield put(showNotification.request({ notificationType: 'IssueExp10Min' }))
      }
    } else {
      yield race({
        stop: take(getType(stopPlanning.success)),
        edit: take(getType(setExtra)),
      })
    }
  }
}

export function* planningExpiredInterceptorSaga(): SagaIterator {
  while (true) {
    const { payload } = yield take(getType(planningExpired))
    yield put(showNotification.request({ notificationType: 'IssueExp', IssueTitle: payload.IssueTitle }))
  }
}

export function* idleDetectedInterceptorSaga(): SagaIterator {
  while (true) {
    const { payload: idleTime } = yield take(getType(idleDetected))
    yield put(showNotification.request({ notificationType: 'Idle', idleTime }))
  }
}

export function* activityDetectedSaga(): SagaIterator {
  while (true) {
    yield take(getType(activityDetected))
    yield put(closeNotification())
  }
}
