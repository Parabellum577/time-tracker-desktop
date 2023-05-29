import { ActionType } from 'typesafe-actions'

import * as actions from './actions'

export type InternetConnectionAction = ActionType<typeof actions>

export interface IInternetConnectionState {
  readonly isOnline: boolean
}
