import { getType, ActionType } from 'typesafe-actions'
import * as _ from 'lodash'

import * as actions from './actions'
import { ITimeline } from './types'
import { IExtendedSpentTimeHistory } from '@services/types'

const initialState: ITimeline = {
  timeline: [],
}
const SECONDS_IN_DAY = 86400

const getWidth = (slice: IExtendedSpentTimeHistory) => {
  return ((slice.EndedAt - slice.StartedAt) * 200) / SECONDS_IN_DAY
}

export default (state: ITimeline = initialState, action: ActionType<typeof actions>): ITimeline => {
  switch (action.type) {
    case getType(actions.getTimeline.success):
      const timeline = action.payload.map(slice => ({ ...slice, minWidth: getWidth(slice) }))
      return { ...state, timeline }
    case getType(actions.updateTimeline):
      if (state.timeline.length < 2) {
        return state
      }
      let newTimeline = _.cloneDeep(state.timeline)
      const beforeFutureSlice = newTimeline[newTimeline.length - 2]
      const futureSlice = newTimeline[newTimeline.length - 1]
      beforeFutureSlice.Spent += action.payload - beforeFutureSlice.EndedAt
      futureSlice.Spent -= action.payload - beforeFutureSlice.EndedAt
      beforeFutureSlice.EndedAt = action.payload
      futureSlice.StartedAt = action.payload + 1
      newTimeline = newTimeline.map(slice => ({ ...slice, minWidth: getWidth(slice) }))
      return { ...state, timeline: newTimeline }
    default:
      return state
  }
}
