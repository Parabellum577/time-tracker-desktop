import { ActionType } from 'typesafe-actions'

import { IUser, IDefaultUserSettings } from '@types'
import * as actions from './actions'

export type CurrentUserAction = ActionType<typeof actions>

export interface ICurrentUserState {
  readonly currentUser: IUser
  readonly defaultUserSettings: IDefaultUserSettings
}
