import { SagaIterator } from 'redux-saga'
import { all, call, fork, put, take, race, delay, select, cancel } from 'redux-saga/effects'
import { ActionType, getType } from 'typesafe-actions'
import { push } from 'connected-react-router'

import * as alertActions from '@store/alerts/actions'
import * as userActions from '@store/currentUser/actions'
import * as planningsActions from '@store/plannings/actions'
import * as bookmarksActions from '@store/bookmarks/actions'
import * as productivityActions from '@store/productivity/actions'
import * as projectsActions from '@store/projects/actions'
import * as recentActions from '@store/recents/actions'
import * as timelineActions from '@store/timeline/actions'
import * as screenshotActions from '@store/screenshot/actions'
import * as trackerActions from '@store/trackers/actions'
import * as timeTrackerActions from '@store/timeTracker/actions'
import * as synchronizationActions from '@store/synchronization/actions'
import * as actions from './actions'
import { ILoginUserPayload, ILoginOTSPayload } from '@services/api-types'
import { setAuthData, getAuthData, IAuthData, updateRefreshToken } from './utils'
import api from '@api'
import { IRootState } from '@store/rootReducer'
import { IPlanning } from '@services/types'
import time from '@services/time'
import { getActivePlanning, getSyncState } from '@services/helpers'
import { createWindow, getWindow } from '@electronMain/src/helpers/browserWindow'
import { sendEvent } from '@electronMain/src/analytics/facade'
import { syncSpentSlices } from '@store/timeTracker/sagas'

const getAuthorizedFromStore = (state: IRootState) => state.auth.authorized
const isOnlineFromStore = (state: IRootState) => state.internetConnection.isOnline

export function* authSaga() {
  while (true) {
    let authData = getAuthData()
    const [credentialsAction, otsAction] = yield race([
      take(actions.loginUser.request), // Login by credentials
      take(actions.otsLogin.request), // Login by OTS
      take(getType(actions.loginUserViaOAuth.request)), // Login via OAuth
      call(() => (authData ? Promise.resolve() : new Promise(() => {}))), // Login by saved Refresh Token
    ])
    sendEvent('user', 'LOGIN_REQUEST')
    if (credentialsAction) {
      yield call(setAuthDataByCreds, credentialsAction.payload)
    } else if (otsAction) {
      yield call(setAuthDataByOTS, otsAction.payload)
    }

    authData = getAuthData()
    if (!authData) {
      yield put(push('/login'))
      continue
    }
    yield call(refreshAuth, authData.Refresh)
    if (!authData) {
      yield put(push('/login'))
      continue
    }
    yield put(userActions.getCurrentUser.request())
    const { error } = yield race({
      success: take(userActions.getCurrentUser.success),
      error: take(userActions.getCurrentUser.failure),
    })

    if (error) {
      yield put(
        alertActions.showAlertMessage.request({
          alertMessage: 'Oops! Something went wrong. Please relogin.',
          alertType: 'error',
        }),
      )
      continue
    }

    const taskDataFetchAfterLogin = yield fork(function*() {
      yield put(actions.loginUser.success())
      yield put(push('/main'))
      yield call(takeDataAfterLoading)
    })
    sendEvent('user', 'LOGIN_SUCCESS')
    yield race([call(refreshAuthToken), take(actions.signOut)])

    console.log('Logout')
    if (taskDataFetchAfterLogin) {
      cancel(taskDataFetchAfterLogin)
    }
    yield call(clearDataAfterLogout)
    yield put(push('/login'))
  }
}

function* setAuthDataByCreds({ Login, Password }: ILoginUserPayload): SagaIterator {
  try {
    const authData: IAuthData = yield call(api.user.LoginUser, {
      Login,
      Password,
    })
    yield call(setAuthData, authData)
    return authData
  } catch (error) {
    yield call(setAuthData, null)
    yield put(alertActions.showAlertMessage.request({ alertType: 'error', alertMessage: error.message }))
    yield put(actions.loginUser.failure(error))
    return null
  }
}

function* setAuthDataByOTS({ OTS }: ILoginOTSPayload): SagaIterator {
  const authorized = yield select(getAuthorizedFromStore)
  if (authorized) {
    return
  }

  try {
    const authData: IAuthData = yield call(api.user.OTSLogin, { OTS })
    yield call(setAuthData, authData)
    return authData
  } catch (error) {
    yield call(setAuthData, null)
    yield put(alertActions.showAlertMessage.request({ alertType: 'error', alertMessage: error.message }))
    yield put(actions.loginUser.failure(error))
    return null
  }
}

export function* takeDataAfterLoading(): SagaIterator {
  yield put(actions.loadingDataAfterLogin(true))
  yield fork(api.project.UpdateProjectsCache)
  yield all([
    put(planningsActions.getOpenPlannings.request()),
    put(planningsActions.getColdPlannings.request()),
    put(planningsActions.getClosedPlannings.request()),
    put(trackerActions.getUserTrackers.request()),
    put(timelineActions.getTimeline.request()),
    put(projectsActions.getProjects.request()),
    race([
      take(getType(planningsActions.getOpenPlannings.failure)),
      take(getType(planningsActions.getOpenPlannings.success)),
    ]),
    race([take(getType(projectsActions.getProjects.failure)), take(getType(projectsActions.getProjects.success))]),
    race([
      take(getType(planningsActions.getColdPlannings.failure)),
      take(getType(planningsActions.getColdPlannings.success)),
    ]),
    race([
      take(getType(planningsActions.getColdPlannings.failure)),
      take(getType(planningsActions.getColdPlannings.success)),
    ]),
    race([
      take(getType(planningsActions.getClosedPlannings.failure)),
      take(getType(planningsActions.getClosedPlannings.success)),
    ]),
    race([
      take(getType(trackerActions.getUserTrackers.failure)),
      take(getType(trackerActions.getUserTrackers.success)),
    ]),
    race([take(getType(timelineActions.getTimeline.failure)), take(getType(timelineActions.getTimeline.success))]),
    race([take(getType(userActions.getUserSettings.failure)), take(getType(userActions.getUserSettings.success))]),
  ])
  yield put(actions.loadingDataAfterLogin(false))
}

export function* refreshAuthToken(): SagaIterator {
  let authData = getAuthData()
  while (true) {
    if (!authData) {
      return
    }

    const isOnline: boolean = yield select(isOnlineFromStore)
    if (isOnline) {
      try {
        authData = yield call(refreshAuth, authData.Refresh)
        sendEvent('user', 'REFRESH_TOKEN')
      } catch (error) {
        console.error(error)
      }
    }
    const refreshAfter = authData ? (authData.Expires - time.now()) * 800 : 60000
    yield delay(refreshAfter > 0 ? refreshAfter : 60000)
  }
}

export function* refreshAuth(refresh: string): SagaIterator {
  try {
    const authData = yield call(updateRefreshToken, refresh)
    return authData
  } catch (e) {
    console.log('refreshAuth -> error:', e)
    console.log('refreshAuth -> error:', e.code, typeof e.code)
    const fatalCodes = [1, 102, 107, 206, 209, -32000]
    // INVALID_TOKEN
    // REFRESH_TOKEN_EXPIRED
    // USER_NOT_FOUND
    // MAIL_CONFIRMATION_EXPIRED
    // INVALID_REFRESH
    // crypto/rsa: verification error
    if (fatalCodes.includes(e.code)) {
      const message =
        e.code === 206
          ? 'Your account has expired... Please confirm your email to continue.'
          : 'Oops! Something went wrong. Please relogin.'
      yield put(
        alertActions.showAlertMessage.request({
          alertMessage: message,
          alertType: 'error',
        }),
      )
      const mainWindow = getWindow() || createWindow()
      mainWindow.show()
      mainWindow.focus()
      yield call(setAuthData, null)
      return null
    } else {
      return getAuthData()
    }
  }
}

export function* clearDataAfterLogout(): SagaIterator {
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
    yield call(syncSpentSlices)
  } catch (e) {
    console.error('clearDataAfterLogout -> error', e)
  }
  yield put(planningsActions.clearPlannings())
  yield put(bookmarksActions.clearBookmarks())
  yield put(productivityActions.clearProductivities())
  yield put(projectsActions.clearProjects())
  yield put(recentActions.clearRecent())
  yield put(screenshotActions.deleteScreenshotStorages())
  yield put(trackerActions.clearUserTrackers())
  yield put(timeTrackerActions.removeAllSpentSlices())
  yield put(synchronizationActions.changeMasterStatus(true))
  yield call(setAuthData, null)
}
