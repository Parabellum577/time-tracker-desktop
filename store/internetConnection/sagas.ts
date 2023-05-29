import { delay, put, select } from 'redux-saga/effects'
import { powerMonitor, app } from 'electron'
import { sagaCallApiRetried } from '@services/call-api'

import * as actions from './actions'

import { getAuthData, updateRefreshToken } from '@store/auth/utils'
import Watcher from './watcher'
import { IRootState } from '@store/rootReducer'

export const getIsOnlineFromStore = (state: IRootState) => state.internetConnection.isOnline

export function* internetConnectionSaga() {
  let isOnline: boolean = true

  const setSleepHandlers = () => {
    powerMonitor.on('suspend', () => {
      isOnline = false
    })

    powerMonitor.on('resume', () => {
      isOnline = true
    })
  }

  if (app.isReady()) {
    setSleepHandlers()
  } else {
    app.on('ready', setSleepHandlers)
  }

  const watcher = new Watcher()

  watcher.on('online', () => {
    console.log('Connected.')
    isOnline = true
  })

  watcher.on('offline', () => {
    console.log('Connection lost!')
    isOnline = false
  })

  watcher.watch()

  while (true) {
    const isOnlineState = yield select(getIsOnlineFromStore)
    try {
      if (isOnline && !isOnlineState) {
        const authData = getAuthData()
        if (authData) {
          yield sagaCallApiRetried(updateRefreshToken, authData.Refresh)
        }
        yield put(actions.changeConnectionStatus(true))
      } else if (!isOnline && isOnlineState) {
        yield put(actions.changeConnectionStatus(false))
      }
    } catch (error) {
      console.log('TCL: function*internetConnectionSaga -> error', error)
    }
    yield delay(5000)
  }
}
