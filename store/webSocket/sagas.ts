import { eventChannel } from 'redux-saga'
import { select, call, put, take, race, fork, cancel, delay } from 'redux-saga/effects'
import { getType } from 'typesafe-actions'
import * as _ from 'lodash'

import * as loginActions from '../auth/actions'
import * as projectActions from '../projects/actions'
import * as recentActions from '../recents/actions'
import * as timelineActions from '../timeline/actions'
import * as internetConnectionActions from '../internetConnection/actions'
import { IUser } from '@types'
import { getAuthData } from '@store/auth/utils'
import time from '@services/time'
import { getProductivities } from '@store/productivity/actions'
import { getUserTrackers, removeUserTracker } from '@store/trackers/actions'
import {
  coldPlanningRemap,
  startPlanning,
  stopPlanning,
  getTimeSummary,
  getOpenPlannings,
} from '@store/plannings/actions'
import { deleteScreenshotStorages, getScreenshotStorage } from '@store/screenshot/actions'
import { IRootState } from '@store/rootReducer'
import { getCurrentUser, activateUserAccount } from '@store/currentUser/actions'

let socket: any = null
let interval: NodeJS.Timeout | null = null
let currentUser: IUser | null = null

interface ISocketMessage {
  Data: any
  GenTracingID: string
  ID: number
  ProjectID: string
  Subject: string
  Time: number
  IsOwn: boolean
  TracingID: string
  TrackerID: number
  UserID: number
}

export function* webSocketSaga() {
  let createSocketConnectionTask
  while (true) {
    const { userLoginAction, changeConnectionStatusAction, signOutAction } = yield race({
      userLoginAction: take(getType(loginActions.loginUser.success)),
      signOutAction: take(getType(loginActions.signOut)),
      changeConnectionStatusAction: take(getType(internetConnectionActions.changeConnectionStatus)),
    })

    if (createSocketConnectionTask) {
      cancel(createSocketConnectionTask)
      yield call(closeSocketConnection)
    }

    yield delay(1000)

    if (
      (!signOutAction && userLoginAction) ||
      (changeConnectionStatusAction && changeConnectionStatusAction.payload.isOnline)
    ) {
      currentUser = yield select(getCurrentUserFromStore)
      if (!currentUser && userLoginAction) {
        yield put(getCurrentUser.request())
        const action = yield take(getType(getCurrentUser.success))
        currentUser = action.payload
      }
      createSocketConnectionTask = yield fork(function*() {
        const channel = yield call(createSocketConnection)
        while (true) {
          const action = yield take(channel)
          yield put(action)
        }
      })
    }
  }
}

export const getCurrentUserFromStore = (state: IRootState) => state.user.currentUser

function* createSocketConnection() {
  return eventChannel(emitter => {
    const webSocketUrl = `${process.env.WSS_URL}/notification/ws/notifications`
    const WebSocket = require('ws')
    socket = new WebSocket(webSocketUrl)
    socket.on('open', () => {
      console.log('connected to server')
      if (socket) {
        handleOpen()
      }
      if (socket) {
        socket.on('message', (event: any) => {
          try {
            const message: ISocketMessage = JSON.parse(event)
            if (message.UserID !== currentUser.UserID && message.Subject !== 'project_settings_changed') {
              return
            }

            const isOwn = message.TracingID === getAuthData().TracingID

            const handler: any = eventHandlers[message.Subject]
            console.log('TCL: function*createSocketConnection -> message.Subject', message.Subject, isOwn)
            if (handler) {
              const action = handler(message, isOwn)

              if (!action) {
                return
              }

              if (Array.isArray(action)) {
                action.forEach(emitter)
              } else {
                emitter(action)
              }
            }
          } catch (error) {
            console.error('WebSocket -> handleMessage -> catch', error)
          }
        })
      }
    })
    socket.onclose = handleClose
    socket.onerror = handleError

    return () => {
      console.log('Socket off')
    }
  })
}

function closeSocketConnection() {
  try {
    if (socket) {
      clearInterval(interval)
      socket.terminate()
    }
  } catch (error) {
    console.error(error)
  }
}

const parsePayload = (data: any) => data[_.keysIn(data)[0]]

const eventHandlers: { [index: string]: any } = {
  productivity_created() {
    return getProductivities.request()
  },
  planning_remap(message: any) {
    const payload = parsePayload(message.Data)
    return [coldPlanningRemap(payload.From, payload.To), timelineActions.getTimeline.request()]
  },
  planning_started(message: any, isOwn: boolean) {
    if (isOwn) {
      return
    }
    const payload = parsePayload(message.Data)
    return startPlanning.request({ PlanningID: payload.ID, TracingID: payload.TracingID })
  },
  planning_stopped(message: any, isOwn: boolean) {
    if (isOwn) {
      return
    }
    const payload = parsePayload(message.Data)
    return stopPlanning.request()
  },
  request_master_status(message: any, isOwn: boolean) {
    if (isOwn) {
      return
    }

    return stopPlanning.request()
  },
  planning_created(message: any, isOwn: boolean) {
    if (isOwn) {
      return
    }
    const payload = parsePayload(message.Data)
    return getOpenPlannings.request()
  },
  planning_deleted(message: any, isOwn: boolean) {
    if (isOwn) {
      return
    }
    const payload = parsePayload(message.Data)
    return getOpenPlannings.request()
  },
  planning_closed(message: any, isOwn: boolean) {
    if (isOwn) {
      return
    }
    const payload = parsePayload(message.Data)
    return getOpenPlannings.request()
  },
  time_reported(isOwn: boolean) {
    const actions = [recentActions.getRecent.request(), timelineActions.getTimeline.request(), getTimeSummary.request()]
    if (isOwn) {
      return actions
    }

    return [...actions, getOpenPlannings.request()]
  },
  tracker_credentials_deleted(message: any) {
    const payload = parsePayload(message.Data)
    return removeUserTracker(payload.ID)
  },
  tracker_credentials_added() {
    return getUserTrackers.request()
  },
  tracker_credentials_updated() {
    return getUserTrackers.request()
  },
  screenshots_storage_created() {
    return getScreenshotStorage.request()
  },
  screen_storage_removed() {
    // TODO: rename notification
    return deleteScreenshotStorages()
  },
  project_cache_updated() {
    return projectActions.getProjects.request()
  },
  project_settings_changed(message: any) {
    return projectActions.getProjectSettings.request({
      ProjectID: message.ProjectID,
      TrackerID: message.TrackerID,
      hasUpdate: true,
    })
  },
  user_info_updated() {
    return getCurrentUser.request()
  },
  email_confirmed() {
    return activateUserAccount()
  },
}

function handleOpen() {
  const authData = getAuthData()
  if (!authData) {
    return
  }

  const context = {
    Token: authData.Token,
    Deadline: time.now() + 60,
    TimeOffset: new Date().getTimezoneOffset() * -60,
    TracingID: authData.TracingID,
    Data: {},
  }

  try {
    socket.send(JSON.stringify(context))
  } catch (error) {
    console.error('handleOpen -> error', error)
  }

  if (interval) {
    clearInterval(interval)
  }

  interval = setInterval(() => {
    try {
      socket.send('[]')
    } catch (error) {
      console.error('handleOpen -> error', error)
    }
  }, 60 * 1000)
}

function handleClose(event: CloseEvent) {
  socket = null
  clearInterval(interval)

  /* Try reconnect */
  if (event.code === 1006) {
    createSocketConnection()
  } else if (event.code === 4002) {
    // await runTokenRefresh();
    createSocketConnection()
  }
}

function handleError() {
  console.error('NotificationSocket - Connection error')
}
