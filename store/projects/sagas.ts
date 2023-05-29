import { select, call, put, take, race } from 'redux-saga/effects'
import { getType, ActionType } from 'typesafe-actions'

import * as actions from './actions'
import * as loginActions from '@store/auth/actions'
import api from '@api'
import { ISettingsItem, IDefaultUserSettings, IProject, IProjectIssue, INamedID } from '@types'
import { IRootState } from '@store/rootReducer'
import { IProjectsSettingsItem } from './types'

const DEFAULT_SETTINGS: ISettingsItem[] = [
  { Key: 'track-apps', Value: 'apps' }, // ‘off’|’apps’|’all’
  { Key: 'screenshot-freq', Value: 'none' }, // 'none'|‘1x’|’2x’|’3x’|’smart’
  { Key: 'planning-max', Value: '24' }, // hours in String format
  { Key: 'manualReportLimit', Value: '4' }, // hours in String format
  { Key: 'track-idle-detection', Value: '10' }, // mins in String format
]

export const getUserSettings = (state: IRootState) => state.user.defaultUserSettings
export const getProjectSettingsFromStore = (state: IRootState) => state.projects.projectsSettings
export const getProjectFromStore = (state: IRootState) => state.projects.projects

export function* getProjectsSettingsSaga() {
  while (true) {
    const getProjectSettingsRequest: ActionType<typeof actions.getProjectSettings.request> = yield take(
      getType(actions.getProjectSettings.request),
    )

    try {
      let userSettings: IDefaultUserSettings
      let ProjectID = getProjectSettingsRequest.payload.ProjectID
      let TrackerID = getProjectSettingsRequest.payload.TrackerID
      if (TrackerID === 0 && ProjectID === '0') {
        userSettings = yield select(getUserSettings)
        TrackerID = userSettings.cold_settings.TrackerID
        ProjectID = userSettings.cold_settings.ProjectID
      }
      const projectKey = `${ProjectID}-${TrackerID}`
      const storedSettings: IProjectsSettingsItem[] = yield select(getProjectSettingsFromStore)
      let existSettings = storedSettings.find(i => i.project === projectKey)
      if (existSettings && !getProjectSettingsRequest.payload.hasUpdate) {
        if (userSettings) {
          existSettings = {
            ...existSettings,
            settings: [
              ...existSettings.settings.filter(s => s.Key !== 'track-idle-detection'),
              { Key: 'track-idle-detection', Value: userSettings.idle },
            ],
          }
        }
        yield put(actions.getProjectSettings.success(existSettings))
      } else {
        const settings: ISettingsItem[] = yield call(api.project.GetSettings, {
          ProjectID,
          TrackerID,
        })
        const allSettings = [...settings, ...DEFAULT_SETTINGS]
        // Remove duplicate settings, allow settings from project
        const uniqSettings = allSettings.filter((obj, pos, arr) => {
          return arr.map(mapObj => mapObj.Key).indexOf(obj.Key) === pos
        })
        yield put(actions.getProjectSettings.success({ project: projectKey, settings: uniqSettings }))
      }
    } catch (error) {
      console.error(error)
    }
  }
}

export function* getProjectsSaga() {
  while (true) {
    yield race({
      getProjects: take(getType(actions.getProjects.request)),
      loginUser: take(getType(loginActions.loginUser.success)),
    })
    try {
      const getProjects: IProject[] = yield call(api.project.GetProjects)
      yield put(actions.getProjects.success(getProjects))
      const storedSettings: IProject[] = yield select(getProjectFromStore)

      const coldProject = storedSettings.find(p => p.ColdProject)

      const issues: IProjectIssue[] = yield call(api.tracker.GetProjectIssues, {
        TrackerID: coldProject.TrackerID,
        ProjectID: coldProject.ProjectID,
      })
      const coldTask = issues.find(i => i.Title === 'Cold Task')
      yield put(actions.handleProjectIssues({ project: 'coldProject', issues: [coldTask] }))
    } catch (error) {
      console.error(error)
    }
  }
}
