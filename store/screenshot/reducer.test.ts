import { ActionType, getType } from 'typesafe-actions'

import * as actions from './actions'
import { IScreenShotStorageState } from './types'
import screenshots from './reducer'
import { SIMPLE_SCREENSHOT_STORAGE } from '@test-helpers/sample'

describe('[Store] Screenshot Reducer', () => {
  it('[Success] [Snapshot] Should handle getScreenshotStorage', () => {
    const action: ActionType<typeof actions> = {
      type: getType(actions.getScreenshotStorage.success),
      payload: { ...SIMPLE_SCREENSHOT_STORAGE },
    }

    const currentState: IScreenShotStorageState = {
      availableStorage: { ...SIMPLE_SCREENSHOT_STORAGE },
      status: true,
    }

    expect(screenshots(currentState, action)).toMatchSnapshot()
  })

  it('[Failure] Should handle getScreenshotStorage', () => {
    const action: ActionType<typeof actions> = {
      type: getType(actions.getScreenshotStorage.failure),
      payload: {
        code: 666,
        message: 'SOME_ERROR',
      },
    }

    const currentState: IScreenShotStorageState = {
      availableStorage: null,
      status: true,
    }

    expect(screenshots(currentState, action)).toMatchSnapshot()
  })

  it('[Success] [Snapshot] Should handle addScreenshotStorage', () => {
    const action: ActionType<typeof actions> = {
      type: getType(actions.addScreenshotStorage.success),
      payload: { ...SIMPLE_SCREENSHOT_STORAGE },
    }

    const currentState: IScreenShotStorageState = {
      availableStorage: { ...SIMPLE_SCREENSHOT_STORAGE },
      status: true,
    }

    expect(screenshots(currentState, action)).toMatchSnapshot()
  })

  it('[Success] [Snapshot] Should handle deleteScreenshotStorages', () => {
    const action: ActionType<typeof actions> = {
      type: getType(actions.deleteScreenshotStorages),
    }

    const currentState: IScreenShotStorageState = {
      availableStorage: null,
      status: true,
    }

    expect(screenshots(currentState, action)).toMatchSnapshot()
  })
})
