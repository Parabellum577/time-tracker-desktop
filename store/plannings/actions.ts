import {
  ICreatePlanningPayload,
  ISetExtraPayload,
  IStopPlanning,
  ISetStatusPayload,
  ISetPriorityPayload,
} from '@api-types'
import { createAction, createAsyncAction } from 'typesafe-actions'
import { IPlanning, IError, IReportColdPlannings, IReportManually, ITimeSummary } from '@types'

export const getOpenPlannings = createAsyncAction(
  'plannings/GET_OPEN_PLANNINGS_REQUEST',
  'plannings/GET_OPEN_PLANNINGS_SUCCESS',
  'plannings/GET_OPEN_PLANNINGS_FAILURE',
)<void, IPlanning[], IError>()

export const getColdPlannings = createAsyncAction(
  'plannings/GET_COLD_PLANNINGS_REQUEST',
  'plannings/GET_COLD_PLANNINGS_SUCCESS',
  'plannings/GET_COLD_PLANNINGS_FAILURE',
)<void, IPlanning[], IError>()

export const getClosedPlannings = createAsyncAction(
  'plannings/GET_CLOSED_PLANNINGS_REQUEST',
  'plannings/GET_CLOSED_PLANNINGS_SUCCESS',
  'plannings/GET_CLOSED_PLANNINGS_FAILURE',
)<void, IPlanning[], IError>()

export const startPlanning = createAsyncAction(
  'plannings/START_PLANNING_REQUEST',
  'plannings/START_PLANNING_SUCCESS',
  'plannings/START_PLANNING_FAILURE',
)<{ PlanningID: number; TracingID?: string }, number, IError>()

export const startPlanningSync = createAction('plannings/START_PLANNING_SYNC', action => (PlanningID: number) =>
  action(PlanningID),
)

export const stopPlanning = createAsyncAction(
  'plannings/STOP_PLANNING_REQUEST',
  'plannings/STOP_PLANNING_SUCCESS',
  'plannings/STOP_PLANNING_FAILURE',
)<IStopPlanning | void, void, IError>()

export const startColdPlanning = createAsyncAction(
  'plannings/START_COLD_PLANNING_REQUEST',
  'plannings/START_COLD_PLANNING_SUCCESS',
  'plannings/START_COLD_PLANNING_FAILURE',
)<number | void, number, IError>()

export const stopColdPlanning = createAsyncAction(
  'plannings/STOP_COLD_PLANNING_REQUEST',
  'plannings/STOP_COLD_PLANNING_SUCCESS',
  'plannings/STOP_COLD_PLANNING_FAILURE',
)<void, void, IError>()

export const createPlannings = createAsyncAction(
  'plannings/CREATE_PLANNING_REQUEST',
  'plannings/CREATE_PLANNING_SUCCESS',
  'plannings/CREATE_PLANNING_FAILURE',
)<Array<{ task: ICreatePlanningPayload; isStarted: boolean }>, void, IError>()

export const timeTickInActivePlanning = createAction(
  'plannings/TIME_TICK_IN_ACTIVE_PLANNING',
  action => (PlanningID: number, field: 'SpentOnline' | 'SpentOffline', additionalTime: number) =>
    action({ PlanningID, field, additionalTime }),
)

export const setSpentTime = createAction(
  'plannings/SET_SPENT_TIME',
  action => (PlanningID: number, SpentTime: number) => action({ PlanningID, SpentTime }),
)

export const setExtra = createAction('plannings/SET_EXTRA_PLANNING', action => (Planning: ISetExtraPayload) =>
  action({
    Estimation: Planning.Estimation,
    PlanningID: Planning.PlanningID,
    Reason: Planning.Reason,
  }),
)

export const coldPlanningRemap = createAction('plannings/COLD_PLANNING_REMAP', action => (From: number, To: number) =>
  action({ From, To }),
)

export const getTimeSummary = createAsyncAction(
  'plannings/TIME_SUMMARY_REQUEST',
  'plannings/TIME_SUMMARY_SUCCESS',
  'plannings/TIME_SUMMARY_FAILURE',
)<null, ITimeSummary, IError>()

export const closePlanning = createAsyncAction(
  'plannings/CLOSE_PLANNING_REQUEST',
  'plannings/CLOSE_PLANNING_SUCCESS',
  'plannings/CLOSE_PLANNING_FAILURE',
)<IPlanning, IPlanning, IError>()

export const addHighlightedPlanning = createAction('plannings/ADD_HIGHLIGHTED_PLANNING', action => (ID: string) =>
  action(ID),
)

export const removeHighlightedPlanning = createAction('plannings/REMOVE_HIGHLIGHTED_PLANNING', action => (ID: string) =>
  action(ID),
)

export const planningExpired = createAction('plannings/PLANNING_EXPIRED', action => (planning: IPlanning) =>
  action(planning),
)

export const closeColdPlanning = createAction('plannings/CHANGE_COLD_PLANNING_STATUS', action => (planningID: number) =>
  action(planningID),
)

export const reportColdPlannings = createAsyncAction(
  'plannings/REPORT_COLD_PLANNINGS_REQUEST',
  'plannings/REPORT_COLD_PLANNINGS_SUCCESS',
  'plannings/REPORT_COLD_PLANNINGS_FAILURE',
)<IReportColdPlannings, void, IError>()

export const reportManually = createAsyncAction(
  'plannings/REPORT_REPORT_MANUALLY_REQUEST',
  'plannings/REPORT_REPORT_MANUALLY_SUCCESS',
  'plannings/REPORT_REPORT_MANUALLY_FAILURE',
)<IReportManually, void, IError>()

export const clearPlannings = createAction('plannings/CLEAR_PLANNINGS', action => () => action())

export const setStatus = createAction('plannings/SET_STATUS', action => (payload: ISetStatusPayload) => action(payload))

export const setPriority = createAction('plannings/SET_PRIORITY', action => (payload: ISetPriorityPayload) =>
  action(payload),
)
