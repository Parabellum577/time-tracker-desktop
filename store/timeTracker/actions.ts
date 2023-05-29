import { createAction } from 'typesafe-actions'

export const startPlanningLocal = createAction(
  'timeTracker/START_PLANNING',
  action => (PlanningID: number, Time: unixSeconds) => action({ PlanningID, Time }),
)

export const startPlanningRemote = createAction(
  'timeTracker/START_PLANNING_REMOTE',
  action => (PlanningID: number, Time: unixSeconds) => action({ PlanningID, Time }),
)

export const stopPlanningLocal = createAction('timeTracker/STOP_PLANNING', action => (Time: unixSeconds) =>
  action({ Time }),
)

export const stopPlanningRemote = createAction('timeTracker/STOP_PLANNING_REMOTE', action => (Time: unixSeconds) =>
  action({ Time }),
)

export const setEndTimeLocal = createAction('timeTracker/SET_END_TIME_PLANNING', action => (Time: unixSeconds) =>
  action({ Time }),
)

export const setEndTimeRemote = createAction('timeTracker/SET_END_TIME_REMOTE', action => (Time: unixSeconds) =>
  action({ Time }),
)

export const markBrokenSlice = createAction('timeTracker/MARK_BROKEN_SLICE', action => (StartedAt: unixSeconds) =>
  action({ StartedAt }),
)

export const forceSyncSpentSlices = createAction('timeTracker/FORCE_SYNC_SPENT_SLICES', action => () => action())

export const removeSyncedSpentSlices = createAction('timeTracker/REMOVE_SYNCED_SPENT_SLICES', action => () => action())

export const removeAllSpentSlices = createAction('timeTracker/REMOVE_ALL_SPENT_SLICES', action => () => action())
