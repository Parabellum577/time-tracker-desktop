import { createAction } from 'typesafe-actions'
import { INotification } from '../notifications/types'

export const idleDetected = createAction('idle/IDLE_DETECTED', action => (idleTime: number) => action(idleTime))

export const activityDetected = createAction('idle/ACTIVITY_DETECTED', action => () => action())
