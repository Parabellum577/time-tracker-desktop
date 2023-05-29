import { ActionType } from 'typesafe-actions'

import { ITrackerWithStatus } from '@types'
import * as actions from './actions'

export type TrackersAction = ActionType<typeof actions>

export interface ITrackerToRender {
  Type: string
  TrackerUrl?: string
  Placeholder?: string
  IsUrlLocked?: boolean
  Name?: string
}

export interface ITrackers {
  userTrackers: ITrackerWithStatus[]
}
