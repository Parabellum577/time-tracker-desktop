import { ActionType, getType } from 'typesafe-actions'

import * as actions from './actions'
import { IAlertsState } from './types'
import alerts from './reducer'

import { SIMPLE_ALERT } from '@test-helpers/sample'

describe('[Store] Alerts Reducer', () => {
  it('[Success] [Snapshot] Should handle showAlertMessage', () => {
    const showAlertAction: ActionType<typeof actions> = {
      type: getType(actions.showAlertMessage.success),
      payload: { ...SIMPLE_ALERT },
    }

    const currentState: IAlertsState = {
      alertsArray: [{ ...SIMPLE_ALERT }],
    }

    expect(alerts(currentState, showAlertAction)).toMatchSnapshot()
  })

  it('[Failure] Should handle showAlertMessage', () => {
    const action: ActionType<typeof actions> = {
      type: getType(actions.showAlertMessage.failure),
      payload: {
        code: 666,
        message: 'SOME_ERROR',
      },
    }

    const currentState: IAlertsState = {
      alertsArray: [],
    }

    expect(alerts(currentState, action)).toMatchSnapshot()
  })

  it('[Success] [Snapshot] Should handle clearAlertMessage', () => {
    const clearAlertAction: ActionType<typeof actions> = {
      type: getType(actions.clearAlertMessage.success),
      payload: null,
    }

    const currentState: IAlertsState = {
      alertsArray: [],
    }

    expect(alerts(currentState, clearAlertAction)).toMatchSnapshot()
  })

  it('[Failure] Should handle clearAlertMessage', () => {
    const clearAlertAction: ActionType<typeof actions> = {
      type: getType(actions.clearAlertMessage.failure),
      payload: {
        code: 666,
        message: 'SOME_ERROR',
      },
    }

    const currentState: IAlertsState = {
      alertsArray: [{ ...SIMPLE_ALERT }],
    }

    expect(alerts(currentState, clearAlertAction)).toMatchSnapshot()
  })
})
