import { getType } from 'typesafe-actions'

import * as actions from './actions'
import { INotificationState, NotificationsAction } from './types'

const initialState: INotificationState = {
  notificationsArray: [],
}

export default (state: INotificationState = initialState, action: NotificationsAction) => {
  switch (action.type) {
    case getType(actions.showNotification.success):
      const newNotification = action.payload
      const newNotificationArray = state.notificationsArray.slice()
      newNotificationArray.push(newNotification)

      return {
        notificationsArray: newNotificationArray,
      }

    case getType(actions.clearNotification.success):
      const removeNotification = action.payload

      return {
        notificationsArray: state.notificationsArray.filter(notification => {
          return JSON.stringify(notification) !== JSON.stringify(removeNotification)
        }),
      }

    default:
      return state
  }
}
