import { SagaIterator } from 'redux-saga'
import { select, all, call, fork, put, putResolve, take, race, delay, cancel, cancelled } from 'redux-saga/effects'
import { getType, ActionType } from 'typesafe-actions'
import * as _ from 'lodash'

import * as notificationActions from '../notifications/actions'
import * as actions from './actions'
import * as loginActions from '../auth/actions'
import * as сurrentUserActions from '../currentUser/actions'
import * as recentActions from '../recents/actions'
import * as internetConnectionActions from '../internetConnection/actions'
import * as projectActions from '../projects/actions'
import * as newDayActions from '../newDay/actions'
import * as alertActions from '../alerts/actions'
import * as timelineActions from '../timeline/actions'

import { sagaCallApiRetried } from '@services/call-api'
import api from '@api'
import time from '@services/time'

import {
  IPlanning,
  IProject,
  IUser,
  IDefaultUserSettings,
  IProjectIssue,
  IGetFilteredPlannings,
  ISpentTimeHistory,
  IPlanningInfo,
  IExtendedSpentTimeHistory,
  IReportManually,
  ITimelinePlanning,
  ITimeSummary,
  ISetSpent,
} from '@types'
import { ISavedProjectIssues, IProjectsSettingsItem } from '../projects/types'
import { IAlert } from '../alerts/types'
import { IRootState } from '@store/rootReducer'

import {
  ICreatePlanningPayload,
  IColdSlice,
  IReportPayload,
  ICreateManualPlanningPayload,
  ISetStatusPayload,
  IStopPlanning,
} from '@api-types'

import { getAuthData } from '@store/auth/utils'
import { formatTime } from '@services/formater'
import {
  getFullSpentTime,
  getActivePlanning,
  groupByDay,
  isSameTask,
  isOutdated,
  getSyncState,
  getIsMaster,
} from '@services/helpers'
import { sendEvent } from '@electronMain/src/analytics/facade'
import { getWindow, createWindow } from '@electronMain/src/helpers/browserWindow'
import Token from '@electronMain/src/helpers/token'
import { startTimeTrackerSaga, stopTimeTrackerSaga, syncSpentSlices } from '@store/timeTracker/sagas'

export const getCurrentUserFromStore = (state: IRootState) => state.user.currentUser
export const getOpenPlanningsFromStore = (state: IRootState) => state.plannings.openPlannings
export const geClosedPlanningsFromStore = (state: IRootState) => state.plannings.closedPlannings
export const getColdPlanningsFromStore = (state: IRootState) => state.plannings.coldPlannings
export const getDefaultUserSettings = (state: IRootState) => state.user.defaultUserSettings
export const getProjectIssues = (state: IRootState) => state.projects.projectsIssues
export const getProjectFromStore = (state: IRootState) => state.projects.projects
export const getProjectSettingsFromStore = (state: IRootState) => state.projects.projectsSettings
export const getAlertsFromStore = (state: IRootState) => state.alerts.alertsArray
export const getIsOnlineFromStore = (state: IRootState) => state.internetConnection.isOnline
export const getAverageData = (state: IRootState) => state.productivity.averageData

function* getMaxProjectTime(activePlanning: IPlanning) {
  const { TrackerID, ProjectID, ID } = activePlanning
  const openPlannings: IPlanning[] = yield select(getOpenPlanningsFromStore)
  const closedPlannings: IPlanning[] = yield select(geClosedPlanningsFromStore)
  let projectsSettings: IProjectsSettingsItem[] = yield select(getProjectSettingsFromStore)
  let storedSettings = projectsSettings.find(p => p.project === `${ProjectID}-${TrackerID}`)

  if (!storedSettings) {
    yield all([
      put(
        projectActions.getProjectSettings.request({
          ProjectID,
          TrackerID,
        }),
      ),
      race([take(projectActions.getProjectSettings.success), take(projectActions.getProjectSettings.failure)]),
    ])
    projectsSettings = yield select(getProjectSettingsFromStore)
    console.log('TCL: function*getMaxProjectTime -> projectsSettings', projectsSettings)
    storedSettings = projectsSettings.find(p => p.project === `${ProjectID}-${TrackerID}`) || {
      settings: [],
      project: `${ProjectID}-${TrackerID}`,
    }
  }
  console.log('TCL: function*getMaxProjectTime -> storedSettings', storedSettings)

  const maxTimeSetting = storedSettings.settings.find(s => s.Key === 'planning-max') || { Value: 23.99 }
  const maxTime = +maxTimeSetting.Value || 23.99

  const totalPlanned = _.filter(openPlannings, {
    Outdated: false,
    ProjectID,
    TrackerID,
  })
    .filter(p => p.ID !== ID)
    .reduce((red, item) => red + Math.max(item.Estimation, getFullSpentTime(item)), getFullSpentTime(activePlanning))

  const totalReported = _.filter(closedPlannings, {
    Outdated: false,
    ProjectID,
    TrackerID,
  }).reduce((red, item) => red + item.Reported, 0)

  const availableTime = maxTime * 3600 - (totalPlanned - totalReported)
  return { availableTime, maxTime }
}

export function* expiredPlanningStopSaga(): SagaIterator {
  while (true) {
    let openPlannings: IPlanning[] = yield select(getOpenPlanningsFromStore)
    let activePlanning = openPlannings.find(p => p.Active)
    console.log('TCL: activePlanning', activePlanning)
    if (!activePlanning) {
      yield take(getType(actions.startPlanning.success))
      openPlannings = yield select(getOpenPlanningsFromStore)
      activePlanning = openPlannings.find(p => p.Active)
    }
    const isMaster: boolean = yield call(getSyncState)
    console.log('function*expiredPlanningStopSaga -> isMaster', isMaster)
    if (!activePlanning) {
      continue
    }
    const plannedTime = activePlanning.Estimation || activePlanning.IssueEstimation
    console.log('TCL: plannedTime', plannedTime)
    const spentTime = getFullSpentTime(activePlanning)
    console.log('TCL: spentTime', spentTime)
    const delayTime = Math.round(plannedTime - spentTime)
    console.log('TCL: delayTime', delayTime)
    if (delayTime > 60 && isMaster) {
      yield race([
        take(getType(actions.stopPlanning.success)),
        take(getType(actions.setExtra)),
        delay((delayTime - 60) * 1000),
      ])
    } else if (delayTime > 0 && isMaster) {
      const startTimeOfCheckingExpired = time.now()
      let expiredTime = Math.round(startTimeOfCheckingExpired + delayTime)
      try {
        yield call(syncSpentSlices)
        const { TimeSpent }: ISetSpent = yield sagaCallApiRetried(api.planning.SetSpent, {
          PlanningID: activePlanning.ID,
          Time: startTimeOfCheckingExpired,
        })
        expiredTime = startTimeOfCheckingExpired + (plannedTime - TimeSpent)
      } catch (error) {
        console.error('expiredPlanningStopSaga api.planning.SetSpent error:', error)
      }
      const { isExpired } = yield race({
        stopPlanning: take(getType(actions.stopPlanning.success)),
        setExtra: take(getType(actions.setExtra)),
        isExpired: delay(delayTime * 1000),
      })
      if (!isExpired) {
        continue
      }
      const { isOverSpentMode } = yield select(getDefaultUserSettings)
      if (isOverSpentMode === 'off') {
        yield put(actions.stopPlanning.request({ reason: 'expired', expiredTime }))
        yield race([take(getType(actions.stopPlanning.success)), take(getType(actions.stopPlanning.failure))])
        yield put(actions.setSpentTime(activePlanning.ID, plannedTime))
      }
      yield put(
        notificationActions.showNotification.request({
          notificationType: 'IssueExp',
          IssueTitle: activePlanning.IssueTitle,
        }),
      )
    } else {
      yield race([take(getType(actions.stopPlanning.success)), take(getType(actions.setExtra))])
    }
  }
}

export function* getClosedPlannings(): SagaIterator {
  try {
    let currentUser: IUser = yield select(getCurrentUserFromStore)
    if (_.isEmpty(currentUser)) {
      yield take(getType(сurrentUserActions.getCurrentUser.success))
      currentUser = yield select(getCurrentUserFromStore)
    }
    let getProjects: IProject[] = yield select(getProjectFromStore)
    if (_.isEmpty(getProjects)) {
      yield put(projectActions.getProjects.request())
      yield take(projectActions.getProjects.success)
      getProjects = yield select(getProjectFromStore)
    }
    const filteredProjects = getProjects.filter(proj => proj.ProjectStatus !== 'ARCHIVED')

    const baseProjects = filteredProjects.reduce(
      (red, project) => {
        return [...red, { TrackerID: project.TrackerID, ProjectID: project.ProjectID }]
      },
      [{ TrackerID: 0, ProjectID: '0' }],
    )

    const DateFrom = time.startOfDay()
    const DateTo = time.endOfDay()

    const payload = {
      FilterProjects: baseProjects,
      FilterUsers: [currentUser.UserID],
      DateFrom,
      DateTo,
    }
    const plannings: IPlanning[] = yield call(api.planning.GetClosedPlannings, payload)
    yield put(actions.getClosedPlannings.success(plannings))
  } catch (e) {
    yield put(actions.getClosedPlannings.failure(e))
  }
}

const syncPlanningSpentTime = (p: IPlanning) => {
  if (!p.Active) {
    return p
  }

  return {
    ...p,
    LastActivity: time.now(),
    SpentOnline: p.SpentOnline + (time.now() - p.LastActivity),
  }
}

export function* getOpenPlannings(): SagaIterator {
  try {
    let plannings: IPlanning[] = yield call(api.planning.GetOpenPlannings)
    plannings = plannings.map(syncPlanningSpentTime)
    yield put(actions.getOpenPlannings.success(plannings))
  } catch (e) {
    console.error('getOpenPlannings', e)
    yield put(actions.getOpenPlannings.failure(e))
  }
}

export function* getColdPlannings(): SagaIterator {
  try {
    let plannings: IPlanning[] = yield call(api.planning.GetColdPlannings)
    plannings = plannings.map(syncPlanningSpentTime)
    yield put(actions.getColdPlannings.success(plannings))
    return plannings
  } catch (e) {
    console.error('getColdPlannings', e)
    yield put(actions.getColdPlannings.failure(e))
  }
}

export function* synchronizationOpenAndColdPlanningsSaga() {
  while (true) {
    yield all({
      getOpenPlannings: take(getType(actions.getOpenPlannings.success)),
      getColdPlannings: take(getType(actions.getColdPlannings.success)),
    })

    const activePlanning = yield call(getActivePlanning)

    if (activePlanning) {
      yield put(
        actions.startPlanning.request({
          PlanningID: activePlanning.ID,
          TracingID: activePlanning.StartedBy,
        }),
      )
    }
  }
}

export function* updatePlanningSpentTime(PlanningID: number, lastActiveTime: number, now: number) {
  const field = 'SpentOnline' // TODO: Add SpentOffline
  const additionalTime = (now - lastActiveTime) / 1000
  if (additionalTime > 1.4) {
    console.log('updatePlanningSpentTime smth use CPU', additionalTime)
  }
  yield put(actions.timeTickInActivePlanning(PlanningID, field, additionalTime))
}

export function* timeTickInActivePlanningLoop(PlanningID: number): SagaIterator {
  let lastActiveTime = time.nowExact()
  try {
    while (true) {
      const now = time.nowExact()
      yield call(updatePlanningSpentTime, PlanningID, lastActiveTime, now)
      lastActiveTime = now
      yield delay(1000)
    }
  } finally {
    if (yield cancelled()) {
      const now = time.nowExact()
      yield call(updatePlanningSpentTime, PlanningID, lastActiveTime, now)
    }
  }
}

export function* createPlanning(payload: { task: ICreatePlanningPayload; isStarted: boolean }): SagaIterator {
  try {
    const newPlanningID: number = yield call(api.planning.CreatePlanning, payload.task)
    yield call(getOpenPlannings)
    if (payload.isStarted) {
      yield put(actions.startPlanning.request({ PlanningID: newPlanningID }))
    }
  } catch (e) {
    console.error('createPlanning', e)
    yield put(actions.startPlanning.failure(e))
    const message =
      e.message === 'OPENED_PLANNING_EXISTS' ? 'Please close or report same outdated task first.' : e.message
    yield put(alertActions.showAlertMessage.request({ alertMessage: message, alertType: 'error' }))
  }
}

export function* getTimeSummary(): SagaIterator {
  while (true) {
    const [internetConnectionStatus]: any = yield race([
      take(getType(internetConnectionActions.changeConnectionStatus)),
      take(getType(loginActions.loginUser.success)),
      take(getType(actions.closePlanning.success)),
      take(getType(actions.reportManually.success)),
      take(getType(actions.getTimeSummary.request)),
      take(getType(newDayActions.newDayDetection)),
    ])

    if (internetConnectionStatus && !internetConnectionStatus.payload.isOnline) {
      continue
    }

    try {
      const payload = {
        From: time.getFirstDayOfMonth(),
        To: time.now(),
      }

      const data = yield call(api.planning.GetSpentParts, payload)

      const startOfDay = time.startOfDay()
      const startOfMonth = time.getFirstDayOfMonth()

      let sumTotalDay = 0
      let sumManualToday = 0
      let sumTotalMonth = 0
      let sumManualMonth = 0

      data.map((part: ISpentTimeHistory) => {
        if (part.StartedAt >= startOfDay) {
          sumTotalDay += part.Spent
        }

        if (part.Status === 'MANUAL' && part.StartedAt >= startOfDay) {
          sumManualToday += part.Spent
        }

        if (part.StartedAt >= startOfMonth) {
          sumTotalMonth += part.Spent
        }

        if (part.Status === 'MANUAL' && part.StartedAt >= startOfMonth) {
          sumManualMonth += part.Spent
        }
      })

      const timeSummary = {
        sumTotalDay,
        sumManualToday,
        sumTotalMonth,
        sumManualMonth,
      }

      yield put(actions.getTimeSummary.success(timeSummary))
    } catch (error) {
      console.log(error)
    }
  }
}

export function* newDayTimeSummaryReset(): SagaIterator {
  while (true) {
    yield take(newDayActions.newDayDetection)

    const timeSummary: ITimeSummary = {
      sumTotalDay: 0,
      sumManualToday: 0,
    }

    yield put(actions.getTimeSummary.success({ ...timeSummary }))
  }
}

interface IStartStopRace {
  startPlanningAction?: ActionType<typeof actions.startPlanning.request>
  stopPlanningAction?: ActionType<typeof actions.stopPlanning.request>
}

export function* startStopPlanningSaga() {
  let timeTrackingTask

  while (true) {
    console.log('function*startStopPlanningSaga -> startStopPlanningSaga !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    const { startPlanningAction, stopPlanningAction }: IStartStopRace = yield race({
      startPlanningAction: take(getType(actions.startPlanning.request)),
      stopPlanningAction: take(getType(actions.stopPlanning.request)),
    })
    console.log('function*startStopPlanningSaga -> startStopPlanningSaga 3!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')

    const activePlanning = yield call(getActivePlanning)
    const { isOverSpentMode } = yield select(getDefaultUserSettings)

    if (startPlanningAction) {
      const { PlanningID, TracingID } = startPlanningAction.payload
      const openPlannings: IPlanning[] = yield select(getOpenPlanningsFromStore)
      const coldPlannings: IPlanning[] = yield select(getColdPlanningsFromStore)
      const planning = openPlannings.concat(coldPlannings).find(p => p.ID === startPlanningAction.payload.PlanningID)

      if (planning && planning.Outdated) {
        continue
      }

      if (timeTrackingTask && activePlanning && activePlanning.ID === PlanningID) {
        continue
      }

      const isMaster = !TracingID || TracingID === getAuthData().TracingID

      if (timeTrackingTask) {
        yield cancel(timeTrackingTask)
      }

      if (activePlanning && activePlanning.ID !== PlanningID) {
        yield call(stopTimeTrackerSaga)
        yield putResolve(actions.stopPlanning.success())
      }
      console.log(1)
      yield call(startTimeTrackerSaga, PlanningID, isMaster)
      console.log(2)
      yield put(actions.startPlanning.success(PlanningID))

      timeTrackingTask = yield fork(timeTickInActivePlanningLoop, PlanningID)
    } else {
      if (timeTrackingTask) {
        yield cancel(timeTrackingTask)
      }

      if (activePlanning) {
        if (
          stopPlanningAction.payload &&
          stopPlanningAction.payload.reason === 'expired' &&
          stopPlanningAction.payload.expiredTime
        ) {
          // yield call(stopPlanning, activePlanning.ID, stopPlanningAction.payload.expiredTime)
          yield call(stopTimeTrackerSaga, stopPlanningAction.payload.expiredTime)
        } else {
          yield call(stopTimeTrackerSaga)
        }
        yield put(actions.stopPlanning.success())
        console.log('function*startStopPlanningSaga -> stopTimeTrackerSaga')
      }
    }
    console.log('function*startStopPlanningSaga -> startStopPlanningSaga 2 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  }
}

let isAutoLaunched = process.argv.some(p => p.includes('--hidden'))

export function* startStopColdPlanningSaga() {
  while (true) {
    const { startPlanningAction, stopPlanningAction, loginUser } = yield race({
      loginUser: take(getType(loginActions.loginUser.success)),
      startPlanningAction: take(getType(actions.startColdPlanning.request)),
      stopPlanningAction: take(getType(actions.stopColdPlanning.request)),
    })

    try {
      let isStartColdPlanning
      let coldPlannings: IPlanning[]

      if (loginUser) {
        yield delay(1000)
        coldPlannings = yield call(getColdPlannings)
        const defaultUserSettings: IDefaultUserSettings = yield select(getDefaultUserSettings)
        if (defaultUserSettings.isInstantColdStart === 'on') {
          if (isAutoLaunched) {
            isStartColdPlanning = true
          }
          isAutoLaunched = false
        }
      } else {
        coldPlannings = yield select(getColdPlanningsFromStore)
      }

      const openOutdatedColdPlannings: IPlanning[] = coldPlannings.filter(p => p.Status === 'OPEN' && p.Outdated)

      if (!_.isEmpty(openOutdatedColdPlannings)) {
        for (const p of openOutdatedColdPlannings) {
          try {
            yield call(api.planning.CloseColdPlanningWithoutReport, { PlanningID: p.ID })
            yield put(actions.closeColdPlanning(p.ID))
          } catch (error) {
            console.error(error)
            continue
          }
        }
      }

      let actualColdPlanning: IPlanning = coldPlannings.find(p => p.Status === 'OPEN')

      if (!actualColdPlanning) {
        yield call(api.planning.CreateColdPlanning)
        coldPlannings = yield call(getColdPlannings)
      }

      if (startPlanningAction || isStartColdPlanning) {
        actualColdPlanning = coldPlannings.find(p => p.Status === 'OPEN')
        yield put(actions.startPlanning.request({ PlanningID: actualColdPlanning.ID }))
      } else if (stopPlanningAction) {
        console.log('startStopColdPlanningSaga stopPlanning.request')

        yield put(actions.stopPlanning.request())
      }
    } catch (error) {
      console.error(error)
    }
  }
}

export function* handleNewDaySaga() {
  while (true) {
    yield take(getType(newDayActions.newDayDetection))

    const activePlanning: IPlanning = yield call(getActivePlanning)
    const isMaster: boolean = yield select(getIsMaster)

    if (activePlanning) {
      if (isMaster) {
        yield put(actions.stopPlanning.request())
      }
      yield race([take(getType(actions.stopPlanning.success)), take(getType(actions.stopPlanning.failure))])
    }

    if (isMaster) {
      yield call(getOpenPlannings)
      yield delay(1000)
      yield call(reportOpenPlannings)

      if (activePlanning) {
        yield put(
          actions.createPlannings.request([
            {
              isStarted: true,
              task: {
                ...activePlanning,
                Comment: activePlanning.CloseComment,
              },
            },
          ]),
        )
      }
    }
  }
}

export function* reportOpenPlannings(onlyOutdated = false): SagaIterator {
  let planningIssue
  const currentUser: IUser = yield select(getCurrentUserFromStore)
  const openPlannings: IPlanning[] = yield select(getOpenPlanningsFromStore)
  const planningsToReport = openPlannings.filter(p => !onlyOutdated || isOutdated(p))
  for (const planning of planningsToReport) {
    try {
      let comment

      if (!planning.OpenComment) {
        const project = `${planning.ProjectID}-${planning.TrackerID}`
        const projectIssuesFromStore: ISavedProjectIssues[] = yield select(getProjectIssues)
        const projectInStore = projectIssuesFromStore.find(p => p.project === project)
        // const averageData = yield select(getAverageData)
        // const roundedFocus = Math.round(averageData.Focus) // In feature, for showing focus value in autoreport comment
        if (projectInStore) {
          planningIssue = projectInStore.issues.find(issue => issue.ID === planning.IssueID)
        } else {
          const projectIssues: IProjectIssue[] = yield call(api.tracker.GetProjectIssues, {
            TrackerID: planning.TrackerID,
            ProjectID: planning.ProjectID,
          })
          yield put(projectActions.handleProjectIssues({ project, issues: projectIssues }))
          planningIssue = projectIssues.find(issue => issue.ID === planning.IssueID)
        }

        comment = `${currentUser.FirstName} reported ${formatTime(
          getFullSpentTime(planning),
          'Hh Mm',
        )}. ${time.todayDate()} from timetracker, Total in this task: ${formatTime(
          getFullSpentTime(planning) + planningIssue.Spent,
          'Hh Mm',
        )}`
      }

      yield put(
        actions.closePlanning.request({
          ...planning,
          CloseComment: planning.OpenComment || comment,
        }),
      )

      yield take([getType(actions.closePlanning.success), getType(actions.closePlanning.failure)])
    } catch (error) {
      console.error(error)
    }
  }
}

export function* getOpenPlanningsSaga() {
  while (true) {
    const { internetConnectionStatus } = yield race({
      getOpenPlannings: take(getType(actions.getOpenPlannings.request)),
      loginUser: take(getType(loginActions.loginUser.success)),
      // internetConnectionStatus: take(getType(internetConnectionActions.changeConnectionStatus)),
    })
    if (internetConnectionStatus && !internetConnectionStatus.payload.isOnline) {
      continue
    }
    yield call(getOpenPlannings)
    yield call(reportOpenPlannings, true)
  }
}

export function* getColdPlanningsSaga() {
  while (true) {
    const { internetConnectionStatus } = yield race({
      getColdPlannings: take(getType(actions.getColdPlannings.request)),
      // internetConnectionStatus: take(getType(internetConnectionActions.changeConnectionStatus)),
      loginUser: take(getType(loginActions.loginUser.success)),
    })
    if (internetConnectionStatus && !internetConnectionStatus.payload.isOnline) {
      continue
    }
    yield call(getColdPlannings)
  }
}

export function* createPlanningSaga() {
  while (true) {
    const createPlanningAction = yield take(getType(actions.createPlannings.request))
    const tasks = createPlanningAction.payload

    for (let i = createPlanningAction.payload.length - 1; i >= 0; i--) {
      const task = tasks[i]
      yield call(createPlanning, task)
      yield delay(200)
    }
  }
}

export function* getClosedPlanningsSaga() {
  while (true) {
    const { internetConnectionStatus } = yield race({
      getClosedPlannings: take(getType(actions.getClosedPlannings.request)),
      internetConnectionStatus: take(getType(internetConnectionActions.changeConnectionStatus)),
      loginUser: take(getType(loginActions.loginUser.success)),
    })
    if (internetConnectionStatus && !internetConnectionStatus.payload.isOnline) {
      continue
    }
    yield call(getClosedPlannings)
  }
}

export function* reportPlanningSaga(): SagaIterator {
  while (true) {
    try {
      let message
      const response = yield take(getType(actions.closePlanning.request))
      const planningToReport = response.payload

      if (planningToReport.Active) {
        yield put(actions.stopPlanning.request())
        yield take(getType(actions.stopPlanning.success))
      }

      getFullSpentTime(planningToReport) > 0
        ? (message = 'Planning successfully reported')
        : (message = 'Planning successfully removed')

      yield put(
        alertActions.showAlertMessage.request({ alertMessage: 'Planning will be reported', alertType: 'warning' }),
      )

      yield call(syncSpentSlices)

      yield call(api.planning.ClosePlanning, {
        PlanningID: planningToReport.ID,
        Progress: 0,
        Time: getFullSpentTime(planningToReport),
        Comment: planningToReport.CloseComment,
        IssuePriority: planningToReport.IssuePriorities,
        IssueStatus: planningToReport.IssueStatuses,
      })

      yield put(
        recentActions.addRecent.success({
          Done: planningToReport.IssueDone,
          DueDate: planningToReport.IssueDueDate,
          Estimate: planningToReport.IssueEstimation || planningToReport.Estimation,
          ID: planningToReport.IssueID,
          IsAssigned: true,
          Priority: { ID: 0, Name: '' },
          Spent: getFullSpentTime(planningToReport),
          Status: { ID: 0, Name: '' },
          Activity: 0,
          Title: planningToReport.IssueTitle,
          Type: { ID: 0, Name: '' },
          URL: planningToReport.IssueURL,
          TrackerID: planningToReport.TrackerID,
          ProjectID: planningToReport.ProjectID,
        }),
      )
      yield put(alertActions.showAlertMessage.request({ alertMessage: message, alertType: 'success' }))
      yield put(actions.closePlanning.success(planningToReport))
    } catch (error) {
      console.error(error)
      yield put(alertActions.showAlertMessage.request({ alertMessage: error.message, alertType: 'error' }))
      if (error.code === 103) {
        yield put(actions.getOpenPlannings.request())
        yield put(actions.getClosedPlannings.request())
      }
      yield put(actions.closePlanning.failure(error))
    }
  }
}

export function* reportColdPlanningSaga(): SagaIterator {
  while (true) {
    try {
      const {
        payload: { selectedIssue, reportComment, valueToReport },
      } = yield take(getType(actions.reportColdPlannings.request))
      const currentUser: IUser = yield select(getCurrentUserFromStore)
      const coldPlannings: IPlanning[] = yield select(getColdPlanningsFromStore)
      const activeColdPlanning = coldPlannings.find(p => p.Active)
      const averageData = yield select(getAverageData)
      const roundedFocus = Math.round(averageData.Focus)

      if (activeColdPlanning) {
        yield put(actions.stopPlanning.request())
        yield take(getType(actions.stopPlanning.success))
      }

      const lastPlanning = _.last(coldPlannings)
      const timeSheetPayload = {
        FilterProjects: [{ TrackerID: 0, ProjectID: '0' }],
        FilterUsers: [currentUser.UserID],
        DateFrom: lastPlanning.CreatedAt,
        DateTo: time.now(),
      }

      const { SpentTime }: IGetFilteredPlannings = yield call(api.planning.GetTimesheets, timeSheetPayload)

      const comment = _.isEmpty(reportComment)
        ? `${currentUser.FirstName} reported ${formatTime(
            valueToReport,
            'Hh Mm',
          )}. ${time.todayDate()} from timetracker, Total in this task: ${formatTime(
            valueToReport + selectedIssue.Spent,
            'Hh Mm',
          )}`
        : reportComment

      const timeSlices: IColdSlice[] = SpentTime.map((slice, i) => {
        return {
          ActivityID: null,
          Comment: comment,
          End: slice.EndedAt,
          IssueDone: 0,
          IssueDueDate: selectedIssue.DueDate,
          IssueEstimation: selectedIssue.Estimate,
          IssueID: selectedIssue.ID,
          IssueTitle: selectedIssue.Title,
          IssueURL: '',
          ProjectID: selectedIssue.ProjectID,
          Start: i === 0 ? slice.StartedAt : Math.max(slice.StartedAt, SpentTime[i - 1].EndedAt + 1),
          TrackerID: selectedIssue.TrackerID,
          Status: slice.Status,
        }
      }).filter(slice => slice.End > slice.Start)

      const timeSlicesByDay = _.groupBy(timeSlices, groupByDay)
      const slicesDates = Object.keys(timeSlicesByDay)
        .sort()
        .reverse()
      const sortedTimeSlices = slicesDates.map(day => timeSlicesByDay[day])

      const timeSlicesToReassign: IColdSlice[][] = []
      let sum: number = 0

      for (const daySlices of sortedTimeSlices) {
        let isLastDay = false
        let daySum: number = 0
        const updatedDaySlices: IColdSlice[] = []

        for (const slice of daySlices) {
          const sliceTime = slice.End - slice.Start

          if (sum + daySum + sliceTime <= valueToReport) {
            daySum += sliceTime
            updatedDaySlices.push(slice)
          } else {
            const timeLeft = Math.floor(valueToReport - (sum + daySum))
            sum = valueToReport
            updatedDaySlices.push({ ...slice, End: slice.Start + timeLeft })
            timeSlicesToReassign.push(updatedDaySlices)
            isLastDay = true
            break
          }
        }

        if (isLastDay) {
          break
        } else {
          sum += daySum
          timeSlicesToReassign.push(updatedDaySlices)
        }
      }

      for (const value of timeSlicesToReassign) {
        try {
          const alerts: IAlert[] = yield select(getAlertsFromStore)
          if (_.isEmpty(alerts)) {
            yield put(
              alertActions.showAlertMessage.request({
                alertMessage: `${formatTime(
                  valueToReport,
                  'Hh Mm Ss',
                )} in a process of reporting into ${selectedIssue.Title.slice(10)}`,
                alertType: 'coldstart',
              }),
            )
          }
          yield call(api.planning.ReassignColdPlanning, { Slices: value })
          yield delay(1000)
        } catch (error) {
          console.log(error)
        }
      }

      yield call(api.tracker.SetStatus, {
        ProjectID: selectedIssue.ProjectID,
        TrackerID: selectedIssue.TrackerID,
        IssueID: selectedIssue.ID,
        IssueStatus: selectedIssue.Status,
      })
    } catch (error) {
      console.error(error)
      yield put(alertActions.showAlertMessage.request({ alertMessage: error.message, alertType: 'error' }))
    }
  }
}

export function* manualReportSaga(): SagaIterator {
  while (true) {
    try {
      const response = yield take(getType(actions.reportManually.request))
      const { StartTime, EndTime, ProjectID, TrackerID, SelectedIssue, Comment }: IReportManually = response.payload
      // start, end and duration of selected time period on timeline
      const coldSlicesToReport: IColdSlice[] = []
      let updatedTimeSheets: IExtendedSpentTimeHistory[] = []
      const manualSlicesToReport: ICreateManualPlanningPayload[] = []
      const startOfTimeSlice = time.startOfDay() + StartTime
      const selectedSliceDuration = EndTime - StartTime
      const endOfTimeSlice = startOfTimeSlice + selectedSliceDuration
      const coldPlannings: IPlanning[] = yield select(getColdPlanningsFromStore)
      const actualColdPlanning = coldPlannings.find(p => !p.Outdated)

      const planningInfo: IPlanningInfo = {
        ActivityID: null,
        IssueDone: SelectedIssue.Done,
        IssueDueDate: SelectedIssue.DueDate,
        IssueID: SelectedIssue.ID,
        IssueTitle: SelectedIssue.Title,
        IssueURL: SelectedIssue.URL,
        IssueEstimation: SelectedIssue.Estimate,
        IssuePriority: SelectedIssue.Priority,
        IssueStatus: SelectedIssue.Status,
        ProjectID,
        TrackerID,
        Comment,
      }

      const defaultSlice: IColdSlice = {
        ...planningInfo,
        Status: 'ONLINE',
        End: 1,
        Start: 0,
      }

      const defaultTimeSheet: IExtendedSpentTimeHistory = {
        Comment,
        EndedAt: 1,
        IsEmpty: false,
        IssueID: SelectedIssue.ID,
        IssueTitle: SelectedIssue.Title,
        ProjectID,
        Spent: 1,
        StartedAt: 0,
        Status: 'MANUAL',
        TrackerID,
      }

      const daySpendParts: IExtendedSpentTimeHistory[] = yield call(api.planning.GetSpentParts, {
        From: time.startOfDay(),
        To: time.now(),
      })

      const requiredSpendParts: IExtendedSpentTimeHistory[] = daySpendParts.filter(
        part => part.EndedAt >= startOfTimeSlice && part.StartedAt <= endOfTimeSlice,
      )
      // all time slices in selected range
      const spendParts: IExtendedSpentTimeHistory[] = requiredSpendParts.map(part => {
        if (part.StartedAt < startOfTimeSlice || part.EndedAt > endOfTimeSlice) {
          if (part.StartedAt < startOfTimeSlice) {
            return { ...part, StartedAt: startOfTimeSlice, Spent: part.EndedAt - startOfTimeSlice }
          }
          if (part.EndedAt > endOfTimeSlice) {
            return { ...part, EndedAt: endOfTimeSlice, Spent: endOfTimeSlice - part.StartedAt }
          }
        } else {
          return part
        }
      })

      // if there were no trackings in selected range
      if (_.isEmpty(spendParts)) {
        const ID = yield call(api.planning.CreateManualPlanning, {
          ...planningInfo,
          Estimation: selectedSliceDuration,
          IssueEstimation: selectedSliceDuration,
          SpentManual: selectedSliceDuration,
          Time: startOfTimeSlice,
        })

        const Report: IReportPayload = {
          ActivityID: null,
          Comments: Comment,
          Duration: selectedSliceDuration,
          IssueID: SelectedIssue.ID,
          Progress: 100,
          Started: startOfTimeSlice,
        }

        const IssueStatus: ISetStatusPayload = {
          TrackerID,
          ProjectID,
          IssueID: SelectedIssue.ID,
          IssueStatus: SelectedIssue.Status,
        }

        yield call(api.tracker.CreateReport, { TrackerID, ProjectID, Report })

        const Planning: ITimelinePlanning = {
          ...planningInfo,
          Active: false,
          ID,
          IsColdPlanning: false,
          IsManual: true,
          SpentManual: selectedSliceDuration,
          SpentOffline: 0,
          SpentOnline: 0,
          IssueSpent: SelectedIssue.Spent,
        }

        updatedTimeSheets.push({
          ...defaultTimeSheet,
          Planning,
          StartedAt: startOfTimeSlice,
          EndedAt: endOfTimeSlice,
          Spent: selectedSliceDuration,
          Status: 'MANUAL',
        })

        // some trackings exist in selected range
      } else {
        // defining cold tracking slices and reassigning them
        const coldSlices = spendParts.filter(part => part.ProjectID === '0' && part.TrackerID === 0)
        if (!_.isEmpty(coldSlices)) {
          for (const coldSlice of coldSlices) {
            coldSlicesToReport.push({
              ...defaultSlice,
              Start: coldSlice.StartedAt,
              End: coldSlice.EndedAt,
              IssueEstimation: coldSlice.EndedAt - coldSlice.StartedAt,
            })

            const Planning: ITimelinePlanning = {
              ...planningInfo,
              Active: false,
              ID: actualColdPlanning.ID,
              IsColdPlanning: true,
              IsManual: false,
              SpentManual: 0,
              SpentOffline: 0,
              SpentOnline: coldSlice.Spent,
              IssueSpent: SelectedIssue.Spent,
            }

            updatedTimeSheets.push({
              ...defaultTimeSheet,
              Planning,
              StartedAt: coldSlice.StartedAt,
              EndedAt: coldSlice.EndedAt,
              Spent: coldSlice.Spent,
              Status: 'ONLINE',
            })
          }

          yield call(api.planning.ReassignColdPlanning, { Slices: coldSlicesToReport })
        }

        // defining empty slices and report them with status manual
        // if there is only one spend inside selected range
        if (spendParts.length === 1) {
          // if spend time slice started later than the start of selected range --> manual slice created in between
          if (spendParts[0].StartedAt > startOfTimeSlice + 5) {
            const sliceDuration = spendParts[0].StartedAt - 1 - startOfTimeSlice
            manualSlicesToReport.push({
              ...planningInfo,
              Estimation: sliceDuration,
              IssueEstimation: sliceDuration,
              SpentManual: sliceDuration,
              Time: startOfTimeSlice,
            })
          }
          // if spend time ended earlier than the end of selected range --> manual slice created in between
          if (spendParts[0].EndedAt < endOfTimeSlice - 5) {
            const sliceDuration = endOfTimeSlice - spendParts[0].EndedAt + 1
            manualSlicesToReport.push({
              ...planningInfo,
              Estimation: sliceDuration,
              IssueEstimation: sliceDuration,
              SpentManual: sliceDuration,
              Time: spendParts[0].EndedAt + 1,
            })
          }
          // if there are more than one spend inside selected range
        } else {
          let sliceIndex = -1
          for (const spendPart of spendParts) {
            sliceIndex++
            // defining first manual slice
            if (sliceIndex === 0 && spendPart.StartedAt > startOfTimeSlice + 5) {
              // if spend time slice started later than the start of selected range --> manual slice created in between
              const sliceDuration = spendParts[0].StartedAt - 1 - startOfTimeSlice
              manualSlicesToReport.push({
                ...planningInfo,
                Estimation: sliceDuration,
                IssueEstimation: sliceDuration,
                SpentManual: sliceDuration,
                Time: startOfTimeSlice,
              })
            }

            // check if it is the last spend part
            if (_.isEqual(spendPart, _.last(spendParts))) {
              // if spend time ended earlier than the end of selected range --> manual slice created in between
              if (spendPart.EndedAt < endOfTimeSlice - 5) {
                const sliceDuration = endOfTimeSlice - spendPart.EndedAt + 1
                manualSlicesToReport.push({
                  ...planningInfo,
                  Estimation: sliceDuration,
                  IssueEstimation: sliceDuration,
                  SpentManual: sliceDuration,
                  Time: spendPart.EndedAt + 1,
                })
              }
            } else {
              const sliceDuration = spendParts[sliceIndex + 1].StartedAt - spendPart.EndedAt - 2
              if (sliceDuration < 5) {
                continue
              }
              manualSlicesToReport.push({
                ...planningInfo,
                Estimation: sliceDuration,
                IssueEstimation: sliceDuration,
                SpentManual: sliceDuration,
                Time: spendPart.EndedAt + 1,
              })
            }
          }
        }
      }

      if (!_.isEmpty(manualSlicesToReport)) {
        for (const manualSlice of manualSlicesToReport) {
          const PlanningID: number = yield call(api.planning.CreateManualPlanning, manualSlice)

          const Planning: ITimelinePlanning = {
            ...planningInfo,
            Active: false,
            ID: PlanningID,
            IsColdPlanning: false,
            IsManual: true,
            SpentManual: manualSlice.SpentManual,
            SpentOffline: 0,
            SpentOnline: 0,
            IssueSpent: SelectedIssue.Spent,
          }

          updatedTimeSheets.push({
            ...defaultTimeSheet,
            Planning,
            StartedAt: manualSlice.Time,
            EndedAt: manualSlice.Time + manualSlice.SpentManual,
            Spent: manualSlice.SpentManual,
          })

          const Report: IReportPayload = {
            ActivityID: null,
            Comments: Comment,
            Duration: manualSlice.SpentManual,
            IssueID: SelectedIssue.ID,
            Progress: 100,
            Started: manualSlice.Time,
          }

          yield call(api.tracker.CreateReport, { TrackerID, ProjectID, Report })
          yield delay(200)
        }
      }

      updatedTimeSheets = _.sortBy(updatedTimeSheets, ['StartedAt'])
      yield put(timelineActions.insertManualPeriod.request(updatedTimeSheets))

      yield put(alertActions.showAlertMessage.request({ alertMessage: 'Manual period reported', alertType: 'success' }))
    } catch (error) {
      console.error(error)
      yield put(alertActions.showAlertMessage.request({ alertMessage: error, alertType: 'error' }))
    }
  }
}

export function* setStatusSaga(): SagaIterator {
  while (true) {
    try {
      const { payload } = yield take(getType(actions.setStatus))
      yield call(api.tracker.SetStatus, payload)
    } catch (error) {
      console.error(error)
    }
  }
}

export function* setPrioritySaga(): SagaIterator {
  while (true) {
    try {
      const { payload } = yield take(getType(actions.setPriority))
      yield call(api.tracker.SetPriority, payload)
    } catch (error) {
      console.error(error)
    }
  }
}

export function* handleOTSStartStopTaskSaga(): SagaIterator {
  while (true) {
    yield take(getType(loginActions.loginUser.success))
    while (true) {
      let handler: VoidFunction
      const [signOut] = yield race([
        take(getType(loginActions.signOut)),
        call(
          () =>
            new Promise<void>(res => {
              handler = res
              Token.addListener('START/STOP_PLANNING', handler)
              if (Token.trackerID !== 1 && Token.projectID && Token.issueID) {
                handler()
              }
            }),
        ),
      ])

      if (handler) {
        Token.removeListener('START/STOP_PLANNING', handler)
      }
      if (signOut) {
        break
      }
      const TrackerID: number = Token.trackerID
      const ProjectID: string = Token.projectID
      const IssueID: string = Token.issueID
      Token.trackerID = -1
      Token.projectID = ''
      Token.issueID = ''
      try {
        if (TrackerID === 1 || !ProjectID || !IssueID) {
          continue
        }
        const openPlannings: IPlanning[] = yield select(getOpenPlanningsFromStore)
        const plannedTask = openPlannings.find(p => isSameTask(p, { TrackerID, ProjectID, IssueID }))
        if (plannedTask) {
          const activeTask = openPlannings.find(p => p.Active && isSameTask(p, { TrackerID, ProjectID, IssueID }))
          if (activeTask) {
            yield put(actions.stopPlanning.request())
          } else {
            yield put(actions.startPlanning.request({ PlanningID: plannedTask.ID }))
          }
        } else {
          const task: IProjectIssue = yield call(api.tracker.GetIssue, {
            TrackerID,
            ProjectID,
            IssueID,
          })
          const simplePlanning = {
            ProjectID,
            TrackerID,
            IssueID,
            IssueTitle: task.Title,
            IssueURL: task.URL,
            IssueEstimation: task.Estimate,
            IssueDueDate: task.DueDate,
            IssueSpent: task.Spent,
            IssueDone: task.Done,
            IssuePriorities: task.Priority,
            IssueStatuses: task.Status,
            IssueTypes: task.Type,
            ActivityID: task.Activity,
            Estimation: 24 * 3600, // in seconds
            Comment: '',
          }
          yield call(createPlanning, { isStarted: true, task: simplePlanning })
        }
      } catch (error) {
        console.error(error)
      }
    }
  }
}
