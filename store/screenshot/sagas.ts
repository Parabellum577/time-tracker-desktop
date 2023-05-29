import * as _ from 'lodash'
import { SagaIterator } from 'redux-saga'
import { call, take, race, put, select } from 'redux-saga/effects'
import { getType } from 'typesafe-actions'

import { IUserScreenshotSettings } from '@types'
import * as loginActions from '../auth/actions'
import * as screenshotActions from '@store/screenshot/actions'
import * as actions from './actions'
import api from '@api'
import persistStore from '@store/persistStore'
import { IRootState } from '@store/rootReducer'

export const getCurentUser = (state: IRootState) => state.user.currentUser

export function* handleDefaultStatusSaga() {
  while (true) {
    const { payload } = yield take(getType(screenshotActions.handleScreenshotStatus.request))
    if (payload && !_.isNull(payload.newScreenshotStatus) && !_.isUndefined(payload.newScreenshotStatus)) {
      const { UserID } = yield select(getCurentUser)
      persistStore.set(`screenshotStatus_${UserID}`, payload.newScreenshotStatus)
      yield put(
        screenshotActions.handleScreenshotStatus.success({
          newScreenshotStatus: payload.newScreenshotStatus,
        }),
      )
    } else {
      yield put(screenshotActions.handleScreenshotStatus.success({ newScreenshotStatus: null }))
    }
  }
}

export function* getScreenshotStorageSaga(): SagaIterator {
  while (true) {
    yield race({
      screenshotStorage: take(getType(actions.getScreenshotStorage.request)),
      userLogin: take(getType(loginActions.loginUser.success)),
    })
    yield call(getScreenshotStorage)
  }
}

export function* getScreenshotStorage() {
  try {
    const storage: IUserScreenshotSettings = yield call(api.screenshot.UserAccountInfo)
    yield put(actions.getScreenshotStorage.success(storage))
  } catch (e) {
    yield put(actions.getScreenshotStorage.failure(e))
  }
}

export function* addScreenshotStorageSaga(): SagaIterator {
  while (true) {
    const newStorage = yield take(getType(actions.addScreenshotStorage.request))
    yield call(addScreenshotStorage, newStorage)
  }
}

export function* addScreenshotStorage(newStorage: IUserScreenshotSettings) {
  try {
    yield put(actions.addScreenshotStorage.success(newStorage))
  } catch (e) {
    yield put(actions.addScreenshotStorage.failure(e))
  }
}
