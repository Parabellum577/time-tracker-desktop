import { getType, ActionType } from 'typesafe-actions'

import * as actions from './actions'
import { IBookmarks } from './types'

const initialState: IBookmarks = {
  extendedBookmarks: [],
}

export default (state: IBookmarks = initialState, action: ActionType<typeof actions>): IBookmarks => {
  switch (action.type) {
    case getType(actions.getBookmarks.success):
      return { ...state, extendedBookmarks: action.payload }
    case getType(actions.handleBookmark.success):
      const isRemove = state.extendedBookmarks.some(bookmark => bookmark.ID === action.payload.ID)
      if (isRemove) {
        return {
          ...state,
          extendedBookmarks: state.extendedBookmarks.filter(bookmark => bookmark.ID !== action.payload.ID),
        }
      } else {
        return { ...state, extendedBookmarks: [...state.extendedBookmarks, action.payload] }
      }
    case getType(actions.clearBookmarks):
      return { ...initialState }
    default:
      return state
  }
}
