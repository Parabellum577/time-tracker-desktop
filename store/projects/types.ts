import { ActionType } from 'typesafe-actions'

import { ISettingsItem, IProjectIssue, IProject } from '@types'
import * as actions from './actions'

export type IProjectsSettings = IProjectsSettingsItem[]

export interface IProjectsSettingsItem {
  project: string
  settings: ISettingsItem[]
}

export interface ISavedProjectIssues {
  project: string
  issues: IProjectIssue[]
}

export type IProjectsAction = ActionType<typeof actions>

export interface IProjectsState {
  readonly projectsSettings: IProjectsSettings
  readonly projectsIssues: ISavedProjectIssues[]
  readonly projects: IProject[]
}
