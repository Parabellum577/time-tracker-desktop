import axios from 'axios'

import {
  IGetUserScreenshotsPayload,
  IGetLastScreenshotsPayload,
  IProjectAndTrackerPayload,
  IConfigureProjectPayload,
  IConfigureUserPayload,
  IConfigureProjectWithIntegrationPayload,
  IConfigureUserWithIntegrationPayload,
  IConfigureProjectWithPasswordPayload,
  IConfigureUserWithPasswordPayload,
  IUserOAuthRedirectURIPayload,
  IConfigureUserWithOAuthCodePayload,
  IGetProjectAuthMethodsPayload,
  IGetUserAuthMethodsPayload,
  IDeleteScreenshotPayload,
} from '@api-types'
import {
  IUserScreenshots,
  ILastScreenshots,
  IProjectSettings,
  IConfigureUserWithOAuthCode,
  IScreenshotAuthMethods,
  IUserScreenshotSettings,
} from '@types'
import callApi from '../call-api'
import time from '@services/time'
import { getAuthData } from '@store/auth/utils'

/**
 * Method return connected file storage if connected or throw error if not available or not connected
 */
export const UserRemoveIntegration = async () => callApi('screenshot', 'UserRemoveIntegration')

/**
 * Method return connected file storage if connected or throw error if not available or not connected
 */
export const UserAccountInfo = async (): Promise<IUserScreenshotSettings> => callApi('screenshot', 'UserAccountInfo')

/**
 * Method get OAuth URL for connect file storage(Google Drive or Dropbox)
 */
export const UserOAuthRedirectURI = async (payload: IUserOAuthRedirectURIPayload): Promise<string> => {
  const { URI }: { URI: string } = await callApi('screenshot', 'UserOAuthRedirectURI', payload)
  return URI
}

/**
 * NOT RPC
 * Method for save screenshot to file storage
 *
 * Request Query params:
 *    Cookies:
 *      Authorization=Token
 *    ProjectID: string,
 * TrackerID: number,
 * PlanningID: number,
 * Timestamp: number,
 * Deadline: number,
 *
 * Request body:
 *    Screenshot: DataURL
 *
 *
 * Reponse:
 *    HTTP Code 200
 */
export async function sendScreenshot(
  ProjectID: string,
  TrackerID: number,
  PlanningID: number,
  timestamp: string,
  screenshot: string,
) {
  const deadline = time.now() + 30
  const queryParams = `tracker=${TrackerID}&project=${ProjectID}&planning=${PlanningID}&deadline=${deadline}&timestamp=${timestamp}`
  const url = `${process.env.API_URL}/screenshot/screenshots?${queryParams}`

  return axios({
    url,
    headers: {
      Cookie: `Authorization=${getAuthData().Token}`,
    },
    method: 'POST',
    data: Buffer.from(screenshot, 'base64'),
  }).then(() => {
    console.log('sendScreenshot success')
  })
}

/* dashboard */
/**
 * return users screnshots for period of time
 */
export const GetUserScreenshots = async (payload: IGetUserScreenshotsPayload): Promise<IUserScreenshots> =>
  callApi('screenshot', 'GetUserScreenshots', payload)

/**
 * Returns last screenshot for every user on given project and given day.
 */
export const GetLastScreenshots = async (payload: IGetLastScreenshotsPayload): Promise<ILastScreenshots> =>
  callApi('screenshot', 'GetLastScreenshots', payload)

/**
 * method checks ability to delete and deletes one screenshot
 */
export const DeleteScreenshot = async (payload: IDeleteScreenshotPayload) =>
  callApi('screenshot', 'DeleteScreenshot', payload)

//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * UNUSED SECTION
 */

export const ProjectSettings = async (payload: IProjectAndTrackerPayload): Promise<IProjectSettings> =>
  callApi('screenshot', 'ProjectSettings', payload)

/* Save project basic configuration */
export const ConfigureProject = async (payload: IConfigureProjectPayload) =>
  callApi('screenshot', 'ConfigureProject', payload)

export const ConfigureUser = async (payload: IConfigureUserPayload) => callApi('screenshot', 'ConfigureUser', payload)

/* Update project configuration with integration  */
export const ConfigureProjectWithIntegration = async (payload: IConfigureProjectWithIntegrationPayload) =>
  callApi('screenshot', 'ConfigureProjectWithIntegration', payload)

/* Update project configuration with integration  */
export const ConfigureUserWithIntegration = async (payload: IConfigureUserWithIntegrationPayload) =>
  callApi('screenshot', 'ConfigureUserWithIntegration', payload)

export const ConfigureProjectWithPassword = async (payload: IConfigureProjectWithPasswordPayload) =>
  callApi('screenshot', 'ConfigureProjectWithPassword', payload)

export const ConfigureUserWithPassword = async (payload: IConfigureUserWithPasswordPayload) =>
  callApi('screenshot', 'ConfigureUserWithPassword', payload)

export const ConfigureUserWithOAuthCode = async (
  payload: IConfigureUserWithOAuthCodePayload,
): Promise<IConfigureUserWithOAuthCode> => callApi('screenshot', 'ConfigureUserWithOAuthCode', payload)

export const GetProjectAuthMethods = async (payload: IGetProjectAuthMethodsPayload): Promise<IScreenshotAuthMethods> =>
  callApi('screenshot', 'GetProjectAuthMethods', payload)

export const GetUserAuthMethods = async (payload: IGetUserAuthMethodsPayload): Promise<IScreenshotAuthMethods> =>
  callApi('screenshot', 'GetUserAuthMethods', payload)
