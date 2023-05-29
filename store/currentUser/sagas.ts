import { getAvatar } from '@services/microservices/avatar'
import { SagaIterator, Task } from 'redux-saga'
import { call, put, take, race, delay, select, fork, cancel, putResolve } from 'redux-saga/effects'
import { getType } from 'typesafe-actions'
import * as _ from 'lodash'

import * as actions from './actions'
import * as loginActions from '../auth/actions'
import api from '@api'
import { IUser, IUserSettings, ISettingsItem, IDefaultUserSettings } from '@types'
import { IRootState } from '@store/rootReducer'
import { ISettingsItemPayload } from '@api-types'
import { handleAutoLaunch, autoLaunchState } from './autoLaunch'
import { showNotification } from '@store/notifications/actions'

export function* getCurrentUser(): SagaIterator {
  try {
    const userData = yield call(api.user.GetCurrentUser)
    const userAvatar = yield call(getAvatar)
    const user: IUser = { ...userData, Avatar: userAvatar }
    yield put(actions.getCurrentUser.success(user))
  } catch (e) {
    yield put(actions.getCurrentUser.failure(e))
  }
}

export function* getCurrentUserSaga() {
  while (true) {
    const { signOut } = yield race({
      getCurrentUserRequest: take(getType(actions.getCurrentUser.request)),
      signOut: take(getType(loginActions.signOut)),
      userLogin: take(getType(loginActions.loginUser.success)),
    })
    if (signOut) {
      yield put(actions.getCurrentUser.success(null))
    } else {
      yield call(getCurrentUser)
    }
  }
}

export const getUserSettingsFromStore = (state: IRootState) => state.user.defaultUserSettings

export function* getUserSettingsSaga(): SagaIterator {
  while (true) {
    const { userSettingChanged } = yield race({
      userSettingChanged: take(getType(actions.handleUserSettings.request)),
      userLogin: take(getType(loginActions.loginUser.success)),
    })

    if (userSettingChanged) {
      const newSetting: ISettingsItem[] = userSettingChanged.payload
      yield call(handleUserSettings, newSetting)
    } else {
      try {
        const defaultSettings: ISettingsItem[] = yield call(api.user.GetUserSettings)
        yield call(getUserSettings, defaultSettings)
        yield put(actions.getUserSettings.success())
      } catch (error) {
        yield put(actions.getUserSettings.failure(error))
      }
    }
  }
}

let settingsChangesTask: Task = null
let settingsChangesQueue: ISettingsItemPayload[] = []

export function* handleUserSettings(newSettings: ISettingsItem[]) {
  try {
    for (const setting of newSettings) {
      const Key = setting.Key
      let newPayload: ISettingsItemPayload[] = []
      const settings = yield select(getUserSettingsFromStore)
      const storeSettingsKeys = Object.keys(settings)
      const oldSettings = settings[storeSettingsKeys.find(settingKey => settingKey === Key)]

      if (Key === 'isAppDefaultLaunch') {
        const isColdStart = settings.isInstantColdStart === 'on'
        yield call(handleAutoLaunch)
        const currentAutoLaunch = yield call(autoLaunchState)
        newPayload = [{ Key, Value: currentAutoLaunch ? 'on' : 'off' }]
        if (isColdStart && !currentAutoLaunch) {
          newPayload = [...newPayload, { Key: 'isInstantColdStart', Value: 'off' }]
        }
      } else {
        if (Key === 'idle') {
          const Value = setting.Value
          const TrackerID = settings.cold_settings.TrackerID
          const ProjectID = settings.cold_settings.ProjectID
          newPayload = [{ Key, Value }]
          yield call(api.project.SetSettings, {
            TrackerID,
            ProjectID,
            Value,
            Key: 'track-idle-detection',
          })
        } else {
          if (Key === 'isInstantColdStart') {
            const currentAutoLaunch = yield call(autoLaunchState)
            if (!currentAutoLaunch) {
              yield call(handleAutoLaunch)
              newPayload = [{ Key: 'isAppDefaultLaunch', Value: 'on' }]
            }
          }
          if (Key === 'isScreenshootNotifications') {
            oldSettings === 'on'
              ? yield put(showNotification.request({ notificationType: 'ScreenshottingOff' }))
              : yield put(showNotification.request({ notificationType: 'ScreenshottingOn' }))
          }

          const tutorialKeys = [
            'isDesktopInstalled',
            'isShowedSearchBarTutorial',
            'isShowedIntegrationTutorial',
            'isShowedPersonalProjectTutorial',
            'isShowedTaskAssignTutorial',
          ]

          if (tutorialKeys.includes(Key)) {
            newPayload = [...newPayload, { Key, Value: setting.Value }]
          }

          newPayload = [...newPayload, { Key, Value: oldSettings === 'on' ? 'off' : 'on' }]
        }
      }

      const isAlreadyExist = settingsChangesQueue.some(config => newPayload.some(p => p.Key === config.Key))

      if (isAlreadyExist) {
        settingsChangesQueue = [
          ...settingsChangesQueue.filter(config => !newPayload.find(p => p.Key === config.Key)),
          ...newPayload,
        ]
      } else {
        settingsChangesQueue = [...settingsChangesQueue, ...newPayload]
      }

      if (!settingsChangesTask) {
        settingsChangesTask = yield fork(settingsQueueResolveSaga)
      }

      yield put(actions.handleUserSettings.success(newPayload))
    }
  } catch (error) {
    console.error(error)
  }
}

export function* settingsQueueResolveSaga(): SagaIterator {
  while (true) {
    if (settingsChangesQueue.length > 0) {
      const newConfig: ISettingsItemPayload = settingsChangesQueue[0]
      settingsChangesQueue = settingsChangesQueue.slice(1)
      try {
        yield call(api.user.SetUserSettings, newConfig)
      } catch (error) {
        console.error(error)
      }
      yield delay(500)
    } else {
      settingsChangesTask = null
      break
    }
  }
}

export function* setDefaultUserSettings(): SagaIterator {
  while (true) {
    yield take(getType(loginActions.signOut))
    yield put(actions.setDefaultUserSettings())
  }
}

export function* getUserSettings(defaultSettings: ISettingsItem[]) {
  try {
    const settings: IDefaultUserSettings = yield select(getUserSettingsFromStore)
    const storeSettingsKeys = Object.keys(settings)
    const optionValues = Object.values(defaultSettings)
    const savedUserSettings = optionValues.filter(f => storeSettingsKeys.includes(f.Key))
    const currentAutoLaunch = yield call(autoLaunchState)
    const isHaveOverspentSetting = settings.isAutoPauseTask

    yield putResolve(
      actions.handleUserSettings.success([
        ...savedUserSettings,
        { Key: 'isAppDefaultLaunch', Value: currentAutoLaunch ? 'on' : 'off' },
      ]),
    )

    if (isHaveOverspentSetting) {
      yield put(
        actions.handleUserSettings.success([
          ...savedUserSettings,
          { Key: 'isOverSpentMode', Value: settings.isAutoPauseTask === 'on' ? 'off' : 'on' },
        ]),
      )
    }
  } catch (error) {
    yield put(actions.handleUserSettings.failure(error))
    console.error(error)
  }
}
