import { createAction } from 'typesafe-actions'

export const updateApplication = createAction('updater/UPDATE_APPLICATION', action => () => action())

export const updateAvailable = createAction('updater/UPDATE_AVAILABLE', action => action)
