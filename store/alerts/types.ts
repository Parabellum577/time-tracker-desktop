import { ActionType } from 'typesafe-actions'

import * as actions from './actions'
import { IError } from '@services/types'

export type AlertsAction = ActionType<typeof actions>

export interface IAlert {
  alertType: 'success' | 'error' | 'warning' | 'coldstart'
  alertMessage: string | IError
}

export interface IAlertsState {
  alertsArray: IAlert[]
}
