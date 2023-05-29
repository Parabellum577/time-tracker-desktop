import { createAsyncAction, createAction } from 'typesafe-actions'
import { IError, IScreenshotStatus, IUserScreenshotSettings } from '@types'

export const getScreenshotStorage = createAsyncAction(
  'screenshot/GET_SCREENSHOT_STORAGE_REQUEST',
  'screenshot/GET_SCREENSHOT_STORAGE_SUCCESS',
  'screenshot/GET_SCREENSHOT_STORAGE_FAILURE',
)<void, IUserScreenshotSettings, IError>()

export const addScreenshotStorage = createAsyncAction(
  'screenshot/ADD_SCREENSHOT_STORAGE_REQUEST',
  'screenshot/ADD_SCREENSHOT_STORAGE_SUCCESS',
  'screenshot/ADD_SCREENSHOT_STORAGE_FAILURE',
)<void, IUserScreenshotSettings, IError>()

export const deleteScreenshotStorages = createAction(
  'screenshot/DELETE_SCREENSHOT_STORAGE',
  resolve => () => resolve(),
)

export const handleScreenshotStatus = createAsyncAction(
  'screenshot/HANDLE_SCREENSHOT_STATUS_REQUEST',
  'screenshot/HANDLE_SCREENSHOT_STATUS_SUCCESS',
  'screenshot/HANDLE_SCREENSHOT_STATUS_FAILURE',
)<IScreenshotStatus, IScreenshotStatus, IError>()
