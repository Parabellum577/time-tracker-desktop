import * as _ from 'lodash'
import { SagaIterator } from 'redux-saga'
import { put, take, select, spawn, delay } from 'redux-saga/effects'
import { getType } from 'typesafe-actions'

import { IRootState } from '@store/rootReducer'
import * as actions from './actions'
import { IAlert } from './types'

export const alertsArrayFromStore = (state: IRootState) => state.alerts.alertsArray

export function* showAlertsSaga(): SagaIterator {
  while (true) {
    const { payload } = yield take(getType(actions.showAlertMessage.request))
    let alertsArray: IAlert[] = yield select(alertsArrayFromStore)
    if (_.isEmpty(alertsArray)) {
      yield spawn(function*() {
        while (true) {
          yield delay(3000)
          alertsArray = yield select(alertsArrayFromStore)
          if (_.isEmpty(alertsArray)) {
            return
          }
          yield put(actions.clearAlertMessage.success())
        }
      })
    }
    yield put(actions.showAlertMessage.success(payload))
  }
}

export function* handleShowAlerts(alert: IAlert) {
  yield put(actions.showAlertMessage.success(alert))
}

export function* clearAlertsSaga(): SagaIterator {
  while (true) {
    yield take(getType(actions.clearAlertMessage.request))
    yield put(actions.clearAlertMessage.success())
  }
}
