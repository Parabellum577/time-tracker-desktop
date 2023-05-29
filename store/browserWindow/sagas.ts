import { ipcMain, app } from 'electron'
import { call, put, race, take, delay } from 'redux-saga/effects'
import { getActivePlanning, getSyncState } from '@services/helpers'
import { IPlanning } from '@services/types'
import * as planningsActions from '@store/plannings/actions'
import { getType } from 'typesafe-actions'
import persistStore from '@store/persistStore'
import { REASON_FOR_QUIT_KEY } from '@electronMain/src/helpers/memoryLeakDetection'
import { syncSpentSlices } from '@store/timeTracker/sagas'
import { getWindow } from '@electronMain/src/helpers/browserWindow'

export function* stopPlanningBeforeCloseAppliction() {
  yield call(
    () =>
      new Promise(res => {
        ipcMain.once('close-application', res)
      }),
  )
  const win = getWindow()
  if (win) {
    win.close()
  }
  console.log('CLOSE_APP_HANDLER')
  const activePlanning: IPlanning = yield call(getActivePlanning)
  const isMaster: IPlanning = yield call(getSyncState)

  if (activePlanning && activePlanning.ID && isMaster) {
    yield put(planningsActions.stopPlanning.request())
    yield race([
      take(getType(planningsActions.stopPlanning.success)),
      take(getType(planningsActions.stopPlanning.failure)),
    ])
  }
  try {
    yield race([call(syncSpentSlices, true), delay(30 * 1000)])
  } catch (error) {
    console.log('function*stopPlanningBeforeCloseAppliction -> error', error)
  }
  console.log('quit')
  persistStore.set(REASON_FOR_QUIT_KEY, 'CLOSE_APP')
  app.quit()
}
