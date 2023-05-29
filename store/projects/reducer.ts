import { getType } from 'typesafe-actions'
import * as _ from 'lodash'
import * as actions from './actions'
import { IProjectsAction, IProjectsState } from './types'

const initialState: IProjectsState = {
  projectsSettings: [],
  projectsIssues: [],
  projects: [],
}

export default (state: IProjectsState = initialState, action: IProjectsAction): IProjectsState => {
  switch (action.type) {
    case getType(actions.getProjectSettings.success):
      if (action.payload) {
        const filteredProjects = state.projectsSettings.filter(p => p.project !== action.payload.project)
        return {
          ...state,
          projectsSettings: [...filteredProjects, action.payload],
        }
      } else {
        return { ...state }
      }
    case getType(actions.handleProjectIssues):
      return {
        ...state,
        projectsIssues: [...state.projectsIssues.filter(p => p.project !== action.payload.project), action.payload],
      }
    case getType(actions.getProjects.success):
      const projects = action.payload

      return {
        ...state,
        projects,
      }
    case getType(actions.getProjects.failure):
      return { ...state }
    case getType(actions.clearProjects):
      return { ...state, projects: [] }
    default:
      return state
  }
}
