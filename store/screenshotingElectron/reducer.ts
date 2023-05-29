import { getType, ActionType } from 'typesafe-actions'

import * as actions from './actions'
import { IScreenshotingState } from './types'

const initialState: IScreenshotingState = {
  screenshots: [],
}

export default (
  state: IScreenshotingState = initialState,
  action: ActionType<typeof actions>,
): IScreenshotingState => {
  switch (action.type) {
    case getType(actions.addScreenshot):
      console.log(action)
      return { screenshots: [...state.screenshots, action.payload.currentTime] }
    case getType(actions.deleteScreenshot):
      return { screenshots: state.screenshots.slice(0) }
    default:
      return state
  }
}
