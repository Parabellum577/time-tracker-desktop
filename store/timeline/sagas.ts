import { call, take, race, put, fork, select, delay } from 'redux-saga/effects'
import { getType, ActionType } from 'typesafe-actions'
import * as os from 'os'
import * as q from 'q'
import * as _ from 'lodash'

import * as actions from './actions'
import * as loginActions from '../auth/actions'
import * as сurrentUserActions from '../currentUser/actions'
import * as newDayActions from '../newDay/actions'
import * as planningActions from '../plannings/actions'
import * as internetConnectionActions from '../internetConnection/actions'
import * as projectActions from '../projects/actions'
import api from '@api'
import { IExtendedSpentTimeHistory, IUser, IProject, IPlanning, ITrackerWithStatus } from '@types'
import time from '@services/time'
import { IRootState } from '@store/rootReducer'
import { insertAtArrayByIndex } from '@services/helpers'
// import { getReportsPool } from '@store/plannings/timeTracker'

export const getCurrentUserFromStore = (state: IRootState) => state.user.currentUser
export const getTimesheetsFromStore = (state: IRootState) => state.timeline.timeline
export const getProjectFromStore = (state: IRootState) => state.projects.projects
export const getTrackersFromStore = (state: IRootState) => state.trackers.userTrackers

let recalculatingTimeline = q.defer()
recalculatingTimeline.resolve()

export function* getTimelineSaga() {
  while (true) {
    const [internetConnectionStatus]: any = yield race([
      take(getType(internetConnectionActions.changeConnectionStatus)),
      take(getType(actions.getTimeline.request)),
      take(getType(loginActions.loginUser.success)),
    ])
    console.log('START PREPARING TIMELINE')
    recalculatingTimeline = q.defer()
    if (internetConnectionStatus) {
      if (!internetConnectionStatus.payload.isOnline) {
        continue
      }
      // while (!_.isEmpty(getReportsPool())) {
      //   yield delay(300)
      // }
    }

    try {
      let currentUser: IUser = yield select(getCurrentUserFromStore)
      if (_.isEmpty(currentUser)) {
        yield take(getType(сurrentUserActions.getCurrentUser.success))
        currentUser = yield select(getCurrentUserFromStore)
      }
      let allProjects: IProject[] = yield select(getProjectFromStore)
      if (_.isEmpty(allProjects)) {
        yield put(projectActions.getProjects.request())
        yield take(projectActions.getProjects.success)
        allProjects = yield select(getProjectFromStore)
      }
      const filteredProjects = allProjects.filter(proj => proj.ProjectStatus !== 'ARCHIVED')

      const baseProjects = filteredProjects.reduce(
        (red, project) => {
          red.push({ TrackerID: project.TrackerID, ProjectID: project.ProjectID })
          return red
        },
        [{ TrackerID: 0, ProjectID: '0' }],
      )

      const payload = {
        FilterProjects: baseProjects,
        FilterUsers: [currentUser.UserID],
        DateFrom: time.startOfDay(),
        DateTo: time.now(),
      }

      const response = yield call(api.planning.GetTimesheets, payload)
      const Plannings: IPlanning[] = response.Plannings
      const SpentTime = _.sortBy<IExtendedSpentTimeHistory>(response.SpentTime, ['StartedAt']).filter(
        t => t.StartedAt !== t.EndedAt,
      )

      SpentTime.forEach(i => {
        i.Planning = Plannings.find(p => p.ID === i.PlanningID)
        i.IsEmpty = false
      })

      let timesheets: IExtendedSpentTimeHistory[] = []

      SpentTime.forEach((part, i) => {
        let endOfSlice
        if (i > 0) {
          if (SpentTime[i - 1].EndedAt === 0) {
            endOfSlice = SpentTime[i - 1].StartedAt + SpentTime[i - 1].Spent

            SpentTime[i - 1].EndedAt = endOfSlice
          } else {
            endOfSlice = SpentTime[i - 1].EndedAt + 1
          }
        } else {
          endOfSlice = time.startOfDay()
        }

        const emptyPart: IExtendedSpentTimeHistory = {
          IsEmpty: true,
          StartedAt: endOfSlice + 1,
          EndedAt: part.StartedAt - 1,
        }
        timesheets.push(emptyPart)
        timesheets.push(part)
      })

      if (!_.last(SpentTime) || _.last(SpentTime).EndedAt !== 0) {
        const emptySlice: IExtendedSpentTimeHistory = {
          IsEmpty: true,
          StartedAt: _.last(SpentTime) ? _.last(SpentTime).EndedAt + 1 : time.startOfDay(),
          EndedAt: time.now(),
        }
        timesheets.push(emptySlice)
      }
      const futureSlice: IExtendedSpentTimeHistory = {
        IsEmpty: false,
        IsFuture: true,
        StartedAt: time.now() + 1,
        EndedAt: time.endOfDay(),
      }
      timesheets.push(futureSlice)

      timesheets = timesheets.filter(i => i.EndedAt > i.StartedAt || i.EndedAt === 0)

      const allTrackers: ITrackerWithStatus[] = yield select(getTrackersFromStore)
      timesheets = timesheets.map(slice => {
        if (slice.Planning) {
          if (slice.Planning.IsColdPlanning) {
            return { ...slice, TrackerType: 'TGTRACKER', Planning: { ...slice.Planning, IssueTitle: 'Cold Planning' } }
          }
          const tracker = allTrackers.find(i => i.ID === slice.Planning.TrackerID)
          return { ...slice, TrackerType: tracker ? tracker.Type : '' }
        } else {
          return slice
        }
      })
      console.log('FINISHED PREPARING TIMELINE')
      const openPlannings: IPlanning[] = yield select(getOpenPlanningsFromStore)
      const coldPlannings: IPlanning[] = yield select(getColdPlanningsFromStore)
      const activePlanning = openPlannings.concat(coldPlannings).find(p => p.Active)
      const sliceBeforeFuture = _.nth(timesheets, -2)
      if (!!activePlanning === !!sliceBeforeFuture.IsEmpty) {
        yield fork(function*() {
          yield delay(1000)
          yield put(actions.getTimeline.request())
        })
      }
      yield put(actions.getTimeline.success(timesheets))
    } catch (error) {
      console.log('FAILURE PREPARING TIMELINE')
      yield put(actions.getTimeline.failure(error))
      console.error(error)
    } finally {
      recalculatingTimeline.resolve()
    }
  }
}

export function* removeTimelineSaga() {
  while (true) {
    yield race([take(getType(newDayActions.newDayDetection)), take(getType(loginActions.signOut))])

    const emptySlice: IExtendedSpentTimeHistory = {
      IsEmpty: true,
      StartedAt: time.startOfDay(),
      EndedAt: time.now(),
    }

    const futureSlice: IExtendedSpentTimeHistory = {
      IsEmpty: false,
      IsFuture: true,
      StartedAt: time.now() + 1,
      EndedAt: time.endOfDay(),
    }

    yield put(actions.getTimeline.success([emptySlice, futureSlice]))
  }
}

export function* updateTimelineSaga() {
  console.log('updateTimelineSaga PREPARING TIMELINE')
  const speed = os.cpus().reduce((red, core) => Math.min(red, core.speed), Infinity)
  const quantityCores = os.cpus().length
  const updateInterval = quantityCores < 4 || speed < 1800 ? 20000 : 5000
  while (true) {
    yield delay(updateInterval)
    yield put(actions.updateTimeline(time.now()))
  }
}

export const getOpenPlanningsFromStore = (state: IRootState) => state.plannings.openPlannings
export const getColdPlanningsFromStore = (state: IRootState) => state.plannings.coldPlannings
export const isOnlineFromStore = (state: IRootState) => state.internetConnection.isOnline

interface IStartStopRace {
  startPlanningAction?: ActionType<typeof planningActions.startPlanning.success>
  stopPlanningAction?: ActionType<typeof planningActions.stopPlanning.success>
}

export function* handleNewTimelineSlicesSaga() {
  while (true) {
    const { startPlanningAction }: IStartStopRace = yield race({
      startPlanningAction: take(getType(planningActions.startPlanning.success)),
      stopPlanningAction: take(getType(planningActions.stopPlanning.success)),
    })
    yield call(() => recalculatingTimeline)
    if (startPlanningAction) {
      const openPlannings: IPlanning[] = yield select(getOpenPlanningsFromStore)
      const coldPlannings: IPlanning[] = yield select(getColdPlanningsFromStore)
      const isOnline: boolean = yield select(isOnlineFromStore)
      const activePlanning = openPlannings.concat(coldPlannings).find(p => p.Active)
      const timesheets: IExtendedSpentTimeHistory[] = yield select(getTimesheetsFromStore)
      if (timesheets.length) {
        const now = time.now()
        const futureSlice = _.nth(timesheets, -1)
        const sliceBeforeFuture = _.nth(timesheets, -2)
        sliceBeforeFuture.EndedAt = now - 1
        futureSlice.StartedAt = now + 1
        const emptySlice: IExtendedSpentTimeHistory = {
          IsEmpty: false,
          StartedAt: now,
          EndedAt: now,
          Spent: 0,
          Status: isOnline ? 'ONLINE' : 'OFFLINE',
          Planning: activePlanning,
          PlanningID: activePlanning.ID,
          IssueTitle: activePlanning.IssueID,
          ProjectID: activePlanning.ProjectID,
          TrackerID: activePlanning.TrackerID,
        }
        const allTrackers: ITrackerWithStatus[] = yield select(getTrackersFromStore)
        let newTimesheets = insertAtArrayByIndex(timesheets.length - 1, emptySlice, timesheets)
        newTimesheets = newTimesheets.map(slice => {
          if (slice.Planning) {
            if (slice.Planning.IsColdPlanning) {
              return {
                ...slice,
                TrackerType: 'TGTRACKER',
                Planning: { ...slice.Planning, IssueTitle: 'Cold Planning' },
              }
            }
            const tracker = allTrackers.find(i => i.ID === slice.Planning.TrackerID)
            return { ...slice, TrackerType: tracker ? tracker.Type : '' }
          } else {
            return slice
          }
        })
        yield put(actions.getTimeline.success(newTimesheets))
      }
    } else {
      const timesheets: IExtendedSpentTimeHistory[] = yield select(getTimesheetsFromStore)
      if (timesheets.length) {
        const now = time.now()
        const futureSlice = _.nth(timesheets, -1)
        const sliceBeforeFuture = _.nth(timesheets, -2)
        sliceBeforeFuture.EndedAt = now - 1
        futureSlice.StartedAt = now + 1
        const emptySlice: IExtendedSpentTimeHistory = {
          IsEmpty: true,
          StartedAt: now,
          EndedAt: now,
          Spent: 0,
        }
        const newTimesheets = insertAtArrayByIndex(timesheets.length - 1, emptySlice, timesheets)
        yield put(actions.getTimeline.success(newTimesheets))
      }
    }
  }
}

export function* handleOfflineSlicesSaga() {
  while (true) {
    const {
      payload: { isOnline },
    } = yield take(internetConnectionActions.changeConnectionStatus)
    const timesheets: IExtendedSpentTimeHistory[] = yield select(getTimesheetsFromStore)
    const lastValuableSlice = timesheets[timesheets.length - 2]
    if (!lastValuableSlice || lastValuableSlice.IsEmpty) {
      continue
    }
    if (lastValuableSlice.Status === 'ONLINE' && isOnline) {
      continue
    }
    if (lastValuableSlice.Status === 'OFFLINE' && !isOnline) {
      continue
    }

    lastValuableSlice.EndedAt = time.now() - 1
    const newSlice = _.cloneDeep(lastValuableSlice)
    newSlice.Status = isOnline ? 'ONLINE' : 'OFFLINE'
    newSlice.StartedAt = time.now()
    newSlice.EndedAt = time.now()
    const futureSlice = timesheets.pop()
    futureSlice.StartedAt = time.now() + 1
    timesheets.push(newSlice)
    timesheets.push(futureSlice)
    yield put(actions.getTimeline.success(timesheets))
  }
}

export function* insertNewSlicesSaga() {
  while (true) {
    const response = yield take(getType(actions.insertManualPeriod.request))
    let updatedTimeSheets: IExtendedSpentTimeHistory[] = []
    const newTimeSheets: IExtendedSpentTimeHistory[] = response.payload
    const oldTimeSheets: IExtendedSpentTimeHistory[] = yield select(getTimesheetsFromStore)
    for (const oldTimeSheet of oldTimeSheets) {
      const newTimePart = newTimeSheets.find(
        newTime => oldTimeSheet.StartedAt <= newTime.StartedAt + 1 && oldTimeSheet.EndedAt + 2 >= newTime.EndedAt,
      )

      if (_.isEmpty(newTimePart) || oldTimeSheet.IsFuture) {
        updatedTimeSheets.push(oldTimeSheet)
        continue
      }

      if (oldTimeSheet.Planning) {
        if (oldTimeSheet.Planning.IsColdPlanning) {
          const firstDuration = newTimePart.StartedAt - oldTimeSheet.StartedAt
          const lastDuration = oldTimeSheet.EndedAt - newTimePart.EndedAt
          if (firstDuration > 5) {
            updatedTimeSheets.push({ ...oldTimeSheet, EndedAt: newTimePart.StartedAt - 1 })
          }

          updatedTimeSheets.push({ ...newTimePart, Planning: { ...newTimePart.Planning, IsColdPlanning: false } })

          if (lastDuration > 5) {
            updatedTimeSheets.push({ ...oldTimeSheet, StartedAt: newTimePart.EndedAt + 1 })
          }
        } else {
          updatedTimeSheets.push(oldTimeSheet)
        }
      } else {
        const firstDuration = newTimePart.StartedAt - oldTimeSheet.StartedAt
        const lastDuration = oldTimeSheet.EndedAt - newTimePart.EndedAt

        if (firstDuration > 5) {
          updatedTimeSheets.push({ ...oldTimeSheet, EndedAt: newTimePart.StartedAt - 1 })
        }

        updatedTimeSheets.push(newTimePart)

        if (lastDuration > 5) {
          updatedTimeSheets.push({ ...oldTimeSheet, StartedAt: newTimePart.EndedAt + 1 })
        }
      }
    }

    const allTrackers: ITrackerWithStatus[] = yield select(getTrackersFromStore)
    updatedTimeSheets = updatedTimeSheets.map(slice => {
      if (slice.Planning) {
        if (slice.Planning.IsColdPlanning) {
          return { ...slice, TrackerType: 'TGTRACKER', Planning: { ...slice.Planning, IssueTitle: 'Cold Planning' } }
        }
        const tracker = allTrackers.find(i => i.ID === slice.Planning.TrackerID)
        return { ...slice, TrackerType: tracker ? tracker.Type : '' }
      } else {
        return slice
      }
    })

    yield put(actions.getTimeline.success(updatedTimeSheets))
  }
}
