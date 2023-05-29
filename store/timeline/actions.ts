import { createAsyncAction, createAction } from 'typesafe-actions'
import { IError, IExtendedSpentTimeHistory } from '@types'

export const getTimeline = createAsyncAction(
  'timeline/GET_TIMELINE_REQUEST',
  'timeline/GET_TIMELINE_SUCCESS',
  'timeline/GET_TIMELINE_FAILURE',
)<void, IExtendedSpentTimeHistory[], IError>()

export const updateTimeline = createAction('timeline/UPDATE_TIMELINE', action => (timeNow: number) => action(timeNow))

export const insertManualPeriod = createAsyncAction(
  'timeline/INSERT_MANUAL_PERIOD_REQUEST',
  'timeline/INSERT_MANUAL_PERIOD_SUCCESS',
  'timeline/INSERT_MANUAL_PERIOD_FAILURE',
)<IExtendedSpentTimeHistory[], IExtendedSpentTimeHistory[], IError>()
