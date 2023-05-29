import { createAction, createAsyncAction } from 'typesafe-actions'
import { IUser, IError, IUpdateUser, ISettingsItem } from '@types'

export const getCurrentUser = createAsyncAction(
  'user/GET_CURRENT_USER_REQUEST',
  'user/GET_CURRENT_USER_SUCCESS',
  'user/GET_CURRENT_USER_FAILURE',
)<void, IUser, IError>()

export const updateCurrentUser = createAction('user/UPDATE_CURRENT_USER', action => (userData: IUpdateUser) =>
  action({
    Avatar: userData.Avatar,
    FirstName: userData.FirstName,
    LastName: userData.LastName,
    Phone: userData.Phone,
    Skype: userData.Skype,
    Role: userData.Role,
  }),
)

export const handleUserSettings = createAsyncAction(
  'user/HANDLE_USER_SETTINGS_REQUEST',
  'user/HANDLE_USER_SETTINGS_SUCCESS',
  'user/HANDLE_USER_SETTINGS_FAILURE',
)<ISettingsItem[], ISettingsItem[], IError>()

export const getUserSettings = createAsyncAction(
  'user/GET_USER_SETTINGS_REQUEST',
  'user/GET_USER_SETTINGS_SUCCESS',
  'user/GET_USER_SETTINGS_FAILURE',
)<void, void, IError>()

export const setDefaultUserSettings = createAction('user/SET_DEFAULT_USER_SETTINGS', action => action)

export const activateUserAccount = createAction('user/ACTIVATE_USER_ACCOUNT', action => action)
