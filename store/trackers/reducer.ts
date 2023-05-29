import { getType } from 'typesafe-actions'
import * as _ from 'lodash'

import * as actions from './actions'
import { TrackersAction, ITrackers } from './types'

const initialState: ITrackers = {
  userTrackers: [],
}

export default (state: ITrackers = initialState, action: TrackersAction): ITrackers => {
  switch (action.type) {
    case getType(actions.getUserTrackers.success):
      return { ...state, userTrackers: action.payload }
    case getType(actions.removeUserTracker):
      return {
        ...state,
        userTrackers: [...state.userTrackers.filter(tracker => tracker.ID !== action.payload)],
      }
    case getType(actions.addUserTracker):
      const newTracker = action.payload
      const newStateOfAddedTrackers = [...state.userTrackers, newTracker]
      return { ...state, userTrackers: _.sortBy(newStateOfAddedTrackers, 'ID') }
    case getType(actions.updateUserTracker):
      const trackerToUpdate = state.userTrackers.find(item => item.ID === action.payload.ID)
      const newStateOfUpdatedTrackers = [
        ...state.userTrackers.filter(item => item.ID !== action.payload.ID),
        { ...trackerToUpdate, ...action.payload },
      ]
      return {
        ...state,
        userTrackers: _.sortBy(newStateOfUpdatedTrackers, 'ID'),
      }
    case getType(actions.clearUserTrackers):
      return { ...initialState }
    default:
      return state
  }
}
