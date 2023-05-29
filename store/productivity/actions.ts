import { createAsyncAction, createAction } from 'typesafe-actions'
import { IError, IChartData, IFocusChart } from '@types'
import { IAverageData } from './types'

export const getProductivities = createAsyncAction(
  'productivity/GET_PRODUCTIVITIES_REQUEST',
  'productivity/GET_PRODUCTIVITIES_SUCCESS',
  'productivity/GET_PRODUCTIVITIES_FAILURE',
)<void, IChartData[], IError>()

export const getFocuses = createAsyncAction(
  'productivity/GET_FOCUSES_REQUEST',
  'productivity/GET_FOCUSES_SUCCESS',
  'productivity/GET_FOCUSES_FAILURE',
)<void, IFocusChart[], IError>()

export const clearProductivities = createAction('plannings/CLEAR_PRODUCTIVITIES', action => () => action())
export const setAverageData = createAction('plannings/SET_AVERAGE_DATA', action => (average: IAverageData) =>
  action(average),
)
