import { getType } from 'typesafe-actions'

import * as actions from './actions'
import { AuthAction, IAuthState } from './types'

const initialState: IAuthState = {
  authorized: false,
  error: null,
  loading: false,
  isLoadingData: false,
}

export default (state: IAuthState = initialState, action: AuthAction) => {
  switch (action.type) {
    case getType(actions.loginUser.request):
      return { ...state, loading: true }
    case getType(actions.loginUser.success):
      return { ...state, authorized: true, error: null, loading: false }
    case getType(actions.loginUser.failure):
      return { ...state, authorized: false, error: action.payload, loading: false }
    case getType(actions.loadingDataAfterLogin):
      return { ...state, isLoadingData: action.payload }
    case getType(actions.signOut):
      return { ...state, authorized: false, error: null, loading: false }
    default:
      return state
  }
}
