import { select, fork, take, put, race, cancel, delay, call } from 'redux-saga/effects'
import { getType, ActionType } from 'typesafe-actions'
import { BrowserWindow, screen, app, ipcMain } from 'electron'
import * as path from 'path'
import * as fs from 'fs'

import * as planningsActions from '@store/plannings/actions'
import * as projectsActions from '@store/projects/actions'
import * as screenshotActions from '@store/screenshot/actions'
import * as authActions from '@store/auth/actions'

import { Task } from 'redux-saga'
import { IRootState } from '@store/rootReducer'
import { IPlanning, IUser, ISettingsItem } from '@types'

import { getRandomInt } from '@services/helpers'
import persistStore from '@store/persistStore'
import * as _ from 'lodash'
import time from '@services/time'
import api from '@services/api'

interface IStartStopRace {
  startPlanningAction?: ActionType<typeof planningsActions.startPlanning.success>
  stopPlanningAction?: ActionType<typeof planningsActions.stopPlanning.success>
}

export const getIsMasterFromStore = (state: IRootState) => state.synchronization.isMaster
export const getCurentUser = (state: IRootState) => state.user.currentUser
export const getOpenPlanningsFromStore = (state: IRootState) => state.plannings.openPlannings
export const getColdPlanningsFromStore = (state: IRootState) => state.plannings.coldPlannings
export const getCurrentUserFromStore = (state: IRootState) => state.user.currentUser
export const getScreenStorageFromStore = (state: IRootState) => state.screenshots.availableStorage
export const getScreenStatus = (state: IRootState) => state.screenshots.status
export const getUserSettingsFromStore = (state: IRootState) => state.user.defaultUserSettings

export function* getDefaultStatusSaga() {
  while (true) {
    const { login } = yield race({
      login: take(getType(authActions.loginUser.success)),
      stopPlanningAction: take(getType(planningsActions.stopPlanning.success)),
    })
    if (login) {
      yield delay(1000)
    }
    const currentUser = yield select(getCurentUser)
    if (!currentUser) {
      continue
    }
    const { UserID } = currentUser
    const defaultUserScreenStatus: boolean = persistStore.get(`screenshotStatus_${UserID}`)
    if (!_.isNull(defaultUserScreenStatus) && !_.isUndefined(defaultUserScreenStatus)) {
      yield put(
        screenshotActions.handleScreenshotStatus.request({
          newScreenshotStatus: defaultUserScreenStatus,
        }),
      )
    } else {
      persistStore.set(`screenshotStatus_${UserID}`, false)
    }
  }
}

export function* screenshotingSaga() {
  let screenshotingLoopTask: Task

  while (true) {
    const { startPlanningAction }: IStartStopRace = yield race({
      startPlanningAction: take(getType(planningsActions.startPlanning.success)),
      stopPlanningAction: take(getType(planningsActions.stopPlanning.success)),
    })

    if (screenshotingLoopTask) {
      yield cancel(screenshotingLoopTask)
    }

    const isMaster: IPlanning[] = yield select(getIsMasterFromStore)
    if (!isMaster) {
      continue
    }

    const openPlannings: IPlanning[] = yield select(getOpenPlanningsFromStore)
    const coldPlannings: IPlanning[] = yield select(getColdPlanningsFromStore)
    const activePlanning = openPlannings.concat(coldPlannings).find(p => p.Active)

    if (startPlanningAction && activePlanning) {
      const { ProjectID, TrackerID } = activePlanning
      yield put(
        projectsActions.getProjectSettings.request({
          ProjectID,
          TrackerID,
        }),
      )
      const action: ActionType<typeof projectsActions.getProjectSettings.success> = yield take(
        projectsActions.getProjectSettings.success,
      )

      const currentUser: IUser = yield select(getCurrentUserFromStore)
      const storage: IUser = yield select(getScreenStorageFromStore)
      const settings = action.payload.settings.filter(
        setting => setting.Key === `screenshot-freq-user-${currentUser.UserID}` || setting.Key === 'screenshot-freq',
      )
      settings.sort((a, b) => (a.Key < b.Key ? 0 : -1))
      const currentSetting = settings[0]

      if (!storage) {
        continue
      }

      let screenStatus: boolean = yield select(getScreenStatus)

      if (currentSetting.Value !== 'none' && !screenStatus) {
        yield put(screenshotActions.handleScreenshotStatus.request({ newScreenshotStatus: null }))
        yield take(screenshotActions.handleScreenshotStatus.success)
        screenStatus = yield select(getScreenStatus)
      }

      if (screenStatus) {
        screenshotingLoopTask = yield fork(screenshotingLoop, currentSetting, activePlanning)
      }
    }
  }
}

export function* screenshotingLoop(currentSetting: ISettingsItem, activePlanning: IPlanning) {
  try {
    while (true) {
      let intervals: number[]
      const TEN_MINUTES = 600000
      if (currentSetting.Value === '1x' || currentSetting.Value === 'none') {
        const firstTime = getRandomInt(0, TEN_MINUTES)
        intervals = [firstTime]
      } else if (currentSetting.Value === '2x') {
        const firstTime = getRandomInt(0, TEN_MINUTES)
        const secondTime = getRandomInt(firstTime, TEN_MINUTES)
        intervals = [firstTime, secondTime]
      } else {
        const firstTime = getRandomInt(0, TEN_MINUTES)
        const secondTime = getRandomInt(firstTime, TEN_MINUTES)
        const thirdTime = getRandomInt(secondTime, TEN_MINUTES)
        intervals = [firstTime, secondTime, thirdTime]
      }

      for (const timeout of intervals) {
        yield delay(timeout)
        try {
          const settings = yield select(getUserSettingsFromStore)
          const currentTime = time.now().toString()
          const capture = yield call(takeScreenshot, settings.isScreenshootNotifications)
          yield call(
            api.screenshot.sendScreenshot,
            activePlanning.ProjectID,
            activePlanning.TrackerID,
            activePlanning.ID,
            currentTime,
            capture,
          )
        } catch (error) {
          console.error(error)
        }
      }
      yield delay(TEN_MINUTES - _.last(intervals))
    }
  } finally {
    console.log('screenshotingLoop finished')
  }
}

async function takeScreenshot(isScreenshootNotifications: 'on' | 'off') {
  const action: any = await createScreenWindow(isScreenshootNotifications)
  console.log('takeScreenshot -> action', action)
  if (!action || action.type !== 'SAVE_SCREENSHOT') {
    return Promise.reject('User Decline Screenshot')
  }

  return new Promise(resolve => {
    fs.readFile(action.payload.path, (error, data) => {
      if (error) {
        throw error
      }

      fs.unlink(action.payload.path, () => {
        console.log('remove screen file')
      })

      resolve(data)
    })
  })
}

const createScreenWindow = (isScreenshootNotifications: 'on' | 'off') => {
  return new Promise(resolve => {
    const appPath = path.join(app.getAppPath())
    const { size } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
    const windowOptions = {
      x: size.width - Math.round(size.width * 0.15) - 110,
      y: size.height - Math.round(size.height * 0.15) - 110,
      width: Math.round(size.width * 0.15),
      height: Math.round(size.height * 0.15),
      frame: false,
      resizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        experimentalFeatures: true,
        webSecurity: false,
        nodeIntegration: true,
      },
      focusable: false,
      movable: false,
      show: false,
      transparent: true,
    }

    const screenWindow = new BrowserWindow(windowOptions)
    screenWindow.loadURL(`file://${appPath}/screen-window/index.html`)
    screenWindow.once('ready-to-show', () => {
      if (isScreenshootNotifications === 'on') {
        screenWindow.showInactive()
      }
    })
    ipcMain.once('screen-window-action', (e: any, action: any) => {
      resolve(action)
      if (screenWindow && !screenWindow.isDestroyed()) {
        screenWindow.close()
      }
    })
  })
}
