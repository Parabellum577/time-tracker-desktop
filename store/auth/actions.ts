import { createAction, createAsyncAction } from 'typesafe-actions'
import { IError } from '@types'
import { ILoginUserPayload, ILoginOTSPayload } from '@services/api-types'

export const loginUser = createAsyncAction('auth/LOGIN_REQUEST', 'auth/LOGIN_SUCCESS', 'auth/LOGIN_FAILURE')<
  ILoginUserPayload,
  void,
  IError
>()

export const loginUserViaOAuth = createAsyncAction(
  'auth/LOGIN_VIA_OAUTH_REQUEST',
  'auth/LOGIN_VIA_OAUTH_SUCCESS',
  'auth/LOGIN_VIA_OAUTH_FAILURE',
)<void, void, IError>()

export const otsLogin = createAsyncAction('auth/OTS_LOGIN_REQUEST', 'auth/OTS_LOGIN_SUCCESS', 'auth/OTS_LOGIN_FAILURE')<
  ILoginOTSPayload,
  ILoginOTSPayload,
  IError
>()

export const loadingDataAfterLogin = createAction('auth/LOADING_DATA_AFTER_LOGIN', resolve => (isLoading: boolean) =>
  resolve(isLoading),
)

export const signOut = createAction('auth/SIGN_OUT', resolve => () => resolve())
