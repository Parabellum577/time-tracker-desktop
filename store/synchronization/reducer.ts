import { getType, ActionType } from 'typesafe-actions'

import * as actions from './actions'
import { ISynchronization } from './types'

const initialState: ISynchronization = {
  isMaster: true,
}

export default (
  state: ISynchronization = initialState,
  action: ActionType<typeof actions>,
): ISynchronization => {
  switch (action.type) {
    case getType(actions.changeMasterStatus):
      return { ...state, isMaster: action.payload }
    default:
      return state
  }
}
