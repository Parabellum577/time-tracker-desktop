import { createAsyncAction, createAction } from 'typesafe-actions'
import { ITrackerWithStatus, IError, IUpdateTracker } from '@types'

export const getUserTrackers = createAsyncAction(
  'trackers/GET_USER_TRACKERS_REQUEST',
  'trackers/GET_USER_TRACKERS_SUCCESS',
  'trackers/GET_USER_TRACKERS_FAILURE',
)<void, ITrackerWithStatus[], IError>()

export const removeUserTracker = createAction('trackers/REMOVE_USER_TRACKER', action => (trackerID: number) =>
  action(trackerID),
)

export const addUserTracker = createAction('trackers/ADD_USER_TRACKER', action => (tracker: ITrackerWithStatus) =>
  action(tracker),
)

export const updateUserTracker = createAction('trackers/UPDATE_USER_TRACKER', action => (tracker: IUpdateTracker) =>
  action(tracker),
)

export const clearUserTrackers = createAction('trackers/CLEAR_USER_TRACKERS', action => () => action())
