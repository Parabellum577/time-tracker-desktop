import { getType, ActionType } from 'typesafe-actions'

import * as actions from './actions'
import { IRecent } from './types'

const initialState: IRecent = {
  extendedRecent: [],
}

export default (state: IRecent = initialState, action: ActionType<typeof actions>): IRecent => {
  switch (action.type) {
    case getType(actions.getRecent.success):
      const newRecents = action.payload.filter(r => !(r.URL === '' && r.Title === 'Cold Task'))
      return { ...state, extendedRecent: newRecents }
    case getType(actions.addRecent.success):
      const isAlreadyExsists = state.extendedRecent.some(issue => issue.ID === action.payload.ID)
      if (isAlreadyExsists) {
        return { ...state }
      }
      return { ...state, extendedRecent: [...state.extendedRecent, action.payload] }
    case getType(actions.clearRecent):
      return { ...initialState }
    default:
      return state
  }
}
