import { ActionType } from 'typesafe-actions'
import * as actions from './actions'

export interface ITimeTrackerSpentPart {
  Active: boolean
  StartedAt: unixSeconds
  EndedAt: unixSeconds
  PlanningID: number
  IsBroken: boolean
}

export interface IPlanningsState {
  localSpentParts: ITimeTrackerSpentPart[]
  remoteSpentParts: ITimeTrackerSpentPart[]
}

export type PlanningsAction = ActionType<typeof actions>
