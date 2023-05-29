import { ActionType, getType } from 'typesafe-actions'

import * as actions from './actions'
import { ICurrentUserState } from './types'
import currentUser, { defaultSettings } from './reducer'

import { SIMPLE_USER } from '@test-helpers/sample'

describe('[Store] CurrentUser Reducer', () => {
  it('[Success] [Snapshot] Should handle getCurrentUser', () => {
    const action: ActionType<typeof actions> = {
      type: getType(actions.getCurrentUser.success),
      payload: { ...SIMPLE_USER },
    }

    const currentState: ICurrentUserState = {
      currentUser: { ...SIMPLE_USER },
      defaultUserSettings: defaultSettings,
    }

    expect(currentUser(currentState, action)).toMatchSnapshot()
  })

  it('[Failure] Should handle getCurrentUser', () => {
    const action: ActionType<typeof actions> = {
      type: getType(actions.getCurrentUser.failure),
      payload: {
        code: 666,
        message: 'SOME_ERROR',
      },
    }

    const currentState: ICurrentUserState = {
      currentUser: null,
      defaultUserSettings: defaultSettings,
    }

    expect(currentUser(currentState, action)).toMatchSnapshot()
  })

  it('[Success] [Snapshot] Should handle updateCurrentUser', () => {
    const action: ActionType<typeof actions> = {
      type: getType(actions.updateCurrentUser),
      payload: { ...SIMPLE_USER },
    }

    const currentState: ICurrentUserState = {
      currentUser: { ...SIMPLE_USER },
      defaultUserSettings: defaultSettings,
    }

    expect(currentUser(currentState, action)).toMatchSnapshot()
  })
})
