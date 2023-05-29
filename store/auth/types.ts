import { ActionType } from 'typesafe-actions'
import { DeepReadonly } from 'utility-types'

import * as actions from './actions'
import { IError } from '@types'

export type AuthAction = ActionType<typeof actions>

export type IAuthState = DeepReadonly<{
  readonly authorized: boolean
  readonly error?: IError | null
  readonly loading: boolean
  readonly isLoadingData: boolean
}>
