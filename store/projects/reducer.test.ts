import { ActionType, getType } from 'typesafe-actions'

import * as actions from './actions'
import { IProjectsState } from './types'
import projects from './reducer'

describe('[Store] Project Reducer', () => {
  it('[Success] [Snapshot] Should handle getProjectSettings', () => {
    const action: ActionType<typeof actions> = {
      type: getType(actions.getProjectSettings.success),
      payload: {
        project: 'project1',
        settings: [
          {
            Key: 'key1',
            Value: 'value2',
          },
        ],
      },
    }

    const currentState: IProjectsState = {
      projectsSettings: [],
      projectsIssues: [],
      projects: [],
    }

    expect(projects(currentState, action)).toMatchSnapshot()
  })

  it('[Failure] Should handle getProjectSettings', () => {
    const action: ActionType<typeof actions> = {
      type: getType(actions.getProjectSettings.failure),
      payload: {
        code: 666,
        message: 'SOME_ERROR',
      },
    }

    const currentState: IProjectsState = {
      projectsSettings: [],
      projectsIssues: [],
      projects: [],
    }

    expect(projects(currentState, action)).toMatchSnapshot()
  })
})
