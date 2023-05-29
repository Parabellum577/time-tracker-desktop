import { createAsyncAction, createAction } from 'typesafe-actions'
import { IError, IProjectIssue, IProject } from '@types'
import { IProjectsSettingsItem, ISavedProjectIssues } from './types'
import { IGetSettingsPayload } from '@services/api-types'

export const getProjectSettings = createAsyncAction(
  'user/GET_PROJECT_SETTINGS_REQUEST',
  'user/GET_PROJECT_SETTINGS_SUCCESS',
  'user/GET_PROJECT_SETTINGS_FAILURE',
)<IGetSettingsPayload, IProjectsSettingsItem, IError>()

export const handleProjectIssues = createAction('user/GET_PROJECT_ISSUES', action => (issues: ISavedProjectIssues) =>
  action(issues),
)

export const getProjects = createAsyncAction(
  'user/GET_PROJECTS_REQUEST',
  'user/GET_PROJECTS_SUCCESS',
  'user/GET_PROJECTS_FAILURE',
)<void, IProject[], IError>()

export const clearProjects = createAction('user/CLEAR_PROJECTS', action => () => action())
