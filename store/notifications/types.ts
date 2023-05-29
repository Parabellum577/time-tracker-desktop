import { ActionType } from 'typesafe-actions'

import * as actions from './actions'
import { INotificationInfo } from '@types'

export type NotificationsAction = ActionType<typeof actions>

export interface INotification {
  notificationType: string
  data?: INotificationInfo
  expiredDate?: number
  IssueTitle?: string
  idleTime?: number
}

export interface INotificationState {
  notificationsArray: INotification[]
}
