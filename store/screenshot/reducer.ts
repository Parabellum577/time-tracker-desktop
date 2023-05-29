import { getType, ActionType } from 'typesafe-actions'
import * as _ from 'lodash'

import * as actions from './actions'
import { IScreenShotStorageState } from './types'

const initialState: IScreenShotStorageState = {
  availableStorage: null,
  status: false,
}

export default (state: IScreenShotStorageState = initialState, action: ActionType<typeof actions>) => {
  switch (action.type) {
    case getType(actions.getScreenshotStorage.success):
      return { ...state, availableStorage: action.payload }
    case getType(actions.getScreenshotStorage.failure):
      const { message } = action.payload
      if (message === 'NO_STORAGE_CONNECTED') {
        return { ...state, availableStorage: null }
      } else {
        return { ...state }
      }
    case getType(actions.addScreenshotStorage.success):
      return { ...state, availableStorages: action.payload }
    case getType(actions.deleteScreenshotStorages):
      return { availableStorage: null, status: false }
    case getType(actions.handleScreenshotStatus.success):
      if (_.isEmpty(state.availableStorage)) {
        return { ...state, status: false }
      }

      if (_.isNull(action.payload.newScreenshotStatus)) {
        return { ...state, status: !state.status }
      } else {
        return { ...state, status: action.payload.newScreenshotStatus }
      }
    case getType(actions.handleScreenshotStatus.failure):
      return { ...state }
    default:
      return state
  }
}
