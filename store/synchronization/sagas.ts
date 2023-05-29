import { take, race, put, call, delay } from 'redux-saga/effects'
import { getType } from 'typesafe-actions'

import * as planningActions from '@store/plannings/actions'
import * as actions from './actions'
import { getAuthData } from '@store/auth/utils'
import { getActivePlanning } from '@services/helpers'
import { IPlanning } from '@services/types'
import api from '@api'

export function* synchronizationSaga() {
  while (true) {
    const { startPlanningAction } = yield race({
      startPlanningAction: take(getType(planningActions.startPlanning.request)),
      stopPlanningAction: take(getType(planningActions.stopPlanning.success)),
    })

    if (startPlanningAction) {
      const { TracingID } = startPlanningAction.payload
      const isMaster = !TracingID || TracingID === getAuthData().TracingID
      yield put(actions.changeMasterStatus(isMaster))
    } else {
      yield put(actions.changeMasterStatus(true))
    }
  }
}

export function* becomeMasterSaga() {
  while (true) {
    yield take(actions.becomeMaster)
    const activePlanning: IPlanning = yield call(getActivePlanning)
    if (activePlanning && activePlanning.ID) {
      yield call(api.planning.RequestMasterStatus)
      const [isDelay] = yield race([
        delay(10000),
        take(planningActions.stopPlanning.success),
        take(planningActions.stopPlanning.failure),
      ])
      if (isDelay) {
        yield put(planningActions.stopPlanning.request({ reason: 'become-master' }))
        yield race([take(planningActions.stopPlanning.success), take(planningActions.stopPlanning.failure)])
      }
      console.log('Start after sync')
      yield delay(1000)
      yield put(planningActions.startPlanning.request({ PlanningID: activePlanning.ID }))
    } else {
      yield put(actions.changeMasterStatus(true))
    }
  }
}
