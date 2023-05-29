import { take, resetMocks, call, put } from '@test-helpers/effects.mock'
import { SIMPLE_TRACKER } from '../../test-helpers/sample'
import { setResponse } from '@test-helpers/api.mock'

import { getUserTrackers, getUserTrackersSaga } from './sagas'
import * as actions from './actions'

describe('[Store] Trackers Sagas', () => {
  beforeEach(() => {
    resetMocks()
  })

  it('[Success] Should handle getUserTrackers Request', () => {
    const generator = getUserTrackersSaga()
    generator.next()
    expect(take).toBeCalledTimes(2)
    expect(take).toBeCalledWith(actions.getUserTrackers.request().type)
    generator.next()
    expect(call).toBeCalledTimes(1)
  })

  it('[Success] Should emit getUserTrackers', () => {
    const userTrackers = [
      {
        ...SIMPLE_TRACKER,
        ID: 1
      },
      {
        ...SIMPLE_TRACKER,
        ID: 2
      }
    ]
    const callback = jest.fn(() => userTrackers)
    setResponse('tracker', 'GetUserTrackers', callback)
    const generator = getUserTrackers()
    generator.next()
    expect(call).toBeCalledTimes(1)
    expect(call).toBeCalledWith(callback)
    generator.next()
    expect(put).toBeCalledTimes(1)
    expect(generator.next().done).toBe(true)
  })
})
