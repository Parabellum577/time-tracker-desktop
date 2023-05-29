import { put, delay } from 'redux-saga/effects'

import time from '@services/time'
import * as actions from './actions'

export function* newDayDetectionSaga() {
  let lastDate = new Date().getDate()
  while (true) {
    yield delay(1000)
    const nowDate = new Date(new Date().getTime() + 3000).getDate()
    if (lastDate !== nowDate) {
      console.log('NEW DAY!!!!!!!!!!!!!!!!!!', time.now())
      yield put(actions.newDayDetection())
      yield delay(4000)
      lastDate = nowDate
    }
  }
}
