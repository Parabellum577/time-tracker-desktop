import { createAsyncAction, createAction } from 'typesafe-actions'
import { IError, IFullIssue, IPlanning } from '@types'

export const getRecent = createAsyncAction(
  'recent/GET_RECENT_REQUEST',
  'recent/GET_RECENT_SUCCESS',
  'recent/GET_RECENT_FAILURE',
)<void, IFullIssue[], IError>()

export const addRecent = createAsyncAction(
  'recent/ADD_RECENT_REQUEST',
  'recent/ADD_RECENT_SUCCESS',
  'recent/ADD_RECENT_FAILURE',
)<IFullIssue, IFullIssue, IError>()

export const clearRecent = createAction('plannings/CLEAR_RECENT', action => () => action())
