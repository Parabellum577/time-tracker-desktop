import { IUserProject, ISettingsItem, IColleague, IProject, IColleagueInfo } from '@types'
import {
  IMakeUserAdminPayload,
  IGetSettingsPayload,
  ISetSettingsPayload,
  IUpdateProjectVisibilityPayload,
  IUpdateProjectCacheByTrackers,
} from '@api-types'
import callApi from '../call-api'

/**
 * Method toggle field of visibility of project in all lists of projects. Only for UI.
 */
export const UpdateProjectVisibility = async (payload: IUpdateProjectVisibilityPayload) =>
  callApi('project', 'UpdateProjectVisibility', payload)

/**
 * Accepts project ID and should check access level of user, if he has access to this project
 * returns list of settings in key-value format
 */
export const GetSettings = async (payload: IGetSettingsPayload): Promise<ISettingsItem[]> => {
  const response = await callApi('project', 'GetSettings', payload)
  if (!response || !response.Settings) {
    return []
  }
  return response.Settings
}

/**
 * Set DF settings(like idle detection time) to project in key-value format
 */
export const SetSettings = async (payload: ISetSettingsPayload) => callApi('project', 'SetSettings', payload)

/**
 * Method forces ProjectMS to request list of projects, by calling TrackerIF::GetUserProjects(
 * and storing recieved projects into own storage. In addition, it tries to map IssueStatuses of
 * every project to pre-set list of Statuses - Idle, In Progress, Done, and stores it to ProjectSettings.
 */
export const UpdateProjectsCache = async () => callApi('project', 'UpdateProjectsCache')

/**
 * Method like UpdateProjectsCache but refresh only filtered trackers
 */
export const UpdateProjectsCacheByTrackers = async (payload: IUpdateProjectCacheByTrackers) =>
  callApi('project', 'UpdateProjectsCacheByTrackers', payload)

/**
 * Method returns array of all user projects include active projects and archived projects
 */
export const GetProjects = async (): Promise<IProject[]> => {
  const response = await callApi('project', 'GetProjects')
  if (!response || !response.Projects) {
    return []
  }
  return response.Projects
}

/* dashboard */

/**
 * Method used by all other services to get all project-user relationship data
 */
export const GetActiveColleagues = async (): Promise<IColleagueInfo[]> =>
  (await callApi('project', 'GetActiveColleagues')).Colleagues

/**
 * Method makes admin from user
 * Method checks if current user is admin on specified project, because only admin can promote other user
 */
export const MakeUserAdmin = async (payload: IMakeUserAdminPayload) => callApi('project', 'MakeUserAdmin', payload)

/**
 * Method returns key value with default settings
 */
export const GetDefaultSettingsForProject = async (): Promise<ISettingsItem[]> =>
  callApi('project', 'GetDefaultSettingsForProject')

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
/**
 * Method used by all other services to get all project-user relationship data
 */
export const GetColleagues = async (): Promise<IColleague[]> => (await callApi('project', 'GetColleagues')).Colleagues

/**
 * Method returns list of projects, that user has access to
 */
export const GetUserProjects = async (): Promise<IUserProject[]> => callApi('project', 'GetUserProjects')
