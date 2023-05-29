import { ActionType, getType } from 'typesafe-actions'

import * as actions from './actions'
import { IRecent } from './types'
import recent from './reducer'
import { SIMPLE_ISSUE } from '@test-helpers/sample'

describe('[Store] Recent Reducer', () => {
  it('[Success] [Snapshot] Should handle getRecent', () => {
    const action: ActionType<typeof actions> = {
      type: getType(actions.getRecent.success),
      payload: [{ ...SIMPLE_ISSUE }, { ...SIMPLE_ISSUE }],
    }

    const currentState: IRecent = {
      extendedRecent: [{ ...SIMPLE_ISSUE }, { ...SIMPLE_ISSUE }],
    }

    expect(recent(currentState, action)).toMatchSnapshot()
  })

  it('[Failure] Should handle getRecent', () => {
    const action: ActionType<typeof actions> = {
      type: getType(actions.getRecent.failure),
      payload: {
        code: 666,
        message: 'SOME_ERROR',
      },
    }

    const currentState: IRecent = {
      extendedRecent: [],
    }

    expect(recent(currentState, action)).toMatchSnapshot()
  })
})
