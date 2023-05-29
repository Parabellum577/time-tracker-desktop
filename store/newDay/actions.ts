import { createAction } from 'typesafe-actions'

export const newDayDetection = createAction('NEW_DAY_DETECTED', action => () => action())
