import { getWindow, createWindow as createMainWindow } from '@electronMain/src/helpers/browserWindow'
import { ipcMain, BrowserWindow } from 'electron'
import { SagaIterator, Task } from 'redux-saga'
import { call, put, select, take, fork, delay, race } from 'redux-saga/effects'
import * as actions from './actions'
import { getType } from 'typesafe-actions'
import { INotification } from '@store/notifications/types'
import { INotificationInfo } from '@types'
import { openNotificationWindow } from '@openWindow'
import { IRootState } from '@store/rootReducer'
import { stopPlanning } from '@store/plannings/actions'
import { updateApplication } from '@store/updater/actions'

const notificationData: any = {
  Break: {
    title: 'Make a little break',
    message: `You are tracking more than 3 hours and didn't have a break between work less than 10 minutes`,
    leftButton: 'Pause',
    rightButton: 'Skip',
    image: 'coffeeCup',
  },
  Idle: {
    title: 'Idle detected',
    message: "User doesn't active more then 10 minutes",
    image: 'tablet',
  },
  NoTask: {
    title: 'No task chosen',
    message: "You don't have any running task",
    image: 'noTask',
  },
  NewDay: {
    title: "It's a new day!",
    message: 'All tasks stopped. Close previous tasks and create new for a new day',
    image: 'calendar',
  },
  Update: {
    title: 'Update available',
    message: 'New version is available. Please open app and confirm update',
    leftButton: 'Update',
    rightButton: 'Skip',
    image: 'mainIcon',
  },
  IssueExp10Min: {
    title: 'Your task will end soon!',
    message: 'Task which we track will end in next 10 minutes',
    image: 'tabletWatch',
  },
  IssueExp: {
    preTitle: 'Task',
    postTitle: 'expired',
    message: 'Change your planned time or take other task',
    image: 'pocketWatch',
  },
}

let notificationWindow: BrowserWindow = null
let showNotificationTask: Task

export const notificationsArrayFromStore = (state: IRootState) => state.notifications.notificationsArray

export const getUserSettingsFromStore = (state: IRootState) => state.user.defaultUserSettings

export function* showNotificationSaga(): SagaIterator {
  while (true) {
    let { payload } = yield take(getType(actions.showNotification.request))
    const settings = yield select(getUserSettingsFromStore)

    /***
     * Not show notification if setting is off
     */
    if (settings.isNotifications === 'on') {
      let data: INotificationInfo = {
        leftButton: 'Open App',
        rightButton: 'Skip',
      }

      let extraData: INotificationInfo = null
      if (payload.notificationType in notificationData) {
        extraData = notificationData[payload.notificationType]

        data = {
          ...data,
          ...extraData,
          image: './notifications/images/' + extraData.image + '/' + extraData.image + '@2x.png',
        }

        if (payload.notificationType === 'IssueExp') {
          let taskName: string = payload.IssueTitle
          const allowableStringLength: number = 15

          if (taskName.length > allowableStringLength) {
            taskName = payload.IssueTitle.substr(0, allowableStringLength) + '...'
          }

          data.title = `${data.preTitle} ${taskName} ${data.postTitle}`
        }

        if (payload.notificationType === 'Idle') {
          data.message = `User doesn't active more then ${payload.idleTime / 60} minutes`
        }

        payload = { ...payload, data }

        if (showNotificationTask) {
          yield call(handleShowNotification, payload)
        } else {
          showNotificationTask = yield fork(showNotification, payload)
        }
      }
    }
  }
}

function* showNotification(payload: INotification): SagaIterator {
  let delayValue =
    payload.notificationType === 'Idle' ||
    payload.notificationType === 'IssueExp' ||
    payload.notificationType === 'Update'
      ? delay(24 * 60 * 60 * 1000)
      : delay(5000)

  if (payload.notificationType === 'Break') {
    delayValue = delay(8000)
  }

  yield call(createWindow, payload)

  const [, action] = yield race([delayValue, call(handleActionIPCMessage), call(closeNotification, payload)])

  const notifications: INotification[] = yield select(notificationsArrayFromStore)

  if (notifications.length) {
    const notificationToShow = notifications[0]
    yield put(actions.clearNotification.success(notificationToShow))
    yield fork(showNotification, notificationToShow)
  } else {
    showNotificationTask = null
    notificationWindow.close()
    notificationWindow = null
  }

  if (action === 'openMainWindow') {
    console.log('openMainWindow')
    const mainWindow = getWindow() || createMainWindow()
    mainWindow.show()
    mainWindow.focus()
  } else if (action === 'takeBreak') {
    yield put(stopPlanning.request())
  } else if (action === 'updateApplication') {
    yield put(updateApplication())
  }
}

function* closeNotification(payload: INotification): SagaIterator {
  while (true) {
    yield take(getType(actions.closeNotification))
    if (payload.notificationType === 'Idle') {
      yield put(actions.clearNotification.success(payload))
      break
    } else {
      yield put(actions.clearNotification.success(payload))
    }
  }
}

function createWindow(payload: INotification) {
  return new Promise(resolve => {
    if (!notificationWindow) {
      notificationWindow = openNotificationWindow()
      notificationWindow.once('ready-to-show', () => {
        notificationWindow.webContents.send('show-notification', payload)
        resolve()
      })
    } else {
      notificationWindow.webContents.send('show-notification', payload)
      resolve()
    }
  })
}

function handleActionIPCMessage() {
  return new Promise(resolve => {
    const handler = () => {
      notificationWindow.hide()
      resolve()
      clearHandlers()
    }

    const handleOpenMainWindow = () => {
      resolve('openMainWindow')
      clearHandlers()
    }

    const handleTakeBreak = () => {
      resolve('takeBreak')
      clearHandlers()
    }

    const handleUpdate = () => {
      resolve('updateApplication')
      clearHandlers()
    }

    const clearHandlers = () => {
      ipcMain.removeListener('closeWin', handler)
      ipcMain.removeListener('openMainWindow', handleOpenMainWindow)
      ipcMain.removeListener('takeBreak', handleTakeBreak)
      ipcMain.removeListener('autoUpdater:quit-and-install', handleUpdate)
    }

    ipcMain.addListener('closeWin', handler)
    ipcMain.addListener('openMainWindow', handleOpenMainWindow)
    ipcMain.addListener('takeBreak', handleTakeBreak)
    ipcMain.addListener('autoUpdater:quit-and-install', handleUpdate)
  })
}

export function* handleShowNotification(payload: INotification) {
  yield put(actions.showNotification.success(payload))
}
