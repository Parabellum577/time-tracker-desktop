import {
  ILoginUserPayload,
  IRefreshTokenPayload,
  IAddUserPayload,
  IUpdateUserPayload,
  IForgotPwdPayload,
  IUpdatePwdByUser,
  ISettingsItemPayload,
  ILoginOTSPayload,
  IOAuthCodePayload,
  IUserInfoPayload
} from '@api-types'
import { 
  IUserSession, 
  IUser, 
  IUserSettings,
  IUserInfo
} from '@types'
import callApi from '../call-api'

/**
 * Method for auth by credentials
 * Return token and refresh token
 */
export const LoginUser = async (payload: ILoginUserPayload): Promise<IUserSession> =>
  callApi('user', 'LoginUser', payload)

/**
 * Method for update token by refresh token
 * Return token and SAME refresh token
 */
export const RefreshToken = async (payload: IRefreshTokenPayload): Promise<IUserSession> =>
  callApi('user', 'RefreshToken', payload)

/**
 * Method for register user
 * Return token and refresh token or RPC error if user with same email already registered
 */
export const AddUser = async (payload: IAddUserPayload): Promise<IUserSession> => callApi('user', 'AddUser', payload)

/**
 * Method for update user profile info
 */
export const UpdateUser = async (payload: IUpdateUserPayload) => callApi('user', 'UpdateUser', payload)

/**
 * Method for create guest user
 * Hack for OAuth login
 * Return token and refresh token
 */
export const AddAnonymUser = async () => callApi('user', 'AddAnonymUser')

/**
 * Method for get user information by token
 */
export const GetCurrentUser = async (): Promise<IUser> => {
  const response = await callApi('user', 'GetCurrentUser')
  if (!response || !response.User) {
    return null
  }
  return response.User
}

/**
 * Method for get user preferences like Notifications, Overspent mode etc
 */
export const GetUserSettings = async (): Promise<IUserSettings> => {
  const response = await callApi('user', 'GetUserSettings')
  if (!response || !response.Settings) {
    return null
  }
  return response.Settings
}

/**
 * Method for get information about user
 */
export const GetUserInfo = async (payload: IUserInfoPayload): Promise<IUserInfo> => {
  const response = await callApi('user', 'GetUserInfo')
  if (!response || !response.User) {
    return null
  }
  return response.User
}

/**
 * Method for modify user preferences like Notifications, Overspent mode etc
 */
export const SetUserSettings = async (payload: ISettingsItemPayload) => callApi('user', 'SetUserSettings', payload)

/**
 * Necessary for the function to open the Desktop/Dashboard
 * Method for auth by OTS(one-time-secret) token
 * Return token and refresh token
 */
export const OTSLogin = async (payload: ILoginOTSPayload): Promise<IUserSession> => callApi('user', 'OTSLogin', payload)

/**
 * Necessary for the function to open the Desktop/Dashboard
 * Method for get OTS(one-time-secret) token by refresh token
 * Return OTS token
 */
export const GetOTS = async (): Promise<string> => {
  const response = await callApi('user', 'GetOTS')
  if (!response || !response.OTS) {
    return null
  }
  return response.OTS
}

/**
 * Method for send forgot password link
 */
export const ForgotPwdSendEmail = async (payload: IForgotPwdPayload) => callApi('user', 'ForgotPwdSendEmail', payload)

/**
 * Method for update user password
 */
export const UpdatePwdByUser = async (payload: IUpdatePwdByUser) => callApi('user', 'UpdatePwdByUser', payload)

/**
 * Method for auth by OTS token
 * Return token and refresh token
 */
export const OAuthLogin = async (payload: IOAuthCodePayload) => callApi('user', 'OAuthLogin', payload)

/**
 * UNUSED
 */
export const DeAnonymizeUser = async (payload: ILoginUserPayload): Promise<IUserSession> =>
  callApi('user', 'DeAnonymizeUser', payload)
