import { SagaIterator, Task } from 'redux-saga'
import { select, all, call, spawn, put, take, race, delay, putResolve, cancel } from 'redux-saga/effects'
import * as _ from 'lodash'
import * as q from 'q'

import { IRootState } from '@store/rootReducer'
import { IPlanning } from '@services/types'

import * as actions from './actions'
import * as planningsActions from '../plannings/actions'
import { getWindow, createWindow } from '@electronMain/src/helpers/browserWindow'

import api from '@api'
import time from '@services/time'
import { ITimeTrackerSpentPart } from './types'
import { xorLeft } from './utils'
import { sagaCallApiRetried } from '@services/call-api'
import IsItConnected from '@store/internetConnection/watcher'
import * as internetConnectionActions from '@store/internetConnection/actions'

const getActivePlanningFromStore = (state: IRootState) => state.plannings.openPlannings.find(p => p.Active)
const getLocalSpentPartsFromStore = (state: IRootState) => state.timeTracker.localSpentParts
const getRemoteSpentPartsFromStore = (state: IRootState) => state.timeTracker.remoteSpentParts
const getIsMaster = (state: IRootState) => state.synchronization.isMaster

export function* timeTrackerSagas(): SagaIterator {
  yield all([spawn(syncSpentSlicesSaga), spawn(startStopAfterLoseConnectionSaga)])
}

let timeTrackerTask: Task

export function* startTimeTrackerSaga(PlanningID: number, isMaster: boolean): SagaIterator {
  let startTime = time.now()
  const localSpentParts: ITimeTrackerSpentPart[] = yield select(getLocalSpentPartsFromStore)
  if (localSpentParts.length) {
    const lastSpentPartEnd = localSpentParts.reduce(
      (red, cur) => Math.max(red, cur.EndedAt),
      localSpentParts[0].EndedAt,
    )
    if (startTime <= lastSpentPartEnd) {
      startTime = lastSpentPartEnd + 1
    }
  }

  console.log('function*startTimeTrackerSaga -> isMaster', isMaster)
  if (!isMaster) {
    yield putResolve(actions.startPlanningRemote(PlanningID, startTime))
  }

  yield putResolve(actions.startPlanningLocal(PlanningID, startTime))
  yield put(actions.forceSyncSpentSlices())
  if (timeTrackerTask) {
    yield cancel(timeTrackerTask)
  }
  if (isMaster) {
    timeTrackerTask = yield spawn(timeTrackerSaga)
  }
}

export function* stopTimeTrackerSaga(EndedAt: unixSeconds = time.now()): SagaIterator {
  const isMaster: boolean = yield select(getIsMaster)
  console.log('function*stopTimeTrackerSaga -> isMaster', isMaster)

  if (timeTrackerTask) {
    yield cancel(timeTrackerTask)
  }

  if (!isMaster) {
    yield putResolve(actions.stopPlanningRemote(EndedAt))
  }

  yield putResolve(actions.stopPlanningLocal(EndedAt))
  yield putResolve(actions.forceSyncSpentSlices())
}

export function* syncSpentSlicesSaga(): SagaIterator {
  while (true) {
    yield race([take(actions.forceSyncSpentSlices), take(actions.setEndTimeLocal)])
    yield call(syncSpentSlices)
  }
}

export function* startStopAfterLoseConnectionSaga(): SagaIterator {
  while (true) {
    yield take(internetConnectionActions.changeConnectionStatus)
    const now = time.now()
    const localSpentParts: ITimeTrackerSpentPart[] = yield select(getLocalSpentPartsFromStore)
    const isMaster: boolean = yield select(getIsMaster)
    if (!isMaster || !localSpentParts.length) {
      continue
    }

    console.log('function*startStopAfterLoseConnectionSaga -> localSpentParts', localSpentParts)
    const { Active, PlanningID, EndedAt } = _.last(localSpentParts)
    if (!Active) {
      continue
    }
    const endTime = Math.max(EndedAt, now - 1)
    yield putResolve(actions.stopPlanningLocal(endTime))
    yield putResolve(actions.startPlanningLocal(PlanningID, endTime + 1))
    yield putResolve(actions.forceSyncSpentSlices())
  }
}

let syncSpentSlicesPrivatePromise: Q.Deferred<void>

export function* syncSpentSlices(isForce: boolean = false): SagaIterator {
  if (!syncSpentSlicesPrivatePromise) {
    syncSpentSlicesPrivatePromise = q.defer<void>()
    yield spawn(syncSpentSlicesPrivate, isForce)
  }

  yield call(() => syncSpentSlicesPrivatePromise.promise)
}

function* syncSpentSlicesPrivate(isForce: boolean = false): SagaIterator {
  console.log('function*syncSpentSlicesPrivate -> syncSpentSlicesPrivate Started')
  const localSpentParts: ITimeTrackerSpentPart[] = yield select(getLocalSpentPartsFromStore)
  const remoteSpentParts: ITimeTrackerSpentPart[] = yield select(getRemoteSpentPartsFromStore)
  if (!isForce) {
    try {
      for (let i = 0; i < 3; i++) {
        try {
          yield call(IsItConnected.testConnection, 'planning')
          break
        } catch (error) {
          if (i === 2) {
            throw error
          }
          yield delay(i * 100)
        }
      }
    } catch (error) {
      console.log('function*syncSpentSlices -> error', error)
      syncSpentSlicesPrivatePromise.resolve()
      syncSpentSlicesPrivatePromise = null
      return
    }
  }
  console.log('function*syncSpentSlices -> localSpentParts', localSpentParts)
  console.log('function*syncSpentSlices -> remoteSpentParts', remoteSpentParts)
  for (const spentPart of xorLeft(localSpentParts, remoteSpentParts)) {
    console.log('function*syncSpentSlices -> spentPart', spentPart)
    const { Active, PlanningID, StartedAt, EndedAt } = spentPart
    const isActivePlanningOnServer = remoteSpentParts.some(
      part => part.Active && part.PlanningID === PlanningID && part.StartedAt === StartedAt,
    )
    const isUselessSlice = !Active && EndedAt <= StartedAt
    try {
      if (isUselessSlice || spentPart.IsBroken) {
        continue
      }

      if (!isActivePlanningOnServer) {
        // Start Planning Remote
        yield sagaCallApiRetried(api.planning.SetActive, {
          PlanningID,
          Time: StartedAt,
        })
        yield putResolve(actions.startPlanningRemote(PlanningID, StartedAt))
        const { TimeSpent } = yield sagaCallApiRetried(api.planning.SetSpent, {
          PlanningID,
          Time: StartedAt,
        })
        const now = time.now()
        if (StartedAt + 20 >= now) {
          yield put(planningsActions.setSpentTime(PlanningID, TimeSpent + (now - StartedAt)))
        }
      }

      if (Active) {
        // Time tick remote
        if (StartedAt !== EndedAt) {
          const { TimeSpent } = yield sagaCallApiRetried(api.planning.SetSpent, {
            PlanningID,
            Time: EndedAt,
          })
          const now = time.now()
          if (EndedAt + 20 >= now) {
            yield put(planningsActions.setSpentTime(PlanningID, TimeSpent + (now - EndedAt)))
          }
        }
        yield putResolve(actions.setEndTimeRemote(EndedAt))
      } else {
        // Stop Planning Remote

        const { TimeSpent } = yield sagaCallApiRetried(api.planning.SetSpent, { PlanningID, Time: EndedAt })
        yield put(planningsActions.setSpentTime(PlanningID, TimeSpent))
        yield sagaCallApiRetried(api.planning.SetActive, { PlanningID: 0, Time: EndedAt })
        yield putResolve(actions.stopPlanningRemote(EndedAt))
      }
      // yield delay(1000)
    } catch (error) {
      if (error && error.code > 100 && error.code < 199) {
        try {
          if (Active) {
            yield putResolve(actions.stopPlanningRemote(EndedAt))
            yield putResolve(planningsActions.stopPlanning.request())
            yield call(api.planning.SetActive, { PlanningID: 0, Time: EndedAt })
            const mainWindow = getWindow() || createWindow()
            mainWindow.show()
          }
        } finally {
          yield putResolve(actions.markBrokenSlice(StartedAt))
        }
      }
      console.error('function*syncSpentSlices -> error', error)
    }
  }
  yield put(actions.removeSyncedSpentSlices())
  console.log('syncSpentSlices')
  syncSpentSlicesPrivatePromise.resolve()
  syncSpentSlicesPrivatePromise = null
}

function* timeTrackerSaga(): SagaIterator {
  while (true) {
    yield delay(3 * 60 * 1000)
    yield put(actions.setEndTimeLocal(time.now()))
  }
}
