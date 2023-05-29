import { getType } from 'typesafe-actions'

import * as actions from './actions'
import { InternetConnectionAction, IInternetConnectionState } from './types'

const initialState: IInternetConnectionState = {
  isOnline: true
}

export default (
  state: IInternetConnectionState = initialState,
  action: InternetConnectionAction
) => {
  switch (action.type) {
    case getType(actions.changeConnectionStatus):
      const { isOnline } = action.payload
      return {
        ...state,
        isOnline
      }
    default:
      return state
  }
}
