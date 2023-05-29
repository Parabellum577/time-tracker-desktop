import { createAction } from 'typesafe-actions'

export const changeConnectionStatus = createAction(
  'internet_connection/CONNECTION_STATUS_CHANGED',
  action => (isOnline: boolean) => action({ isOnline }),
)
