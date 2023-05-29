import { ActionType } from 'typesafe-actions'

import { IPlanning, IError, ITimeSummary } from '@types'
import * as actions from './actions'

export interface IReportColdPlannigs {
  planningID: number
  timeToreport: number
}

export type PlanningsAction = ActionType<typeof actions>

export interface IPlanningsState {
  readonly openPlannings: IPlanning[]
  readonly coldPlannings: IPlanning[]
  readonly closedPlannings: IPlanning[]
  readonly timeSummary: ITimeSummary
  readonly planningByTask?: IPlanning
  readonly startPlanningError?: IError
  readonly stopPlanningError?: IError
  readonly highlightedPlanning: string
}
