import { ActionType, getType } from 'typesafe-actions'

import * as actions from './actions'
import trackers from './reducer'
import { ITrackers } from './types'

import { SIMPLE_TRACKER } from '../../test-helpers/sample'

describe('[Store] Trackers Reducer', () => {
  it('[Success] [Snapshot] Should handle GetUserTrackers', () => {
    const action: ActionType<typeof actions> = {
      type: getType(actions.getUserTrackers.success),
      payload: [{ ...SIMPLE_TRACKER }],
    }

    const currentState: ITrackers = {
      userTrackers: [{ ...SIMPLE_TRACKER }, { ...SIMPLE_TRACKER }],
    }

    expect(trackers(currentState, action)).toMatchSnapshot()
  })
})
