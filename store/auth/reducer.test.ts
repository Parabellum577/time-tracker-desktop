import { ActionType, getType } from 'typesafe-actions'

import * as actions from './actions'
import { IAuthState } from './types'
import auth from './reducer'

describe('[Store] Auth Reducer', () => {
  it('[Success] [Snapshot] Should handle loginUser', () => {
    const loginUserAction: ActionType<typeof actions> = {
      type: getType(actions.loginUser.success),
      payload: null,
    }

    const currentState: IAuthState = {
      authorized: true,
      error: null,
      loading: false,
      isLoadingData: false,
    }

    expect(auth(currentState, loginUserAction)).toMatchSnapshot()
  })

  it('[Failure] Should handle showAlertMessage', () => {
    const loginUserAction: ActionType<typeof actions> = {
      type: getType(actions.loginUser.failure),
      payload: {
        code: 666,
        message: 'SOME_ERROR',
      },
    }

    const currentState: IAuthState = {
      authorized: false,
      error: loginUserAction.payload,
      loading: false,
      isLoadingData: false,
    }

    expect(auth(currentState, loginUserAction)).toMatchSnapshot()
  })

  it('[Success] [Snapshot] Should handle signOut', () => {
    const signOutAction: ActionType<typeof actions> = {
      type: getType(actions.signOut),
    }

    const currentState: IAuthState = {
      authorized: false,
      error: null,
      loading: false,
      isLoadingData: false,
    }

    expect(auth(currentState, signOutAction)).toMatchSnapshot()
  })
})
