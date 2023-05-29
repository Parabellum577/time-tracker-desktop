import { getType } from 'typesafe-actions'

import * as actions from './actions'
import { CurrentUserAction, ICurrentUserState } from './types'
import { IDefaultUserSettings } from '@types'

export const defaultSettings: IDefaultUserSettings = {
  isAppDefaultLaunch: 'off',
  isOverSpentMode: 'on',
  isAutoDailyReport: 'on',
  isNotifications: 'on',
  isSound: 'off',
  isInstantColdStart: 'off',
  isScreenshootNotifications: 'off',
  idle: '10',
  cold_settings: {
    TrackerID: 0,
    ProjectID: '',
    IssueID: '',
  },
  isDesktopInstalled: 'off',
  isShowedSearchBarTutorial: 'off',
  isShowedIntegrationTutorial: 'off',
  isShowedPersonalProjectTutorial: 'off',
  isShowedTaskAssignTutorial: 'off',
}

const initialState: ICurrentUserState = {
  currentUser: null,
  defaultUserSettings: defaultSettings,
}

interface IUserSettings {
  [type: string]: string
}

export default (state: ICurrentUserState = initialState, action: CurrentUserAction): ICurrentUserState => {
  switch (action.type) {
    case getType(actions.getCurrentUser.success):
      return { ...state, currentUser: action.payload }
    case getType(actions.getCurrentUser.failure):
      return { ...state }
    case getType(actions.updateCurrentUser):
      const { FirstName, LastName, Skype, Phone, Avatar, Role } = action.payload
      return {
        ...state,
        currentUser: { ...state.currentUser, FirstName, LastName, Skype, Phone, Avatar, Role },
      }
    case getType(actions.handleUserSettings.success):
      let settings = Object.values(action.payload)
      const isColdSettings = settings.some(s => s.Key === 'cold_settings')

      if (isColdSettings) {
        let coldSettings = settings.find(s => s.Key === 'cold_settings')
        coldSettings = { ...coldSettings, Value: JSON.parse(coldSettings.Value) }
        settings = [...settings, { ...coldSettings }]
      }

      const parsedUserSettings: IUserSettings = {}
      settings.map(setting => {
        parsedUserSettings[setting.Key] = setting.Value
      })

      return {
        ...state,
        defaultUserSettings: {
          ...state.defaultUserSettings,
          ...parsedUserSettings,
        },
      }

    case getType(actions.setDefaultUserSettings):
      return {
        ...state,
        defaultUserSettings: {
          ...defaultSettings,
        },
      }

    case getType(actions.handleUserSettings.failure):
      return { ...state }
    case getType(actions.activateUserAccount):
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          Activated: true,
        },
      }
    default:
      return state
  }
}
