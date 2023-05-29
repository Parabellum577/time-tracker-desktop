import { ActionType, getType } from 'typesafe-actions'

import * as actions from './actions'
import { IPlanningsState } from './types'
import plannings from './reducer'

import { SIMPLE_PLANNING } from '@test-helpers/sample'

describe('[Store] Plannings Reducer', () => {
  it('[Success] [Snapshot] Should handle GetOpenPlannings', () => {
    const action: ActionType<typeof actions> = {
      type: getType(actions.getOpenPlannings.success),
      payload: [{ ...SIMPLE_PLANNING }],
    }

    const currentState: IPlanningsState = {
      openPlannings: [],
      coldPlannings: [],
      closedPlannings: [],
      highlightedPlanning: '',
      timeSummary: {
        sumTotalDay: 0,
        sumManualToday: 0,
        sumTotalMonth: 0,
        sumManualMonth: 0,
      },
    }

    expect(plannings(currentState, action)).toMatchSnapshot()
  })

  it('[Failure] Should handle GetOpenPlannings', () => {
    const action: ActionType<typeof actions> = {
      type: getType(actions.getOpenPlannings.failure),
      payload: {
        code: 666,
        message: 'SOME_ERROR',
      },
    }

    const currentState: IPlanningsState = {
      openPlannings: [{ ...SIMPLE_PLANNING }],
      coldPlannings: [],
      closedPlannings: [],
      highlightedPlanning: '',
      timeSummary: {
        sumTotalDay: 0,
        sumManualToday: 0,
        sumTotalMonth: 0,
        sumManualMonth: 0,
      },
    }

    expect(plannings(currentState, action)).toMatchSnapshot()
  })

  it('[Success] Should handle GetClosedPlannings', () => {
    const action: ActionType<typeof actions> = {
      type: getType(actions.getClosedPlannings.success),
      payload: [{ ...SIMPLE_PLANNING }],
    }

    const currentState: IPlanningsState = {
      openPlannings: [],
      coldPlannings: [],
      closedPlannings: [],
      highlightedPlanning: '',
      timeSummary: {
        sumTotalDay: 0,
        sumManualToday: 0,
        sumTotalMonth: 0,
        sumManualMonth: 0,
      },
    }

    expect(plannings(currentState, action)).toMatchSnapshot()
  })

  it('[Failure] Should handle GetClosedPlannings', () => {
    const action: ActionType<typeof actions> = {
      type: getType(actions.getClosedPlannings.failure),
      payload: {
        code: 666,
        message: 'SOME_ERROR',
      },
    }

    const currentState: IPlanningsState = {
      openPlannings: [],
      coldPlannings: [],
      closedPlannings: [{ ...SIMPLE_PLANNING }],
      highlightedPlanning: '',
      timeSummary: {
        sumTotalDay: 0,
        sumManualToday: 0,
        sumTotalMonth: 0,
        sumManualMonth: 0,
      },
    }

    expect(plannings(currentState, action)).toMatchSnapshot()
  })

  it('[Success] Should handle StartPlanning', () => {
    const action: ActionType<typeof actions> = {
      type: getType(actions.startPlanning.success),
      payload: 33,
    }

    const currentState: IPlanningsState = {
      openPlannings: [
        {
          ...SIMPLE_PLANNING,
          Active: false,
          ID: 33,
        },
        {
          ...SIMPLE_PLANNING,
          Active: false,
          ID: 44,
        },
      ],
      coldPlannings: [],
      closedPlannings: [],
      highlightedPlanning: '',
      timeSummary: {
        sumTotalDay: 0,
        sumManualToday: 0,
        sumTotalMonth: 0,
        sumManualMonth: 0,
      },
    }

    expect(plannings(currentState, action)).toMatchSnapshot()
  })

  it('[Failure] Should handle StartPlanning', () => {
    const action: ActionType<typeof actions> = {
      type: getType(actions.startPlanning.failure),
      payload: {
        code: 666,
        message: 'SOME_ERROR',
      },
    }

    const currentState: IPlanningsState = {
      openPlannings: [
        {
          ...SIMPLE_PLANNING,
          Active: true,
          ID: 33,
        },
        {
          ...SIMPLE_PLANNING,
          Active: false,
          ID: 44,
        },
      ],
      coldPlannings: [],
      closedPlannings: [],
      highlightedPlanning: '',
      timeSummary: {
        sumTotalDay: 0,
        sumManualToday: 0,
        sumTotalMonth: 0,
        sumManualMonth: 0,
      },
    }

    expect(plannings(currentState, action)).toMatchSnapshot()
  })

  it('[Success] Should handle StopPlanning', () => {
    const action: any = {
      type: getType(actions.stopPlanning.success),
    }

    const currentState: IPlanningsState = {
      openPlannings: [
        {
          ...SIMPLE_PLANNING,
          Active: true,
          ID: 33,
        },
        {
          ...SIMPLE_PLANNING,
          Active: false,
          ID: 44,
        },
      ],
      coldPlannings: [],
      closedPlannings: [],
      highlightedPlanning: '',
      timeSummary: {
        sumTotalDay: 0,
        sumManualToday: 0,
        sumTotalMonth: 0,
        sumManualMonth: 0,
      },
    }

    expect(plannings(currentState, action)).toMatchSnapshot()
  })

  it('[Failure] Should handle StopPlanning', () => {
    const action: ActionType<typeof actions> = {
      type: getType(actions.stopPlanning.failure),
      payload: {
        code: 666,
        message: 'SOME_ERROR',
      },
    }

    const currentState: IPlanningsState = {
      openPlannings: [
        {
          ...SIMPLE_PLANNING,
          Active: true,
          ID: 33,
        },
        {
          ...SIMPLE_PLANNING,
          Active: false,
          ID: 44,
        },
      ],
      coldPlannings: [],
      closedPlannings: [],
      highlightedPlanning: '',
      timeSummary: {
        sumTotalDay: 0,
        sumManualToday: 0,
        sumTotalMonth: 0,
        sumManualMonth: 0,
      },
    }

    expect(plannings(currentState, action)).toMatchSnapshot()
  })

  it('[SyncSuccess] Should handle TimeTickInActivePlanning', () => {
    const action: ActionType<typeof actions> = {
      type: getType(actions.timeTickInActivePlanning),
      payload: {
        PlanningID: 33,
        field: 'SpentOnline',
        additionalTime: 1.001,
      },
    }

    const currentState: IPlanningsState = {
      openPlannings: [
        {
          ...SIMPLE_PLANNING,
          Active: true,
          ID: 33,
          SpentOnline: 200,
        },
        {
          ...SIMPLE_PLANNING,
          Active: false,
          ID: 44,
        },
      ],
      coldPlannings: [],
      closedPlannings: [],
      highlightedPlanning: '',
      timeSummary: {
        sumTotalDay: 0,
        sumManualToday: 0,
        sumTotalMonth: 0,
        sumManualMonth: 0,
      },
    }

    expect(plannings(currentState, action)).toMatchSnapshot()
  })
})
