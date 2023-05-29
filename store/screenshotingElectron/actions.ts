import { createAction } from 'typesafe-actions'

export const addScreenshot = createAction(
  'screenshot/ADD_SCREENSHOT',
  resolve => (payload: { currentTime: string }) => resolve(payload),
)

export const deleteScreenshot = createAction('screenshot/DELETE_SCREENSHOT', resolve => () =>
  resolve(),
)
