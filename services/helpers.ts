import * as _ from 'lodash'
import { select } from 'redux-saga/effects'

import { IRootState } from '@store/rootReducer'
import { ITrackerToRender } from '@store/trackers/types'
import { IPlanning, ITrackerWithStatus } from '@types'
import { IColdSlice } from '@api-types'
import { trackers } from './login-via-window'
import history from '@store/history'
import { openExternal } from './openWindow'
import api from './api'
import time from './time'

const getOpenPlanningsFromStore = (state: IRootState) => state.plannings.openPlannings
const getColdPlanningsFromStore = (state: IRootState) => state.plannings.coldPlannings
export const getIsMaster = (state: IRootState) => state.synchronization.isMaster

export function* getActivePlanning() {
  const openPlannings: IPlanning[] = yield select(getOpenPlanningsFromStore)
  const coldPlannings: IPlanning[] = yield select(getColdPlanningsFromStore)
  const activePlanning = openPlannings.concat(coldPlannings).find(p => p.Active)

  return activePlanning
}

const getSyncStateFromStore = (state: IRootState) => state.synchronization.isMaster

export function* getSyncState() {
  const isMaster: boolean = yield select(getSyncStateFromStore)

  return isMaster
}

export const ALL_SUPPORTED_TRACKERS: ITrackerToRender[] = [
  {
    Type: 'TRELLO',
    Name: 'Trello',
    TrackerUrl: 'https://trello.com',
    IsUrlLocked: true,
  },
  {
    Type: 'ASANA',
    Name: 'Asana',
    TrackerUrl: 'https://app.asana.com',
    IsUrlLocked: true,
  },
  {
    Type: 'JIRA',
    Name: 'Jira',
    Placeholder: 'https://example.atlassian.net',
    IsUrlLocked: false,
  },
  {
    Type: 'GITHUB',
    Name: 'Github',
    TrackerUrl: 'https://github.com',
    IsUrlLocked: true,
  },
  {
    Type: 'GITLAB',
    Name: 'Gitlab',
    TrackerUrl: 'https://gitlab.com',
    IsUrlLocked: false,
  },
  {
    Type: 'BITBUCKET',
    Name: 'Bitbucket',
    TrackerUrl: 'https://bitbucket.org',
    IsUrlLocked: true,
  },
  {
    Type: 'VSTS',
    Name: 'VSTS',
    Placeholder: 'https://dev.azure.com/example',
    IsUrlLocked: false,
  },
  {
    Type: 'TODOIST',
    Name: 'Todoist',
    TrackerUrl: 'https://todoist.com',
    IsUrlLocked: true,
  },
  {
    Type: 'CLICKUP',
    Name: 'ClickUP',
    TrackerUrl: 'https://app.clickup.com',
    IsUrlLocked: true,
  },
  {
    Type: 'WUNDERLIST',
    Name: 'Wunderlist',
    TrackerUrl: 'https://www.wunderlist.com',
    IsUrlLocked: true,
  },
  {
    Type: 'WRIKE',
    Name: 'Wrike',
    TrackerUrl: 'https://www.wrike.com',
    IsUrlLocked: true,
  },
  {
    Type: 'TEAMWORK',
    Name: 'Teamwork',
    Placeholder: 'https://example.teamwork.com',
    IsUrlLocked: false,
  },
  {
    Type: 'PODIO',
    Name: 'Podio',
    TrackerUrl: 'https://podio.com',
    IsUrlLocked: true,
  },
  {
    Type: 'ODOO',
    Name: 'Odoo',
    Placeholder: 'https://example.odoo.com',
    IsUrlLocked: false,
  },
  {
    Type: 'RALLY',
    Name: 'Rally',
    TrackerUrl: 'https://rally1.rallydev.com',
    IsUrlLocked: true,
  },
  {
    Type: 'PIVOTAL',
    Name: 'Pivotal',
    TrackerUrl: 'https://www.pivotaltracker.com',
    IsUrlLocked: true,
  },
  {
    Type: 'INSIGHTLY',
    Name: 'Insightly',
    TrackerUrl: 'https://www.insightly.com',
    IsUrlLocked: true,
  },
  {
    Type: 'MSTODO',
    Name: 'MS To-Do',
    TrackerUrl: 'https://todo.microsoft.com',
    IsUrlLocked: true,
  },
  {
    Type: 'REDBOOTH',
    Name: 'Redbooth',
    TrackerUrl: 'https://redbooth.com',
    IsUrlLocked: true,
  },
  {
    Type: 'REDMINE',
    Name: 'Redmine',
    Placeholder: 'https://redmine.example.org',
    IsUrlLocked: false,
  },
  {
    Type: 'ZOHO',
    Name: 'Zoho',
    TrackerUrl: 'https://projects.zoho.com',
    IsUrlLocked: false,
  },
  {
    Type: 'COLLAB',
    Name: 'ActiveCollab',
    TrackerUrl: 'https://app.activecollab.com',
    IsUrlLocked: false,
  },
  {
    Type: 'LIQUIDPLANNER',
    Name: 'LiquidPlanner',
    TrackerUrl: 'https://app.liquidplanner.com',
    IsUrlLocked: true,
  },
  {
    Type: 'BREEZE',
    Name: 'Breeze',
    TrackerUrl: 'https://api.breeze.pm',
    IsUrlLocked: true,
  },
  {
    Type: 'YOUTRACK',
    Name: 'YouTrack',
    TrackerUrl: 'https://www.jetbrains.com/youtrack/',
    IsUrlLocked: false,
  },
  {
    Type: 'OUTLOOK',
    Name: 'Outlook',
    TrackerUrl: 'https://outlook.live.com',
    IsUrlLocked: true,
  },
  {
    Type: 'GCALENDAR',
    Name: 'Google Calendar',
    TrackerUrl: 'https://calendar.google.com',
    IsUrlLocked: true,
  },
  {
    Type: 'MANTIS',
    Name: 'Mantis',
    Placeholder: 'https://example.mantishub.io',
    IsUrlLocked: false,
  },
]

export const LOGIN_TRACKERS: Array<keyof typeof trackers> = ['TRELLO', 'GITHUB', 'GITLAB']

export const TRACKERS_WITH_DISABLE_TASK_DETAILS = ['TGTRACKER', 'CLICKUP', 'JIRA']

export function isTrackerWithDisableDetails(trackerType: string) {
  return TRACKERS_WITH_DISABLE_TASK_DETAILS.includes(trackerType)
}

export const STORAGES = [
  {
    name: 'Google Drive',
    img: 'googledrive',
    type: 'GOOGLE_DRIVE',
    url: 'https://drive.google.com/drive/my-drive',
  },
  {
    name: 'Dropbox',
    img: 'dropbox',
    type: 'DROPBOX',
    url: 'https://www.dropbox.com/home',
  },
]

export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min
}

export function parseDomain(href: string) {
  if (href && !href.startsWith('https://') && !href.startsWith('http://')) {
    href = `https://${href}`
  }

  return href ? href.replace(/\/?\?.*/, '') : ''
}

export function getDistanceBetweenTwoPoints(first: Electron.Point, second: Electron.Point) {
  return Math.round(Math.sqrt(Math.pow(first.x - second.x, 2) + Math.pow(first.y - second.y, 2)))
}

export function getFullSpentTime(planning?: IPlanning): number {
  if (!planning) {
    return 0
  } else {
    const total: number = planning.SpentOnline + planning.SpentOffline + planning.SpentManual
    return Math.round(total)
  }
}

export function isOutdated(planning?: IPlanning): boolean {
  return planning.Outdated || planning.CreatedAt < time.startOfDay() - 10
}

export function getUnreportedPlannings(plannings: IPlanning[]) {
  return plannings.reduce((red, planning) => (planning.Outdated ? red + 1 : red), 0)
}

export function totalColdTime(plannings: IPlanning[]) {
  return plannings.reduce((acc, p) => {
    return acc + getFullSpentTime(p)
  }, 0)
}

export const insertAtArrayByIndex = <T>(index: number, val: T, arr: T[]) => {
  const result = _.clone(arr)
  result.splice(index, 0, val)
  return result
}

export const groupByDay = (part: IColdSlice) => {
  const parsedDate = new Date(part.Start * 1000)
  const month = parsedDate.getMonth() > 9 ? parsedDate.getMonth : `0${parsedDate.getMonth()}`
  const date = parsedDate.getDate() > 9 ? parsedDate.getDate() : `0${parsedDate.getDate()}`
  return `${parsedDate.getFullYear()}.${month}.${date}`
}

interface ISimpleTask {
  TrackerID: number
  ProjectID: string
  IssueID: string
}

export const getTrackerOfSeparator = () => {
  for (let i = history.entries.length - 1; i >= 0; i--) {
    const match = history.entries[i].pathname.match(/\:/)
    if (match && match.index) {
      return history.entries[i].pathname.slice(match.index + 1)
    }
  }
  return ''
}

export const isSameTask = (a: ISimpleTask, b: ISimpleTask) =>
  a.TrackerID === b.TrackerID && a.ProjectID === b.ProjectID && a.IssueID === b.IssueID

export interface ISimpleTaskWithURL {
  URL: string
  TrackerID: number
  ProjectID: string
  ID: string
}

export const openUrlByTask = async (
  planning: IPlanning,
  issue: ISimpleTaskWithURL,
  userTrackers: ITrackerWithStatus[],
) => {
  const task = planning
    ? {
        TrackerID: planning.TrackerID,
        ProjectID: planning.ProjectID,
        IssueID: planning.IssueID,
        URL: planning.IssueURL,
        isDFTask: userTrackers.some(tracker => planning.TrackerID === tracker.ID && tracker.Type === 'TGTRACKER'),
      }
    : {
        TrackerID: issue.TrackerID,
        ProjectID: issue.ProjectID,
        IssueID: issue.ID,
        URL: issue.URL,
        isDFTask: userTrackers.some(tracker => issue.TrackerID === tracker.ID && tracker.Type === 'TGTRACKER'),
      }
  const { TrackerID, ProjectID, IssueID } = task
  if (task.isDFTask) {
    const ots = await api.user.GetOTS()
    const href = `${process.env.REDIRECT_URL}/desktop/login?otscode=${ots}&action=Tasks&TrackerID=${TrackerID}&ProjectID=${ProjectID}&IssueID=${IssueID}`
    openExternal(href)
  } else if (task.URL) {
    openExternal(task.URL)
  }
}
