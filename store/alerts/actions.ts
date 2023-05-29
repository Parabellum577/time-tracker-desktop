import { createAsyncAction } from 'typesafe-actions'
import { IError } from '@types'
import { IAlert } from './types'

export const showAlertMessage = createAsyncAction(
  'notifications/SHOW_ALERT_MESSAGE_REQUEST',
  'notifications/SHOW_ALERT_MESSAGE_SUCCESS',
  'notifications/SHOW_ALERT_MESSAGE_FAILURE',
)<IAlert, IAlert, IError>()

export const clearAlertMessage = createAsyncAction(
  'notifications/CLEAR_ALERT_MESSAGE_REQUEST',
  'notifications/CLEAR_ALERT_MESSAGE_SUCCESS',
  'notifications/CLEAR_ALERT_MESSAGE_FAILURE',
)<void, void, IError>()
