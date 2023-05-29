import { getType } from 'typesafe-actions'

import * as actions from './actions'
import { IAlertsState, AlertsAction } from './types'

const initialState: IAlertsState = {
  alertsArray: [],
}

export default (state: IAlertsState = initialState, action: AlertsAction) => {
  let messageToShow

  switch (action.type) {
    case getType(actions.showAlertMessage.success):
      const newAlert = action.payload

      switch (newAlert.alertMessage) {
        case 'NETWORK_ERROR':
          messageToShow = 'You are Offline. Please check your internet connection'
          break
        case 'MAIL_CONFIRMATION_EXPIRED':
          messageToShow = 'Your account has been expired. Please confirm your login'
          break
        case 'INVALID_LOGIN':
          messageToShow = 'Email is incorrect'
          break
        case 'INVALID_PASSWORD':
          messageToShow = 'Password is incorrect'
          break
        case 'USER_BANNED':
          messageToShow = 'Your account is banned'
          break
        case 'LOGIN_EXISTS':
          messageToShow = 'Account with this email is already exist'
          break
        case 'INVALID_TRACKER_URL':
          messageToShow = 'Integration with this URL is not exist'
          break
        case 'INVALID_CREDENTIALS':
          messageToShow = 'Integration credentials are not valid'
          break
        case 'CREDENTIALS_EXIST':
          messageToShow = 'Integration with these credentials is already connected'
          break
        case 'TRACKER_NOT_FOUND':
          messageToShow = 'Integration with this URL is not exist'
          break
        default:
          messageToShow = newAlert.alertMessage
          break
      }
      return {
        alertsArray: [...state.alertsArray, { ...newAlert, alertMessage: messageToShow }],
      }

    case getType(actions.clearAlertMessage.success):
      return {
        ...state,
        alertsArray: [...state.alertsArray.slice(1)],
      }

    default:
      return state
  }
}
