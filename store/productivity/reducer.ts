import { getType, ActionType } from 'typesafe-actions'

import * as actions from './actions'
import { IProductivities } from './types'

const initialState: IProductivities = {
  chartData: [],
  focuses: [],
  averageData: {
    Focus: 0,
    Points: 0,
    UsefullActivityPercent: 0,
    AverageWork: 0,
    AverageCommunication: 0,
    AverageLearning: 0,
    AverageEntertainment: 0,
    AverageOther: 0,
  },
}

export default (state: IProductivities = initialState, action: ActionType<typeof actions>): IProductivities => {
  switch (action.type) {
    case getType(actions.getProductivities.success):
      return { ...state, chartData: action.payload }
    case getType(actions.getFocuses.success):
      return { ...state, focuses: action.payload }
    case getType(actions.setAverageData):
      return { ...state, averageData: action.payload }
    case getType(actions.clearProductivities):
      return { ...initialState }
    default:
      return state
  }
}
