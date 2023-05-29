import { getType } from 'typesafe-actions'

import * as actions from './actions'
import { PlanningsAction, IPlanningsState } from './types'
import { IPlanning } from '@services/types'
import { getFullSpentTime } from '@services/helpers'

const initialState: IPlanningsState = {
  openPlannings: [],
  closedPlannings: [],
  coldPlannings: [],
  highlightedPlanning: '',
  timeSummary: {
    sumTotalDay: 0,
    sumManualToday: 0,
    sumTotalMonth: 0,
    sumManualMonth: 0,
  },
}

export default (state: IPlanningsState = initialState, action: PlanningsAction) => {
  switch (action.type) {
    case getType(actions.getOpenPlannings.success):
      return { ...state, openPlannings: action.payload }
    case getType(actions.getOpenPlannings.failure):
      return { ...state, openPlannings: [] }
    case getType(actions.getColdPlannings.success):
      return { ...state, coldPlannings: action.payload }
    case getType(actions.getColdPlannings.failure):
      return { ...state, coldPlannings: [] }
    case getType(actions.getClosedPlannings.success):
      return { ...state, closedPlannings: action.payload }
    case getType(actions.getClosedPlannings.failure):
      return { ...state, closedPlannings: [] }
    case getType(actions.getTimeSummary.success):
      return { ...state, timeSummary: action.payload }
    case getType(actions.startPlanningSync):
    case getType(actions.startPlanning.success):
      return {
        ...state,
        openPlannings: state.openPlannings.map(p => (p.ID === action.payload ? { ...p, Active: true } : p)),
        coldPlannings: state.coldPlannings.map(p => (p.ID === action.payload ? { ...p, Active: true } : p)),
      }
    case getType(actions.startPlanning.failure):
      return {
        ...state,
        openPlannings: state.openPlannings.map(p => (p.Active ? { ...p, Active: false } : p)),
        coldPlannings: state.coldPlannings.map(p => (p.Active ? { ...p, Active: false } : p)),
        startPlanningError: action.payload,
      }

    case getType(actions.stopPlanning.success):
      return {
        ...state,
        openPlannings: state.openPlannings.map(p => (p.Active ? { ...p, Active: false } : p)),
        coldPlannings: state.coldPlannings.map(p => (p.Active ? { ...p, Active: false } : p)),
      }

    case getType(actions.stopPlanning.failure):
      return {
        ...state,
        openPlannings: state.openPlannings.map(p => (p.Active ? { ...p, Active: false } : p)),
        coldPlannings: state.coldPlannings.map(p => (p.Active ? { ...p, Active: false } : p)),
        stopPlanningError: action.payload,
      }

    case getType(actions.timeTickInActivePlanning):
      const { PlanningID, field, additionalTime } = action.payload
      return {
        ...state,
        openPlannings: state.openPlannings.map(p => {
          if (p.ID === PlanningID) {
            p = { ...p }
            p[field] += additionalTime
          }
          return p
        }),
        coldPlannings: state.coldPlannings.map(p => {
          if (p.ID === PlanningID) {
            p = { ...p }
            p[field] += additionalTime
          }
          return p
        }),
        timeSummary: {
          ...state.timeSummary,
          sumTotalDay: state.timeSummary.sumTotalDay + additionalTime,
          sumTotalMonth: state.timeSummary.sumTotalMonth + additionalTime,
        },
      }

    case getType(actions.setSpentTime):
      return {
        ...state,
        openPlannings: state.openPlannings.map(p => {
          if (p.ID === action.payload.PlanningID) {
            p = { ...p }
            p.SpentOnline = action.payload.SpentTime
            p.SpentOffline = 0
            p.SpentManual = 0
          }
          return p
        }),
        coldPlannings: state.coldPlannings.map(p => {
          if (p.ID === action.payload.PlanningID) {
            p = { ...p }
            p.SpentOnline = action.payload.SpentTime
            p.SpentOffline = 0
            p.SpentManual = 0
          }
          return p
        }),
      }

    case getType(actions.coldPlanningRemap):
      const { From, To } = action.payload

      return {
        ...state,
        coldPlannings: state.coldPlannings
          .map(p => {
            const startOfDayRemapping = new Date(From * 1000).setHours(0, 0, 0, 0)
            const startOfDayCurrent = new Date(p.CreatedAt * 1000).setHours(0, 0, 0, 0)
            if (startOfDayCurrent === startOfDayRemapping) {
              p = { ...p, SpentOnline: p.SpentOnline - (To - From) }
            }
            return p
          })
          .filter(p => {
            return getFullSpentTime(p) > 0 || p.Status === 'OPEN'
          }),
      }

    case getType(actions.closePlanning.success):
      const Planning = action.payload
      return {
        ...state,
        openPlannings: state.openPlannings.filter(planning => planning.ID !== Planning.ID),
        closedPlannings: [...state.closedPlannings, state.openPlannings.find(planning => planning.ID === Planning.ID)],
      }
    case getType(actions.setExtra):
      const planningIDSetExtra = action.payload.PlanningID
      const planningForEdit = state.openPlannings.find(planning => planning.ID === planningIDSetExtra)
      const modifiedPlanning = {
        ...planningForEdit,
        Estimation: action.payload.Estimation,
        LastReason: action.payload.Reason,
      }
      return {
        ...state,
        openPlannings: [
          ...state.openPlannings.filter(planning => planning.ID !== planningIDSetExtra),
          modifiedPlanning,
        ],
      }
    case getType(actions.addHighlightedPlanning):
      return {
        ...state,
        highlightedPlanning: action.payload,
      }
    case getType(actions.removeHighlightedPlanning):
      return {
        ...state,
        highlightedPlanning: '',
      }
    case getType(actions.closeColdPlanning):
      const planningsToClose: IPlanning = state.coldPlannings.find(p => p.ID === action.payload)
      planningsToClose.Status = 'CLOSED'
      return {
        ...state,
        coldPlannings: [...state.coldPlannings, planningsToClose],
      }
    case getType(actions.clearPlannings):
      return { ...initialState }
    default:
      return state
  }
}
