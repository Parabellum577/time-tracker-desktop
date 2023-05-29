import { take, select, resetMocks, fork, cancel, call, put, delay, cancelled } from '@test-helpers/effects.mock'
import { SIMPLE_PLANNING } from '@test-helpers/sample'
import { setResponse } from '@test-helpers/api.mock'
import time from '@test-helpers/time.mock'

import {
  getOpenPlanningsSaga,
  getOpenPlannings,
  startStopPlanningSaga,
  timeTickInActivePlanningLoop,
  createPlanning,
} from './sagas'
import * as actions from './actions'

describe('[Store] Plannings Sagas', () => {
  beforeEach(() => {
    resetMocks()
  })

  xit('[Success] Should handle GetOpenPlannings Request', () => {
    const generator = getOpenPlanningsSaga()
    generator.next()
    expect(call).toBeCalledTimes(1)
    expect(fork).toBeCalledTimes(1)
    generator.next()
    expect(take).toBeCalledTimes(4)
    generator.next()
    expect(generator.next().done).toBe(true)
  })

  it('[Success] Should emit GetOpenPlannings', () => {
    const openPlannings = [
      {
        ...SIMPLE_PLANNING,
        ID: 1,
      },
      {
        ...SIMPLE_PLANNING,
        ID: 2,
      },
    ]
    const callback = jest.fn(() => openPlannings)
    setResponse('planning', 'GetOpenPlannings', callback)
    const generator = getOpenPlannings()
    generator.next()
    expect(call).toBeCalledTimes(1)
    expect(call).toBeCalledWith(callback)
    generator.next(openPlannings as any)
    expect(put).toBeCalledTimes(1)
    expect(generator.next().done).toBe(true)
  })

  it('[Failed] Should emit GetOpenPlannings', () => {
    call.mockImplementation(() => {
      throw {
        code: 100,
        message: 'SOME_ERROR',
      }
    })
    put.mockImplementation(action => action)
    const generator = getOpenPlannings()
    expect(generator.next()).toMatchSnapshot()
    expect(generator.next().done).toBe(true)
  })

  xit('[Success] Should handle Start/Stop Planning Request', () => {
    // start planning
    let syncSpentTimeWithBackEndTask = jest.fn()
    let timeTrackingTask = jest.fn()
    let openPlannings = [
      {
        ...SIMPLE_PLANNING,
        ID: 1,
      },
      {
        ...SIMPLE_PLANNING,
        ID: 2,
      },
    ]
    const generator = startStopPlanningSaga()
    generator.next()
    expect(take).toBeCalledTimes(2)
    generator.next({
      startPlanningAction: {
        payload: 2,
      },
    })
    generator.next(openPlannings)
    generator.next([])
    expect(select).toBeCalledTimes(2)
    expect(call).toBeCalledTimes(1)
    generator.next()
    expect(fork).toBeCalledTimes(1)
    generator.next(syncSpentTimeWithBackEndTask)
    expect(fork).toBeCalledTimes(2)
    // stop planning
    generator.next(timeTrackingTask)
    generator.next({ startPlanningAction: false })
    openPlannings = [
      {
        ...SIMPLE_PLANNING,
        ID: 1,
      },
      {
        ...SIMPLE_PLANNING,
        Active: true,
        ID: 2,
      },
    ]
    generator.next(openPlannings)
    generator.next([])
    expect(take).toBeCalledTimes(4)
    expect(cancel).toBeCalledTimes(1)
    generator.next()
    expect(cancel).toBeCalledTimes(2)
    generator.next()
    expect(call).toBeCalledTimes(2)
    // start planning
    syncSpentTimeWithBackEndTask = jest.fn()
    timeTrackingTask = jest.fn()
    openPlannings = [
      {
        ...SIMPLE_PLANNING,
        ID: 1,
      },
      {
        ...SIMPLE_PLANNING,
        ID: 2,
      },
    ]
    generator.next()
    generator.next({
      startPlanningAction: {
        payload: 2,
      },
    })
    generator.next(openPlannings)
    generator.next([])
    generator.next([])
    generator.next()
    generator.next()
    generator.next(syncSpentTimeWithBackEndTask)
    generator.next(timeTrackingTask)
    // start planning when hasActivePlanning
    syncSpentTimeWithBackEndTask = jest.fn()
    timeTrackingTask = jest.fn()

    openPlannings = [
      {
        ...SIMPLE_PLANNING,
        ID: 1,
      },
      {
        ...SIMPLE_PLANNING,
        Active: true,
        ID: 2,
      },
    ]
    generator.next({
      startPlanningAction: {
        payload: 1,
      },
    })
    generator.next(openPlannings)
    generator.next([])
    expect(cancel).toBeCalledTimes(5)
    generator.next()
    expect(cancel).toBeCalledTimes(6)
    expect(call).toBeCalledTimes(3)
    generator.next()
    expect(call).toBeCalledTimes(4)
    generator.next()
    expect(call).toBeCalledTimes(5)
    generator.next()
    expect(fork).toBeCalledTimes(5)
    generator.next(syncSpentTimeWithBackEndTask)
    expect(fork).toBeCalledTimes(6)
  })

  // it('[Success] Should emit Start Planning', () => {
  //   const callback = jest.fn()
  //   time.now.mockReturnValue(1550135924)
  //   setResponse('planning', 'SetActive', callback)
  //   const generator = startPlanning(2)
  //   generator.next()
  //   expect(call).toBeCalledTimes(1)
  //   expect(call).toBeCalledWith(callback, { PlanningID: 2, Time: time.now() })
  //   generator.next()
  //   expect(put).toBeCalledTimes(1)
  //   expect(generator.next().done).toBe(true)
  // })

  // it('[Failed] Should emit Start Planning', () => {
  //   call.mockImplementation(() => {
  //     throw {
  //       code: 100,
  //       message: 'SOME_ERROR',
  //     }
  //   })
  //   time.now.mockReturnValueOnce(1550135924)
  //   const generator = startPlanning(1)
  //   generator.next()
  //   generator.next()
  //   expect(put).toBeCalledTimes(1)
  //   expect(generator.next().done).toBe(true)
  // })

  // it('[Success] Should emit Stop Planning', () => {
  //   const callback = jest.fn()
  //   setResponse('planning', 'SetActive', callback)
  //   time.now.mockReturnValue(1550135924)
  //   const generator = stopPlanning(1)
  //   generator.next()
  //   expect(call).toBeCalledTimes(1)
  //   expect(call).toBeCalledWith(callback, { PlanningID: 0, Time: time.now() })
  //   generator.next()
  //   expect(put).toBeCalledTimes(1)
  //   expect(generator.next().done).toBe(true)
  // })

  xit('[Success] Should handle createPlanning', () => {
    const payload: any = { task: {}, isStarted: false }
    let generator = createPlanning(payload)
    generator.next()
    expect(call).toBeCalled()
    generator.next()
    expect(put).not.toBeCalled()
    expect(generator.next().done).toBe(true)

    generator = createPlanning({ ...payload, isStarted: true })
    generator.next()
    expect(call).toBeCalled()
    generator.next()
    generator.next()
    expect(put).toBeCalled()
    expect(generator.next().done).toBe(true)
  })

  xit('[Success] Should update spent time every seconds', () => {
    const callback = jest.fn()
    setResponse('planning', 'SetSpent', callback)
    let timeNow = 1550135924000
    time.nowExact.mockReturnValue(timeNow)
    const generator = timeTickInActivePlanningLoop(2)
    generator.next()
    let lastArgs = put.mock.calls[put.mock.calls.length - 1]
    expect(lastArgs).toMatchSnapshot()
    generator.next()
    expect(delay).toBeCalledWith(1000)

    timeNow += 1001
    time.nowExact.mockReturnValue(timeNow)
    generator.next()
    lastArgs = put.mock.calls[put.mock.calls.length - 1]
    expect(lastArgs).toMatchSnapshot()
    generator.next()
    expect(delay).toBeCalledWith(1000)

    put.mockImplementation(() => {
      throw { message: 'CANCELLED' }
    })
    cancelled.mockReturnValue(true)
    expect(generator.next().done).toBe(false)
    put.mockReset()
    generator.next(true)
    lastArgs = put.mock.calls[put.mock.calls.length - 1]
    expect(lastArgs).toMatchSnapshot()
  })
})
