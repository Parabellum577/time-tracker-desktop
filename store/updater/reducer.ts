import { getType, ActionType } from 'typesafe-actions'
import * as actions from './actions'
import { IUpdateApp } from './types'

const initialState: IUpdateApp = {
  isUpdate: false,
}

export default (state: IUpdateApp = initialState, action: ActionType<typeof actions>): IUpdateApp => {
  switch (action.type) {
    case getType(actions.updateAvailable):
      return { ...state, isUpdate: true }
    default:
      return state
  }
}
