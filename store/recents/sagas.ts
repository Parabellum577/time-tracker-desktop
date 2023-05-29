import { call, take, race, all, put, select } from 'redux-saga/effects'
import { getType } from 'typesafe-actions'

import * as loginActions from '../auth/actions'
import * as projectsActions from '../projects/actions'
import * as actions from './actions'
import * as internetConnectionActions from '../internetConnection/actions'
import api from '@api'
import { IBasicIssue, IProject } from '@types'
import extendIssues from '@services/extendIssues'
import { IRootState } from '@store/rootReducer'
import { isSameTask } from '@services/helpers'

export const getColdProjectFromStore = (state: IRootState) => state.projects.projects.find(proj => proj.ColdProject)

export function* getRecentSaga() {
  while (true) {
    const [internetConnectionStatus]: any = yield race([
      take(getType(internetConnectionActions.changeConnectionStatus)),
      take(getType(actions.getRecent.request)),
      take(getType(loginActions.loginUser.success)),
    ])
    if (internetConnectionStatus && !internetConnectionStatus.payload.isOnline) {
      continue
    }
    try {
      const basicRecent: IBasicIssue[] = yield call(api.planning.GetLastIssues)
      let coldProject: IProject = yield select(getColdProjectFromStore)
      if (!coldProject) {
        yield all([
          put(projectsActions.getProjects.request()),
          race([take(projectsActions.getProjects.success), take(projectsActions.getProjects.failure)]),
        ])
        coldProject = yield select(getColdProjectFromStore)
      }
      const recentsWithoutColdTask = coldProject
        ? basicRecent.filter(
            task =>
              !isSameTask(
                {
                  TrackerID: coldProject.TrackerID,
                  ProjectID: coldProject.ProjectID,
                  IssueID: task.IssueID,
                },
                task,
              ),
          )
        : basicRecent
      const recent = yield call(extendIssues, recentsWithoutColdTask)
      yield put(actions.getRecent.success(recent))
    } catch (error) {
      console.error(error)
    }
  }
}
