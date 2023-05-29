import { forwardToRenderer, replayActionMain } from 'electron-redux'
import { applyMiddleware, createStore } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { all, spawn } from 'redux-saga/effects'
import { routerMiddleware } from 'connected-react-router'

import rootReducer from './rootReducer'
import history from './history'

import { authSaga } from './auth/sagas'
import { getUserTrackersSaga } from './trackers/sagas'
import { getScreenshotStorageSaga, handleDefaultStatusSaga } from './screenshot/sagas'
import { getDefaultStatusSaga, screenshotingSaga } from './screenshotingElectron/sagas'
import { showAlertsSaga, clearAlertsSaga } from './alerts/sagas'
import {
  getOpenPlanningsSaga,
  getColdPlanningsSaga,
  getClosedPlanningsSaga,
  startStopPlanningSaga,
  startStopColdPlanningSaga,
  createPlanningSaga,
  synchronizationOpenAndColdPlanningsSaga,
  handleNewDaySaga,
  reportPlanningSaga,
  expiredPlanningStopSaga,
  reportColdPlanningSaga,
  getTimeSummary,
  manualReportSaga,
  reportOpenPlannings,
  setStatusSaga,
  setPrioritySaga,
  handleOTSStartStopTaskSaga,
  newDayTimeSummaryReset,
} from './plannings/sagas'
import { idleDetectionSaga } from './idleDetectionElectron/sagas'
import { collectProductivitySaga, getProductivitySaga } from './productivity/sagas'
import {
  getTimelineSaga,
  updateTimelineSaga,
  handleNewTimelineSlicesSaga,
  handleOfflineSlicesSaga,
  removeTimelineSaga,
  insertNewSlicesSaga,
} from './timeline/sagas'
import { getCurrentUserSaga, getUserSettingsSaga, setDefaultUserSettings } from './currentUser/sagas'
import { getProjectsSettingsSaga, getProjectsSaga } from './projects/sagas'
import { webSocketSaga } from './webSocket/sagas'
import { getBookmarksSaga, handleBookmarkSaga } from './bookmarks/sagas'
import { getRecentSaga } from './recents/sagas'
import { internetConnectionSaga } from './internetConnection/sagas'
import { synchronizationSaga, becomeMasterSaga } from './synchronization/sagas'
import { newDayDetectionSaga } from './newDay/sagas'
import { showNotificationSaga } from './notifications/sagas'
import {
  stopPlanningInterceptorSaga,
  breakInterceptorSaga,
  noRunningTaskInterceptorSaga,
  taskEndSoonInterceptorSaga,
  newDayInterceptorSaga,
  planningExpiredInterceptorSaga,
  idleDetectedInterceptorSaga,
  activityDetectedSaga,
} from './notifications/interceptors-sagas'
import { changeTrayIcon, updateStateOfTrayIcon } from './tray/sagas'
import { openHelpWindow } from './helpIntegration/sagas'
import { updaterIterator, updateApplicationIterator, rebootAfterInactivity } from './updater/sagas'
import { stopPlanningBeforeCloseAppliction } from './browserWindow/sagas'
import { openChatSaga } from './supportChatWindow/sagas'
import { timeTrackerSagas } from './timeTracker/sagas'

export function* rootSaga() {
  yield all([
    spawn(getTimelineSaga),
    spawn(activityDetectedSaga),
    spawn(openHelpWindow),
    spawn(getCurrentUserSaga),
    spawn(getUserSettingsSaga),
    spawn(startStopPlanningSaga),
    spawn(getOpenPlanningsSaga),
    spawn(getColdPlanningsSaga),
    spawn(getClosedPlanningsSaga),
    spawn(getUserTrackersSaga),
    spawn(createPlanningSaga),
    spawn(expiredPlanningStopSaga),
    spawn(reportColdPlanningSaga),
    spawn(manualReportSaga),
    spawn(reportOpenPlannings),
    spawn(synchronizationOpenAndColdPlanningsSaga),
    spawn(handleNewDaySaga),
    spawn(reportPlanningSaga),
    spawn(startStopColdPlanningSaga),
    spawn(getTimeSummary),
    spawn(collectProductivitySaga),
    spawn(getProductivitySaga),
    spawn(updateTimelineSaga),
    spawn(handleNewTimelineSlicesSaga),
    spawn(handleOfflineSlicesSaga),
    spawn(removeTimelineSaga),
    spawn(insertNewSlicesSaga),
    spawn(getProjectsSettingsSaga),
    spawn(getProjectsSaga),
    spawn(webSocketSaga),
    spawn(getBookmarksSaga),
    spawn(handleBookmarkSaga),
    spawn(getRecentSaga),
    spawn(internetConnectionSaga),
    spawn(synchronizationSaga),
    spawn(becomeMasterSaga),
    spawn(authSaga),
    spawn(showAlertsSaga),
    spawn(clearAlertsSaga),
    spawn(getScreenshotStorageSaga),
    spawn(handleDefaultStatusSaga),
    spawn(getDefaultStatusSaga),
    spawn(screenshotingSaga),
    spawn(idleDetectionSaga),
    spawn(showNotificationSaga),
    spawn(newDayDetectionSaga),
    spawn(stopPlanningInterceptorSaga),
    spawn(breakInterceptorSaga),
    spawn(noRunningTaskInterceptorSaga),
    spawn(taskEndSoonInterceptorSaga),
    spawn(newDayInterceptorSaga),
    spawn(planningExpiredInterceptorSaga),
    spawn(idleDetectedInterceptorSaga),
    spawn(updaterIterator),
    spawn(updateApplicationIterator),
    spawn(rebootAfterInactivity),
    spawn(setDefaultUserSettings),
    spawn(stopPlanningBeforeCloseAppliction),
    spawn(setStatusSaga),
    spawn(setPrioritySaga),
    spawn(handleOTSStartStopTaskSaga),
    spawn(openChatSaga),
    spawn(changeTrayIcon),
    spawn(updateStateOfTrayIcon),
    spawn(newDayTimeSummaryReset),
    spawn(timeTrackerSagas),
  ])
}

export default () => {
  const sagaMiddleware = createSagaMiddleware()

  const store = createStore(
    rootReducer,
    {},
    applyMiddleware(routerMiddleware(history), sagaMiddleware, forwardToRenderer),
  )

  replayActionMain(store)

  sagaMiddleware.run(rootSaga)
  return store
}
