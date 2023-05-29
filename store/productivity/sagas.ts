import { screen } from 'electron'

import { SagaIterator } from 'redux-saga'
import { select, call, fork, take, race, delay, cancel, cancelled, put } from 'redux-saga/effects'
import { getType, ActionType } from 'typesafe-actions'
import * as _ from 'lodash'

import * as planningActions from '@store/plannings/actions'
import * as loginActions from '../auth/actions'
import * as сurrentUserActions from '../currentUser/actions'
import * as projectActions from '../projects/actions'
import * as internetConnectionActions from '../internetConnection/actions'
import * as newDayActions from '../newDay/actions'
import * as actions from './actions'
import linuxUrlDetection from './linuxUrlDetection'
import darwinUrlDetection from './darwinUrlDetection'
import api from '@api'
import activityDetection from './activityDetection'
import {
  IPlanning,
  IProductivityItem,
  IProductivity,
  IChartData,
  IProject,
  IUser,
  IFocus,
  IFocusChart,
  IProductivitiesReduces,
} from '@types'
import { IRootState } from '@store/rootReducer'
import time from '@services/time'
import { getDistanceBetweenTwoPoints, parseDomain } from '@services/helpers'

let nativeProductivityModule = {
  activeWindowTitle: () => 'Untitled application',
}

let nativeUrlDetectionModule = () => {
  return Promise.resolve('')
}

let nativeActivityModule = {
  Track: () => {
    return {
      destroy: () => {
        console.log('Destroyed')
      },
    }
  },
  Keyboard: () => 0,
  Mouse: () => 0,
}

try {
  nativeProductivityModule = __non_webpack_require__('productivity_pulse')
} catch (err) {
  console.error(err)
}

try {
  if (process.platform === 'win32') {
    const urlDetection = __non_webpack_require__('tg-url-det')
    nativeUrlDetectionModule = () => {
      return new Promise(resolve => {
        urlDetection(resolve)
      }).then((data: string) => parseDomain(data))
    }
  }
} catch (err) {
  console.error(err)
}

try {
  switch (process.platform) {
    case 'linux':
      nativeActivityModule = activityDetection()
      break
    case 'win32':
    case 'darwin':
      nativeActivityModule = __non_webpack_require__('tg-act-det')
      break

    default:
      break
  }
} catch (err) {
  console.error(err)
}

export let collectedProductivity: IProductivityItem[] = []

export const getIsMasterFromStore = (state: IRootState) => state.synchronization.isMaster
export const getOpenPlanningsFromStore = (state: IRootState) => state.plannings.openPlannings
export const getColdPlanningsFromStore = (state: IRootState) => state.plannings.coldPlannings
export const getProjectFromStore = (state: IRootState) => state.projects.projects
export const getCurrentUserFromStore = (state: IRootState) => state.user.currentUser
const isOnlineFromStore = (state: IRootState) => state.internetConnection.isOnline

const parseWindowTitle = (rawTitle: string) => {
  return (
    rawTitle
      .trim()
      .replace(/\u0009|\u000A|\u000D|\u0020-|\u007E|\0/gi, '')
      .slice(0, 500) || 'Untitled application'
  )
}

export function* collectProductivityLoop(payload: { ID: number; ProjectID: string; TrackerID: number }): SagaIterator {
  let listener
  let lastDetectionTime = time.now()
  try {
    listener = nativeActivityModule.Track()
    let previousCursorPosition = screen.getCursorScreenPoint()
    while (true) {
      const Title = parseWindowTitle(nativeProductivityModule.activeWindowTitle())
      let URL: string

      switch (process.platform) {
        case 'linux':
          URL = yield call(linuxUrlDetection, Title)
          break
        case 'darwin':
          URL = yield call(darwinUrlDetection, Title)
          break
        case 'win32':
          URL = yield call(nativeUrlDetectionModule)
          break
        default:
          break
      }

      const cursorPosition = screen.getCursorScreenPoint()
      if (collectedProductivity.length && _.last(collectedProductivity).Title === Title) {
        _.last(collectedProductivity).Duration += time.now() - lastDetectionTime
        _.last(collectedProductivity).End += time.now() - lastDetectionTime
        _.last(collectedProductivity).MouseDistance += Math.min(
          getDistanceBetweenTwoPoints(cursorPosition, previousCursorPosition),
          10000,
        )
      } else {
        if (collectedProductivity.length) {
          const lastActivityItem = _.last(collectedProductivity)
          lastActivityItem.MouseClicks = nativeActivityModule.Mouse()
          lastActivityItem.KeyboardPressed += nativeActivityModule.Keyboard()
        }
        const startTime = _.last(collectedProductivity) ? _.last(collectedProductivity).End + 1 : time.now()
        collectedProductivity.push({
          Duration: 0,
          End: startTime + 1,
          KeyboardPressed: 0,
          MouseClicks: 0,
          MouseDistance: 0,
          PlanningID: payload.ID,
          ProjectID: payload.ProjectID,
          Start: startTime,
          Title,
          URL,
          TrackerID: payload.TrackerID,
        })
      }
      previousCursorPosition = cursorPosition
      lastDetectionTime = time.now()
      yield delay(5000)
    }
  } catch (e) {
    console.error(e)
  } finally {
    if (yield cancelled()) {
      if (!_.isEmpty(collectedProductivity)) {
        _.last(collectedProductivity).End += time.now() - lastDetectionTime
        _.last(collectedProductivity).Duration += time.now() - lastDetectionTime
      }
      yield* sendProductivity()
    }
    if (listener && listener.destroy) {
      listener.destroy()
    }
  }
}

export function* sendProductivityLoop() {
  try {
    yield delay(60 * 1000)
    yield sendProductivity()
    while (true) {
      yield delay(5 * 60 * 1000)
      yield sendProductivity()
    }
  } catch (e) {
    console.error(e)
  }
}

export function* sendProductivity() {
  const isOnline: boolean = yield select(isOnlineFromStore)

  if (!isOnline) {
    return
  }

  if (collectedProductivity.length) {
    try {
      yield call(api.productivity.AnalyzeActivity, {
        Applications: [],
        URLs: [],
        Titles: collectedProductivity.map(item => ({ ...item, Duration: item.End - item.Start })),
      })
      collectedProductivity = []
    } catch (error) {
      console.error(error)
    }
  }
}

interface IStartStopRace {
  startPlanningAction?: ActionType<typeof planningActions.startPlanning.success>
  stopPlanningAction?: ActionType<typeof planningActions.stopPlanning.success>
}

export function* collectProductivitySaga() {
  let collectProductivityTask
  let sendProductivityTask

  while (true) {
    const { startPlanningAction }: IStartStopRace = yield race({
      startPlanningAction: take(getType(planningActions.startPlanning.success)),
      stopPlanningAction: take(getType(planningActions.stopPlanning.success)),
    })

    if (collectProductivityTask) {
      yield cancel(collectProductivityTask)
    }

    if (sendProductivityTask) {
      yield cancel(sendProductivityTask)
    }

    const isMaster: IPlanning[] = yield select(getIsMasterFromStore)
    if (!isMaster) {
      continue
    }

    const openPlannings: IPlanning[] = yield select(getOpenPlanningsFromStore)
    const coldPlannings: IPlanning[] = yield select(getColdPlanningsFromStore)
    const activePlanning = openPlannings.concat(coldPlannings).find(p => p.Active)
    if (startPlanningAction && activePlanning) {
      const { ID, ProjectID, TrackerID } = activePlanning
      collectProductivityTask = yield fork(collectProductivityLoop, { ID, ProjectID, TrackerID })
      sendProductivityTask = yield fork(sendProductivityLoop)
    }
  }
}

export function* getProductivitySaga() {
  while (true) {
    const [internetConnectionStatus]: any = yield race([
      take(getType(internetConnectionActions.changeConnectionStatus)),
      take(getType(actions.getProductivities.request)),
      take(getType(loginActions.loginUser.success)),
      take(getType(newDayActions.newDayDetection)),
      delay(10 * 60 * 1000), // 10 minutes
    ])

    if (internetConnectionStatus && !internetConnectionStatus.payload.isOnline) {
      continue
    }
    const isOnline: boolean = yield select(isOnlineFromStore)

    if (!isOnline) {
      continue
    }

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

      const settingsPayload = {
        FilterProjects: baseProjects,
        FilterUsers: [currentUser.UserID],
        From: Math.max(time.now() - 3600 * 3, time.startOfDay()),
        To: time.now(),
      }

      const productivities: IProductivity[] = yield call(api.productivity.GetProductivities, settingsPayload)
      const chartData: IChartData[] = []
      const concatProductivity: IProductivity[] = []
      productivities.forEach(p => {
        if (p.Duration <= 60) {
          concatProductivity.push({ ...p })
        } else {
          for (let i = 0; i < p.Duration / 60; i++) {
            concatProductivity.push({ ...p, Duration: 60, CreatedAt: p.CreatedAt - 60 * i })
          }

          if (p.Duration % 60) {
            concatProductivity.push({
              ...p,
              Duration: p.Duration % 60,
              CreatedAt: p.CreatedAt - (p.Duration % 60),
            })
          }
        }
      })
      const sortedProductivities = _.sortBy(concatProductivity, ['CreatedAt'])
      const startCreatedAt = !_.isEmpty(sortedProductivities) ? _.first(sortedProductivities).CreatedAt : 0

      chartData.push({
        WORK: 0,
        COMMUNICATION: 0,
        LEARNING: 0,
        ENTERTAINMENT: 0,
        OTHER: 0,
      })

      for (let x = 0; x < 18; x++) {
        const currentItem: IChartData = {
          COMMUNICATION: 0,
          ENTERTAINMENT: 0,
          LEARNING: 0,
          OTHER: 0,
          WORK: 0,
        }
        sortedProductivities.forEach(p => {
          if (p.CreatedAt >= startCreatedAt + x * 600 && p.CreatedAt < startCreatedAt + x * 600 + 600) {
            currentItem[p.ActivityName] += p.Duration
          }
        })
        chartData.push(currentItem)
      }
      yield put(actions.getProductivities.success(chartData))
      let focuses: IFocus[] = []
      try {
        focuses = yield call(api.productivity.GetFocus, {
          FilterProjects: baseProjects,
          FilterUsers: [currentUser.UserID],
          From: Math.max(time.now() - 3600 * 3, time.startOfDay()),
          To: time.now(),
          Period: 'hourly',
        })
      } catch (error) {
        console.error(error)
      }

      const sortedFocuses = _.sortBy(
        focuses.filter(i => i.TotalTime),
        ['CreatedAt'],
      )

      let activityTime: IProductivitiesReduces[] = null
      let totalFocuseToday: IFocus[] = []
      try {
        activityTime = yield call(api.productivity.GetSwitches, {
          FilterProjects: baseProjects,
          FilterUsers: [currentUser.UserID],
          From: time.startOfDay(),
          To: time.now(),
        })
      } catch (error) {
        console.error(error)
      }

      try {
        totalFocuseToday = yield call(api.productivity.GetFocus, {
          FilterProjects: baseProjects,
          FilterUsers: [currentUser.UserID],
          From: time.startOfDay(),
          To: time.now(),
          Period: 'none',
        })
      } catch (error) {
        console.error(error)
      }

      const totalValue = totalFocuseToday[0] || {
        Focus: 0,
        Points: 0,
      }

      const averageData = {
        Focus: Math.round(totalValue.Focus),
        Points: totalValue.Points / 100,
        UsefullActivityPercent: -1,
        AverageWork: _.get(
          _.find(activityTime, total => total.Name === 'WORK'),
          'TimePercent',
          0,
        ),
        AverageCommunication: _.get(
          _.find(activityTime, total => total.Name === 'COMMUNICATION'),
          'TimePercent',
          0,
        ),
        AverageLearning: _.get(
          _.find(activityTime, total => total.Name === 'LEARNING'),
          'TimePercent',
          0,
        ),
        AverageEntertainment: _.get(
          _.find(activityTime, total => total.Name === 'ENTERTAINMENT'),
          'TimePercent',
          0,
        ),
        AverageOther: -1,
      }

      averageData.AverageOther =
        100 -
        averageData.AverageWork -
        averageData.AverageCommunication -
        averageData.AverageLearning -
        averageData.AverageEntertainment
      averageData.UsefullActivityPercent =
        averageData.AverageWork + averageData.AverageCommunication + averageData.AverageLearning
      const compressedFocuses: IFocusChart[] = [
        { y: 0, x: 0 },
        ...sortedFocuses.map(i => ({ y: i.Focus, x: i.CreatedAt - sortedFocuses[0].CreatedAt + 120 })),
        { y: averageData.Focus, x: 10920 },
      ]
      yield put(actions.setAverageData(averageData))
      yield put(actions.getFocuses.success(compressedFocuses))
    } catch (error) {
      console.error(error)
    }
  }
}
