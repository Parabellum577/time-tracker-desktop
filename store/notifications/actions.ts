import { createAsyncAction, createAction } from 'typesafe-actions'
import { IError } from '@types'
import { INotification } from './types'

export const showNotification = createAsyncAction(
  'notifications/SHOW_NOTIFICATION_REQUEST',
  'notifications/SHOW_NOTIFICATION_SUCCESS',
  'notifications/SHOW_NOTIFICATION_FAILURE',
)<INotification, INotification, IError>()

export const clearNotification = createAsyncAction(
  'notifications/CLEAR_NOTIFICATION_REQUEST',
  'notifications/CLEAR_NOTIFICATION_SUCCESS',
  'notifications/CLEAR_NOTIFICATION_FAILURE',
)<void, INotification, IError>()

export const closeNotification = createAction('notifications/CLOSE_NOTIFICATION', action => () => action())
