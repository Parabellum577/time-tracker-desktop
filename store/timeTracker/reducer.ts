import { getType } from 'typesafe-actions'
import * as _ from 'lodash'

import * as actions from './actions'
import { PlanningsAction, IPlanningsState, ITimeTrackerSpentPart } from './types'

const initialState: IPlanningsState = {
  localSpentParts: [],
  remoteSpentParts: [],
}

export default (state: IPlanningsState = initialState, action: PlanningsAction) => {
  let spentPart: ITimeTrackerSpentPart
  let time: number
  switch (action.type) {
    case getType(actions.startPlanningLocal):
      spentPart = {
        IsBroken: false,
        Active: true,
        StartedAt: action.payload.Time,
        EndedAt: action.payload.Time,
        PlanningID: action.payload.PlanningID,
      }
      return {
        ...state,
        localSpentParts: [...state.localSpentParts, spentPart],
      }
    case getType(actions.stopPlanningLocal):
      spentPart = _.last(state.localSpentParts)
      if (spentPart) {
        return {
          ...state,
          localSpentParts: [
            ...state.localSpentParts.slice(0, state.localSpentParts.length - 1),
            { ...spentPart, EndedAt: action.payload.Time, Active: false },
          ],
        }
      }
      return state
    case getType(actions.startPlanningRemote):
      spentPart = {
        IsBroken: false,
        Active: true,
        StartedAt: action.payload.Time,
        EndedAt: action.payload.Time,
        PlanningID: action.payload.PlanningID,
      }
      return {
        ...state,
        remoteSpentParts: [...state.remoteSpentParts, spentPart],
      }
    case getType(actions.stopPlanningRemote):
      const remoteSpentParts = _.cloneDeep(state.remoteSpentParts).map(p => ({ ...p, Active: false }))
      spentPart = _.last(remoteSpentParts)
      spentPart.EndedAt = action.payload.Time
      if (spentPart) {
        return {
          ...state,
          remoteSpentParts,
        }
      }
      return state
    case getType(actions.markBrokenSlice):
      const { StartedAt } = action.payload
      if (spentPart) {
        return {
          ...state,
          localSpentParts: state.localSpentParts.map(p =>
            p.StartedAt === StartedAt ? { ...p, Active: false, IsBroken: true } : p,
          ),
          remoteSpentParts: state.remoteSpentParts.map(p =>
            p.StartedAt === StartedAt ? { ...p, Active: false, IsBroken: true } : p,
          ),
        }
      }
      return state
    case getType(actions.removeSyncedSpentSlices):
      return {
        ...state,
        localSpentParts: state.localSpentParts.filter(
          local => local.Active || !state.remoteSpentParts.some(remote => _.isEqual(local, remote)),
        ),
        remoteSpentParts: state.remoteSpentParts.filter(
          remote => remote.Active || !state.localSpentParts.some(local => _.isEqual(remote, local)),
        ),
      }
    case getType(actions.setEndTimeLocal):
      time = action.payload.Time
      return {
        ...state,
        localSpentParts: state.localSpentParts.map(p => (p.Active ? { ...p, EndedAt: time } : p)),
      }
    case getType(actions.setEndTimeRemote):
      time = action.payload.Time
      return {
        ...state,
        remoteSpentParts: state.remoteSpentParts.map(p => (p.Active ? { ...p, EndedAt: time } : p)),
      }
    case getType(actions.removeAllSpentSlices):
      return {
        ...initialState,
      }
    default:
      return state
  }
}
