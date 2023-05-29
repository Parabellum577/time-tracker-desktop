import { SagaIterator } from 'redux-saga'
import { call, put, take, race } from 'redux-saga/effects'
import { getType } from 'typesafe-actions'

import * as _ from 'lodash'
import * as loginActions from '../auth/actions'
import * as actions from './actions'
import api from '@api'
import { ITrackerWithStatus } from '@types'

export function* getUserTrackersSaga(): SagaIterator {
  while (true) {
    yield race({
      getUserTrackersRequest: take(getType(actions.getUserTrackers.request)),
      userLogin: take(getType(loginActions.loginUser.success)),
    })
    yield call(getUserTrackers)
  }
}

export function* getUserTrackers() {
  try {
    const trackers: ITrackerWithStatus[] = yield call(api.tracker.GetUserTrackers)
    yield put(actions.getUserTrackers.success(trackers))
  } catch (e) {
    yield put(actions.getUserTrackers.failure(e))
  }
}
